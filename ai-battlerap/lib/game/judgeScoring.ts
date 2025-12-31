/**
 * Judge Scoring Engine
 *
 * Evaluates battle rounds from a judge's perspective using TWO-LEVEL evaluation:
 * 1. STATIC BADGE BIAS: What badges the battler has (pre-battle evaluation)
 * 2. DYNAMIC CONTENT EVALUATION: What the battler actually did in each segment
 *
 * This ensures judges respect badges BUT also score based on actual performance.
 * Example: A judge who dislikes freestyles will penalize a freestyler, but if the
 * freestyler uses technical schemes in this battle, they get credit for that too.
 */

import type { JudgeProfile } from './judgePreferences';
import {
  calculateBadgeBiasScore,
  calculateContentPreferenceScore,
} from './judgePreferences';
import type { ContentType, DeliveryType, PerformanceType } from './contentTypes';
import type { BattleRound, BattleSegment } from '@/lib/models';

// ============================================================================
// Interfaces
// ============================================================================

export interface JudgeRoundEvaluation {
  judge_id: string;
  judge_name: string;
  round_index: number;
  battler_id: string;

  // Component scores (1-10 scale, like the simulation)
  base_average_score: number;        // From simulation
  base_peak_score: number;           // From simulation
  base_crowd_reaction: number;       // From simulation (0-100, scaled to 0-15)

  // Judge modifiers
  badge_bias_modifier: number;       // -1.0 to +1.0 (applied to all scores)
  content_preference_modifier: number; // -1.0 to +1.0 (applied to all scores)
  combined_modifier: number;         // badge + content biases combined

  // Judge-adjusted scores
  judge_average_score: number;       // base_average + modifiers
  judge_peak_score: number;          // base_peak + modifiers
  judge_crowd_reaction: number;      // base_crowd + modifiers

  // Judge's composite score (using judge's weights)
  judge_composite_score: number;     // Weighted combination

  // Detailed segment evaluations
  segment_evaluations: JudgeSegmentEvaluation[];
}

export interface JudgeSegmentEvaluation {
  segment_index: number;
  base_score: number;                // Raw segment score from simulation
  content_preference_score: number;  // Judge's preference for this content
  adjusted_score: number;            // base + preference
}

export interface JudgeBattleEvaluation {
  judge_id: string;
  judge_name: string;
  battle_id: string;
  battler_id: string;

  // Round evaluations
  round_evaluations: JudgeRoundEvaluation[];

  // Overall assessment
  rounds_won: number;                // How many rounds the judge gave this battler
  overall_composite_average: number; // Average composite across rounds
  winner: boolean;                   // Did this judge score this battler as winner?
}

// ============================================================================
// Judge Scoring Functions
// ============================================================================

/**
 * Score a single round from a judge's perspective
 */
export function scoreRoundWithJudge(
  judge: JudgeProfile,
  roundData: BattleRound,
  segmentData: BattleSegment[],
  battlerBadges: string[],
  opponentCompositeScore: number | null = null
): JudgeRoundEvaluation {

  // PHASE 1: Calculate static badge bias
  const badgeBias = calculateBadgeBiasScore(battlerBadges, judge);

  // PHASE 2: Calculate dynamic content preferences for each segment
  const segmentEvaluations: JudgeSegmentEvaluation[] = [];
  let totalContentPreference = 0;

  for (const segment of segmentData) {
    // Skip if segment doesn't have content data yet
    const seg = segment as any;
    if (!seg.primary_content_type || !seg.delivery_type || !seg.performance_type) {
      continue;
    }

    const contentPreference = calculateContentPreferenceScore(
      seg.primary_content_type as ContentType,
      seg.secondary_content_type as ContentType | null,
      seg.delivery_type as DeliveryType,
      seg.performance_type as PerformanceType,
      judge
    );

    totalContentPreference += contentPreference;

    const adjustedScore = segment.segment_score * (1 + contentPreference * 0.2); // ±20% based on preference

    segmentEvaluations.push({
      segment_index: segment.segment_index,
      base_score: segment.segment_score,
      content_preference_score: contentPreference,
      adjusted_score: Math.max(0, Math.min(10, adjustedScore)),
    });
  }

  // Average content preference across all segments
  const avgContentPreference = segmentEvaluations.length > 0
    ? totalContentPreference / segmentEvaluations.length
    : 0;

  // PHASE 3: Combine biases
  // Badge bias = static evaluation (what they are)
  // Content preference = dynamic evaluation (what they did)
  // Combined: 40% badge bias + 60% content preference (favor what they actually did)
  const combinedModifier = (badgeBias * 0.4) + (avgContentPreference * 0.6);

  // PHASE 4: Apply modifiers to base scores
  // Modifiers affect scores by up to ±20%
  const modifierMultiplier = 1 + (combinedModifier * 0.2);

  const judgeAverageScore = Math.max(0, Math.min(10,
    roundData.average_score * modifierMultiplier
  ));

  const judgePeakScore = Math.max(0, Math.min(10,
    roundData.peak_score * modifierMultiplier
  ));

  const judgeCrowdReaction = Math.max(0, Math.min(100,
    roundData.crowd_reaction * modifierMultiplier
  ));

  // PHASE 5: Calculate judge's composite score using judge's weights
  const normalizedCrowd = (judgeCrowdReaction / 100) * 15; // Scale to 0-15

  const judgeCompositeScore =
    (judgeAverageScore * judge.scoring_weights.average_weight) +
    (judgePeakScore * judge.scoring_weights.peak_weight) +
    (normalizedCrowd * judge.scoring_weights.crowd_weight);

  return {
    judge_id: judge.judge_id,
    judge_name: judge.judge_name,
    round_index: roundData.round_index,
    battler_id: roundData.battler_id,

    base_average_score: roundData.average_score,
    base_peak_score: roundData.peak_score,
    base_crowd_reaction: roundData.crowd_reaction,

    badge_bias_modifier: badgeBias,
    content_preference_modifier: avgContentPreference,
    combined_modifier: combinedModifier,

    judge_average_score: judgeAverageScore,
    judge_peak_score: judgePeakScore,
    judge_crowd_reaction: judgeCrowdReaction,

    judge_composite_score: judgeCompositeScore,

    segment_evaluations: segmentEvaluations,
  };
}

/**
 * Score an entire battle (3 rounds) from a judge's perspective
 * Returns winner determination and round breakdown
 */
export function scoreBattleWithJudge(
  judge: JudgeProfile,
  battleId: string,
  battlerId: string,
  battlerBadges: string[],
  rounds: BattleRound[],
  segments: BattleSegment[],
  opponentRounds: BattleRound[],
  opponentSegments: BattleSegment[],
  opponentBadges: string[]
): JudgeBattleEvaluation {

  const roundEvaluations: JudgeRoundEvaluation[] = [];
  let roundsWon = 0;

  // Score each round
  for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
    const roundData = rounds[roundIndex];
    // Round index in DB is 1-indexed (1, 2, 3), not 0-indexed
    const dbRoundIndex = roundData.round_index;
    const roundSegments = segments.filter(s => s.round_index === dbRoundIndex);

    // Score this battler's round
    const battlerEval = scoreRoundWithJudge(
      judge,
      roundData,
      roundSegments,
      battlerBadges
    );

    // Score opponent's round
    const opponentRoundData = opponentRounds[roundIndex];
    const opponentRoundSegments = opponentSegments.filter(s => s.round_index === dbRoundIndex);

    const opponentEval = scoreRoundWithJudge(
      judge,
      opponentRoundData,
      opponentRoundSegments,
      opponentBadges
    );

    // Determine round winner based on judge's composite scores
    if (battlerEval.judge_composite_score > opponentEval.judge_composite_score) {
      roundsWon++;
    }

    roundEvaluations.push(battlerEval);
  }

  // Calculate overall stats
  const overallCompositeAverage = roundEvaluations.reduce(
    (sum, r) => sum + r.judge_composite_score,
    0
  ) / roundEvaluations.length;

  // Winner determination: best 2 out of 3
  const winner = roundsWon >= 2;

  return {
    judge_id: judge.judge_id,
    judge_name: judge.judge_name,
    battle_id: battleId,
    battler_id: battlerId,
    round_evaluations: roundEvaluations,
    rounds_won: roundsWon,
    overall_composite_average: overallCompositeAverage,
    winner,
  };
}

/**
 * Score a tournament battle with all 3 judges
 * Returns full scorecard with winner determination
 */
export interface TournamentBattleScorecard {
  battle_id: string;
  player_battler_id: string;
  opponent_battler_id: string;

  // Judge evaluations
  judge_evaluations: {
    player: JudgeBattleEvaluation[];
    opponent: JudgeBattleEvaluation[];
  };

  // Winner determination
  player_judge_votes: number;    // How many judges scored for player
  opponent_judge_votes: number;  // How many judges scored for opponent
  winner_battler_id: string;     // Who won (majority decision)
  decision_type: 'unanimous' | 'split'; // 3-0 or 2-1

  // Round-by-round scorecard
  round_scorecards: Array<{
    round_index: number;
    player_judges_won: number;   // How many judges gave this round to player
    opponent_judges_won: number;
  }>;
}

export function scoreTournamentBattle(
  battleId: string,
  judges: JudgeProfile[],
  playerBattlerId: string,
  playerBadges: string[],
  playerRounds: BattleRound[],
  playerSegments: BattleSegment[],
  opponentBattlerId: string,
  opponentBadges: string[],
  opponentRounds: BattleRound[],
  opponentSegments: BattleSegment[]
): TournamentBattleScorecard {

  const playerEvaluations: JudgeBattleEvaluation[] = [];
  const opponentEvaluations: JudgeBattleEvaluation[] = [];

  // Score battle from each judge's perspective
  for (const judge of judges) {
    const playerEval = scoreBattleWithJudge(
      judge,
      battleId,
      playerBattlerId,
      playerBadges,
      playerRounds,
      playerSegments,
      opponentRounds,
      opponentSegments,
      opponentBadges
    );

    const opponentEval = scoreBattleWithJudge(
      judge,
      battleId,
      opponentBattlerId,
      opponentBadges,
      opponentRounds,
      opponentSegments,
      playerRounds,
      playerSegments,
      playerBadges
    );

    playerEvaluations.push(playerEval);
    opponentEvaluations.push(opponentEval);
  }

  // Count judge votes
  let playerJudgeVotes = 0;
  let opponentJudgeVotes = 0;

  for (const playerEval of playerEvaluations) {
    if (playerEval.winner) {
      playerJudgeVotes++;
    } else {
      opponentJudgeVotes++;
    }
  }

  // Determine winner (majority)
  const winnerBattlerId = playerJudgeVotes >= 2 ? playerBattlerId : opponentBattlerId;
  const decisionType = playerJudgeVotes === 3 || opponentJudgeVotes === 3 ? 'unanimous' : 'split';

  // Round-by-round breakdown
  const roundScorecards = [];
  for (let roundIndex = 0; roundIndex < 3; roundIndex++) {
    let playerJudgesWon = 0;
    let opponentJudgesWon = 0;

    for (let judgeIndex = 0; judgeIndex < judges.length; judgeIndex++) {
      const playerRoundEval = playerEvaluations[judgeIndex].round_evaluations[roundIndex];
      const opponentRoundEval = opponentEvaluations[judgeIndex].round_evaluations[roundIndex];

      if (playerRoundEval.judge_composite_score > opponentRoundEval.judge_composite_score) {
        playerJudgesWon++;
      } else {
        opponentJudgesWon++;
      }
    }

    roundScorecards.push({
      round_index: roundIndex + 1, // DB uses 1-indexed rounds
      player_judges_won: playerJudgesWon,
      opponent_judges_won: opponentJudgesWon,
    });
  }

  return {
    battle_id: battleId,
    player_battler_id: playerBattlerId,
    opponent_battler_id: opponentBattlerId,
    judge_evaluations: {
      player: playerEvaluations,
      opponent: opponentEvaluations,
    },
    player_judge_votes: playerJudgeVotes,
    opponent_judge_votes: opponentJudgeVotes,
    winner_battler_id: winnerBattlerId,
    decision_type: decisionType,
    round_scorecards: roundScorecards,
  };
}

/**
 * Get human-readable scorecard summary
 */
export function formatScorecard(scorecard: TournamentBattleScorecard): string {
  const lines = [];

  lines.push(`TOURNAMENT BATTLE: ${scorecard.battle_id}`);
  lines.push(`WINNER: ${scorecard.winner_battler_id}`);
  lines.push(`DECISION: ${scorecard.decision_type} (${scorecard.player_judge_votes}-${scorecard.opponent_judge_votes})`);
  lines.push('');
  lines.push('ROUND-BY-ROUND:');

  for (const round of scorecard.round_scorecards) {
    lines.push(
      `  Round ${round.round_index}: ${round.player_judges_won}-${round.opponent_judges_won}`
    );
  }

  lines.push('');
  lines.push('JUDGE SCORECARDS:');

  for (let i = 0; i < scorecard.judge_evaluations.player.length; i++) {
    const playerEval = scorecard.judge_evaluations.player[i];
    const opponentEval = scorecard.judge_evaluations.opponent[i];

    lines.push(`  ${playerEval.judge_name}:`);
    lines.push(`    ${scorecard.player_battler_id}: ${playerEval.rounds_won} rounds`);
    lines.push(`    ${scorecard.opponent_battler_id}: ${opponentEval.rounds_won} rounds`);
    lines.push(`    Scored for: ${playerEval.winner ? scorecard.player_battler_id : scorecard.opponent_battler_id}`);
  }

  return lines.join('\n');
}
