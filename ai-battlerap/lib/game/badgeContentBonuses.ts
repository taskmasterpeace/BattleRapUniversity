/**
 * Badge-to-Content Bonuses System
 *
 * Maps badges to content types they boost, providing small percentage bonuses
 * (5-10%) similar to how choke/stumble calculations work.
 *
 * This creates soft specialization where battlers are slightly better at
 * content matching their badges, without hard-gating access to content types.
 */

import type { ContentType, DeliveryType, PerformanceType } from './contentTypes';

// =====================================================
// TYPES
// =====================================================

export interface BadgeContentBonus {
  badgeCode: string;
  badgeName: string;
  contentTypes: (ContentType | DeliveryType | PerformanceType)[];
  bonusPercent: number; // 0.05 = 5%, 0.10 = 10%
}

export interface BattlerContentBonuses {
  badges: string[];
  bonuses: {
    contentType: ContentType | DeliveryType | PerformanceType;
    totalBonus: number;
    contributingBadges: string[];
  }[];
}

// =====================================================
// BADGE → CONTENT TYPE MAPPINGS
// =====================================================

/**
 * Writing & Content Badges
 * These boost specific content types
 */
const WRITING_BADGE_BONUSES: BadgeContentBonus[] = [
  // Punchline specialists
  {
    badgeCode: 'PUNCHLINE_KING',
    badgeName: 'Punchline King/Queen',
    contentTypes: ['punchlines'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'HARD_HITTING_HAYMAKERS',
    badgeName: 'Hard-Hitting Haymakers',
    contentTypes: ['punchlines', 'gun_bars'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'GREAT_SETUPS',
    badgeName: 'Great Setups',
    contentTypes: ['punchlines', 'schemes'],
    bonusPercent: 0.05,
  },

  // Scheme/Technical specialists
  {
    badgeCode: 'SCHEME_SPECIALIST',
    badgeName: 'Scheme Specialist',
    contentTypes: ['schemes'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'MULTISYLLABIC_MASTER',
    badgeName: 'Multisyllabic Master',
    contentTypes: ['schemes', 'wordplay'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'INTRICATE_SCHEMES',
    badgeName: 'Intricate Schemes',
    contentTypes: ['schemes'],
    bonusPercent: 0.05,
  },

  // Wordplay specialists
  {
    badgeCode: 'WORDPLAY_WIZARD',
    badgeName: 'Wordplay Wizard',
    contentTypes: ['wordplay'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'DOUBLE_ENTENDRE_EXPERT',
    badgeName: 'Double Entendre Expert',
    contentTypes: ['wordplay', 'name_flips'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'WITTY_WORDPLAY',
    badgeName: 'Witty Wordplay',
    contentTypes: ['wordplay', 'comedy'],
    bonusPercent: 0.05,
  },
  {
    badgeCode: 'METAPHOR_MASTER',
    badgeName: 'Metaphor Master',
    contentTypes: ['wordplay', 'schemes'],
    bonusPercent: 0.06,
  },

  // Comedy/Humor specialists
  {
    badgeCode: 'COMEDY_SPECIALIST',
    badgeName: 'Comedy Specialist',
    contentTypes: ['comedy'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'JOKE_MASTER',
    badgeName: 'Joke Master',
    contentTypes: ['comedy', 'name_flips'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'WELL_TIMED_HUMOR',
    badgeName: 'Well-Timed Humor',
    contentTypes: ['comedy'],
    bonusPercent: 0.05,
  },
  {
    badgeCode: 'SARCASM_EXPERT',
    badgeName: 'Sarcasm Expert',
    contentTypes: ['comedy', 'personals'],
    bonusPercent: 0.05,
  },

  // Personal/Research specialists
  {
    badgeCode: 'ANGLE_MASTER',
    badgeName: 'Angle Master',
    contentTypes: ['personals'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'WELL_RESEARCHED',
    badgeName: 'Well Researched',
    contentTypes: ['personals'],
    bonusPercent: 0.06,
  },

  // Freestyle/Rebuttal specialists
  {
    badgeCode: 'FREESTYLE_GENIUS',
    badgeName: 'Freestyle Genius',
    contentTypes: ['freestyles', 'rebuttals'],
    bonusPercent: 0.10, // Higher bonus for rare skill
  },
  {
    badgeCode: 'REBUTTAL_KING',
    badgeName: 'Rebuttal King/Queen',
    contentTypes: ['rebuttals', 'freestyles'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'QUICK_THINKER',
    badgeName: 'Quick Thinker',
    contentTypes: ['rebuttals'],
    bonusPercent: 0.05,
  },

  // Storytelling specialists
  {
    badgeCode: 'STORYTELLING_MASTER',
    badgeName: 'Storytelling Master',
    contentTypes: ['storytelling'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'NARRATIVE_DRIVEN',
    badgeName: 'Narrative Driven',
    contentTypes: ['storytelling'],
    bonusPercent: 0.05,
  },
  {
    badgeCode: 'VIVID_IMAGERY',
    badgeName: 'Vivid Imagery',
    contentTypes: ['storytelling', 'schemes'],
    bonusPercent: 0.05,
  },

  // Street/Gun bar specialists
  {
    badgeCode: 'STREET_BATTLER',
    badgeName: 'Street Battler',
    contentTypes: ['street_talk', 'gun_bars'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'GRITTY',
    badgeName: 'Gritty',
    contentTypes: ['street_talk'],
    bonusPercent: 0.05,
  },

  // Pop culture/Reference specialists
  {
    badgeCode: 'POP_CULTURE_MASTER',
    badgeName: 'Pop Culture Master',
    contentTypes: ['pop_culture_refs'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'HISTORICAL_REFERENCES',
    badgeName: 'Historical References',
    contentTypes: ['pop_culture_refs', 'social_commentary'],
    bonusPercent: 0.05,
  },

  // Name flip specialists
  {
    badgeCode: 'NAME_FLIP_SPECIALIST',
    badgeName: 'Name Flip Specialist',
    contentTypes: ['name_flips'],
    bonusPercent: 0.06,
  },

  // Shock value specialists
  {
    badgeCode: 'SHOCK_VALUE',
    badgeName: 'Shock Value',
    contentTypes: ['shock_value'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'CONTROVERSIAL',
    badgeName: 'Controversial',
    contentTypes: ['shock_value', 'personals'],
    bonusPercent: 0.05,
  },

  // Social commentary specialists
  {
    badgeCode: 'POLITICAL_COMMENTARY',
    badgeName: 'Political Commentary',
    contentTypes: ['social_commentary'],
    bonusPercent: 0.05,
  },
  {
    badgeCode: 'SOCIAL_COMMENTARY',
    badgeName: 'Social Commentary',
    contentTypes: ['social_commentary'],
    bonusPercent: 0.05,
  },

  // Elite/General writing badges
  {
    badgeCode: 'PEN_GAME_ELITE',
    badgeName: 'Pen Game Elite',
    contentTypes: ['wordplay', 'schemes', 'punchlines'],
    bonusPercent: 0.05, // Smaller per-type but applies to multiple
  },
  {
    badgeCode: 'CREATIVITY_BEAST',
    badgeName: 'Creativity Beast',
    contentTypes: ['schemes', 'storytelling'],
    bonusPercent: 0.05,
  },
];

/**
 * Delivery Badges
 * These boost specific delivery types
 */
const DELIVERY_BADGE_BONUSES: BadgeContentBonus[] = [
  {
    badgeCode: 'AGGRESSIVE_DELIVERY',
    badgeName: 'Aggressive Delivery',
    contentTypes: ['aggressive'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'MENACING_PRESENCE',
    badgeName: 'Menacing Presence',
    contentTypes: ['aggressive'],
    bonusPercent: 0.05,
  },
  {
    badgeCode: 'SMOOTH_FLOW',
    badgeName: 'Smooth Flow',
    contentTypes: ['smooth_flow'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'SPEED_RAPPER',
    badgeName: 'Speed Rapper',
    contentTypes: ['speed_rapping'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'SLOW_FLOW',
    badgeName: 'Slow Flow',
    contentTypes: ['nonchalant'],  // Slow, deliberate delivery maps to nonchalant
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'CHOPPY_FLOW',
    badgeName: 'Choppy Flow',
    contentTypes: ['staccato'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'PASSIONATE',
    badgeName: 'Passionate',
    contentTypes: ['passionate'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'NONCHALANT',
    badgeName: 'Nonchalant',
    contentTypes: ['nonchalant'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'CONVERSATIONAL',
    badgeName: 'Conversational',
    contentTypes: ['conversational'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'MELODIC',
    badgeName: 'Melodic',
    contentTypes: ['smooth_flow'],  // Melodic delivery maps to smooth_flow
    bonusPercent: 0.06,
  },
];

/**
 * Performance Badges
 * These boost specific performance types
 */
const PERFORMANCE_BADGE_BONUSES: BadgeContentBonus[] = [
  {
    badgeCode: 'STAGE_DOMINATION',
    badgeName: 'Stage Domination',
    contentTypes: ['stage_presence'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'HIGH_ENERGY_PERFORMER',
    badgeName: 'High Energy Performer',
    contentTypes: ['stage_presence'],
    bonusPercent: 0.05,
  },
  {
    badgeCode: 'CROWD_CONTROL_MASTER',
    badgeName: 'Crowd Control Master',
    contentTypes: ['crowd_interaction'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'CHARISMATIC',
    badgeName: 'Charismatic',
    contentTypes: ['charismatic', 'crowd_interaction'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'THEATRICAL',
    badgeName: 'Theatrical',
    contentTypes: ['theatrical'],
    bonusPercent: 0.08,
  },
  {
    badgeCode: 'MINIMALIST',
    badgeName: 'Minimalist',
    contentTypes: ['minimalist'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'DYNAMIC_RANGE',
    badgeName: 'Dynamic Range',
    contentTypes: ['dynamic_range'],
    bonusPercent: 0.06,
  },
  {
    badgeCode: 'STRATEGIC_PAUSES',
    badgeName: 'Strategic Pauses',
    contentTypes: ['strategic_pauses'],
    bonusPercent: 0.06,
  },
];

// Combined list of all badge bonuses
export const ALL_BADGE_CONTENT_BONUSES: BadgeContentBonus[] = [
  ...WRITING_BADGE_BONUSES,
  ...DELIVERY_BADGE_BONUSES,
  ...PERFORMANCE_BADGE_BONUSES,
];

// =====================================================
// CALCULATION FUNCTIONS
// =====================================================

/**
 * Get the bonus multiplier for a specific content type based on battler's badges
 *
 * @param badges - Array of badge codes the battler has
 * @param contentType - The content type to check bonus for
 * @returns Bonus multiplier (e.g., 1.08 for 8% bonus, 1.0 for no bonus)
 */
export function getContentBonusMultiplier(
  badges: string[],
  contentType: ContentType | DeliveryType | PerformanceType
): number {
  if (!badges || badges.length === 0) {
    return 1.0;
  }

  const badgeSet = new Set(badges.map(b => b.toUpperCase()));
  let totalBonus = 0;

  for (const bonusDef of ALL_BADGE_CONTENT_BONUSES) {
    if (badgeSet.has(bonusDef.badgeCode.toUpperCase())) {
      if (bonusDef.contentTypes.includes(contentType)) {
        totalBonus += bonusDef.bonusPercent;
      }
    }
  }

  // Cap total bonus at 20% to prevent stacking becoming too powerful
  const cappedBonus = Math.min(totalBonus, 0.20);

  return 1.0 + cappedBonus;
}

/**
 * Get all content bonuses for a battler based on their badges
 *
 * @param badges - Array of badge codes the battler has
 * @returns Object containing all bonuses organized by content type
 */
export function getAllContentBonuses(badges: string[]): BattlerContentBonuses {
  if (!badges || badges.length === 0) {
    return { badges: [], bonuses: [] };
  }

  const badgeSet = new Set(badges.map(b => b.toUpperCase()));
  const bonusMap = new Map<
    ContentType | DeliveryType | PerformanceType,
    { total: number; badges: string[] }
  >();

  for (const bonusDef of ALL_BADGE_CONTENT_BONUSES) {
    if (badgeSet.has(bonusDef.badgeCode.toUpperCase())) {
      for (const contentType of bonusDef.contentTypes) {
        const existing = bonusMap.get(contentType) || { total: 0, badges: [] };
        existing.total += bonusDef.bonusPercent;
        existing.badges.push(bonusDef.badgeName);
        bonusMap.set(contentType, existing);
      }
    }
  }

  const bonuses = Array.from(bonusMap.entries())
    .map(([contentType, data]) => ({
      contentType,
      totalBonus: Math.min(data.total, 0.20), // Cap at 20%
      contributingBadges: data.badges,
    }))
    .filter(b => b.totalBonus > 0)
    .sort((a, b) => b.totalBonus - a.totalBonus);

  return { badges, bonuses };
}

/**
 * Calculate total effectiveness including badge bonuses
 *
 * @param baseEffectiveness - Base effectiveness from content matchup (e.g., 1.0, 2.0, 0.5)
 * @param badges - Array of badge codes the battler has
 * @param contentTypes - Content types the battler is using
 * @returns Total effectiveness multiplier including badge bonuses
 */
export function calculateEffectivenessWithBadges(
  baseEffectiveness: number,
  badges: string[],
  contentTypes: (ContentType | DeliveryType | PerformanceType)[]
): number {
  if (!badges || badges.length === 0 || contentTypes.length === 0) {
    return baseEffectiveness;
  }

  // Calculate average badge bonus across used content types
  let totalBadgeBonus = 0;
  let bonusCount = 0;

  for (const contentType of contentTypes) {
    const multiplier = getContentBonusMultiplier(badges, contentType);
    if (multiplier > 1.0) {
      totalBadgeBonus += multiplier - 1.0;
      bonusCount++;
    }
  }

  // Average the badge bonus if any bonuses apply
  const avgBadgeBonus = bonusCount > 0 ? totalBadgeBonus / contentTypes.length : 0;

  // Apply badge bonus additively to base effectiveness
  return baseEffectiveness * (1.0 + avgBadgeBonus);
}

/**
 * Get badge bonus summary for display in UI
 *
 * @param badges - Array of badge codes
 * @param contentTypes - Content types being used
 * @returns Array of badge bonus descriptions for UI display
 */
export function getBadgeBonusSummary(
  badges: string[],
  contentTypes: (ContentType | DeliveryType | PerformanceType)[]
): { badge: string; content: string; bonus: number }[] {
  if (!badges || badges.length === 0) {
    return [];
  }

  const badgeSet = new Set(badges.map(b => b.toUpperCase()));
  const contentSet = new Set(contentTypes);
  const summary: { badge: string; content: string; bonus: number }[] = [];

  for (const bonusDef of ALL_BADGE_CONTENT_BONUSES) {
    if (badgeSet.has(bonusDef.badgeCode.toUpperCase())) {
      for (const contentType of bonusDef.contentTypes) {
        if (contentSet.has(contentType)) {
          summary.push({
            badge: bonusDef.badgeName,
            content: contentType.replace(/_/g, ' '),
            bonus: bonusDef.bonusPercent,
          });
        }
      }
    }
  }

  return summary;
}

/**
 * Format badge bonus as percentage string
 */
export function formatBadgeBonus(bonus: number): string {
  return `+${(bonus * 100).toFixed(0)}%`;
}

// =====================================================
// EXPORTS FOR INTEGRATION
// =====================================================

export {
  WRITING_BADGE_BONUSES,
  DELIVERY_BADGE_BONUSES,
  PERFORMANCE_BADGE_BONUSES,
};
