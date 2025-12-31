/**
 * Badge Earning System
 *
 * Analyzes battle performance and career stats to award badges.
 * Called after each battle completion to check for newly earned badges.
 */

import type { BattleRound, BattlerAttributes } from '@/lib/models';

export interface BadgeEarningResult {
  badgesEarned: string[];
  reason: Record<string, string>; // badge -> reason for earning
}

/**
 * Check for newly earned badges after a battle
 */
export async function checkBadgeEarning(
  battleId: string,
  battlerId: string,
  supabase: any
): Promise<BadgeEarningResult> {
  const result: BadgeEarningResult = {
    badgesEarned: [],
    reason: {},
  };

  // Get current badges
  const { data: battler } = await supabase
    .from('battlers')
    .select('style_tags')
    .eq('id', battlerId)
    .single();

  const currentBadges = new Set<string>(battler?.style_tags || []);

  // Get battle data
  const { data: battle } = await supabase
    .from('battles')
    .select('*, battler_a:battler_a_id(*), battler_b:battler_b_id(*)')
    .eq('id', battleId)
    .single();

  if (!battle) return result;

  // Get battle rounds
  const { data: rounds } = await supabase
    .from('battle_rounds')
    .select('*')
    .eq('battle_id', battleId)
    .eq('battler_id', battlerId);

  if (!rounds || rounds.length === 0) return result;

  // Get battler stats
  const { data: ranking } = await supabase
    .from('rankings')
    .select('*')
    .eq('battler_id', battlerId)
    .single();

  const { data: attributes } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', battlerId)
    .single();

  // Calculate performance metrics
  const avgScore = rounds.reduce((sum: number, r: BattleRound) => sum + r.average_score, 0) / rounds.length;
  const avgCrowd = rounds.reduce((sum: number, r: BattleRound) => sum + r.crowd_reaction, 0) / rounds.length;
  const maxPeak = Math.max(...rounds.map((r: BattleRound) => r.peak_score));
  const anyChoke = rounds.some((r: BattleRound) => r.choked);
  const wonBattle = battle.winner_battler_id === battlerId;

  // Check performance-based badges
  checkPerformanceBadges(result, currentBadges, rounds, avgScore, avgCrowd, maxPeak, anyChoke);

  // Check career milestone badges
  await checkCareerBadges(result, currentBadges, ranking, supabase, battlerId);

  // Check win streak badges
  await checkStreakBadges(result, currentBadges, ranking);

  // Check attribute-based badges
  checkAttributeBadges(result, currentBadges, attributes);

  // Check battle outcome badges
  checkOutcomeBadges(result, currentBadges, battle, rounds, battlerId);

  return result;
}

/**
 * Check for performance-based badges earned in this battle
 */
function checkPerformanceBadges(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  rounds: BattleRound[],
  avgScore: number,
  avgCrowd: number,
  maxPeak: number,
  anyChoke: boolean
): void {
  // Haymaker King/Queen - exceptional peak performance (9.0+ peak)
  if (maxPeak >= 9.0 && !currentBadges.has('Punchline King/Queen')) {
    result.badgesEarned.push('Punchline King/Queen');
    result.reason['Punchline King/Queen'] = `Peak score of ${maxPeak.toFixed(1)} - devastating haymaker`;
  }

  // Crowd Favorite - exceptional crowd reaction (85+)
  if (avgCrowd >= 85 && !currentBadges.has('Crowd Favorite')) {
    result.badgesEarned.push('Crowd Favorite');
    result.reason['Crowd Favorite'] = `Average crowd reaction of ${avgCrowd.toFixed(0)}% - room went crazy`;
  }

  // Consistent Writer - high consistency across rounds
  const scores = rounds.map(r => r.average_score);
  const variance = calculateVariance(scores);
  if (variance < 0.5 && avgScore >= 7.0 && !currentBadges.has('Consistent Writer')) {
    result.badgesEarned.push('Consistent Writer');
    result.reason['Consistent Writer'] = `Extremely consistent performance (variance ${variance.toFixed(2)})`;
  }

  // Clutch Performer - no chokes in high-pressure battle
  if (!anyChoke && avgScore >= 7.5 && !currentBadges.has('Clutch Performer')) {
    result.badgesEarned.push('Clutch Performer');
    result.reason['Clutch Performer'] = 'Performed under pressure without choking';
  }
}

/**
 * Check for career milestone badges
 */
async function checkCareerBadges(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  ranking: any,
  supabase: any,
  battlerId: string
): Promise<void> {
  const totalBattles = (ranking?.wins || 0) + (ranking?.losses || 0);

  // Veteran - 50 battles
  if (totalBattles >= 50 && !currentBadges.has('Respected Veteran')) {
    result.badgesEarned.push('Respected Veteran');
    result.reason['Respected Veteran'] = `Reached ${totalBattles} career battles`;
  }

  // Century Club - 100 battles
  if (totalBattles >= 100 && !currentBadges.has('Battle Technician')) {
    result.badgesEarned.push('Battle Technician');
    result.reason['Battle Technician'] = `Reached ${totalBattles} career battles - true veteran`;
  }

  // High win rate badge (70%+ with 20+ battles)
  if (totalBattles >= 20) {
    const winRate = (ranking?.wins || 0) / totalBattles;
    if (winRate >= 0.70 && !currentBadges.has('Consummate Professional')) {
      result.badgesEarned.push('Consummate Professional');
      result.reason['Consummate Professional'] = `${Math.round(winRate * 100)}% win rate over ${totalBattles} battles`;
    }
  }
}

/**
 * Check for win streak badges
 */
async function checkStreakBadges(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  ranking: any
): Promise<void> {
  const streak = ranking?.streak || 0;

  // Hot Streak - 3 wins in a row
  if (streak >= 3 && streak < 5 && !currentBadges.has('Resilient Battler')) {
    result.badgesEarned.push('Resilient Battler');
    result.reason['Resilient Battler'] = `${streak} win streak - momentum building`;
  }

  // Unstoppable - 5 wins in a row
  if (streak >= 5 && !currentBadges.has('Big Stage Performer')) {
    result.badgesEarned.push('Big Stage Performer');
    result.reason['Big Stage Performer'] = `${streak} win streak - unstoppable force`;
  }

  // Known Choker - 3+ loss streak
  if (streak <= -3 && !currentBadges.has('Known Choker')) {
    result.badgesEarned.push('Known Choker');
    result.reason['Known Choker'] = `${Math.abs(streak)} loss streak - confidence shattered`;
  }
}

/**
 * Check for attribute-based badges
 */
function checkAttributeBadges(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  attributes: BattlerAttributes | null
): void {
  if (!attributes) return;

  // Wordsmith - high wordplay (8.0+)
  if (attributes.writing?.wordplay >= 8.0 && !currentBadges.has('Wordplay Wizard')) {
    result.badgesEarned.push('Wordplay Wizard');
    result.reason['Wordplay Wizard'] = `Wordplay skill reached ${attributes.writing.wordplay.toFixed(1)}`;
  }

  // Scheme Specialist - high lyricism (8.0+)
  if (attributes.writing?.lyricism >= 8.0 && !currentBadges.has('Scheme Specialist')) {
    result.badgesEarned.push('Scheme Specialist');
    result.reason['Scheme Specialist'] = `Lyricism skill reached ${attributes.writing.lyricism.toFixed(1)}`;
  }

  // Creative Beast - high creativity (8.0+)
  if (attributes.writing?.creativity >= 8.0 && !currentBadges.has('Creativity Beast')) {
    result.badgesEarned.push('Creativity Beast');
    result.reason['Creativity Beast'] = `Creativity skill reached ${attributes.writing.creativity.toFixed(1)}`;
  }

  // Stage Domination - high stage presence (8.0+)
  if (attributes.performance?.stage_presence >= 8.0 && !currentBadges.has('Stage Domination')) {
    result.badgesEarned.push('Stage Domination');
    result.reason['Stage Domination'] = `Stage presence reached ${attributes.performance.stage_presence.toFixed(1)}`;
  }

  // Charismatic - high crowd control (8.0+)
  if (attributes.performance?.crowd_control >= 8.0 && !currentBadges.has('Charismatic')) {
    result.badgesEarned.push('Charismatic');
    result.reason['Charismatic'] = `Crowd control reached ${attributes.performance.crowd_control.toFixed(1)}`;
  }

  // Smooth Flow - high delivery (8.0+)
  if (attributes.performance?.delivery >= 8.0 && !currentBadges.has('Smooth Flow')) {
    result.badgesEarned.push('Smooth Flow');
    result.reason['Smooth Flow'] = `Delivery skill reached ${attributes.performance.delivery.toFixed(1)}`;
  }
}

/**
 * Check for battle outcome badges
 */
function checkOutcomeBadges(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  battle: any,
  rounds: BattleRound[],
  battlerId: string
): void {
  const wonBattle = battle.winner_battler_id === battlerId;
  const playerRounds = rounds.filter((r: BattleRound) => r.battler_id === battlerId);
  const opponentRounds = rounds.filter((r: BattleRound) => r.battler_id !== battlerId);

  // Calculate rounds won by comparing average scores
  let roundsWon = 0;
  for (let i = 0; i < 3; i++) {
    const playerRound = playerRounds.find((r: BattleRound) => r.round_index === i + 1);
    const opponentRound = opponentRounds.find((r: BattleRound) => r.round_index === i + 1);
    if (playerRound && opponentRound && playerRound.average_score > opponentRound.average_score) {
      roundsWon++;
    }
  }

  // Dominant Performer - 3-0 victory
  if (wonBattle && roundsWon === 3 && !currentBadges.has('Battle of the Night Winner')) {
    result.badgesEarned.push('Battle of the Night Winner');
    result.reason['Battle of the Night Winner'] = '3-0 dominant victory - complete bodybag';
  }

  // Comeback King - won after losing first round
  if (wonBattle && roundsWon === 2) {
    const playerRound1 = playerRounds.find((r: BattleRound) => r.round_index === 1);
    const opponentRound1 = opponentRounds.find((r: BattleRound) => r.round_index === 1);
    const firstRoundLost = playerRound1 && opponentRound1 && playerRound1.average_score < opponentRound1.average_score;
    if (firstRoundLost && !currentBadges.has('Believable Persona')) {
      result.badgesEarned.push('Believable Persona');
      result.reason['Believable Persona'] = 'Came back from first round deficit to win';
    }
  }
}

/**
 * Apply earned badges to battler
 */
export async function applyEarnedBadges(
  battlerId: string,
  badgesEarned: string[],
  supabase: any
): Promise<void> {
  if (badgesEarned.length === 0) return;

  // Get current badges
  const { data: battler } = await supabase
    .from('battlers')
    .select('style_tags')
    .eq('id', battlerId)
    .single();

  const currentBadges = battler?.style_tags || [];
  const updatedBadges = [...new Set([...currentBadges, ...badgesEarned])];

  // Update battler with new badges
  await supabase
    .from('battlers')
    .update({
      style_tags: updatedBadges,
      updated_at: new Date().toISOString(),
    })
    .eq('id', battlerId);

  console.log(`Applied ${badgesEarned.length} new badges to battler ${battlerId}:`, badgesEarned);
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}
