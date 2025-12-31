// LEAGUE SYSTEM
// Now database-driven - fetches from /api/leagues

export type LeagueTier = "virtual" | "underground" | "regional" | "national" | "premier"
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
  isVirtual?: boolean // true for text forums and app camera battles
  battleFormat?: "live" | "asynchronous" | "recorded" // live = in-person, asynchronous = text forums, recorded = app camera

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

  // Database ID for API calls
  _dbId?: string
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
  isActive?: boolean
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

// =====================================================
// API FETCH FUNCTIONS
// =====================================================

let cachedLeagues: League[] | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 60000 // 1 minute cache

/**
 * Fetch all leagues from the API
 * @param activeOnly - Only return active leagues (default: true)
 * @param useCache - Use cached data if available (default: true)
 */
export async function fetchLeagues(activeOnly: boolean = true, useCache: boolean = true): Promise<League[]> {
  // Check cache
  if (useCache && cachedLeagues && Date.now() - cacheTimestamp < CACHE_TTL) {
    return activeOnly ? cachedLeagues.filter(l => l.isActive) : cachedLeagues
  }

  try {
    const response = await fetch(`/api/leagues?active=${activeOnly}`)
    if (!response.ok) {
      throw new Error('Failed to fetch leagues')
    }
    const data = await response.json()
    cachedLeagues = data.leagues || []
    cacheTimestamp = Date.now()
    return cachedLeagues
  } catch (error) {
    console.error('Error fetching leagues:', error)
    // Return cached data if available, even if stale
    if (cachedLeagues) {
      return activeOnly ? cachedLeagues.filter(l => l.isActive) : cachedLeagues
    }
    return []
  }
}

/**
 * Fetch a single league by ID or slug
 */
export async function fetchLeague(idOrSlug: string): Promise<League | null> {
  try {
    const response = await fetch(`/api/leagues/${idOrSlug}`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return data.league || null
  } catch (error) {
    console.error('Error fetching league:', error)
    return null
  }
}

/**
 * Fetch battlers for a league
 */
export async function fetchLeagueBattlers(leagueIdOrSlug: string, includeInactive: boolean = false): Promise<any[]> {
  try {
    const response = await fetch(`/api/leagues/${leagueIdOrSlug}/battlers?includeInactive=${includeInactive}`)
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    return data.battlers || []
  } catch (error) {
    console.error('Error fetching league battlers:', error)
    return []
  }
}

// =====================================================
// SYNCHRONOUS HELPER FUNCTIONS (for compatibility)
// =====================================================

// Cached leagues for synchronous access (populated by fetchLeagues)
let LEAGUES: League[] = []

/**
 * Initialize leagues cache for synchronous access
 * Call this early in your app lifecycle
 */
export async function initializeLeagues(): Promise<void> {
  LEAGUES = await fetchLeagues(false, false) // Get all leagues, force refresh
}

/**
 * Get leagues synchronously (uses cached data)
 * Call initializeLeagues() first to populate cache
 */
export function getLeagues(): League[] {
  return LEAGUES
}

/**
 * Get active leagues synchronously
 */
export function getActiveLeagues(): League[] {
  return LEAGUES.filter((l) => l.isActive)
}

// Helper function - find league by ID (synchronous, uses cache)
export function getLeagueById(id: string): League | undefined {
  return LEAGUES.find((l) => l.id === id || l.slug === id || l._dbId === id)
}

// Alias for getLeagueById
export function getLeague(id: string): League | undefined {
  return getLeagueById(id)
}

export function getLeagueBySlug(slug: string): League | undefined {
  return LEAGUES.find((l) => l.slug === slug)
}

export function getLeaguesByTier(tier: LeagueTier): League[] {
  return LEAGUES.filter((l) => l.tier === tier)
}

export function getLeaguesByRegion(region: string): League[] {
  return LEAGUES.filter((l) => l.region === region)
}

// Get a random league for battler assignment
export function getRandomLeague(tier?: LeagueTier): League {
  const leagues = tier ? getLeaguesByTier(tier) : LEAGUES
  return leagues[Math.floor(Math.random() * leagues.length)]
}

// Get starter league for new battlers (first active league)
export function getStarterLeague(): League {
  const activeLeagues = getActiveLeagues()
  // Prefer ALG (Algorithm Institute) as starter
  const alg = activeLeagues.find(l => l.slug === 'algorithm-institute' || l.id === 'algorithm-institute')
  return alg || activeLeagues[0] || LEAGUES[0]
}

// =====================================================
// TIER REQUIREMENTS & PROGRESSION
// =====================================================

export function getTierRequirements(tier: LeagueTier): { minRating: number; minWins: number; minBattles: number } {
  switch (tier) {
    case "virtual":
      return { minRating: 0, minWins: 0, minBattles: 0 }
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

export function canBattlerAccessTier(
  battlerRating: number,
  battlerWins: number,
  battlerBattles: number,
  tier: LeagueTier,
): boolean {
  const reqs = getTierRequirements(tier)
  return battlerRating >= reqs.minRating && battlerWins >= reqs.minWins && battlerBattles >= reqs.minBattles
}

// =====================================================
// DISPLAY HELPERS
// =====================================================

export function getTierInfo(tier: LeagueTier): { label: string; color: string; bgColor: string } {
  switch (tier) {
    case "virtual":
      return { label: "Virtual", color: "text-cyan-400", bgColor: "bg-cyan-500/20" }
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

export function getLeagueTierColor(tier: LeagueTier): string {
  switch (tier) {
    case "virtual":
      return "text-cyan-400"
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
    case "virtual":
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
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

// =====================================================
// STATS CALCULATION
// =====================================================

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

// =====================================================
// BLOGGERS (placeholder - will be moved to API)
// =====================================================

export const LEAGUE_BLOGGERS: LeagueBlogger[] = []

export function getLeagueBlogger(leagueId: string): LeagueBlogger | undefined {
  return LEAGUE_BLOGGERS.find((b) => b.leagueId === leagueId)
}
