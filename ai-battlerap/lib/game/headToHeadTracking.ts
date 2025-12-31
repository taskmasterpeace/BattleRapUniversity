/**
 * Head-to-Head Tracking System
 *
 * Purpose: Track battle history between specific battlers
 * Key Features:
 * - Win/loss records
 * - Score differentials
 * - Performance metrics
 * - Battle history
 * - No rematches allowed in V1 (constraint enforced)
 *
 * Integrates with:
 * - grudgeEngine.ts (provides context for grudge creation)
 * - battleSimulation.ts (records results)
 * - newsGenerator.ts (provides historical context)
 */

import { createServerSupabaseClient } from '@/lib/db/server';

// =====================================================
// TYPES
// =====================================================

export interface HeadToHeadRecord {
  id: string;
  battlerAId: string;
  battlerBId: string;
  battlerAWins: number;
  battlerBWins: number;
  lastBattleId: string | null;
  lastBattleAt: string | null;
  lastBattleWinnerId: string | null;
  lastBattleScore: string | null;
  avgScoreDifferential: number | null;
  avgCrowdReactionDifferential: number | null;
  battleIds: string[];
}

export interface BattleRecordData {
  battleId: string;
  battlerAId: string;
  battlerBId: string;
  winnerId: string | null;
  score: string;
  battlerAAvgScore: number;
  battlerBAvgScore: number;
  battlerACrowdReaction: number;
  battlerBCrowdReaction: number;
  battleDate: string;
}

export interface HeadToHeadStats {
  totalBattles: number;
  battlerARecord: { wins: number; losses: number };
  battlerBRecord: { wins: number; losses: number };
  lastBattle: {
    id: string;
    date: string;
    winnerId: string;
    score: string;
  } | null;
  avgScoreDifferential: number; // positive = battler A advantage
  avgCrowdReactionDifferential: number;
  battleHistory: Array<{
    battleId: string;
    date: string;
    winnerId: string;
    score: string;
    battlerAAvg: number;
    battlerBAvg: number;
  }>;
}

// =====================================================
// CORE FUNCTIONS
// =====================================================

/**
 * Update head-to-head record after a battle completes
 * This is the main entry point called from battle simulation
 */
export async function updateHeadToHeadRecord(
  battleData: BattleRecordData,
  supabaseClient?: any
): Promise<HeadToHeadRecord> {
  // Use provided client for scripts, or create server client for API routes
  const supabase = supabaseClient || await createServerSupabaseClient();

  // Ensure proper ID ordering (smaller UUID first)
  const [aId, bId] = sortBattlerIds(battleData.battlerAId, battleData.battlerBId);

  // Determine which battler is which after sorting
  const isAFirst = battleData.battlerAId === aId;
  const battlerAWins = isAFirst && battleData.winnerId === battleData.battlerAId ? 1 :
                       !isAFirst && battleData.winnerId === battleData.battlerBId ? 1 : 0;
  const battlerBWins = isAFirst && battleData.winnerId === battleData.battlerBId ? 1 :
                       !isAFirst && battleData.winnerId === battleData.battlerAId ? 1 : 0;

  // Calculate score differential (from battler A's perspective)
  const scoreDiff = isAFirst
    ? battleData.battlerAAvgScore - battleData.battlerBAvgScore
    : battleData.battlerBAvgScore - battleData.battlerAAvgScore;

  // Calculate crowd reaction differential
  const crowdDiff = isAFirst
    ? battleData.battlerACrowdReaction - battleData.battlerBCrowdReaction
    : battleData.battlerBCrowdReaction - battleData.battlerACrowdReaction;

  // Check if record exists
  const { data: existing } = await supabase
    .from('head_to_head_records')
    .select('*')
    .eq('battler_a_id', aId)
    .eq('battler_b_id', bId)
    .single();

  if (existing) {
    // Update existing record
    const newBattlerAWins = existing.battler_a_wins + battlerAWins;
    const newBattlerBWins = existing.battler_b_wins + battlerBWins;
    const totalBattles = newBattlerAWins + newBattlerBWins;

    // Calculate new average differentials
    const newAvgScoreDiff = calculateRunningAverage(
      existing.avg_score_differential || 0,
      existing.battle_ids.length,
      scoreDiff
    );

    const newAvgCrowdDiff = calculateRunningAverage(
      existing.avg_crowd_reaction_differential || 0,
      existing.battle_ids.length,
      crowdDiff
    );

    const { data: updated, error } = await supabase
      .from('head_to_head_records')
      .update({
        battler_a_wins: newBattlerAWins,
        battler_b_wins: newBattlerBWins,
        last_battle_id: battleData.battleId,
        last_battle_at: battleData.battleDate,
        last_battle_winner_id: battleData.winnerId,
        last_battle_score: battleData.score,
        avg_score_differential: newAvgScoreDiff,
        avg_crowd_reaction_differential: newAvgCrowdDiff,
        battle_ids: [...existing.battle_ids, battleData.battleId],
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating H2H record:', error);
      throw error;
    }

    return mapToHeadToHeadRecord(updated);
  } else {
    // Create new record
    const { data: created, error } = await supabase
      .from('head_to_head_records')
      .insert({
        battler_a_id: aId,
        battler_b_id: bId,
        battler_a_wins: battlerAWins,
        battler_b_wins: battlerBWins,
        last_battle_id: battleData.battleId,
        last_battle_at: battleData.battleDate,
        last_battle_winner_id: battleData.winnerId,
        last_battle_score: battleData.score,
        avg_score_differential: scoreDiff,
        avg_crowd_reaction_differential: crowdDiff,
        battle_ids: [battleData.battleId],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating H2H record:', error);
      throw error;
    }

    return mapToHeadToHeadRecord(created);
  }
}

/**
 * Get head-to-head record between two battlers
 */
export async function getHeadToHeadRecord(
  battlerAId: string,
  battlerBId: string
): Promise<HeadToHeadRecord | null> {
  const supabase = await createServerSupabaseClient();

  const [aId, bId] = sortBattlerIds(battlerAId, battlerBId);

  const { data, error } = await supabase
    .from('head_to_head_records')
    .select('*')
    .eq('battler_a_id', aId)
    .eq('battler_b_id', bId)
    .single();

  if (error || !data) {
    return null;
  }

  return mapToHeadToHeadRecord(data);
}

/**
 * Get detailed head-to-head stats with battle history
 */
export async function getHeadToHeadStats(
  battlerAId: string,
  battlerBId: string
): Promise<HeadToHeadStats | null> {
  const supabase = await createServerSupabaseClient();

  const [aId, bId] = sortBattlerIds(battlerAId, battlerBId);

  const { data: h2h } = await supabase
    .from('head_to_head_records')
    .select('*')
    .eq('battler_a_id', aId)
    .eq('battler_b_id', bId)
    .single();

  if (!h2h) {
    return null;
  }

  // Fetch battle details
  const { data: battles } = await supabase
    .from('battles')
    .select(`
      id,
      scheduled_at,
      winner_battler_id,
      battle_rounds (
        round_number,
        player_battler_id,
        ai_battler_id,
        average_score,
        crowd_reaction
      )
    `)
    .in('id', h2h.battle_ids)
    .order('scheduled_at', { ascending: false });

  const battleHistory = battles?.map((battle: any) => {
    // Calculate averages for each battler
    const playerRounds = battle.battle_rounds.filter((r: any) => r.player_battler_id);
    const aiRounds = battle.battle_rounds.filter((r: any) => r.ai_battler_id);

    const playerAvg = playerRounds.length > 0
      ? playerRounds.reduce((sum: number, r: any) => sum + r.average_score, 0) / playerRounds.length
      : 0;

    const aiAvg = aiRounds.length > 0
      ? aiRounds.reduce((sum: number, r: any) => sum + r.average_score, 0) / aiRounds.length
      : 0;

    // Determine score
    const playerWins = playerRounds.filter((r: any) => r.player_won).length;
    const aiWins = aiRounds.filter((r: any) => !r.player_won).length;
    const score = `${playerWins}-${aiWins}`;

    return {
      battleId: battle.id,
      date: battle.scheduled_at,
      winnerId: battle.winner_battler_id,
      score,
      battlerAAvg: playerAvg,
      battlerBAvg: aiAvg,
    };
  }) || [];

  return {
    totalBattles: h2h.battler_a_wins + h2h.battler_b_wins,
    battlerARecord: {
      wins: h2h.battler_a_wins,
      losses: h2h.battler_b_wins,
    },
    battlerBRecord: {
      wins: h2h.battler_b_wins,
      losses: h2h.battler_a_wins,
    },
    lastBattle: h2h.last_battle_id ? {
      id: h2h.last_battle_id,
      date: h2h.last_battle_at!,
      winnerId: h2h.last_battle_winner_id!,
      score: h2h.last_battle_score!,
    } : null,
    avgScoreDifferential: h2h.avg_score_differential || 0,
    avgCrowdReactionDifferential: h2h.avg_crowd_reaction_differential || 0,
    battleHistory,
  };
}

/**
 * Check if two battlers have already faced each other
 * Used to enforce no-rematch rule in V1
 */
export async function haveBattlersFaced(
  battlerAId: string,
  battlerBId: string
): Promise<boolean> {
  const record = await getHeadToHeadRecord(battlerAId, battlerBId);
  return record !== null && record.battleIds.length > 0;
}

/**
 * Get all battlers that a given battler has faced
 */
export async function getBattlerOpponents(
  battlerId: string
): Promise<Array<{ opponentId: string; record: HeadToHeadRecord }>> {
  const supabase = await createServerSupabaseClient();

  // Query where battler is either battler_a or battler_b
  const { data } = await supabase
    .from('head_to_head_records')
    .select('*')
    .or(`battler_a_id.eq.${battlerId},battler_b_id.eq.${battlerId}`);

  if (!data) {
    return [];
  }

  return data.map(record => ({
    opponentId: record.battler_a_id === battlerId ? record.battler_b_id : record.battler_a_id,
    record: mapToHeadToHeadRecord(record),
  }));
}

/**
 * Get head-to-head record from battler's perspective
 * Returns wins/losses from the specified battler's viewpoint
 */
export async function getHeadToHeadFromPerspective(
  battlerId: string,
  opponentId: string
): Promise<{
  wins: number;
  losses: number;
  lastBattleWon: boolean;
  avgScoreDifferential: number; // positive = advantage
} | null> {
  const record = await getHeadToHeadRecord(battlerId, opponentId);

  if (!record) {
    return null;
  }

  const [aId] = sortBattlerIds(battlerId, opponentId);
  const isBattlerA = battlerId === aId;

  return {
    wins: isBattlerA ? record.battlerAWins : record.battlerBWins,
    losses: isBattlerA ? record.battlerBWins : record.battlerAWins,
    lastBattleWon: record.lastBattleWinnerId === battlerId,
    avgScoreDifferential: isBattlerA
      ? (record.avgScoreDifferential || 0)
      : -(record.avgScoreDifferential || 0),
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Sort battler IDs (smaller UUID first for consistency)
 */
function sortBattlerIds(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

/**
 * Calculate running average with new value
 */
function calculateRunningAverage(
  currentAvg: number,
  currentCount: number,
  newValue: number
): number {
  if (currentCount === 0) {
    return newValue;
  }
  return ((currentAvg * currentCount) + newValue) / (currentCount + 1);
}

/**
 * Map database record to HeadToHeadRecord type
 */
function mapToHeadToHeadRecord(data: any): HeadToHeadRecord {
  return {
    id: data.id,
    battlerAId: data.battler_a_id,
    battlerBId: data.battler_b_id,
    battlerAWins: data.battler_a_wins,
    battlerBWins: data.battler_b_wins,
    lastBattleId: data.last_battle_id,
    lastBattleAt: data.last_battle_at,
    lastBattleWinnerId: data.last_battle_winner_id,
    lastBattleScore: data.last_battle_score,
    avgScoreDifferential: data.avg_score_differential,
    avgCrowdReactionDifferential: data.avg_crowd_reaction_differential,
    battleIds: data.battle_ids || [],
  };
}

// =====================================================
// ANALYTICS
// =====================================================

/**
 * Get all rivalries (battlers with multiple battles)
 */
export async function getAllRivalries(): Promise<HeadToHeadRecord[]> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('head_to_head_records')
    .select('*')
    .gte('battler_a_wins', 1)
    .gte('battler_b_wins', 0)
    .order('last_battle_at', { ascending: false });

  return data?.map(mapToHeadToHeadRecord) || [];
}

/**
 * Get battler's complete battle history against all opponents
 */
export async function getBattlerCompleteRecord(
  battlerId: string
): Promise<{
  totalBattles: number;
  totalWins: number;
  totalLosses: number;
  opponents: Array<{
    opponentId: string;
    wins: number;
    losses: number;
    lastBattleDate: string;
  }>;
}> {
  const opponents = await getBattlerOpponents(battlerId);

  let totalWins = 0;
  let totalLosses = 0;

  const opponentRecords = opponents.map(({ opponentId, record }) => {
    const [aId] = sortBattlerIds(battlerId, opponentId);
    const isBattlerA = battlerId === aId;

    const wins = isBattlerA ? record.battlerAWins : record.battlerBWins;
    const losses = isBattlerA ? record.battlerBWins : record.battlerAWins;

    totalWins += wins;
    totalLosses += losses;

    return {
      opponentId,
      wins,
      losses,
      lastBattleDate: record.lastBattleAt || '',
    };
  });

  return {
    totalBattles: totalWins + totalLosses,
    totalWins,
    totalLosses,
    opponents: opponentRecords,
  };
}
