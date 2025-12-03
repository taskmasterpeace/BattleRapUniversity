// VENUE SYSTEM - 37 Venue Types across 4 Tiers

export type VenueTier = "virtual" | "small" | "medium" | "large"

export interface VenueType {
  id: string
  name: string
  displayName: string // Editable display name
  tier: VenueTier
  baseCap: number
  maxCap: number
  writingMod: number
  performanceMod: number
  crowdIntensity: number
  payoutMod: number
  vibe: string
  prestigeLevel: 1 | 2 | 3 | 4 | 5
  ambientSound: string
  spriteKey?: string
}

export interface Venue {
  id: string
  venueTypeId: string
  name: string
  cityKey: string
  cityName: string
  state: string
  region: string
  isActive: boolean
}

// All 37 venue types from the spec
export const VENUE_TYPES: VenueType[] = [
  // VIRTUAL TIER (3)
  {
    id: "home-studio",
    name: "home_studio",
    displayName: "Home Studio",
    tier: "virtual",
    baseCap: 100,
    maxCap: 500,
    writingMod: 1.0,
    performanceMod: 0.9,
    crowdIntensity: 0.7,
    payoutMod: 0.5,
    vibe: "Intimate streaming vibes. Chat is the crowd.",
    prestigeLevel: 1,
    ambientSound: "online",
  },
  {
    id: "podcast-studio",
    name: "podcast_studio",
    displayName: "Podcast Studio",
    tier: "virtual",
    baseCap: 200,
    maxCap: 1000,
    writingMod: 1.0,
    performanceMod: 0.95,
    crowdIntensity: 0.75,
    payoutMod: 0.6,
    vibe: "Interview setting. Lower pressure, focused energy.",
    prestigeLevel: 1,
    ambientSound: "online",
  },
  {
    id: "stream-platform",
    name: "stream_platform",
    displayName: "Stream Platform",
    tier: "virtual",
    baseCap: 500,
    maxCap: 10000,
    writingMod: 1.0,
    performanceMod: 0.95,
    crowdIntensity: 0.8,
    payoutMod: 0.7,
    vibe: "Big stream energy. Chat going crazy.",
    prestigeLevel: 2,
    ambientSound: "online",
  },

  // SMALL TIER (10)
  {
    id: "garage",
    name: "garage",
    displayName: "Garage",
    tier: "small",
    baseCap: 20,
    maxCap: 50,
    writingMod: 1.15,
    performanceMod: 0.9,
    crowdIntensity: 1.1,
    payoutMod: 0.3,
    vibe: "Raw underground energy. Every bar lands.",
    prestigeLevel: 1,
    ambientSound: "underground",
  },
  {
    id: "basement",
    name: "basement",
    displayName: "Basement",
    tier: "small",
    baseCap: 30,
    maxCap: 75,
    writingMod: 1.15,
    performanceMod: 0.85,
    crowdIntensity: 1.15,
    payoutMod: 0.35,
    vibe: "True underground. Bars echo off the walls.",
    prestigeLevel: 1,
    ambientSound: "underground",
  },
  {
    id: "barbershop",
    name: "barbershop",
    displayName: "Barbershop",
    tier: "small",
    baseCap: 15,
    maxCap: 40,
    writingMod: 1.1,
    performanceMod: 0.9,
    crowdIntensity: 1.2,
    payoutMod: 0.25,
    vibe: "Neighborhood energy. Everyone knows everyone.",
    prestigeLevel: 1,
    ambientSound: "underground",
  },
  {
    id: "alley",
    name: "alley",
    displayName: "Alley",
    tier: "small",
    baseCap: 25,
    maxCap: 60,
    writingMod: 1.1,
    performanceMod: 0.85,
    crowdIntensity: 1.25,
    payoutMod: 0.2,
    vibe: "Raw street energy. Guerrilla battle vibes.",
    prestigeLevel: 1,
    ambientSound: "street",
  },
  {
    id: "small-bar",
    name: "small_bar",
    displayName: "Small Bar",
    tier: "small",
    baseCap: 40,
    maxCap: 80,
    writingMod: 1.1,
    performanceMod: 0.95,
    crowdIntensity: 1.1,
    payoutMod: 0.4,
    vibe: "Drinks flowing. Intimate club energy.",
    prestigeLevel: 2,
    ambientSound: "bar",
  },
  {
    id: "art-gallery",
    name: "art_gallery",
    displayName: "Art Gallery",
    tier: "small",
    baseCap: 30,
    maxCap: 60,
    writingMod: 1.15,
    performanceMod: 0.9,
    crowdIntensity: 0.9,
    payoutMod: 0.45,
    vibe: "Artsy crowd. They appreciate the craft.",
    prestigeLevel: 2,
    ambientSound: "lounge",
  },
  {
    id: "boxing-gym",
    name: "boxing_gym",
    displayName: "Boxing Gym",
    tier: "small",
    baseCap: 40,
    maxCap: 80,
    writingMod: 1.05,
    performanceMod: 1.05,
    crowdIntensity: 1.2,
    payoutMod: 0.35,
    vibe: "Gritty fighter energy. Competitive vibes.",
    prestigeLevel: 2,
    ambientSound: "gym",
  },
  {
    id: "coffee-shop",
    name: "coffee_shop",
    displayName: "Coffee Shop",
    tier: "small",
    baseCap: 20,
    maxCap: 40,
    writingMod: 1.1,
    performanceMod: 0.85,
    crowdIntensity: 0.85,
    payoutMod: 0.25,
    vibe: "Low-key cipher vibes. Open mic energy.",
    prestigeLevel: 1,
    ambientSound: "cafe",
  },
  {
    id: "record-store",
    name: "record_store",
    displayName: "Record Store",
    tier: "small",
    baseCap: 25,
    maxCap: 50,
    writingMod: 1.15,
    performanceMod: 0.9,
    crowdIntensity: 1.0,
    payoutMod: 0.3,
    vibe: "Hip-hop heads. They know the culture.",
    prestigeLevel: 2,
    ambientSound: "lounge",
  },
  {
    id: "subway-station",
    name: "subway_station",
    displayName: "Subway Station",
    tier: "small",
    baseCap: 50,
    maxCap: 100,
    writingMod: 1.05,
    performanceMod: 0.8,
    crowdIntensity: 1.15,
    payoutMod: 0.2,
    vibe: "Random crowd. Trains interrupting. Chaos energy.",
    prestigeLevel: 1,
    ambientSound: "street",
  },

  // MEDIUM TIER (12)
  {
    id: "community-center",
    name: "community_center",
    displayName: "Community Center",
    tier: "medium",
    baseCap: 100,
    maxCap: 300,
    writingMod: 1.05,
    performanceMod: 1.05,
    crowdIntensity: 1.0,
    payoutMod: 0.7,
    vibe: "Neighborhood support. Local pride on display.",
    prestigeLevel: 2,
    ambientSound: "indoor",
  },
  {
    id: "small-theater",
    name: "small_theater",
    displayName: "Small Theater",
    tier: "medium",
    baseCap: 150,
    maxCap: 400,
    writingMod: 1.1,
    performanceMod: 1.1,
    crowdIntensity: 1.05,
    payoutMod: 0.9,
    vibe: "Semi-professional setting. Red curtain energy.",
    prestigeLevel: 3,
    ambientSound: "theater",
  },
  {
    id: "gymnasium",
    name: "gymnasium",
    displayName: "Gymnasium",
    tier: "medium",
    baseCap: 200,
    maxCap: 500,
    writingMod: 1.0,
    performanceMod: 1.1,
    crowdIntensity: 1.1,
    payoutMod: 0.65,
    vibe: "School assembly vibes. Bleacher crowd.",
    prestigeLevel: 2,
    ambientSound: "gym",
  },
  {
    id: "nightclub",
    name: "nightclub",
    displayName: "Nightclub",
    tier: "medium",
    baseCap: 150,
    maxCap: 400,
    writingMod: 0.95,
    performanceMod: 1.15,
    crowdIntensity: 1.2,
    payoutMod: 0.85,
    vibe: "Party atmosphere. Crowd is hype.",
    prestigeLevel: 3,
    ambientSound: "club",
  },
  {
    id: "outdoor-park",
    name: "outdoor_park",
    displayName: "Outdoor Park",
    tier: "medium",
    baseCap: 200,
    maxCap: 600,
    writingMod: 1.0,
    performanceMod: 1.05,
    crowdIntensity: 1.0,
    payoutMod: 0.55,
    vibe: "Festival vibes. Open air energy.",
    prestigeLevel: 2,
    ambientSound: "outdoor",
  },
  {
    id: "restaurant-bar",
    name: "restaurant_bar",
    displayName: "Restaurant Bar",
    tier: "medium",
    baseCap: 100,
    maxCap: 250,
    writingMod: 1.05,
    performanceMod: 1.05,
    crowdIntensity: 0.95,
    payoutMod: 0.75,
    vibe: "Dinner crowd energy. More refined.",
    prestigeLevel: 3,
    ambientSound: "bar",
  },
  {
    id: "church-hall",
    name: "church_hall",
    displayName: "Church Hall",
    tier: "medium",
    baseCap: 150,
    maxCap: 350,
    writingMod: 1.1,
    performanceMod: 1.0,
    crowdIntensity: 0.9,
    payoutMod: 0.6,
    vibe: "Respectful crowd. Focused listening.",
    prestigeLevel: 2,
    ambientSound: "indoor",
  },
  {
    id: "comedy-club",
    name: "comedy_club",
    displayName: "Comedy Club",
    tier: "medium",
    baseCap: 120,
    maxCap: 280,
    writingMod: 1.0,
    performanceMod: 1.15,
    crowdIntensity: 1.15,
    payoutMod: 0.8,
    vibe: "Entertainment crowd. They want to laugh.",
    prestigeLevel: 3,
    ambientSound: "club",
  },
  {
    id: "rooftop",
    name: "rooftop",
    displayName: "Rooftop",
    tier: "medium",
    baseCap: 80,
    maxCap: 200,
    writingMod: 1.05,
    performanceMod: 1.1,
    crowdIntensity: 1.05,
    payoutMod: 1.0,
    vibe: "Exclusive skyline views. VIP energy.",
    prestigeLevel: 4,
    ambientSound: "outdoor",
  },
  {
    id: "warehouse",
    name: "warehouse",
    displayName: "Warehouse",
    tier: "medium",
    baseCap: 250,
    maxCap: 600,
    writingMod: 1.05,
    performanceMod: 1.05,
    crowdIntensity: 1.15,
    payoutMod: 0.7,
    vibe: "Underground but bigger. Echo chamber.",
    prestigeLevel: 2,
    ambientSound: "warehouse",
  },
  {
    id: "amphitheater",
    name: "amphitheater",
    displayName: "Amphitheater",
    tier: "medium",
    baseCap: 300,
    maxCap: 800,
    writingMod: 1.05,
    performanceMod: 1.15,
    crowdIntensity: 1.1,
    payoutMod: 0.9,
    vibe: "Greek theater energy. Natural acoustics.",
    prestigeLevel: 3,
    ambientSound: "outdoor",
  },
  {
    id: "barn",
    name: "barn",
    displayName: "Barn",
    tier: "medium",
    baseCap: 150,
    maxCap: 350,
    writingMod: 1.05,
    performanceMod: 1.0,
    crowdIntensity: 1.1,
    payoutMod: 0.55,
    vibe: "Country vibes. Different energy entirely.",
    prestigeLevel: 2,
    ambientSound: "outdoor",
  },

  // LARGE TIER (12)
  {
    id: "grand-theater",
    name: "grand_theater",
    displayName: "Grand Theater",
    tier: "large",
    baseCap: 800,
    maxCap: 2000,
    writingMod: 1.0,
    performanceMod: 1.2,
    crowdIntensity: 1.15,
    payoutMod: 2.0,
    vibe: "Prestigious venue. History on these walls.",
    prestigeLevel: 4,
    ambientSound: "theater",
  },
  {
    id: "boxing-arena",
    name: "boxing_arena",
    displayName: "Boxing Arena",
    tier: "large",
    baseCap: 1000,
    maxCap: 3000,
    writingMod: 0.95,
    performanceMod: 1.25,
    crowdIntensity: 1.3,
    payoutMod: 2.5,
    vibe: "Fight night energy. Blood sport vibes.",
    prestigeLevel: 4,
    ambientSound: "arena",
  },
  {
    id: "basketball-arena",
    name: "basketball_arena",
    displayName: "Basketball Arena",
    tier: "large",
    baseCap: 2000,
    maxCap: 5000,
    writingMod: 0.9,
    performanceMod: 1.3,
    crowdIntensity: 1.25,
    payoutMod: 3.0,
    vibe: "Stadium energy. Sports crowd hype.",
    prestigeLevel: 5,
    ambientSound: "arena",
  },
  {
    id: "concert-hall",
    name: "concert_hall",
    displayName: "Concert Hall",
    tier: "large",
    baseCap: 1500,
    maxCap: 4000,
    writingMod: 0.95,
    performanceMod: 1.25,
    crowdIntensity: 1.2,
    payoutMod: 2.5,
    vibe: "Industry venue. Major label energy.",
    prestigeLevel: 4,
    ambientSound: "concert",
  },
  {
    id: "convention-center",
    name: "convention_center",
    displayName: "Convention Center",
    tier: "large",
    baseCap: 1000,
    maxCap: 3000,
    writingMod: 1.0,
    performanceMod: 1.15,
    crowdIntensity: 1.1,
    payoutMod: 1.8,
    vibe: "Corporate event vibes. Big screens everywhere.",
    prestigeLevel: 3,
    ambientSound: "indoor",
  },
  {
    id: "container-venue",
    name: "container_venue",
    displayName: "Container Venue",
    tier: "large",
    baseCap: 500,
    maxCap: 1500,
    writingMod: 1.05,
    performanceMod: 1.2,
    crowdIntensity: 1.35,
    payoutMod: 2.0,
    vibe: "URL energy. Packed crowd. Intimate but major.",
    prestigeLevel: 4,
    ambientSound: "warehouse",
  },
  {
    id: "vip-nightclub",
    name: "vip_nightclub",
    displayName: "VIP Nightclub",
    tier: "large",
    baseCap: 400,
    maxCap: 1000,
    writingMod: 0.95,
    performanceMod: 1.25,
    crowdIntensity: 1.25,
    payoutMod: 2.2,
    vibe: "Money in the building. VIP everything.",
    prestigeLevel: 4,
    ambientSound: "club",
  },
  {
    id: "ballroom",
    name: "ballroom",
    displayName: "Ballroom",
    tier: "large",
    baseCap: 600,
    maxCap: 1500,
    writingMod: 1.05,
    performanceMod: 1.15,
    crowdIntensity: 1.0,
    payoutMod: 1.9,
    vibe: "High society venue. Chandeliers and class.",
    prestigeLevel: 4,
    ambientSound: "indoor",
  },
  {
    id: "festival-stage",
    name: "festival_stage",
    displayName: "Festival Stage",
    tier: "large",
    baseCap: 2000,
    maxCap: 10000,
    writingMod: 0.85,
    performanceMod: 1.35,
    crowdIntensity: 1.3,
    payoutMod: 3.5,
    vibe: "Festival main stage. Maximum exposure.",
    prestigeLevel: 5,
    ambientSound: "outdoor",
  },
  {
    id: "modern-atrium",
    name: "modern_atrium",
    displayName: "Modern Atrium",
    tier: "large",
    baseCap: 800,
    maxCap: 2000,
    writingMod: 1.0,
    performanceMod: 1.15,
    crowdIntensity: 1.05,
    payoutMod: 2.0,
    vibe: "Tech money venue. Modern architecture.",
    prestigeLevel: 4,
    ambientSound: "indoor",
  },
  {
    id: "outdoor-arena",
    name: "outdoor_arena",
    displayName: "Outdoor Arena",
    tier: "large",
    baseCap: 3000,
    maxCap: 8000,
    writingMod: 0.85,
    performanceMod: 1.3,
    crowdIntensity: 1.25,
    payoutMod: 3.0,
    vibe: "Under the stars. Epic battles only.",
    prestigeLevel: 5,
    ambientSound: "outdoor",
  },
  {
    id: "historic-venue",
    name: "historic_venue",
    displayName: "Historic Venue",
    tier: "large",
    baseCap: 1000,
    maxCap: 2500,
    writingMod: 1.05,
    performanceMod: 1.2,
    crowdIntensity: 1.2,
    payoutMod: 2.5,
    vibe: "Legends battled here. History on these walls.",
    prestigeLevel: 5,
    ambientSound: "theater",
  },
]

// Helper functions
export function getVenueType(id: string): VenueType | undefined {
  return VENUE_TYPES.find((v) => v.id === id)
}

export function getVenuesByTier(tier: VenueTier): VenueType[] {
  return VENUE_TYPES.filter((v) => v.tier === tier)
}

export function getVenueTierFromRating(avgRating: number): VenueTier {
  if (avgRating < 1000) return "small"
  if (avgRating < 1200) return "small"
  if (avgRating < 1400) return "medium"
  if (avgRating < 1600) return "medium"
  if (avgRating < 1800) return "large"
  return "large"
}

export function calculateCrowdSize(
  venue: VenueType,
  avgRating: number,
  isGrudge: boolean,
  isTournament: boolean,
): number {
  const ratingMultiplier = 0.5 + avgRating / 2000
  const grudgeMultiplier = isGrudge ? 1.3 : 1.0
  const tournamentMultiplier = isTournament ? 1.5 : 1.0

  const crowd = Math.floor(venue.baseCap * ratingMultiplier * grudgeMultiplier * tournamentMultiplier)
  return Math.min(crowd, venue.maxCap)
}

export function getTierColor(tier: VenueTier): string {
  switch (tier) {
    case "virtual":
      return "from-blue-900 to-purple-900"
    case "small":
      return "from-amber-900 to-orange-900"
    case "medium":
      return "from-red-900 to-orange-900"
    case "large":
      return "from-yellow-900 to-amber-900"
  }
}

export function getTierBadgeClasses(tier: VenueTier): string {
  switch (tier) {
    case "virtual":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "small":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "medium":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "large":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
  }
}

export function getModifierDisplay(mod: number): { text: string; color: string } {
  if (mod < 1) return { text: `${((1 - mod) * 100).toFixed(0)}% ↓`, color: "text-red-400" }
  if (mod > 1) return { text: `${((mod - 1) * 100).toFixed(0)}% ↑`, color: "text-green-400" }
  return { text: "0%", color: "text-zinc-500" }
}

export function getCrowdIntensityDisplay(intensity: number): {
  icon: string
  label: string
  color: string
} {
  if (intensity <= 0.9) return { icon: "◐", label: "Low", color: "text-zinc-400" }
  if (intensity <= 1.1) return { icon: "●", label: "Medium", color: "text-orange-400" }
  return { icon: "◉", label: "High", color: "text-red-400" }
}

export function getPrestigeStars(level: number): string {
  return "⭐".repeat(level)
}
