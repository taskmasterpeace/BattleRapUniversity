// ============================================
// Mock Data for Development
// ============================================

import type {
  BattleOffer,
  Battle,
  BattleRound,
  RoundResult,
  PrepBlock,
  PrepProgress,
  ContentSelection,
} from "./api-types"

// ============================================
// MOCK BATTLE OFFERS
// ============================================

export const mockOffers: BattleOffer[] = [
  {
    id: "offer-1",
    opponent: {
      id: "opp-1",
      name: "Gotti Geechi",
      rating: 1420,
      record: "15-4",
      styleTags: ["Angles", "Street Talk", "Aggressive"],
      avatar: "/rapper-portrait-pixel.jpg",
    },
    league: {
      id: "league-1",
      name: "Main Stage Arena",
      tier: "top_tier",
    },
    scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    prepDays: 14,
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    purse: 5000,
  },
  {
    id: "offer-2",
    opponent: {
      id: "opp-2",
      name: "Young Pattern",
      rating: 1280,
      record: "8-3",
      styleTags: ["Wordplay", "Schemes", "Technical"],
      avatar: "/rapper-portrait-pixel-art.jpg",
    },
    league: {
      id: "league-2",
      name: "Small Room Circuit",
      tier: "small_room",
    },
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    prepDays: 7,
    expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    purse: 1500,
  },
  {
    id: "offer-3",
    opponent: {
      id: "opp-3",
      name: "Verb Da Legend",
      rating: 1550,
      record: "22-6",
      styleTags: ["Performance", "Comedy", "Theatrical"],
      avatar: "/battle-rapper-portrait-pixel-art.jpg",
    },
    league: {
      id: "league-3",
      name: "Apex Lyricist League",
      tier: "god_tier",
    },
    scheduledAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    prepDays: 21,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    purse: 15000,
  },
]

// ============================================
// MOCK BATTLE
// ============================================

export const mockBattle: Battle = {
  id: "battle-123",
  status: "accepted",
  player: {
    id: "player-1",
    name: "Tech Wizard",
    rating: 1350,
    record: "10-2",
    tier: "mid_tier",
    avatar: "/rapper-pixel.jpg",
    styleTags: ["Wordplay", "Schemes", "Technical"],
  },
  opponent: {
    id: "opp-1",
    name: "Gotti Geechi",
    rating: 1420,
    record: "15-4",
    tier: "top_tier",
    avatar: "/rapper-portrait-pixel.jpg",
    styleTags: ["Angles", "Street Talk", "Aggressive"],
  },
  league: {
    id: "league-1",
    name: "Main Stage Arena",
    tier: "top_tier",
    roundLength: 180,
    roundCount: 3,
  },
  scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  prepLocksAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
}

// ============================================
// MOCK PREP DATA
// ============================================

export const mockPrepBlocks: PrepBlock[] = [
  { day: 1, focus: "research" },
  { day: 2, focus: "research" },
  { day: 3, focus: "writing" },
  { day: 4, focus: "writing" },
  { day: 5, focus: "writing" },
  { day: 6, focus: "rehearsal" },
  { day: 7, focus: "rest" },
]

export const mockPrepProgress: PrepProgress = {
  research: 65,
  writing: 45,
  rehearsal: 20,
}

// ============================================
// MOCK ROUND RESULT
// ============================================

export const mockRoundResult: RoundResult = {
  roundNum: 1,
  playerScore: 8.2,
  opponentScore: 7.5,
  playerWon: true,
  segments: [
    { segmentNum: 1, playerScore: 7.5, opponentScore: 7.2 },
    { segmentNum: 2, playerScore: 8.8, opponentScore: 7.8, playerMoment: "haymaker" },
    { segmentNum: 3, playerScore: 7.9, opponentScore: 7.0 },
    { segmentNum: 4, playerScore: 8.5, opponentScore: 8.0 },
  ],
  crowdReaction: 78,
  effectiveness: {
    contentEffectiveness: 1.15,
    crowdPreference: 1.08,
    contextModifier: 1.0,
    finalMultiplier: 1.24,
  },
  opponentSelection: {
    contentTypes: ["street_talk", "personals", "gun_bars"],
    deliveryTypes: ["aggressive"],
    performanceTypes: ["stage_presence"],
  },
  runningScore: {
    playerRounds: 1,
    opponentRounds: 0,
  },
}

// ============================================
// MOCK COMPLETED BATTLE ROUNDS
// ============================================

export const mockCompletedRounds: BattleRound[] = [
  {
    roundNum: 1,
    playerScore: 8.2,
    opponentScore: 7.5,
    playerWon: true,
    playerSelection: {
      contentTypes: ["wordplay", "schemes", "punchlines"],
      deliveryTypes: ["smooth_flow"],
      performanceTypes: ["charismatic"],
    },
    opponentSelection: {
      contentTypes: ["street_talk", "personals", "gun_bars"],
      deliveryTypes: ["aggressive"],
      performanceTypes: ["stage_presence"],
    },
    segments: [
      { segmentNum: 1, playerScore: 7.5, opponentScore: 7.2 },
      { segmentNum: 2, playerScore: 8.8, opponentScore: 7.8, playerMoment: "haymaker" },
      { segmentNum: 3, playerScore: 7.9, opponentScore: 7.0 },
      { segmentNum: 4, playerScore: 8.5, opponentScore: 8.0 },
    ],
    crowdReaction: 78,
  },
  {
    roundNum: 2,
    playerScore: 7.4,
    opponentScore: 8.1,
    playerWon: false,
    playerSelection: {
      contentTypes: ["rebuttals", "comedy", "wordplay"],
      deliveryTypes: ["conversational"],
      performanceTypes: ["crowd_interaction"],
    },
    opponentSelection: {
      contentTypes: ["personals", "angles", "schemes"],
      deliveryTypes: ["passionate"],
      performanceTypes: ["theatrical"],
    },
    segments: [
      { segmentNum: 1, playerScore: 7.2, opponentScore: 7.8 },
      { segmentNum: 2, playerScore: 7.5, opponentScore: 9.0, opponentMoment: "haymaker" },
      { segmentNum: 3, playerScore: 7.4, opponentScore: 7.6 },
      { segmentNum: 4, playerScore: 7.5, opponentScore: 8.0 },
    ],
    crowdReaction: 65,
  },
  {
    roundNum: 3,
    playerScore: 8.6,
    opponentScore: 7.2,
    playerWon: true,
    playerSelection: {
      contentTypes: ["personals", "rebuttals", "punchlines", "schemes"],
      deliveryTypes: ["aggressive", "passionate"],
      performanceTypes: ["stage_presence", "dynamic_range"],
    },
    opponentSelection: {
      contentTypes: ["gun_bars", "street_talk", "personals"],
      deliveryTypes: ["aggressive"],
      performanceTypes: ["stage_presence"],
    },
    segments: [
      { segmentNum: 1, playerScore: 7.8, opponentScore: 7.2 },
      { segmentNum: 2, playerScore: 9.2, opponentScore: 7.5, playerMoment: "haymaker" },
      { segmentNum: 3, playerScore: 8.8, opponentScore: 7.0, playerMoment: "haymaker" },
      { segmentNum: 4, playerScore: 8.5, opponentScore: 7.0 },
    ],
    crowdReaction: 92,
  },
]

// ============================================
// MOCK OPPONENT CONTENT SELECTIONS
// ============================================

export const mockOpponentSelections: ContentSelection[] = [
  {
    contentTypes: ["street_talk", "personals", "gun_bars"],
    deliveryTypes: ["aggressive"],
    performanceTypes: ["stage_presence"],
  },
  {
    contentTypes: ["personals", "angles", "schemes"],
    deliveryTypes: ["passionate"],
    performanceTypes: ["theatrical"],
  },
  {
    contentTypes: ["gun_bars", "street_talk", "personals"],
    deliveryTypes: ["aggressive"],
    performanceTypes: ["stage_presence"],
  },
]

// ============================================
// HELPER: Generate Random Round Result
// ============================================

export function generateMockRoundResult(
  roundNum: number,
  playerSelection: ContentSelection,
  playerRoundsWon: number,
  opponentRoundsWon: number,
): RoundResult {
  const playerScore = 6.5 + Math.random() * 3
  const opponentScore = 6.5 + Math.random() * 3
  const playerWon = playerScore > opponentScore

  const segments = Array.from({ length: 4 }, (_, i) => {
    const pScore = 6 + Math.random() * 3.5
    const oScore = 6 + Math.random() * 3.5
    const segment: {
      segmentNum: number
      playerScore: number
      opponentScore: number
      playerMoment?: "haymaker" | "stumble" | "choke"
      opponentMoment?: "haymaker" | "stumble" | "choke"
    } = {
      segmentNum: i + 1,
      playerScore: Math.round(pScore * 10) / 10,
      opponentScore: Math.round(oScore * 10) / 10,
    }

    // Random moments
    if (pScore > 8.5 && Math.random() > 0.6) segment.playerMoment = "haymaker"
    if (pScore < 6.5 && Math.random() > 0.7) segment.playerMoment = "stumble"
    if (oScore > 8.5 && Math.random() > 0.6) segment.opponentMoment = "haymaker"
    if (oScore < 6.5 && Math.random() > 0.7) segment.opponentMoment = "stumble"

    return segment
  })

  return {
    roundNum,
    playerScore: Math.round(playerScore * 10) / 10,
    opponentScore: Math.round(opponentScore * 10) / 10,
    playerWon,
    segments,
    crowdReaction: Math.floor(50 + Math.random() * 45),
    effectiveness: {
      contentEffectiveness: 0.9 + Math.random() * 0.4,
      crowdPreference: 0.9 + Math.random() * 0.3,
      contextModifier: 0.95 + Math.random() * 0.15,
      finalMultiplier: 0.85 + Math.random() * 0.5,
    },
    opponentSelection: mockOpponentSelections[roundNum - 1] || mockOpponentSelections[0],
    runningScore: {
      playerRounds: playerRoundsWon + (playerWon ? 1 : 0),
      opponentRounds: opponentRoundsWon + (playerWon ? 0 : 1),
    },
  }
}
