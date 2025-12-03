// City and Region System for Battle Rap University

export type SceneSize = "small" | "medium" | "large" | "major"
export type CultureStyle = "technical" | "aggressive" | "diverse" | "street"
export type TimeOfDay = "day" | "night" | "dusk"

export interface CityBackdrops {
  day?: string
  night?: string
  dusk?: string
}

export interface City {
  id: string
  name: string
  slug: string
  state: string
  stateCode: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
  population: number
  sceneSize: SceneSize
  cultureStyle: CultureStyle
  region: string
  backdropImage?: string
  backdrops?: CityBackdrops
}

export interface CityStats {
  totalBattlers: number
  totalBattlesInCity: number
  avgRating: number
  avgWinRate: number
  avgCrowdReaction: number
  battlesThisWeek: number
}

export interface RankedBattler {
  rank: number
  id: string
  stageName: string
  avatarUrl: string
  tier: "none" | "low" | "mid" | "top" | "god"
  rating: number
  wins: number
  losses: number
  winRate: number
  streak: number
  styleTags: string[]
  isPlayer?: boolean
}

export interface CityBattle {
  id: string
  date: string
  battlerA: { stageName: string; city: string }
  battlerB: { stageName: string; city: string }
  winner: "A" | "B"
  verdict: string
  crowdReaction: { a: number; b: number }
}

export interface RegionalBadge {
  id: string
  name: string
  description: string
  holderCount: number
  effects: string[]
  citySlug: string
}

// 10 Major Battle Rap Cities
export const CITIES: City[] = [
  {
    id: "nyc",
    name: "New York",
    slug: "new-york",
    state: "New York",
    stateCode: "NY",
    country: "USA",
    countryCode: "US",
    latitude: 40.7128,
    longitude: -74.006,
    population: 8336817,
    sceneSize: "major",
    cultureStyle: "diverse",
    region: "East Coast",
    backdrops: {
      day: "/sprites/cities/new-york-day.png",
    },
  },
  {
    id: "la",
    name: "Los Angeles",
    slug: "los-angeles",
    state: "California",
    stateCode: "CA",
    country: "USA",
    countryCode: "US",
    latitude: 34.0522,
    longitude: -118.2437,
    population: 3979576,
    sceneSize: "major",
    cultureStyle: "aggressive",
    region: "West Coast",
    backdrops: {
      night: "/sprites/cities/los-angeles-night.png",
    },
  },
  {
    id: "philly",
    name: "Philadelphia",
    slug: "philadelphia",
    state: "Pennsylvania",
    stateCode: "PA",
    country: "USA",
    countryCode: "US",
    latitude: 39.9526,
    longitude: -75.1652,
    population: 1584064,
    sceneSize: "large",
    cultureStyle: "aggressive",
    region: "East Coast",
    backdrops: {},
  },
  {
    id: "detroit",
    name: "Detroit",
    slug: "detroit",
    state: "Michigan",
    stateCode: "MI",
    country: "USA",
    countryCode: "US",
    latitude: 42.3314,
    longitude: -83.0458,
    population: 670031,
    sceneSize: "large",
    cultureStyle: "street",
    region: "Midwest",
    backdrops: {},
  },
  {
    id: "chicago",
    name: "Chicago",
    slug: "chicago",
    state: "Illinois",
    stateCode: "IL",
    country: "USA",
    countryCode: "US",
    latitude: 41.8781,
    longitude: -87.6298,
    population: 2693976,
    sceneSize: "large",
    cultureStyle: "aggressive",
    region: "Midwest",
    backdrops: {
      day: "/sprites/cities/chicago-day.png",
    },
  },
  {
    id: "toronto",
    name: "Toronto",
    slug: "toronto",
    state: "Ontario",
    stateCode: "ON",
    country: "Canada",
    countryCode: "CA",
    latitude: 43.6532,
    longitude: -79.3832,
    population: 2731571,
    sceneSize: "large",
    cultureStyle: "technical",
    region: "Canada",
    backdrops: {},
  },
  {
    id: "atlanta",
    name: "Atlanta",
    slug: "atlanta",
    state: "Georgia",
    stateCode: "GA",
    country: "USA",
    countryCode: "US",
    latitude: 33.749,
    longitude: -84.388,
    population: 498715,
    sceneSize: "medium",
    cultureStyle: "street",
    region: "South",
    backdrops: {
      dusk: "/sprites/cities/atlanta-dusk.png",
    },
  },
  {
    id: "houston",
    name: "Houston",
    slug: "houston",
    state: "Texas",
    stateCode: "TX",
    country: "USA",
    countryCode: "US",
    latitude: 29.7604,
    longitude: -95.3698,
    population: 2320268,
    sceneSize: "medium",
    cultureStyle: "street",
    region: "South",
    backdrops: {},
  },
  {
    id: "oakland",
    name: "Oakland",
    slug: "oakland",
    state: "California",
    stateCode: "CA",
    country: "USA",
    countryCode: "US",
    latitude: 37.8044,
    longitude: -122.2712,
    population: 433031,
    sceneSize: "medium",
    cultureStyle: "diverse",
    region: "West Coast",
    backdrops: {},
  },
  {
    id: "london",
    name: "London",
    slug: "london",
    state: "England",
    stateCode: "",
    country: "UK",
    countryCode: "GB",
    latitude: 51.5074,
    longitude: -0.1278,
    population: 8982000,
    sceneSize: "medium",
    cultureStyle: "technical",
    region: "International",
    backdrops: {},
  },
  {
    id: "miami",
    name: "Miami",
    slug: "miami",
    state: "Florida",
    stateCode: "FL",
    country: "USA",
    countryCode: "US",
    latitude: 25.7617,
    longitude: -80.1918,
    population: 467963,
    sceneSize: "medium",
    cultureStyle: "diverse",
    region: "South",
    backdrops: {},
  },
  {
    id: "dallas",
    name: "Dallas",
    slug: "dallas",
    state: "Texas",
    stateCode: "TX",
    country: "USA",
    countryCode: "US",
    latitude: 32.7767,
    longitude: -96.797,
    population: 1304379,
    sceneSize: "medium",
    cultureStyle: "street",
    region: "South",
    backdrops: {},
  },
  {
    id: "baltimore",
    name: "Baltimore",
    slug: "baltimore",
    state: "Maryland",
    stateCode: "MD",
    country: "USA",
    countryCode: "US",
    latitude: 39.2904,
    longitude: -76.6122,
    population: 585708,
    sceneSize: "medium",
    cultureStyle: "aggressive",
    region: "East Coast",
    backdrops: {},
  },
  {
    id: "newark",
    name: "Newark",
    slug: "newark",
    state: "New Jersey",
    stateCode: "NJ",
    country: "USA",
    countryCode: "US",
    latitude: 40.7357,
    longitude: -74.1724,
    population: 311549,
    sceneSize: "small",
    cultureStyle: "street",
    region: "East Coast",
    backdrops: {},
  },
  {
    id: "memphis",
    name: "Memphis",
    slug: "memphis",
    state: "Tennessee",
    stateCode: "TN",
    country: "USA",
    countryCode: "US",
    latitude: 35.1495,
    longitude: -90.049,
    population: 651073,
    sceneSize: "small",
    cultureStyle: "street",
    region: "South",
    backdrops: {},
  },
]

// Regional Badges
export const REGIONAL_BADGES: Record<string, RegionalBadge> = {
  "new-york": {
    id: "nyc-native",
    name: "NYC Native",
    description: "Born & Raised in the Culture",
    holderCount: 23,
    effects: ["+5% crowd reaction on home turf", "+3% writing when battling NYC opponents"],
    citySlug: "new-york",
  },
  "los-angeles": {
    id: "la-native",
    name: "LA Native",
    description: "West Coast Representative",
    holderCount: 18,
    effects: ["+5% performance at West Coast venues", "+3% crowd energy in outdoor venues"],
    citySlug: "los-angeles",
  },
  philadelphia: {
    id: "philly-rep",
    name: "Philly Rep",
    description: "City of Brotherly Bars",
    holderCount: 15,
    effects: ["+7% aggression bonus", "+4% rebuttal effectiveness"],
    citySlug: "philadelphia",
  },
  detroit: {
    id: "detroit-made",
    name: "Detroit Made",
    description: "Motor City Grit",
    holderCount: 12,
    effects: ["+6% resilience", "+5% crowd reaction in underground venues"],
    citySlug: "detroit",
  },
  chicago: {
    id: "chicago-bred",
    name: "Chicago Bred",
    description: "Midwest Warrior",
    holderCount: 14,
    effects: ["+5% performance in cold weather", "+4% angle effectiveness"],
    citySlug: "chicago",
  },
  toronto: {
    id: "toronto-rep",
    name: "Toronto Rep",
    description: "The 6ix Representative",
    holderCount: 11,
    effects: ["+6% technical writing", "+4% international appeal"],
    citySlug: "toronto",
  },
  atlanta: {
    id: "atl-rep",
    name: "ATL Rep",
    description: "Southern Style",
    holderCount: 16,
    effects: ["+5% delivery rating", "+4% crowd hype generation"],
    citySlug: "atlanta",
  },
  houston: {
    id: "houston-made",
    name: "Houston Made",
    description: "Texas Heavyweight",
    holderCount: 10,
    effects: ["+5% presence score", "+4% haymaker damage"],
    citySlug: "houston",
  },
  oakland: {
    id: "bay-area-rep",
    name: "Bay Area Rep",
    description: "Hyphy Movement",
    holderCount: 9,
    effects: ["+5% creativity", "+4% flow rating"],
    citySlug: "oakland",
  },
  london: {
    id: "uk-native",
    name: "UK Native",
    description: "Grime Roots",
    holderCount: 8,
    effects: ["+6% wordplay", "+5% international battles bonus"],
    citySlug: "london",
  },
  miami: {
    id: "miami-rep",
    name: "305 Rep",
    description: "Magic City Heat",
    holderCount: 7,
    effects: ["+5% presence", "+4% crowd energy in outdoor venues"],
    citySlug: "miami",
  },
}

// Helper functions
export function getCityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug)
}

export function getCityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id)
}

export function getCityByName(name: string): City | undefined {
  return CITIES.find((c) => c.name.toLowerCase() === name.toLowerCase())
}

export function getRegionalBadge(citySlug: string): RegionalBadge | undefined {
  return REGIONAL_BADGES[citySlug]
}

export function getSceneSizeLabel(size: SceneSize): string {
  switch (size) {
    case "major":
      return "MAJOR LEAGUE CITY"
    case "large":
      return "MAJOR BATTLE HUB"
    case "medium":
      return "REGIONAL SCENE"
    case "small":
      return "UNDERGROUND"
  }
}

export function getCultureStyleIcon(style: CultureStyle): string {
  switch (style) {
    case "technical":
      return "⚙️"
    case "aggressive":
      return "🔥"
    case "diverse":
      return "🌈"
    case "street":
      return "🎤"
  }
}

export function calculateDistance(city1: City, city2: City): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((city2.latitude - city1.latitude) * Math.PI) / 180
  const dLon = ((city2.longitude - city1.longitude) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((city1.latitude * Math.PI) / 180) *
      Math.cos((city2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

export function getCityTier(population: number): "major" | "large" | "medium" | "small" {
  if (population >= 2000000) return "major"
  if (population >= 1000000) return "large"
  if (population >= 400000) return "medium"
  return "small"
}

// Mock data generators for demo
export function getMockCityStats(citySlug: string): CityStats {
  const baseStats: Record<string, CityStats> = {
    "new-york": {
      totalBattlers: 34,
      totalBattlesInCity: 156,
      avgRating: 1247,
      avgWinRate: 52,
      avgCrowdReaction: 78,
      battlesThisWeek: 8,
    },
    "los-angeles": {
      totalBattlers: 28,
      totalBattlesInCity: 134,
      avgRating: 1198,
      avgWinRate: 48,
      avgCrowdReaction: 82,
      battlesThisWeek: 6,
    },
    philadelphia: {
      totalBattlers: 22,
      totalBattlesInCity: 98,
      avgRating: 1312,
      avgWinRate: 54,
      avgCrowdReaction: 85,
      battlesThisWeek: 5,
    },
    detroit: {
      totalBattlers: 19,
      totalBattlesInCity: 87,
      avgRating: 1156,
      avgWinRate: 49,
      avgCrowdReaction: 79,
      battlesThisWeek: 4,
    },
    chicago: {
      totalBattlers: 21,
      totalBattlesInCity: 94,
      avgRating: 1189,
      avgWinRate: 51,
      avgCrowdReaction: 76,
      battlesThisWeek: 5,
    },
    toronto: {
      totalBattlers: 16,
      totalBattlesInCity: 72,
      avgRating: 1267,
      avgWinRate: 53,
      avgCrowdReaction: 74,
      battlesThisWeek: 3,
    },
    atlanta: {
      totalBattlers: 18,
      totalBattlesInCity: 81,
      avgRating: 1134,
      avgWinRate: 47,
      avgCrowdReaction: 81,
      battlesThisWeek: 4,
    },
    houston: {
      totalBattlers: 14,
      totalBattlesInCity: 63,
      avgRating: 1098,
      avgWinRate: 46,
      avgCrowdReaction: 77,
      battlesThisWeek: 3,
    },
    oakland: {
      totalBattlers: 12,
      totalBattlesInCity: 54,
      avgRating: 1145,
      avgWinRate: 50,
      avgCrowdReaction: 73,
      battlesThisWeek: 2,
    },
    london: {
      totalBattlers: 15,
      totalBattlesInCity: 68,
      avgRating: 1223,
      avgWinRate: 52,
      avgCrowdReaction: 71,
      battlesThisWeek: 3,
    },
    miami: {
      totalBattlers: 11,
      totalBattlesInCity: 49,
      avgRating: 1112,
      avgWinRate: 48,
      avgCrowdReaction: 80,
      battlesThisWeek: 2,
    },
  }
  return (
    baseStats[citySlug] || {
      totalBattlers: 10,
      totalBattlesInCity: 45,
      avgRating: 1100,
      avgWinRate: 50,
      avgCrowdReaction: 70,
      battlesThisWeek: 2,
    }
  )
}

export function getMockPowerRankings(citySlug: string): RankedBattler[] {
  const mockNames: Record<string, string[]> = {
    "new-york": ["King of Words", "Lyric Storm", "Tech Wizard", "Street Scholar", "Bars McFly"],
    "los-angeles": ["West Side Poet", "Cali Thunder", "LA Legend", "Pacific Bars", "Sunset Slayer"],
    philadelphia: ["Philly Fury", "Liberty Bars", "Rocky Rhymes", "Broad Street", "Ben Franklin"],
    detroit: ["Motor City Kid", "Eight Mile", "Detroit Rock", "Motown Menace", "Auto Baron"],
    chicago: ["Chi-Town Terror", "Wind City Bars", "Lake Shore", "Bulls Eye", "Deep Dish"],
    toronto: ["Six God", "North Star", "Maple Bars", "Drake Lake", "CN Tower"],
    atlanta: ["ATL Flame", "Peach State", "Dirty South", "Georgia Gem", "Trap Lord"],
    houston: ["H-Town Hero", "Texas Toast", "Space City", "Screwed Up", "Rocket Man"],
    oakland: ["Bay Blade", "Hyphy King", "Oak Town", "Bridge Builder", "BART Bars"],
    london: ["UK Grime", "London Bridge", "Big Ben", "Thames Flow", "Royal Bars"],
    miami: ["305 King", "Heat Wave", "Magic City", "South Beach", "Biscayne Bars"],
  }

  const names = mockNames[citySlug] || [
    "Local Legend 1",
    "Local Legend 2",
    "Local Legend 3",
    "Local Legend 4",
    "Local Legend 5",
  ]
  const tiers: Array<"god" | "top" | "mid" | "low" | "none"> = ["top", "mid", "mid", "low", "low"]

  return names.map((name, i) => ({
    rank: i + 1,
    id: `${citySlug}-${i}`,
    stageName: name,
    avatarUrl: "/placeholder.svg?height=64&width=64",
    tier: tiers[i],
    rating: 1450 - i * 70 + Math.floor(Math.random() * 30),
    wins: 12 - i * 2 + Math.floor(Math.random() * 3),
    losses: 3 + i + Math.floor(Math.random() * 2),
    winRate: Math.round(((12 - i * 2) / (15 - i)) * 100),
    streak: i === 0 ? 5 : i === 1 ? 3 : i < 3 ? 1 : -1,
    styleTags: i % 2 === 0 ? ["Technical", "Wordplay"] : ["Aggressive", "Performance"],
    isPlayer: i === 2,
  }))
}

export function getMockRecentBattles(citySlug: string): CityBattle[] {
  const city = getCityBySlug(citySlug)
  if (!city) return []

  return [
    {
      id: "1",
      date: "2024-11-28",
      battlerA: { stageName: "Tech Wizard", city: city.name },
      battlerB: { stageName: "West Side Poet", city: "Los Angeles" },
      winner: "A",
      verdict: "2-1 Decision",
      crowdReaction: { a: 78, b: 72 },
    },
    {
      id: "2",
      date: "2024-11-25",
      battlerA: { stageName: "Street Scholar", city: city.name },
      battlerB: { stageName: "Motor City Kid", city: "Detroit" },
      winner: "A",
      verdict: "3-0 Body",
      crowdReaction: { a: 85, b: 65 },
    },
    {
      id: "3",
      date: "2024-11-22",
      battlerA: { stageName: "Philly Fury", city: "Philadelphia" },
      battlerB: { stageName: "Lyric Storm", city: city.name },
      winner: "B",
      verdict: "2-1 Decision",
      crowdReaction: { a: 74, b: 79 },
    },
  ]
}

export function getCityBackdrop(cityNameOrSlug: string, timeOfDay: TimeOfDay = "day"): string | null {
  const city = getCityBySlug(cityNameOrSlug) || getCityByName(cityNameOrSlug)
  if (!city?.backdrops) return null

  // Try requested time first
  if (city.backdrops[timeOfDay]) {
    return city.backdrops[timeOfDay]!
  }

  // Fallback priority: day -> dusk -> night
  const fallbackOrder: TimeOfDay[] = ["day", "dusk", "night"]
  for (const time of fallbackOrder) {
    if (city.backdrops[time]) {
      return city.backdrops[time]!
    }
  }

  return null
}

export function getAvailableBackdropTimes(cityNameOrSlug: string): TimeOfDay[] {
  const city = getCityBySlug(cityNameOrSlug) || getCityByName(cityNameOrSlug)
  if (!city?.backdrops) return []

  const times: TimeOfDay[] = []
  if (city.backdrops.day) times.push("day")
  if (city.backdrops.dusk) times.push("dusk")
  if (city.backdrops.night) times.push("night")

  return times
}
