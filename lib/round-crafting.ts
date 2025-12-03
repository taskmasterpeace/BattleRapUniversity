// Round Crafting System - Types and Data
// Based on ROUND_CONTENT_SELECTION_SYSTEM.md

// ============================================
// CONTENT TYPES
// ============================================

export type ContentType =
  | "personals"
  | "wordplay"
  | "schemes"
  | "punchlines"
  | "comedy"
  | "storytelling"
  | "gun_bars"
  | "street_talk"
  | "freestyles"
  | "rebuttals"
  | "pop_culture_refs"
  | "name_flips"
  | "shock_value"
  | "social_commentary"

export type DeliveryType =
  | "aggressive"
  | "smooth_flow"
  | "speed_rapping"
  | "staccato"
  | "passionate"
  | "nonchalant"
  | "conversational"

export type PerformanceType =
  | "stage_presence"
  | "crowd_interaction"
  | "theatrical"
  | "charismatic"
  | "dynamic_range"
  | "facial_expression"
  | "strategic_pauses"
  | "minimalist"

// ============================================
// TYPE INFO - Names and Descriptions
// ============================================

export const CONTENT_TYPE_INFO: Record<ContentType, { name: string; description: string }> = {
  personals: {
    name: "PERSONALS",
    description: "Direct personal attacks on opponent's life, family, secrets",
  },
  wordplay: {
    name: "WORDPLAY",
    description: "Clever word manipulation, double meanings, puns",
  },
  schemes: {
    name: "SCHEMES",
    description: "Extended metaphors, multi-bar setups with payoffs",
  },
  punchlines: {
    name: "PUNCHLINES",
    description: "Hard-hitting memorable knockout lines",
  },
  comedy: {
    name: "COMEDY",
    description: "Humor-based attacks, jokes that undermine opponent",
  },
  storytelling: {
    name: "STORYTELLING",
    description: "Narrative-driven content painting vivid pictures",
  },
  gun_bars: {
    name: "GUN BARS",
    description: "Violent imagery and street threats",
  },
  street_talk: {
    name: "STREET TALK",
    description: "Authentic street culture references",
  },
  freestyles: {
    name: "FREESTYLES",
    description: "Improvised on-the-spot content",
  },
  rebuttals: {
    name: "REBUTTALS",
    description: "Direct responses to opponent's material",
  },
  pop_culture_refs: {
    name: "POP CULTURE",
    description: "Current events, movies, sports references",
  },
  name_flips: {
    name: "NAME FLIPS",
    description: "Creative alterations of opponent's name",
  },
  shock_value: {
    name: "SHOCK VALUE",
    description: "Controversial or unexpected content",
  },
  social_commentary: {
    name: "SOCIAL COMMENTARY",
    description: "Political/social issues woven into attacks",
  },
}

export const DELIVERY_TYPE_INFO: Record<DeliveryType, { name: string; description: string }> = {
  aggressive: {
    name: "AGGRESSIVE",
    description: "Intense, confrontational, intimidating tone",
  },
  smooth_flow: {
    name: "SMOOTH FLOW",
    description: "Fluid, effortless, melodic delivery",
  },
  speed_rapping: {
    name: "SPEED RAPPING",
    description: "Exceptionally fast-paced delivery",
  },
  staccato: {
    name: "STACCATO",
    description: "Sharp, punctuated, choppy rhythm",
  },
  passionate: {
    name: "PASSIONATE",
    description: "Emotional, intense conviction",
  },
  nonchalant: {
    name: "NONCHALANT",
    description: "Effortlessly cool, unbothered",
  },
  conversational: {
    name: "CONVERSATIONAL",
    description: "Casual, relatable tone",
  },
}

export const PERFORMANCE_TYPE_INFO: Record<PerformanceType, { name: string; description: string }> = {
  stage_presence: {
    name: "STAGE PRESENCE",
    description: "Commands attention, owns the space",
  },
  crowd_interaction: {
    name: "CROWD INTERACTION",
    description: "Engages audience directly",
  },
  theatrical: {
    name: "THEATRICAL",
    description: "Dramatic, exaggerated performance",
  },
  charismatic: {
    name: "CHARISMATIC",
    description: "Charming, naturally engaging",
  },
  dynamic_range: {
    name: "DYNAMIC RANGE",
    description: "Varies volume and intensity",
  },
  facial_expression: {
    name: "FACIAL EXPRESSION",
    description: "Uses face to convey emotion/mockery",
  },
  strategic_pauses: {
    name: "STRATEGIC PAUSES",
    description: "Uses silence for emphasis",
  },
  minimalist: {
    name: "MINIMALIST",
    description: "Controlled, subtle gestures",
  },
}

// ============================================
// ROUND SELECTIONS INTERFACE
// ============================================

export interface RoundSelections {
  contentTypes: ContentType[]
  deliveryTypes: DeliveryType[]
  performanceTypes: PerformanceType[]
}

export interface SegmentScore {
  segmentIndex: number
  score: number
  isPeak: boolean
  isChoke: boolean
  isStumble: boolean
}

export interface RoundResult {
  averageScore: number
  peakScore: number
  consistencyScore: number
  contentTypes: ContentType[]
  deliveryTypes: DeliveryType[]
  performanceTypes: PerformanceType[]
  effectivenessMultiplier: number
  crowdPreferenceMultiplier: number
  contextModifier: number
  finalMultiplier: number
  choked: boolean
  stumbled: boolean
}

export interface ForecastResult {
  finalMultiplier: number
  effectiveness: number
  crowdPreference: number
  contextModifier: number
  strongAgainst: ContentType[]
  weakAgainst: ContentType[]
}

// ============================================
// VALIDATION
// ============================================

export function isValidSelection(selections: RoundSelections): boolean {
  const { contentTypes, deliveryTypes, performanceTypes } = selections

  // Content: 3-4 required
  if (contentTypes.length < 3 || contentTypes.length > 4) return false

  // Delivery: 1-2 required
  if (deliveryTypes.length < 1 || deliveryTypes.length > 2) return false

  // Performance: 1-2 required
  if (performanceTypes.length < 1 || performanceTypes.length > 2) return false

  return true
}

export const SELECTION_LIMITS = {
  content: { min: 3, max: 4 },
  delivery: { min: 1, max: 2 },
  performance: { min: 1, max: 2 },
}

// ============================================
// STYLING CONSTANTS
// ============================================

export const CATEGORY_COLORS = {
  content: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
    hover: "hover:border-purple-500/50",
  },
  delivery: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    hover: "hover:border-blue-500/50",
  },
  performance: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    hover: "hover:border-emerald-500/50",
  },
}

export const EFFECTIVENESS_COLORS = {
  strong: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/30",
    ring: "ring-green-500/30",
  },
  neutral: {
    bg: "bg-zinc-800",
    text: "text-zinc-300",
    border: "border-zinc-700",
  },
  weak: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
  },
}

export function getMultiplierColor(multiplier: number): string {
  if (multiplier < 0.8) return "text-red-500"
  if (multiplier < 1.0) return "text-orange-500"
  if (multiplier < 1.2) return "text-zinc-100"
  if (multiplier < 1.5) return "text-green-500"
  return "text-green-400"
}

// ============================================
// PRESETS
// ============================================

export const QUICK_PRESETS = [
  {
    id: "tech_heavy",
    name: "Tech Heavy",
    description: "For purist crowds",
    selections: {
      contentTypes: ["wordplay", "schemes", "punchlines"] as ContentType[],
      deliveryTypes: ["smooth_flow"] as DeliveryType[],
      performanceTypes: ["minimalist"] as PerformanceType[],
    },
  },
  {
    id: "street_mode",
    name: "Street Mode",
    description: "Authenticity first",
    selections: {
      contentTypes: ["gun_bars", "street_talk", "personals"] as ContentType[],
      deliveryTypes: ["aggressive"] as DeliveryType[],
      performanceTypes: ["stage_presence"] as PerformanceType[],
    },
  },
  {
    id: "entertainment",
    name: "Entertainment",
    description: "Crowd favorite",
    selections: {
      contentTypes: ["comedy", "name_flips", "pop_culture_refs"] as ContentType[],
      deliveryTypes: ["conversational"] as DeliveryType[],
      performanceTypes: ["charismatic", "crowd_interaction"] as PerformanceType[],
    },
  },
  {
    id: "balanced",
    name: "Balanced",
    description: "Versatile approach",
    selections: {
      contentTypes: ["personals", "punchlines", "wordplay"] as ContentType[],
      deliveryTypes: ["aggressive"] as DeliveryType[],
      performanceTypes: ["theatrical"] as PerformanceType[],
    },
  },
]

// ============================================
// TYPE ARRAYS FOR ITERATION
// ============================================

export const CONTENT_TYPES: ContentType[] = [
  "personals",
  "wordplay",
  "schemes",
  "punchlines",
  "comedy",
  "storytelling",
  "gun_bars",
  "street_talk",
  "freestyles",
  "rebuttals",
  "pop_culture_refs",
  "name_flips",
  "shock_value",
  "social_commentary",
]

export const DELIVERY_TYPES: DeliveryType[] = [
  "aggressive",
  "smooth_flow",
  "speed_rapping",
  "staccato",
  "passionate",
  "nonchalant",
  "conversational",
]

export const PERFORMANCE_TYPES: PerformanceType[] = [
  "stage_presence",
  "crowd_interaction",
  "theatrical",
  "charismatic",
  "dynamic_range",
  "facial_expression",
  "strategic_pauses",
  "minimalist",
]

export const getMockForecast = calculateMockForecast

// ============================================
// MOCK FORECAST CALCULATION
// ============================================

export function calculateMockForecast(
  selections: RoundSelections,
  opponentPredicted?: Partial<RoundSelections>,
): ForecastResult {
  // Base effectiveness based on content diversity
  let effectiveness = 1.0 + (selections.contentTypes.length - 3) * 0.05

  // Simulate type matchups
  const strongAgainst: ContentType[] = []
  const weakAgainst: ContentType[] = []

  if (selections.contentTypes.includes("wordplay")) {
    strongAgainst.push("gun_bars")
    effectiveness += 0.1
  }
  if (selections.contentTypes.includes("personals")) {
    strongAgainst.push("comedy")
    effectiveness += 0.08
  }
  if (selections.contentTypes.includes("schemes")) {
    effectiveness += 0.05
  }

  // Crowd preference based on performance
  let crowdPreference = 1.0
  if (selections.performanceTypes.includes("crowd_interaction")) {
    crowdPreference += 0.15
  }
  if (selections.performanceTypes.includes("theatrical")) {
    crowdPreference += 0.1
  }
  if (selections.deliveryTypes.includes("aggressive")) {
    crowdPreference += 0.05
  }

  // Context modifier (neutral for mock)
  const contextModifier = 1.0 + Math.random() * 0.1

  const finalMultiplier = effectiveness * crowdPreference * contextModifier

  return {
    finalMultiplier: Math.round(finalMultiplier * 100) / 100,
    effectiveness: Math.round(effectiveness * 100) / 100,
    crowdPreference: Math.round(crowdPreference * 100) / 100,
    contextModifier: Math.round(contextModifier * 100) / 100,
    strongAgainst,
    weakAgainst,
  }
}

// ============================================
// MOCK ROUND SIMULATION
// ============================================

export function simulateMockRound(
  playerSelections: RoundSelections,
  opponentSelections: RoundSelections,
): {
  playerResult: RoundResult
  opponentResult: RoundResult
  playerSegments: SegmentScore[]
  opponentSegments: SegmentScore[]
  roundWinner: "player" | "opponent" | "tie"
} {
  const playerForecast = calculateMockForecast(playerSelections)
  const opponentForecast = calculateMockForecast(opponentSelections)

  // Generate segment scores
  const generateSegments = (baseScore: number, choked: boolean): SegmentScore[] => {
    const segments: SegmentScore[] = []
    const peakIndex = Math.floor(Math.random() * 4)

    for (let i = 0; i < 4; i++) {
      const variance = (Math.random() - 0.5) * 1.5
      let score = baseScore + variance
      const isPeak = i === peakIndex
      if (isPeak) score += 0.5
      if (choked && i === 3) score -= 2

      segments.push({
        segmentIndex: i + 1,
        score: Math.round(Math.max(1, Math.min(10, score)) * 10) / 10,
        isPeak,
        isChoke: choked && i === 3,
        isStumble: false,
      })
    }
    return segments
  }

  const playerBaseScore = 7.5 + (playerForecast.finalMultiplier - 1) * 2
  const opponentBaseScore = 7.0 + (opponentForecast.finalMultiplier - 1) * 2

  const playerChoked = Math.random() < 0.05
  const opponentChoked = Math.random() < 0.08

  const playerSegments = generateSegments(playerBaseScore, playerChoked)
  const opponentSegments = generateSegments(opponentBaseScore, opponentChoked)

  const playerAvg = playerSegments.reduce((sum, s) => sum + s.score, 0) / 4
  const opponentAvg = opponentSegments.reduce((sum, s) => sum + s.score, 0) / 4

  const playerScores = playerSegments.map((s) => s.score)
  const opponentScores = opponentSegments.map((s) => s.score)

  const playerResult: RoundResult = {
    averageScore: Math.round(playerAvg * 100) / 100,
    peakScore: Math.max(...playerScores),
    consistencyScore: Math.round((1 - (Math.max(...playerScores) - Math.min(...playerScores)) / 10) * 100),
    contentTypes: playerSelections.contentTypes,
    deliveryTypes: playerSelections.deliveryTypes,
    performanceTypes: playerSelections.performanceTypes,
    effectivenessMultiplier: playerForecast.effectiveness,
    crowdPreferenceMultiplier: playerForecast.crowdPreference,
    contextModifier: playerForecast.contextModifier,
    finalMultiplier: playerForecast.finalMultiplier,
    choked: playerChoked,
    stumbled: false,
  }

  const opponentResult: RoundResult = {
    averageScore: Math.round(opponentAvg * 100) / 100,
    peakScore: Math.max(...opponentScores),
    consistencyScore: Math.round((1 - (Math.max(...opponentScores) - Math.min(...opponentScores)) / 10) * 100),
    contentTypes: opponentSelections.contentTypes,
    deliveryTypes: opponentSelections.deliveryTypes,
    performanceTypes: opponentSelections.performanceTypes,
    effectivenessMultiplier: opponentForecast.effectiveness,
    crowdPreferenceMultiplier: opponentForecast.crowdPreference,
    contextModifier: opponentForecast.contextModifier,
    finalMultiplier: opponentForecast.finalMultiplier,
    choked: opponentChoked,
    stumbled: false,
  }

  let roundWinner: "player" | "opponent" | "tie" = "tie"
  if (playerAvg > opponentAvg + 0.3) roundWinner = "player"
  else if (opponentAvg > playerAvg + 0.3) roundWinner = "opponent"

  return {
    playerResult,
    opponentResult,
    playerSegments,
    opponentSegments,
    roundWinner,
  }
}

// Generate random opponent selections
export function generateOpponentSelections(): RoundSelections {
  const allContent: ContentType[] = [
    "personals",
    "wordplay",
    "schemes",
    "punchlines",
    "comedy",
    "storytelling",
    "gun_bars",
    "street_talk",
    "freestyles",
    "rebuttals",
    "pop_culture_refs",
    "name_flips",
    "shock_value",
    "social_commentary",
  ]
  const allDelivery: DeliveryType[] = [
    "aggressive",
    "smooth_flow",
    "speed_rapping",
    "staccato",
    "passionate",
    "nonchalant",
    "conversational",
  ]
  const allPerformance: PerformanceType[] = [
    "stage_presence",
    "crowd_interaction",
    "theatrical",
    "charismatic",
    "dynamic_range",
    "facial_expression",
    "strategic_pauses",
    "minimalist",
  ]

  const shuffle = (arr: any[]): any[] => [...arr].sort(() => Math.random() - 0.5)

  return {
    contentTypes: shuffle(allContent).slice(0, 3 + Math.floor(Math.random() * 2)),
    deliveryTypes: shuffle(allDelivery).slice(0, 1 + Math.floor(Math.random() * 2)),
    performanceTypes: shuffle(allPerformance).slice(0, 1 + Math.floor(Math.random() * 2)),
  }
}
