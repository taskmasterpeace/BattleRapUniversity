/**
 * Grand Prix Auto-Tournament System
 * Automatically creates an 8-person tournament when a player completes their origin story
 *
 * This is the player's "breakthrough moment" - winning against 7 low-tier AI battlers
 * proves they're ready to move beyond their origin and enter the real competitive scene.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  Tournament,
  TournamentParticipant,
  generateTournamentBrackets,
  scheduleRoundBattles,
} from './tournamentManager';

// ============================================================================
// GRAND PRIX CONSTANTS
// ============================================================================

const GRAND_PRIX_CONFIG = {
  MAX_PARTICIPANTS: 8,
  TOTAL_BATTLERS_NEEDED: 8, // 1 player + 7 AI
  PRIZE_POOL: 15000, // $15,000 for origin story completion tournament
  PREP_DAYS: 21, // 3 weeks to prepare for first round
  TIER_RESTRICTION: 'low' as const,
  AI_RATING_MAX: 1400, // Only low-tier AI battlers
  REQUIRED_MILESTONES: 5, // Must complete 5 origin milestones
};

// ============================================================================
// INTERFACES
// ============================================================================

export interface GrandPrixResult {
  success: boolean;
  error?: string;
  tournament?: Tournament;
  message?: string;
}

export interface Battler {
  id: string;
  stage_name: string;
  is_ai: boolean;
  tier: string;
}

// ============================================================================
// ELIGIBILITY CHECK
// ============================================================================

/**
 * Check if player has qualified for Grand Prix (5 origin milestones completed)
 */
export async function checkGrandPrixEligibility(
  battlerId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  // Check if battler has completed origin story
  const { data: battler, error: battlerError } = await supabase
    .from('battlers')
    .select('origin_completed')
    .eq('id', battlerId)
    .single();

  if (battlerError || !battler) {
    console.error('Failed to fetch battler for Grand Prix eligibility:', battlerError);
    return false;
  }

  return battler.origin_completed === true;
}

/**
 * Check if player has already participated in a Grand Prix
 */
export async function hasCompletedGrandPrix(
  battlerId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  // Check if battler has participated in any tournament with metadata.grand_prix = true
  const { data: participant, error } = await supabase
    .from('tournament_participants')
    .select('id, tournaments!inner(metadata)')
    .eq('battler_id', battlerId)
    .eq('tournaments.metadata->>grand_prix', 'true')
    .maybeSingle();

  if (error) {
    console.error('Failed to check Grand Prix history:', error);
    return false;
  }

  return participant !== null;
}

// ============================================================================
// OPPONENT SELECTION
// ============================================================================

/**
 * Get random low-tier AI battlers to fill tournament
 * Excludes battlers the player has already faced
 */
export async function getGrandPrixOpponents(
  playerId: string,
  supabase: SupabaseClient,
  count: number = 7
): Promise<Battler[]> {
  // Get IDs of battlers player has already faced
  const { data: pastOpponents } = await supabase
    .from('battles')
    .select('battler_ai_id')
    .eq('battler_player_id', playerId)
    .not('battler_ai_id', 'is', null);

  const facedIds = pastOpponents?.map((b) => b.battler_ai_id).filter(Boolean) || [];

  // Get low-tier AI battlers (rating < 1400) that player hasn't faced
  const { data: battlers, error } = await supabase
    .from('battlers')
    .select(
      `
      id,
      stage_name,
      is_ai,
      tier,
      rankings!inner(rating)
    `
    )
    .eq('is_ai', true)
    .eq('tier', 'low')
    .lt('rankings.rating', GRAND_PRIX_CONFIG.AI_RATING_MAX)
    .not('id', 'in', `(${facedIds.length > 0 ? facedIds.join(',') : "'00000000-0000-0000-0000-000000000000'"})`)
    .order('rankings.rating', { ascending: false }) // Strongest low-tier opponents first
    .limit(count);

  if (error) {
    console.error('Failed to fetch Grand Prix opponents:', error);
    return [];
  }

  // If we don't have enough unfaced opponents, fill with any low-tier AI
  if (!battlers || battlers.length < count) {
    console.warn(`Only found ${battlers?.length || 0} unfaced opponents, filling with any low-tier AI`);

    const { data: fillBattlers } = await supabase
      .from('battlers')
      .select(
        `
        id,
        stage_name,
        is_ai,
        tier,
        rankings!inner(rating)
      `
      )
      .eq('is_ai', true)
      .eq('tier', 'low')
      .lt('rankings.rating', GRAND_PRIX_CONFIG.AI_RATING_MAX)
      .order('rankings.rating', { ascending: false })
      .limit(count);

    return (fillBattlers || []).slice(0, count);
  }

  return battlers;
}

// ============================================================================
// TOURNAMENT CREATION
// ============================================================================

/**
 * Create a Grand Prix tournament when player qualifies
 * Auto-registers player and fills remaining slots with AI battlers
 */
export async function createGrandPrix(
  playerId: string,
  supabase: SupabaseClient
): Promise<GrandPrixResult> {
  try {
    // 1. Validate eligibility
    const isEligible = await checkGrandPrixEligibility(playerId, supabase);
    if (!isEligible) {
      return {
        success: false,
        error: 'Player has not completed origin story (requires 5 milestones)',
      };
    }

    // 2. Check if already participated
    const hasParticipated = await hasCompletedGrandPrix(playerId, supabase);
    if (hasParticipated) {
      return {
        success: false,
        error: 'Player has already participated in a Grand Prix tournament',
      };
    }

    // 3. Get player info
    const { data: player, error: playerError } = await supabase
      .from('battlers')
      .select('id, stage_name, origin_type, primary_league_id')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      return {
        success: false,
        error: 'Failed to fetch player information',
      };
    }

    // 4. Get opponents
    const opponents = await getGrandPrixOpponents(playerId, supabase, 7);
    if (opponents.length < 7) {
      return {
        success: false,
        error: `Not enough AI battlers available (need 7, found ${opponents.length})`,
      };
    }

    // 5. Get appropriate league
    const { data: league } = await supabase
      .from('leagues')
      .select('id, name')
      .eq('id', player.primary_league_id)
      .single();

    if (!league) {
      return {
        success: false,
        error: 'Failed to fetch league information',
      };
    }

    // 6. Create tournament
    const originLabel = {
      text_forums: 'Text Forums',
      app_camera: 'App Camera',
      crew: 'Crew',
    }[player.origin_type || 'text_forums'];

    const tournamentName = `${player.stage_name}'s Grand Prix`;
    const tournamentDescription = `${player.stage_name} has completed their ${originLabel} origin story and qualified for the Grand Prix! Win this 8-battler tournament to prove you're ready for the big leagues.`;

    const now = new Date();
    const registrationCloses = new Date(now);
    registrationCloses.setHours(now.getHours() + 1); // Close in 1 hour (auto-register everyone)

    const tournamentStarts = new Date(now);
    tournamentStarts.setDate(now.getDate() + GRAND_PRIX_CONFIG.PREP_DAYS);

    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: tournamentName,
        description: tournamentDescription,
        league_id: league.id,
        max_participants: GRAND_PRIX_CONFIG.MAX_PARTICIPANTS,
        tier_restriction: GRAND_PRIX_CONFIG.TIER_RESTRICTION,
        total_prize_pool: GRAND_PRIX_CONFIG.PRIZE_POOL,
        prize_distribution: {
          winner: 0.5, // $7,500
          runner_up: 0.25, // $3,750
          semifinalists: 0.125, // $1,875 each
          quarterfinalists: 0.0, // $0
        },
        status: 'registration',
        registration_opens_at: now.toISOString(),
        registration_closes_at: registrationCloses.toISOString(),
        tournament_starts_at: tournamentStarts.toISOString(),
        rules_text: 'Grand Prix Tournament: Automatically generated for origin story completion. Win to prove you belong in the competitive scene!',
        metadata: {
          grand_prix: true,
          player_id: playerId,
          origin_type: player.origin_type,
          auto_generated: true,
        },
      })
      .select()
      .single();

    if (tournamentError || !tournament) {
      console.error('Failed to create Grand Prix tournament:', tournamentError);
      return {
        success: false,
        error: 'Failed to create tournament',
      };
    }

    // 7. Auto-register player
    const { data: playerRanking } = await supabase
      .from('rankings')
      .select('rating')
      .eq('battler_id', playerId)
      .single();

    const { error: playerRegError } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: tournament.id,
        battler_id: playerId,
        rating_at_registration: playerRanking?.rating || 1200,
        registration_order: 1,
      });

    if (playerRegError) {
      console.error('Failed to register player:', playerRegError);
      // Clean up tournament
      await supabase.from('tournaments').delete().eq('id', tournament.id);
      return {
        success: false,
        error: 'Failed to register player for tournament',
      };
    }

    // 8. Auto-register AI opponents
    for (let i = 0; i < opponents.length; i++) {
      const opponent = opponents[i];

      const { data: opponentRanking } = await supabase
        .from('rankings')
        .select('rating')
        .eq('battler_id', opponent.id)
        .single();

      await supabase.from('tournament_participants').insert({
        tournament_id: tournament.id,
        battler_id: opponent.id,
        rating_at_registration: opponentRanking?.rating || 1200,
        registration_order: i + 2,
      });
    }

    // 9. Generate brackets immediately (no waiting for registration)
    const bracketsResult = await generateTournamentBrackets(tournament.id);

    if (!bracketsResult.success) {
      console.error('Failed to generate brackets:', bracketsResult.error);
      return {
        success: false,
        error: `Tournament created but failed to generate brackets: ${bracketsResult.error}`,
      };
    }

    // 10. Schedule first round battles
    const scheduleResult = await scheduleRoundBattles(
      tournament.id,
      'first_round',
      GRAND_PRIX_CONFIG.PREP_DAYS
    );

    if (!scheduleResult.success) {
      console.error('Failed to schedule battles:', scheduleResult.error);
      return {
        success: false,
        error: `Tournament created but failed to schedule battles: ${scheduleResult.error}`,
      };
    }

    // 11. Create notification for player
    await supabase.rpc('create_notification', {
      p_battler_id: playerId,
      p_type: 'tournament_update',
      p_title: '🏆 Grand Prix Tournament Created!',
      p_message: `You've completed your origin story! Your Grand Prix tournament starts in ${GRAND_PRIX_CONFIG.PREP_DAYS} days. Win to prove yourself!`,
      p_metadata: {
        tournament_id: tournament.id,
        grand_prix: true,
      },
    });

    return {
      success: true,
      tournament,
      message: `Grand Prix "${tournamentName}" created successfully! First round starts in ${GRAND_PRIX_CONFIG.PREP_DAYS} days.`,
    };
  } catch (error) {
    console.error('Unexpected error creating Grand Prix:', error);
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ============================================================================
// AUTO-TRIGGER (called after milestone achievement)
// ============================================================================

/**
 * Check if player just completed origin story and auto-create Grand Prix
 * Should be called after any milestone is awarded
 */
export async function autoTriggerGrandPrix(
  battlerId: string,
  supabase: SupabaseClient
): Promise<GrandPrixResult | null> {
  // Check if just completed origin (exactly 5 milestones)
  const { data: milestones } = await supabase
    .from('origin_milestones')
    .select('id')
    .eq('battler_id', battlerId);

  if (!milestones || milestones.length !== GRAND_PRIX_CONFIG.REQUIRED_MILESTONES) {
    return null; // Not ready yet
  }

  // Check if origin_completed flag is true
  const { data: battler } = await supabase
    .from('battlers')
    .select('origin_completed')
    .eq('id', battlerId)
    .single();

  if (!battler?.origin_completed) {
    return null; // Flag not set yet
  }

  // Check if already has Grand Prix
  const hasGP = await hasCompletedGrandPrix(battlerId, supabase);
  if (hasGP) {
    return null; // Already participated
  }

  // Auto-create Grand Prix
  console.log(`🎊 Auto-triggering Grand Prix for battler ${battlerId}`);
  return await createGrandPrix(battlerId, supabase);
}
