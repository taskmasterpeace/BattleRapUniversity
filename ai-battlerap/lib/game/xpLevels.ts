/**
 * XP and Level System
 *
 * Handles career progression through XP (experience points) and levels.
 * Players earn XP from battles, with level-ups awarding skill points for attribute boosts.
 *
 * Design Goals:
 * - Reward performance, not just participation
 * - Make wins meaningful but losses still give progress
 * - Create milestone moments at key career points
 * - Provide long-term progression (180-220 battles to max level)
 *
 * XP Sources:
 * 1. Base participation (100 XP per battle)
 * 2. Win/loss outcomes (50 XP bonus for winning)
 * 3. Margin of victory (3-0 body, 2-1 debatable)
 * 4. Performance excellence (haymakers, consistency, crowd)
 * 5. Career milestones (10th, 25th, 50th, 100th battle)
 */

import type { BattleRound, Ranking } from '@/lib/models';

// ============================================================================
// LEVEL CURVE CONFIGURATION
// ============================================================================

/**
 * Level curve parameters
 *
 * Formula: XP_required = BASE_XP_PER_LEVEL * (level ^ LEVEL_EXPONENT)
 * - Base: 500 XP
 * - Exponent: 1.5 (moderate exponential growth)
 * - Level 1→2: 707 XP
 * - Level 29→30: 16,402 XP
 * - Total to max: ~135,000 XP
 */
const BASE_XP_PER_LEVEL = 500;
const LEVEL_EXPONENT = 1.5;
const MAX_LEVEL = 30;

/**
 * Level tier names for UI display
 */
const LEVEL_TIERS = [
  { minLevel: 1, maxLevel: 5, name: 'Rookie', color: 'zinc' },
  { minLevel: 6, maxLevel: 10, name: 'Up-and-Comer', color: 'blue' },
  { minLevel: 11, maxLevel: 15, name: 'Established', color: 'green' },
  { minLevel: 16, maxLevel: 20, name: 'Elite', color: 'purple' },
  { minLevel: 21, maxLevel: 25, name: 'Legend', color: 'orange' },
  { minLevel: 26, maxLevel: 30, name: 'GOAT', color: 'red' },
] as const;

// ============================================================================
// XP CALCULATION CONFIGURATION
// ============================================================================

const XP_CONFIG = {
  // Base XP
  BASE_BATTLE_XP: 100, // Every battle awards this minimum

  // Win/Loss bonuses
  WIN_BONUS: 50, // +50 XP for winning
  // Losses get base XP only (no bonus, no penalty)

  // Margin of victory bonuses
  BODYBAG_BONUS: 75, // 3-0 sweep (dominant performance)
  DEBATABLE_BONUS: 25, // 2-1 decision (close battle)
  // 2-0 due to choke = no bonus (not a true dominant win)

  // Performance bonuses
  HAYMAKER_BONUS: 30, // Per haymaker (peak_score >= 8.5)
  PERFECT_CONSISTENCY_BONUS: 40, // No chokes or stumbles
  DOMINANT_CROWD_BONUS: 25, // Average crowd_reaction >= 85

  // Career milestone bonuses
  MILESTONE_10_BATTLES: 200,
  MILESTONE_25_BATTLES: 500,
  MILESTONE_50_BATTLES: 1000,
  MILESTONE_100_BATTLES: 2500,

  // Future tournament/championship bonuses (not yet implemented)
  TOURNAMENT_WIN_BONUS: 1000,
  CHAMPIONSHIP_WIN_BONUS: 3000,

  // Skill points
  SKILL_POINTS_PER_LEVEL: 2,
  MAX_SKILL_POINTS_PER_ATTRIBUTE: 10,
  SKILL_POINT_BOOST_AMOUNT: 0.1, // Each skill point = +0.1 to attribute
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface XPBreakdown {
  base: number;
  winBonus: number;
  marginBonus: number;
  haymakerBonus: number;
  consistencyBonus: number;
  crowdBonus: number;
  milestoneBonus: number;
  total: number;
}

export interface LevelUpResult {
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  skillPointsEarned: number;
  xpEarned: number;
  xpBreakdown: XPBreakdown;
  nextLevelXP: number;
  currentLevelXP: number;
}

export interface BattleXPData {
  battleId: string;
  battlerId: string;
  playerRounds: BattleRound[];
  opponentRounds: BattleRound[];
  winnerId: string | null;
  totalBattles: number; // For milestone detection
}

// ============================================================================
// LEVEL CURVE FUNCTIONS
// ============================================================================

/**
 * Calculate XP required to reach a specific level from level 1
 *
 * Example:
 * - Level 2: 707 XP total
 * - Level 10: 15,811 XP total
 * - Level 30: 135,207 XP total
 */
export function getTotalXPForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) return getTotalXPForLevel(MAX_LEVEL);

  let totalXP = 0;
  for (let l = 2; l <= level; l++) {
    totalXP += getXPRequiredForLevel(l);
  }
  return Math.floor(totalXP);
}

/**
 * Calculate XP required to advance from (level - 1) to level
 *
 * Formula: BASE_XP_PER_LEVEL * (level ^ LEVEL_EXPONENT)
 *
 * Example:
 * - Level 2: 707 XP (from level 1)
 * - Level 10: 1,581 XP (from level 9)
 * - Level 30: 16,402 XP (from level 29)
 */
export function getXPRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) return Infinity;

  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(level, LEVEL_EXPONENT));
}

/**
 * Calculate current level based on total XP
 *
 * Returns { level, currentLevelXP, nextLevelXP }
 * - level: Current level (1-30)
 * - currentLevelXP: XP progress toward next level
 * - nextLevelXP: XP required for next level (0 if max level)
 */
export function getLevelFromXP(totalXP: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
} {
  if (totalXP < 0) totalXP = 0;

  let level = 1;
  let xpForNextLevel = getTotalXPForLevel(level + 1);

  // Find the highest level where total XP >= threshold
  while (level < MAX_LEVEL && totalXP >= xpForNextLevel) {
    level++;
    xpForNextLevel = getTotalXPForLevel(level + 1);
  }

  // Calculate XP progress within current level
  const xpForCurrentLevel = getTotalXPForLevel(level);
  const currentLevelXP = totalXP - xpForCurrentLevel;
  const nextLevelXP = level < MAX_LEVEL ? getXPRequiredForLevel(level + 1) : 0;

  return { level, currentLevelXP, nextLevelXP };
}

/**
 * Get level tier name and color for UI display
 */
export function getLevelTier(level: number): {
  name: string;
  color: string;
  minLevel: number;
  maxLevel: number;
} {
  const tier = LEVEL_TIERS.find((t) => level >= t.minLevel && level <= t.maxLevel);
  return tier || LEVEL_TIERS[0];
}

// ============================================================================
// XP CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate XP earned from a battle
 *
 * This is the main XP calculation function that analyzes battle performance
 * and awards XP based on:
 * 1. Base participation (100 XP)
 * 2. Win/loss outcome (+50 for win)
 * 3. Margin of victory (3-0, 2-1)
 * 4. Performance bonuses (haymakers, consistency, crowd)
 * 5. Career milestones
 */
export function calculateBattleXP(data: BattleXPData): XPBreakdown {
  const breakdown: XPBreakdown = {
    base: XP_CONFIG.BASE_BATTLE_XP,
    winBonus: 0,
    marginBonus: 0,
    haymakerBonus: 0,
    consistencyBonus: 0,
    crowdBonus: 0,
    milestoneBonus: 0,
    total: 0,
  };

  const { battlerId, playerRounds, opponentRounds, winnerId, totalBattles } = data;

  // Skip if no rounds (shouldn't happen)
  if (playerRounds.length === 0) {
    breakdown.total = breakdown.base;
    return breakdown;
  }

  // ============================================================================
  // 1. WIN/LOSS BONUS
  // ============================================================================

  const playerWon = winnerId === battlerId;
  if (playerWon) {
    breakdown.winBonus = XP_CONFIG.WIN_BONUS;
  }

  // ============================================================================
  // 2. MARGIN OF VICTORY BONUS
  // ============================================================================

  if (playerWon) {
    // Count rounds won by each battler
    const playerRoundsWon = countRoundsWon(playerRounds, opponentRounds, battlerId);
    const opponentId = opponentRounds[0]?.battler_id;
    const opponentRoundsWon = opponentId
      ? countRoundsWon(opponentRounds, playerRounds, opponentId)
      : 0;

    if (playerRoundsWon === 3 && opponentRoundsWon === 0) {
      // 3-0 bodybag (dominant)
      breakdown.marginBonus = XP_CONFIG.BODYBAG_BONUS;
    } else if (playerRoundsWon === 2 && opponentRoundsWon === 1) {
      // 2-1 debatable (competitive)
      breakdown.marginBonus = XP_CONFIG.DEBATABLE_BONUS;
    }
    // 2-0 due to choke = no bonus (not a true dominance)
  }

  // ============================================================================
  // 3. PERFORMANCE BONUSES
  // ============================================================================

  // Haymaker bonus: +30 XP per round with peak_score >= 8.5
  const haymakers = playerRounds.filter((r) => r.peak_score >= 8.5).length;
  breakdown.haymakerBonus = haymakers * XP_CONFIG.HAYMAKER_BONUS;

  // Perfect consistency bonus: No chokes or stumbles in any round
  const hadChoke = playerRounds.some((r) => r.choked);
  const hadStumble = playerRounds.some((r) =>
    (r as any).event_flags ? ((r as any).event_flags as any).includes('stumbled') : false
  );
  if (!hadChoke && !hadStumble) {
    breakdown.consistencyBonus = XP_CONFIG.PERFECT_CONSISTENCY_BONUS;
  }

  // Dominant crowd bonus: Average crowd_reaction >= 85
  const avgCrowd =
    playerRounds.reduce((sum, r) => sum + r.crowd_reaction, 0) / playerRounds.length;
  if (avgCrowd >= 85) {
    breakdown.crowdBonus = XP_CONFIG.DOMINANT_CROWD_BONUS;
  }

  // ============================================================================
  // 4. CAREER MILESTONE BONUSES
  // ============================================================================

  // Award milestone bonuses at specific battle counts
  if (totalBattles === 10) {
    breakdown.milestoneBonus = XP_CONFIG.MILESTONE_10_BATTLES;
  } else if (totalBattles === 25) {
    breakdown.milestoneBonus = XP_CONFIG.MILESTONE_25_BATTLES;
  } else if (totalBattles === 50) {
    breakdown.milestoneBonus = XP_CONFIG.MILESTONE_50_BATTLES;
  } else if (totalBattles === 100) {
    breakdown.milestoneBonus = XP_CONFIG.MILESTONE_100_BATTLES;
  }

  // ============================================================================
  // TOTAL XP
  // ============================================================================

  breakdown.total =
    breakdown.base +
    breakdown.winBonus +
    breakdown.marginBonus +
    breakdown.haymakerBonus +
    breakdown.consistencyBonus +
    breakdown.crowdBonus +
    breakdown.milestoneBonus;

  return breakdown;
}

/**
 * Count rounds won by a battler
 *
 * Winner = higher average_score (primary), or higher peak_score (tiebreaker)
 */
function countRoundsWon(
  playerRounds: BattleRound[],
  opponentRounds: BattleRound[],
  battlerId: string
): number {
  let roundsWon = 0;

  for (let i = 0; i < playerRounds.length; i++) {
    const playerRound = playerRounds.find(
      (r) => r.round_index === i + 1 && r.battler_id === battlerId
    );
    const opponentRound = opponentRounds.find(
      (r) => r.round_index === i + 1 && r.battler_id !== battlerId
    );

    if (!playerRound || !opponentRound) continue;

    // Winner = higher average_score (or peak_score if tied)
    if (playerRound.average_score > opponentRound.average_score) {
      roundsWon++;
    } else if (
      playerRound.average_score === opponentRound.average_score &&
      playerRound.peak_score > opponentRound.peak_score
    ) {
      roundsWon++;
    }
  }

  return roundsWon;
}

// ============================================================================
// LEVEL-UP LOGIC
// ============================================================================

/**
 * Check if battler leveled up after earning XP
 *
 * This function:
 * 1. Calculates XP earned from battle
 * 2. Adds to battler's total XP
 * 3. Checks if level-up occurred (can level up multiple times)
 * 4. Awards skill points (2 per level)
 * 5. Updates database with new level, XP, skill points
 * 6. Records XP history entry
 */
export async function checkLevelUp(
  battleId: string,
  battlerId: string,
  supabase: any
): Promise<LevelUpResult> {
  // ============================================================================
  // 1. LOAD BATTLE DATA
  // ============================================================================

  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single();

  if (!battle || battle.status !== 'completed') {
    throw new Error(`Battle ${battleId} not completed`);
  }

  // Load rounds for both battlers
  const { data: allRounds } = await supabase
    .from('battle_rounds')
    .select('*')
    .eq('battle_id', battleId)
    .order('round_index');

  if (!allRounds || allRounds.length === 0) {
    throw new Error(`No rounds found for battle ${battleId}`);
  }

  const playerRounds = allRounds.filter((r: BattleRound) => r.battler_id === battlerId);
  const opponentRounds = allRounds.filter((r: BattleRound) => r.battler_id !== battlerId);

  // Load battler's current level and XP
  const { data: battler } = await supabase
    .from('battlers')
    .select('level, total_xp, current_level_xp, skill_points_available')
    .eq('id', battlerId)
    .single();

  if (!battler) {
    throw new Error(`Battler ${battlerId} not found`);
  }

  // Load ranking to get total battles count (for milestones)
  const { data: ranking } = await supabase
    .from('rankings')
    .select('wins, losses')
    .eq('battler_id', battlerId)
    .single();

  const totalBattles = ranking ? ranking.wins + ranking.losses : 1;

  // ============================================================================
  // 2. CALCULATE XP EARNED
  // ============================================================================

  const xpData: BattleXPData = {
    battleId,
    battlerId,
    playerRounds,
    opponentRounds,
    winnerId: battle.winner_battler_id,
    totalBattles,
  };

  const xpBreakdown = calculateBattleXP(xpData);

  // ============================================================================
  // 3. CHECK FOR LEVEL-UP
  // ============================================================================

  const previousLevel = battler.level || 1;
  const previousTotalXP = battler.total_xp || 0;
  const newTotalXP = previousTotalXP + xpBreakdown.total;

  const { level: newLevel, currentLevelXP, nextLevelXP } = getLevelFromXP(newTotalXP);

  const leveledUp = newLevel > previousLevel;
  const levelsGained = newLevel - previousLevel;
  const skillPointsEarned = levelsGained * XP_CONFIG.SKILL_POINTS_PER_LEVEL;

  // ============================================================================
  // 4. UPDATE DATABASE
  // ============================================================================

  await supabase
    .from('battlers')
    .update({
      level: newLevel,
      total_xp: newTotalXP,
      current_level_xp: currentLevelXP,
      skill_points_available: (battler.skill_points_available || 0) + skillPointsEarned,
    })
    .eq('id', battlerId);

  // ============================================================================
  // 5. RECORD XP HISTORY
  // ============================================================================

  await supabase.from('xp_history').insert({
    battler_id: battlerId,
    battle_id: battleId,
    xp_earned: xpBreakdown.total,
    source: battle.winner_battler_id === battlerId ? 'battle_win' : 'battle_loss',
    xp_breakdown: xpBreakdown,
  });

  // ============================================================================
  // 6. RETURN RESULT
  // ============================================================================

  return {
    leveledUp,
    previousLevel,
    newLevel,
    skillPointsEarned,
    xpEarned: xpBreakdown.total,
    xpBreakdown,
    nextLevelXP,
    currentLevelXP,
  };
}

// ============================================================================
// SKILL POINT VALIDATION
// ============================================================================

/**
 * Validate skill point spending
 *
 * Returns { valid: boolean, error?: string }
 */
export function validateSkillPointSpend(
  attributeName: string,
  currentSpent: Record<string, number>,
  availablePoints: number
): { valid: boolean; error?: string } {
  // Check if attribute exists
  const validAttributes = [
    'lyricism',
    'wordplay',
    'creativity',
    'stage_presence',
    'crowd_control',
    'delivery',
    'resilience',
  ];

  if (!validAttributes.includes(attributeName)) {
    return { valid: false, error: 'Invalid attribute name' };
  }

  // Check if already at max for this attribute
  const alreadySpent = currentSpent[attributeName] || 0;
  if (alreadySpent >= XP_CONFIG.MAX_SKILL_POINTS_PER_ATTRIBUTE) {
    return {
      valid: false,
      error: `Maximum ${XP_CONFIG.MAX_SKILL_POINTS_PER_ATTRIBUTE} skill points already spent on ${attributeName}`,
    };
  }

  // Check if any points available
  if (availablePoints <= 0) {
    return { valid: false, error: 'No skill points available' };
  }

  return { valid: true };
}

/**
 * Calculate attribute boost from skill points
 *
 * Each skill point = +0.1 to attribute (max 10 points = +1.0)
 */
export function calculateSkillPointBoost(skillPointsSpent: number): number {
  return skillPointsSpent * XP_CONFIG.SKILL_POINT_BOOST_AMOUNT;
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { XP_CONFIG, MAX_LEVEL, LEVEL_TIERS };
