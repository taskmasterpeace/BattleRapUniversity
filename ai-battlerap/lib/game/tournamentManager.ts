/**
 * Tournament Manager
 * Handles tournament registration, bracket generation, scheduling, and prize distribution
 * Based on single elimination format like Ultimate Madness
 */

import { createServerSupabaseClient } from '@/lib/db/server';
import { getTierFromRating } from './paymentCalculator';
import { selectDiverseJudgePanel } from './judgePreferences';

// Helper function to get readable round names for notifications
function getRoundDisplayName(round: 'first_round' | 'quarterfinals' | 'semifinals' | 'finals'): string {
  const roundNames = {
    first_round: 'First Round',
    quarterfinals: 'Quarterfinals',
    semifinals: 'Semifinals',
    finals: 'Finals',
  };
  return roundNames[round];
}

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  league_id: string;
  max_participants: number;
  tier_restriction: 'low' | 'mid' | 'low_mid' | 'all';
  tournament_format: 'single_elimination';
  total_prize_pool: number;
  prize_distribution: {
    winner: number;
    runner_up: number;
    semifinalists: number;
    quarterfinalists: number;
  };
  status: 'registration' | 'seeding' | 'in_progress' | 'completed' | 'cancelled';
  registration_opens_at: string;
  registration_closes_at: string;
  tournament_starts_at: string;
  current_round: 'first_round' | 'quarterfinals' | 'semifinals' | 'finals' | null;
  current_round_deadline: string | null;
  winner_battler_id: string | null;
  runner_up_battler_id: string | null;
  rules_text: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  battler_id: string;
  registered_at: string;
  registration_order: number | null;
  seed_number: number | null;
  rating_at_registration: number | null;
  final_placement: 'winner' | 'runner_up' | 'semifinalist' | 'quarterfinalist' | 'first_round' | 'withdrawn' | null;
  eliminated_in_round: 'first_round' | 'quarterfinals' | 'semifinals' | 'finals' | null;
  prize_amount: number;
  prize_paid: boolean;
  is_active: boolean;
  withdrawn_at: string | null;
  withdrawal_reason: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TournamentBracket {
  id: string;
  tournament_id: string;
  round: 'first_round' | 'quarterfinals' | 'semifinals' | 'finals';
  match_number: number;
  battler_1_id: string;
  battler_2_id: string;
  seed_1: number | null;
  seed_2: number | null;
  battle_id: string | null;
  winner_battler_id: string | null;
  loser_battler_id: string | null;
  status: 'pending' | 'scheduled' | 'locked' | 'completed' | 'walkover';
  scheduled_at: string | null;
  prep_deadline: string | null;
  completed_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TOURNAMENT REGISTRATION
// ============================================================================

/**
 * Register a battler for a tournament
 * Validates tier eligibility and tournament capacity
 */
export async function registerForTournament(
  tournamentId: string,
  battlerId: string
): Promise<{ success: boolean; error?: string; participant?: TournamentParticipant }> {
  const supabase = await createServerSupabaseClient();

  // Get tournament details
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (tournamentError || !tournament) {
    return { success: false, error: 'Tournament not found' };
  }

  // Check if registration is open
  const now = new Date();
  const registrationCloses = new Date(tournament.registration_closes_at);

  if (tournament.status !== 'registration') {
    return { success: false, error: 'Tournament registration is closed' };
  }

  if (now > registrationCloses) {
    return { success: false, error: 'Registration deadline has passed' };
  }

  // Get battler's current rating
  const { data: ranking } = await supabase
    .from('rankings')
    .select('rating')
    .eq('battler_id', battlerId)
    .single();

  if (!ranking) {
    return { success: false, error: 'Battler ranking not found' };
  }

  // Check tier eligibility
  const battlerTier = getTierFromRating(ranking.rating);

  if (tournament.tier_restriction !== 'all') {
    if (tournament.tier_restriction === 'low' && battlerTier !== 'low') {
      return { success: false, error: 'Only low-tier battlers can register for this tournament' };
    }
    if (tournament.tier_restriction === 'mid' && battlerTier !== 'mid') {
      return { success: false, error: 'Only mid-tier battlers can register for this tournament' };
    }
    if (tournament.tier_restriction === 'low_mid' && !['low', 'mid'].includes(battlerTier)) {
      return { success: false, error: 'Only low and mid-tier battlers can register for this tournament' };
    }
  }

  // Check if already registered
  const { data: existingParticipant } = await supabase
    .from('tournament_participants')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('battler_id', battlerId)
    .maybeSingle();

  if (existingParticipant) {
    return { success: false, error: 'Already registered for this tournament' };
  }

  // Check capacity
  const { count: participantCount } = await supabase
    .from('tournament_participants')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId)
    .eq('is_active', true);

  if (participantCount !== null && participantCount >= tournament.max_participants) {
    return { success: false, error: 'Tournament is full' };
  }

  // Register participant
  const { data: participant, error: participantError } = await supabase
    .from('tournament_participants')
    .insert({
      tournament_id: tournamentId,
      battler_id: battlerId,
      rating_at_registration: ranking.rating,
      registration_order: (participantCount || 0) + 1,
    })
    .select()
    .single();

  if (participantError || !participant) {
    return { success: false, error: 'Failed to register for tournament' };
  }

  // 1. NOTIFICATION: Registration Success
  await supabase.rpc('create_notification', {
    p_battler_id: battlerId,
    p_type: 'tournament_update',
    p_title: 'Tournament Registration Confirmed',
    p_message: `You're registered for ${tournament.name}. Good luck!`,
    p_metadata: { tournament_id: tournamentId },
  });

  return { success: true, participant };
}

/**
 * Withdraw from a tournament
 */
export async function withdrawFromTournament(
  tournamentId: string,
  battlerId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('tournament_participants')
    .update({
      is_active: false,
      withdrawn_at: new Date().toISOString(),
      withdrawal_reason: reason || 'Withdrew from tournament',
    })
    .eq('tournament_id', tournamentId)
    .eq('battler_id', battlerId);

  if (error) {
    return { success: false, error: 'Failed to withdraw from tournament' };
  }

  return { success: true };
}

// ============================================================================
// BRACKET GENERATION
// ============================================================================

/**
 * Generate tournament brackets using seeded matchups
 * Seeds participants by rating (highest = seed #1)
 * Creates standard single-elimination bracket
 */
export async function generateTournamentBrackets(
  tournamentId: string
): Promise<{ success: boolean; error?: string; brackets?: TournamentBracket[] }> {
  const supabase = await createServerSupabaseClient();

  // Get tournament
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (!tournament) {
    return { success: false, error: 'Tournament not found' };
  }

  if (tournament.status !== 'registration') {
    return { success: false, error: 'Brackets can only be generated during registration phase' };
  }

  // Get active participants with ratings
  const { data: participants } = await supabase
    .from('tournament_participants')
    .select(`
      id,
      battler_id,
      rating_at_registration,
      battlers!inner(id, stage_name)
    `)
    .eq('tournament_id', tournamentId)
    .eq('is_active', true)
    .order('rating_at_registration', { ascending: false });

  if (!participants || participants.length === 0) {
    return { success: false, error: 'No participants found' };
  }

  // Validate participant count (must be power of 2)
  const validCounts = [4, 8, 16];
  if (!validCounts.includes(participants.length)) {
    return {
      success: false,
      error: `Invalid participant count (${participants.length}). Must be 4, 8, or 16.`,
    };
  }

  // Assign seeds based on rating
  for (let i = 0; i < participants.length; i++) {
    await supabase
      .from('tournament_participants')
      .update({ seed_number: i + 1 })
      .eq('id', participants[i].id);

    // 2. NOTIFICATION: Seeding Complete
    await supabase.rpc('create_notification', {
      p_battler_id: participants[i].battler_id,
      p_type: 'tournament_update',
      p_title: 'Brackets Released!',
      p_message: `You are seed #${i + 1} in ${tournament.name}. Check your first match.`,
      p_metadata: {
        tournament_id: tournamentId,
        seed_number: i + 1,
      },
    });
  }

  // Generate first round matchups using standard bracket seeding
  // Seed 1 vs Seed 16, Seed 8 vs Seed 9, etc.
  const brackets: TournamentBracket[] = [];
  const firstRoundMatchups = generateStandardBracketMatchups(participants.length);

  for (const matchup of firstRoundMatchups) {
    const battler1 = participants[matchup.seed1 - 1];
    const battler2 = participants[matchup.seed2 - 1];

    const { data: bracket, error } = await supabase
      .from('tournament_brackets')
      .insert({
        tournament_id: tournamentId,
        round: 'first_round',
        match_number: matchup.matchNumber,
        battler_1_id: battler1.battler_id,
        battler_2_id: battler2.battler_id,
        seed_1: matchup.seed1,
        seed_2: matchup.seed2,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && bracket) {
      brackets.push(bracket);
    }
  }

  // Select diverse judge panel for this tournament
  const judgePanel = selectDiverseJudgePanel(3);
  const judgeIds = judgePanel.map(j => j.judge_id);
  const judgeNames = judgePanel.map(j => j.judge_name);

  // Update tournament status to seeding and assign judges
  await supabase
    .from('tournaments')
    .update({
      status: 'seeding',
      judges: judgeIds,
      judge_names: judgeNames,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tournamentId);

  return { success: true, brackets };
}

/**
 * Generate standard bracket matchups for first round
 * Returns array of {matchNumber, seed1, seed2}
 */
function generateStandardBracketMatchups(participantCount: number): {
  matchNumber: number;
  seed1: number;
  seed2: number;
}[] {
  const matchups = [];

  if (participantCount === 16) {
    // Standard 16-team bracket
    matchups.push(
      { matchNumber: 1, seed1: 1, seed2: 16 },
      { matchNumber: 2, seed1: 8, seed2: 9 },
      { matchNumber: 3, seed1: 5, seed2: 12 },
      { matchNumber: 4, seed1: 4, seed2: 13 },
      { matchNumber: 5, seed1: 6, seed2: 11 },
      { matchNumber: 6, seed1: 3, seed2: 14 },
      { matchNumber: 7, seed1: 7, seed2: 10 },
      { matchNumber: 8, seed1: 2, seed2: 15 }
    );
  } else if (participantCount === 8) {
    // 8-team bracket
    matchups.push(
      { matchNumber: 1, seed1: 1, seed2: 8 },
      { matchNumber: 2, seed1: 4, seed2: 5 },
      { matchNumber: 3, seed1: 3, seed2: 6 },
      { matchNumber: 4, seed1: 2, seed2: 7 }
    );
  } else if (participantCount === 4) {
    // 4-team bracket (semifinals start)
    matchups.push(
      { matchNumber: 1, seed1: 1, seed2: 4 },
      { matchNumber: 2, seed1: 2, seed2: 3 }
    );
  }

  return matchups;
}

// ============================================================================
// TOURNAMENT SCHEDULING
// ============================================================================

/**
 * Schedule all battles for current tournament round
 * First round: 30 days prep time (announcement to first battles)
 * Subsequent rounds: 14 days prep time minimum (time between rounds)
 */
export async function scheduleRoundBattles(
  tournamentId: string,
  round: 'first_round' | 'quarterfinals' | 'semifinals' | 'finals',
  daysOfPrep: number = 30
): Promise<{ success: boolean; error?: string; battleIds?: string[] }> {
  const supabase = await createServerSupabaseClient();

  // Get tournament details
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*, leagues!inner(id, name)')
    .eq('id', tournamentId)
    .single();

  if (!tournament) {
    return { success: false, error: 'Tournament not found' };
  }

  // Get pending brackets for this round
  const { data: brackets } = await supabase
    .from('tournament_brackets')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round', round)
    .eq('status', 'pending');

  if (!brackets || brackets.length === 0) {
    return { success: false, error: `No pending brackets found for ${round}` };
  }

  const battleIds: string[] = [];
  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + daysOfPrep);

  const prepDeadline = new Date(scheduledAt);
  prepDeadline.setHours(prepDeadline.getHours() - 24); // Lock 24 hours before battle

  // Create battle for each bracket matchup
  for (const bracket of brackets) {
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert({
        battler_player_id: bracket.battler_1_id,
        battler_ai_id: bracket.battler_2_id,
        league_id: tournament.league_id,
        status: 'accepted', // Auto-accepted for tournament
        scheduled_at: scheduledAt.toISOString(),
        lock_prep_at: prepDeadline.toISOString(),
        is_tournament_battle: true,
        tournament_id: tournamentId,
      })
      .select()
      .single();

    if (battleError || !battle) {
      console.error('Failed to create battle for bracket:', bracket.id, battleError);
      continue;
    }

    battleIds.push(battle.id);

    // Update bracket with battle reference
    await supabase
      .from('tournament_brackets')
      .update({
        battle_id: battle.id,
        status: 'scheduled',
        scheduled_at: scheduledAt.toISOString(),
        prep_deadline: prepDeadline.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bracket.id);

    // 3. NOTIFICATION: Match Scheduled (notify both battlers)
    const roundName = getRoundDisplayName(round);
    await Promise.all([
      supabase.rpc('create_notification', {
        p_battler_id: bracket.battler_1_id,
        p_type: 'tournament_update',
        p_title: 'Tournament Match Scheduled',
        p_message: `Your ${roundName} match is ready. Prepare for battle!`,
        p_metadata: { tournament_id: tournamentId, bracket_id: bracket.id },
      }),
      supabase.rpc('create_notification', {
        p_battler_id: bracket.battler_2_id,
        p_type: 'tournament_update',
        p_title: 'Tournament Match Scheduled',
        p_message: `Your ${roundName} match is ready. Prepare for battle!`,
        p_metadata: { tournament_id: tournamentId, bracket_id: bracket.id },
      }),
    ]);
  }

  // Update tournament current round
  await supabase
    .from('tournaments')
    .update({
      status: 'in_progress',
      current_round: round,
      current_round_deadline: prepDeadline.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', tournamentId);

  return { success: true, battleIds };
}

// ============================================================================
// ROUND ADVANCEMENT
// ============================================================================

/**
 * Advance tournament to next round
 * Called after all battles in current round are completed
 */
export async function advanceTournamentRound(
  tournamentId: string
): Promise<{ success: boolean; error?: string; nextRound?: string }> {
  const supabase = await createServerSupabaseClient();

  // Get tournament
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (!tournament || !tournament.current_round) {
    return { success: false, error: 'Tournament not found or not in progress' };
  }

  // Check if all battles in current round are completed
  const { data: currentRoundBrackets } = await supabase
    .from('tournament_brackets')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round', tournament.current_round);

  if (!currentRoundBrackets) {
    return { success: false, error: 'No brackets found for current round' };
  }

  const allCompleted = currentRoundBrackets.every(
    (b) => b.status === 'completed' || b.status === 'walkover'
  );

  if (!allCompleted) {
    return { success: false, error: 'Not all battles in current round are completed' };
  }

  // Determine next round
  const roundProgression: Record<string, string | null> = {
    first_round: 'quarterfinals',
    quarterfinals: 'semifinals',
    semifinals: 'finals',
    finals: null, // Tournament complete
  };

  const nextRound = roundProgression[tournament.current_round];

  if (!nextRound) {
    // Tournament is complete
    return completeTournament(tournamentId);
  }

  // Get winners from current round
  const winners = currentRoundBrackets
    .filter((b) => b.winner_battler_id)
    .map((b) => ({
      battlerId: b.winner_battler_id!,
      seed: b.seed_1, // Winner's original seed
      matchNumber: b.match_number,
    }));

  // Create next round matchups
  const nextRoundMatchups = createNextRoundMatchups(winners, nextRound as any);

  for (const matchup of nextRoundMatchups) {
    await supabase
      .from('tournament_brackets')
      .insert({
        tournament_id: tournamentId,
        round: nextRound,
        match_number: matchup.matchNumber,
        battler_1_id: matchup.battler1Id,
        battler_2_id: matchup.battler2Id,
        seed_1: matchup.seed1,
        seed_2: matchup.seed2,
        status: 'pending',
      });
  }

  // Schedule next round battles (14 days prep for subsequent rounds)
  await scheduleRoundBattles(tournamentId, nextRound as any, 14);

  return { success: true, nextRound };
}

/**
 * Create matchups for next round from winners
 */
function createNextRoundMatchups(
  winners: { battlerId: string; seed: number | null; matchNumber: number }[],
  round: 'quarterfinals' | 'semifinals' | 'finals'
): {
  matchNumber: number;
  battler1Id: string;
  battler2Id: string;
  seed1: number | null;
  seed2: number | null;
}[] {
  const matchups = [];

  // Sort winners by their original match number to maintain bracket structure
  winners.sort((a, b) => a.matchNumber - b.matchNumber);

  // Pair winners sequentially (match 1 winner vs match 2 winner, etc.)
  for (let i = 0; i < winners.length; i += 2) {
    matchups.push({
      matchNumber: Math.floor(i / 2) + 1,
      battler1Id: winners[i].battlerId,
      battler2Id: winners[i + 1].battlerId,
      seed1: winners[i].seed,
      seed2: winners[i + 1].seed,
    });
  }

  return matchups;
}

/**
 * Complete tournament and distribute prizes
 */
async function completeTournament(
  tournamentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  // Get finals bracket to determine winner and runner-up
  const { data: finalsBracket } = await supabase
    .from('tournament_brackets')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round', 'finals')
    .single();

  if (!finalsBracket || !finalsBracket.winner_battler_id) {
    return { success: false, error: 'Finals not completed or winner not determined' };
  }

  const winnerId = finalsBracket.winner_battler_id;
  const runnerUpId = finalsBracket.loser_battler_id;

  // Get tournament details for prize notification
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('name, prize_distribution')
    .eq('id', tournamentId)
    .single();

  // Update tournament with winner and runner-up
  await supabase
    .from('tournaments')
    .update({
      status: 'completed',
      winner_battler_id: winnerId,
      runner_up_battler_id: runnerUpId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tournamentId);

  // Distribute prizes using SQL function
  await supabase.rpc('distribute_tournament_prizes', {
    p_tournament_id: tournamentId,
  });

  // 5. NOTIFICATION: Tournament Complete (champion crowned)
  if (tournament && runnerUpId) {
    const winnerPrize = tournament.prize_distribution.winner;
    const runnerUpPrize = tournament.prize_distribution.runner_up;

    await Promise.all([
      supabase.rpc('create_notification', {
        p_battler_id: winnerId,
        p_type: 'tournament_update',
        p_title: '🏆 TOURNAMENT CHAMPION!',
        p_message: `You won ${tournament.name}! Prize: $${winnerPrize.toLocaleString()}`,
        p_metadata: {
          tournament_id: tournamentId,
          prize_amount: winnerPrize,
        },
      }),
      supabase.rpc('create_notification', {
        p_battler_id: runnerUpId,
        p_type: 'tournament_update',
        p_title: 'Tournament Runner-Up',
        p_message: `You finished 2nd in ${tournament.name}! Prize: $${runnerUpPrize.toLocaleString()}`,
        p_metadata: {
          tournament_id: tournamentId,
          prize_amount: runnerUpPrize,
        },
      }),
    ]);
  }

  // Award achievements
  await awardTournamentAchievements(tournamentId);

  return { success: true };
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

/**
 * Award tournament achievements to participants
 */
async function awardTournamentAchievements(tournamentId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  // Get tournament details
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (!tournament) return;

  // Get all participants
  const { data: participants } = await supabase
    .from('tournament_participants')
    .select('*')
    .eq('tournament_id', tournamentId);

  if (!participants) return;

  // Award winner achievement
  if (tournament.winner_battler_id) {
    await supabase.from('tournament_achievements').insert({
      battler_id: tournament.winner_battler_id,
      tournament_id: tournamentId,
      achievement_type: 'tournament_winner',
      achievement_name: `${tournament.name} Champion`,
      description: `Won ${tournament.name}`,
      final_placement: 'winner',
    });
  }

  // Award runner-up achievement
  if (tournament.runner_up_battler_id) {
    await supabase.from('tournament_achievements').insert({
      battler_id: tournament.runner_up_battler_id,
      tournament_id: tournamentId,
      achievement_type: 'tournament_runner_up',
      achievement_name: `${tournament.name} Runner-Up`,
      description: `Reached finals of ${tournament.name}`,
      final_placement: 'runner_up',
    });
  }

  // Check for upset achievements (beat higher seed by 3+ positions)
  const { data: brackets } = await supabase
    .from('tournament_brackets')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('status', 'completed');

  if (brackets) {
    for (const bracket of brackets) {
      if (bracket.seed_1 && bracket.seed_2 && bracket.winner_battler_id) {
        const winnerSeed =
          bracket.winner_battler_id === bracket.battler_1_id ? bracket.seed_1 : bracket.seed_2;
        const loserSeed =
          bracket.winner_battler_id === bracket.battler_1_id ? bracket.seed_2 : bracket.seed_1;

        const seedDiff = Math.abs(loserSeed - winnerSeed);

        // Award upset achievement if lower seed (higher number) beat higher seed by 3+
        if (winnerSeed > loserSeed && seedDiff >= 3) {
          await supabase.from('tournament_achievements').insert({
            battler_id: bracket.winner_battler_id,
            tournament_id: tournamentId,
            achievement_type: 'tournament_upset',
            achievement_name: 'Giant Killer',
            description: `Beat #${loserSeed} seed as #${winnerSeed} seed`,
            biggest_upset_seed_diff: seedDiff,
          });
        }
      }
    }
  }

  // Check for Cinderella Story (low seed #13-16 reached finals)
  if (tournament.runner_up_battler_id) {
    const runnerUpParticipant = participants.find(
      (p) => p.battler_id === tournament.runner_up_battler_id
    );
    if (runnerUpParticipant && runnerUpParticipant.seed_number && runnerUpParticipant.seed_number >= 13) {
      await supabase.from('tournament_achievements').insert({
        battler_id: tournament.runner_up_battler_id,
        tournament_id: tournamentId,
        achievement_type: 'tournament_cinderella',
        achievement_name: 'Cinderella Story',
        description: `Reached finals as #${runnerUpParticipant.seed_number} seed`,
      });
    }
  }
}

/**
 * Update bracket with battle result
 * Called after battle simulation completes
 */
export async function updateBracketWithBattleResult(
  battleId: string,
  winnerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  // Find bracket for this battle
  const { data: bracket } = await supabase
    .from('tournament_brackets')
    .select('*')
    .eq('battle_id', battleId)
    .single();

  if (!bracket) {
    return { success: false, error: 'Bracket not found for battle' };
  }

  // Determine loser
  const loserId =
    winnerId === bracket.battler_1_id ? bracket.battler_2_id : bracket.battler_1_id;

  // Update bracket
  await supabase
    .from('tournament_brackets')
    .update({
      winner_battler_id: winnerId,
      loser_battler_id: loserId,
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', bracket.id);

  // Update participant placement if eliminated
  await supabase
    .from('tournament_participants')
    .update({
      eliminated_in_round: bracket.round,
    })
    .eq('tournament_id', bracket.tournament_id)
    .eq('battler_id', loserId);

  // 4. NOTIFICATION: Match Result (notify winner and loser)
  const roundName = getRoundDisplayName(bracket.round);

  // Determine placement for loser
  const placementMap: Record<string, string> = {
    first_round: 'First Round',
    quarterfinals: 'Quarterfinalist',
    semifinals: 'Semifinalist',
    finals: 'Runner-Up',
  };
  const placement = placementMap[bracket.round];

  await Promise.all([
    supabase.rpc('create_notification', {
      p_battler_id: winnerId,
      p_type: 'tournament_update',
      p_title: 'Tournament Victory!',
      p_message: `You won your ${roundName} match. Advancing to next round.`,
      p_metadata: { tournament_id: bracket.tournament_id, bracket_id: bracket.id },
    }),
    supabase.rpc('create_notification', {
      p_battler_id: loserId,
      p_type: 'tournament_update',
      p_title: 'Tournament Elimination',
      p_message: `You were eliminated in the ${roundName}. Final placement: ${placement}`,
      p_metadata: { tournament_id: bracket.tournament_id, placement },
    }),
  ]);

  // Check if round is complete and advance if needed
  await advanceTournamentRound(bracket.tournament_id);

  return { success: true };
}
