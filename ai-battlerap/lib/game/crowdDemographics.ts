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
// LEAGUE CROWD PROFILES (derive preference for ANY league)
// =====================================================
// The demographic distributions above only cover two named leagues, so the OLD
// calculateCrowdPreference returned a flat 1.0 for every REAL league in the
// game — the "This crowd" term meant nothing. This section derives a sensible,
// non-flat crowd preference for ANY league from the numbers the leagues table
// actually carries: writing vs performance weight, crowd factor, prestige and
// personality style. (A technical/pen room rides for wordplay & schemes; a
// big-stage/loud room rides for punchlines, comedy & crowd-work; a
// street/aggressive room rides for personals, gun bars & street talk.)
//
// These constants would fit well in lib/game/config.ts later; they live here
// because this file's edit domain excludes config.ts.

export interface LeagueCrowdProfile {
  writingWeight: number; // 0..1 (leagues.writing_weight)
  performanceWeight: number; // 0..1 (leagues.performance_weight)
  crowdFactor: number; // ~0.10..0.80 (leagues.base_crowd_factor)
  prestige: number; // 1..10 (leagues.prestige_level)
  style: 'street' | 'aggressive' | 'technical' | 'diverse';
}

// Which crowd "family" each content/delivery/performance type reads as:
//   writing     = pen/technical rooms ride for it
//   performance = show/big-stage/loud rooms ride for it
//   street      = street/aggressive rooms ride for it
//   neutral     = travels anywhere (no strong crowd lean)
type CrowdTag = 'writing' | 'performance' | 'street' | 'neutral';

const TYPE_CROWD_TAG: Record<string, CrowdTag> = {
  // content (14)
  personals: 'street', wordplay: 'writing', schemes: 'writing', punchlines: 'performance',
  comedy: 'performance', storytelling: 'writing', gun_bars: 'street', street_talk: 'street',
  freestyles: 'neutral', rebuttals: 'street', pop_culture_refs: 'performance',
  name_flips: 'performance', shock_value: 'street', social_commentary: 'writing',
  // delivery (7)
  aggressive: 'street', smooth_flow: 'writing', speed_rapping: 'writing', staccato: 'writing',
  passionate: 'performance', nonchalant: 'neutral', conversational: 'neutral',
  // performance (8)
  stage_presence: 'performance', crowd_interaction: 'performance', theatrical: 'performance',
  charismatic: 'performance', dynamic_range: 'performance', facial_expression: 'performance',
  strategic_pauses: 'writing', minimalist: 'writing',
};

// Real leagues (prod seed 20260826010000 + online rung 20260826030000), keyed
// by BOTH lowercased name AND short_code, because the effectiveness forecast
// only receives the league NAME. Fields mirror the leagues table.
const DEFAULT_PROFILE: LeagueCrowdProfile = {
  writingWeight: 0.5, performanceWeight: 0.5, crowdFactor: 0.55, prestige: 4, style: 'diverse',
};

const LEAGUE_PROFILES: Record<string, LeagueCrowdProfile> = {};
(function seedLeagueProfiles() {
  const rows: Array<[string, string, LeagueCrowdProfile]> = [
    ['TXW', 'Text Wars', { writingWeight: 0.85, performanceWeight: 0.15, crowdFactor: 0.10, prestige: 1, style: 'technical' }],
    ['APP', 'The App', { writingWeight: 0.55, performanceWeight: 0.45, crowdFactor: 0.30, prestige: 1, style: 'diverse' }],
    ['STC', 'Street Cipher', { writingWeight: 0.55, performanceWeight: 0.45, crowdFactor: 0.55, prestige: 2, style: 'street' }],
    ['IDW', 'I Do What I Want', { writingWeight: 0.45, performanceWeight: 0.55, crowdFactor: 0.58, prestige: 2, style: 'aggressive' }],
    ['YGS', 'You Got Smoked', { writingWeight: 0.40, performanceWeight: 0.60, crowdFactor: 0.68, prestige: 2, style: 'aggressive' }],
    ['GIG', 'Get It Get It', { writingWeight: 0.48, performanceWeight: 0.52, crowdFactor: 0.58, prestige: 3, style: 'street' }],
    ['GBA', 'Gunbarz Assembly', { writingWeight: 0.45, performanceWeight: 0.55, crowdFactor: 0.60, prestige: 3, style: 'street' }],
    ['MIL', 'Milwaukee Massacre', { writingWeight: 0.42, performanceWeight: 0.58, crowdFactor: 0.62, prestige: 3, style: 'aggressive' }],
    ['SLP', 'Slap', { writingWeight: 0.45, performanceWeight: 0.55, crowdFactor: 0.55, prestige: 3, style: 'street' }],
    ['MMA', 'Mic Masters Arena', { writingWeight: 0.62, performanceWeight: 0.38, crowdFactor: 0.55, prestige: 4, style: 'technical' }],
    ['BSL', 'Barz Supreme League', { writingWeight: 0.62, performanceWeight: 0.38, crowdFactor: 0.55, prestige: 5, style: 'technical' }],
    ['MSA', 'Main Stage Arena', { writingWeight: 0.32, performanceWeight: 0.68, crowdFactor: 0.72, prestige: 5, style: 'aggressive' }],
    ['FSY', 'Flow Syndicate', { writingWeight: 0.50, performanceWeight: 0.50, crowdFactor: 0.62, prestige: 5, style: 'diverse' }],
    ['SRC', 'Small Room Circuit', { writingWeight: 0.68, performanceWeight: 0.32, crowdFactor: 0.45, prestige: 5, style: 'technical' }],
    ['SFA', 'Spitfire Arena', { writingWeight: 0.48, performanceWeight: 0.52, crowdFactor: 0.75, prestige: 6, style: 'aggressive' }],
    ['UWL', 'Urban Warfare League', { writingWeight: 0.48, performanceWeight: 0.52, crowdFactor: 0.60, prestige: 6, style: 'street' }],
    ['BBB', 'Block Buster Battles', { writingWeight: 0.42, performanceWeight: 0.58, crowdFactor: 0.72, prestige: 6, style: 'aggressive' }],
    ['CCB', 'Crown City Battle League', { writingWeight: 0.58, performanceWeight: 0.42, crowdFactor: 0.60, prestige: 6, style: 'diverse' }],
    ['RTC', 'Respect The Craft', { writingWeight: 0.68, performanceWeight: 0.32, crowdFactor: 0.55, prestige: 8, style: 'technical' }],
    ['STF', 'Stay Forever', { writingWeight: 0.50, performanceWeight: 0.50, crowdFactor: 0.70, prestige: 8, style: 'diverse' }],
    ['RWS', 'Royal Wordsmiths', { writingWeight: 0.55, performanceWeight: 0.45, crowdFactor: 0.70, prestige: 10, style: 'technical' }],
  ];
  for (const [code, name, profile] of rows) {
    LEAGUE_PROFILES[code.toLowerCase()] = profile;
    LEAGUE_PROFILES[name.toLowerCase()] = profile;
  }
})();

// How much each style leans "street" (rewards personals/gun bars/street talk).
const CROWD_STYLE_STREET: Record<LeagueCrowdProfile['style'], number> = {
  street: 0.28, aggressive: 0.24, diverse: 0.08, technical: 0.0,
};

// Derivation gains — how strongly each appetite bends a type's preference. Kept
// modest so a single pick lands ~0.82..1.30 and a full round averages ~0.9..1.2.
const CROWD_WRITING_GAIN = 0.6; // writing types in a pen room
const CROWD_PERFORMANCE_GAIN = 0.5; // performance types in a show room
const CROWD_HEAT_GAIN = 0.5; // a loud room lifts performance types
const CROWD_STREET_GAIN = 1.0; // street appetite -> street types
const CROWD_ANTI_PEN_GAIN = 0.4; // pen rooms cool on generic street content
const CROWD_STREET_HEAT_GAIN = 0.3; // hot rooms lift street content a touch
const CROWD_PREF_FLOOR = 0.82;
const CROWD_PREF_CEIL = 1.30;

/**
 * Best-effort profile for a league we have no seeded row for: infer an
 * archetype from keywords in the name so a brand-new league still gets a
 * non-flat, sensible crowd read instead of silently defaulting to neutral.
 */
function inferProfileFromName(leagueName: string): LeagueCrowdProfile | null {
  const n = (leagueName || '').toLowerCase();
  const has = (...kw: string[]) => kw.some((k) => n.includes(k));
  // Technical / writers' rooms
  if (has('word', 'craft', 'pen', 'scheme', 'lyric', 'master', 'cipher', 'text', 'scholar'))
    return { writingWeight: 0.62, performanceWeight: 0.38, crowdFactor: 0.5, prestige: 5, style: 'technical' };
  // Street / aggression rooms
  if (has('street', 'gun', 'war', 'smoke', 'slap', 'block', 'gutter', 'massacre', 'buster', 'blood', 'grime'))
    return { writingWeight: 0.45, performanceWeight: 0.55, crowdFactor: 0.6, prestige: 3, style: 'street' };
  // Big-stage / performance rooms
  if (has('stage', 'arena', 'main', 'crown', 'royal', 'star', 'show', 'spotlight', 'flow', 'syndicate'))
    return { writingWeight: 0.4, performanceWeight: 0.6, crowdFactor: 0.7, prestige: 5, style: 'aggressive' };
  return null;
}

/**
 * Resolve a league to a crowd profile: seeded registry first, then keyword
 * inference, then any caller-supplied override merged on top. Returns null only
 * when there is nothing to go on (unknown name AND no override).
 */
function resolveLeagueProfile(
  leagueName: string,
  override?: Partial<LeagueCrowdProfile>
): LeagueCrowdProfile | null {
  const base =
    LEAGUE_PROFILES[(leagueName || '').toLowerCase()] || inferProfileFromName(leagueName);
  if (!base && !override) return null;
  return { ...(base || DEFAULT_PROFILE), ...(override || {}) };
}

/**
 * Derive a single content/delivery/performance type's crowd preference from a
 * league profile. Returns a bounded multiplier (CROWD_PREF_FLOOR..CEIL).
 */
function deriveTypePreference(
  profile: LeagueCrowdProfile,
  type: ContentType | DeliveryType | PerformanceType
): number {
  const tag = TYPE_CROWD_TAG[type] || 'neutral';
  const writingAppetite = profile.writingWeight - profile.performanceWeight; // + = pen room
  const crowdHeat = profile.crowdFactor - 0.6; // + = loud room
  const streetAppetite =
    (CROWD_STYLE_STREET[profile.style] ?? 0.1) - Math.max(0, profile.prestige - 4) * 0.02;

  let delta = 0;
  if (tag === 'writing') {
    delta = writingAppetite * CROWD_WRITING_GAIN;
  } else if (tag === 'performance') {
    delta = -writingAppetite * CROWD_PERFORMANCE_GAIN + crowdHeat * CROWD_HEAT_GAIN;
  } else if (tag === 'street') {
    delta =
      streetAppetite * CROWD_STREET_GAIN -
      Math.max(0, writingAppetite) * CROWD_ANTI_PEN_GAIN +
      crowdHeat * CROWD_STREET_HEAT_GAIN;
  } // neutral -> delta stays 0

  return Math.max(CROWD_PREF_FLOOR, Math.min(CROWD_PREF_CEIL, 1.0 + delta));
}

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
 * Crowd preference multiplier for a single content/delivery/performance type in
 * a given league.
 *
 * Reworked: this now DERIVES a preference for ANY league from its profile
 * (writing vs performance weight, crowd factor, prestige, style) instead of
 * returning a flat 1.0 for every league except the two with hand-authored
 * demographic distributions. An optional `override` lets a caller thread the
 * league's real numbers straight from the leagues row when it has them.
 *
 * Signature is backward compatible (the third arg is optional), so existing
 * two-argument callers keep working.
 */
export function calculateCrowdPreference(
  leagueName: string,
  contentType: ContentType | DeliveryType | PerformanceType,
  override?: Partial<LeagueCrowdProfile>
): number {
  const profile = resolveLeagueProfile(leagueName, override);
  if (profile) {
    return deriveTypePreference(profile, contentType);
  }

  // No seeded/inferable profile (e.g. a truly unknown test league). Fall back to
  // any explicit hand-authored demographic distribution, else true neutral.
  const distribution = getLeagueDemographics(leagueName);
  if (!distribution) return 1.0;

  let weightedMultiplier = 0;
  for (const { demographic, percentage } of distribution.demographics) {
    const demographicDef = CROWD_DEMOGRAPHICS[demographic];
    const weight = percentage / 100;
    const preference = demographicDef.topPreferences.find(p => p.contentType === contentType);
    const dislike = demographicDef.dislikes.find(p => p.contentType === contentType);
    if (preference) {
      weightedMultiplier += (preference.multiplier - 1) * weight;
    } else if (dislike) {
      weightedMultiplier += (dislike.multiplier - 1) * weight;
    }
  }
  return 1.0 + weightedMultiplier;
}

/**
 * Average crowd preference across a full round of picks for a league. This is
 * what the effectiveness forecast uses for its "This crowd" term, so that term
 * finally means what it says (the forecast previously mislabeled a squared
 * context modifier as crowd preference).
 */
export function calculateAverageCrowdPreference(
  types: (ContentType | DeliveryType | PerformanceType)[],
  leagueName: string,
  override?: Partial<LeagueCrowdProfile>
): number {
  if (types.length === 0) return 1.0;
  let total = 0;
  for (const t of types) total += calculateCrowdPreference(leagueName, t, override);
  return total / types.length;
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
