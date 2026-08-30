export type FocusType = "research" | "writing" | "performance" | "life" | "rest"
export type OriginType = "text_forums" | "app_camera" | "crew"

export interface DayPlan {
  day: number
  date?: string
  focus: FocusType | null
  activities?: string[]
}

export interface PrepPlan {
  days: DayPlan[]
  battleId: string
}

export interface BattleInfo {
  id: string
  opponent: {
    name: string
    tier: string
    rating: number
    avatar: string
    styles: string[]
    record?: string
    attributes?: {
      writing: number      // Average of lyricism, wordplay, creativity, flow (1-10)
      performance: number  // Average of stage_presence, crowd_control, delivery (1-10)
      resilience: number   // Resilience stat (1-10)
      breakdown?: {        // Individual stats for detailed view
        lyricism: number
        wordplay: number
        creativity: number
        flow: number
        stage_presence: number
        crowd_control: number
        delivery: number
      }
    }
  }
  league: string
  battleDate: string
  lockDate: string
  prepDays: number
  status?: "offered" | "accepted" | "completed" | "declined"
  payout?: {
    basePay: number
    winBonus: number
    rivalryBonus?: number
  }
  isGrudgeMatch?: boolean
  grudgeIntensity?: number
  venueTypeId?: string // Added venueTypeId to link to venue system
}

export interface ImpactPreview {
  lyricism: number
  flow: number
  resilience: number
  stressChange: { from: number; to: number }
  predictedScore: number
  chokeRisk: number
}

export interface PrepRecommendation {
  type: "success" | "warning" | "info"
  text: string
  highlight?: string
  action?: string
}

export interface PrepTemplate {
  id: string
  name: string
  description: string
  plan: FocusType[]
}

export interface Activity {
  id: string
  name: string
  bonus: string
  bonusColor: "green" | "orange" | "blue" | "purple"
}

export interface BattlerStats {
  writing: {
    lyricism: number
    wordplay: number
    creativity: number
    flow: number
  }
  performance: {
    stagePresence: number
    crowdControl: number
    delivery: number
  }
  personal: {
    financial: number
    reputation: number
    family: number
    resilience: number
    selfAwareness: number // 1-10: How accurately they perceive their own readiness
  }
}

export type CareerTier = 'rookie' | 'rising' | 'established' | 'veteran' | 'legend' | 'unknown'

export interface Battler {
  id: string
  stageName: string
  elo: number
  region: string
  city?: CityData
  tier: string
  league: string
  archetype: string
  stats: BattlerStats
  styles: string[]
  record?: { wins: number; losses: number }
  streak?: number
  stress?: number
  badges?: string[]
  styleTags?: string[]
  portrait?: {
    spriteUrl: string
    crop?: PortraitCrop
  }
  crew?: {
    id: string
    name: string
    tag: string
  }
  origin_type?: OriginType
  origin_completed?: boolean
  // Career days tracking (the "battle rap secret")
  careerDays?: number
  careerPublic?: boolean
  careerTier?: CareerTier
  careerDisplay?: string  // Human readable: "3 weeks", "1.5 years", or "???"
  // Flyer System: city-as-identity + progression
  cityBackdrop?: string
  level?: number
  xp?: { current: number; needed: number }
}

export interface Rivalry {
  id: string
  opponent: {
    id: string
    name: string
    avatar: string
    tier?: string
  }
  intensity: number
  headToHead: string
  lastBattle: string
  lastBattleDate?: string
  rematchDemand: number
  origin?: string
  status: "active" | "dormant" | "resolved"
  record?: { wins: number; losses: number }
}

export interface Battle {
  id: string
  playerBattler: Battler
  opponentBattler: Battler
  winner?: "player" | "opponent"
  score?: { player: number; opponent: number }
  rounds?: Round[]
  date: string
  league: string
}

export interface Round {
  number: number
  playerScore: number
  opponentScore: number
  winner: "player" | "opponent"
  segments: Segment[]
}

export interface Segment {
  id: string
  type: "normal" | "haymaker" | "choke"
  playerScore: number
  opponentScore: number
}

// ============================================
// V2 SEGMENT-BASED CONTENT SYSTEM
// ============================================

export interface PrepSegment {
  id: string
  battleId: string
  roundNum: number | null // null = unassigned/backup
  position: number | null // 1-6 position within round
  contentType: string // "personals", "wordplay", etc.
  deliveryType: string // "aggressive", "smooth_flow", etc.
  performanceType: string // "stage_presence", etc.
  isFreestyle: boolean // true = no writing needed
  isCounter: boolean // true = counter segment
  counterTarget?: string // what opponent content this counters
  isWritten: boolean // has been written
  isRehearsed: boolean // has this segment been rehearsed
  createdAt: string
  updatedAt: string
}

export type ResearchLevel = "none" | "casual" | "aggressive"

export interface PrepProgress {
  battleId: string
  researchLevel: ResearchLevel
  researchDays: number
  writingDays: number
  rehearsalDays: number
  restDays: number
  lifeDays: number
  segmentsWritten: number
  segmentsNeeded: number
  roundsRehearsed: number[]
  isLocked: boolean
}

export interface PrepCounter {
  id: string
  battleId: string
  anticipatedContent: string // what we expect opponent to use
  segmentId: string // our counter segment
  isTriggered?: boolean // set after battle
  multiplierUsed?: number // 1.5x if triggered, 0.5x if not
}

export interface RoundConfig {
  roundCount: number
  roundLengthMinutes: number
  segmentsPerRound: number
  totalSegmentsNeeded: number
}

export function getRoundConfig(roundCount: number, roundLengthMinutes: number): RoundConfig {
  const segmentsPerRound = roundLengthMinutes === 3 ? 6 : roundLengthMinutes === 2 ? 4 : 3
  return {
    roundCount,
    roundLengthMinutes,
    segmentsPerRound,
    totalSegmentsNeeded: segmentsPerRound * roundCount,
  }
}

export type SegmentState = "unwritten" | "written" | "assigned" | "rehearsed" | "performed" | "freestyle"

export function getSegmentState(segment: PrepSegment): SegmentState {
  if (segment.isFreestyle) return "freestyle"
  if (segment.isRehearsed) return "rehearsed"
  if (segment.roundNum !== null) return "assigned"
  if (segment.isWritten) return "written"
  return "unwritten"
}

export interface Badge {
  id: string
  code: string
  name: string
  tier: "bronze" | "silver" | "gold"
  category: "writing" | "performance" | "content" | "delivery" | "reputation_positive" | "reputation_negative"
  description: string
  effects: string[]
  howToEarn?: string
  isEquipped?: boolean
}

export interface Transaction {
  id: string
  type: "battle_win" | "battle_loss" | "tournament_prize" | "entry_fee" | "merch" | "base_pay"
  amount: number
  description: string
  date: string
  battleId?: string
  metadata?: {
    opponent?: string
    league?: string
    tier?: string
  }
}

export interface Tournament {
  id: string
  name: string
  dates: string
  prizePool: number
  entryFee: number
  status: "open" | "in_progress" | "completed" | "upcoming"
  format: string
  rules: string
  participants?: { name: string; avatar: string }[]
  bracket?: any
}

export interface NewsArticle {
  id: string
  slug: string
  title: string
  type: "battle_recap" | "scandal" | "career_update" | "league_update" | "grudge_coverage"
  date: string
  views: number
  excerpt?: string
  body?: string
  battlers?: string[]
  league?: string
  battleId?: string
}

export interface CityData {
  name: string
  state: string
  population: number
  region: string
  coordinates: [number, number]
  timeZone: string
  cityTier: "major" | "regional" | "underground"
  backdropUrl?: string // Added backdrop URL for city header image
}

export type BattlerTier = "none" | "low" | "mid" | "top" | "god"

export interface CityBackdrop {
  cityKey: string // "city-state" format e.g. "new-york-ny"
  url: string
  generatedAt: string
  battlerCount: number // How many battlers are from this city
}

export interface CityRanking {
  cityKey: string
  cityName: string
  state: string
  region: string
  battlers: {
    id: string
    stageName: string
    elo: number
    tier: BattlerTier
    rank: number // Rank within the city
  }[]
}

export interface RegionRanking {
  region: string
  cities: string[]
  battlers: {
    id: string
    stageName: string
    cityKey: string
    elo: number
    tier: BattlerTier
    rank: number // Rank within the region
  }[]
}

export interface OnboardingData {
  stageName: string
  city: CityData | null
  league: string
  attributes: {
    lyricism: number
    wordplay: number
    creativity: number
    flow: number
    stagePresence: number
    crowdControl: number
    delivery: number
    financial: number
    reputation: number
    family: number
    resilience: number
  }
  styles: string[]
}

export function getBattlerTierFromElo(elo: number): BattlerTier {
  if (elo >= 2000) return "god"
  if (elo >= 1600) return "top"
  if (elo >= 1200) return "mid"
  if (elo >= 800) return "low"
  return "none"
}

export function getCityKey(cityName: string, state: string): string {
  return `${cityName.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`
}

export interface PortraitCrop {
  scale: number // 1 = 100%, 1.5 = 150%, etc.
  offsetX: number // horizontal offset in pixels
  offsetY: number // vertical offset in pixels
}

export interface OriginMilestone {
  id: string
  battler_id: string
  milestone_key: string
  achieved_at: string
  context?: any
}
