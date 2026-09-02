import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { deriveReputation, type RepBattle } from '@/lib/game/reputation';

/**
 * Battler Career API Endpoint
 *
 * GET /api/battler/[id]/career
 *
 * Returns comprehensive career data:
 * - Battle history (all battles with results)
 * - Career statistics (W-L record, avg crowd, choke rate, etc.)
 * - Active rivalries (with H2H records and grudge context)
 * - Media mentions (articles featuring this battler)
 *
 * Used by: Battler Career Page (/battler/[id])
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: battlerId } = await params;

  try {
    const supabase = await createServerSupabaseClient();
    const viewer = await getUser();

    // 1. Load battler data
    // NOTE: column is `is_ai` in schema (not is_player_battler) — selecting a
    // non-existent column causes the query to fail and bubble up as 404 here.
    const { data: battler, error: battlerError } = await supabase
      .from('battlers')
      .select(`
        id,
        stage_name,
        is_ai,
        user_id,
        is_real,
        bio,
        avatar_url,
        sprite_set,
        style_tags,
        current_balance,
        region,
        created_at,
        hometown:hometown_city_id (id, name, state, background_url, skyline_url),
        battler_attributes (
          writing,
          performance,
          personal,
          resilience
        )
      `)
      .eq('id', battlerId)
      .single();

    if (battlerError || !battler) {
      return NextResponse.json(
        { error: 'Battler not found' },
        { status: 404 }
      );
    }

    // 2. Load battle history
    const battleHistory = await getBattleHistory(supabase, battlerId);

    // 3. Calculate career statistics
    const careerStats = calculateCareerStats(battleHistory);

    // 4. Load active rivalries
    const rivalries = await getActiveRivalries(supabase, battlerId);

    // 5. Load media mentions
    const mediaMentions = await getMediaMentions(supabase, battlerId);

    // 6. Load current ranking + accolades (real-world honors for verified battlers,
    //    in-game records for everyone) + the league they last fought in
    const [{ data: ranking }, { data: accolades }, { data: lastBattle }] = await Promise.all([
      supabase.from('rankings').select('*').eq('battler_id', battlerId).single(),
      supabase
        .from('battler_accolades')
        .select('rank, title, scope, region, year, source')
        .eq('battler_id', battlerId)
        .order('scope', { ascending: false }) // real_world first
        .order('year', { ascending: false }),
      supabase
        .from('battles')
        .select('league:league_id(name, logo_url)')
        .or(`battler_player_id.eq.${battlerId},battler_ai_id.eq.${battlerId}`)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    // 7. Public life: Wire handle + how the press leans on this battler +
    //    stories the blogs are currently SITTING on about them.
    const [{ data: wireAccount }, { data: pressRows }, { data: devRows }] = await Promise.all([
      supabase
        .from('social_accounts')
        .select('handle, display_name, influence, credibility')
        .eq('battler_id', battlerId)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('blogger_memory')
        .select(
          'blogger_name, total_articles, sentiment_positive, sentiment_negative, recent_narrative, last_covered_at'
        )
        .eq('entity_type', 'battler')
        .eq('entity_id', battlerId)
        .order('total_articles', { ascending: false })
        .limit(8),
      supabase
        .from('blogger_assignments')
        .select(
          'sit_reason, publish_after, account:social_accounts(display_name, handle), lead:story_leads!inner(subcategory, headline_hint, subject_battler_id)'
        )
        .eq('status', 'holding')
        .eq('lead.subject_battler_id', battlerId)
        .order('claimed_at', { ascending: false })
        .limit(5),
    ]);

    const developing = (devRows ?? []).map((d: any) => {
      const acc = Array.isArray(d.account) ? d.account[0] : d.account;
      const lead = Array.isArray(d.lead) ? d.lead[0] : d.lead;
      return {
        sitReason: d.sit_reason,
        publishAfter: d.publish_after,
        blogger: acc?.handle ?? acc?.display_name ?? 'A blogger',
        subcategory: lead?.subcategory ?? null,
        hint: lead?.headline_hint ?? '',
      };
    });

    // 8. REPUTATION — "respect made concrete": labels that stick, a recognition
    //    map, and signature wins. Needs opponent ratings (name weight) + the
    //    battler's life-event history (chokes, crises, callouts, robberies).
    const opponentIds = Array.from(
      new Set(battleHistory.map((b: any) => b.opponentId).filter(Boolean))
    );
    const [{ data: oppRankings }, { data: lifeRows }, { data: labelRows }] = await Promise.all([
      opponentIds.length
        ? supabase.from('rankings').select('battler_id, rating').in('battler_id', opponentIds)
        : Promise.resolve({ data: [] as any[] }),
      supabase.from('battler_life_events').select('template_code').eq('battler_id', battlerId),
      // Stored "on your record" labels. If the table isn't migrated yet, Supabase
      // returns {data:null,error} — we fall back to [] and just show live labels.
      supabase
        .from('battler_labels')
        .select('key, tier, tone, heat, processed_battle_count, evidence_count, qualifying_evidence_count, status, pinned_at, last_reinforced_at, source')
        .eq('battler_id', battlerId)
        .eq('status', 'active'),
    ]);

    const storedLabels = (labelRows ?? []).map((r: any) => ({
      key: r.key,
      tier: r.tier,
      tone: r.tone,
      heat: r.heat,
      processedBattleCount: r.processed_battle_count ?? 0,
      evidenceCount: r.evidence_count ?? 0,
      qualifyingEvidenceCount: r.qualifying_evidence_count ?? 0,
      status: r.status,
      pinnedAt: r.pinned_at ?? undefined,
      lastReinforcedAt: r.last_reinforced_at ?? undefined,
      source: r.source ?? undefined,
    }));
    const oppRatingMap = new Map<string, { rating: number; tier: string | null }>(
      (oppRankings ?? []).map((r: any) => [r.battler_id, { rating: r.rating, tier: r.tier ?? null }])
    );

    const repBattles: RepBattle[] = battleHistory.map((b: any) => {
      const opp = oppRatingMap.get(b.opponentId);
      return {
        opponentId: b.opponentId,
        opponentName: b.opponentName,
        result: b.result,
        score: b.score,
        chokedRounds: b.chokedRounds ?? 0,
        bestPeak: b.bestPeak ?? 0,
        cityId: b.cityId ?? null,
        city: b.city ?? null,
        state: b.state ?? null,
        opponentRating: opp?.rating,
        opponentTier: opp?.tier,
        date: b.date,
      };
    });

    const hometownCity = battler.hometown as any;
    const reputation = deriveReputation({
      rating: ranking?.rating || 1200,
      tier: ranking?.tier || null,
      wins: careerStats.wins,
      losses: careerStats.losses,
      streak: ranking?.streak ?? 0,
      battles: repBattles,
      storedLabels,
      lifeEventCodes: (lifeRows ?? []).map((r: any) => r.template_code).filter(Boolean),
      press: (pressRows ?? []).map((p: any) => ({ pos: p.sentiment_positive ?? 0, neg: p.sentiment_negative ?? 0 })),
      avgCrowd: careerStats.avgCrowdReaction,
      homeCityId: (Array.isArray(hometownCity) ? hometownCity[0] : hometownCity)?.id ?? null,
      homeCity: (Array.isArray(hometownCity) ? hometownCity[0] : hometownCity)?.name ?? battler.region ?? null,
      homeState: (Array.isArray(hometownCity) ? hometownCity[0] : hometownCity)?.state ?? null,
      styleTags: Array.isArray(battler.style_tags) ? battler.style_tags : [],
    });

    return NextResponse.json({
      battler: {
        id: battler.id,
        stageName: battler.stage_name,
        isPlayer: !battler.is_ai,
        isOwn: !!viewer && battler.user_id === viewer.id,
        isReal: !!battler.is_real,
        bio: battler.bio ?? null,
        avatarUrl: battler.avatar_url ?? null,
        // Flyer System: portrait variants + city backdrop for the dossier masthead
        portraits: Array.isArray(battler.sprite_set) && battler.sprite_set.length > 0
          ? battler.sprite_set
          : [battler.avatar_url].filter(Boolean),
        region: battler.region ?? null,
        hometown: battler.hometown ?? null,
        styleTags: Array.isArray(battler.style_tags) ? battler.style_tags : [],
        balance: typeof battler.current_balance === 'number' ? battler.current_balance : null,
        lastLeague: (lastBattle as any)?.league ?? null,
        accolades: accolades ?? [],
        joinedAt: battler.created_at,
        attributes: battler.battler_attributes,
        rating: ranking?.rating || 1200,
        rank: ranking?.rank || null,
        tier: ranking?.tier || null,
      },
      careerStats,
      battleHistory,
      rivalries,
      mediaMentions,
      wire: wireAccount ?? null,
      press: pressRows ?? [],
      developing,
      reputation,
    });

  } catch (error: any) {
    console.error('Error fetching battler career:', error);
    return NextResponse.json(
      { error: 'Failed to fetch battler career data' },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get complete battle history for a battler
 */
async function getBattleHistory(supabase: any, battlerId: string) {
  const { data: battles } = await supabase
    .from('battles')
    .select(`
      id,
      scheduled_at,
      completed_at,
      winner_battler_id,
      battler_player_id,
      battler_ai_id,
      status,
      player_battler:battler_player_id(id, stage_name),
      ai_battler:battler_ai_id(id, stage_name),
      venue:venue_id ( city:city_id ( id, name, state ) ),
      league:league_id ( city:city_id ( id, name, state ) ),
      battle_rounds (
        round_index,
        battler_id,
        won,
        average_score,
        peak_score,
        consistency_score,
        crowd_reaction,
        choked
      )
    `)
    .or(`battler_player_id.eq.${battlerId},battler_ai_id.eq.${battlerId}`)
    .eq('status', 'completed')
    .order('scheduled_at', { ascending: false });

  if (!battles) return [];

  return battles.map((battle: any) => {
    const isPlayer = battle.battler_player_id === battlerId;
    const opponentId = isPlayer ? battle.battler_ai_id : battle.battler_player_id;
    const opponentName = isPlayer ? battle.ai_battler.stage_name : battle.player_battler.stage_name;

    const myRounds = battle.battle_rounds.filter((r: any) => r.battler_id === battlerId);
    const oppRounds = battle.battle_rounds.filter((r: any) => r.battler_id === opponentId);

    const myRoundsWon = myRounds.filter((r: any) => r.won).length;
    const oppRoundsWon = oppRounds.filter((r: any) => r.won).length;

    const myAvgCrowd = myRounds.reduce((sum: number, r: any) => sum + r.crowd_reaction, 0) / myRounds.length;
    const oppAvgCrowd = oppRounds.reduce((sum: number, r: any) => sum + r.crowd_reaction, 0) / oppRounds.length;

    const won = battle.winner_battler_id === battlerId;

    // Where it went down: the booked venue's city, else the league's home city.
    const venueCity = (Array.isArray(battle.venue) ? battle.venue[0] : battle.venue)?.city;
    const leagueCity = (Array.isArray(battle.league) ? battle.league[0] : battle.league)?.city;
    const city = (Array.isArray(venueCity) ? venueCity[0] : venueCity)
      ?? (Array.isArray(leagueCity) ? leagueCity[0] : leagueCity)
      ?? null;

    const chokedRounds = myRounds.filter((r: any) => r.choked).length;
    const bestPeak = myRounds.reduce((m: number, r: any) => Math.max(m, r.peak_score ?? 0), 0);

    return {
      battleId: battle.id,
      // When it was FOUGHT, not when it was booked. Battles can sit scheduled for
      // in-game months before they're simulated, so scheduled_at read "3 months ago"
      // for a battle fought minutes ago — and clashed with the rivalry it created.
      date: battle.completed_at ?? battle.scheduled_at,
      opponentId,
      opponentName,
      result: won ? 'W' : 'L',
      score: `${myRoundsWon}-${oppRoundsWon}`,
      myCrowdAvg: Math.round(myAvgCrowd),
      oppCrowdAvg: Math.round(oppAvgCrowd),
      // Reputation inputs (recognition map + labels)
      cityId: city?.id ?? null,
      city: city?.name ?? null,
      state: city?.state ?? null,
      chokedRounds,
      bestPeak,
      rounds: myRounds.map((r: any) => ({
        roundIndex: r.round_index,
        won: r.won,
        avgScore: r.average_score,
        peakScore: r.peak_score,
        crowdReaction: r.crowd_reaction,
      })),
    };
  })
  // Order by when fought (completed_at) rather than when booked, so the most
  // recently CONTESTED battle leads the list.
  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Calculate career statistics from battle history
 */
function calculateCareerStats(battleHistory: any[]) {
  if (battleHistory.length === 0) {
    return {
      totalBattles: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgCrowdReaction: 0,
      totalRounds: 0,
      roundsWon: 0,
      roundWinRate: 0,
      bodybags: 0, // 3-0 wins
      perfectRecords: 0, // 3-0 no losses
      upsets: 0,
      chokes: 0,
      haymakers: 0,
    };
  }

  const wins = battleHistory.filter(b => b.result === 'W').length;
  const losses = battleHistory.filter(b => b.result === 'L').length;
  const totalBattles = battleHistory.length;

  const avgCrowd = battleHistory.reduce((sum, b) => sum + b.myCrowdAvg, 0) / totalBattles;

  const totalRounds = battleHistory.reduce((sum, b) => sum + b.rounds.length, 0);
  const roundsWon = battleHistory.reduce((sum, b) => {
    return sum + b.rounds.filter((r: any) => r.won).length;
  }, 0);

  const bodybags = battleHistory.filter(b => b.score === '3-0').length;

  return {
    totalBattles,
    wins,
    losses,
    winRate: Math.round((wins / totalBattles) * 100),
    avgCrowdReaction: Math.round(avgCrowd),
    totalRounds,
    roundsWon,
    roundWinRate: totalRounds > 0 ? Math.round((roundsWon / totalRounds) * 100) : 0,
    bodybags,
    perfectRecords: bodybags,
    upsets: 0, // TODO: Calculate from battle metadata
    chokes: 0, // TODO: Calculate from segment event flags
    haymakers: 0, // TODO: Calculate from segment event flags
  };
}

/**
 * Get active rivalries for a battler
 */
async function getActiveRivalries(supabase: any, battlerId: string) {
  const { data: relationships } = await supabase
    .from('battler_relationships')
    .select(`
      id,
      battler_a_id,
      battler_b_id,
      intensity,
      rematch_demand,
      status,
      origin_type,
      origin_story,
      origin_battle_id,
      created_at
    `)
    .or(`battler_a_id.eq.${battlerId},battler_b_id.eq.${battlerId}`)
    .in('status', ['active', 'dormant'])
    .order('intensity', { ascending: false });

  if (!relationships || relationships.length === 0) {
    return [];
  }

  // Batch fetch opponent data and H2H stats for performance
  const opponentIds = relationships.map((rel: any) =>
    rel.battler_a_id === battlerId ? rel.battler_b_id : rel.battler_a_id
  );

  // Batch fetch all opponents
  const { data: opponents } = await supabase
    .from('battlers')
    .select('id, stage_name')
    .in('id', opponentIds);

  // Batch fetch all H2H records
  const { data: h2hRecords } = await supabase
    .from('head_to_head_records')
    .select('*')
    .or(`and(battler_a_id.eq.${battlerId},battler_b_id.in.(${opponentIds.join(',')})),and(battler_b_id.eq.${battlerId},battler_a_id.in.(${opponentIds.join(',')}))`);

  // Create lookup maps
  const opponentMap = new Map((opponents || []).map((opp: any) => [opp.id, opp.stage_name]));

  type H2HData = {
    totalBattles: number;
    myWins: number;
    myLosses: number;
    lastBattleDate: string | null;
    lastBattleWinner: string | null;
  };

  const h2hMap = new Map<string, H2HData>(
    (h2hRecords || []).map((rec: any) => {
      const opponentId = rec.battler_a_id === battlerId ? rec.battler_b_id : rec.battler_a_id;
      const isA = rec.battler_a_id === battlerId;
      return [opponentId, {
        totalBattles: rec.total_battles,
        // No losses column on head_to_head_records — my losses are the opponent's
        // wins in a two-battler H2H.
        myWins: isA ? rec.battler_a_wins : rec.battler_b_wins,
        myLosses: isA ? rec.battler_b_wins : rec.battler_a_wins,
        lastBattleDate: rec.last_battle_date,
        lastBattleWinner: rec.last_winner_id,
      }];
    })
  );

  // Enrich relationships with pre-fetched data
  const enriched = relationships.map((rel: any) => {
    const opponentId = rel.battler_a_id === battlerId ? rel.battler_b_id : rel.battler_a_id;
    const h2hData = h2hMap.get(opponentId);

    return {
      relationshipId: rel.id,
      opponentId,
      opponentName: opponentMap.get(opponentId) || 'Unknown',
      intensity: rel.intensity,
      rematchDemand: rel.rematch_demand,
      status: rel.status,
      originType: rel.origin_type,
      originStory: rel.origin_story,
      createdAt: rel.created_at,
      headToHead: h2hData ? {
        totalBattles: h2hData.totalBattles,
        myRecord: `${h2hData.myWins}-${h2hData.myLosses}`,
        lastBattleDate: h2hData.lastBattleDate,
        lastBattleWinner: h2hData.lastBattleWinner,
      } : null,
    };
  });

  return enriched;
}

/**
 * Get media mentions for a battler
 */
async function getMediaMentions(supabase: any, battlerId: string) {
  const { data: articles } = await supabase
    .from('news_articles')
    .select(`
      id,
      slug,
      title,
      type,
      published_at,
      meta_json,
      primary_battler_id,
      secondary_battler_id
    `)
    .or(`primary_battler_id.eq.${battlerId},secondary_battler_id.eq.${battlerId}`)
    .order('published_at', { ascending: false })
    .limit(20);

  if (!articles) return [];

  return articles.map((article: any) => ({
    articleId: article.id,
    slug: article.slug,
    title: article.title,
    type: article.type,
    publishedAt: article.published_at,
    blogger: article.meta_json?.blogger || article.meta_json?.blogger_name || 'Unknown',
    isPrimaryFocus: article.primary_battler_id === battlerId,
    isGrudgeArticle: article.meta_json?.is_grudge_match || false,
  }));
}
