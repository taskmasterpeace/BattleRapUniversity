/**
 * TOOLTIPS DATA
 * Single source of truth for all game concept tooltips
 * Used in both the player guide and in-game UI tooltips
 */

export interface TooltipData {
  id: string
  title: string
  description: string
  category?: "origin" | "league" | "attribute" | "badge" | "crew" | "battle" | "prep" | "system"
}

export const TOOLTIPS: TooltipData[] = [
  // ORIGINS
  {
    id: "origin-text-forums",
    title: "Text Forums Origin",
    description:
      "You honed your craft writing bars in forums, dissecting lyrics, and studying the greats. Your writing is sharp, but you lack stage experience. Bonuses: +2 Lyricism, +1 Wordplay, +1 Creativity. Penalties: -1 Stage Presence, -1 Delivery.",
    category: "origin",
  },
  {
    id: "origin-app-camera",
    title: "App Camera Origin",
    description:
      "You built your name dropping videos on social apps, mastering delivery and crowd energy. Your stage presence is strong, but your pen needs work. Bonuses: +2 Stage Presence, +1 Delivery, +1 Crowd Control. Penalties: -1 Lyricism, -1 Wordplay.",
    category: "origin",
  },
  {
    id: "origin-crew",
    title: "Crew Origin",
    description:
      "You came up battling in your crew, building reputation and resilience through real competition. You're battle-tested but financially unstable. Bonuses: +1 Reputation, +1 Resilience. Penalties: -1 Financial Stability.",
    category: "origin",
  },

  // LEAGUES - VIRTUAL
  {
    id: "league-text-wars",
    title: "Text Wars (Virtual)",
    description:
      "Asynchronous text battles where you post your rounds and the community votes. Pure pen game - no performance required. Writing counts for 85% of scoring. Perfect for writers who excel at crafting bars without stage pressure.",
    category: "league",
  },
  {
    id: "league-battlerap-app",
    title: "BattleRap App (Virtual)",
    description:
      "Record your rounds on camera, post to the app, and get voted on. Performance matters more than pure writing. Delivery and presence count for 45% of scoring. Great for performers who want to build a following.",
    category: "league",
  },

  // LEAGUES - UNDERGROUND
  {
    id: "league-underground-kings",
    title: "Underground Kings",
    description:
      "Atlanta's street league. Raw, aggressive battles with high crowd energy. Performance and crowd control matter more than technical bars. Base payout: $200.",
    category: "league",
  },
  {
    id: "league-bar-god",
    title: "Bar God Battle League",
    description:
      "Philly's technical league. Lightning-fast bars and lyrical precision. Writing counts for 50% of scoring. Base payout: $250.",
    category: "league",
  },

  // LEAGUES - REGIONAL
  {
    id: "league-small-room-circuit",
    title: "Small Room Circuit",
    description:
      "Intimate battles where pen game matters most. 2-minute rounds (4 segments). Writing-focused (60% weight). Ideal for technical writers and angle specialists. Base payout: $500.",
    category: "league",
  },
  {
    id: "league-gun",
    title: "G.U.N. Battle League",
    description:
      "Los Angeles precision targeting league. Every bar hits its mark. Technical style with balanced writing/performance (50%/25%). Base payout: $650.",
    category: "league",
  },

  // LEAGUES - PREMIER
  {
    id: "league-main-stage",
    title: "Main Stage",
    description:
      "The brightest lights in Vegas. Premier battle rap where performance, crowd control, and entertainment reign. 3-minute rounds (6 segments). Performance-focused (35% weight). Base payout: $7,500.",
    category: "league",
  },
  {
    id: "league-global-word-war",
    title: "Global Word War",
    description:
      "The world stage. International battlers compete for global supremacy. Balanced scoring with massive crowds. Base payout: $5,000.",
    category: "league",
  },

  // ATTRIBUTES - WRITING
  {
    id: "attr-lyricism",
    title: "Lyricism",
    description:
      "The depth, eloquence, and technical quality of your bars. Metaphors, similes, and sophisticated wordplay. Critical in Small Room Circuit (35% weight) and writing-focused leagues.",
    category: "attribute",
  },
  {
    id: "attr-wordplay",
    title: "Wordplay",
    description:
      "Your ability to land punchlines, double entendres, and clever twists. The 'wow factor' in your bars. Improves with writing prep days.",
    category: "attribute",
  },
  {
    id: "attr-creativity",
    title: "Creativity",
    description:
      "Your capacity to generate unique angles, fresh concepts, and original schemes. Powers your ability to create memorable moments and adapt strategies.",
    category: "attribute",
  },
  {
    id: "attr-flow",
    title: "Flow",
    description:
      "How naturally your words fit together rhythmically. The cadence and metrication of your delivery. Separates choppy battlers from smooth ones.",
    category: "attribute",
  },

  // ATTRIBUTES - PERFORMANCE
  {
    id: "attr-stage-presence",
    title: "Stage Presence",
    description:
      "Your command of the stage, confidence, and ability to own the space. Critical on Main Stage (25% weight). High stage presence (8+) grants +5-10% crowd reaction bonus.",
    category: "attribute",
  },
  {
    id: "attr-crowd-control",
    title: "Crowd Control",
    description:
      "Your skill at reading and manipulating the audience's emotions and energy. Affects crowd reaction multiplier and reduces stumble penalties through recovery skill.",
    category: "attribute",
  },
  {
    id: "attr-delivery",
    title: "Delivery",
    description:
      "Voice projection, tone, emphasis, and execution. Reduces stumble probability (-0.08% per point above 5). Key component of stumble recovery skill.",
    category: "attribute",
  },

  // ATTRIBUTES - PERSONAL
  {
    id: "attr-financial-stability",
    title: "Financial Stability",
    description:
      "Your resources for equipment, travel, and battle fees. Low stability (<4) adds stress and increases choke probability. Affected by battle earnings, expenses, and life events.",
    category: "attribute",
  },
  {
    id: "attr-reputation",
    title: "Reputation",
    description:
      "Your standing in the battle rap community. Affects battle offer quality, tournament seeding, and media coverage. Extreme values (too low or too high) add choke pressure.",
    category: "attribute",
  },
  {
    id: "attr-family-bond",
    title: "Family Bond",
    description:
      "Your support network's strength. Buffs effective resilience (+family_bond/10 to resilience). Strong bonds help manage stress and mitigate negative life events. Improved by life prep days.",
    category: "attribute",
  },
  {
    id: "attr-preparation",
    title: "Preparation",
    description:
      "Your time management and focus ability. Reduces stress (preparation - 5) × 2. Higher preparation = more effective prep days. Crucial for converting prep time into performance.",
    category: "attribute",
  },

  // ATTRIBUTES - RESILIENCE
  {
    id: "attr-resilience",
    title: "Resilience",
    description:
      "Your mental toughness and ability to handle pressure. Each point above 5 reduces choke chance by -0.15%. Buffed by family bond and rest prep days. Critical for avoiding choking under stress.",
    category: "attribute",
  },

  // PREP TYPES
  {
    id: "prep-research",
    title: "Research Prep",
    description:
      "Study your opponent, find their weaknesses, and discover secrets. Enables 'angles' in battle with personal attack bonuses. Scales with creativity. Best for Angle Masters.",
    category: "prep",
  },
  {
    id: "prep-writing",
    title: "Writing Prep",
    description:
      "Craft and memorize your bars. Reduces choke probability (-0.04% per day) and temporarily boosts writing attributes during battle. Essential in Small Room Circuit.",
    category: "prep",
  },
  {
    id: "prep-performance",
    title: "Performance Prep",
    description:
      "Rehearse delivery, practice stage movements, and work on crowd reads. Reduces stumble probability (-0.08% per day) and boosts performance attributes. Critical for Main Stage.",
    category: "prep",
  },
  {
    id: "prep-life",
    title: "Life Prep",
    description:
      "Spend time with family and handle personal matters. Strengthens family bond (+0.1 per day) and can trigger positive life events. Indirectly buffs resilience through family support.",
    category: "prep",
  },
  {
    id: "prep-rest",
    title: "Rest Prep",
    description:
      "Reduce stress (-5 per day) and temporarily buff resilience. Essential when juggling multiple battles or recovering from high-stress situations. Best for Known Chokers building confidence.",
    category: "prep",
  },

  // STARTER CREWS
  {
    id: "crew-street-prophets",
    title: "Street Prophets",
    description:
      "Street style crew with mid reputation (35). Members: Truth Seeker (storytelling/angles), Raw Prophet (aggressive/personals), Corner Poet (storytelling/metaphors). Balanced approach to street battling.",
    category: "crew",
  },
  {
    id: "crew-bar-scientists",
    title: "Bar Scientists",
    description:
      "Technical style crew with higher reputation (40). Members: Scheme Architect (schemes/multisyllabic), Wordplay Wizard (wordplay/metaphors - TOP TIER), Technical Professor (technical/angles). Elite writing-focused crew.",
    category: "crew",
  },
  {
    id: "crew-gutter-kings",
    title: "Gutter Kings",
    description:
      "Aggressive style crew with lower reputation (30). Members: Street Brawler (aggressive/gun_bars), Grime Lord (theatrical/aggressive), Raw Energy (aggressive/crowd_engagement). High-energy performance crew.",
    category: "crew",
  },

  // BATTLE MECHANICS
  {
    id: "battle-segments",
    title: "Battle Segments",
    description:
      "Battles are divided into 30-second segments (not individual bars). 2-minute rounds = 4 segments, 3-minute rounds = 6 segments. Each segment generates a score based on attributes, prep, and variance.",
    category: "battle",
  },
  {
    id: "battle-choke",
    title: "Choking",
    description:
      "Catastrophic mental failure where you forget your bars. Segment score × 0.30 (70% penalty). Triggered by low resilience, high stress, poor prep, or extreme pressure. Average battler: 7% per battle.",
    category: "battle",
  },
  {
    id: "battle-stumble",
    title: "Stumbling",
    description:
      "Minor delivery error or hesitation. Segment score × 0.70 (30% penalty). Can be reduced to × 0.85 (15% penalty) with high recovery skill (delivery + crowd_control ≥ 8). ~40% of battles have at least one stumble.",
    category: "battle",
  },
  {
    id: "battle-crowd-reaction",
    title: "Crowd Reaction",
    description:
      "Audience response to your performance (0-100 scale). Influenced by performance attributes, crowd control, league base crowd factor, and momentum. High crowd reactions improve your chances of winning rounds.",
    category: "battle",
  },
  {
    id: "battle-consistency",
    title: "Consistency Score",
    description:
      "How stable your performance is across segments. Based on standard deviation. High consistency = reliable output. Low consistency = unpredictable with high peaks and low valleys.",
    category: "battle",
  },
  {
    id: "battle-peak",
    title: "Peak Score",
    description:
      "Your best segment in a round - the 'haymaker' moment. High peak + low average = flashy but inconsistent. Peak ≥ 8.5 can trigger haymaker bonuses and viral moments.",
    category: "battle",
  },

  // SYSTEM CONCEPTS
  {
    id: "system-stress",
    title: "Stress System",
    description:
      "Dynamic 0-100 scale affecting performance. Increased by: multiple active battles, time pressure, recent battles, low financial stability. Reduced by: preparation attribute, rest days, badge effects. High stress = +choke chance +stumble chance.",
    category: "system",
  },
  {
    id: "system-rating",
    title: "ELO Rating",
    description:
      "Skill rating system (starts at 1200). Win against higher-rated opponent = big gain. Lose to lower-rated = big loss. Choke in loss = additional penalty. Dominant win (3-0) = bonus rating.",
    category: "system",
  },
  {
    id: "system-tier",
    title: "League Tiers",
    description:
      "Underground (0-999), Regional (1000-1299), National (1300-1599), Premier (1600+). Each tier has rating requirements, minimum wins, and minimum battles to access. Higher tiers = better pay and competition.",
    category: "system",
  },
  {
    id: "system-public-knowledge",
    title: "Public Knowledge",
    description:
      "Fame level (0-100 scale). Affects media coverage frequency, battle offer visibility, and tournament invitations. High fame (>70) adds pressure that can increase choke chance (+0.03% per point over 70).",
    category: "system",
  },
]

// Helper functions for accessing tooltips
export function getTooltipById(id: string): TooltipData | undefined {
  return TOOLTIPS.find((t) => t.id === id)
}

export function getTooltipsByCategory(category: TooltipData["category"]): TooltipData[] {
  return TOOLTIPS.filter((t) => t.category === category)
}

export function getAllOriginTooltips(): TooltipData[] {
  return getTooltipsByCategory("origin")
}

export function getAllLeagueTooltips(): TooltipData[] {
  return getTooltipsByCategory("league")
}

export function getAllAttributeTooltips(): TooltipData[] {
  return getTooltipsByCategory("attribute")
}

export function getAllPrepTooltips(): TooltipData[] {
  return getTooltipsByCategory("prep")
}

export function getAllCrewTooltips(): TooltipData[] {
  return getTooltipsByCategory("crew")
}

export function getAllBattleTooltips(): TooltipData[] {
  return getTooltipsByCategory("battle")
}

export function getAllSystemTooltips(): TooltipData[] {
  return getTooltipsByCategory("system")
}
