import type {
  BattleInfo,
  PrepTemplate,
  Activity,
  Battler,
  Rivalry,
  PrepRecommendation,
  ImpactPreview,
  FocusType,
  DayPlan,
  Badge,
  Transaction,
  Tournament,
  NewsArticle,
} from "./types"
import { POSITIVE_WRITING_BADGES, CITY_BADGES, REGION_BADGES, type BadgeDefinition } from "./badge-system"

export const ALL_BATTLERS: Battler[] = [
  {
    id: "battler-001",
    stageName: "TECH WIZARD",
    elo: 1245,
    region: "East Coast",
    city: {
      name: "New York",
      state: "NY",
      population: 8336817,
      region: "East Coast",
      coordinates: [40.7128, -74.006],
      timeZone: "EST",
      cityTier: "major",
    },
    tier: "MID TIER",
    league: "CITY BEATZ LEAGUE",
    archetype: "Technical Writer",
    stats: {
      writing: { lyricism: 8, wordplay: 9, creativity: 7, flow: 6 },
      performance: { stagePresence: 5, crowdControl: 6, delivery: 7 },
      personal: { financial: 4, reputation: 6, family: 5, resilience: 7 },
    },
    styles: ["Wordplay", "Schemes", "Rebuttals"],
    record: { wins: 11, losses: 4 },
    streak: 3,
    stress: 45,
    badges: [
      "MASTER WORDSMITH",
      "PUNCHLINE KING",
      "TECHNICAL WRITER",
      "REBUTTAL KING",
      "WELL RESEARCHED",
      "RISING STAR",
      "CLEVER WRITER",
    ],
    styleTags: ["Wordplay", "Schemes", "Rebuttals", "Technical"],
    portrait: {
      spriteUrl: "/sprites/characters/sprite_661.png",
      crop: { scale: 1, offsetX: 0, offsetY: 0 },
    },
    isActive: true,
  },
  {
    id: "battler-002",
    stageName: "YOUNG PATTERN",
    elo: 1295,
    region: "East Coast",
    city: {
      name: "Philadelphia",
      state: "PA",
      population: 1584064,
      region: "East Coast",
      coordinates: [39.9526, -75.1652],
      timeZone: "EST",
      cityTier: "major",
    },
    tier: "MID TIER",
    league: "SMALL ROOM CIRCUIT",
    archetype: "Angle Master",
    stats: {
      writing: { lyricism: 6, wordplay: 6, creativity: 8, flow: 6 },
      performance: { stagePresence: 7, crowdControl: 7, delivery: 7 },
      personal: { financial: 5, reputation: 7, family: 4, resilience: 6 },
    },
    styles: ["Angles", "Storytelling", "Personal"],
    record: { wins: 8, losses: 5 },
    streak: -1,
    stress: 55,
    badges: ["ANGLE ASSASSIN", "CROWD FAVORITE"],
    styleTags: ["Angles", "Storytelling", "Personal", "Research Heavy"],
    portrait: {
      spriteUrl: "/sprites/characters/sprite_667.png",
      crop: { scale: 1, offsetX: 0, offsetY: 0 },
    },
    isActive: false,
  },
  {
    id: "battler-003",
    stageName: "VERBAL ASSASSIN",
    elo: 1180,
    region: "West Coast",
    city: {
      name: "Los Angeles",
      state: "CA",
      population: 3979576,
      region: "West Coast",
      coordinates: [34.0522, -118.2437],
      timeZone: "PST",
      cityTier: "major",
    },
    tier: "MID TIER",
    league: "WEST COAST WARRIORS",
    archetype: "Aggressive Performer",
    stats: {
      writing: { lyricism: 5, wordplay: 5, creativity: 6, flow: 8 },
      performance: { stagePresence: 8, crowdControl: 8, delivery: 7 },
      personal: { financial: 6, reputation: 5, family: 6, resilience: 5 },
    },
    styles: ["Aggression", "Flow", "Performance"],
    record: { wins: 5, losses: 3 },
    streak: 2,
    stress: 35,
    badges: ["CROWD CONTROLLER", "STAGE DOMINATOR"],
    styleTags: ["Aggression", "Flow", "Performance", "Energy"],
    portrait: {
      spriteUrl: "/sprites/characters/sprite_571.png",
      crop: { scale: 1.25, offsetX: 0, offsetY: -6 },
    },
    isActive: false,
  },
  {
    id: "battler-004",
    stageName: "SCHEME LORD",
    elo: 1050,
    region: "Midwest",
    city: {
      name: "Chicago",
      state: "IL",
      population: 2693976,
      region: "Midwest",
      coordinates: [41.8781, -87.6298],
      timeZone: "CST",
      cityTier: "major",
    },
    tier: "LOW TIER",
    league: "MIDWEST KINGS",
    archetype: "Scheme Heavy Writer",
    stats: {
      writing: { lyricism: 7, wordplay: 9, creativity: 7, flow: 5 },
      performance: { stagePresence: 4, crowdControl: 4, delivery: 5 },
      personal: { financial: 3, reputation: 4, family: 6, resilience: 6 },
    },
    styles: ["Schemes", "Wordplay", "Multis"],
    record: { wins: 3, losses: 4 },
    streak: -2,
    stress: 60,
    badges: ["SCHEME SPECIALIST", "RISING STAR"],
    styleTags: ["Schemes", "Wordplay", "Multis", "Complex"],
    portrait: {
      spriteUrl: "/sprites/characters/sprite_572.png",
      crop: { scale: 1.3, offsetX: 0, offsetY: -8 },
    },
    isActive: false,
  },
  {
    id: "battler-005",
    stageName: "LYRIC MASTER",
    elo: 1320,
    region: "South",
    city: {
      name: "Atlanta",
      state: "GA",
      population: 498715,
      region: "South",
      coordinates: [33.749, -84.388],
      timeZone: "EST",
      cityTier: "major",
    },
    tier: "TOP TIER",
    league: "CHAMPION'S CIRCLE",
    archetype: "Complete Package",
    stats: {
      writing: { lyricism: 8, wordplay: 7, creativity: 7, flow: 8 },
      performance: { stagePresence: 7, crowdControl: 7, delivery: 8 },
      personal: { financial: 7, reputation: 8, family: 5, resilience: 7 },
    },
    styles: ["Lyricism", "Flow", "Delivery"],
    record: { wins: 15, losses: 3 },
    streak: 5,
    stress: 40,
    badges: ["LYRICAL GENIUS", "TOP TIER CERTIFIED", "CROWD FAVORITE"],
    styleTags: ["Lyricism", "Flow", "Delivery", "Well-Rounded"],
    portrait: {
      spriteUrl: "/sprites/characters/sprite_655.png",
      crop: { scale: 1, offsetX: 0, offsetY: 0 },
    },
    isActive: false,
  },
]

export const mockBattler: Battler = ALL_BATTLERS.find((b) => b.isActive) || ALL_BATTLERS[0]

export function getBattlerById(id: string): Battler | undefined {
  return ALL_BATTLERS.find((b) => b.id === id)
}

export function getBattlerByName(name: string | undefined | null): Battler | undefined {
  if (!name) return undefined
  return ALL_BATTLERS.find((b) => b.stageName.toLowerCase() === name.toLowerCase())
}

export function setActiveBattler(id: string): Battler | undefined {
  const battler = ALL_BATTLERS.find((b) => b.id === id)
  if (battler) {
    ALL_BATTLERS.forEach((b) => (b.isActive = false))
    battler.isActive = true
  }
  return battler
}

export const mockBattleInfo: BattleInfo = {
  id: "battle-001",
  opponent: {
    name: "YOUNG PATTERN",
    tier: "MID TIER",
    rating: 1295,
    avatar: "/battle-rapper-portrait-pixel-art.jpg",
    styles: ["Angles", "Storytelling"],
    record: "3-2",
  },
  league: "SMALL ROOM CIRCUIT",
  battleDate: "DEC 15",
  lockDate: "DEC 10",
  prepDays: 7,
  status: "accepted",
  payout: {
    basePay: 500,
    winBonus: 1200,
  },
}

export const mockRivalries: Rivalry[] = [
  {
    id: "rivalry-001",
    opponent: {
      id: "battler-002",
      name: "YOUNG PATTERN",
      avatar: "/sprites/characters/sprite_667.png",
      tier: "MID TIER",
    },
    intensity: 85,
    headToHead: "1-0",
    lastBattle: "2-1 Win (You)",
    lastBattleDate: "5 days ago",
    rematchDemand: 92,
    origin: "Controversial decision upset",
    status: "active",
    record: { wins: 1, losses: 0 },
  },
  {
    id: "rivalry-002",
    opponent: {
      id: "battler-005",
      name: "LYRIC MASTER",
      avatar: "/sprites/characters/sprite_655.png",
      tier: "TOP TIER",
    },
    intensity: 42,
    headToHead: "1-0",
    lastBattle: "2-0 Victory (You)",
    lastBattleDate: "10 days ago",
    rematchDemand: 28,
    origin: "Rankings dispute",
    status: "active",
    record: { wins: 1, losses: 0 },
  },
]

export const mockBattleOffers: BattleInfo[] = [
  {
    id: "offer-001",
    opponent: {
      name: "YOUNG PATTERN",
      tier: "MID TIER",
      rating: 1295,
      avatar: "/battle-rapper-hoodie-pixel.jpg",
      styles: ["Angles", "Storytelling"],
      record: "8-5",
    },
    league: "SMALL ROOM CIRCUIT",
    battleDate: "DEC 20",
    lockDate: "DEC 15",
    prepDays: 10,
    status: "offered",
    payout: { basePay: 500, winBonus: 1200, rivalryBonus: 400 },
    isGrudgeMatch: true,
    grudgeIntensity: 82,
    venueTypeId: "container-venue",
  },
  {
    id: "offer-002",
    opponent: {
      name: "VERBAL ASSASSIN",
      tier: "MID TIER",
      rating: 1180,
      avatar: "/rapper-with-cap-pixel-art.jpg",
      styles: ["Aggression", "Flow"],
      record: "5-3",
    },
    league: "SMALL ROOM CIRCUIT",
    battleDate: "DEC 22",
    lockDate: "DEC 17",
    prepDays: 12,
    status: "offered",
    payout: { basePay: 500, winBonus: 1000 },
    venueTypeId: "small-theater",
  },
  {
    id: "offer-003",
    opponent: {
      name: "SCHEME LORD",
      tier: "LOW TIER",
      rating: 1050,
      avatar: "/rapper-gold-chain-pixel.jpg",
      styles: ["Schemes", "Wordplay"],
      record: "3-4",
    },
    league: "SMALL ROOM CIRCUIT",
    battleDate: "DEC 25",
    lockDate: "DEC 20",
    prepDays: 15,
    status: "offered",
    payout: { basePay: 400, winBonus: 800 },
    venueTypeId: "barbershop",
  },
]

export const prepTemplates: PrepTemplate[] = [
  {
    id: "balanced",
    name: "BALANCED STRATEGY",
    description: "Recommended mix of Writing, Performance, Rest",
    plan: ["writing", "writing", "rest", "performance", "writing", "performance", "rest"],
  },
  {
    id: "grind",
    name: "GRIND STRATEGY",
    description: "Heavy Writing & Performance focus, high stress",
    plan: ["writing", "writing", "writing", "performance", "performance", "writing", "performance"],
  },
  {
    id: "recovery",
    name: "RECOVERY STRATEGY",
    description: "Focus on Rest & Life to reduce stress",
    plan: ["rest", "life", "writing", "rest", "life", "writing", "rest"],
  },
]

export const focusActivities: Record<FocusType, Activity[]> = {
  research: [
    { id: "study-opponent", name: "STUDY OPPONENT FOOTAGE", bonus: "+Angles", bonusColor: "green" },
    { id: "gather-intel", name: "GATHER INTEL", bonus: "+Research", bonusColor: "green" },
    { id: "analyze-style", name: "ANALYZE OPPONENT STYLE", bonus: "+Preparation", bonusColor: "green" },
  ],
  writing: [
    { id: "punch-session", name: "PUNCHLINE SESSION", bonus: "+Lyricism", bonusColor: "orange" },
    { id: "scheme-workshop", name: "SCHEME WORKSHOP", bonus: "+Wordplay", bonusColor: "orange" },
    { id: "freestyle-drill", name: "FREESTYLE DRILLS", bonus: "+Flow", bonusColor: "orange" },
  ],
  performance: [
    { id: "mirror-practice", name: "MIRROR PRACTICE", bonus: "+Stage Presence", bonusColor: "blue" },
    { id: "crowd-drills", name: "CROWD CONTROL DRILLS", bonus: "+Crowd Control", bonusColor: "blue" },
    { id: "delivery-workshop", name: "DELIVERY WORKSHOP", bonus: "+Delivery", bonusColor: "blue" },
  ],
  life: [
    { id: "family-time", name: "FAMILY TIME", bonus: "+Family", bonusColor: "purple" },
    { id: "financial-mgmt", name: "FINANCIAL MANAGEMENT", bonus: "+Financial", bonusColor: "purple" },
    { id: "networking", name: "NETWORKING", bonus: "+Reputation", bonusColor: "purple" },
  ],
  rest: [
    { id: "full-rest", name: "FULL REST DAY", bonus: "-Stress", bonusColor: "green" },
    { id: "meditation", name: "MEDITATION", bonus: "+Resilience", bonusColor: "green" },
    { id: "light-review", name: "LIGHT MATERIAL REVIEW", bonus: "+Memory", bonusColor: "green" },
  ],
}

export const defaultRecommendations: PrepRecommendation[] = [
  { type: "success", text: "Focus on", highlight: "WRITING", action: "(5-7 days)\n→ Boost lyricism" },
  { type: "success", text: "Include 2-3", highlight: "REST", action: "days" },
  { type: "warning", text: "Opponent uses angles\n→ Consider", highlight: "RESEARCH", action: "" },
]

export const mockBadges: Badge[] = [
  {
    id: "badge-001",
    code: "MASTER_WORDSMITH",
    name: "MASTER WORDSMITH",
    tier: "gold",
    category: "writing",
    description: "Exceptional wordplay and double entendres that captivate judges",
    effects: ["+15% wordplay skill", "+10% creativity", "+5% crowd reaction on haymakers"],
    howToEarn: "Win 5 battles with 8+ wordplay",
    isEquipped: true,
  },
  {
    id: "badge-046",
    code: "REBUTTAL_KING",
    name: "REBUTTAL KING",
    tier: "silver",
    category: "writing",
    description: "Quick thinker who adapts on the fly with devastating rebuttals",
    effects: ["-2% choke chance", "+20% creativity", "+15% performance prep"],
    howToEarn: "Land 10 successful rebuttals in battles",
    isEquipped: true,
  },
  {
    id: "badge-054",
    code: "WELL_RESEARCHED",
    name: "WELL RESEARCHED",
    tier: "silver",
    category: "writing",
    description: "Thorough preparation leads to devastating angles and deep knowledge",
    effects: ["+35% research prep", "+20% creativity", "+20% peak score"],
    howToEarn: "Complete 15 battles with 3+ research days",
    isEquipped: true,
  },
  {
    id: "badge-004",
    code: "ANGLE_ASSASSIN",
    name: "ANGLE ASSASSIN",
    tier: "silver",
    category: "content",
    description: "Master of personal attacks and well-researched angles",
    effects: ["+10% creativity", "+5% crowd reaction"],
  },
  {
    id: "badge-005",
    code: "RISING_STAR",
    name: "RISING STAR",
    tier: "bronze",
    category: "reputation_positive",
    description: "The community sees your potential and momentum",
    effects: ["+5% reputation"],
  },
  {
    id: "badge-006",
    code: "CROWD_FAVORITE",
    name: "CROWD FAVORITE",
    tier: "silver",
    category: "performance",
    description: "The audience loves your energy and stage presence",
    effects: ["+10% crowd reaction", "+5% crowd control"],
  },
  {
    id: "badge-007",
    code: "SCHEME_SPECIALIST",
    name: "SCHEME SPECIALIST",
    tier: "bronze",
    category: "writing",
    description: "Complex rhyme patterns are your specialty",
    effects: ["+10% creativity", "+5% crowd reaction on haymakers"],
  },
]

export const allBadgeDefinitions: BadgeDefinition[] = [...POSITIVE_WRITING_BADGES, ...CITY_BADGES, ...REGION_BADGES]

export const mockTransactions: Transaction[] = [
  {
    id: "tx-1",
    type: "battle_win",
    amount: 1200,
    description: "Battle Win Bonus",
    date: "Dec 15",
    battleId: "b-1",
    metadata: { opponent: "Young Pattern" },
  },
  { id: "tx-2", type: "battle_win", amount: 1200, description: "Battle Win Bonus", date: "Dec 14", battleId: "b-2" },
  { id: "tx-3", type: "battle_win", amount: 1200, description: "Battle Win Bonus", date: "Dec 13", battleId: "b-3" },
  { id: "tx-4", type: "entry_fee", amount: -500, description: "Tournament Entry Fee", date: "Dec 10" },
  { id: "tx-5", type: "base_pay", amount: 200, description: "Battle Win Bonus", date: "Dec 10", battleId: "b-4" },
  { id: "tx-6", type: "entry_fee", amount: -500, description: "Tournament Entry Fee", date: "Dec 10" },
  { id: "tx-7", type: "merch", amount: 1000, description: "Merch Sales", date: "Dec 10" },
  { id: "tx-8", type: "battle_win", amount: 1200, description: "Battle Win", date: "Dec 11" },
  { id: "tx-9", type: "league_fee", amount: -15000, description: "League Fee", date: "Dec 11" },
]

export const mockTournaments: Tournament[] = [
  {
    id: "t-001",
    name: "CHAMPION'S CIRCLE GRAND PRIX",
    dates: "DEC 15 - JAN 10",
    prizePool: 50000,
    entryFee: 2000,
    status: "open",
    format: "Single Elimination",
    rules: "2-Min Rounds, 3 Rounds",
  },
  {
    id: "t-002",
    name: "SMALL ROOM CIRCUIT SHOWDOWN",
    dates: "Starts DEC 15",
    prizePool: 5000,
    entryFee: 500,
    status: "upcoming",
    format: "Single Elimination",
    rules: "2-Min Rounds, 3 Rounds",
  },
]

export const mockArticles: NewsArticle[] = [
  {
    id: "art-1",
    slug: "upset-that-shocked-circuit",
    title: "The Upset That Shocked The Circuit",
    type: "battle_recap",
    date: "Dec 15, 2025",
    views: 234,
    excerpt: "Tech Wizard scores upset victory over favored Young Pattern...",
    battlers: ["Tech Wizard", "Young Pattern"],
    league: "Small Room Circuit",
  },
  {
    id: "art-2",
    slug: "young-pattern-responds",
    title: "Young Pattern Responds to Controversial Loss",
    type: "grudge_coverage",
    date: "Dec 16, 2025",
    views: 189,
    battlers: ["Young Pattern"],
  },
  {
    id: "art-3",
    slug: "tech-wizard-rise",
    title: "Tech Wizard's Rapid Rise Through The Ranks",
    type: "career_update",
    date: "Dec 12, 2025",
    views: 156,
    battlers: ["Tech Wizard"],
  },
]

export const mockRecentBattles = [
  {
    id: "battle-recent-001",
    opponent: "YOUNG PATTERN",
    result: "WIN",
    score: "2-1",
    date: "Dec 15, 2025",
    league: "SMALL ROOM CIRCUIT",
    eloChange: +45,
  },
  {
    id: "battle-recent-002",
    opponent: "LYRIC MASTER",
    result: "WIN",
    score: "2-0",
    date: "Dec 10, 2025",
    league: "CHAMPION'S CIRCLE",
    eloChange: +62,
  },
  {
    id: "battle-recent-003",
    opponent: "VERBAL ASSASSIN",
    result: "WIN",
    score: "2-1",
    date: "Dec 5, 2025",
    league: "SMALL ROOM CIRCUIT",
    eloChange: +38,
  },
  {
    id: "battle-recent-004",
    opponent: "SCHEME LORD",
    result: "LOSS",
    score: "1-2",
    date: "Nov 28, 2025",
    league: "MIDWEST KINGS",
    eloChange: -52,
  },
  {
    id: "battle-recent-005",
    opponent: "FLOW MASTER",
    result: "WIN",
    score: "3-0",
    date: "Nov 20, 2025",
    league: "SMALL ROOM CIRCUIT",
    eloChange: +41,
  },
]

export function calculateImpactPreview(days: DayPlan[]): ImpactPreview {
  let lyricism = 0
  let flow = 0
  let resilience = 0
  let stressChange = 0

  days.forEach((day) => {
    switch (day.focus) {
      case "writing":
        lyricism += 0.3
        flow += 0.2
        stressChange += 2
        break
      case "performance":
        flow += 0.3
        stressChange += 3
        break
      case "research":
        lyricism += 0.1
        stressChange += 1
        break
      case "rest":
        resilience += 0.2
        stressChange -= 3
        break
      case "life":
        resilience += 0.1
        stressChange -= 1
        break
    }
  })

  const baseStress = 45
  const finalStress = Math.max(0, Math.min(100, baseStress + stressChange))
  const avgBoost = (lyricism + flow) / 2
  const predictedScore = 6.5 + avgBoost
  const chokeRisk = Math.max(2, Math.min(30, 5 + (finalStress - 50) * 0.3))

  return {
    lyricism: Math.round(lyricism * 10) / 10,
    flow: Math.round(flow * 10) / 10,
    resilience: Math.round(resilience * 10) / 10,
    stressChange: { from: baseStress, to: Math.round(finalStress) },
    predictedScore: Math.round(predictedScore * 10) / 10,
    chokeRisk: Math.round(chokeRisk),
  }
}
