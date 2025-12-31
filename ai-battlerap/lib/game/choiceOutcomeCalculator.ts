/**
 * Choice Outcome Probability Calculator
 *
 * Calculates win/neutral/loss probabilities for life event choices
 * based on battler's badges, attributes, and current context.
 */

import {
  calculateChoiceModifier,
  calculateEffectMultiplier,
  determineBattlerArchetype,
  type BattlerArchetype
} from './badgeSystem';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface ChoiceContext {
  // Battler info
  battlerId: string;
  badges: string[];
  attributes: {
    writing: { lyricism: number; wordplay: number; creativity: number };
    performance: { stage_presence: number; crowd_control: number; delivery: number };
    personal: { reputation: number; financial_stability: number; family_bond: number };
    resilience: number;
    public_knowledge: number;
  };

  // Current stats
  currentStreak: number;
  totalBattles: number;
  recentPerformance: 'hot' | 'cold' | 'neutral';

  // Event context
  eventCode: string;
  choiceType: 'composed' | 'risky' | 'technical' | 'improvised' | 'aggressive' | 'humble';
}

export interface OutcomeProbability {
  win: number;      // 0-1, probability of positive outcome
  neutral: number;  // 0-1, probability of neutral outcome
  loss: number;     // 0-1, probability of negative outcome
  expectedEffects: EffectPrediction;
  modifiers: ProbabilityModifier[];
}

export interface EffectPrediction {
  baseEffects: Record<string, number>;
  modifiedEffects: Record<string, number>;
  effectMultiplier: number;
}

export interface ProbabilityModifier {
  source: string;
  type: 'badge' | 'attribute' | 'streak' | 'archetype';
  value: number;
  description: string;
}

// ==========================================
// BASE PROBABILITY TABLES
// ==========================================

/**
 * Base probabilities for different choice types
 * These are starting points before badge/attribute modifiers
 */
const BASE_PROBABILITIES: Record<string, { win: number; neutral: number; loss: number }> = {
  composed: { win: 0.60, neutral: 0.25, loss: 0.15 },  // Safer choice
  risky: { win: 0.45, neutral: 0.20, loss: 0.35 },     // High risk/reward
  technical: { win: 0.55, neutral: 0.30, loss: 0.15 }, // Moderate
  improvised: { win: 0.50, neutral: 0.25, loss: 0.25 }, // Balanced
  aggressive: { win: 0.45, neutral: 0.20, loss: 0.35 }, // High risk
  humble: { win: 0.65, neutral: 0.25, loss: 0.10 }     // Usually safe
};

// ==========================================
// ARCHETYPE-BASED MODIFIERS
// ==========================================

/**
 * How each archetype affects different choice types
 */
const ARCHETYPE_MODIFIERS: Record<
  BattlerArchetype,
  Partial<Record<ChoiceContext['choiceType'], number>>
> = {
  technical_writer: {
    composed: 0.15,
    technical: 0.20,
    risky: -0.10,
    improvised: -0.15
  },
  performance_beast: {
    risky: 0.20,
    aggressive: 0.15,
    composed: -0.05,
    technical: -0.10
  },
  freestyler: {
    improvised: 0.25,
    risky: 0.10,
    technical: -0.10,
    composed: -0.05
  },
  comedy_battler: {
    risky: 0.15,
    improvised: 0.10,
    aggressive: -0.15
  },
  aggressive_battler: {
    aggressive: 0.20,
    risky: 0.15,
    humble: -0.20,
    composed: -0.10
  },
  storyteller: {
    composed: 0.15,
    technical: 0.10,
    improvised: -0.10
  },
  wordplay_specialist: {
    technical: 0.20,
    composed: 0.10,
    improvised: -0.15
  },
  crowd_favorite: {
    risky: 0.15,
    humble: 0.10,
    aggressive: -0.10
  },
  controversial: {
    risky: 0.15,
    aggressive: 0.10,
    humble: -0.25,
    composed: -0.15
  },
  balanced: {} // No modifiers
};

// ==========================================
// ATTRIBUTE-BASED MODIFIERS
// ==========================================

/**
 * Calculate modifier based on relevant attributes
 */
function getAttributeModifier(
  context: ChoiceContext,
  choiceType: ChoiceContext['choiceType']
): number {
  const { attributes } = context;

  switch (choiceType) {
    case 'composed':
      // Benefits from high reputation and resilience
      return (
        (attributes.personal.reputation - 5.5) * 0.02 +
        (attributes.resilience - 5.5) * 0.015
      );

    case 'risky':
      // Benefits from stage presence and crowd control
      return (
        (attributes.performance.stage_presence - 5.5) * 0.025 +
        (attributes.performance.crowd_control - 5.5) * 0.02 +
        (attributes.resilience - 5.5) * 0.01
      );

    case 'technical':
      // Benefits from writing attributes
      return (
        (attributes.writing.lyricism - 5.5) * 0.02 +
        (attributes.writing.wordplay - 5.5) * 0.02 +
        (attributes.writing.creativity - 5.5) * 0.015
      );

    case 'improvised':
      // Benefits from creativity and delivery
      return (
        (attributes.writing.creativity - 5.5) * 0.025 +
        (attributes.performance.delivery - 5.5) * 0.02 +
        (attributes.resilience - 5.5) * 0.01
      );

    case 'aggressive':
      // Benefits from delivery and stage presence, but high risk
      return (
        (attributes.performance.delivery - 5.5) * 0.02 +
        (attributes.performance.stage_presence - 5.5) * 0.015 +
        (attributes.resilience - 5.5) * 0.01
      );

    case 'humble':
      // Benefits from reputation and family bond
      return (
        (attributes.personal.reputation - 5.5) * 0.025 +
        (attributes.personal.family_bond - 5.5) * 0.015 +
        (attributes.resilience - 5.5) * 0.01
      );

    default:
      return 0;
  }
}

// ==========================================
// STREAK MODIFIERS
// ==========================================

/**
 * Calculate modifier based on current streak
 */
function getStreakModifier(context: ChoiceContext): number {
  const { currentStreak, recentPerformance } = context;

  let modifier = 0;

  // Win streak confidence boost
  if (currentStreak > 0) {
    modifier += Math.min(currentStreak * 0.02, 0.10); // Max +10% for hot streak
  }
  // Loss streak confidence penalty
  else if (currentStreak < 0) {
    modifier += Math.max(currentStreak * 0.02, -0.15); // Max -15% for cold streak
  }

  // Recent performance adjustment
  if (recentPerformance === 'hot') {
    modifier += 0.05;
  } else if (recentPerformance === 'cold') {
    modifier -= 0.08;
  }

  return modifier;
}

// ==========================================
// MAIN CALCULATOR FUNCTION
// ==========================================

/**
 * Calculate outcome probabilities for a life event choice
 */
export function calculateChoiceOutcome(
  context: ChoiceContext,
  baseEffects: Record<string, number>
): OutcomeProbability {
  const modifiers: ProbabilityModifier[] = [];

  // 1. Start with base probability
  const baseProbability = BASE_PROBABILITIES[context.choiceType] || BASE_PROBABILITIES.composed;
  let winProb = baseProbability.win;
  let neutralProb = baseProbability.neutral;
  let lossProb = baseProbability.loss;

  // 2. Badge-based modifiers
  const badgeModifier = calculateChoiceModifier(context.badges, context.choiceType);
  if (badgeModifier !== 0) {
    winProb += badgeModifier;
    lossProb -= badgeModifier * 0.7; // Reduce loss prob proportionally
    neutralProb -= badgeModifier * 0.3;

    modifiers.push({
      source: 'badges',
      type: 'badge',
      value: badgeModifier,
      description: `Badge bonuses for ${context.choiceType} choices`
    });
  }

  // 3. Archetype modifiers
  const archetype = determineBattlerArchetype(context.badges);
  const archetypeModifier = ARCHETYPE_MODIFIERS[archetype]?.[context.choiceType] || 0;
  if (archetypeModifier !== 0) {
    winProb += archetypeModifier;
    lossProb -= archetypeModifier * 0.6;
    neutralProb -= archetypeModifier * 0.4;

    modifiers.push({
      source: archetype,
      type: 'archetype',
      value: archetypeModifier,
      description: `${archetype} archetype modifier`
    });
  }

  // 4. Attribute modifiers
  const attributeModifier = getAttributeModifier(context, context.choiceType);
  if (Math.abs(attributeModifier) > 0.01) {
    winProb += attributeModifier;
    lossProb -= attributeModifier * 0.5;
    neutralProb -= attributeModifier * 0.5;

    modifiers.push({
      source: 'attributes',
      type: 'attribute',
      value: attributeModifier,
      description: 'Relevant attribute bonuses'
    });
  }

  // 5. Streak modifiers
  const streakModifier = getStreakModifier(context);
  if (Math.abs(streakModifier) > 0.01) {
    winProb += streakModifier;
    lossProb -= streakModifier * 0.6;
    neutralProb -= streakModifier * 0.4;

    modifiers.push({
      source: 'streak',
      type: 'streak',
      value: streakModifier,
      description: context.currentStreak > 0 ? 'Hot streak confidence' : 'Cold streak doubt'
    });
  }

  // 6. Normalize probabilities (ensure they sum to 1.0)
  const total = winProb + neutralProb + lossProb;
  winProb = Math.max(0, Math.min(1, winProb / total));
  neutralProb = Math.max(0, Math.min(1, neutralProb / total));
  lossProb = Math.max(0, Math.min(1, lossProb / total));

  // 7. Calculate effect multipliers
  const effectMultiplier = calculateEffectMultiplier(context.badges, context.eventCode);
  const modifiedEffects: Record<string, number> = {};

  for (const [key, value] of Object.entries(baseEffects)) {
    modifiedEffects[key] = value * effectMultiplier;
  }

  return {
    win: winProb,
    neutral: neutralProb,
    loss: lossProb,
    expectedEffects: {
      baseEffects,
      modifiedEffects,
      effectMultiplier
    },
    modifiers
  };
}

// ==========================================
// OUTCOME RESOLUTION
// ==========================================

/**
 * Resolve a choice based on calculated probabilities
 * Returns 'win', 'neutral', or 'loss' based on random roll
 */
export function resolveChoiceOutcome(probability: OutcomeProbability): 'win' | 'neutral' | 'loss' {
  const roll = Math.random();

  if (roll < probability.win) {
    return 'win';
  } else if (roll < probability.win + probability.neutral) {
    return 'neutral';
  } else {
    return 'loss';
  }
}

/**
 * Get the appropriate effects based on outcome
 */
export function getEffectsForOutcome(
  outcome: 'win' | 'neutral' | 'loss',
  choiceEffects: Record<string, number>,
  effectMultiplier: number
): Record<string, number> {
  const modifiedEffects: Record<string, number> = {};

  for (const [key, value] of Object.entries(choiceEffects)) {
    let finalValue = value * effectMultiplier;

    // On neutral outcome, reduce effects by 50%
    if (outcome === 'neutral') {
      finalValue *= 0.5;
    }
    // On loss outcome, invert positive effects and amplify negative
    else if (outcome === 'loss') {
      if (value > 0) {
        finalValue = -value * 0.3; // Positive effects become small penalties
      } else {
        finalValue = value * 1.5; // Negative effects amplified
      }
    }

    modifiedEffects[key] = finalValue;
  }

  return modifiedEffects;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Format probability as percentage for display
 */
export function formatProbability(prob: number): string {
  return `${Math.round(prob * 100)}%`;
}

/**
 * Get outcome description
 */
export function getOutcomeDescription(outcome: 'win' | 'neutral' | 'loss'): string {
  switch (outcome) {
    case 'win':
      return 'Success! The choice paid off.';
    case 'neutral':
      return 'Mixed results. Some good, some bad.';
    case 'loss':
      return 'Things did not go as planned.';
  }
}

/**
 * Calculate expected value of a choice
 * Returns weighted average of effects based on probabilities
 */
export function calculateExpectedValue(
  probability: OutcomeProbability,
  winEffects: Record<string, number>,
  neutralEffects: Record<string, number>,
  lossEffects: Record<string, number>
): Record<string, number> {
  const expectedEffects: Record<string, number> = {};

  // Combine all effect keys
  const allKeys = new Set([
    ...Object.keys(winEffects),
    ...Object.keys(neutralEffects),
    ...Object.keys(lossEffects)
  ]);

  for (const key of allKeys) {
    const winValue = winEffects[key] || 0;
    const neutralValue = neutralEffects[key] || 0;
    const lossValue = lossEffects[key] || 0;

    expectedEffects[key] =
      winValue * probability.win +
      neutralValue * probability.neutral +
      lossValue * probability.loss;
  }

  return expectedEffects;
}
