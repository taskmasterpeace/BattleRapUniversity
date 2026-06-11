import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getUser } from '@/lib/db/server';

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
        region,
        created_at,
        hometown:hometown_city_id (id, name, state),
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
    //    in-game records for everyone)
    const [{ data: ranking }, { data: accolades }] = await Promise.all([
      supabase.from('rankings').select('*').eq('battler_id', battlerId).single(),
      supabase
        .from('battler_accolades')
        .select('rank, title, scope, region, year, source')
        .eq('battler_id', battlerId)
        .order('scope', { ascending: false }) // real_world first
        .order('year', { ascending: false }),
    ]);

    return NextResponse.json({
      battler: {
        id: battler.id,
        stageName: battler.stage_name,
        isPlayer: !battler.is_ai,
        isOwn: !!viewer && battler.user_id === viewer.id,
        isReal: !!battler.is_real,
        bio: battler.bio ?? null,
        avatarUrl: battler.avatar_url ?? null,
        region: battler.region ?? null,
        hometown: battler.hometown ?? null,
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
      winner_battler_id,
      battler_player_id,
      battler_ai_id,
      status,
      player_battler:battler_player_id(id, stage_name),
      ai_battler:battler_ai_id(id, stage_name),
      battle_rounds (
        round_index,
        battler_id,
        won,
        average_score,
        peak_score,
        consistency_score,
        crowd_reaction
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

    return {
      battleId: battle.id,
      date: battle.scheduled_at,
      opponentId,
      opponentName,
      result: won ? 'W' : 'L',
      score: `${myRoundsWon}-${oppRoundsWon}`,
      myCrowdAvg: Math.round(myAvgCrowd),
      oppCrowdAvg: Math.round(oppAvgCrowd),
      rounds: myRounds.map((r: any) => ({
        roundIndex: r.round_index,
        won: r.won,
        avgScore: r.average_score,
        peakScore: r.peak_score,
        crowdReaction: r.crowd_reaction,
      })),
    };
  });
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

  const totalRounds = battleHistory.reduce((sum, b) => b.rounds.length, 0);
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
    roundWinRate: Math.round((roundsWon / totalRounds) * 100),
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
        myWins: isA ? rec.battler_a_wins : rec.battler_b_wins,
        myLosses: isA ? rec.battler_a_losses : rec.battler_b_losses,
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
