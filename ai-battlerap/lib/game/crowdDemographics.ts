/**
 * Content/Style System - Crowd Demographics Configuration
 *
 * Defines 5 battle rap fan types and their content preferences.
 * Different leagues have different demographic distributions.
 *
 * Research sources: URL, KOTD, Don't Flop crowd analysis
 */

import { ContentType, DeliveryType, PerformanceType } from './contentTypes';

// =====================================================
// CROWD DEMOGRAPHIC TYPES
// =====================================================

export type CrowdDemographic =
  | 'purists'
  | 'street_fans'
  | 'comedy_fans'
  | 'aggression_fans'
  | 'performance_fans';

export interface ContentPreference {
  contentType: ContentType | DeliveryType | PerformanceType;
  multiplier: number; // e.g., 1.35 = +35% bonus
}

export interface CrowdDemographicDef {
  id: CrowdDemographic;
  name: string;
  description: string;
  values: string; // What this demographic values most
  topPreferences: ContentPreference[]; // Top 3-5 content they favor
  dislikes: ContentPreference[]; // Content they penalize
  realWorldExample: string;
  typicalLeague: string;
}

// =====================================================
// CROWD DEMOGRAPHIC DEFINITIONS
// =====================================================

export const CROWD_DEMOGRAPHICS: Record<CrowdDemographic, CrowdDemographicDef> = {
  purists: {
    id: 'purists',
    name: 'Purists (Tech Heads)',
    description: 'Value technical writing, complexity, lyrical skill above all else',
    values: 'The bars matter most - wordplay, schemes, technical excellence',
    topPreferences: [
      { contentType: 'wordplay', multiplier: 1.35 },
      { contentType: 'schemes', multiplier: 1.30 },
      { contentType: 'freestyles', multiplier: 1.25 },
      { contentType: 'storytelling', multiplier: 1.15 },
      { contentType: 'social_commentary', multiplier: 1.10 },
    ],
    dislikes: [
      { contentType: 'comedy', multiplier: 0.85 },
      { contentType: 'gun_bars', multiplier: 0.90 },
    ],
    realWorldExample: 'URL replay viewers, KOTD core fans, lyric analysis community',
    typicalLeague: 'Small Room Circuit (intimate setting for complexity)',
  },

  street_fans: {
    id: 'street_fans',
    name: 'Street Fans (Authenticity First)',
    description: 'Value realness, lived experience, street credibility',
    values: 'Authenticity, not being fake, living what you rap about',
    topPreferences: [
      { contentType: 'street_talk', multiplier: 1.40 },
      { contentType: 'gun_bars', multiplier: 1.30 },
      { contentType: 'personals', multiplier: 1.25 },
      { contentType: 'rebuttals', multiplier: 1.15 },
      { contentType: 'shock_value', multiplier: 1.10 },
    ],
    dislikes: [
      { contentType: 'wordplay', multiplier: 0.80 },
      { contentType: 'pop_culture_refs', multiplier: 0.85 },
    ],
    realWorldExample: 'URL in-building crowd, street-oriented leagues',
    typicalLeague: 'Main Stage Arena (high energy environment)',
  },

  comedy_fans: {
    id: 'comedy_fans',
    name: 'Comedy Fans (Entertainment)',
    description: 'Value entertainment, humor, being entertained above all',
    values: 'Fun, laughs, entertainment - battle rap should be enjoyable',
    topPreferences: [
      { contentType: 'comedy', multiplier: 1.40 },
      { contentType: 'name_flips', multiplier: 1.30 },
      { contentType: 'pop_culture_refs', multiplier: 1.25 },
      { contentType: 'punchlines', multiplier: 1.15 },
      { contentType: 'shock_value', multiplier: 1.10 },
    ],
    dislikes: [
      { contentType: 'schemes', multiplier: 0.90 },
      { contentType: 'social_commentary', multiplier: 0.85 },
    ],
    realWorldExample: 'Don\'t Flop crowds, casual viewers, entertainment-focused events',
    typicalLeague: 'Main Stage Arena (big crowd reactions)',
  },

  aggression_fans: {
    id: 'aggression_fans',
    name: 'Aggression Fans (Energy)',
    description: 'Value intensity, energy, aggressive performance and stage presence',
    values: 'Energy, passion, aggression - need intensity in the battle',
    topPreferences: [
      { contentType: 'gun_bars', multiplier: 1.35 },
      { contentType: 'aggressive', multiplier: 1.40 }, // Delivery type
      { contentType: 'theatrical', multiplier: 1.30 }, // Performance type
      { contentType: 'personals', multiplier: 1.20 },
      { contentType: 'rebuttals', multiplier: 1.15 },
    ],
    dislikes: [
      { contentType: 'smooth_flow', multiplier: 0.80 }, // Delivery type
      { contentType: 'minimalist', multiplier: 0.85 }, // Performance type
    ],
    realWorldExample: 'URL in-building, hometown crowds, high-energy events',
    typicalLeague: 'Main Stage Arena (energy fills large space)',
  },

  performance_fans: {
    id: 'performance_fans',
    name: 'Performance Fans (Showmanship)',
    description: 'Value theatrics, charisma, showmanship and entertainment value',
    values: 'Stage presence, charisma, putting on a show',
    topPreferences: [
      { contentType: 'charismatic', multiplier: 1.35 }, // Performance type
      { contentType: 'theatrical', multiplier: 1.35 }, // Performance type
      { contentType: 'crowd_interaction', multiplier: 1.30 }, // Performance type
      { contentType: 'comedy', multiplier: 1.20 },
      { contentType: 'storytelling', multiplier: 1.15 },
    ],
    dislikes: [
      { contentType: 'nonchalant', multiplier: 0.90 }, // Delivery type
      { contentType: 'minimalist', multiplier: 0.80 }, // Performance type
    ],
    realWorldExample: 'Main Stage events, PPV buyers, show-oriented crowds',
    typicalLeague: 'Main Stage Arena (big stage for big performance)',
  },
};

// =====================================================
// LEAGUE-SPECIFIC DEMOGRAPHIC DISTRIBUTIONS
// =====================================================

export interface LeagueDemographicDistribution {
  leagueName: string;
  demographics: Array<{
    demographic: CrowdDemographic;
    percentage: number; // 0-100
  }>;
}

export const LEAGUE_DEMOGRAPHICS: Record<string, LeagueDemographicDistribution> = {
  'Small Room Circuit': {
    leagueName: 'Small Room Circuit',
    demographics: [
      { demographic: 'purists', percentage: 45 },
      { demographic: 'street_fans', percentage: 25 },
      { demographic: 'comedy_fans', percentage: 15 },
      { demographic: 'aggression_fans', percentage: 10 },
      { demographic: 'performance_fans', percentage: 5 },
    ],
  },

  'Main Stage Arena': {
    leagueName: 'Main Stage Arena',
    demographics: [
      { demographic: 'performance_fans', percentage: 30 },
      { demographic: 'aggression_fans', percentage: 25 },
      { demographic: 'street_fans', percentage: 20 },
      { demographic: 'comedy_fans', percentage: 15 },
      { demographic: 'purists', percentage: 10 },
    ],
  },
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get demographic definition
 */
export function getCrowdDemographic(id: CrowdDemographic): CrowdDemographicDef {
  return CROWD_DEMOGRAPHICS[id];
}

/**
 * Get all demographic definitions
 */
export function getAllCrowdDemographics(): CrowdDemographicDef[] {
  return Object.values(CROWD_DEMOGRAPHICS);
}

/**
 * Get league demographic distribution
 */
export function getLeagueDemographics(leagueName: string): LeagueDemographicDistribution | null {
  return LEAGUE_DEMOGRAPHICS[leagueName] || null;
}

/**
 * Calculate crowd preference multiplier for a given content/delivery/performance type
 * based on the league's demographic distribution
 */
export function calculateCrowdPreference(
  leagueName: string,
  contentType: ContentType | DeliveryType | PerformanceType
): number {
  const distribution = getLeagueDemographics(leagueName);
  if (!distribution) return 1.0; // Neutral if league not found

  let weightedMultiplier = 0;

  for (const { demographic, percentage } of distribution.demographics) {
    const demographicDef = CROWD_DEMOGRAPHICS[demographic];
    const weight = percentage / 100;

    // Check if this demographic has a preference for this content type
    const preference = demographicDef.topPreferences.find(p => p.contentType === contentType);
    const dislike = demographicDef.dislikes.find(p => p.contentType === contentType);

    if (preference) {
      weightedMultiplier += (preference.multiplier - 1) * weight;
    } else if (dislike) {
      weightedMultiplier += (dislike.multiplier - 1) * weight;
    }
    // Else: neutral (0 contribution)
  }

  // Return final multiplier (1.0 = neutral, >1.0 = favored, <1.0 = disfavored)
  return 1.0 + weightedMultiplier;
}

/**
 * Get the dominant demographic for a league
 */
export function getDominantDemographic(leagueName: string): CrowdDemographic | null {
  const distribution = getLeagueDemographics(leagueName);
  if (!distribution) return null;

  let maxPercentage = 0;
  let dominant: CrowdDemographic | null = null;

  for (const { demographic, percentage } of distribution.demographics) {
    if (percentage > maxPercentage) {
      maxPercentage = percentage;
      dominant = demographic;
    }
  }

  return dominant;
}

/**
 * Get a description of the crowd vibe for a league
 */
export function getLeagueCrowdDescription(leagueName: string): string {
  const distribution = getLeagueDemographics(leagueName);
  if (!distribution) return 'General battle rap audience';

  const dominant = getDominantDemographic(leagueName);
  if (!dominant) return 'Mixed crowd demographics';

  const demographicDef = CROWD_DEMOGRAPHICS[dominant];
  return `${demographicDef.name} dominated - ${demographicDef.values}`;
}
