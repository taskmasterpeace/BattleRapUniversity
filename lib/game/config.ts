// Battle Rap University - Simulation Configuration
// All balance constants centralized for easy tuning
//
// BALANCE TARGETS (validated via simulation):
// - Upset Rate: 10-20% (lower-rated beating higher-rated)
// - Body Rate (3-0): 20-30%
// - Debatable Rate (2-1 close): 40-50%
// - Choke Rate: 5-15% per battle
// - Stumble Rate: ~40% of battles

export const SIMULATION_CONFIG = {
  // === SEGMENT SCORING ===
  SEGMENT_VARIANCE: 0.12, // Random variance per segment (±12%) - reduced from 15%
  SCORE_FLOOR: 1.0, // Minimum possible score
  SCORE_CEILING: 10.0, // Maximum possible score

  // === ATTRIBUTE ADVANTAGE SCALING ===
  // Higher attributes should more consistently translate to wins
  ATTRIBUTE_ADVANTAGE_MULTIPLIER: 1.15, // Amplifies attribute gaps
  ATTRIBUTE_CONSISTENCY_BONUS: 0.02, // Each point above 7 reduces variance by 2%
  ATTRIBUTE_MINIMUM_ADVANTAGE: 0.05, // Even 1-point attribute lead = 5% minimum edge

  // === CHOKE MECHANICS ===
  CHOKE_BASE_PROBABILITY: 0.015, // 1.5% per segment base
  CHOKE_MINIMUM: 0.007, // 0.7% floor (ensures ~7% per battle)
  CHOKE_MAXIMUM: 0.25, // 25% cap
  CHOKE_SCORE_MULTIPLIER: 0.15, // 85% penalty when choked
  CHOKE_RESILIENCE_FACTOR: 0.008, // Resilience reduction per point above 5
  CHOKE_PREP_REDUCTION: 0.003, // Writing prep reduces choke per day

  // === STUMBLE MECHANICS ===
  STUMBLE_BASE_PROBABILITY: 0.050, // 5% per segment
  STUMBLE_MINIMUM: 0.010, // 1% floor
  STUMBLE_MAXIMUM: 0.15, // 15% cap
  STUMBLE_SCORE_MULTIPLIER: 0.85, // 15% penalty on stumble
  STUMBLE_RECOVERY_MULTIPLIER: 0.90, // 10% penalty with good recovery
  STUMBLE_PREP_REDUCTION: 0.005, // Performance prep reduces

  // === PREP EFFECTS ===
  PREP_EFFECT_MULTIPLIER: 0.20, // Base improvement per prep day
  NO_SHOW_PENALTY: 0.5, // 50% stats reduction for no-show

  // === COUNTER MECHANICS (V2) ===
  COUNTER_TRIGGERED_MULTIPLIER: 1.5, // 150% if counter triggers
  COUNTER_MISSED_MULTIPLIER: 0.5, // 50% if counter fails
  COUNTER_BASE_TRIGGER_CHANCE: 0.40, // 40% chance opponent uses expected content

  // === ROUND SCORING ===
  ROUND_JUDGING_AVERAGE_WEIGHT: 0.40, // 40% weight on average
  ROUND_JUDGING_PEAK_WEIGHT: 0.35, // 35% weight on peak
  ROUND_JUDGING_CROWD_WEIGHT: 0.25, // 25% weight on crowd
  ROUND_JUDGING_CROWD_SCALE: 10, // Scale crowd (0-100) to score range

  // === DECISION CLASSIFICATION ===
  DECISION_BODYBAG_THRESHOLD: 3.0, // 3+ point margin = bodybag
  DECISION_CLASSIC_THRESHOLD: 2.0, // 2-3 point margin = clean sweep
  DECISION_CLASSIC_CROWD_MIN: 70, // 70+ avg crowd for "classic" 2-1

  // === RATING/ELO ===
  RATING_K_FACTOR: 32, // Standard ELO K-factor

  // === MOMENTUM SWING SYSTEM ===
  MOMENTUM_STARTING: 50, // Neutral momentum (0-100 scale)
  MOMENTUM_MIN: 0, // Minimum momentum (opponent dominating)
  MOMENTUM_MAX: 100, // Maximum momentum (player dominating)

  // Momentum gain/loss per segment based on relative performance
  MOMENTUM_GAIN_MULTIPLIER: 8, // Points gained per score differential
  MOMENTUM_HAYMAKER_BONUS: 15, // Extra momentum for haymaker (8.5+ score)
  MOMENTUM_CHOKE_PENALTY: 25, // Momentum lost when choking
  MOMENTUM_STUMBLE_PENALTY: 10, // Momentum lost when stumbling

  // Momentum effects on gameplay
  MOMENTUM_CHOKE_MODIFIER: 0.003, // Each point below 50 adds +0.3% choke risk
  MOMENTUM_CROWD_MODIFIER: 0.4, // Each momentum point above 50 adds +0.4% crowd reaction
  MOMENTUM_COMEBACK_THRESHOLD: 25, // Below this momentum, haymakers gain bonus
  MOMENTUM_COMEBACK_BONUS: 1.25, // 25% score boost on haymakers when behind

  // Momentum decay between rounds
  MOMENTUM_ROUND_DECAY: 0.15, // Momentum trends back toward 50 by 15% between rounds
}
