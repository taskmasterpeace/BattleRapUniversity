// Battle Flyer System - for event announcements and career history

export interface BattleFlyer {
  id: string
  type: "standard" | "championship" | "grudge" | "tournament" | "debut"
  title: string
  subtitle?: string
  date: string
  venue: string
  league: string
  leagueLogoId?: string
  battler1: {
    name: string
    city: string
    record: string
    spriteId?: string
  }
  battler2: {
    name: string
    city: string
    record: string
    spriteId?: string
  }
  format: string // "3 rounds", "2-min rounds", etc.
  stakes?: string // "Championship", "$5000 purse", etc.
  backgroundId?: string // for custom flyer backgrounds
  aspectRatio: "16:9" | "9:16" | "1:1"
}

export const FLYER_TEMPLATES = {
  standard: {
    name: "Standard Battle",
    bgGradient: "from-zinc-900 via-zinc-800 to-zinc-900",
    accentColor: "orange",
  },
  championship: {
    name: "Championship",
    bgGradient: "from-yellow-900/30 via-zinc-900 to-yellow-900/30",
    accentColor: "yellow",
  },
  grudge: {
    name: "Grudge Match",
    bgGradient: "from-red-900/30 via-zinc-900 to-red-900/30",
    accentColor: "red",
  },
  tournament: {
    name: "Tournament",
    bgGradient: "from-purple-900/30 via-zinc-900 to-purple-900/30",
    accentColor: "purple",
  },
  debut: {
    name: "Debut Battle",
    bgGradient: "from-green-900/30 via-zinc-900 to-green-900/30",
    accentColor: "green",
  },
}

// Mock flyers for career history
export const MOCK_BATTLE_FLYERS: BattleFlyer[] = [
  {
    id: "flyer-1",
    type: "grudge",
    title: "SETTLE THE SCORE",
    subtitle: "The Rematch Everyone Wanted",
    date: "2025-01-15",
    venue: "The Container",
    league: "Bar God Battle League",
    battler1: {
      name: "Tech Wizard",
      city: "New York",
      record: "11-4",
      spriteId: "sprite_569",
    },
    battler2: {
      name: "Verbal Venom",
      city: "Atlanta",
      record: "8-5",
      spriteId: "sprite_571",
    },
    format: "3 Rounds • 2-Min Each",
    stakes: "Grudge Intensity: 82/100",
    aspectRatio: "16:9",
  },
  {
    id: "flyer-2",
    type: "standard",
    title: "SMALL ROOM SATURDAY",
    date: "2024-12-20",
    venue: "The Basement",
    league: "Small Room Circuit",
    battler1: {
      name: "Tech Wizard",
      city: "New York",
      record: "10-4",
    },
    battler2: {
      name: "Bar Scientist",
      city: "Chicago",
      record: "12-3",
    },
    format: "3 Rounds",
    aspectRatio: "16:9",
  },
  {
    id: "flyer-3",
    type: "championship",
    title: "CHAMPIONSHIP BOUT",
    subtitle: "For the Small Room Title",
    date: "2024-11-10",
    venue: "Main Stage Arena",
    league: "Main Stage Arena",
    battler1: {
      name: "Tech Wizard",
      city: "New York",
      record: "9-4",
    },
    battler2: {
      name: "Lyrical Legend",
      city: "Los Angeles",
      record: "15-2",
    },
    format: "5 Rounds • Championship Rules",
    stakes: "$10,000 Purse + Title",
    aspectRatio: "16:9",
  },
]

export function getFlyersByBattler(battlerName: string): BattleFlyer[] {
  return MOCK_BATTLE_FLYERS.filter((f) => f.battler1.name === battlerName || f.battler2.name === battlerName)
}
