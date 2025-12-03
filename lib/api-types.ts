// ============================================
// V0 API Contract Types
// ============================================

// ============================================
// CONTENT TYPE IDs
// ============================================

export const CONTENT_TYPE_IDS = {
  personals: "personals",
  wordplay: "wordplay",
  schemes: "schemes",
  punchlines: "punchlines",
  comedy: "comedy",
  storytelling: "storytelling",
  gun_bars: "gun_bars",
  street_talk: "street_talk",
  freestyles: "freestyles",
  rebuttals: "rebuttals",
  pop_culture: "pop_culture",
  name_flips: "name_flips",
  shock_value: "shock_value",
  social_commentary: "social_commentary",
} as const

export const DELIVERY_TYPE_IDS = {
  aggressive: "aggressive",
  smooth_flow: "smooth_flow",
  speed_rapping: "speed_rapping",
  staccato: "staccato",
  passionate: "passionate",
  nonchalant: "nonchalant",
  conversational: "conversational",
} as const

export const PERFORMANCE_TYPE_IDS = {
  stage_presence: "stage_presence",
  crowd_interaction: "crowd_interaction",
  theatrical: "theatrical",
  charismatic: "charismatic",
  dynamic_range: "dynamic_range",
  facial_expression: "facial_expression",
  strategic_pauses: "strategic_pauses",
  minimalist: "minimalist",
} as const

export type ContentTypeId = keyof typeof CONTENT_TYPE_IDS
export type DeliveryTypeId = keyof typeof DELIVERY_TYPE_IDS
export type PerformanceTypeId = keyof typeof PERFORMANCE_TYPE_IDS

// ============================================
// SHARED TYPES
// ============================================

export type BattleStatus = "offered" | "accepted" | "locked" | "simulating" | "completed"
export type BattleMode = "locked_in" | "auto"
export type LeagueTier = "god_tier" | "top_tier" | "mid_tier" | "small_room"
export type PrepFocus = "research" | "writing" | "rehearsal" | "life" | "rest"
export type SegmentMoment = "haymaker" | "stumble" | "choke"

export interface ContentSelection {
  contentTypes: string[]
  deliveryTypes: string[]
  performanceTypes: string[]
}

export interface Segment {
  segmentNum: number
  playerScore: number
  opponentScore: number
  playerMoment?: SegmentMoment
  opponentMoment?: SegmentMoment
}

export interface BattleRound {
  roundNum: number
  playerScore: number
  opponentScore: number
  playerWon: boolean
  playerSelection: ContentSelection
  opponentSelection: ContentSelection
  segments: Segment[]
  crowdReaction: number
}

export interface Effectiveness {
  contentEffectiveness: number
  crowdPreference: number
  contextModifier: number
  finalMultiplier: number
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// --- Battle Offers ---

export interface BattleOfferOpponent {
  id: string
  name: string
  rating: number
  record: string
  styleTags: string[]
  avatar?: string
}

export interface BattleOfferLeague {
  id: string
  name: string
  tier: LeagueTier
}

export interface BattleOffer {
  id: string
  opponent: BattleOfferOpponent
  league: BattleOfferLeague
  scheduledAt: string
  prepDays: number
  expiresAt: string
  purse: number
}

export interface GetOffersResponse {
  offers: BattleOffer[]
}

// --- Accept/Decline Battle ---

export interface AcceptBattleResponse {
  success: boolean
  battle: {
    id: string
    status: "accepted"
    prepStartsAt: string
    prepLocksAt: string
    scheduledAt: string
  }
}

export interface DeclineBattleResponse {
  success: boolean
}

// --- Battle Details ---

export interface BattlerDetails {
  id: string
  name: string
  rating: number
  record?: string
  tier?: string
  avatar?: string
  styleTags?: string[]
}

export interface LeagueDetails {
  id: string
  name: string
  tier: LeagueTier
  roundLength: number
  roundCount: number
}

export interface Battle {
  id: string
  status: BattleStatus
  player: BattlerDetails
  opponent: BattlerDetails
  league: LeagueDetails
  scheduledAt: string
  prepLocksAt: string
  mode?: BattleMode
  winner?: string
  rounds?: BattleRound[]
}

export interface GetBattleResponse {
  battle: Battle
}

// --- Prep ---

export interface PrepBlock {
  day: number
  focus: PrepFocus
  date?: string
}

export interface PrepProgress {
  research: number
  writing: number
  rehearsal: number
}

export interface GetPrepResponse {
  prepBlocks: PrepBlock[]
  prepProgress: PrepProgress
  prepLocksAt: string
  isLocked: boolean
}

export interface SavePrepRequest {
  prepBlocks: {
    day: number
    focus: PrepFocus
  }[]
}

export interface SavePrepResponse {
  success: boolean
  prepProgress: PrepProgress
}

// --- Lock In Mode ---

export interface LockInRequest {
  mode: BattleMode
}

export interface LockInResponse {
  success: boolean
  battle: {
    id: string
    mode: BattleMode
    status: "locked"
  }
  simulationResult?: {
    winner: string
    rounds: BattleRound[]
  }
}

// --- Rounds ---

export interface GetRoundResponse {
  roundNum: number
  playerSelection?: ContentSelection
  opponentSelection?: ContentSelection
  isSimulated: boolean
  result?: RoundResult
}

export interface SubmitContentRequest {
  contentTypes: string[]
  deliveryTypes: string[]
  performanceTypes: string[]
}

export interface SubmitContentResponse {
  success: boolean
  selection: ContentSelection
}

export interface RoundResult {
  roundNum: number
  playerScore: number
  opponentScore: number
  playerWon: boolean
  segments: Segment[]
  crowdReaction: number
  effectiveness: Effectiveness
  opponentSelection: ContentSelection
  runningScore: {
    playerRounds: number
    opponentRounds: number
  }
}

export interface SimulateRoundResponse extends RoundResult {}

// ============================================
// V2 SEGMENT-BASED PREP TYPES
// ============================================

export type ResearchLevel = "none" | "casual" | "aggressive"

export interface V2Segment {
  id: string
  battleId: string
  roundNum: number | null
  position: number | null
  contentType: ContentTypeId
  deliveryType: DeliveryTypeId
  performanceType: PerformanceTypeId
  isFreestyle: boolean
  isCounter: boolean
  counterTarget?: ContentTypeId
  isRehearsed: boolean
  createdAt: string
  updatedAt: string
}

export interface V2Counter {
  id: string
  battleId: string
  segmentId: string
  anticipatedContent: ContentTypeId
  segment?: V2Segment
  wasTriggered?: boolean
  wasEffective?: boolean
  createdAt: string
}

// --- Segments API ---

export interface GetSegmentsResponse {
  segments: V2Segment[]
  meta: {
    totalSegments: number
    assignedSegments: number
    unassignedSegments: number
    segmentsPerRound: number
    totalNeeded: number
  }
}

export interface CreateSegmentRequest {
  contentType: ContentTypeId
  deliveryType: DeliveryTypeId
  performanceType: PerformanceTypeId
  isFreestyle?: boolean
  isCounter?: boolean
  counterTarget?: ContentTypeId
  roundNum?: number
  position?: number
}

export interface CreateSegmentResponse {
  success: boolean
  segment: V2Segment
}

export interface UpdateSegmentRequest {
  roundNum?: number | null
  position?: number
  isRehearsed?: boolean
  contentType?: ContentTypeId
  deliveryType?: DeliveryTypeId
  performanceType?: PerformanceTypeId
}

export interface OrganizeSegmentsRequest {
  assignments: {
    segmentId: string
    roundNum: number | null
    position: number | null
  }[]
}

export interface OrganizeSegmentsResponse {
  success: boolean
  segments: V2Segment[]
}

// --- Research API ---

export interface GetResearchResponse {
  level: ResearchLevel
  daysSpent: number
  daysForCasual: number
  daysForAggressive: number
  effects: {
    canWritePersonals: boolean
    personalsEffectiveness: number
    credibilityRisk: boolean
  }
}

// --- Counters API ---

export interface GetCountersResponse {
  counters: V2Counter[]
  slots: {
    used: number
    available: number
    maxSlots: number
    lockedSlots: {
      badge: string
      slotsGranted: number
    }[]
  }
}

export interface CreateCounterRequest {
  segmentId?: string
  segment?: {
    contentType: ContentTypeId
    deliveryType: DeliveryTypeId
    performanceType: PerformanceTypeId
  }
  anticipatedContent: ContentTypeId
}

export interface CreateCounterResponse {
  success: boolean
  counter: V2Counter
}

// --- Prep Progress API ---

export interface GetPrepProgressResponse {
  battleId: string
  opponent: {
    id: string
    name: string
    avatar?: string
  }
  league: {
    name: string
    tier: LeagueTier
  }
  dates: {
    battleDate: string
    prepLockDate: string
    daysUntilBattle: number
    daysUntilPrepLock: number
  }
  roundInfo: {
    roundCount: number
    roundLength: number
    segmentsPerRound: number
    totalSegmentsNeeded: number
  }
  research: {
    level: ResearchLevel
    daysSpent: number
    percent: number
  }
  writing: {
    segmentsWritten: number
    segmentsNeeded: number
    percent: number
  }
  rehearsal: {
    roundsRehearsed: number[]
    totalRounds: number
    percent: number
  }
  rounds: {
    roundNum: number
    segmentsAssigned: number
    segmentsNeeded: number
    isComplete: boolean
    isRehearsed: boolean
    primaryContent?: ContentTypeId
  }[]
  counters: {
    used: number
    available: number
  }
  overall: {
    percent: number
    isReadyForBattle: boolean
    blockers: string[]
  }
}

// --- Round Shifting API ---

export interface ShiftRoundsRequest {
  newOrder: number[]
}

export interface ShiftRoundsResponse {
  success: boolean
  penalty: {
    consistencyPenalty: number
    rehearsalPenalty: number
    totalPenalty: number
  }
  newRoundOrder: {
    originalRound: number
    newPosition: number
  }[]
}

// ============================================
// ERROR HANDLING
// ============================================

export interface ApiError {
  error: string
  code: ApiErrorCode | V2ApiErrorCode
  message: string
}

export type ApiErrorCode =
  | "BATTLE_NOT_FOUND"
  | "NOT_AUTHORIZED"
  | "PREP_LOCKED"
  | "INVALID_SELECTION"
  | "ROUND_ALREADY_SIMULATED"
  | "BATTLE_COMPLETED"
  | "OFFER_EXPIRED"
  | "UNKNOWN_ERROR"

export type V2ApiErrorCode =
  | ApiErrorCode
  | "SEGMENT_NOT_FOUND"
  | "ROUND_FULL"
  | "CANNOT_REHEARSE"
  | "NO_COUNTER_SLOTS"
  | "SEGMENT_ALREADY_COUNTER"
  | "COUNTER_REQUIRES_TARGET"
  | "INVALID_CONTENT_TYPE"
  | "ROUND_ALREADY_PLAYED"
  | "SHIFT_LIMIT_REACHED"
  | "BATTLE_NOT_IN_PROGRESS"

export function isApiError(response: unknown): response is ApiError {
  return typeof response === "object" && response !== null && "error" in response && "code" in response
}
