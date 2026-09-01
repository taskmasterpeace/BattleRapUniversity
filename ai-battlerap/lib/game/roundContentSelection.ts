/**
 * Round Content Selection System - Core Logic
 *
 * Handles content/delivery/performance selection for each round in "Locked In" mode.
 * Includes auto-selection algorithms for AI battlers and auto-simulation mode.
 */

import {
  ContentType,
  DeliveryType,
  PerformanceType,
  getAllContentTypes,
  getAllDeliveryTypes,
  getAllPerformanceTypes,
} from './contentTypes';

import {
  getEffectiveness,
  calculateAverageEffectiveness,
} from './contentEffectiveness';

import {
  calculateCrowdPreference,
  calculateAverageCrowdPreference,
  getDominantDemographic,
} from './crowdDemographics';

import {
  getContextModifier,
  calculateAverageContextModifier,
} from './contextModifiers';

import { ScoringContext } from '../models';

// =====================================================
// TYPES
// =====================================================

export interface ContentSelection {
  contentTypes: ContentType[]; // 3-4 selections
  deliveryTypes: DeliveryType[]; // 1-2 selections
  performanceTypes: PerformanceType[]; // 1-2 selections
}

export interface ContentSelectionValidation {
  valid: boolean;
  errors: string[];
}

export interface EffectivenessForecast {
  averageEffectiveness: number; // vs opponent's content
  crowdPreference: number; // based on league demographics
  contextModifier: number; // in building vs on cam
  finalMultiplier: number; // effectiveness × crowd × context
  strongAgainst: (ContentType | DeliveryType | PerformanceType)[];
  weakAgainst: (ContentType | DeliveryType | PerformanceType)[];
}

export interface BadgeWeightMap {
  content: Map<ContentType, number>;
  delivery: Map<DeliveryType, number>;
  performance: Map<PerformanceType, number>;
}

// =====================================================
// VALIDATION
// =====================================================

/**
 * Validate content selection meets all requirements
 */
export function validateContentSelection(selection: ContentSelection): ContentSelectionValidation {
  const errors: string[] = [];

  // Validate content types (3-4 required)
  if (!selection.contentTypes || selection.contentTypes.length < 3 || selection.contentTypes.length > 4) {
    errors.push('Must select 3-4 content types');
  }

  // Validate delivery types (1-2 required)
  if (!selection.deliveryTypes || selection.deliveryTypes.length < 1 || selection.deliveryTypes.length > 2) {
    errors.push('Must select 1-2 delivery types');
  }

  // Validate performance types (1-2 required)
  if (!selection.performanceTypes || selection.performanceTypes.length < 1 || selection.performanceTypes.length > 2) {
    errors.push('Must select 1-2 performance types');
  }

  // Validate no duplicates
  if (selection.contentTypes && new Set(selection.contentTypes).size !== selection.contentTypes.length) {
    errors.push('Content types must be unique');
  }
  if (selection.deliveryTypes && new Set(selection.deliveryTypes).size !== selection.deliveryTypes.length) {
    errors.push('Delivery types must be unique');
  }
  if (selection.performanceTypes && new Set(selection.performanceTypes).size !== selection.performanceTypes.length) {
    errors.push('Performance types must be unique');
  }

  // Validate types are valid
  const validContentTypes = getAllContentTypes().map(ct => ct.id);
  const validDeliveryTypes = getAllDeliveryTypes().map(dt => dt.id);
  const validPerformanceTypes = getAllPerformanceTypes().map(pt => pt.id);

  if (selection.contentTypes) {
    for (const ct of selection.contentTypes) {
      if (!validContentTypes.includes(ct)) {
        errors.push(`Invalid content type: ${ct}`);
      }
    }
  }

  if (selection.deliveryTypes) {
    for (const dt of selection.deliveryTypes) {
      if (!validDeliveryTypes.includes(dt)) {
        errors.push(`Invalid delivery type: ${dt}`);
      }
    }
  }

  if (selection.performanceTypes) {
    for (const pt of selection.performanceTypes) {
      if (!validPerformanceTypes.includes(pt)) {
        errors.push(`Invalid performance type: ${pt}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =====================================================
// BADGE WEIGHT MAPPING
// =====================================================

/**
 * Parse battler's style_tags (badges) and create weight map for auto-selection
 *
 * Badge names map to content types:
 * - "Wordplay Wizard" → high weight for 'wordplay' content
 * - "Punchline King" → high weight for 'punchlines' content
 * - "Crowd Favorite" → high weight for 'charismatic' performance, 'comedy' content
 * - etc.
 */
export function createBadgeWeightMap(styleTags: string[]): BadgeWeightMap {
  const contentWeights = new Map<ContentType, number>();
  const deliveryWeights = new Map<DeliveryType, number>();
  const performanceWeights = new Map<PerformanceType, number>();

  // Badge → Content Type Mappings (based on existing badge system)
  const badgeToContent: Record<string, { type: ContentType, weight: number }[]> = {
    'Wordplay Wizard': [{ type: 'wordplay', weight: 2.5 }],
    'Punchline King': [{ type: 'punchlines', weight: 2.5 }],
    'Punchline Queen': [{ type: 'punchlines', weight: 2.5 }],
    'Storytelling': [{ type: 'storytelling', weight: 2.0 }],
    'Freestyle Genius': [{ type: 'freestyles', weight: 2.5 }],
    'Comedy': [{ type: 'comedy', weight: 2.5 }],
    'Crowd Favorite': [{ type: 'comedy', weight: 1.5 }, { type: 'pop_culture_refs', weight: 1.5 }],
    'Schemes Master': [{ type: 'schemes', weight: 2.5 }],
    'Battle Tested': [{ type: 'personals', weight: 1.5 }, { type: 'rebuttals', weight: 1.5 }],
    'Aggressive': [{ type: 'gun_bars', weight: 2.0 }, { type: 'shock_value', weight: 1.5 }],
    'Street': [{ type: 'street_talk', weight: 2.5 }],
    'Poetic': [{ type: 'wordplay', weight: 1.5 }, { type: 'schemes', weight: 1.5 }],
    'Technical': [{ type: 'wordplay', weight: 2.0 }, { type: 'schemes', weight: 2.0 }],
    'Entertaining': [{ type: 'comedy', weight: 2.0 }, { type: 'name_flips', weight: 1.5 }],
  };

  // Badge → Delivery Type Mappings
  const badgeToDelivery: Record<string, { type: DeliveryType, weight: number }[]> = {
    'Aggressive': [{ type: 'aggressive', weight: 2.5 }],
    'Smooth Operator': [{ type: 'smooth_flow', weight: 2.5 }],
    'Speed Demon': [{ type: 'speed_rapping', weight: 2.5 }],
    'Passionate': [{ type: 'passionate', weight: 2.0 }],
    'Cool': [{ type: 'nonchalant', weight: 2.0 }],
    'Conversational': [{ type: 'conversational', weight: 2.0 }],
    'Poetic': [{ type: 'smooth_flow', weight: 1.5 }],
  };

  // Badge → Performance Type Mappings
  const badgeToPerformance: Record<string, { type: PerformanceType, weight: number }[]> = {
    'Stage Domination': [{ type: 'stage_presence', weight: 2.5 }],
    'Crowd Favorite': [{ type: 'crowd_interaction', weight: 2.0 }, { type: 'charismatic', weight: 2.0 }],
    'Theatrical': [{ type: 'theatrical', weight: 2.5 }],
    'Charismatic': [{ type: 'charismatic', weight: 2.5 }],
    'Dynamic': [{ type: 'dynamic_range', weight: 2.0 }],
    'Expressive': [{ type: 'facial_expression', weight: 2.0 }],
    'Strategic Pauses': [{ type: 'strategic_pauses', weight: 2.0 }],
    'Minimalist': [{ type: 'minimalist', weight: 2.0 }],
  };

  // Process badges
  for (const badge of styleTags) {
    // Map to content types
    if (badgeToContent[badge]) {
      for (const { type, weight } of badgeToContent[badge]) {
        contentWeights.set(type, (contentWeights.get(type) || 0) + weight);
      }
    }

    // Map to delivery types
    if (badgeToDelivery[badge]) {
      for (const { type, weight } of badgeToDelivery[badge]) {
        deliveryWeights.set(type, (deliveryWeights.get(type) || 0) + weight);
      }
    }

    // Map to performance types
    if (badgeToPerformance[badge]) {
      for (const { type, weight } of badgeToPerformance[badge]) {
        performanceWeights.set(type, (performanceWeights.get(type) || 0) + weight);
      }
    }
  }

  return {
    content: contentWeights,
    delivery: deliveryWeights,
    performance: performanceWeights,
  };
}

// =====================================================
// AUTO-SELECTION ALGORITHM
// =====================================================

/**
 * Automatically select content for a battler based on badges and league demographics
 *
 * Strategy:
 * 1. Create weight map from badges
 * 2. Boost weights for league's dominant demographic preferences
 * 3. Add some randomness for variety
 * 4. Select top weighted types
 */
export function autoSelectContent(
  styleTags: string[],
  leagueName: string,
  roundIndex: number // For variety across rounds
): ContentSelection {
  const weights = createBadgeWeightMap(styleTags);

  // Boost weights based on league demographics
  const dominantDemo = getDominantDemographic(leagueName);

  // Apply crowd preference boost
  for (const [contentType, weight] of weights.content.entries()) {
    const crowdPref = calculateCrowdPreference(leagueName, contentType);
    weights.content.set(contentType, weight * crowdPref);
  }

  for (const [deliveryType, weight] of weights.delivery.entries()) {
    const crowdPref = calculateCrowdPreference(leagueName, deliveryType);
    weights.delivery.set(deliveryType, weight * crowdPref);
  }

  for (const [performanceType, weight] of weights.performance.entries()) {
    const crowdPref = calculateCrowdPreference(leagueName, performanceType);
    weights.performance.set(performanceType, weight * crowdPref);
  }

  // Add default weights for unweighted types (allow diversity)
  const allContentTypes = getAllContentTypes().map(ct => ct.id);
  const allDeliveryTypes = getAllDeliveryTypes().map(dt => dt.id);
  const allPerformanceTypes = getAllPerformanceTypes().map(pt => pt.id);

  for (const ct of allContentTypes) {
    if (!weights.content.has(ct)) {
      weights.content.set(ct, 0.5); // Low default weight
    }
  }

  for (const dt of allDeliveryTypes) {
    if (!weights.delivery.has(dt)) {
      weights.delivery.set(dt, 0.5);
    }
  }

  for (const pt of allPerformanceTypes) {
    if (!weights.performance.has(pt)) {
      weights.performance.set(pt, 0.5);
    }
  }

  // Add randomness for variety (±20%)
  const seed = roundIndex; // Simple seeding for round-based variation
  for (const [type, weight] of weights.content.entries()) {
    const randomFactor = 0.8 + ((Math.abs(Math.sin(seed + type.length)) * 0.4)); // 0.8 - 1.2
    weights.content.set(type, weight * randomFactor);
  }

  for (const [type, weight] of weights.delivery.entries()) {
    const randomFactor = 0.8 + ((Math.abs(Math.sin(seed + type.length + 10)) * 0.4));
    weights.delivery.set(type, weight * randomFactor);
  }

  for (const [type, weight] of weights.performance.entries()) {
    const randomFactor = 0.8 + ((Math.abs(Math.sin(seed + type.length + 20)) * 0.4));
    weights.performance.set(type, weight * randomFactor);
  }

  // Select top weighted types
  const sortedContent = Array.from(weights.content.entries())
    .sort((a, b) => b[1] - a[1]);
  const sortedDelivery = Array.from(weights.delivery.entries())
    .sort((a, b) => b[1] - a[1]);
  const sortedPerformance = Array.from(weights.performance.entries())
    .sort((a, b) => b[1] - a[1]);

  // Select 3-4 content types (vary by round for diversity)
  const contentCount = roundIndex === 2 ? 4 : 3; // Round 2 gets 4 types
  const contentTypes = sortedContent.slice(0, contentCount).map(([type]) => type);

  // Select 1-2 delivery types
  const deliveryCount = roundIndex === 3 ? 2 : 1; // Round 3 gets 2 types
  const deliveryTypes = sortedDelivery.slice(0, deliveryCount).map(([type]) => type);

  // Select 1-2 performance types
  const performanceCount = roundIndex === 1 ? 1 : 2; // Round 1 gets 1 type
  const performanceTypes = sortedPerformance.slice(0, performanceCount).map(([type]) => type);

  return {
    contentTypes,
    deliveryTypes,
    performanceTypes,
  };
}

// =====================================================
// EFFECTIVENESS FORECASTING
// =====================================================

/**
 * Calculate effectiveness forecast for your content vs opponent's content
 */
export function calculateEffectivenessForecast(
  yourSelection: ContentSelection,
  opponentSelection: ContentSelection,
  leagueName: string,
  context: ScoringContext
): EffectivenessForecast {
  const allYourTypes = [
    ...yourSelection.contentTypes,
    ...yourSelection.deliveryTypes,
    ...yourSelection.performanceTypes,
  ];

  const allOpponentTypes = [
    ...opponentSelection.contentTypes,
    ...opponentSelection.deliveryTypes,
    ...opponentSelection.performanceTypes,
  ];

  // LEVER 1 — Effectiveness: your picks vs theirs. Coverage model (see
  // contentEffectiveness.calculateAverageEffectiveness): rewards the fraction of
  // your arsenal that lands a hard counter, penalizes what walks into theirs.
  const averageEffectiveness = calculateAverageEffectiveness(allYourTypes, allOpponentTypes);

  // LEVER 2 — This crowd: does THIS league's crowd ride for your styles? Derived
  // from the league's crowd demographics / profile. (Previously this box was a
  // BUG: it re-ran the CONTEXT modifier, so finalMultiplier squared context and
  // the real crowd system was never used.)
  const crowdPreference = calculateAverageCrowdPreference(allYourTypes, leagueName);

  // LEVER 3 — The room: does your material travel in this venue (in-building vs
  // PPV vs on-cam), including any league-specific room adjustment?
  const contextModifier = calculateAverageContextModifier(allYourTypes, context, leagueName);

  // Three DISTINCT levers combine into the round's content multiplier.
  const finalMultiplier = averageEffectiveness * crowdPreference * contextModifier;

  // Find strong and weak matchups
  const strongAgainst: (ContentType | DeliveryType | PerformanceType)[] = [];
  const weakAgainst: (ContentType | DeliveryType | PerformanceType)[] = [];

  for (const yourType of allYourTypes) {
    for (const oppType of allOpponentTypes) {
      const effectiveness = getEffectiveness(yourType, oppType);
      if (effectiveness === 2.0 && !strongAgainst.includes(oppType)) {
        strongAgainst.push(oppType);
      } else if (effectiveness === 0.5 && !weakAgainst.includes(oppType)) {
        weakAgainst.push(oppType);
      }
    }
  }

  return {
    averageEffectiveness,
    crowdPreference,
    contextModifier,
    finalMultiplier,
    strongAgainst,
    weakAgainst,
  };
}

/**
 * Predict opponent's likely content selection (for manual mode forecasting)
 */
export function predictOpponentContent(
  opponentStyleTags: string[],
  leagueName: string,
  roundIndex: number
): ContentSelection {
  // Use same auto-selection algorithm
  return autoSelectContent(opponentStyleTags, leagueName, roundIndex);
}

// =====================================================
// RECOMMENDATION ENGINE
// =====================================================

/**
 * Recommend content selection based on battler's badges and strategic considerations
 */
export function recommendContent(
  styleTags: string[],
  leagueName: string,
  roundIndex: number,
  opponentStyleTags?: string[]
): ContentSelection & { reasoning: string } {
  // Start with auto-selected content
  let selection = autoSelectContent(styleTags, leagueName, roundIndex);

  let reasoning = `Based on your badges, this selection plays to your strengths in ${leagueName}.`;

  // If we know opponent's style, optimize against them
  if (opponentStyleTags) {
    const predictedOppContent = predictOpponentContent(opponentStyleTags, leagueName, roundIndex);
    const forecast = calculateEffectivenessForecast(
      selection,
      predictedOppContent,
      leagueName,
      'ppv' // Default to ppv context
    );

    if (forecast.strongAgainst.length > 0) {
      reasoning += ` Strong against opponent's likely ${forecast.strongAgainst.slice(0, 2).join(', ')}.`;
    }

    if (forecast.weakAgainst.length > 0) {
      reasoning += ` Note: May struggle against their ${forecast.weakAgainst[0]}.`;
    }
  }

  return {
    ...selection,
    reasoning,
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get content selection for a specific battler/round from database selections
 */
export function extractContentTypes(selection: ContentSelection): {
  contentTypes: ContentType[];
  deliveryTypes: DeliveryType[];
  performanceTypes: PerformanceType[];
} {
  return {
    contentTypes: selection.contentTypes,
    deliveryTypes: selection.deliveryTypes,
    performanceTypes: selection.performanceTypes,
  };
}

/**
 * Format content selection for display
 */
export function formatContentSelection(selection: ContentSelection): string {
  const contentStr = selection.contentTypes.join(', ');
  const deliveryStr = selection.deliveryTypes.join(', ');
  const performanceStr = selection.performanceTypes.join(', ');

  return `Content: ${contentStr} | Delivery: ${deliveryStr} | Performance: ${performanceStr}`;
}
