/**
 * Throne Seeding Utility
 *
 * Helper function to initialize throne positions for a league
 * by finding the top 3 battlers by rating and assigning them to thrones.
 *
 * Run this via an admin API route or script to populate initial thrones.
 */

import { SupabaseClient } from '@supabase/supabase-js';

interface SeedThronesResult {
  success: boolean;
  thrones?: Array<{
    position: number;
    battlerId: string;
    battlerName: string;
    rating: number;
  }>;
  error?: string;
}

/**
 * Seeds throne positions for a league with top 3 battlers by rating
 */
export async function seedThronesForLeague(
  supabase: SupabaseClient,
  leagueId: string
): Promise<SeedThronesResult> {
  try {
    // Get top 3 battlers in this league by rating
    const { data: topBattlers, error: rankingsError } = await supabase
      .from('rankings')
      .select(`
        battler_id,
        rating,
        battler:battlers!inner(
          id,
          stage_name,
          primary_league_id
        )
      `)
      .eq('battler.primary_league_id', leagueId)
      .order('rating', { ascending: false })
      .limit(3);

    if (rankingsError) {
      console.error('Error fetching top battlers:', rankingsError);
      return { success: false, error: 'Failed to fetch top battlers' };
    }

    if (!topBattlers || topBattlers.length === 0) {
      return { success: false, error: 'No battlers found in this league' };
    }

    // Check if thrones already exist for this league
    const { data: existingThrones } = await supabase
      .from('throne_positions')
      .select('id')
      .eq('league_id', leagueId);

    if (existingThrones && existingThrones.length > 0) {
      return { success: false, error: 'Thrones already exist for this league' };
    }

    // Create throne positions
    const thronesToCreate = topBattlers.slice(0, 3).map((battler, index) => ({
      league_id: leagueId,
      position: (index + 1) as 1 | 2 | 3,
      battler_id: battler.battler_id,
      started_at: new Date().toISOString(),
      defense_count: 0,
    }));

    const { data: createdThrones, error: insertError } = await supabase
      .from('throne_positions')
      .insert(thronesToCreate)
      .select();

    if (insertError) {
      console.error('Error creating thrones:', insertError);
      return { success: false, error: 'Failed to create throne positions' };
    }

    // Create initial throne_history records
    const historyRecords = topBattlers.slice(0, 3).map((battler, index) => ({
      league_id: leagueId,
      position: (index + 1) as 1 | 2 | 3,
      battler_id: battler.battler_id,
      started_at: new Date().toISOString(),
      ended_at: null,
      defense_count: 0,
    }));

    await supabase.from('throne_history').insert(historyRecords);

    return {
      success: true,
      thrones: topBattlers.slice(0, 3).map((battler, index) => ({
        position: index + 1,
        battlerId: battler.battler_id,
        battlerName: (battler.battler as any).stage_name,
        rating: battler.rating,
      })),
    };
  } catch (error) {
    console.error('Error in seedThronesForLeague:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Seeds thrones for all leagues
 */
export async function seedAllThrones(
  supabase: SupabaseClient
): Promise<{ success: boolean; results: Record<string, SeedThronesResult> }> {
  try {
    // Get all leagues
    const { data: leagues, error: leaguesError } = await supabase
      .from('leagues')
      .select('id, name');

    if (leaguesError || !leagues) {
      return {
        success: false,
        results: { error: { success: false, error: 'Failed to fetch leagues' } },
      };
    }

    // Seed thrones for each league
    const results: Record<string, SeedThronesResult> = {};

    for (const league of leagues) {
      const result = await seedThronesForLeague(supabase, league.id);
      results[league.name] = result;
    }

    const allSucceeded = Object.values(results).every((r) => r.success);

    return {
      success: allSucceeded,
      results,
    };
  } catch (error) {
    console.error('Error in seedAllThrones:', error);
    return {
      success: false,
      results: {
        error: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    };
  }
}

/**
 * Updates throne positions after a battle completes
 * Call this from battle simulation when throne challenge battles finish
 */
export async function updateThronesAfterBattle(
  supabase: SupabaseClient,
  battleId: string
): Promise<{ success: boolean; dethroned?: boolean; error?: string }> {
  try {
    // Check if this battle is a throne challenge
    const { data: challenge } = await supabase
      .from('throne_challenges')
      .select('*')
      .eq('battle_id', battleId)
      .eq('status', 'accepted')
      .single();

    if (!challenge) {
      // Not a throne challenge battle, nothing to update
      return { success: true, dethroned: false };
    }

    // Get battle result
    const { data: battle } = await supabase
      .from('battles')
      .select('winner_id')
      .eq('id', battleId)
      .single();

    if (!battle || !battle.winner_id) {
      return { success: false, error: 'Battle not completed or no winner' };
    }

    const challengerWon = battle.winner_id === challenge.challenger_battler_id;

    if (challengerWon) {
      // Challenger won - update throne position
      // 1. End current throne holder's reign in throne_history
      await supabase
        .from('throne_history')
        .update({
          ended_at: new Date().toISOString(),
          lost_to_battler_id: challenge.challenger_battler_id,
          lost_battle_id: battleId,
        })
        .eq('league_id', challenge.league_id)
        .eq('position', challenge.target_position)
        .eq('battler_id', challenge.throne_holder_battler_id)
        .is('ended_at', null);

      // 2. Update throne_position with new holder
      await supabase
        .from('throne_positions')
        .update({
          battler_id: challenge.challenger_battler_id,
          started_at: new Date().toISOString(),
          defense_count: 0,
        })
        .eq('league_id', challenge.league_id)
        .eq('position', challenge.target_position);

      // 3. Create new throne_history record for new holder
      await supabase.from('throne_history').insert({
        league_id: challenge.league_id,
        position: challenge.target_position,
        battler_id: challenge.challenger_battler_id,
        started_at: new Date().toISOString(),
        ended_at: null,
        defense_count: 0,
      });

      // 4. Update throne_challenge status
      await supabase
        .from('throne_challenges')
        .update({
          status: 'completed',
          result: 'challenger_won',
        })
        .eq('id', challenge.id);

      return { success: true, dethroned: true };
    } else {
      // Defender won - increment defense count
      await supabase
        .from('throne_positions')
        .update({
          defense_count: supabase.rpc('increment', { x: 1 }),
        })
        .eq('league_id', challenge.league_id)
        .eq('position', challenge.target_position);

      // Update throne_history defense count
      await supabase
        .from('throne_history')
        .update({
          defense_count: supabase.rpc('increment', { x: 1 }),
        })
        .eq('league_id', challenge.league_id)
        .eq('position', challenge.target_position)
        .eq('battler_id', challenge.throne_holder_battler_id)
        .is('ended_at', null);

      // Update throne_challenge status
      await supabase
        .from('throne_challenges')
        .update({
          status: 'completed',
          result: 'defender_won',
        })
        .eq('id', challenge.id);

      return { success: true, dethroned: false };
    }
  } catch (error) {
    console.error('Error in updateThronesAfterBattle:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
