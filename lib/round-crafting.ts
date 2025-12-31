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
  haymakerCount?: number // Number of haymaker moments landed this round
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

// Simple validation for single selections (used in round crafting page)
export function isValidSelection(
  content: ContentType | null,
  delivery: DeliveryType | null,
  performance: PerformanceType | null
): boolean {
  return content !== null && delivery !== null && performance !== null
}

// Full validation for RoundSelections object
export function isValidRoundSelections(selections: RoundSelections): boolean {
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

// Simple getMockForecast for round crafting page (single selections)
export function getMockForecast(params: {
  contentType: ContentType
  deliveryType: DeliveryType
  performanceType: PerformanceType
  opponentStyle: string
}): ForecastResult {
  // Base effectiveness based on content type
  let effectiveness = 1.0

  if (params.contentType === "wordplay" || params.contentType === "schemes") {
    effectiveness += 0.1
  }
  if (params.contentType === "personals") {
    effectiveness += 0.08
  }
  if (params.contentType === "punchlines") {
    effectiveness += 0.05
  }

  // Crowd preference based on performance
  let crowdPreference = 1.0
  if (params.performanceType === "crowd_interaction") {
    crowdPreference += 0.15
  }
  if (params.performanceType === "theatrical" || params.performanceType === "charismatic") {
    crowdPreference += 0.1
  }
  if (params.deliveryType === "aggressive") {
    crowdPreference += 0.05
  }

  // Opponent matchup
  const strongAgainst: ContentType[] = []
  const weakAgainst: ContentType[] = []

  if (params.contentType === "wordplay") strongAgainst.push("gun_bars")
  if (params.contentType === "personals") strongAgainst.push("comedy")
  if (params.contentType === "comedy") weakAgainst.push("personals")

  // Context modifier (slight random variance)
  const contextModifier = 1.0 + (Math.random() * 0.1 - 0.05)

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

// Full forecast calculation for RoundSelections
export const calculateMockForecastFull = calculateMockForecast

// ============================================
// SIMPLE MOCK ROUND (for results page)
// ============================================

// Simple round result for the results page
interface SimpleRoundResult {
  winner: "player" | "opponent" | "tie"
  playerScore: number
  opponentScore: number
  segments: SegmentScore[]
  highlights: { type: "player" | "opponent"; description: string; impact: number }[]
}

// This function matches what the results page expects
export function simulateMockRoundSimple(params: {
  contentType: string
  deliveryType: string
  performanceType: string
  opponentStyle: string
}): SimpleRoundResult {
  // Generate 4 segments (2-minute round format)
  const segments: SegmentScore[] = []
  const peakIndex = Math.floor(Math.random() * 4)
  const chokeChance = Math.random() < 0.05

  let playerTotal = 0
  let opponentTotal = 0

  for (let i = 0; i < 4; i++) {
    const playerBase = 6.5 + Math.random() * 2
    const opponentBase = 6.0 + Math.random() * 2

    let score = i === peakIndex ? playerBase + 1.5 : playerBase
    const isChoke = chokeChance && i === 3
    if (isChoke) score -= 3

    playerTotal += score
    opponentTotal += opponentBase

    segments.push({
      segmentIndex: i + 1,
      score: Math.round(Math.max(1, score) * 10) / 10,
      isPeak: i === peakIndex && !isChoke,
      isChoke,
      isStumble: false,
    })
  }

  const playerAvg = playerTotal / 4
  const opponentAvg = opponentTotal / 4

  // Determine winner
  let winner: "player" | "opponent" | "tie" = "tie"
  if (playerAvg > opponentAvg + 0.2) winner = "player"
  else if (opponentAvg > playerAvg + 0.2) winner = "opponent"

  // Generate highlights
  const highlights: SimpleRoundResult["highlights"] = []

  // Player highlight
  if (winner === "player" || Math.random() > 0.4) {
    highlights.push({
      type: "player",
      description: getHighlightDescription(params.contentType, true),
      impact: Math.round((1 + Math.random()) * 10) / 10,
    })
  }

  // Opponent highlight
  if (winner === "opponent" || Math.random() > 0.4) {
    highlights.push({
      type: "opponent",
      description: getHighlightDescription(params.opponentStyle, false),
      impact: Math.round((0.5 + Math.random()) * 10) / 10,
    })
  }

  return {
    winner,
    playerScore: Math.round(playerAvg * 10) / 10,
    opponentScore: Math.round(opponentAvg * 10) / 10,
    segments,
    highlights,
  }
}

function getHighlightDescription(style: string, isPlayer: boolean): string {
  const playerHighlights = [
    "Landed a devastating haymaker that shook the room!",
    "Crowd erupted after a perfectly-timed pause and delivery",
    "Built momentum with back-to-back punches",
    "Name flip had the crowd screaming",
    "Personal angle hit hard - visible reaction from opponent",
  ]

  const opponentHighlights = [
    "Came back with a strong rebuttal",
    "Technical wordplay impressed the purists",
    "Aggressive delivery commanded attention",
    "Got a reaction with an unexpected angle",
    "Built energy through the segment",
  ]

  const highlights = isPlayer ? playerHighlights : opponentHighlights
  return highlights[Math.floor(Math.random() * highlights.length)]
}

// Alias for backwards compatibility
export { simulateMockRoundSimple as simulateMockRound }

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
// PREP & BATTLE FORMAT SYSTEM
// ============================================

export interface PrepLevels {
  writing: number      // 0-10+ days spent writing
  rehearsal: number    // 0-10+ days spent rehearsing (affects stumble risk)
  research: number     // 0-10+ days spent researching opponent (affects personals)
}

export interface BattleFormat {
  rounds: number           // 1, 2, or 3 rounds
  segmentsPerRound: number // 4 (2-min) or 6 (3-min)
  formatName: string       // "Small Room", "Main Stage", "One Round", etc.
}

export interface PrepRiskAssessment {
  stumbleChancePerSegment: number  // 0-40%
  chokeChancePerSegment: number    // 0-30%
  baseScoreModifier: number        // How prep affects score potential
  personalsMultiplier: number      // How research affects personals
  prepEffectiveness: number        // Overall 0-1 (% of needed prep completed)
  guaranteedFirstStumble: boolean  // If true, first segment is always a stumble
  rehearsalLevel: number           // Track actual rehearsal for simulation logic
}

// Calculate how much prep is needed for a battle format
export function calculatePrepNeeded(format: BattleFormat): { writing: number; rehearsal: number; research: number } {
  const totalSegments = format.rounds * format.segmentsPerRound
  // More segments = more material to write/memorize
  // Baseline: ~0.8 days per segment for each category
  const baseDays = Math.ceil(totalSegments * 0.8)

  return {
    writing: baseDays,
    rehearsal: baseDays,
    research: Math.ceil(baseDays * 0.7) // Research needs slightly less time
  }
}

// Calculate stumble/choke risks based on prep
export function calculatePrepRisks(
  prep: PrepLevels,
  format: BattleFormat,
  deliveryType: DeliveryType,
  badges: string[] = []
): PrepRiskAssessment {
  const needed = calculatePrepNeeded(format)

  // Overall prep effectiveness (0-1)
  const writingEff = Math.min(1, prep.writing / needed.writing)
  const rehearsalEff = Math.min(1, prep.rehearsal / needed.rehearsal)
  const researchEff = Math.min(1, prep.research / needed.research)
  const prepEffectiveness = (writingEff + rehearsalEff + researchEff) / 3

  // === STUMBLE RISK ===
  // Base: 5% per segment
  // ZERO REHEARSAL IS CATASTROPHIC - you haven't memorized your bars!
  // Low rehearsal: scaled penalty based on how underprepared
  // Delivery style modifiers
  let stumbleChance = 0.05

  // CRITICAL: Zero/very low rehearsal means you don't know your material
  // This is like showing up to a test without studying
  if (prep.rehearsal === 0) {
    stumbleChance += 0.30 // +30% - you WILL stumble, probably multiple times
  } else if (prep.rehearsal === 1) {
    stumbleChance += 0.18 // +18% - barely memorized, high risk
  } else if (prep.rehearsal === 2) {
    stumbleChance += 0.10 // +10% - underprepared
  } else if (prep.rehearsal === 3) {
    stumbleChance += 0.05 // +5% - somewhat underprepared
  }

  const rehearsalDeficit = Math.max(0, needed.rehearsal - prep.rehearsal)
  stumbleChance += rehearsalDeficit * 0.01 // +1% per missing day (increased)

  // Delivery style risk modifiers
  if (deliveryType === 'speed_rapping') stumbleChance += 0.04 // Speed rapping harder to recover
  if (deliveryType === 'staccato') stumbleChance += 0.03
  if (deliveryType === 'smooth_flow') stumbleChance -= 0.02
  if (deliveryType === 'nonchalant') stumbleChance -= 0.02
  if (deliveryType === 'conversational') stumbleChance -= 0.01

  // Badge modifiers for stumble - using actual badge IDs from all-badges.ts
  if (badges.includes('tempo_master')) stumbleChance -= 0.03     // Perfect tempo control
  if (badges.includes('freestyle_artist')) stumbleChance -= 0.04 // Freestylers recover better
  if (badges.includes('consistent_performer')) stumbleChance -= 0.02
  if (badges.includes('consistent_grinder')) stumbleChance -= 0.02
  if (badges.includes('last_minute_larry')) stumbleChance += 0.03 // Works under pressure but riskier
  if (badges.includes('ring_rust')) stumbleChance += 0.05        // Long layoff causes rust
  if (badges.includes('slumping')) stumbleChance += 0.04         // In a slump

  stumbleChance = Math.max(0.01, Math.min(0.40, stumbleChance)) // Cap at 1-40%

  // === CHOKE RISK ===
  // Base: 2% per segment
  // ZERO REHEARSAL = you don't have bars memorized = you WILL blank
  // Psychological badges matter more here
  let chokeChance = 0.02

  // CRITICAL: Zero/very low rehearsal - catastrophic choke risk
  // You can't perform bars you haven't memorized
  if (prep.rehearsal === 0) {
    chokeChance += 0.18 // +18% per segment - very likely to completely blank
  } else if (prep.rehearsal === 1) {
    chokeChance += 0.10 // +10% - barely know the material
  } else if (prep.rehearsal === 2) {
    chokeChance += 0.06 // +6% - underprepared
  } else if (prep.rehearsal < needed.rehearsal * 0.5) {
    chokeChance += 0.03 // Less than half prepared
  }

  // Badge modifiers for choke - using actual badge IDs from all-badges.ts
  // NEGATIVE badges (increase choke risk)
  if (badges.includes('choker')) chokeChance += 0.08            // Known choker history
  if (badges.includes('overconfident')) chokeChance += 0.05     // Thinks ready when not
  if (badges.includes('overhyped')) chokeChance += 0.03         // Pressure from expectations
  if (badges.includes('gunslinger')) chokeChance += 0.02        // Trades stability for adaptability

  // POSITIVE badges (decrease choke risk)
  if (badges.includes('clutch_performer')) chokeChance -= 0.06  // Rises under pressure
  if (badges.includes('freestyle_artist')) chokeChance -= 0.05  // Can improvise if they forget
  if (badges.includes('composed')) chokeChance -= 0.05          // Never rattled
  if (badges.includes('bars_on_lock')) chokeChance -= 0.04      // Material stays memorized
  if (badges.includes('main_stage_ready')) chokeChance -= 0.02  // Proven on big stages
  if (badges.includes('veteran')) chokeChance -= 0.03           // 50+ battle experience
  if (badges.includes('legend')) chokeChance -= 0.04            // 100+ battle legend
  if (badges.includes('self_aware')) chokeChance -= 0.02        // Knows true readiness

  chokeChance = Math.max(0.005, Math.min(0.30, chokeChance)) // Cap at 0.5-30%

  // === BASE SCORE MODIFIER ===
  // Writing prep affects score ceiling
  // 0 days = -1.0 to base, 10 days = +0.5 to base
  const baseScoreModifier = (writingEff - 0.5) * 1.5 // Range: -0.75 to +0.75

  // === PERSONALS MULTIPLIER ===
  // Research affects how hard personals hit
  // 0 research = 1.0x, full research = 1.8x
  const personalsMultiplier = 1.0 + (researchEff * 0.8)

  // GUARANTEED FIRST STUMBLE: If you didn't rehearse at all, you WILL stumble
  // when you first open your mouth - you haven't practiced saying these words
  const guaranteedFirstStumble = prep.rehearsal === 0

  return {
    stumbleChancePerSegment: Math.round(stumbleChance * 1000) / 1000,
    chokeChancePerSegment: Math.round(chokeChance * 1000) / 1000,
    baseScoreModifier: Math.round(baseScoreModifier * 100) / 100,
    personalsMultiplier: Math.round(personalsMultiplier * 100) / 100,
    prepEffectiveness: Math.round(prepEffectiveness * 100) / 100,
    guaranteedFirstStumble,
    rehearsalLevel: prep.rehearsal
  }
}

// ============================================
// FULL MOCK ROUND SIMULATION (for dev tools)
// ============================================

export interface SimulationOptions {
  segmentsPerRound?: number  // 4 (2-min) or 6 (3-min), default 4
  playerPrep?: PrepLevels
  opponentPrep?: PrepLevels
  format?: BattleFormat
  playerBadges?: string[]
  opponentBadges?: string[]
}

export function simulateMockRoundFull(
  playerSelections: RoundSelections,
  opponentSelections: RoundSelections,
  options: SimulationOptions = {}
): {
  playerResult: RoundResult
  opponentResult: RoundResult
  playerSegments: SegmentScore[]
  opponentSegments: SegmentScore[]
  roundWinner: "player" | "opponent"
} {
  const segmentCount = options.segmentsPerRound || 4
  const format = options.format || { rounds: 3, segmentsPerRound: segmentCount, formatName: 'Standard' }

  const playerForecast = calculateMockForecast(playerSelections)
  const opponentForecast = calculateMockForecast(opponentSelections)

  // Calculate risks based on prep
  const playerDelivery = playerSelections.deliveryTypes[0] || 'aggressive'
  const opponentDelivery = opponentSelections.deliveryTypes[0] || 'aggressive'

  const playerRisks = options.playerPrep
    ? calculatePrepRisks(options.playerPrep, format, playerDelivery, options.playerBadges || [])
    : { stumbleChancePerSegment: 0.05, chokeChancePerSegment: 0.02, baseScoreModifier: 0, personalsMultiplier: 1.0, prepEffectiveness: 0.5, guaranteedFirstStumble: false, rehearsalLevel: 5 }

  const opponentRisks = options.opponentPrep
    ? calculatePrepRisks(options.opponentPrep, format, opponentDelivery, options.opponentBadges || [])
    : { stumbleChancePerSegment: 0.06, chokeChancePerSegment: 0.03, baseScoreModifier: 0, personalsMultiplier: 1.0, prepEffectiveness: 0.5, guaranteedFirstStumble: false, rehearsalLevel: 5 }

  // Generate segment scores with stumbles and chokes
  // STUMBLE = 15% penalty per stumble, compounds across segments
  // CHOKE = 4 point penalty (segment becomes dud)
  // Both can happen on ANY segment, not just closing
  // HAYMAKER SYSTEM: Fast deliveries can land multiple haymakers (high risk/high reward)
  const generateSegments = (
    baseScore: number,
    risks: PrepRiskAssessment,
    numSegments: number,
    deliveryType: DeliveryType = 'aggressive'
  ): { segments: SegmentScore[], choked: boolean, stumbled: boolean, haymakerCount: number } => {
    const segments: SegmentScore[] = []

    // === HAYMAKER DETERMINATION ===
    // Base: 1 guaranteed haymaker per round
    // Speed rapping: High risk/high reward - can land MORE haymakers
    // Staccato: Moderate bonus to haymaker chance
    // Smooth flow: Consistent but fewer big moments
    const peakSegments: Set<number> = new Set()

    // Everyone gets at least one haymaker opportunity
    peakSegments.add(Math.floor(Math.random() * numSegments))

    // Speed rapping: 30% chance for EACH additional segment to be a haymaker
    // This makes it high risk (more stumbles) but high reward (more haymakers)
    if (deliveryType === 'speed_rapping') {
      for (let i = 0; i < numSegments; i++) {
        if (!peakSegments.has(i) && Math.random() < 0.30) {
          peakSegments.add(i)
        }
      }
    }
    // Staccato: 15% chance for additional haymaker
    else if (deliveryType === 'staccato') {
      for (let i = 0; i < numSegments; i++) {
        if (!peakSegments.has(i) && Math.random() < 0.15) {
          peakSegments.add(i)
        }
      }
    }
    // Passionate: 20% chance - emotion can create moments
    else if (deliveryType === 'passionate') {
      for (let i = 0; i < numSegments; i++) {
        if (!peakSegments.has(i) && Math.random() < 0.20) {
          peakSegments.add(i)
        }
      }
    }
    // Smooth flow: Only 5% - consistent but fewer peaks
    else if (deliveryType === 'smooth_flow') {
      // Smooth flow is about consistency, fewer haymakers
      // 5% chance for bonus haymaker
      if (Math.random() < 0.05) {
        const extra = Math.floor(Math.random() * numSegments)
        peakSegments.add(extra)
      }
    }
    // Other deliveries: 10% chance for bonus haymaker
    else {
      if (Math.random() < 0.10) {
        const extra = Math.floor(Math.random() * numSegments)
        peakSegments.add(extra)
      }
    }

    let choked = false
    let stumbled = false
    let stumbleCount = 0
    let chokeSegment = -1
    let haymakerCount = 0

    // Pre-determine if/when choke happens (can be any segment)
    for (let i = 0; i < numSegments; i++) {
      if (!choked && Math.random() < risks.chokeChancePerSegment) {
        choked = true
        chokeSegment = i
        break // Only one choke per round
      }
    }

    for (let i = 0; i < numSegments; i++) {
      const variance = (Math.random() - 0.5) * 1.5
      let score = baseScore + variance
      const isPeak = peakSegments.has(i) // Can have multiple haymakers now

      // Haymaker bonus varies by delivery
      if (isPeak) {
        if (deliveryType === 'speed_rapping') {
          score += 0.7 // Speed rapping haymakers hit harder
        } else if (deliveryType === 'passionate') {
          score += 0.6 // Emotional delivery adds impact
        } else if (deliveryType === 'aggressive') {
          score += 0.55 // Aggression adds punch
        } else {
          score += 0.5 // Standard haymaker bonus
        }
      }

      let isChoke = false
      let isStumble = false

      // Check for choke on this segment
      if (i === chokeSegment) {
        isChoke = true
        score = score - 4.0 // 4 point penalty - segment becomes dud
      }

      // Check for stumble (can happen even if no choke, but not on same segment)
      // GUARANTEED FIRST STUMBLE: If you didn't rehearse, you WILL stumble on opening
      const forceStumble = i === 0 && risks.guaranteedFirstStumble && !isChoke
      if (!isChoke && (forceStumble || Math.random() < risks.stumbleChancePerSegment)) {
        isStumble = true
        stumbled = true
        stumbleCount++
        // Stumble penalty: 15% reduction, compounds with previous stumbles
        // 1st stumble: 15% off, 2nd: ~28% off total, etc.
        const stumblePenalty = 1 - Math.pow(0.85, stumbleCount)
        score = score * (1 - stumblePenalty * 0.15 / stumbleCount) // Distribute penalty
      }

      // Apply cumulative stumble penalty to score
      if (stumbleCount > 0 && !isStumble) {
        // Ongoing effect of previous stumbles (lost momentum)
        score = score * (1 - stumbleCount * 0.03) // 3% per previous stumble
      }

      // Track successful haymakers (not ruined by choke)
      const isSuccessfulPeak = isPeak && !isChoke
      if (isSuccessfulPeak) haymakerCount++

      segments.push({
        segmentIndex: i + 1,
        score: Math.round(Math.max(1, Math.min(10, score)) * 10) / 10,
        isPeak: isSuccessfulPeak,
        isChoke,
        isStumble,
      })
    }

    return { segments, choked, stumbled, haymakerCount }
  }

  // Apply prep modifiers to base score
  const playerBaseScore = 7.5 + (playerForecast.finalMultiplier - 1) * 2 + playerRisks.baseScoreModifier
  const opponentBaseScore = 7.0 + (opponentForecast.finalMultiplier - 1) * 2 + opponentRisks.baseScoreModifier

  // Pass delivery type to enable haymaker bonuses for speed rapping, etc.
  const playerResult_ = generateSegments(playerBaseScore, playerRisks, segmentCount, playerDelivery)
  const opponentResult_ = generateSegments(opponentBaseScore, opponentRisks, segmentCount, opponentDelivery)

  const playerSegments = playerResult_.segments
  const opponentSegments = opponentResult_.segments
  const playerChoked = playerResult_.choked
  const opponentChoked = opponentResult_.choked
  const playerStumbled = playerResult_.stumbled
  const opponentStumbled = opponentResult_.stumbled
  const playerHaymakerCount = playerResult_.haymakerCount
  const opponentHaymakerCount = opponentResult_.haymakerCount

  const playerAvg = playerSegments.reduce((sum, s) => sum + s.score, 0) / segmentCount
  const opponentAvg = opponentSegments.reduce((sum, s) => sum + s.score, 0) / segmentCount

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
    stumbled: playerStumbled,
    haymakerCount: playerHaymakerCount,
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
    stumbled: opponentStumbled,
    haymakerCount: opponentHaymakerCount,
  }

  // Determine round winner - NO TIES in battle rap, someone always edges it
  // Even debatable rounds have a winner - the judges or crowd picks someone
  let roundWinner: "player" | "opponent"
  const differential = playerAvg - opponentAvg

  // Chokes hurt badly but don't auto-lose (the 4 point penalty tanks their avg)
  // The averages already reflect the choke damage, so just compare normally
  // But if only one person choked and it's close, the choker loses the tiebreaker

  if (Math.abs(differential) > 0.05) {
    // Clear winner based on average score (choke penalty already factored into avg)
    roundWinner = differential > 0 ? "player" : "opponent"
  } else {
    // Very close round - use tiebreakers
    // 1. If one person choked and the other didn't, choker loses
    if (playerChoked && !opponentChoked) {
      roundWinner = "opponent"
    } else if (opponentChoked && !playerChoked) {
      roundWinner = "player"
    } else {
      // 2. Peak score (who had the bigger haymaker moment)
      const playerPeak = Math.max(...playerSegments.map(s => s.score))
      const opponentPeak = Math.max(...opponentSegments.map(s => s.score))

      if (playerPeak !== opponentPeak) {
        roundWinner = playerPeak > opponentPeak ? "player" : "opponent"
      } else {
        // 3. Coin flip - crowd is split, but someone edges it
        roundWinner = Math.random() > 0.5 ? "player" : "opponent"
      }
    }
  }
  // Note: The narrative (debatable vs clear) is shown based on differential size

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
