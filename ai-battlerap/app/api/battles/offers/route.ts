import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';

/**
 * Battle Offers API
 *
 * ENHANCED WITH GRUDGE SYSTEM:
 * - Checks for active rivalries with each opponent
 * - Includes grudge context (intensity, rematch demand, H2H record)
 * - Prioritizes grudge matches in sort order
 */

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();

  // Get player's battler
  const { data: battler } = await supabase
    .from('battlers')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();

  if (!battler) {
    return NextResponse.json({ error: 'No battler found' }, { status: 404 });
  }

  // Sweep expired offers FIRST: an offer whose prep deadline already passed can
  // never be accepted, and letting it linger both confuses the player and
  // blocks replenishment (the stale rows count against the offer pool).
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    await admin
      .from('battles')
      .update({ status: 'cancelled' })
      .eq('status', 'offered')
      .or(`battler_player_id.eq.${battler.id},battler_ai_id.eq.${battler.id}`)
      .lt('lock_prep_at', new Date().toISOString());
  } catch (sweepError) {
    console.error('Expired-offer sweep failed (non-fatal):', sweepError);
  }

  // Get all offered battles with opponent details
  const { data: offersRaw } = await supabase
    .from('battles')
    .select(`
      *,
      league:leagues(*),
      ai_battler:battler_ai_id(
        id,
        stage_name,
        tier,
        style_tags,
        avatar_url,
        battler_attributes!inner(writing, performance, resilience)
      )
    `)
    .eq('battler_player_id', battler.id)
    .eq('is_pvp', false) // outgoing PvP challenges are NOT acceptable by the challenger
    .eq('status', 'offered')
    .order('scheduled_at', { ascending: true });

  // Hide offers against internal Test_ profiles (validation battlers from balance
  // testing) — they should never reach a player's screen.
  let offers = (offersRaw || []).filter(
    (o) => !o.ai_battler?.stage_name?.startsWith('Test_')
  );

  // PvP: incoming player challenges — this battler is the CHALLENGED side
  // (battler_ai_id). Normalize the challenger into the ai_battler slot so the
  // offers UI renders them like any other opponent.
  const { data: pvpRaw } = await supabase
    .from('battles')
    .select(`
      *,
      league:leagues(*),
      challenger:battler_player_id(
        id,
        stage_name,
        tier,
        style_tags,
        avatar_url,
        battler_attributes!inner(writing, performance, resilience)
      )
    `)
    .eq('battler_ai_id', battler.id)
    .eq('is_pvp', true)
    .eq('status', 'offered')
    .order('scheduled_at', { ascending: true });

  const pvpOffers = (pvpRaw || []).map((row) => {
    const { challenger, ...rest } = row;
    return { ...rest, ai_battler: challenger };
  });

  if (offers.length === 0) {
    // Replenish: a player with no pending offers and no upcoming battle should
    // always find fresh smoke. Promoters never sleep.
    const { count: upcomingCount } = await supabase
      .from('battles')
      .select('id', { count: 'exact', head: true })
      .eq('battler_player_id', battler.id)
      .in('status', ['accepted', 'locked']);

    if (!upcomingCount) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const { generateOffersForPlayer } = await import('@/lib/services/battleOffers');
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const created = await generateOffersForPlayer(admin, battler.id, 2);
        if (created > 0) {
          const { data: refreshed } = await supabase
            .from('battles')
            .select(`
              *,
              league:leagues(*),
              ai_battler:battler_ai_id(
                id,
                stage_name,
                tier,
                style_tags,
                avatar_url,
                battler_attributes!inner(writing, performance, resilience)
              )
            `)
            .eq('battler_player_id', battler.id)
            .eq('is_pvp', false)
            .eq('status', 'offered')
            .order('scheduled_at', { ascending: true });
          offers = (refreshed || []).filter(
            (o) => !o.ai_battler?.stage_name?.startsWith('Test_')
          );
        }
      } catch (replenishError) {
        console.error('Offer replenish failed (non-fatal):', replenishError);
      }
    }
  }

  // Merge: player challenges surface on top of AI offers
  offers = [...pvpOffers, ...offers];

  if (offers.length === 0) {
    return NextResponse.json({ offers: [] });
  }

  // GRUDGE SYSTEM: Batch fetch all rivalries, H2H records, and rankings for performance
  const opponentIds = offers.map(o => o.ai_battler.id);

  // Batch fetch opponent rankings
  const { data: opponentRankings } = await supabase
    .from('rankings')
    .select('battler_id, rating, wins, losses')
    .in('battler_id', opponentIds);

  // Batch fetch all relationships
  const { data: relationships } = await supabase
    .from('battler_relationships')
    .select('*')
    .or(`and(battler_a_id.eq.${battler.id},battler_b_id.in.(${opponentIds.join(',')})),and(battler_b_id.eq.${battler.id},battler_a_id.in.(${opponentIds.join(',')}))`);

  // Batch fetch all H2H records
  const { data: h2hRecords } = await supabase
    .from('head_to_head_records')
    .select('*')
    .or(`and(battler_a_id.eq.${battler.id},battler_b_id.in.(${opponentIds.join(',')})),and(battler_b_id.eq.${battler.id},battler_a_id.in.(${opponentIds.join(',')}))`);

  // Create lookup maps for O(1) access
  const relationshipMap = new Map(
    (relationships || []).map(rel => {
      const opponentId = rel.battler_a_id === battler.id ? rel.battler_b_id : rel.battler_a_id;
      return [opponentId, rel];
    })
  );

  const h2hMap = new Map(
    (h2hRecords || []).map(rec => {
      const opponentId = rec.battler_a_id === battler.id ? rec.battler_b_id : rec.battler_a_id;
      const isA = rec.battler_a_id === battler.id;
      return [opponentId, {
        totalBattles: rec.total_battles,
        myWins: isA ? rec.battler_a_wins : rec.battler_b_wins,
        myLosses: isA ? rec.battler_a_losses : rec.battler_b_losses,
        lastBattleDate: rec.last_battle_date,
      }];
    })
  );

  const rankingMap = new Map(
    (opponentRankings || []).map(rank => [rank.battler_id, {
      rating: rank.rating,
      wins: rank.wins,
      losses: rank.losses,
    }])
  );

  // Get player's rating for difficulty calculation
  const { data: playerRanking } = await supabase
    .from('rankings')
    .select('rating')
    .eq('battler_id', battler.id)
    .single();

  const playerRating = playerRanking?.rating || 1200;

  // Enrich offers using the pre-fetched data
  const enrichedOffers = offers.map((offer) => {
    const relationship = relationshipMap.get(offer.ai_battler.id);
    const h2hRecord = h2hMap.get(offer.ai_battler.id) || null;
    const ranking = rankingMap.get(offer.ai_battler.id) || { rating: 1200, wins: 0, losses: 0 };

    // Calculate difficulty based on rating difference
    const ratingDiff = ranking.rating - playerRating;
    let difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
    if (ratingDiff < -100) difficulty = 'easy';
    else if (ratingDiff < 50) difficulty = 'medium';
    else if (ratingDiff < 150) difficulty = 'hard';
    else difficulty = 'extreme';

    return {
      ...offer,
      grudge: relationship && relationship.status === 'active' ? {
        intensity: relationship.intensity,
        rematchDemand: relationship.rematch_demand,
        status: relationship.status,
        originStory: relationship.origin_story,
        relationshipId: relationship.id,
      } : null,
      h2hRecord,
      opponentRanking: ranking,
      difficulty,
    };
  });

  // Sort: player challenges first, then grudge matches, then by date
  const sortedOffers = enrichedOffers.sort((a, b) => {
    // PvP player challenges always lead the card stack
    if (a.is_pvp && !b.is_pvp) return -1;
    if (!a.is_pvp && b.is_pvp) return 1;

    // Grudge matches first
    if (a.grudge && !b.grudge) return -1;
    if (!a.grudge && b.grudge) return 1;

    // Within grudge matches, sort by intensity (hottest first)
    if (a.grudge && b.grudge) {
      return b.grudge.intensity - a.grudge.intensity;
    }

    // Non-grudge matches sorted by scheduled_at
    return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
  });

  return NextResponse.json({ offers: sortedOffers });
}
