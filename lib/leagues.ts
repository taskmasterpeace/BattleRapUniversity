// LEAGUE SYSTEM

export type LeagueTier = "underground" | "regional" | "national" | "premier"
export type PersonalityStyle = "technical" | "aggressive" | "diverse" | "street"

export interface League {
  id: string
  name: string
  displayName: string
  slug: string
  tier: LeagueTier
  region: string
  city?: string
  state?: string
  description: string
  tagline: string
  founded: string
  avgRating: number
  battlerCount: number
  totalBattles: number
  homeVenueTypeId?: string
  logoUrl?: string
  logoId?: string // e.g. "league_089" maps to /sprites/leagues/league_089.png
  primaryColor: string
  secondaryColor: string
  isActive: boolean

  // Battle Format
  roundDurationSeconds: number // 120 or 180
  roundsPerBattle: number // 3

  // Judging Weights (sum to 100)
  writingWeight: number
  performanceWeight: number
  crowdReactionWeight: number

  // Crowd Mechanics
  baseCrowdFactor: number // 0.7 to 1.3

  // Personality
  personalityStyle: PersonalityStyle
  prestigeLevel: number // 1-10

  // Audience Preferences (0-10 scale)
  audienceFavorsLyricism: number
  audienceFavorsDelivery: number
  audienceFavorsStorytelling: number
  audienceFavorsCrowdEngagement: number

  // Economics
  basePayout: number
}

export interface LeagueBlogger {
  id: string
  name: string
  handle: string
  blogName: string
  avatarUrl: string
  coverageStyle: string
  notableTakes: string[]
  articlesCount: number
  followers: number
  leagueId: string
}

export interface LeagueStats {
  totalBattles: number
  totalBattlers: number
  avgRating: number
  avgCrowdReaction: number
  bodyRate: number // % of 3-0 wins
  closeRate: number // % of 2-1 wins
  chokeRate: number // % of battles with chokes
  thisMonth: number
}

export const LEAGUES: League[] = [
  // Underground
  {
    id: "underground-kings",
    name: "underground_kings",
    displayName: "Underground Kings",
    slug: "underground-kings",
    tier: "underground",
    region: "Southeast",
    city: "Atlanta",
    state: "GA",
    description: "Where legends are born. Raw underground battles with skull-crushing bars.",
    tagline: "Wear The Crown or Get Buried",
    founded: "2018",
    avgRating: 950,
    battlerCount: 45,
    totalBattles: 156,
    homeVenueTypeId: "garage",
    logoUrl: "/leagues/underground-kings.png",
    primaryColor: "#eab308",
    secondaryColor: "#1c1917",
    isActive: true,
    roundDurationSeconds: 120,
    roundsPerBattle: 3,
    writingWeight: 40,
    performanceWeight: 30,
    crowdReactionWeight: 30,
    baseCrowdFactor: 1.2,
    personalityStyle: "street",
    prestigeLevel: 3,
    audienceFavorsLyricism: 5,
    audienceFavorsDelivery: 7,
    audienceFavorsStorytelling: 4,
    audienceFavorsCrowdEngagement: 9,
    basePayout: 200,
  },
  {
    id: "bar-god",
    name: "bar_god",
    displayName: "Bar God Battle League",
    slug: "bar-god",
    tier: "underground",
    region: "Northeast",
    city: "Philadelphia",
    state: "PA",
    description: "Philly's finest. Lightning-fast bars and electrifying performances.",
    tagline: "Strike Like Lightning",
    founded: "2016",
    avgRating: 1020,
    battlerCount: 38,
    totalBattles: 198,
    homeVenueTypeId: "basement",
    logoUrl: "/leagues/bar-god.png",
    primaryColor: "#eab308",
    secondaryColor: "#14532d",
    isActive: true,
    roundDurationSeconds: 120,
    roundsPerBattle: 3,
    writingWeight: 50,
    performanceWeight: 25,
    crowdReactionWeight: 25,
    baseCrowdFactor: 1.0,
    personalityStyle: "technical",
    prestigeLevel: 4,
    audienceFavorsLyricism: 7,
    audienceFavorsDelivery: 5,
    audienceFavorsStorytelling: 6,
    audienceFavorsCrowdEngagement: 5,
    basePayout: 250,
  },
  {
    id: "i-do-what-i-want",
    name: "i_do_what_i_want",
    displayName: "I Do What I Want",
    slug: "i-do-what-i-want",
    tier: "underground",
    region: "Midwest",
    city: "Detroit",
    state: "MI",
    description: "Motor City rebels. No rules, no limits, pure street art.",
    tagline: "No Rules, Just Results",
    founded: "2019",
    avgRating: 980,
    battlerCount: 32,
    totalBattles: 124,
    homeVenueTypeId: "alley",
    logoUrl: "/leagues/i-do-what-i-want.png",
    primaryColor: "#dc2626",
    secondaryColor: "#1e3a8a",
    isActive: true,
    roundDurationSeconds: 120,
    roundsPerBattle: 3,
    writingWeight: 45,
    performanceWeight: 30,
    crowdReactionWeight: 25,
    baseCrowdFactor: 1.1,
    personalityStyle: "aggressive",
    prestigeLevel: 3,
    audienceFavorsLyricism: 6,
    audienceFavorsDelivery: 8,
    audienceFavorsStorytelling: 5,
    audienceFavorsCrowdEngagement: 7,
    basePayout: 180,
  },
  {
    id: "the-gutter",
    name: "the_gutter",
    displayName: "The Gutter Battle League",
    slug: "the-gutter",
    tier: "underground",
    region: "Southeast",
    city: "Memphis",
    state: "TN",
    description: "From the depths. Raw, unfiltered battle rap where only the grimiest survive.",
    tagline: "Rise From The Filth",
    founded: "2019",
    avgRating: 920,
    battlerCount: 35,
    totalBattles: 98,
    homeVenueTypeId: "basement",
    logoUrl: "/leagues/the-gutter.png",
    primaryColor: "#f97316",
    secondaryColor: "#78350f",
    isActive: true,
    roundDurationSeconds: 120,
    roundsPerBattle: 3,
    writingWeight: 35,
    performanceWeight: 35,
    crowdReactionWeight: 30,
    baseCrowdFactor: 1.25,
    personalityStyle: "aggressive",
    prestigeLevel: 2,
    audienceFavorsLyricism: 4,
    audienceFavorsDelivery: 8,
    audienceFavorsStorytelling: 5,
    audienceFavorsCrowdEngagement: 9,
    basePayout: 150,
  },
  {
    id: "the-pit",
    name: "the_pit",
    displayName: "The Pit Battle League",
    slug: "the-pit",
    tier: "underground",
    region: "Southwest",
    city: "Houston",
    state: "TX",
    description: "Descend into the pit. Chains, skulls, and merciless bars.",
    tagline: "Enter At Your Own Risk",
    founded: "2018",
    avgRating: 940,
    battlerCount: 42,
    totalBattles: 134,
    homeVenueTypeId: "alley",
    logoUrl: "/leagues/the-pit.png",
    primaryColor: "#78716c",
    secondaryColor: "#44403c",
    isActive: true,
    roundDurationSeconds: 120,
    roundsPerBattle: 3,
    writingWeight: 40,
    performanceWeight: 35,
    crowdReactionWeight: 25,
    baseCrowdFactor: 1.2,
    personalityStyle: "aggressive",
    prestigeLevel: 3,
    audienceFavorsLyricism: 5,
    audienceFavorsDelivery: 8,
    audienceFavorsStorytelling: 4,
    audienceFavorsCrowdEngagement: 8,
    basePayout: 175,
  },
  {
    id: "flame-wars",
    name: "flame_wars",
    displayName: "Flame Wars",
    slug: "flame-wars",
    tier: "underground",
    region: "West",
    city: "Phoenix",
    state: "AZ",
    description: "Bring the heat or get burned. Desert fire battle rap.",
    tagline: "Burn Or Be Burned",
    founded: "2020",
    avgRating: 910,
    battlerCount: 28,
    totalBattles: 76,
    homeVenueTypeId: "garage",
    logoUrl: "/leagues/flame-wars.png",
    primaryColor: "#ef4444",
    secondaryColor: "#fbbf24",
    isActive: true,
    roundDurationSeconds: 120,
    roundsPerBattle: 3,
    writingWeight: 40,
    performanceWeight: 30,
    crowdReactionWeight: 30,
    baseCrowdFactor: 1.15,
    personalityStyle: "aggressive",
    prestigeLevel: 2,
    audienceFavorsLyricism: 5,
    audienceFavorsDelivery: 7,
    audienceFavorsStorytelling: 4,
    audienceFavorsCrowdEngagement: 8,
    basePayout: 125,
  },

  // Regional
  {
    id: "small-room-circuit",
    name: "small_room_circuit",
    displayName: "Small Room Circuit",
    slug: "small-room-circuit",
    tier: "regional",
    region: "Northeast",
    description: "Intimate battles, maximum impact. Where pen game matters most.",
    tagline: "Where Pen Game Matters Most",
    founded: "2015",
    avgRating: 1100, // Adjusted from 1180 in original
    battlerCount: 65,
    totalBattles: 312,
    homeVenueTypeId: "small-bar",
    primaryColor: "#a855f7",
    secondaryColor: "#3b0764",
    isActive: true,
    roundDurationSeconds: 120,
    roundsPerBattle: 3,
    writingWeight: 60,
    performanceWeight: 20,
    crowdReactionWeight: 20,
    baseCrowdFactor: 0.85,
    personalityStyle: "technical",
    prestigeLevel: 5,
    audienceFavorsLyricism: 9,
    audienceFavorsDelivery: 4,
    audienceFavorsStorytelling: 7,
    audienceFavorsCrowdEngagement: 3,
    basePayout: 500,
  },
  {
    id: "milwaukee-massacre",
    name: "milwaukee_massacre",
    displayName: "Milwaukee Massacre",
    slug: "milwaukee-massacre",
    tier: "regional",
    region: "Midwest",
    city: "Milwaukee",
    state: "WI",
    description: "Midwest fire. Chains and flames, no survivors.",
    tagline: "Burn It All Down",
    founded: "2015",
    avgRating: 1180,
    battlerCount: 65,
    totalBattles: 312,
    homeVenueTypeId: "small-bar",
    logoUrl: "/leagues/milwaukee-massacre.png",
    primaryColor: "#f97316",
    secondaryColor: "#7f1d1d",
    isActive: true,
    roundDurationSeconds: 120,
    roundsPerBattle: 3,
    writingWeight: 45,
    performanceWeight: 30,
    crowdReactionWeight: 25,
    baseCrowdFactor: 1.15,
    personalityStyle: "aggressive",
    prestigeLevel: 5,
    audienceFavorsLyricism: 6,
    audienceFavorsDelivery: 8,
    audienceFavorsStorytelling: 5,
    audienceFavorsCrowdEngagement: 8,
    basePayout: 500,
  },
  {
    id: "gun-battle-league",
    name: "gun_battle_league",
    displayName: "G.U.N. Battle League",
    slug: "gun-battle-league",
    tier: "regional",
    region: "West",
    city: "Los Angeles",
    state: "CA",
    description: "Precision targeting. Every bar hits its mark.",
    tagline: "Aim. Fire. Body.",
    founded: "2014",
    avgRating: 1250,
    battlerCount: 72,
    totalBattles: 289,
    homeVenueTypeId: "warehouse",
    logoUrl: "/leagues/gun.png",
    primaryColor: "#22c55e",
    secondaryColor: "#1c1917",
    isActive: true,
    roundDurationSeconds: 180,
    roundsPerBattle: 3,
    writingWeight: 50,
    performanceWeight: 25,
    crowdReactionWeight: 25,
    baseCrowdFactor: 1.0,
    personalityStyle: "technical",
    prestigeLevel: 6,
    audienceFavorsLyricism: 8,
    audienceFavorsDelivery: 6,
    audienceFavorsStorytelling: 7,
    audienceFavorsCrowdEngagement: 5,
    basePayout: 650,
  },
  {
    id: "stay-forever",
    name: "stay_forever",
    displayName: "Stay Forever Battle League",
    slug: "stay-forever",
    tier: "regional",
    region: "Southeast",
    city: "Atlanta",
    state: "GA",
    description: "Infinite excellence. Crown holders reign forever.",
    tagline: "Legends Never Die",
    founded: "2017",
    avgRating: 1200,
    battlerCount: 58,
    totalBattles: 234,
    homeVenueTypeId: "community-center",
    logoUrl: "/leagues/stay-forever.png",
    primaryColor: "#22c55e",
    secondaryColor: "#eab308",
    isActive: true,
    roundDurationSeconds: 180,
    roundsPerBattle: 3,
    writingWeight: 45,
    performanceWeight: 30,
    crowdReactionWeight: 25,
    baseCrowdFactor: 1.2,
    personalityStyle: "diverse",
    prestigeLevel: 5,
    audienceFavorsLyricism: 7,
    audienceFavorsDelivery: 7,
    audienceFavorsStorytelling: 6,
    audienceFavorsCrowdEngagement: 7,
    basePayout: 550,
  },
  {
    id: "quiet-room",
    name: "quiet_room",
    displayName: "Quiet Room Battle League",
    slug: "quiet-room",
    tier: "regional",
    region: "Northeast",
    city: "Boston",
    state: "MA",
    description: "Intimate setting. No crowd noise, just pure pen. Every bar hits different.",
    tagline: "Hear Every Word",
    founded: "2016",
    avgRating: 1220,
    battlerCount: 52,
    totalBattles: 245,
    homeVenueTypeId: "small-bar",
    logoUrl: "/leagues/quiet-room.png",
    primaryColor: "#8b5cf6",
    secondaryColor: "#4c1d95",
    isActive: true,
    roundDurationSeconds: 180,
    roundsPerBattle: 3,
    writingWeight: 65,
    performanceWeight: 20,
    crowdReactionWeight: 15,
    baseCrowdFactor: 0.75,
    personalityStyle: "technical",
    prestigeLevel: 6,
    audienceFavorsLyricism: 10,
    audienceFavorsDelivery: 4,
    audienceFavorsStorytelling: 8,
    audienceFavorsCrowdEngagement: 2,
    basePayout: 600,
  },
  {
    id: "city-beatz",
    name: "city_beatz",
    displayName: "City Beatz League",
    slug: "city-beatz",
    tier: "regional",
    region: "Northeast",
    city: "New York",
    state: "NY",
    description: "Urban rhythms. The city's heartbeat flows through every battle.",
    tagline: "The Sound Of The Streets",
    founded: "2015",
    avgRating: 1280,
    battlerCount: 68,
    totalBattles: 298,
    homeVenueTypeId: "nightclub",
    logoUrl: "/leagues/city-beatz.png",
    primaryColor: "#06b6d4",
    secondaryColor: "#f97316",
    isActive: true,
    roundDurationSeconds: 180,
    roundsPerBattle: 3,
    writingWeight: 45,
    performanceWeight: 30,
    crowdReactionWeight: 25,
    baseCrowdFactor: 1.1,
    personalityStyle: "diverse",
    prestigeLevel: 6,
    audienceFavorsLyricism: 7,
    audienceFavorsDelivery: 7,
    audienceFavorsStorytelling: 6,
    audienceFavorsCrowdEngagement: 7,
    basePayout: 700,
  },
  {
    id: "word-warrior",
    name: "word_warrior",
    displayName: "Word Warrior Battle League",
    slug: "word-warrior",
    tier: "regional",
    region: "Midwest",
    city: "Chicago",
    state: "IL",
    description: "Knights of the pen. Medieval warfare with modern wordplay.",
    tagline: "Fight With Words",
    founded: "2017",
    avgRating: 1190,
    battlerCount: 55,
    totalBattles: 212,
    homeVenueTypeId: "community-center",
    logoUrl: "/leagues/word-warrior.png",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e3a8a",
    isActive: true,
    roundDurationSeconds: 180,
    roundsPerBattle: 3,
    writingWeight: 55,
    performanceWeight: 25,
    crowdReactionWeight: 20,
    baseCrowdFactor: 1.0,
    personalityStyle: "technical",
    prestigeLevel: 5,
    audienceFavorsLyricism: 8,
    audienceFavorsDelivery: 5,
    audienceFavorsStorytelling: 7,
    audienceFavorsCrowdEngagement: 5,
    basePayout: 550,
  },

  // National
  {
    id: "respect-the-craft",
    name: "respect_the_craft",
    displayName: "Respect The Craft",
    slug: "respect-the-craft",
    tier: "national",
    region: "National",
    description: "Where pen meets performance. The writer's battlefield.",
    tagline: "Honor The Art",
    founded: "2012",
    avgRating: 1480,
    battlerCount: 120,
    totalBattles: 567,
    homeVenueTypeId: "small-theater",
    logoUrl: "/leagues/respect-the-craft.png",
    primaryColor: "#a855f7",
    secondaryColor: "#dc2626",
    isActive: true,
    roundDurationSeconds: 180,
    roundsPerBattle: 3,
    writingWeight: 55,
    performanceWeight: 25,
    crowdReactionWeight: 20,
    baseCrowdFactor: 0.95,
    personalityStyle: "technical",
    prestigeLevel: 7,
    audienceFavorsLyricism: 9,
    audienceFavorsDelivery: 5,
    audienceFavorsStorytelling: 8,
    audienceFavorsCrowdEngagement: 5,
    basePayout: 1500,
  },
  {
    id: "royal-rhyme",
    name: "royal_rhyme",
    displayName: "Royal Rhyme League",
    slug: "royal-rhyme",
    tier: "national",
    region: "National",
    description: "Royalty only. Crown holders and throne seekers battle for supremacy.",
    tagline: "Bow To The Bars",
    founded: "2013",
    avgRating: 1520,
    battlerCount: 95,
    totalBattles: 456,
    homeVenueTypeId: "small-theater",
    logoUrl: "/leagues/royal-rhyme.png",
    primaryColor: "#a855f7",
    secondaryColor: "#eab308",
    isActive: true,
    roundDurationSeconds: 180,
    roundsPerBattle: 3,
    writingWeight: 50,
    performanceWeight: 30,
    crowdReactionWeight: 20,
    baseCrowdFactor: 1.05,
    personalityStyle: "diverse",
    prestigeLevel: 8,
    audienceFavorsLyricism: 8,
    audienceFavorsDelivery: 7,
    audienceFavorsStorytelling: 7,
    audienceFavorsCrowdEngagement: 6,
    basePayout: 2500,
  },

  // Premier
  {
    id: "global-word-war",
    name: "global_word_war",
    displayName: "Global Word War",
    slug: "global-word-war",
    tier: "premier",
    region: "International",
    description: "The world stage. Battlers from every continent clash for global supremacy.",
    tagline: "Worldwide Warfare",
    founded: "2010",
    avgRating: 1750,
    battlerCount: 180,
    totalBattles: 1245,
    homeVenueTypeId: "arena",
    logoUrl: "/leagues/global-word-war.png",
    primaryColor: "#22c55e",
    secondaryColor: "#3b82f6",
    isActive: true,
    roundDurationSeconds: 180,
    roundsPerBattle: 3,
    writingWeight: 45,
    performanceWeight: 30,
    crowdReactionWeight: 25,
    baseCrowdFactor: 1.3,
    personalityStyle: "diverse",
    prestigeLevel: 10,
    audienceFavorsLyricism: 8,
    audienceFavorsDelivery: 8,
    audienceFavorsStorytelling: 7,
    audienceFavorsCrowdEngagement: 9,
    basePayout: 5000,
  },
  {
    id: "main-stage",
    name: "main_stage",
    displayName: "Main Stage",
    slug: "main-stage",
    tier: "premier",
    region: "National",
    city: "Las Vegas",
    state: "NV",
    description: "The brightest lights. Premier battle rap under the Vegas glow.",
    tagline: "All Eyes On You",
    founded: "2011",
    avgRating: 1800, // Adjusted from 1700 in original
    battlerCount: 150,
    totalBattles: 987, // Adjusted from 890 in original
    homeVenueTypeId: "arena",
    logoUrl: "/leagues/main-stage.png",
    primaryColor: "#eab308",
    secondaryColor: "#1e3a8a",
    isActive: true,
    roundDurationSeconds: 180,
    roundsPerBattle: 3,
    writingWeight: 40, // Adjusted from 45 in original
    performanceWeight: 35, // Adjusted from 35 in original
    crowdReactionWeight: 25, // Adjusted from 20 in original
    baseCrowdFactor: 1.35, // Adjusted from 1.25 in original
    personalityStyle: "diverse",
    prestigeLevel: 10,
    audienceFavorsLyricism: 7, // Adjusted from 7 in original
    audienceFavorsDelivery: 9, // Adjusted from 8 in original
    audienceFavorsStorytelling: 7, // Adjusted from 7 in original
    audienceFavorsCrowdEngagement: 10, // Adjusted from 8 in original
    basePayout: 7500, // Adjusted from 4500 in original
  },
]

// Helper functions
export function getLeagueById(id: string): League | undefined {
  return LEAGUES.find((l) => l.id === id)
}

export function getLeagueBySlug(slug: string): League | undefined {
  return LEAGUES.find((l) => l.slug === slug)
}

export function getLeaguesByTier(tier: LeagueTier): League[] {
  return LEAGUES.filter((l) => l.tier === tier)
}

export function getActiveLeagues(): League[] {
  return LEAGUES.filter((l) => l.isActive)
}

export function getLeaguesByRegion(region: string): League[] {
  return LEAGUES.filter((l) => l.region === region)
}

// Get a random league for battler assignment
export function getRandomLeague(tier?: LeagueTier): League {
  const leagues = tier ? getLeaguesByTier(tier) : LEAGUES
  return leagues[Math.floor(Math.random() * leagues.length)]
}

// Get starter league for new battlers
export function getStarterLeague(): League {
  return getLeagueById("small-room-circuit") || LEAGUES[0]
}

// Tier progression requirements
export function getTierRequirements(tier: LeagueTier): { minRating: number; minWins: number; minBattles: number } {
  switch (tier) {
    case "underground":
      return { minRating: 0, minWins: 0, minBattles: 0 }
    case "regional":
      return { minRating: 1000, minWins: 5, minBattles: 10 }
    case "national":
      return { minRating: 1300, minWins: 15, minBattles: 30 }
    case "premier":
      return { minRating: 1600, minWins: 30, minBattles: 50 }
  }
}

// Check if battler qualifies for tier
export function canBattlerAccessTier(
  battlerRating: number,
  battlerWins: number,
  battlerBattles: number,
  tier: LeagueTier,
): boolean {
  const reqs = getTierRequirements(tier)
  return battlerRating >= reqs.minRating && battlerWins >= reqs.minWins && battlerBattles >= reqs.minBattles
}

// Get tier display info
export function getTierInfo(tier: LeagueTier): { label: string; color: string; bgColor: string } {
  switch (tier) {
    case "underground":
      return { label: "Underground", color: "text-orange-400", bgColor: "bg-orange-500/20" }
    case "regional":
      return { label: "Regional", color: "text-blue-400", bgColor: "bg-blue-500/20" }
    case "national":
      return { label: "National", color: "text-purple-400", bgColor: "bg-purple-500/20" }
    case "premier":
      return { label: "Premier", color: "text-amber-400", bgColor: "bg-amber-500/20" }
  }
}

// League bloggers
export const LEAGUE_BLOGGERS: LeagueBlogger[] = [
  {
    id: "blogger-1",
    name: "Marcus 'The Pen' Williams",
    handle: "@BarBreakdown",
    blogName: "Bar Breakdown",
    avatarUrl: "/hip-hop-blogger-avatar.jpg",
    coverageStyle: "Technical analysis of wordplay and schemes",
    notableTakes: [
      "Underground Kings is where real lyricists go to prove themselves",
      "Bar God has the best technical battlers in the game",
    ],
    articlesCount: 245,
    followers: 34500,
    leagueId: "bar-god",
  },
  {
    id: "blogger-2",
    name: "Destiny 'D-Block' Johnson",
    handle: "@CrowdWork",
    blogName: "Crowd Reactions Daily",
    avatarUrl: "/female-hip-hop-journalist.jpg",
    coverageStyle: "Crowd reaction and performance analysis",
    notableTakes: ["Main Stage crowds are unmatched in energy", "The Gutter brings out the rawest performances"],
    articlesCount: 189,
    followers: 28900,
    leagueId: "main-stage",
  },
  {
    id: "blogger-3",
    name: "Andre 'Stats' Thompson",
    handle: "@BattleMetrics",
    blogName: "Battle Metrics",
    avatarUrl: "/data-analyst-avatar.jpg",
    coverageStyle: "Statistical breakdowns and ratings analysis",
    notableTakes: [
      "Global Word War has the highest average battle quality",
      "Quiet Room favors lyricists over performers",
    ],
    articlesCount: 312,
    followers: 42100,
    leagueId: "global-word-war",
  },
]

// Original helper functions that were not part of the explicit updates, but need to be preserved
export function getLeague(id: string): League | undefined {
  return LEAGUES.find((l) => l.id === id || l.slug === id)
}

export function getLeagueBlogger(leagueId: string): LeagueBlogger | undefined {
  return LEAGUE_BLOGGERS.find((b) => b.leagueId === leagueId)
}

export function getLeagueStats(league: League): LeagueStats {
  // Generate realistic stats based on league properties
  const baseBody = league.personalityStyle === "aggressive" ? 28 : 22
  const baseClose = league.personalityStyle === "technical" ? 40 : 32
  const baseChoke = 100 - league.baseCrowdFactor * 8

  return {
    totalBattles: league.totalBattles,
    totalBattlers: league.battlerCount,
    avgRating: league.avgRating,
    avgCrowdReaction: Math.round(league.baseCrowdFactor * 75),
    bodyRate: baseBody + Math.floor(Math.random() * 5),
    closeRate: baseClose + Math.floor(Math.random() * 8),
    chokeRate: Math.max(4, Math.min(15, baseChoke + Math.floor(Math.random() * 4))),
    thisMonth: Math.floor(league.totalBattles / 12) + Math.floor(Math.random() * 5),
  }
}

// These were in the original but removed from the updates, so we re-add them
export function getLeagueTierColor(tier: LeagueTier): string {
  switch (tier) {
    case "underground":
      return "text-orange-400"
    case "regional":
      return "text-blue-400"
    case "national":
      return "text-purple-400"
    case "premier":
      return "text-yellow-400"
  }
}

export function getLeagueTierBadge(tier: LeagueTier): string {
  switch (tier) {
    case "underground":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "regional":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "national":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    case "premier":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
  }
}

export function getPersonalityStyleBadge(style: PersonalityStyle): string {
  switch (style) {
    case "technical":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "aggressive":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "diverse":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    case "street":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
  }
}

export function getPersonalityDescription(style: PersonalityStyle): string {
  switch (style) {
    case "technical":
      return "Fans appreciate intricate rhyme schemes, multi-syllabic patterns, and dense wordplay. Performance flash alone won't cut it."
    case "aggressive":
      return "High energy, direct attacks, and crowd control matter. The louder the reaction, the better."
    case "diverse":
      return "Balanced appreciation for all styles. Versatility is rewarded here."
    case "street":
      return "Authentic street content, real talk, and raw delivery. Keep it 100 or get exposed."
  }
}
