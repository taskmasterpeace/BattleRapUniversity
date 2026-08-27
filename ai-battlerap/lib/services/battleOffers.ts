/**
 * Battle Offer Generation Service
 * Reusable logic for creating battle offers for players
 */

import type { SupabaseClient } from '@supabase/supabase-js';

interface League {
  id: string;
  name: string;
  round_length_minutes: number;
  writing_weight: number;
  performance_weight: number;
  base_crowd_factor: number;
}

/**
 * Generate battle offers for a specific player battler
 * @param supabase - Supabase client (must have service role permissions)
 * @param playerBattlerId - The player's battler ID
 * @param count - Number of offers to generate (1-3)
 * @returns Number of offers successfully created
 */
export async function generateOffersForPlayer(
  supabase: SupabaseClient,
  playerBattlerId: string,
  count: number = 2
): Promise<number> {
  // Ensure count is between 1 and 3
  const offerCount = Math.max(1, Math.min(3, count));

  // Get player battler info
  const { data: battler } = await supabase
    .from('battlers')
    .select('id, primary_league_id, is_ai, current_city_id')
    .eq('id', playerBattlerId)
    .single();

  if (!battler || battler.is_ai) {
    console.error(`Battler ${playerBattlerId} not found or is AI`);
    return 0;
  }

  // Check if battler already has pending offers or accepted battles
  const { data: existingOffers } = await supabase
    .from('battles')
    .select('id')
    .eq('battler_player_id', battler.id)
    .in('status', ['offered', 'accepted'])
    .limit(1);

  if (existingOffers && existingOffers.length > 0) {
    console.log(`Battler ${playerBattlerId} already has pending offers/battles`);
    return 0;
  }

  // Get league info
  const { data: league } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', battler.primary_league_id)
    .single();

  if (!league) {
    console.error(`League ${battler.primary_league_id} not found`);
    return 0;
  }

  // Get player's rating and attributes
  const [playerRankingData, playerAttributesData] = await Promise.all([
    supabase
      .from('rankings')
      .select('rating')
      .eq('battler_id', battler.id)
      .single(),
    supabase
      .from('battler_attributes')
      .select('personal')
      .eq('battler_id', battler.id)
      .single()
  ]);

  const playerRating = playerRankingData?.data?.rating || 1200;
  const playerReputation = playerAttributesData?.data?.personal?.reputation || 5;

  // Reputation affects opponent matching
  // Formula: opponent_rating = player_rating + (player_reputation - 5) * 0.5
  // Higher reputation = tougher opponents
  const reputationAdjustment = (playerReputation - 5) * 50;
  const targetRating = playerRating + reputationAdjustment;

  // PHASE 3: Check for existing rivalries that should be prioritized
  const { data: relationships } = await supabase
    .from('battler_relationships')
    .select(`
      *,
      battler_a:battlers!battler_a_id(*),
      battler_b:battlers!battler_b_id(*)
    `)
    .or(`battler_a_id.eq.${battler.id},battler_b_id.eq.${battler.id}`)
    .gte('state_level', 3) // Rivals or higher (rivals, at_war, legendary_beef)
    .eq('status', 'active');

  // Extract rival battlers
  const rivals = (relationships || []).map(rel => {
    const isPlayerA = rel.battler_a_id === battler.id;
    return isPlayerA ? rel.battler_b : rel.battler_a;
  }).filter(b => b && b.is_ai && !b.stage_name?.startsWith('Test_')); // Only AI rivals, never test profiles

  // Find AI opponents with similar rating (centered around target rating)
  const ratingRange = 200;

  // LOCAL FLAVOR: fetch same-city opponents first — the local scene calls
  // you out before anyone else does. Same rating-range and Test_ filters.
  let localOpponents: any[] = [];
  if (battler.current_city_id) {
    const { data: sameCity } = await supabase
      .from('battlers')
      .select(`
        *,
        ranking:rankings(rating)
      `)
      .eq('is_ai', true)
      .eq('current_city_id', battler.current_city_id)
      .neq('id', battler.id)
      .not('stage_name', 'like', 'Test_%')
      .gte('ranking.rating', targetRating - ratingRange)
      .lte('ranking.rating', targetRating + ratingRange)
      .limit(10);
    localOpponents = sameCity || [];
  }

  const { data: aiOpponents } = await supabase
    .from('battlers')
    .select(`
      *,
      ranking:rankings(rating)
    `)
    .eq('is_ai', true)
    .neq('id', battler.id)
    .not('stage_name', 'like', 'Test_%')
    .gte('ranking.rating', targetRating - ratingRange)
    .lte('ranking.rating', targetRating + ratingRange)
    .limit(20);

  // PHASE 3: Build weighted opponent pool (rivals first, then others)
  let opponentPool: any[] = [];

  // 80% chance that if you have rivals, at least one offer is against a rival
  if (rivals.length > 0 && Math.random() < 0.8) {
    opponentPool.push(...rivals);
  }

  // Add regular opponents — same-city battlers first, then the wider pool
  // (deduped so a local never appears twice).
  const localIds = new Set(localOpponents.map((o) => o.id));
  opponentPool.push(
    ...localOpponents,
    ...(aiOpponents || []).filter((o: any) => !localIds.has(o.id))
  );

  // Fall back to any AI battlers if no similar-rated opponents found
  if (opponentPool.length === 0) {
    const { data: anyAi } = await supabase
      .from('battlers')
      .select('*')
      .eq('is_ai', true)
      .not('stage_name', 'like', 'Test_%')
      .limit(20);

    opponentPool = anyAi || [];
  }

  // Never book the player against their own crew — you don't battle your team.
  // Rival rematches are offered on purpose, so without this a crew member who is
  // also a rival could be matched against you and escalate a beef with someone on
  // your own payroll (an owner "at war" with their own crew makes no sense).
  const { data: crewRows } = await supabase
    .from('crew_members')
    .select('member_battler_id')
    .eq('owner_battler_id', battler.id);
  const crewIds = new Set((crewRows || []).map((c: any) => c.member_battler_id));
  if (crewIds.size > 0) {
    opponentPool = opponentPool.filter((o: any) => !crewIds.has(o.id));
  }

  if (opponentPool.length === 0) {
    console.error('No AI opponents available');
    return 0;
  }

  // Generate multiple offers
  let offersCreated = 0;
  const usedOpponentIds = new Set<string>();

  for (let i = 0; i < offerCount && opponentPool.length > 0; i++) {
    // Pick a random opponent that hasn't been used yet
    const availableOpponents = opponentPool.filter(
      (opp) => !usedOpponentIds.has(opp.id)
    );

    if (availableOpponents.length === 0) {
      break; // No more unique opponents available
    }

    // LOCAL FLAVOR: when the player has a current city and locals are in the
    // pool, 70% of picks come from the local scene first.
    const localOpponents = battler.current_city_id
      ? availableOpponents.filter((opp) => opp.current_city_id === battler.current_city_id)
      : [];
    const pickFrom =
      localOpponents.length > 0 && Math.random() < 0.7 ? localOpponents : availableOpponents;

    const randomOpponent = pickFrom[Math.floor(Math.random() * pickFrom.length)];

    usedOpponentIds.add(randomOpponent.id);

    const success = await createBattleOffer(
      supabase,
      battler.id,
      randomOpponent.id,
      league
    );

    if (success) {
      offersCreated++;
    }
  }

  return offersCreated;
}

/**
 * Create a single battle offer
 */
async function createBattleOffer(
  supabase: SupabaseClient,
  playerBattlerId: string,
  aiBattlerId: string,
  league: League
): Promise<boolean> {
  // Schedule battle 7-14 days in the future (uses virtual time in dev mode)
  const daysAhead = 7 + Math.floor(Math.random() * 8); // 7-14 days
  const { getFutureDate } = await import('@/lib/dev/timeManipulation');
  const scheduledAt = getFutureDate(daysAhead);

  // Lock prep 1 day before battle
  const lockPrepAt = new Date(scheduledAt);
  lockPrepAt.setDate(lockPrepAt.getDate() - 1);

  const { data: battle, error } = await supabase.from('battles').insert({
    league_id: league.id,
    battler_player_id: playerBattlerId,
    battler_ai_id: aiBattlerId,
    scheduled_at: scheduledAt.toISOString(),
    lock_prep_at: lockPrepAt.toISOString(),
    status: 'offered',
    no_show_player: false,
  }).select('id').single();

  if (error) {
    console.error('Failed to create battle offer:', error);
    return false;
  }

  // Create notification for the battle offer
  if (battle?.id) {
    const { data: opponent } = await supabase
      .from('battlers')
      .select('name')
      .eq('id', aiBattlerId)
      .single();

    if (opponent) {
      const { notifyBattleOffer } = await import('./notificationService');
      await notifyBattleOffer(
        supabase,
        playerBattlerId,
        battle.id,
        opponent.name,
        league.name
      );
    }
  }

  return true;
}

// =====================================================
// DUCKING DETECTION (PHASE 3)
// =====================================================

/**
 * Track when a battler declines/ignores an offer from a rival
 * Increments consecutive_offers_ignored counter
 * Sets is_ducking flag if threshold reached (3+ ignored offers)
 */
export async function trackDeclinedOffer(
  supabase: SupabaseClient,
  battlerId: string,
  opponentId: string
): Promise<void> {
  // Check if relationship exists
  const { data: relationship } = await supabase
    .from('battler_relationships')
    .select('*')
    .or(`and(battler_a_id.eq.${battlerId},battler_b_id.eq.${opponentId}),and(battler_a_id.eq.${opponentId},battler_b_id.eq.${battlerId})`)
    .single();

  if (!relationship) {
    // No relationship, no ducking tracking needed
    return;
  }

  // Only track ducking for rivals+ (state_level >= 3)
  if (relationship.state_level < 3) {
    return;
  }

  // Determine which side is the battler
  const isPlayerA = relationship.battler_a_id === battlerId;
  const currentIgnored = isPlayerA
    ? relationship.consecutive_offers_ignored_by_a
    : relationship.consecutive_offers_ignored_by_b;

  const newIgnored = currentIgnored + 1;
  const isDucking = newIgnored >= 3; // Threshold: 3+ ignored offers = ducking

  // Update relationship
  const updateData = isPlayerA
    ? {
        consecutive_offers_ignored_by_a: newIgnored,
        is_ducking_a: isDucking,
      }
    : {
        consecutive_offers_ignored_by_b: newIgnored,
        is_ducking_b: isDucking,
      };

  await supabase
    .from('battler_relationships')
    .update(updateData)
    .eq('id', relationship.id);

  // If ducking detected for the first time, create notification
  if (isDucking && currentIgnored === 2) {
    // Get opponent name
    const { data: opponent } = await supabase
      .from('battlers')
      .select('stage_name')
      .eq('id', opponentId)
      .single();

    if (opponent) {
      await supabase.rpc('create_notification', {
        p_battler_id: battlerId,
        p_type: 'rivalry_update',
        p_title: 'Ducking Accusations',
        p_message: `The media is questioning why you keep avoiding ${opponent.stage_name}. Your rivalry demands resolution.`,
        p_metadata: {
          relationship_id: relationship.id,
          opponent_id: opponentId,
          ignored_count: newIgnored,
        },
      });

      console.log(`[DUCKING] ${battlerId} is now ducking ${opponentId} (${newIgnored} offers ignored)`);
    }
  }
}

/**
 * Reset ducking counters when battle is accepted
 * Called when a battler accepts an offer from a rival
 */
export async function resetDuckingCounter(
  supabase: SupabaseClient,
  battlerId: string,
  opponentId: string
): Promise<void> {
  // Check if relationship exists
  const { data: relationship } = await supabase
    .from('battler_relationships')
    .select('*')
    .or(`and(battler_a_id.eq.${battlerId},battler_b_id.eq.${opponentId}),and(battler_a_id.eq.${opponentId},battler_b_id.eq.${battlerId})`)
    .single();

  if (!relationship) {
    return;
  }

  // Determine which side is the battler
  const isPlayerA = relationship.battler_a_id === battlerId;

  // Reset counter and ducking flag
  const updateData = isPlayerA
    ? {
        consecutive_offers_ignored_by_a: 0,
        is_ducking_a: false,
      }
    : {
        consecutive_offers_ignored_by_b: 0,
        is_ducking_b: false,
      };

  await supabase
    .from('battler_relationships')
    .update(updateData)
    .eq('id', relationship.id);

  console.log(`[DUCKING] Reset ducking counter for ${battlerId} vs ${opponentId}`);
}
