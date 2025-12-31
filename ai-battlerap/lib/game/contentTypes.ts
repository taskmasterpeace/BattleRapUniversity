/**
 * Content/Style System - Content Types Configuration
 *
 * Defines all content, delivery, and performance types based on battle rap research.
 * Consolidates and trims the original spreadsheet to eliminate redundancy.
 *
 * Research sources: URL, KOTD, Don't Flop battles, Loaded Lux, Charlie Clips, etc.
 */

// =====================================================
// CONTENT TYPES (14 Total)
// =====================================================

export type ContentType =
  | 'personals'
  | 'wordplay'
  | 'schemes'
  | 'punchlines'
  | 'comedy'
  | 'storytelling'
  | 'gun_bars'
  | 'street_talk'
  | 'freestyles'
  | 'rebuttals'
  | 'pop_culture_refs'
  | 'name_flips'
  | 'shock_value'
  | 'social_commentary';

export interface ContentTypeDef {
  id: ContentType;
  name: string;
  description: string;
  consolidates: string[];  // What other types this replaced
  strategicIdentity: string;
  category: 'attack' | 'technical' | 'entertainment' | 'adaptive';
}

export const CONTENT_TYPES: Record<ContentType, ContentTypeDef> = {
  personals: {
    id: 'personals',
    name: 'Personals',
    description: 'Direct personal attacks targeting opponent\'s life, family, secrets',
    consolidates: ['Angles', 'Disrespect'],
    strategicIdentity: 'Deep psychological damage, makes opponent vulnerable',
    category: 'attack',
  },
  wordplay: {
    id: 'wordplay',
    name: 'Wordplay',
    description: 'Clever manipulation of words, double meanings, puns',
    consolidates: ['Witty Wordplay', 'Multisyllabic Rhymes'],
    strategicIdentity: 'Technical complexity, requires rewatch value',
    category: 'technical',
  },
  schemes: {
    id: 'schemes',
    name: 'Schemes',
    description: 'Extended metaphorical structures, multi-bar setups',
    consolidates: ['Metaphors', 'Similes'],
    strategicIdentity: 'High-level pen game, demonstrates writing skill',
    category: 'technical',
  },
  punchlines: {
    id: 'punchlines',
    name: 'Punchlines',
    description: 'Hard-hitting memorable knockout lines',
    consolidates: ['Great Setups'],
    strategicIdentity: 'Instant crowd reaction, quotable moments',
    category: 'attack',
  },
  comedy: {
    id: 'comedy',
    name: 'Comedy',
    description: 'Humor-based attacks, jokes that undermine opponent',
    consolidates: ['Jokes', 'Sarcasm'],
    strategicIdentity: 'Crowd entertainment, makes opponent look foolish',
    category: 'entertainment',
  },
  storytelling: {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Narrative-driven content painting vivid pictures',
    consolidates: [],
    strategicIdentity: 'Immersive, builds tension and payoff',
    category: 'technical',
  },
  gun_bars: {
    id: 'gun_bars',
    name: 'Gun Bars',
    description: 'Violent imagery and street threats',
    consolidates: ['Braggadocious', 'Threats'],
    strategicIdentity: 'Aggression, proves toughness',
    category: 'attack',
  },
  street_talk: {
    id: 'street_talk',
    name: 'Street Talk',
    description: 'Authentic street culture references',
    consolidates: ['OG Bars', 'Gritty'],
    strategicIdentity: 'Credibility, realness, lived experience',
    category: 'attack',
  },
  freestyles: {
    id: 'freestyles',
    name: 'Freestyles',
    description: 'Improvised on-the-spot content',
    consolidates: [],
    strategicIdentity: 'Adaptability, shows raw talent',
    category: 'adaptive',
  },
  rebuttals: {
    id: 'rebuttals',
    name: 'Rebuttals',
    description: 'Direct responses to opponent\'s material',
    consolidates: [],
    strategicIdentity: 'Preparedness, dismantles opponent\'s angles',
    category: 'adaptive',
  },
  pop_culture_refs: {
    id: 'pop_culture_refs',
    name: 'Pop Culture Refs',
    description: 'Current events, movies, sports references',
    consolidates: ['Sports References', 'Historical References'],
    strategicIdentity: 'Relatability, timely relevance',
    category: 'entertainment',
  },
  name_flips: {
    id: 'name_flips',
    name: 'Name Flips',
    description: 'Creative alterations of opponent\'s name',
    consolidates: ['Slogan'],
    strategicIdentity: 'Crowd participation, memorable hooks',
    category: 'entertainment',
  },
  shock_value: {
    id: 'shock_value',
    name: 'Shock Value',
    description: 'Controversial or unexpected content',
    consolidates: [],
    strategicIdentity: 'Provokes strong reactions, memorable',
    category: 'attack',
  },
  social_commentary: {
    id: 'social_commentary',
    name: 'Social Commentary',
    description: 'Political/social issues woven into attacks',
    consolidates: ['Political Commentary'],
    strategicIdentity: 'Depth, intelligence, substance',
    category: 'technical',
  },
};

// =====================================================
// DELIVERY TYPES (7 Total)
// =====================================================

export type DeliveryType =
  | 'aggressive'
  | 'smooth_flow'
  | 'speed_rapping'
  | 'staccato'
  | 'passionate'
  | 'nonchalant'
  | 'conversational';

export interface DeliveryTypeDef {
  id: DeliveryType;
  name: string;
  description: string;
  consolidates: string[];
  strategicIdentity: string;
}

export const DELIVERY_TYPES: Record<DeliveryType, DeliveryTypeDef> = {
  aggressive: {
    id: 'aggressive',
    name: 'Aggressive',
    description: 'Intense, confrontational, intimidating tone',
    consolidates: ['Menacing', 'Explosive'],
    strategicIdentity: 'Dominance, psychological warfare',
  },
  smooth_flow: {
    id: 'smooth_flow',
    name: 'Smooth Flow',
    description: 'Fluid, effortless, melodic delivery',
    consolidates: ['Melodic'],
    strategicIdentity: 'Easy to digest, professional polish',
  },
  speed_rapping: {
    id: 'speed_rapping',
    name: 'Speed Rapping',
    description: 'Exceptionally fast-paced delivery',
    consolidates: ['Rapid-fire'],
    strategicIdentity: 'Technical skill, overwhelms opponent',
  },
  staccato: {
    id: 'staccato',
    name: 'Staccato',
    description: 'Sharp, punctuated, choppy rhythm',
    consolidates: ['Choppy Flow'],
    strategicIdentity: 'Emphasis, dramatic pauses',
  },
  passionate: {
    id: 'passionate',
    name: 'Passionate',
    description: 'Emotional, intense conviction',
    consolidates: [],
    strategicIdentity: 'Authenticity, makes bars feel real',
  },
  nonchalant: {
    id: 'nonchalant',
    name: 'Nonchalant',
    description: 'Effortlessly cool, unbothered',
    consolidates: ['Deadpan'],
    strategicIdentity: 'Confidence, dismissive of opponent',
  },
  conversational: {
    id: 'conversational',
    name: 'Conversational',
    description: 'Casual, relatable tone',
    consolidates: [],
    strategicIdentity: 'Accessibility, disarming',
  },
};

// =====================================================
// PERFORMANCE TYPES (8 Total)
// =====================================================

export type PerformanceType =
  | 'stage_presence'
  | 'crowd_interaction'
  | 'theatrical'
  | 'charismatic'
  | 'dynamic_range'
  | 'facial_expression'
  | 'strategic_pauses'
  | 'minimalist';

export interface PerformanceTypeDef {
  id: PerformanceType;
  name: string;
  description: string;
  consolidates: string[];
  strategicIdentity: string;
}

export const PERFORMANCE_TYPES: Record<PerformanceType, PerformanceTypeDef> = {
  stage_presence: {
    id: 'stage_presence',
    name: 'Stage Presence',
    description: 'Commands attention, owns the space',
    consolidates: ['Power Stance', 'Stage Domination'],
    strategicIdentity: 'Authority, impossible to ignore',
  },
  crowd_interaction: {
    id: 'crowd_interaction',
    name: 'Crowd Interaction',
    description: 'Engages audience directly',
    consolidates: ['Crowd Engagement', 'Call-and-Response'],
    strategicIdentity: 'Builds energy, controls atmosphere',
  },
  theatrical: {
    id: 'theatrical',
    name: 'Theatrical',
    description: 'Dramatic, exaggerated performance',
    consolidates: ['Fluid Movement', 'Extra Animated'],
    strategicIdentity: 'Memorable moments, entertainment value',
  },
  charismatic: {
    id: 'charismatic',
    name: 'Charismatic',
    description: 'Charming, naturally engaging',
    consolidates: [],
    strategicIdentity: 'Likeability, wins crowd favor',
  },
  dynamic_range: {
    id: 'dynamic_range',
    name: 'Dynamic Range',
    description: 'Varies volume and intensity',
    consolidates: ['Whisper to Shout'],
    strategicIdentity: 'Emotional peaks, keeps attention',
  },
  facial_expression: {
    id: 'facial_expression',
    name: 'Facial Expression',
    description: 'Uses face to convey emotion/mockery',
    consolidates: ['Emotive', 'Smirking', 'Intense Gaze'],
    strategicIdentity: 'Non-verbal communication, intimidation',
  },
  strategic_pauses: {
    id: 'strategic_pauses',
    name: 'Strategic Pauses',
    description: 'Uses silence for emphasis',
    consolidates: [],
    strategicIdentity: 'Tension building, lets bars breathe',
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Controlled, subtle gestures',
    consolidates: ['Stoic', 'Poker Face'],
    strategicIdentity: 'Lets words speak, mysterious aura',
  },
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function getContentType(id: ContentType): ContentTypeDef {
  return CONTENT_TYPES[id];
}

export function getDeliveryType(id: DeliveryType): DeliveryTypeDef {
  return DELIVERY_TYPES[id];
}

export function getPerformanceType(id: PerformanceType): PerformanceTypeDef {
  return PERFORMANCE_TYPES[id];
}

export function getAllContentTypes(): ContentTypeDef[] {
  return Object.values(CONTENT_TYPES);
}

export function getAllDeliveryTypes(): DeliveryTypeDef[] {
  return Object.values(DELIVERY_TYPES);
}

export function getAllPerformanceTypes(): PerformanceTypeDef[] {
  return Object.values(PERFORMANCE_TYPES);
}

// Get content types by category
export function getContentTypesByCategory(category: 'attack' | 'technical' | 'entertainment' | 'adaptive'): ContentTypeDef[] {
  return getAllContentTypes().filter(ct => ct.category === category);
}
