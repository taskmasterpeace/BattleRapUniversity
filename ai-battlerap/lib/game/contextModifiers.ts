/**
 * Content/Style System - Context Modifiers Configuration
 *
 * Defines how content/delivery/performance scores differently based on context:
 * - In Building (smallest crowd, league-specific demographic, most biased)
 * - Pay-Per-View (medium crowd, invested fans)
 * - On Cam/Subscribers (largest crowd, general battle rap community, replay value)
 *
 * Based on real battle rap phenomenon: "crazy in the building but debatable on cam"
 */

import { ContentType, DeliveryType, PerformanceType } from './contentTypes';

// =====================================================
// CONTEXT TYPES
// =====================================================

export type ScoringContext = 'in_building' | 'ppv' | 'on_cam';

export interface ContextModifierDef {
  contentType: ContentType | DeliveryType | PerformanceType;
  inBuilding: number; // Multiplier for in-building score
  ppv: number; // Multiplier for PPV score
  onCam: number; // Multiplier for on-cam/subscriber score
  reasoning: string;
}

// =====================================================
// CONTEXT MODIFIERS
// =====================================================

export const CONTEXT_MODIFIERS: ContextModifierDef[] = [
  // DELIVERY TYPE MODIFIERS
  {
    contentType: 'aggressive',
    inBuilding: 1.4,
    ppv: 1.2,
    onCam: 0.9,
    reasoning: 'Energy translates live, looks excessive on replay',
  },
  {
    contentType: 'smooth_flow',
    inBuilding: 1.0,
    ppv: 1.1,
    onCam: 1.2,
    reasoning: 'Professional polish shines on quality playback',
  },
  {
    contentType: 'speed_rapping',
    inBuilding: 1.2,
    ppv: 1.1,
    onCam: 1.0,
    reasoning: 'Impressive live, needs rewatch to appreciate on cam',
  },
  {
    contentType: 'passionate',
    inBuilding: 1.2,
    ppv: 1.15,
    onCam: 1.05,
    reasoning: 'Emotion reads stronger in person',
  },
  {
    contentType: 'nonchalant',
    inBuilding: 0.9,
    ppv: 1.0,
    onCam: 1.1,
    reasoning: 'Confidence plays better on replay without crowd pressure',
  },

  // PERFORMANCE TYPE MODIFIERS
  {
    contentType: 'theatrical',
    inBuilding: 1.3,
    ppv: 1.1,
    onCam: 0.95,
    reasoning: 'Stage presence hits harder in person, less impactful on screen',
  },
  {
    contentType: 'crowd_interaction',
    inBuilding: 1.5,
    ppv: 1.3,
    onCam: 0.8,
    reasoning: 'Live participation creates energy, awkward on replay',
  },
  {
    contentType: 'stage_presence',
    inBuilding: 1.3,
    ppv: 1.15,
    onCam: 1.0,
    reasoning: 'Commanding presence felt more in person',
  },
  {
    contentType: 'charismatic',
    inBuilding: 1.2,
    ppv: 1.15,
    onCam: 1.1,
    reasoning: 'Charm works everywhere, slightly better live',
  },
  {
    contentType: 'strategic_pauses',
    inBuilding: 1.1,
    ppv: 1.05,
    onCam: 1.15,
    reasoning: 'Timing appreciated more when hearing clearly on cam',
  },
  {
    contentType: 'minimalist',
    inBuilding: 0.85,
    ppv: 0.95,
    onCam: 1.05,
    reasoning: 'Subtlety gets lost in live energy, shines on replay',
  },
  {
    contentType: 'facial_expression',
    inBuilding: 1.2,
    ppv: 1.1,
    onCam: 1.0,
    reasoning: 'Reactions more visible and impactful live',
  },
  {
    contentType: 'dynamic_range',
    inBuilding: 1.15,
    ppv: 1.1,
    onCam: 1.05,
    reasoning: 'Volume variation hits harder in person',
  },

  // CONTENT TYPE MODIFIERS
  {
    contentType: 'gun_bars',
    inBuilding: 1.2,
    ppv: 1.1,
    onCam: 0.9,
    reasoning: 'In-person threats feel more real, seem generic on cam',
  },
  {
    contentType: 'comedy',
    inBuilding: 1.3,
    ppv: 1.2,
    onCam: 1.1,
    reasoning: 'Live laughter infectious, still works on replay but slightly less',
  },
  {
    contentType: 'wordplay',
    inBuilding: 0.8,
    ppv: 1.0,
    onCam: 1.3,
    reasoning: 'Needs rewatch to catch layers, better appreciated on cam',
  },
  {
    contentType: 'schemes',
    inBuilding: 0.9,
    ppv: 1.0,
    onCam: 1.25,
    reasoning: 'Complex structures appreciated more on replay with pause/rewind',
  },
  {
    contentType: 'freestyles',
    inBuilding: 1.4,
    ppv: 1.2,
    onCam: 1.0,
    reasoning: 'Spontaneity impressive live, less obvious it\'s freestyle on cam',
  },
  {
    contentType: 'rebuttals',
    inBuilding: 1.3,
    ppv: 1.2,
    onCam: 1.0,
    reasoning: 'In-moment responses hit harder live',
  },
  {
    contentType: 'personals',
    inBuilding: 1.2,
    ppv: 1.15,
    onCam: 1.1,
    reasoning: 'Live discomfort palpable, still impactful on cam',
  },
  {
    contentType: 'pop_culture_refs',
    inBuilding: 1.2,
    ppv: 1.1,
    onCam: 1.0,
    reasoning: 'Crowd recognition creates live energy',
  },
  {
    contentType: 'storytelling',
    inBuilding: 1.0,
    ppv: 1.05,
    onCam: 1.1,
    reasoning: 'Narrative payoff better appreciated with full attention on replay',
  },
  {
    contentType: 'punchlines',
    inBuilding: 1.15,
    ppv: 1.1,
    onCam: 1.05,
    reasoning: 'Immediate reactions amplify punch impact live',
  },
  {
    contentType: 'name_flips',
    inBuilding: 1.3,
    ppv: 1.15,
    onCam: 1.0,
    reasoning: 'Crowd participation makes name flips hit harder live',
  },
  {
    contentType: 'shock_value',
    inBuilding: 1.25,
    ppv: 1.1,
    onCam: 0.95,
    reasoning: 'Gasps and reactions amplify shock live, feels cheap on replay',
  },
  {
    contentType: 'social_commentary',
    inBuilding: 0.95,
    ppv: 1.0,
    onCam: 1.1,
    reasoning: 'Depth appreciated more on thoughtful replay',
  },
  {
    contentType: 'street_talk',
    inBuilding: 1.15,
    ppv: 1.1,
    onCam: 1.0,
    reasoning: 'Authenticity reads stronger in person',
  },
];

// =====================================================
// LEAGUE-SPECIFIC MODIFIERS
// =====================================================

export interface LeagueContextModifiers {
  leagueName: string;
  inBuildingAdjustments: {
    contentType: ContentType | DeliveryType | PerformanceType;
    modifier: number;
  }[];
  description: string;
}

export const LEAGUE_CONTEXT_MODIFIERS: LeagueContextModifiers[] = [
  {
    leagueName: 'Small Room Circuit',
    description: 'Intimate setting amplifies technical content, reduces need for big energy',
    inBuildingAdjustments: [
      { contentType: 'wordplay', modifier: 1.0 }, // No penalty in small room (vs 0.8 in main stage)
      { contentType: 'schemes', modifier: 1.0 }, // No penalty in small room (vs 0.9 in main stage)
      { contentType: 'comedy', modifier: 0.9 }, // Smaller crowd, less reaction amplification
      { contentType: 'aggressive', modifier: 0.85 }, // Too much energy in small room feels forced
      { contentType: 'crowd_interaction', modifier: 1.2 }, // Reduced from 1.5 (smaller crowd)
    ],
  },
  {
    leagueName: 'Main Stage Arena',
    description: 'Large venue demands big presence, technical content harder to catch',
    inBuildingAdjustments: [
      { contentType: 'theatrical', modifier: 1.4 }, // Big stage demands big presence (increased from 1.3)
      { contentType: 'crowd_interaction', modifier: 1.6 }, // Larger crowd creates feedback loop (increased from 1.5)
      { contentType: 'aggressive', modifier: 1.5 }, // Energy needed to fill space (increased from 1.4)
      { contentType: 'wordplay', modifier: 0.7 }, // Harder to catch in loud environment (reduced from 0.8)
      { contentType: 'stage_presence', modifier: 1.4 }, // Commanding large space (increased from 1.3)
    ],
  },
];

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get context modifier for a specific content/delivery/performance type
 */
export function getContextModifier(
  contentType: ContentType | DeliveryType | PerformanceType,
  context: ScoringContext
): number {
  const modifierDef = CONTEXT_MODIFIERS.find(m => m.contentType === contentType);
  if (!modifierDef) return 1.0; // Neutral if not defined

  switch (context) {
    case 'in_building':
      return modifierDef.inBuilding;
    case 'ppv':
      return modifierDef.ppv;
    case 'on_cam':
      return modifierDef.onCam;
    default:
      return 1.0;
  }
}

/**
 * Get league-adjusted context modifier
 * Combines base modifier + league-specific adjustments
 */
export function getLeagueContextModifier(
  contentType: ContentType | DeliveryType | PerformanceType,
  context: ScoringContext,
  leagueName: string
): number {
  // Start with base modifier
  let baseModifier = getContextModifier(contentType, context);

  // Apply league adjustments ONLY for in_building context
  if (context === 'in_building') {
    const leagueModifiers = LEAGUE_CONTEXT_MODIFIERS.find(l => l.leagueName === leagueName);
    if (leagueModifiers) {
      const adjustment = leagueModifiers.inBuildingAdjustments.find(a => a.contentType === contentType);
      if (adjustment) {
        baseModifier = adjustment.modifier;
      }
    }
  }

  return baseModifier;
}

/**
 * Get reasoning for why a content type scores differently in different contexts
 */
export function getContextReasoning(
  contentType: ContentType | DeliveryType | PerformanceType
): string {
  const modifierDef = CONTEXT_MODIFIERS.find(m => m.contentType === contentType);
  return modifierDef?.reasoning || 'Context does not significantly affect this content type';
}

/**
 * Calculate average context modifier for multiple content types
 */
export function calculateAverageContextModifier(
  contentTypes: (ContentType | DeliveryType | PerformanceType)[],
  context: ScoringContext,
  leagueName?: string
): number {
  if (contentTypes.length === 0) return 1.0;

  let totalModifier = 0;
  for (const contentType of contentTypes) {
    if (leagueName) {
      totalModifier += getLeagueContextModifier(contentType, context, leagueName);
    } else {
      totalModifier += getContextModifier(contentType, context);
    }
  }

  return totalModifier / contentTypes.length;
}

/**
 * Get a description of how content performs in each context
 */
export function getContextPerformanceDescription(
  contentType: ContentType | DeliveryType | PerformanceType
): string {
  const modifierDef = CONTEXT_MODIFIERS.find(m => m.contentType === contentType);
  if (!modifierDef) return 'Performs consistently across all contexts';

  const best = Math.max(modifierDef.inBuilding, modifierDef.ppv, modifierDef.onCam);
  const worst = Math.min(modifierDef.inBuilding, modifierDef.ppv, modifierDef.onCam);

  if (best === modifierDef.inBuilding && worst === modifierDef.onCam) {
    return 'Best in building, weakest on camera - live energy content';
  } else if (best === modifierDef.onCam && worst === modifierDef.inBuilding) {
    return 'Best on camera, weakest in building - replay value content';
  } else if (best === modifierDef.ppv) {
    return 'Balanced across contexts, slight PPV advantage';
  } else {
    return 'Performs consistently across contexts';
  }
}

/**
 * Get context modifier definition (for UI display)
 */
export function getContextModifierDef(
  contentType: ContentType | DeliveryType | PerformanceType
): ContextModifierDef | null {
  return CONTEXT_MODIFIERS.find(m => m.contentType === contentType) || null;
}

/**
 * Determine which context this content is strongest in
 */
export function getBestContext(
  contentType: ContentType | DeliveryType | PerformanceType
): ScoringContext {
  const modifierDef = CONTEXT_MODIFIERS.find(m => m.contentType === contentType);
  if (!modifierDef) return 'on_cam'; // Default

  const max = Math.max(modifierDef.inBuilding, modifierDef.ppv, modifierDef.onCam);
  if (modifierDef.inBuilding === max) return 'in_building';
  if (modifierDef.ppv === max) return 'ppv';
  return 'on_cam';
}

/**
 * Determine which context this content is weakest in
 */
export function getWorstContext(
  contentType: ContentType | DeliveryType | PerformanceType
): ScoringContext {
  const modifierDef = CONTEXT_MODIFIERS.find(m => m.contentType === contentType);
  if (!modifierDef) return 'in_building'; // Default

  const min = Math.min(modifierDef.inBuilding, modifierDef.ppv, modifierDef.onCam);
  if (modifierDef.inBuilding === min) return 'in_building';
  if (modifierDef.ppv === min) return 'ppv';
  return 'on_cam';
}

/**
 * Get all context modifiers (for testing/debugging)
 */
export function getAllContextModifiers(): ContextModifierDef[] {
  return CONTEXT_MODIFIERS;
}
