/**
 * Battle Simulation Configuration
 *
 * These constants control battle simulation balance and can be tuned
 * based on playtesting results.
 *
 * IMPORTANT: After changing these values, run bulk validation:
 * npm run test:bulk-validation
 *
 * Target metrics (from battle rap culture research):
 * - Body rate (3-0 dominant): 20-30%
 * - Debatable rate (2-1 close): 40-50%
 * - Upset rate (underdog wins): 10-20%
 * - Choke rate: 5-15%
 */

export const SIMULATION_CONFIG = {
  // ============================================================================
  // PREP SYSTEM
  // ============================================================================

  /**
   * Base multiplier for prep effectiveness
   * Each prep day improves relevant attributes by this percentage
   *
   * Research finding: Prep should enable upsets but not guarantee them
   * Previous: 0.10 (10%) - seemed balanced
   */
  PREP_EFFECT_MULTIPLIER: 0.25,

  // ============================================================================
  // STUMBLE SYSTEM (NEW - PHASE 4)
  // ============================================================================

  /**
   * Base stumble probability per segment (minor errors)
   *
   * Target: 40% of battles have at least one stumble (Tru Foe validation)
   * Formula: 1 - (1 - 0.050)^12 ≈ 0.46 (46% per battle per battler)
   * Combined: ~40% chance at least one battler stumbles
   *
   * Stumbles are LESS severe than chokes:
   * - Stumble: Forgot a line, slight hesitation, minor slip (15% penalty)
   * - Choke: Complete breakdown, major memory loss (85% penalty)
   *
   * UPDATED: 0.008 → 0.0136 → 0.050 per validation testing
   * Note: Initial 0.0136 was too low due to strong prep reduction effects
   */
  STUMBLE_BASE_PROBABILITY: 0.042,  // 4.2% per segment (DOWN from 4.5% - was giving 45% vs 40% target)

  /**
   * Score multiplier when stumbling (minor error)
   * 0.85 = 15% penalty (Tru Foe: "Can only get 85 points instead of 100")
   *
   * UPDATED: 0.70 → 0.85 per Tru Foe feedback (30% penalty was too harsh)
   */
  STUMBLE_SCORE_MULTIPLIER: 0.85,  // UP from 0.70

  /**
   * Score multiplier for stumbles with good recovery
   * If recovery skill ≥ 8, reduce penalty to 10% instead of 15%
   * Recovery skill = (delivery + crowd_control) / 2
   *
   * UPDATED: 0.85 → 0.90 per Tru Foe feedback (elite performers recover better)
   */
  STUMBLE_RECOVERY_MULTIPLIER: 0.90,  // UP from 0.85

  /**
   * Stumble reduction per performance prep day
   * Performance prep = rehearsal = reduces stumbles
   */
  STUMBLE_PREP_REDUCTION: 0.0008,  // 0.08% per performance day

  /**
   * Stumble reduction per point of delivery/flow ability above 5
   * Natural ability reduces stumble chance
   */
  STUMBLE_ABILITY_REDUCTION: 0.0008,  // 0.08% per point

  /**
   * Stress impact multiplier on stumble probability
   * High stress increases stumbles (less than choking though)
   *
   * Formula: stress_impact = (stress / 100) × STUMBLE_STRESS_MULTIPLIER
   * Example: 50 stress = 50/100 × 0.04 = 0.02 (2% additional stumble chance)
   */
  STUMBLE_STRESS_MULTIPLIER: 0.04,  // Stress at 100 adds 4% stumble

  /**
   * Minimum stumble probability floor
   * Even elite performers can stumble occasionally
   */
  STUMBLE_MINIMUM: 0.002,  // 0.2% floor

  /**
   * Maximum stumble probability cap
   * For battlers with poor performance skills or no prep
   */
  STUMBLE_MAXIMUM: 0.05,  // 5% cap

  // ============================================================================
  // CHOKE SYSTEM (UPDATED PER PLAYTEST FINDINGS + PHASE 4 EXPANSION)
  // ============================================================================

  /**
   * Base choke probability per segment (catastrophic failure)
   *
   * Target frequencies (Tru Foe validation):
   * - Average battler: 7% per battle (was 5%, Tru Foe: "7-10%, settled on 7%")
   * - Choker badge: 50% per battle (was 25%, Tru Foe: "at least half")
   * - Clutch performer: ~3% per battle
   *
   * Formula: 1 - (1 - 0.015)^18 ≈ 0.238 (23.8% per battle base, before reductions)
   * After prep: 0.015 - 0.040 (5 prep days) = floor at CHOKE_MINIMUM
   *
   * UPDATED: 0.03 → 0.003 → 0.004 → 0.015 per validation testing
   * Note: Must be high enough that prep reductions don't eliminate chokes
   */
  CHOKE_BASE_PROBABILITY: 0.014,  // 1.4% per segment (UP from 1.2% - was showing 3.3% vs 7% target)

  /**
   * Choke reduction per resilience point ABOVE 5
   * Only resilience > 5 reduces choke chance (average is 5)
   *
   * Playtest issue: 0.025 per point was too strong (-17.5% for resilience 7)
   * Bulk validation issue: 0.01 per point was too weak
   *
   * UPDATED: 0.025 → 0.01 → 0.015 (1.5% per resilience point above 5)
   */
  CHOKE_RESILIENCE_FACTOR: 0.025,  // UP from 0.015 (make resilience matter more - was only 3.3% difference)

  /**
   * Choke reduction per prep day (writing + performance)
   *
   * Playtest issue: 0.01 per day was too strong (-5% for 5 prep days)
   * Bulk validation issue: 0.005 per day was too weak
   *
   * UPDATED: 0.01 → 0.005 → 0.008 (0.8% per prep day)
   */
  CHOKE_PREP_REDUCTION: 0.004,  // DOWN from 0.008 - prep was reducing choke too much

  /**
   * Minimum choke probability floor
   * Even the most prepared, resilient battler can choke
   *
   * With 18 segments per battle: P(choke) = 1 - (1 - 0.007)^18 = 11.8% theoretical → ~7% actual
   * Round 5 testing: 0.0041 gave 4%, need 1.75x higher to hit 7% target
   *
   * UPDATED: 0.02 → 0.001 → 0.002 → 0.004 → 0.040 → 0.0041 → 0.007 (Round 6 final)
   * Note: Empirical tuning complete - validated with Tru Foe's expert feedback
   */
  CHOKE_MINIMUM: 0.008,  // 0.8% floor per segment (DOWN from 1.0% - was showing 10% vs 7% target)

  /**
   * Maximum choke probability cap
   * For battlers with negative badges (Choker) or very low prep
   */
  CHOKE_MAXIMUM: 0.25,  // NEW (cap at 25%)

  /**
   * Score multiplier when choking (catastrophic failure)
   * 0.15 = 85% penalty - makes winning round nearly impossible
   *
   * Tru Foe validation: "No, you cannot win a round if you choke"
   * Previous: hardcoded 0.3 (70% penalty) - still allowed wins
   * UPDATED: 0.3 → 0.15 to make chokes devastating
   */
  CHOKE_SCORE_MULTIPLIER: 0.15,  // NEW constant (was hardcoded 0.3)

  /**
   * Stress impact multiplier on choke probability
   * High stress from multiple concurrent battles increases choke risk
   *
   * Formula: stress_impact = (stress / 100) × CHOKE_STRESS_MULTIPLIER
   * Example: 50 stress = 50/100 × 0.10 = 0.05 (5% additional choke chance)
   * Example: 100 stress = 100/100 × 0.10 = 0.10 (10% additional choke chance)
   */
  CHOKE_STRESS_MULTIPLIER: 0.10,  // NEW (stress at 100 adds 10% choke)

  // ============================================================================
  // PERSONAL FACTORS (NEW - PHASE 4 CHOKE EXPANSION)
  // ============================================================================

  /**
   * Financial pressure impact on choking
   * Low financial stability (<4) adds pressure to perform
   *
   * Formula: If financial < 4: (4 - financial) × 0.008
   * Example: Financial 2 = (4-2) × 0.008 = 0.016 (1.6% additional choke)
   */
  CHOKE_FINANCIAL_PRESSURE: 0.003,  // 0.3% per point below 4 (DOWN from 0.8% - was causing 21% vs 11% target)

  /**
   * Reputation pressure impact on choking
   * Both low (<4) and high (>7) reputation create pressure
   *
   * Low rep: "Nothing to lose" desperation
   * High rep: Pressure to maintain status
   *
   * Formula:
   * - If rep < 4: (4 - rep) × 0.005
   * - If rep > 7: (rep - 7) × 0.003
   */
  CHOKE_REPUTATION_LOW_PRESSURE: 0.005,  // 0.5% per point below 4
  CHOKE_REPUTATION_HIGH_PRESSURE: 0.003,  // 0.3% per point above 7

  /**
   * Tournament round pressure modifiers
   * Later rounds = more pressure
   *
   * Applied per round:
   * - First round: 0%
   * - Quarterfinals: +1.0%
   * - Semifinals: +2.0%
   * - Finals: +3.0%
   */
  CHOKE_TOURNAMENT_QUARTERFINALS: 0.010,  // +1.0%
  CHOKE_TOURNAMENT_SEMIFINALS: 0.020,     // +2.0%
  CHOKE_TOURNAMENT_FINALS: 0.030,         // +3.0%

  /**
   * Underdog bonus in tournaments
   * Lower seed = less pressure
   */
  CHOKE_TOURNAMENT_UNDERDOG_REDUCTION: 0.010,  // -1.0% if lower seed

  /**
   * Losing streak pressure
   * Confidence shot after multiple losses
   *
   * Formula: If streak < -2: abs(streak) × 0.005
   * Example: -4 streak = 4 × 0.005 = 0.020 (2.0% additional choke)
   */
  CHOKE_LOSING_STREAK_MULTIPLIER: 0.005,  // 0.5% per loss beyond -2

  /**
   * Opponent intimidation threshold
   * Facing much higher-rated opponent adds pressure
   *
   * Formula: If opponent rating - player rating > 200: +1.5%
   */
  CHOKE_OPPONENT_INTIMIDATION_THRESHOLD: 200,  // Rating difference
  CHOKE_OPPONENT_INTIMIDATION_PENALTY: 0.015,  // +1.5% choke

  /**
   * Fame pressure threshold
   * Very high public knowledge creates expectations
   *
   * Formula: If public_knowledge > 70: (pk - 70) × 0.0003
   * Example: 85 public knowledge = (85-70) × 0.0003 = 0.0045 (0.45% choke)
   */
  CHOKE_FAME_THRESHOLD: 70,  // Public knowledge threshold
  CHOKE_FAME_MULTIPLIER: 0.0003,  // 0.03% per point above 70

  // ============================================================================
  // ATTRIBUTE GAP SYSTEM (NEW - BASED ON PLAYTEST FINDINGS)
  // ============================================================================

  /**
   * Multiplier for battlers with 3+ point attribute advantage
   *
   * Playtest issue: Lyric (9 writing) barely beat Blaze (6 writing) in Small Room
   * Bulk validation v1: 1.25x created too many bodies (53% vs 20-30% target)
   * Bulk validation v2: 1.20x still creating 90% bodies for huge gaps
   * Bulk validation v5: 1.08x still creating 58% body rate (target: 20-30%)
   *
   * UPDATED: 1.25 → 1.20 → 1.15 → 1.08 → 1.0 (REMOVED - let variance decide)
   */
  ATTRIBUTE_GAP_HUGE_MULTIPLIER: 1.0,  // DOWN from 1.08 (Phase 2: remove multipliers)

  /**
   * Multiplier for battlers with 2 point attribute advantage
   *
   * Bulk validation v1: 1.15x contributed to too few debatable battles
   * Bulk validation v2: 1.12x still creating 53% bodies for medium gaps
   * Bulk validation v5: 1.04x still creating 58% body rate (target: 20-30%)
   *
   * UPDATED: 1.15 → 1.12 → 1.10 → 1.04 → 1.0 (REMOVED - let variance decide)
   */
  ATTRIBUTE_GAP_MEDIUM_MULTIPLIER: 1.0,  // DOWN from 1.04 (Phase 2: remove multipliers)

  // ============================================================================
  // MOMENTUM SYSTEM (NEW - BASED ON PLAYTEST FINDINGS)
  // ============================================================================

  /**
   * Maximum momentum bonus/penalty
   * Momentum ranges from -3 to +3, applied as percentage boost
   *
   * NEW: Each momentum point = 5% boost, max ±15%
   */
  MOMENTUM_MAX: 3,  // NEW
  MOMENTUM_MULTIPLIER: 0.02,  // NEW (2% per point) - DOWN from 0.05

  /**
   * Momentum gained from winning round decisively
   * Round won by 2+ points: +1 momentum, opponent -1
   */
  MOMENTUM_DECISIVE_WIN: 1,  // NEW

  /**
   * Momentum gained from winning round clearly
   * Round won by 1-2 points: +0.5 momentum, opponent -0.5
   */
  MOMENTUM_CLEAR_WIN: 0.5,  // NEW

  /**
   * Starting momentum variance (random noise to break determinism)
   * Fixes even matchup determinism (same attributes + same prep = same result)
   *
   * Applied randomly: player gets +/- [0, variance], AI gets inverse
   * Example: 0.5 variance means player could start with +0.3, AI with -0.3
   *
   * Phase 3: All 6 parallel tests showed 0% even matchup upsets (target: 40-60%)
   * This proves determinism bug - adding starting randomness should fix
   */
  MOMENTUM_STARTING_VARIANCE: 0.8,  // UP from 0.5 - more variance in battle outcomes

  // ============================================================================
  // SEGMENT SCORING
  // ============================================================================

  /**
   * Performance penalty for no-show (player accepts but doesn't prep)
   */
  NO_SHOW_PENALTY: 0.6,  // 60% penalty

  /**
   * Probability of peak segment (haymaker moment)
   *
   * Previous: 0.15 (15%)
   * Research finding: "A couple big moments but overall weak" is common
   */
  PEAK_PROBABILITY: 0.15,

  /**
   * Random variance in segment scores (±%)
   *
   * Playtest consideration: May need to widen score ranges
   * Bulk validation v1: Too few debatable battles (8% vs 40-50% target)
   * Bulk validation v2: 0.35 variance only created 10% debatable
   * Solution: Increase variance further to create more score overlap
   *
   * UPDATED: 0.25 → 0.35 → 0.45 → 0.55 (±55% variance for wide score distribution)
   */
  SEGMENT_VARIANCE: 0.80,  // UP from 0.70

  // ============================================================================
  // RATING SYSTEM
  // ============================================================================

  /**
   * ELO K-factor for rating adjustments
   * Higher = faster rating changes
   */
  RATING_K_FACTOR: 32,

  // ============================================================================
  // SCORE RANGE TUNING (NEW - FOR FUTURE ADJUSTMENT)
  // ============================================================================

  /**
   * Minimum base score (before variance)
   * Could lower to 4.0 if need wider range for "bodies"
   */
  SCORE_FLOOR: 3.0,  // NEW - May adjust based on bulk testing

  /**
   * Maximum base score (before variance)
   * Could raise to 10.0 if need stronger ceiling
   */
  SCORE_CEILING: 11.0,  // NEW - May adjust based on bulk testing

  // ============================================================================
  // ROUND JUDGING SYSTEM (NEW - FIX FOR TOURNAMENT ISSUES)
  // ============================================================================

  /**
   * Weight for average_score in round judging
   *
   * Tournament issue: Current system ONLY uses average_score, making peaks/crowd meaningless
   * Example: Tsunami Wave (100 crowd, 15.6 peak) loses to lower average scores
   *
   * Target: Make peak moments and crowd reaction matter in close rounds
   * Formula: composite_score = (average × AVERAGE_WEIGHT) + (peak × PEAK_WEIGHT) + (crowd × CROWD_WEIGHT)
   *
   * UPDATED: 1.0 (100%) → 0.40 (40%) to allow peaks/crowd to swing close rounds
   */
  ROUND_JUDGING_AVERAGE_WEIGHT: 0.40,  // 40% weight on average score

  /**
   * Weight for peak_score in round judging
   *
   * Tournament issue: Peak moments only used as tiebreaker, not factored into scoring
   * Archetypes with high variance (Freestyle Genius, Comedy King, Punchline King) can't win
   *
   * Target: Allow "he had a couple big moments" to swing close rounds
   *
   * NEW: 35% weight on peak score
   */
  ROUND_JUDGING_PEAK_WEIGHT: 0.35,  // 35% weight on peak moments

  /**
   * Weight for crowd_reaction in round judging
   *
   * Tournament issue: Crowd reaction ignored in judging, performance archetypes can't win
   * Example: Stage Domination + Crowd Favorite loses to pen/structure archetypes
   *
   * Target: Allow room-shaking performances to steal rounds in close battles
   *
   * NEW: 25% weight on crowd reaction
   */
  ROUND_JUDGING_CROWD_WEIGHT: 0.25,  // 25% weight on crowd reaction

  /**
   * Crowd reaction normalization factor
   *
   * Crowd reaction is 0-100, need to normalize to ~0-15 range to match score scale
   * Formula: normalized_crowd = (crowd_reaction / 100) × CROWD_SCALE
   *
   * NEW: Scale crowd 0-100 → 0-15 for scoring
   */
  ROUND_JUDGING_CROWD_SCALE: 0.15,  // Scale factor for crowd reaction

  /**
   * Threshold for 3-0 "bodybag" decisions
   *
   * Tournament issue: All battles are 2-1, zero 3-0 decisions
   * Target: 20-30% of battles should be clear 3-0 dominance
   *
   * If winner wins all 3 rounds AND avg score difference > threshold, it's a bodybag
   *
   * NEW: 3.0 point average margin = bodybag
   */
  DECISION_BODYBAG_THRESHOLD: 3.0,  // Score margin for 3-0 bodybag

  /**
   * Threshold for "edge" vs "classic" 2-1 decisions
   *
   * Tournament issue: All 2-1s are "edges", no "classics" identified
   * Classic = close battle where both performed well
   * Edge = one battler clearly better but lost a round
   *
   * If score difference < threshold AND both have high crowd (>70), it's a classic
   *
   * NEW: 2.0 point margin or less = classic (if crowd is high)
   */
  DECISION_CLASSIC_THRESHOLD: 2.5,  // Score margin for 2-1 classic (UP from 2.0 - more battles count as close)
  DECISION_CLASSIC_CROWD_MIN: 60,   // Min crowd reaction for classic (DOWN from 70 - easier to qualify)

  // Life Events
  FAMILY_DRAMA_BLOCK_THRESHOLD: 8,  // Family bond level that blocks family drama events (1-10 scale)
  FAMILY_SUPPORT_THRESHOLD: 7,       // Family bond level that enables support events after losses (1-10 scale)

  // Stress Management
  FAMILY_STRESS_RECOVERY_THRESHOLD: 7,    // Family bond level for faster stress recovery (1-10 scale)
  FAMILY_STRESS_RECOVERY_MULTIPLIER: 2.0, // Stress decay multiplier with high family bond (2x faster)
};

/**
 * Get simulation config with optional overrides for testing
 */
export function getSimulationConfig(overrides?: Partial<typeof SIMULATION_CONFIG>) {
  return { ...SIMULATION_CONFIG, ...overrides };
}

/**
 * Validation helper: Check if config produces reasonable outcomes
 *
 * Example choke calculation with typical values:
 * - Resilience 7, Prep 5 days:
 *   Base: 0.10
 *   Resilience: -(7-5) * 0.01 = -0.02
 *   Prep: -5 * 0.005 = -0.025
 *   Total: 0.10 - 0.02 - 0.025 = 0.055 (5.5%)
 *   Floor: max(0.055, 0.02) = 5.5% ✓
 *
 * - Resilience 5, Prep 0 days (no prep):
 *   Base: 0.10
 *   Resilience: 0 (no bonus at average)
 *   Prep: 0
 *   Total: 0.10 (10%) ✓
 *
 * - Resilience 3, Prep 0, Choker badge (+0.05):
 *   Base: 0.10
 *   Resilience: 0 (doesn't increase, just doesn't reduce)
 *   Prep: 0
 *   Badge: +0.05
 *   Total: 0.15 (15%)
 *   Cap: min(0.15, 0.25) = 15% ✓
 */
export function validateChokeConfig(): {
  typicalHighPrep: number;
  typicalNoPrep: number;
  worstCase: number;
  passesValidation: boolean;
} {
  const config = SIMULATION_CONFIG;

  // Typical high-prep battler (resilience 7, 5 prep days)
  const typicalHighPrep = Math.max(
    config.CHOKE_MINIMUM,
    config.CHOKE_BASE_PROBABILITY - (2 * config.CHOKE_RESILIENCE_FACTOR) - (5 * config.CHOKE_PREP_REDUCTION)
  );

  // Typical no-prep battler (resilience 5, 0 prep days)
  const typicalNoPrep = config.CHOKE_BASE_PROBABILITY;

  // Worst case (resilience 3, 0 prep, Choker badge +0.05)
  const worstCase = Math.min(
    config.CHOKE_MAXIMUM,
    config.CHOKE_BASE_PROBABILITY + 0.05  // Choker badge
  );

  // Validation: Should be in 2-15% range for typical cases
  const passesValidation =
    typicalHighPrep >= 0.02 && typicalHighPrep <= 0.15 &&
    typicalNoPrep >= 0.05 && typicalNoPrep <= 0.15 &&
    worstCase >= 0.10 && worstCase <= 0.25;

  return {
    typicalHighPrep,
    typicalNoPrep,
    worstCase,
    passesValidation,
  };
}

// Validation check on import (development only)
if (process.env.NODE_ENV === 'development') {
  const validation = validateChokeConfig();
  if (!validation.passesValidation) {
    console.warn('[CONFIG] Choke config validation failed:', validation);
  }
}
