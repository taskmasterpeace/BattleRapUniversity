export const BADGE_CATEGORIES = {
  WRITING: "writing",
  PERFORMANCE: "performance",
  REPUTATION: "reputation",
  CONTENT_STYLE: "content_style",
  MILESTONE: "milestone",
  RIVALRY: "rivalry",
  LEAGUE: "league",
  CITY: "city",
  REGION: "region",
  ACHIEVEMENT: "achievement",
} as const

export type BadgeCategory = (typeof BADGE_CATEGORIES)[keyof typeof BADGE_CATEGORIES]

export const BADGE_RARITIES = {
  COMMON: "common",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
} as const

export type BadgeRarity = (typeof BADGE_RARITIES)[keyof typeof BADGE_RARITIES]

export interface BadgeDefinition {
  id: string
  name: string
  category: BadgeCategory
  rarity: BadgeRarity
  icon: string
  shortDescription: string
  fullEffectText: string
  spriteId: string
  effects: BadgeEffects
  removable?: boolean
  removalCondition?: string
  isPositive: boolean
}

export interface BadgeEffects {
  // Writing attributes
  lyricism?: number
  wordplay?: number
  creativity?: number
  flow?: number

  // Performance attributes
  stagePresence?: number
  crowdControl?: number
  delivery?: number

  // Personal attributes
  financial?: number
  reputation?: number
  family?: number
  resilience?: number

  // Prep efficiency
  writingPrep?: number
  performancePrep?: number
  researchPrep?: number
  restEfficiency?: number
  lifePrep?: number

  // Battle mechanics
  chokeChance?: number
  peakScore?: number
  consistency?: number
  segmentVariance?: number
  crowdReaction?: number

  // Venue bonuses
  mainStageBonus?: number
  smallRoomBonus?: number

  // Meta
  battleOffers?: number
  mediaAttention?: number
  publicKnowledge?: number
}

export const BADGE_RARITY_COLORS = {
  common: {
    color: "#6b7280",
    glow: "none",
    difficulty: "Easy - basic milestones",
  },
  rare: {
    color: "#3b82f6",
    glow: "subtle blue glow",
    difficulty: "Moderate - 10+ battles",
  },
  epic: {
    color: "#8b5cf6",
    glow: "purple pulse",
    difficulty: "Hard - 25+ battles or specific achievements",
  },
  legendary: {
    color: "#f59e0b",
    glow: "gold shimmer animation",
    difficulty: "Very Hard - mastery level",
  },
}

// WRITING BADGES - Positive (12)
export const POSITIVE_WRITING_BADGES: BadgeDefinition[] = [
  {
    id: "punchline_king",
    name: "Punchline King/Queen",
    category: BADGE_CATEGORIES.WRITING,
    rarity: BADGE_RARITIES.RARE,
    icon: "👑",
    shortDescription: "Big moment specialist",
    fullEffectText:
      "Your haymakers hit different. +15% peak segment score, +5 crowd reaction. Trade-off: -10% consistency (you're flashy, not steady).",
    spriteId: "badge_001",
    isPositive: true,
    effects: {
      peakScore: 15,
      crowdReaction: 5,
      consistency: -10,
    },
  },
  {
    id: "scheme_specialist",
    name: "Scheme Specialist",
    category: BADGE_CATEGORIES.WRITING,
    rarity: BADGE_RARITIES.EPIC,
    icon: "🧩",
    shortDescription: "Complex rhyme patterns",
    fullEffectText:
      "Multi-syllabic schemes are your bread and butter. +25% lyricism, +30% writing prep efficiency, +20% consistency. Rewards heavy prep.",
    spriteId: "badge_002",
    isPositive: true,
    effects: {
      lyricism: 25,
      writingPrep: 30,
      consistency: 20,
    },
  },
  {
    id: "metaphor_master",
    name: "Metaphor Master",
    category: BADGE_CATEGORIES.WRITING,
    rarity: BADGE_RARITIES.RARE,
    icon: "🎭",
    shortDescription: "Creative comparisons",
    fullEffectText: "+30% creativity, +15% lyricism, +20% writing prep efficiency. Small Room bonus: +5%.",
    spriteId: "badge_003",
    isPositive: true,
    effects: {
      creativity: 30,
      lyricism: 15,
      writingPrep: 20,
      smallRoomBonus: 5,
    },
  },
  {
    id: "wordplay_wizard",
    name: "Wordplay Wizard",
    category: BADGE_CATEGORIES.WRITING,
    rarity: BADGE_RARITIES.RARE,
    icon: "✨",
    shortDescription: "Punchline craftsman",
    fullEffectText: "Your wordplay is unmatched. +40% wordplay effectiveness, +25% writing prep, +8 crowd reaction.",
    spriteId: "badge_004",
    isPositive: true,
    effects: {
      wordplay: 40,
      writingPrep: 25,
      crowdReaction: 8,
    },
  },
  {
    id: "freestyle_genius",
    name: "Freestyle Genius",
    category: BADGE_CATEGORIES.WRITING,
    rarity: BADGE_RARITIES.LEGENDARY,
    icon: "⚡",
    shortDescription: "Improvisation master",
    fullEffectText:
      "You thrive with minimal prep. +30% creativity, +20% peak score, -25% choke chance. Low prep = bonus. High variance - you're either fire or trash.",
    spriteId: "badge_005",
    isPositive: true,
    effects: {
      creativity: 30,
      peakScore: 20,
      chokeChance: -25,
    },
  },
  {
    id: "rebuttal_king",
    name: "Rebuttal King/Queen",
    category: BADGE_CATEGORIES.WRITING,
    rarity: BADGE_RARITIES.RARE,
    icon: "🔄",
    shortDescription: "Quick thinker",
    fullEffectText: "-2% choke chance, +20% creativity, +15% performance prep. You think on your feet.",
    spriteId: "badge_046",
    isPositive: true,
    effects: {
      chokeChance: -2,
      creativity: 20,
      performancePrep: 15,
    },
  },
  {
    id: "well_researched",
    name: "Well Researched",
    category: BADGE_CATEGORIES.WRITING,
    rarity: BADGE_RARITIES.RARE,
    icon: "🔍",
    shortDescription: "Thorough preparation",
    fullEffectText: "+35% research prep, +20% creativity, +20% peak score. Your angles are deep.",
    spriteId: "badge_054",
    isPositive: true,
    effects: {
      researchPrep: 35,
      creativity: 20,
      peakScore: 20,
    },
  },
]

// City/Region Badges (to be generated)
export const CITY_BADGES: BadgeDefinition[] = [
  {
    id: "nyc_king",
    name: "NYC King/Queen",
    category: BADGE_CATEGORIES.CITY,
    rarity: BADGE_RARITIES.EPIC,
    icon: "🗽",
    shortDescription: "Conquered New York",
    fullEffectText:
      "You're the best in the biggest city. +20% crowd reaction in NYC, +15% stage presence, +2 reputation.",
    spriteId: "badge_city_nyc",
    isPositive: true,
    effects: {
      crowdReaction: 20,
      stagePresence: 15,
      reputation: 2,
    },
  },
  {
    id: "la_champion",
    name: "LA Champion",
    category: BADGE_CATEGORIES.CITY,
    rarity: BADGE_RARITIES.EPIC,
    icon: "🌴",
    shortDescription: "West Coast legend",
    fullEffectText: "Los Angeles bows to you. +20% crowd control in LA, +15% delivery, +2 reputation.",
    spriteId: "badge_city_la",
    isPositive: true,
    effects: {
      crowdControl: 20,
      delivery: 15,
      reputation: 2,
    },
  },
  {
    id: "chicago_legend",
    name: "Chicago Legend",
    category: BADGE_CATEGORIES.CITY,
    rarity: BADGE_RARITIES.EPIC,
    icon: "🏙️",
    shortDescription: "Midwest mastery",
    fullEffectText: "Chi-Town respects the grind. +15% consistency in Chicago, +20% resilience, +2 reputation.",
    spriteId: "badge_city_chicago",
    isPositive: true,
    effects: {
      consistency: 15,
      resilience: 20,
      reputation: 2,
    },
  },
]

export const REGION_BADGES: BadgeDefinition[] = [
  {
    id: "east_coast_boss",
    name: "East Coast Boss",
    category: BADGE_CATEGORIES.REGION,
    rarity: BADGE_RARITIES.LEGENDARY,
    icon: "🌊",
    shortDescription: "East Coast dominance",
    fullEffectText: "The entire East Coast knows your name. +10% all attributes in Eastern cities, +3 reputation.",
    spriteId: "badge_region_east",
    isPositive: true,
    effects: {
      reputation: 3,
      lyricism: 10,
      delivery: 10,
      stagePresence: 10,
    },
  },
  {
    id: "west_coast_king",
    name: "West Coast King/Queen",
    category: BADGE_CATEGORIES.REGION,
    rarity: BADGE_RARITIES.LEGENDARY,
    icon: "🌅",
    shortDescription: "West Coast royalty",
    fullEffectText: "The West Coast is yours. +10% all attributes in Western cities, +3 reputation.",
    spriteId: "badge_region_west",
    isPositive: true,
    effects: {
      reputation: 3,
      creativity: 10,
      crowdControl: 10,
      delivery: 10,
    },
  },
  {
    id: "midwest_champion",
    name: "Midwest Champion",
    category: BADGE_CATEGORIES.REGION,
    rarity: BADGE_RARITIES.LEGENDARY,
    icon: "🌾",
    shortDescription: "Heartland hero",
    fullEffectText: "The Midwest claims you. +10% all attributes in Midwest cities, +3 reputation.",
    spriteId: "badge_region_midwest",
    isPositive: true,
    effects: {
      reputation: 3,
      consistency: 10,
      resilience: 10,
      lyricism: 10,
    },
  },
  {
    id: "south_legend",
    name: "Southern Legend",
    category: BADGE_CATEGORIES.REGION,
    rarity: BADGE_RARITIES.LEGENDARY,
    icon: "🔥",
    shortDescription: "Dirty South icon",
    fullEffectText: "The South rides with you. +10% all attributes in Southern cities, +3 reputation.",
    spriteId: "badge_region_south",
    isPositive: true,
    effects: {
      reputation: 3,
      flow: 10,
      stagePresence: 10,
      crowdReaction: 10,
    },
  },
]

// Helper functions
export function getBadgeRarityStyle(rarity: BadgeRarity) {
  const config = BADGE_RARITY_COLORS[rarity]
  return {
    color: config.color,
    glow: config.glow,
    difficulty: config.difficulty,
  }
}

export function calculateBadgeEffects(badges: BadgeDefinition[]): BadgeEffects {
  const totalEffects: BadgeEffects = {}

  badges.forEach((badge) => {
    Object.entries(badge.effects).forEach(([key, value]) => {
      if (value !== undefined) {
        totalEffects[key as keyof BadgeEffects] = (totalEffects[key as keyof BadgeEffects] || 0) + value
      }
    })
  })

  return totalEffects
}

export function getAllBadges(): BadgeDefinition[] {
  return [...POSITIVE_WRITING_BADGES, ...CITY_BADGES, ...REGION_BADGES]
}
