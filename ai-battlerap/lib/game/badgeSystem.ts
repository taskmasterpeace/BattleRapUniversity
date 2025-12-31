/**
 * Badge System Type Definitions and Constants
 *
 * This file defines the comprehensive badge system for the Battle Rap University game.
 * Badges are the primary driver of career path, life events, and choice outcomes.
 */

// ==========================================
// BADGE TYPE DEFINITIONS
// ==========================================

export type BadgeCategory =
  | 'writing'
  | 'performance'
  | 'content'
  | 'delivery'
  | 'reputation';

export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  category: BadgeCategory;
  level: BadgeLevel;
  isPositive: boolean; // true for positive badges, false for negative
}

export interface BattlerBadge {
  battlerId: string;
  badgeCode: string;
  earnedAt: Date;
  battleId?: string; // If earned from a specific battle
}

// ==========================================
// BADGE ARCHETYPE DEFINITIONS
// ==========================================

/**
 * Battler archetypes based on badge combinations
 * These determine which events trigger and how choices play out
 */
export type BattlerArchetype =
  | 'technical_writer'    // High writing badges, focuses on schemes/wordplay
  | 'performance_beast'   // High performance badges, crowd control specialist
  | 'freestyler'         // Improvisation and rebuttals
  | 'comedy_battler'     // Humor and entertainment
  | 'aggressive_battler' // Aggression and intimidation
  | 'storyteller'        // Narrative-driven content
  | 'wordplay_specialist'// Complex rhyme schemes and puns
  | 'crowd_favorite'     // High charisma and fan engagement
  | 'controversial'      // Drama and shock value
  | 'balanced'           // No dominant archetype

/**
 * Key badge codes that define archetypes
 */
export const ARCHETYPE_DEFINING_BADGES = {
  technical_writer: [
    'SCHEME_SPECIALIST',
    'MULTISYLLABIC_MASTER',
    'PEN_GAME_ELITE',
    'INTRICATE_SCHEMES'
  ],
  performance_beast: [
    'STAGE_DOMINATION',
    'CROWD_CONTROL_MASTER',
    'HIGH_ENERGY_PERFORMER',
    'CHARISMATIC'
  ],
  freestyler: [
    'FREESTYLE_GENIUS',
    'REBUTTAL_KING',
    'QUICK_THINKER',
    'IMPROVISATION_EXPERT'
  ],
  comedy_battler: [
    'COMEDY_SPECIALIST',
    'JOKE_MASTER',
    'WELL_TIMED_HUMOR',
    'SARCASM_EXPERT'
  ],
  aggressive_battler: [
    'AGGRESSIVE_DELIVERY',
    'MENACING_PRESENCE',
    'CONFRONTATIONAL',
    'INTENSE_GAZE'
  ],
  storyteller: [
    'STORYTELLING_MASTER',
    'NARRATIVE_DRIVEN',
    'VIVID_IMAGERY',
    'EMOTIONAL_DEPTH'
  ],
  wordplay_specialist: [
    'WORDPLAY_WIZARD',
    'DOUBLE_ENTENDRE_EXPERT',
    'WITTY_WORDPLAY',
    'NAME_FLIP_SPECIALIST'
  ],
  crowd_favorite: [
    'CROWD_FAVORITE',
    'FAN_ENGAGEMENT',
    'CHARISMATIC',
    'BELOVED_PERFORMER'
  ],
  controversial: [
    'DRAMA_STARTER',
    'CONTROVERSIAL_CONTENT',
    'SHOCK_VALUE',
    'PROVOCATIVE'
  ]
} as const;

/**
 * Negative badges that affect event outcomes
 */
export const NEGATIVE_BADGES = {
  choker: 'CHOKER',
  inconsistent: 'INCONSISTENT_PERFORMER',
  lazy_writer: 'LAZY_WRITER',
  mumbler: 'MUMBLER',
  drama_starter: 'DRAMA_STARTER',
  excuse_maker: 'EXCUSE_MAKER',
  canceller: 'CANCELLER',
  ghost_writer: 'GHOST_WRITER',
  reach_god: 'REACH_GOD',
  recycler: 'RECYCLER',
  biter: 'BITER'
} as const;

// ==========================================
// BADGE-BASED MODIFIERS
// ==========================================

/**
 * How badges modify choice outcome probabilities
 * Base probability is 50/50, badges shift this
 */
export interface ChoiceModifier {
  badgeCode: string;
  choiceType: 'composed' | 'risky' | 'technical' | 'improvised' | 'aggressive' | 'humble';
  probabilityBonus: number; // -0.3 to +0.3 (30% shift)
}

export const BADGE_CHOICE_MODIFIERS: ChoiceModifier[] = [
  // Performance badges favor risky public choices
  { badgeCode: 'STAGE_DOMINATION', choiceType: 'risky', probabilityBonus: 0.2 },
  { badgeCode: 'CROWD_CONTROL_MASTER', choiceType: 'risky', probabilityBonus: 0.15 },
  { badgeCode: 'CHARISMATIC', choiceType: 'risky', probabilityBonus: 0.15 },
  { badgeCode: 'HIGH_ENERGY_PERFORMER', choiceType: 'risky', probabilityBonus: 0.1 },

  // Technical writers favor composed responses
  { badgeCode: 'SCHEME_SPECIALIST', choiceType: 'composed', probabilityBonus: 0.2 },
  { badgeCode: 'PEN_GAME_ELITE', choiceType: 'composed', probabilityBonus: 0.15 },
  { badgeCode: 'MULTISYLLABIC_MASTER', choiceType: 'technical', probabilityBonus: 0.2 },

  // Freestylers favor improvised responses
  { badgeCode: 'FREESTYLE_GENIUS', choiceType: 'improvised', probabilityBonus: 0.25 },
  { badgeCode: 'REBUTTAL_KING', choiceType: 'improvised', probabilityBonus: 0.2 },
  { badgeCode: 'QUICK_THINKER', choiceType: 'improvised', probabilityBonus: 0.15 },

  // Aggressive battlers favor aggressive choices
  { badgeCode: 'AGGRESSIVE_DELIVERY', choiceType: 'aggressive', probabilityBonus: 0.2 },
  { badgeCode: 'MENACING_PRESENCE', choiceType: 'aggressive', probabilityBonus: 0.15 },
  { badgeCode: 'CONFRONTATIONAL', choiceType: 'aggressive', probabilityBonus: 0.15 },

  // Humble/professional badges favor composed choices
  { badgeCode: 'HUMBLE_WINNER', choiceType: 'humble', probabilityBonus: 0.2 },
  { badgeCode: 'CONSUMMATE_PROFESSIONAL', choiceType: 'composed', probabilityBonus: 0.15 },
  { badgeCode: 'RESPECTED_VETERAN', choiceType: 'composed', probabilityBonus: 0.15 },

  // Negative badges hurt various choice types
  { badgeCode: 'CHOKER', choiceType: 'risky', probabilityBonus: -0.2 },
  { badgeCode: 'DRAMA_STARTER', choiceType: 'composed', probabilityBonus: -0.15 },
  { badgeCode: 'INCONSISTENT_PERFORMER', choiceType: 'risky', probabilityBonus: -0.15 },
  { badgeCode: 'EXCUSE_MAKER', choiceType: 'humble', probabilityBonus: -0.2 }
];

// ==========================================
// BADGE UNLOCK CONDITIONS
// ==========================================

export interface BadgeUnlockCondition {
  badgeCode: string;
  condition: {
    // Battle result conditions
    consecutiveWins?: number;
    consecutiveLosses?: number;
    totalWins?: number;
    totalBattles?: number;

    // Performance conditions
    consecutiveChokes?: number;
    consecutiveDominantWins?: number; // 3-0 wins

    // Attribute conditions
    minAttribute?: { category: string; value: number };

    // Badge requirements (must have these badges first)
    requiredBadges?: string[];

    // Event-based unlocks
    specificEventResolution?: {
      eventCode: string;
      choice: 'a' | 'b';
    };

    // Behavior patterns
    behaviorPattern?: {
      type: 'drama_chain' | 'professional_streak' | 'controversial_choices';
      count: number;
    };
  };
}

export const BADGE_UNLOCK_CONDITIONS: BadgeUnlockCondition[] = [
  // Positive badge unlocks
  {
    badgeCode: 'DOMINANT_PERFORMER',
    condition: { consecutiveDominantWins: 3 }
  },
  {
    badgeCode: 'COMEBACK_KING',
    condition: {
      consecutiveWins: 3,
      requiredBadges: ['RESILIENT_BATTLER']
    }
  },
  {
    badgeCode: 'RESPECTED_VETERAN',
    condition: {
      totalBattles: 20,
      minAttribute: { category: 'reputation', value: 7 }
    }
  },

  // Negative badge unlocks
  {
    badgeCode: 'CHOKER',
    condition: { consecutiveChokes: 2 }
  },
  {
    badgeCode: 'DRAMA_STARTER',
    condition: {
      behaviorPattern: { type: 'drama_chain', count: 3 }
    }
  },
  {
    badgeCode: 'INCONSISTENT_PERFORMER',
    condition: {
      totalBattles: 10,
      // Logic: alternating wins and losses
    }
  }
];

// ==========================================
// BADGE EFFECT MULTIPLIERS
// ==========================================

/**
 * How badges modify life event effects
 * Some battlers are more affected by certain events than others
 */
export interface BadgeEffectMultiplier {
  badgeCode: string;
  affectsEventType: string; // Event template code pattern
  multiplier: number; // 0.5 to 2.0
  affectedStats?: string[]; // Which stats are modified
}

export const BADGE_EFFECT_MULTIPLIERS: BadgeEffectMultiplier[] = [
  // Performance battlers hurt more by voice/delivery issues
  {
    badgeCode: 'STAGE_DOMINATION',
    affectsEventType: 'VOICE_',
    multiplier: 1.5,
    affectedStats: ['stage_presence', 'delivery']
  },
  {
    badgeCode: 'CROWD_CONTROL_MASTER',
    affectsEventType: 'VENUE_CHANGE',
    multiplier: 0.7, // Less affected by venue changes
    affectedStats: ['resilience']
  },

  // Technical writers devastated by writer's block
  {
    badgeCode: 'PEN_GAME_ELITE',
    affectsEventType: 'WRITERS_BLOCK',
    multiplier: 2.0,
    affectedStats: ['lyricism', 'wordplay', 'creativity']
  },
  {
    badgeCode: 'SCHEME_SPECIALIST',
    affectsEventType: 'WRITERS_BLOCK',
    multiplier: 1.8,
    affectedStats: ['creativity']
  },

  // Freestylers barely affected by writer's block
  {
    badgeCode: 'FREESTYLE_GENIUS',
    affectsEventType: 'WRITERS_BLOCK',
    multiplier: 0.3,
    affectedStats: ['lyricism', 'wordplay']
  },

  // Drama starters amplify controversy effects
  {
    badgeCode: 'DRAMA_STARTER',
    affectsEventType: 'CONTROVERSIAL',
    multiplier: 1.5,
    affectedStats: ['reputation', 'public_knowledge']
  },

  // Professional battlers less affected by drama
  {
    badgeCode: 'CONSUMMATE_PROFESSIONAL',
    affectsEventType: 'DRAMA_',
    multiplier: 0.6,
    affectedStats: ['reputation', 'resilience']
  },

  // Chokers amplify pressure/choke events
  {
    badgeCode: 'CHOKER',
    affectsEventType: 'CHOKE_',
    multiplier: 1.5,
    affectedStats: ['resilience', 'stage_presence']
  }
];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Determine battler's primary archetype based on badges
 */
export function determineBattlerArchetype(badges: string[]): BattlerArchetype {
  const badgeSet = new Set(badges);

  // Count matches for each archetype
  const archetypeScores: Record<string, number> = {};

  for (const [archetype, definingBadges] of Object.entries(ARCHETYPE_DEFINING_BADGES)) {
    const matches = definingBadges.filter(badge => badgeSet.has(badge)).length;
    archetypeScores[archetype] = matches;
  }

  // Find highest scoring archetype
  const entries = Object.entries(archetypeScores);
  const maxScore = Math.max(...entries.map(([_, score]) => score));

  if (maxScore === 0) {
    return 'balanced';
  }

  const topArchetype = entries.find(([_, score]) => score === maxScore)?.[0];
  return (topArchetype as BattlerArchetype) || 'balanced';
}

/**
 * Check if battler has any negative badges
 */
export function hasNegativeBadges(badges: string[]): boolean {
  const badgeSet = new Set(badges);
  return Object.values(NEGATIVE_BADGES).some(badge => badgeSet.has(badge));
}

/**
 * Get all badges of a specific category
 */
export function getBadgesByCategory(badges: string[], category: BadgeCategory): string[] {
  // This would need a full badge registry, simplified for now
  return badges.filter(badge => {
    // In production, this would look up badge metadata
    return true;
  });
}

/**
 * Calculate total choice modifier for a battler's badges
 */
export function calculateChoiceModifier(
  badges: string[],
  choiceType: ChoiceModifier['choiceType']
): number {
  const badgeSet = new Set(badges);

  let totalModifier = 0;

  for (const modifier of BADGE_CHOICE_MODIFIERS) {
    if (badgeSet.has(modifier.badgeCode) && modifier.choiceType === choiceType) {
      totalModifier += modifier.probabilityBonus;
    }
  }

  // Cap at +/- 30%
  return Math.max(-0.3, Math.min(0.3, totalModifier));
}

/**
 * Calculate effect multiplier for an event based on badges
 */
export function calculateEffectMultiplier(
  badges: string[],
  eventCode: string
): number {
  const badgeSet = new Set(badges);
  let multiplier = 1.0;

  for (const modifier of BADGE_EFFECT_MULTIPLIERS) {
    if (badgeSet.has(modifier.badgeCode)) {
      // Check if event code matches pattern
      if (eventCode.startsWith(modifier.affectsEventType.replace('_', ''))) {
        multiplier *= modifier.multiplier;
      }
    }
  }

  return multiplier;
}
