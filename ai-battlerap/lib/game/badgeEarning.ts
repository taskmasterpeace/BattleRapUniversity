/**
 * Badge Earning System
 *
 * Analyzes battle performance and career stats to award badges.
 * Called after each battle completion to check for newly earned badges.
 *
 * IMPORTANT: Badge codes must match keys in `lib/game/badgeDescriptions.ts`
 * so the UI can render proper names, tiers, and tooltips. All codes are
 * snake_case slugs (e.g. 'crowd_favorite', not 'Crowd Favorite').
 */

import type { BattleRound, BattlerAttributes } from '@/lib/models';

export interface BadgeEarningResult {
  badgesEarned: string[];
  reason: Record<string, string>; // badge_code -> human-readable reason
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
    .select('style_tags, completed_battles_count')
    .eq('id', battlerId)
    .single();

  const currentBadges = new Set<string>(battler?.style_tags || []);

  // Get battle data
  const { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single();

  if (!battle) return result;

  // Get battle rounds (for this battler only)
  const { data: rounds } = await supabase
    .from('battle_rounds')
    .select('*')
    .eq('battle_id', battleId)
    .eq('battler_id', battlerId);

  if (!rounds || rounds.length === 0) return result;

  // Get ranking + attributes
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

  // Get prep history (last 30 days of prep activity)
  const { data: prepBlocks } = await supabase
    .from('prep_blocks')
    .select('focus, battle_id')
    .eq('battler_id', battlerId)
    .limit(200);

  // Performance metrics
  const avgScore =
    rounds.reduce((sum: number, r: BattleRound) => sum + r.average_score, 0) / rounds.length;
  const avgCrowd =
    rounds.reduce((sum: number, r: BattleRound) => sum + r.crowd_reaction, 0) / rounds.length;
  const maxPeak = Math.max(...rounds.map((r: BattleRound) => r.peak_score));
  const anyChoke = rounds.some((r: BattleRound) => r.choked);
  const wonBattle = battle.winner_battler_id === battlerId;
  const scores = rounds.map((r: BattleRound) => r.average_score);
  const variance = calculateVariance(scores);

  // Run checks
  checkPerformanceBadges(result, currentBadges, rounds, avgScore, avgCrowd, maxPeak, anyChoke, variance);
  await checkCareerBadges(result, currentBadges, ranking);
  await checkStreakBadges(result, currentBadges, ranking);
  checkAttributeBadges(result, currentBadges, attributes);
  checkOutcomeBadges(result, currentBadges, battle, rounds, battlerId, wonBattle);
  checkPrepBadges(result, currentBadges, prepBlocks || [], battle.id);

  return result;
}

/**
 * Award a badge if not already earned. Centralizes the dedupe + reason write.
 */
function award(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  code: string,
  reason: string
): void {
  if (currentBadges.has(code)) return;
  if (result.badgesEarned.includes(code)) return;
  result.badgesEarned.push(code);
  result.reason[code] = reason;
}

/**
 * Performance-based badges (from this single battle's stats)
 */
function checkPerformanceBadges(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  rounds: BattleRound[],
  avgScore: number,
  avgCrowd: number,
  maxPeak: number,
  anyChoke: boolean,
  variance: number
): void {
  // Punchline Heavy — peak ≥ 9.0
  if (maxPeak >= 9.0) {
    award(result, currentBadges, 'punchline_heavy',
      `Peak score of ${maxPeak.toFixed(1)} — devastating haymaker`);
  }

  // Crowd Favorite — avg crowd ≥ 85
  if (avgCrowd >= 85) {
    award(result, currentBadges, 'crowd_favorite',
      `Average crowd reaction ${avgCrowd.toFixed(0)}% — room went crazy`);
  }

  // Viral Sensation — peak ≥ 9.5 AND crowd ≥ 90
  if (maxPeak >= 9.5 && avgCrowd >= 90) {
    award(result, currentBadges, 'viral_sensation',
      `Career moment: ${maxPeak.toFixed(1)} peak with ${avgCrowd.toFixed(0)}% crowd`);
  }

  // Consistent Performer — low variance + decent score
  if (variance < 0.5 && avgScore >= 7.0) {
    award(result, currentBadges, 'consistent_performer',
      `Locked in across all rounds (variance ${variance.toFixed(2)})`);
  }

  // Clutch Performer — no chokes despite pressure (>=7.5 avg)
  if (!anyChoke && avgScore >= 7.5) {
    award(result, currentBadges, 'clutch_performer',
      'Stayed locked in under pressure — no chokes, high output');
  }

  // Choker — choked AND lost the round badly
  if (anyChoke) {
    const chokedRounds = rounds.filter((r: BattleRound) => r.choked).length;
    if (chokedRounds >= 2) {
      award(result, currentBadges, 'choker',
        `Choked in ${chokedRounds} rounds — that's a stain`);
    }
  }
}

/**
 * Career milestone badges (lifetime stats)
 */
async function checkCareerBadges(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  ranking: any
): Promise<void> {
  const totalBattles = (ranking?.wins || 0) + (ranking?.losses || 0);

  // Respected Veteran — 25+ battles
  if (totalBattles >= 25) {
    award(result, currentBadges, 'respected_veteran',
      `${totalBattles} career battles — earned respect`);
  }

  // Consistent Grinder — 50+ battles
  if (totalBattles >= 50) {
    award(result, currentBadges, 'consistent_grinder',
      `${totalBattles} career battles — pure dedication`);
  }

  // Consummate Professional — 70%+ win rate with 20+ battles
  if (totalBattles >= 20) {
    const winRate = (ranking?.wins || 0) / totalBattles;
    if (winRate >= 0.70) {
      award(result, currentBadges, 'consummate_professional',
        `${Math.round(winRate * 100)}% win rate over ${totalBattles} battles`);
    }
  }

  // Fallen Star — was on top (rating 1500+) and now dropped below 1250
  if (ranking?.rating && ranking.rating < 1250 && (ranking.peak_rating || 0) >= 1500) {
    award(result, currentBadges, 'fallen_star',
      `Peaked at ${ranking.peak_rating}, now at ${ranking.rating}`);
  }
}

/**
 * Win/loss streak badges
 */
async function checkStreakBadges(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  ranking: any
): Promise<void> {
  const streak = ranking?.streak || 0;

  // Main Stage Specialist — 5+ win streak
  if (streak >= 5) {
    award(result, currentBadges, 'main_stage_specialist',
      `${streak} win streak — unstoppable force`);
  }

  // Known Choker — 3+ loss streak
  if (streak <= -3) {
    award(result, currentBadges, 'choker',
      `${Math.abs(streak)} loss streak — confidence shattered`);
  }
}

/**
 * Attribute-based badges (skills crossing thresholds)
 */
function checkAttributeBadges(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  attributes: BattlerAttributes | null
): void {
  if (!attributes) return;

  // Wordplay — wordplay ≥ 7.5
  if ((attributes.writing?.wordplay ?? 0) >= 7.5) {
    award(result, currentBadges, 'wordplay',
      `Wordplay reached ${attributes.writing.wordplay.toFixed(1)}`);
  }

  // Scheme King — lyricism ≥ 8.5 AND creativity ≥ 7.5
  if ((attributes.writing?.lyricism ?? 0) >= 8.5 && (attributes.writing?.creativity ?? 0) >= 7.5) {
    award(result, currentBadges, 'scheme_king',
      `Lyricism ${attributes.writing.lyricism.toFixed(1)} + creativity ${attributes.writing.creativity.toFixed(1)}`);
  }

  // Pen Game Elite — lyricism ≥ 9.0
  if ((attributes.writing?.lyricism ?? 0) >= 9.0) {
    award(result, currentBadges, 'pen_game_elite',
      `Elite-tier lyricism (${attributes.writing.lyricism.toFixed(1)})`);
  }

  // Metaphor Magician — creativity ≥ 8.0
  if ((attributes.writing?.creativity ?? 0) >= 8.0) {
    award(result, currentBadges, 'metaphor_magician',
      `Creativity reached ${attributes.writing.creativity.toFixed(1)}`);
  }

  // Stage Presence — stage_presence ≥ 8.0
  if ((attributes.performance?.stage_presence ?? 0) >= 8.0) {
    award(result, currentBadges, 'stage_presence',
      `Stage presence reached ${attributes.performance.stage_presence.toFixed(1)}`);
  }

  // Crowd Control — crowd_control ≥ 8.0
  if ((attributes.performance?.crowd_control ?? 0) >= 8.0) {
    award(result, currentBadges, 'crowd_control',
      `Crowd control reached ${attributes.performance.crowd_control.toFixed(1)}`);
  }

  // Smooth Flow — delivery ≥ 8.0
  if ((attributes.performance?.delivery ?? 0) >= 8.0) {
    award(result, currentBadges, 'smooth_flow',
      `Delivery reached ${attributes.performance.delivery.toFixed(1)}`);
  }

  // Performance Beast — stage_presence ≥ 8.5 AND crowd_control ≥ 8.0
  if (
    (attributes.performance?.stage_presence ?? 0) >= 8.5 &&
    (attributes.performance?.crowd_control ?? 0) >= 8.0
  ) {
    award(result, currentBadges, 'performance_beast',
      'Elite performance — dominant stage + crowd command');
  }
}

/**
 * Outcome-shape badges (3-0 sweep, comeback, etc.)
 */
function checkOutcomeBadges(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  battle: any,
  rounds: BattleRound[],
  battlerId: string,
  wonBattle: boolean
): void {
  // Count rounds won by comparing this battler's avg vs opponent's avg per round
  // rounds passed in are this battler's only — need opponent's rounds separately
  // Approach: rely on round.average_score >= threshold per round as proxy
  // (true cross-comparison requires another query; skipping for performance)

  if (!wonBattle) return;

  const roundsWon = rounds.filter((r: BattleRound) => r.average_score >= 7.0).length;

  // Battle of the Night Winner — won AND swept (all rounds strong)
  if (roundsWon === rounds.length && rounds.length >= 3) {
    award(result, currentBadges, 'battle_of_the_night_winner',
      'Dominant sweep — battle of the night material');
  }

  // Believable Persona — won despite weak first round
  const round1 = rounds.find((r: BattleRound) => r.round_index === 1);
  if (round1 && round1.average_score < 6.5) {
    award(result, currentBadges, 'believable_persona',
      'Came back after a rough start — believable, undeniable');
  }
}

/**
 * Prep-related badges (how the player prepares for battles)
 */
function checkPrepBadges(
  result: BadgeEarningResult,
  currentBadges: Set<string>,
  prepBlocks: { focus: string; battle_id: string }[],
  thisBattleId: string
): void {
  const blocksForThisBattle = prepBlocks.filter((b) => b.battle_id === thisBattleId);

  // Prepared Battler — 5+ prep blocks for this battle, no "rest"-only prep
  const writeBlocks = blocksForThisBattle.filter((b) => b.focus === 'writing').length;
  if (writeBlocks >= 5) {
    award(result, currentBadges, 'prepared_battler',
      `${writeBlocks} days of writing prep — homework was done`);
  }

  // Overprepared — 8+ prep blocks across writing/research
  const seriousBlocks = blocksForThisBattle.filter(
    (b) => b.focus === 'writing' || b.focus === 'research'
  ).length;
  if (seriousBlocks >= 8) {
    award(result, currentBadges, 'overprepared',
      `${seriousBlocks} days of serious prep — left nothing to chance`);
  }
}

/**
 * Apply earned badges to battler (writes style_tags array on battlers table)
 */
export async function applyEarnedBadges(
  battlerId: string,
  badgesEarned: string[],
  supabase: any
): Promise<void> {
  if (badgesEarned.length === 0) return;

  const { data: battler } = await supabase
    .from('battlers')
    .select('style_tags')
    .eq('id', battlerId)
    .single();

  const currentBadges = battler?.style_tags || [];
  const updatedBadges = Array.from(new Set([...currentBadges, ...badgesEarned]));

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
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}
