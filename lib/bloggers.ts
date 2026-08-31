// Complete Blogger System for Battle Rap Game

export interface Blogger {
  id: string
  name: string
  slug: string
  title: string
  icon: string
  color: string
  specialty: string
  homeLeague: string | null
  followers: number
  articleCount: number
  bio: string
  notableTakes: string[]
  writingStyle: string[]
  covers: string[]
  isActive: boolean // Only active bloggers appear in the game
  avatarId?: string // e.g. "blogger_001" maps to /sprites/bloggers/blogger_001.png
  avatarCrop?: {
    scale: number
    offsetX: number
    offsetY: number
  }
}

export const BLOGGERS: Blogger[] = [
  {
    id: "jesse-rican",
    name: "Jesse Rican",
    slug: "jesse-rican",
    title: "The Predictions King",
    icon: "🎯",
    color: "#E23A2E", // corner red — the red polo
    specialty: "Predictions, Card Previews, Culture Takes",
    homeLeague: null, // covers every room
    followers: 15600,
    articleCount: 0,
    bio: "Jesse Rican calls his shots before the battles do. Card-by-card predictions, zero hedging, receipts kept. And he's the only media man crazy enough to step in the ring himself — an active battler on the circuit, so when he grades your pen, he's graded his own first.",
    notableTakes: [
      "I don't do 'it could go either way.' Pick a side.",
      "My prediction record IS my resume.",
      "I battle too — that's why my breakdowns hit different.",
      "If I call you winning 3-0 and you drop a round, we're both embarrassed.",
    ],
    writingStyle: ["Bold predictions", "Card previews", "Scorecard verdicts", "Accountability follow-ups"],
    covers: ["Fight cards", "Predictions", "Upset watch", "His own battles (no bias, allegedly)"],
    isActive: true, // ACTIVE — predictions and card previews (dual-lane: also a battler)
    avatarId: "blogger_jesse_rican",
  },
  {
    id: "battle-eyez",
    name: "Battle Eyez",
    slug: "battle-eyez",
    title: "The Technical Analyst",
    icon: "👁️",
    color: "#3B82F6", // blue-500
    specialty: "Battle Recaps, Bar Analysis",
    homeLeague: "Small Room Circuit",
    followers: 12400,
    articleCount: 0, // Starts at 0 - increases as LLM generates articles
    bio: "Battle Eyez has been covering the scene for over a decade. Known for detailed round-by-round breakdowns and calling out who really won controversial battles. If you want to know who had the better pen, Battle Eyez has the receipts.",
    notableTakes: [
      "Writing wins battles. Performance just gets you booked.",
      "If you can't scheme, you can't win in the small room.",
      "The 2-minute round exposes who really writes.",
      "I call it like I see it. No bias, just bars.",
    ],
    writingStyle: ["Technical analysis", "Play-by-play breakdowns", "Bar-by-bar scoring", "Objective tone"],
    covers: ["Technical writers", "Scheme specialists", "Small Room battles", "Controversial decisions"],
    isActive: false, // Inactive - can be activated later
    // avatarId: "blogger_001", // Add when avatar image exists in /public/sprites/bloggers/
  },
  {
    id: "marijuana-piranha",
    name: "Marijuana Piranha",
    slug: "marijuana-piranha",
    title: "The Underground Insider",
    icon: "🔥",
    color: "#EF4444", // red-500
    specialty: "Scandals, Drama, Controversy",
    homeLeague: null,
    followers: 8200,
    articleCount: 0,
    bio: "MP keeps it raw and unfiltered. If there's beef, drama, or controversy, MP was there first. Not afraid to call out anyone, from rookies to legends. The most entertaining voice in battle rap media.",
    notableTakes: [
      "The culture needs drama to survive.",
      "Half these battlers are industry plants.",
      "Real recognizes real, and most of y'all are fake.",
      "If you ain't got haters, you ain't poppin'.",
    ],
    writingStyle: ["Raw, unfiltered", "Controversial takes", "Drama-focused", "Street vernacular"],
    covers: ["Scandals", "Beef between battlers", "Controversial figures", "Underground drama"],
    isActive: true, // ACTIVE - Drama and controversy coverage
  },
  {
    id: "algorithm-institute",
    name: "Algorithm Institute",
    slug: "algorithm-institute",
    title: "The Data Scientist",
    icon: "📊",
    color: "#06B6D4", // cyan-500
    specialty: "Career Updates, Rankings, Stats",
    homeLeague: null,
    followers: 15100,
    articleCount: 0,
    bio: "AI brings the numbers. Career trajectories, win rates, rating predictions - if it can be quantified, AI has the data. The most objective voice in battle rap media. Numbers don't lie.",
    notableTakes: [
      "Stats don't lie, battlers do.",
      "Rating inflation is killing the scene.",
      "Historical analysis > hot takes.",
      "The data tells the real story.",
    ],
    writingStyle: ["Data-driven", "Objective analysis", "Career tracking", "Statistical breakdowns"],
    covers: ["Power rankings", "Career milestones", "Rating changes", "Statistical trends"],
    isActive: true, // ACTIVE - Data and statistics coverage
  },
  {
    id: "small-room-report",
    name: "Small Room Report",
    slug: "small-room-report",
    title: "The Pen Game Purist",
    icon: "🎤",
    color: "#F97316", // orange-500
    specialty: "Small Room Circuit Coverage",
    homeLeague: "Small Room Circuit",
    followers: 9800,
    articleCount: 0,
    bio: "SRR lives and breathes the Small Room Circuit. Champions pen game over performance, intimate crowds over stadium shows. The voice of lyrical purists everywhere.",
    notableTakes: [
      "Bars over performance, always.",
      "The small room is where legends are made.",
      "If you need a big crowd to win, you're not a real writer.",
      "Pen game is the foundation of battle rap.",
    ],
    writingStyle: ["Lyric-focused", "Appreciates wordplay", "Intimate tone", "Writing-first perspective"],
    covers: ["Small Room Circuit battles", "Technical writers", "Underrated pen gamers", "League-specific news"],
    isActive: false, // Inactive - can be activated later
  },
  {
    id: "main-stage-herald",
    name: "The Main Stage Herald",
    slug: "main-stage-herald",
    title: "The Big Stage Specialist",
    icon: "👑",
    color: "#EAB308", // yellow-500
    specialty: "Main Stage Arena Coverage",
    homeLeague: "Main Stage Arena",
    followers: 18700,
    articleCount: 0,
    bio: "Herald covers the biggest battles on the biggest stages. Major events, championship bouts, and everything that draws a crowd. Performance matters here. Entertainment is art.",
    notableTakes: [
      "If you can't rock a crowd, you can't be a champion.",
      "Main stage pressure separates the real from the rest.",
      "Entertainment value is part of the art.",
      "The biggest moments happen on the biggest stages.",
    ],
    writingStyle: ["Performance-focused", "Hype energy", "Mainstream appeal", "Entertainment lens"],
    covers: ["Main Stage Arena battles", "Major events", "Tournament coverage", "Big-name matchups"],
    isActive: false, // Inactive - can be activated later
    avatarId: "blogger_005",
    avatarCrop: {
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
    },
  },
  {
    id: "underground-voice",
    name: "Underground Voice",
    slug: "underground-voice",
    title: "The Culture Keeper",
    icon: "✊",
    color: "#A855F7", // purple-500
    specialty: "Culture, Community, Scene Politics",
    homeLeague: null,
    followers: 7500,
    articleCount: 0,
    bio: "UV speaks for the culture. Scene politics, community issues, and the stories behind the stories. If it affects the battlers, UV is covering it. More than bars - it's about the people.",
    notableTakes: [
      "Battle rap is more than bars and performance.",
      "The culture is the people.",
      "We need to protect the community.",
      "Stories matter more than stats.",
    ],
    writingStyle: ["Community-focused", "Thoughtful analysis", "Human interest", "Culture commentary"],
    covers: ["Life events", "Community stories", "Scene politics", "Battler backgrounds"],
    isActive: false, // Inactive - can be activated later
    // avatarId: "blogger_006", // Add when avatar image exists in /public/sprites/bloggers/
  },
  {
    id: "coast-to-coast",
    name: "Coast to Coast Coverage",
    slug: "coast-to-coast",
    title: "The Regional Reporter",
    icon: "🌎",
    color: "#22C55E", // green-500
    specialty: "Regional News, Geographic Coverage",
    homeLeague: null,
    followers: 11200,
    articleCount: 0,
    bio: "C2C tracks the scenes across all regions. NYC vs LA, Midwest grind, Southern style, international exposure - C2C has correspondents everywhere. Every city has a story.",
    notableTakes: [
      "Every city has its own flavor.",
      "Regional pride drives the best battles.",
      "Don't sleep on the underground scenes.",
      "The best battles come from regional rivalries.",
    ],
    writingStyle: ["Geographic focus", "Regional comparisons", "Local scene coverage", "Travel perspective"],
    covers: ["Regional matchups", "City-specific news", "Geographic rivalries", "Scene comparisons"],
    isActive: false, // Inactive - can be activated later
    // avatarId: "blogger_007", // Add when avatar image exists in /public/sprites/bloggers/
  },
  {
    id: "battle-breakdown",
    name: "The Battle Breakdown",
    slug: "battle-breakdown",
    title: "The Strategy Guru",
    icon: "🧠",
    color: "#EC4899", // pink-500
    specialty: "Strategic Analysis, What Went Wrong",
    homeLeague: null,
    followers: 10600,
    articleCount: 0,
    bio: "TBB breaks down the chess match. What worked, what didn't, and why. If you want to understand how to win battles, TBB has the blueprint. Learn from every loss.",
    notableTakes: [
      "Every loss is a lesson.",
      "Preparation beats natural talent.",
      "Study your opponent or get studied.",
      "Strategy is the difference between good and great.",
    ],
    writingStyle: ["Strategic analysis", "Educational tone", "Breakdown format", "Tactical focus"],
    covers: ["Post-battle analysis", "Prep strategies", "What went wrong", "How to improve"],
    isActive: true, // ACTIVE - Strategy and breakdown coverage
    // avatarId: "blogger_008", // Add when avatar image exists in /public/sprites/bloggers/
  },
]

export function getBloggerBySlug(slug: string): Blogger | undefined {
  return BLOGGERS.find((b) => b.slug === slug)
}

export function getBloggerById(id: string): Blogger | undefined {
  return BLOGGERS.find((b) => b.id === id)
}

export function formatFollowers(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

// Get only active bloggers (for display in game)
export function getActiveBloggers(): Blogger[] {
  return BLOGGERS.filter((b) => b.isActive)
}

// Get all bloggers (for admin/dev tools)
export function getAllBloggers(): Blogger[] {
  return BLOGGERS
}

// Check if a blogger is active
export function isBloggerActive(id: string): boolean {
  const blogger = getBloggerById(id)
  return blogger?.isActive ?? false
}
