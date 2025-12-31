/**
 * Unit Tests for Core Simulation Logic
 * Tests prep modifiers, choke probability, scoring, and ELO
 */

import { describe, test, expect } from '@jest/globals';

// Import types (we'll need to export these from simulation.ts)
type ModifiedAttributes = {
  writing: {
    lyricism: number;
    wordplay: number;
    creativity: number;
  };
  performance: {
    stage_presence: number;
    crowd_control: number;
    delivery: number;
  };
  personal: {
    confidence: number;
    reputation: number;
  };
  resilience: number;
};

type PrepProfile = {
  researchDays: number;
  writingDays: number;
  performanceDays: number;
  lifeDays: number;
  restDays: number;
};

type BattlerAttributes = {
  writing: {
    lyricism: number;
    wordplay: number;
    creativity: number;
  };
  performance: {
    stage_presence: number;
    crowd_control: number;
    delivery: number;
  };
  personal: {
    confidence: number;
    reputation: number;
  };
  resilience: number;
};

// Configuration from simulation.ts
const CONFIG = {
  PREP_EFFECT_MULTIPLIER: 0.15,
  CHOKE_BASE_PROBABILITY: 0.05,
  CHOKE_RESILIENCE_FACTOR: 0.015,
  CHOKE_PREP_REDUCTION: 0.01,
  NO_SHOW_PENALTY: 0.6,
  PEAK_PROBABILITY: 0.15,
  SEGMENT_VARIANCE: 0.2,
  RATING_K_FACTOR: 32,
};

/**
 * Apply prep modifiers to base attributes
 * (Extracted from simulation.ts for testing)
 */
function applyPrepModifiers(
  attributes: BattlerAttributes,
  prep: PrepProfile,
  isNoShow: boolean
): ModifiedAttributes {
  const modified: ModifiedAttributes = {
    writing: { ...attributes.writing },
    performance: { ...attributes.performance },
    personal: { ...attributes.personal },
    resilience: attributes.resilience,
  };

  // Writing improvements from prep
  const writingBoost = prep.writingDays * CONFIG.PREP_EFFECT_MULTIPLIER;
  modified.writing.lyricism = Math.min(
    10,
    attributes.writing.lyricism + writingBoost
  );
  modified.writing.wordplay = Math.min(
    10,
    attributes.writing.wordplay + writingBoost
  );
  modified.writing.creativity = Math.min(
    10,
    attributes.writing.creativity + writingBoost
  );

  // Performance improvements from prep
  const performanceBoost = prep.performanceDays * CONFIG.PREP_EFFECT_MULTIPLIER;
  modified.performance.stage_presence = Math.min(
    10,
    attributes.performance.stage_presence + performanceBoost
  );
  modified.performance.crowd_control = Math.min(
    10,
    attributes.performance.crowd_control + performanceBoost
  );
  modified.performance.delivery = Math.min(
    10,
    attributes.performance.delivery + performanceBoost
  );

  // Resilience boost from rest
  const resilienceBoost = prep.restDays * CONFIG.PREP_EFFECT_MULTIPLIER;
  modified.resilience = Math.min(10, attributes.resilience + resilienceBoost);

  // No-show penalty
  if (isNoShow) {
    modified.writing.lyricism *= CONFIG.NO_SHOW_PENALTY;
    modified.writing.wordplay *= CONFIG.NO_SHOW_PENALTY;
    modified.writing.creativity *= CONFIG.NO_SHOW_PENALTY;
    modified.performance.stage_presence *= CONFIG.NO_SHOW_PENALTY;
    modified.performance.crowd_control *= CONFIG.NO_SHOW_PENALTY;
    modified.performance.delivery *= CONFIG.NO_SHOW_PENALTY;
    modified.resilience *= CONFIG.NO_SHOW_PENALTY;
  }

  return modified;
}

/**
 * Calculate choke probability
 */
function calculateChokeProbability(
  resilience: number,
  writingDays: number,
  performanceDays: number,
  isNoShow: boolean
): number {
  const chokeProbability =
    CONFIG.CHOKE_BASE_PROBABILITY -
    resilience * CONFIG.CHOKE_RESILIENCE_FACTOR -
    (writingDays + performanceDays) * CONFIG.CHOKE_PREP_REDUCTION;

  const chokeThreshold = isNoShow ? chokeProbability * 3 : chokeProbability;

  return Math.max(0, chokeThreshold);
}

/**
 * Calculate ELO change
 */
function calculateELO(
  playerRating: number,
  opponentRating: number,
  playerWon: boolean
): { player: number; opponent: number } {
  const expectedPlayer =
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const expectedOpponent = 1 - expectedPlayer;

  const playerActual = playerWon ? 1 : 0;
  const opponentActual = playerWon ? 0 : 1;

  return {
    player: Math.round(
      playerRating + CONFIG.RATING_K_FACTOR * (playerActual - expectedPlayer)
    ),
    opponent: Math.round(
      opponentRating + CONFIG.RATING_K_FACTOR * (opponentActual - expectedOpponent)
    ),
  };
}

// ================================================
// B1. Prep Modifiers Tests
// ================================================

describe('B1. Prep Modifiers', () => {
  const baseAttributes: BattlerAttributes = {
    writing: { lyricism: 5, wordplay: 5, creativity: 5 },
    performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
    personal: { confidence: 5, reputation: 5 },
    resilience: 5,
  };

  test('No prep days - output equals base', () => {
    const prep: PrepProfile = {
      researchDays: 0,
      writingDays: 0,
      performanceDays: 0,
      lifeDays: 0,
      restDays: 0,
    };

    const modified = applyPrepModifiers(baseAttributes, prep, false);

    expect(modified.writing.lyricism).toBe(5);
    expect(modified.writing.wordplay).toBe(5);
    expect(modified.writing.creativity).toBe(5);
    expect(modified.performance.stage_presence).toBe(5);
    expect(modified.performance.crowd_control).toBe(5);
    expect(modified.performance.delivery).toBe(5);
    expect(modified.resilience).toBe(5);
  });

  test('Writing-heavy prep - only writing attributes increase', () => {
    const prep: PrepProfile = {
      researchDays: 0,
      writingDays: 10,
      performanceDays: 0,
      lifeDays: 0,
      restDays: 0,
    };

    const modified = applyPrepModifiers(baseAttributes, prep, false);

    // Writing should increase (10 days * 0.15 = +1.5)
    expect(modified.writing.lyricism).toBe(6.5);
    expect(modified.writing.wordplay).toBe(6.5);
    expect(modified.writing.creativity).toBe(6.5);

    // Performance should stay the same
    expect(modified.performance.stage_presence).toBe(5);
    expect(modified.performance.crowd_control).toBe(5);
    expect(modified.performance.delivery).toBe(5);

    // Resilience should stay the same
    expect(modified.resilience).toBe(5);
  });

  test('Performance-heavy prep - only performance attributes increase', () => {
    const prep: PrepProfile = {
      researchDays: 0,
      writingDays: 0,
      performanceDays: 8,
      lifeDays: 0,
      restDays: 0,
    };

    const modified = applyPrepModifiers(baseAttributes, prep, false);

    // Writing should stay the same
    expect(modified.writing.lyricism).toBe(5);
    expect(modified.writing.wordplay).toBe(5);
    expect(modified.writing.creativity).toBe(5);

    // Performance should increase (8 * 0.15 = +1.2)
    expect(modified.performance.stage_presence).toBe(6.2);
    expect(modified.performance.crowd_control).toBe(6.2);
    expect(modified.performance.delivery).toBe(6.2);

    // Resilience should stay the same
    expect(modified.resilience).toBe(5);
  });

  test('Rest-heavy prep - resilience increases', () => {
    const prep: PrepProfile = {
      researchDays: 0,
      writingDays: 0,
      performanceDays: 0,
      lifeDays: 0,
      restDays: 10,
    };

    const modified = applyPrepModifiers(baseAttributes, prep, false);

    // Writing/performance should stay the same
    expect(modified.writing.lyricism).toBe(5);
    expect(modified.performance.stage_presence).toBe(5);

    // Resilience should increase (10 * 0.15 = +1.5)
    expect(modified.resilience).toBe(6.5);
  });

  test('Attribute clamping at 10 (upper bound)', () => {
    const highAttributes: BattlerAttributes = {
      writing: { lyricism: 9, wordplay: 9, creativity: 9 },
      performance: { stage_presence: 9, crowd_control: 9, delivery: 9 },
      personal: { confidence: 9, reputation: 9 },
      resilience: 9,
    };

    const prep: PrepProfile = {
      researchDays: 0,
      writingDays: 20,
      performanceDays: 20,
      lifeDays: 0,
      restDays: 20,
    };

    const modified = applyPrepModifiers(highAttributes, prep, false);

    // All should be clamped at 10
    expect(modified.writing.lyricism).toBe(10);
    expect(modified.writing.wordplay).toBe(10);
    expect(modified.performance.stage_presence).toBe(10);
    expect(modified.resilience).toBe(10);
  });

  test('No-show penalty applies correctly', () => {
    const prep: PrepProfile = {
      researchDays: 0,
      writingDays: 0,
      performanceDays: 0,
      lifeDays: 0,
      restDays: 0,
    };

    const modified = applyPrepModifiers(baseAttributes, prep, true);

    // All attributes should be reduced by 60%
    expect(modified.writing.lyricism).toBe(5 * 0.6);
    expect(modified.writing.wordplay).toBe(5 * 0.6);
    expect(modified.performance.stage_presence).toBe(5 * 0.6);
    expect(modified.resilience).toBe(5 * 0.6);
  });
});

// ================================================
// B2. Choke Probability Tests
// ================================================

describe('B2. Choke Probability', () => {
  test('Baseline sanity - medium resilience, no prep', () => {
    const prob = calculateChokeProbability(5, 0, 0, false);

    // 0.05 - (5 * 0.015) = 0.05 - 0.075 = -0.025 → clamped to 0
    // Actually: 5% - 7.5% = -2.5% → 0%
    expect(prob).toBeGreaterThanOrEqual(0);
    expect(prob).toBeLessThanOrEqual(0.7);
  });

  test('High resilience + strong prep reduces choke chance', () => {
    const lowResilience = calculateChokeProbability(2, 0, 0, false);
    const highResilience = calculateChokeProbability(9, 5, 5, false);

    // High resilience + prep should have lower choke chance
    expect(highResilience).toBeLessThan(lowResilience);
  });

  test('No-show penalty triples choke chance', () => {
    const normal = calculateChokeProbability(5, 3, 3, false);
    const noShow = calculateChokeProbability(5, 3, 3, true);

    expect(noShow).toBe(normal * 3);
  });

  test('Monotonic behavior - increasing resilience decreases choke', () => {
    const chokes: number[] = [];

    for (let resilience = 1; resilience <= 10; resilience++) {
      chokes.push(calculateChokeProbability(resilience, 0, 0, false));
    }

    // Each choke probability should be <= the previous
    for (let i = 1; i < chokes.length; i++) {
      expect(chokes[i]).toBeLessThanOrEqual(chokes[i - 1]);
    }
  });
});

// ================================================
// B5. ELO Calculation Tests
// ================================================

describe('B5. ELO Calculation', () => {
  test('Higher-rated player wins - small gain', () => {
    const result = calculateELO(1500, 1200, true);

    // Higher-rated player should gain less than 32 points
    expect(result.player).toBeGreaterThan(1500);
    expect(result.player).toBeLessThan(1500 + 32);

    // Lower-rated player should lose points
    expect(result.opponent).toBeLessThan(1200);
  });

  test('Upset - low-rated player wins', () => {
    const result = calculateELO(1200, 1500, true);

    // Lower-rated player should gain close to 32 points (big upset)
    expect(result.player).toBeGreaterThan(1200);
    expect(result.player - 1200).toBeGreaterThan(20);

    // Higher-rated player should lose significantly
    expect(result.opponent).toBeLessThan(1500);
    expect(1500 - result.opponent).toBeGreaterThan(20);
  });

  test('Sum of deltas = 0', () => {
    const result = calculateELO(1400, 1300, true);

    const playerDelta = result.player - 1400;
    const opponentDelta = result.opponent - 1300;

    // In 1v1, total rating change should be 0
    expect(Math.abs(playerDelta + opponentDelta)).toBeLessThan(1); // Allow rounding error
  });

  test('Equal ratings - winner gains ~16 points', () => {
    const result = calculateELO(1300, 1300, true);

    // With equal ratings, expected = 0.5, actual = 1
    // Delta = 32 * (1 - 0.5) = 16
    expect(result.player).toBe(1316);
    expect(result.opponent).toBe(1284);
  });
});

// ================================================
// Additional Tests
// ================================================

describe('Edge Cases', () => {
  test('Extreme prep days (30+) still clamps correctly', () => {
    const baseAttributes: BattlerAttributes = {
      writing: { lyricism: 5, wordplay: 5, creativity: 5 },
      performance: { stage_presence: 5, crowd_control: 5, delivery: 5 },
      personal: { confidence: 5, reputation: 5 },
      resilience: 5,
    };

    const prep: PrepProfile = {
      researchDays: 0,
      writingDays: 50,
      performanceDays: 0,
      lifeDays: 0,
      restDays: 0,
    };

    const modified = applyPrepModifiers(baseAttributes, prep, false);

    // Should be clamped at 10, not 50 * 0.15 = 7.5 → 12.5
    expect(modified.writing.lyricism).toBe(10);
    expect(modified.writing.wordplay).toBe(10);
    expect(modified.writing.creativity).toBe(10);
  });

  test('Zero resilience still produces valid choke probability', () => {
    const prob = calculateChokeProbability(0, 0, 0, false);

    expect(prob).toBeGreaterThanOrEqual(0);
    expect(prob).toBeLessThanOrEqual(1);
  });
});
