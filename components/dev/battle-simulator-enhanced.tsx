"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Play,
  Pause,
  SkipForward,
  RefreshCw,
  Trophy,
  Swords,
  Users,
  Zap,
  ChevronRight,
  FastForward,
  Mic,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCrowdSpritePath, mapReactionToSpriteType } from "@/lib/game/cityUtils"
import { VENUES, VENUE_CATEGORIES, getVenuesByCategory, getCrowdSilhouette, type Venue, type VenueCategory } from "@/lib/game/venues"
import {
  CONTENT_TYPES,
  DELIVERY_TYPES,
  PERFORMANCE_TYPES,
  CONTENT_TYPE_INFO,
  DELIVERY_TYPE_INFO,
  PERFORMANCE_TYPE_INFO,
  simulateMockRoundFull,
  generateOpponentSelections,
  calculatePrepNeeded,
  calculatePrepRisks,
  type ContentType,
  type DeliveryType,
  type PerformanceType,
  type RoundSelections,
  type PrepLevels,
  type BattleFormat,
  type SimulationOptions,
} from "@/lib/round-crafting"
import {
  ROUND_STRATEGIES,
  getStrategy,
  calculateStrategyEffectiveness,
  getEffectivenessForecast,
  type RoundStrategy,
} from "@/lib/game/roundStrategies"
import { StrategySelector, EffectivenessForecastPanel } from "./strategy-selector"
import { PreBattleAnalysisPanel, RoundMetricsPanel, BattleSummaryPanel } from "./metrics-panel"
import {
  generatePreBattleAnalysis,
  calculateRoundMetrics,
  type PreBattleAnalysis,
  type RoundMetricsSummary,
} from "@/lib/game/metricsCalculator"

interface Battler {
  id: string
  name: string
  tier: string
  region: string
  city?: string
  portrait?: string // Sprite URL if available
  badges?: string[] // Badge IDs for simulation effects
}

// Battler portrait component - shows sprite or fallback initial
function BattlerPortrait({
  battler,
  size = "md",
  borderColor = "zinc"
}: {
  battler: Battler | null
  size?: "sm" | "md" | "lg" | "xl"
  borderColor?: "green" | "red" | "zinc" | "yellow" | "orange"
}) {
  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
    xl: "w-24 h-24 text-4xl",
  }
  const borderColors = {
    green: "border-green-500 bg-green-900/30",
    red: "border-red-500 bg-red-900/30",
    zinc: "border-zinc-600 bg-zinc-800",
    yellow: "border-yellow-500 bg-yellow-900/30",
    orange: "border-orange-500 bg-orange-900/30",
  }

  if (!battler) {
    return (
      <div className={`${sizeClasses[size]} ${borderColors[borderColor]} rounded-full border-2 flex items-center justify-center`}>
        <span className="text-zinc-500">?</span>
      </div>
    )
  }

  // If battler has a portrait sprite, show it
  if (battler.portrait) {
    return (
      <div className={`${sizeClasses[size]} ${borderColors[borderColor]} rounded-full border-2 overflow-hidden`}>
        <Image
          src={battler.portrait}
          alt={battler.name}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // Fallback: show initial with tier-based color
  const tierColors: Record<string, string> = {
    god: "from-yellow-600 to-orange-600",
    top: "from-purple-600 to-pink-600",
    mid: "from-blue-600 to-cyan-600",
    low: "from-zinc-600 to-zinc-500",
  }
  const gradientClass = tierColors[battler.tier] || tierColors.mid

  return (
    <div className={`${sizeClasses[size]} ${borderColors[borderColor]} rounded-full border-2 flex items-center justify-center bg-gradient-to-br ${gradientClass}`}>
      <span className="font-black text-white drop-shadow-md">
        {battler.name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

// Venue cities with regions for coin toss calculation
const VENUE_CITIES = [
  { name: "New York City", region: "East Coast" },
  { name: "Los Angeles", region: "West Coast" },
  { name: "Chicago", region: "Midwest" },
  { name: "Atlanta", region: "South" },
  { name: "Detroit", region: "Midwest" },
  { name: "Philadelphia", region: "East Coast" },
  { name: "Houston", region: "South" },
  { name: "Phoenix", region: "West Coast" },
  { name: "Toronto", region: "Canada" },
]

// Battler home cities (mapped from battler names)
const BATTLER_CITIES: Record<string, { city: string; region: string }> = {
  "Tsunami Wave": { city: "Newark", region: "East Coast" },
  "The Comedian": { city: "Bronx", region: "East Coast" },
  "The Architect": { city: "Harlem", region: "East Coast" },
  "The Nitro Puncher": { city: "Phoenix", region: "West Coast" },
  "Daybreak Lit": { city: "Watts", region: "West Coast" },
  "Compton Kingpin": { city: "Compton", region: "West Coast" },
  "Baltimore Rocker": { city: "Baltimore", region: "East Coast" },
  "Hollow Victory": { city: "Yonkers", region: "East Coast" },
  "The Titan Scribe": { city: "Pontiac", region: "Midwest" },
  "Boston Scheme King": { city: "Boston", region: "East Coast" },
  "Freestyle Dynasty": { city: "Bronx", region: "East Coast" },
  "Money Talk God": { city: "Harlem", region: "East Coast" },
  "Reference Vault": { city: "Newark", region: "East Coast" },
  "Showtime Holla": { city: "St. Louis", region: "Midwest" },
  "Punch Wizard": { city: "St. Louis", region: "Midwest" },
  "Harlem Shiner": { city: "Harlem", region: "East Coast" },
  "Tru Foe": { city: "Chicago", region: "Midwest" },
  "Pontiac Threat": { city: "Pontiac", region: "Midwest" },
  "Newark Aggro": { city: "Newark", region: "East Coast" },
  "Strategy Chess": { city: "Philadelphia", region: "East Coast" },
  "Island Puzzle": { city: "Staten Island", region: "East Coast" },
  "Brooklyn Overlooked": { city: "Brooklyn", region: "East Coast" },
  "Soldier Tampa": { city: "Tampa", region: "South" },
  "Professional Prep": { city: "Detroit", region: "Midwest" },
  "Veteran Journey": { city: "East Orange", region: "East Coast" },
  "Connecticut Grind": { city: "New Haven", region: "East Coast" },
  "Bar Fest Flow": { city: "Newark", region: "East Coast" },
  "Philly Prospect": { city: "Philadelphia", region: "East Coast" },
}

// Calculate "distance" based on region matching
function calculateRegionDistance(battlerRegion: string, venueRegion: string): number {
  // Same region = close (0), adjacent = medium (1), opposite = far (2)
  if (battlerRegion === venueRegion) return 0

  const adjacentRegions: Record<string, string[]> = {
    "East Coast": ["Midwest", "South", "Canada"],
    "West Coast": ["Midwest", "South"],
    "Midwest": ["East Coast", "West Coast", "South", "Canada"],
    "South": ["East Coast", "West Coast", "Midwest"],
    "Canada": ["East Coast", "Midwest"],
  }

  if (adjacentRegions[battlerRegion]?.includes(venueRegion)) return 1
  return 2
}

interface SegmentResult {
  segmentIndex: number
  score: number
  isPeak: boolean
  isChoke: boolean
  isStumble: boolean
}

interface PerformanceResult {
  segments: SegmentResult[]
  averageScore: number
  peakScore: number
  hasPeak: boolean
  hasChoke: boolean
  hasStumble: boolean
}

interface RoundResult {
  roundNum: number
  winner: "battlerA" | "battlerB"
  battlerAPerformance: PerformanceResult
  battlerBPerformance: PerformanceResult
  battlerASelections: RoundSelections
  battlerBSelections: RoundSelections
}

// Momentum state - tracks crowd energy/pressure throughout battle
interface MomentumState {
  value: number // -100 (B dominant) to +100 (A dominant)
  narrative: "dominant_a" | "building_a" | "ahead_a" | "even" | "ahead_b" | "building_b" | "dominant_b" | "fighting_uphill_a" | "fighting_uphill_b"
}

function getMomentumNarrative(momentum: number): MomentumState["narrative"] {
  if (momentum >= 60) return "dominant_a"
  if (momentum >= 35) return "building_a"
  if (momentum >= 15) return "ahead_a"
  if (momentum <= -60) return "dominant_b"
  if (momentum <= -35) return "building_b"
  if (momentum <= -15) return "ahead_b"
  return "even"
}

function getMomentumLabel(momentum: number, aName: string, bName: string): string {
  if (momentum >= 60) return `${aName} DOMINANT`
  if (momentum >= 35) return `${aName} building`
  if (momentum >= 15) return `${aName} ahead`
  if (momentum <= -60) return `${bName} DOMINANT`
  if (momentum <= -35) return `${bName} building`
  if (momentum <= -15) return `${bName} ahead`
  return "EVEN"
}

// Calculate momentum shift based on segment performance
function calculateMomentumShift(
  currentMomentum: number,
  aScore: number,
  bScore: number,
  aChoked: boolean,
  bChoked: boolean,
  aIsPeak: boolean,
  bIsPeak: boolean
): number {
  let shift = 0

  // Base shift from score differential
  const scoreDiff = aScore - bScore
  shift += scoreDiff * 8 // Each point difference = 8 momentum

  // Choke penalty - MASSIVE momentum loss
  if (aChoked) shift -= 35
  if (bChoked) shift += 35

  // Haymaker bonus - peaks swing momentum
  if (aIsPeak && !bIsPeak) shift += 15
  if (bIsPeak && !aIsPeak) shift -= 15

  // Apply shift with some carryover from current momentum (avalanche effect)
  const carryover = currentMomentum * 0.15
  const newMomentum = currentMomentum + shift + carryover

  // Clamp to -100 to +100
  return Math.max(-100, Math.min(100, newMomentum))
}

// Demographic preferences for content types
const DEMOGRAPHIC_PREFERENCES: Record<string, { favors: string[]; dislikes: string[]; label: string; emoji: string }> = {
  purists: {
    favors: ["wordplay", "schemes", "punchlines", "storytelling"],
    dislikes: ["gun_bars", "street_talk"],
    label: "Purists",
    emoji: "📚",
  },
  street_fans: {
    favors: ["gun_bars", "street_talk", "personals", "punchlines"],
    dislikes: ["comedy", "wordplay"],
    label: "Street Fans",
    emoji: "🔫",
  },
  comedy_fans: {
    favors: ["comedy", "personals", "rebuttals"],
    dislikes: ["gun_bars", "street_talk"],
    label: "Comedy Fans",
    emoji: "😂",
  },
  aggression_fans: {
    favors: ["gun_bars", "personals", "street_talk"],
    dislikes: ["wordplay", "storytelling"],
    label: "Aggression Fans",
    emoji: "💪",
  },
  performance_fans: {
    favors: ["storytelling", "comedy", "personals"],
    dislikes: ["schemes"],
    label: "Performance Fans",
    emoji: "🎭",
  },
}

// Calculate how a demographic would score a battler based on their content choices
function calculateDemographicScore(
  selections: RoundSelections,
  baseScore: number,
  demographicKey: string
): number {
  const prefs = DEMOGRAPHIC_PREFERENCES[demographicKey]
  if (!prefs) return baseScore

  let modifier = 0
  const contentType = selections.contentTypes[0]

  // Bonus for favored content
  if (prefs.favors.includes(contentType)) {
    modifier += 0.4 + Math.random() * 0.3 // +0.4 to +0.7
  }
  // Penalty for disliked content
  if (prefs.dislikes.includes(contentType)) {
    modifier -= 0.3 + Math.random() * 0.2 // -0.3 to -0.5
  }

  return Math.max(4, Math.min(10, baseScore + modifier))
}

// Phases of the battle
type BattlePhase =
  | "setup"           // Select battlers
  | "coinToss"        // Coin toss - furthest from venue picks who goes first
  | "craftRound"      // Select content for round
  | "battlerAGoes"    // Watching Battler A perform
  | "battlerBGoes"    // Watching Battler B perform
  | "roundResult"     // Show round winner
  | "battleComplete"  // Show battle winner

// Smart name display - handles names like "The Architect" properly
function getShortName(name: string | undefined): string {
  if (!name) return "?"
  const words = name.split(" ")
  // If 1 word, use it
  if (words.length === 1) return name
  // If starts with "The", "A", "An", use the rest
  if (["The", "A", "An"].includes(words[0]) && words.length > 1) {
    return words.slice(1).join(" ")
  }
  // Otherwise use full name (battle rap names are usually short)
  return name
}

// Reaction type to label mapping
const REACTION_LABELS: Record<string, string> = {
  hype: "FIRE!",
  stunned: "DAMN!",
  cheer: "TALK TO HIM!",
  record: "Recording...",
  think: "Hmm...",
  watch: "...",
  boo: "BOO!",
  cringe: "Yikes...",
  unimpressed: "Meh.",
  laugh: "HAHA!",
  disappointed: "Nah...",
  talk: "SAY IT!",
}

// Helper function to describe a segment performance
function describeSegment(segment: SegmentResult, isFirst: boolean, isLast: boolean): string {
  const position = isFirst ? "OPENING" : isLast ? "CLOSING" : "MID"
  const scoreLevel = segment.score >= 8.5 ? "fire" : segment.score >= 7 ? "solid" : segment.score >= 5 ? "mid" : "weak"

  if (segment.isPeak) {
    return `${position}: ${segment.score.toFixed(1)} - HAYMAKER! Crowd went crazy`
  }
  if (segment.isChoke) {
    return `${position}: ${segment.score.toFixed(1)} - CHOKED. Complete blank, lost the crowd`
  }
  if (segment.isStumble) {
    return `${position}: ${segment.score.toFixed(1)} - STUMBLED. Recovered but lost momentum`
  }

  const descriptions: Record<string, string> = {
    fire: `${position}: ${segment.score.toFixed(1)} - Strong delivery, crowd feeling it`,
    solid: `${position}: ${segment.score.toFixed(1)} - Good bars, crowd engaged`,
    mid: `${position}: ${segment.score.toFixed(1)} - Average, crowd lukewarm`,
    weak: `${position}: ${segment.score.toFixed(1)} - Struggled, crowd quiet`,
  }
  return descriptions[scoreLevel]
}

// Helper function to explain WHY someone won/lost a round
function explainRoundResult(
  winner: "battlerA" | "battlerB",
  aPerf: PerformanceResult,
  bPerf: PerformanceResult,
  aSelections: RoundSelections,
  bSelections: RoundSelections,
  aName: string,
  bName: string
): { summary: string; factors: string[] } {
  const factors: string[] = []

  // Determine key factors
  const avgDiff = Math.abs(aPerf.averageScore - bPerf.averageScore)
  const peakDiff = Math.abs(aPerf.peakScore - bPerf.peakScore)

  // Get content info
  const aContentInfo = CONTENT_TYPE_INFO[aSelections.contentTypes[0]]
  const bContentInfo = CONTENT_TYPE_INFO[bSelections.contentTypes[0]]
  const aDeliveryInfo = DELIVERY_TYPE_INFO[aSelections.deliveryTypes[0]]
  const bDeliveryInfo = DELIVERY_TYPE_INFO[bSelections.deliveryTypes[0]]

  const winnerName = winner === "battlerA" ? aName : bName
  const loserName = winner === "battlerA" ? bName : aName
  const winPerf = winner === "battlerA" ? aPerf : bPerf
  const losePerf = winner === "battlerA" ? bPerf : aPerf
  const winContent = winner === "battlerA" ? aContentInfo : bContentInfo
  const winDelivery = winner === "battlerA" ? aDeliveryInfo : bDeliveryInfo
  const loseContent = winner === "battlerA" ? bContentInfo : aContentInfo

  // Check for chokes - always mention them, they're important
  if (losePerf.hasChoke && !winPerf.hasChoke) {
    factors.unshift(`${loserName} CHOKED - crowd turned on him`) // Put at front, it's major
  } else if (losePerf.hasChoke && winPerf.hasChoke) {
    factors.unshift(`BOTH CHOKED - trainwreck round`)
  } else if (winPerf.hasChoke && !losePerf.hasChoke) {
    factors.unshift(`${winnerName} CHOKED but still got it back!`) // Rare, notable
  }

  // Check for stumbles - less severe than chokes but still notable
  const winStumbleCount = winPerf.segments.filter(s => s.isStumble).length
  const loseStumbleCount = losePerf.segments.filter(s => s.isStumble).length
  if (loseStumbleCount > winStumbleCount && loseStumbleCount > 0) {
    factors.push(`${loserName} stumbled ${loseStumbleCount}x - lost momentum`)
  } else if (winStumbleCount > loseStumbleCount && winStumbleCount > 0) {
    factors.push(`${winnerName} stumbled ${winStumbleCount}x but recovered`)
  } else if (winStumbleCount > 0 && loseStumbleCount > 0) {
    factors.push(`Both had stumbles - sloppy round`)
  }

  // Check for haymakers
  if (winPerf.hasPeak && !losePerf.hasPeak) {
    factors.push(`${winnerName} had a HAYMAKER that stole the round`)
  } else if (winPerf.hasPeak && losePerf.hasPeak) {
    factors.push(`Both had haymakers but ${winnerName}'s landed harder`)
  }

  // Consistency vs peak comparison
  const winVariance = Math.max(...winPerf.segments.map(s => s.score)) - Math.min(...winPerf.segments.map(s => s.score))
  const loseVariance = Math.max(...losePerf.segments.map(s => s.score)) - Math.min(...losePerf.segments.map(s => s.score))

  if (winVariance < loseVariance && avgDiff < 0.5) {
    factors.push(`${winnerName} was more consistent throughout`)
  }

  // Opening vs Closing momentum
  const winOpening = winPerf.segments[0].score
  const winClosing = winPerf.segments[winPerf.segments.length - 1].score
  const loseOpening = losePerf.segments[0].score
  const loseClosing = losePerf.segments[losePerf.segments.length - 1].score

  if (winClosing > winOpening && loseClosing < loseOpening) {
    factors.push(`${winnerName} built momentum while ${loserName} faded`)
  } else if (winOpening > loseOpening && winOpening >= 7.5) {
    factors.push(`${winnerName} started strong and set the tone`)
  }

  // Content effectiveness
  if (winContent && loseContent) {
    factors.push(`${winContent.name} connected better with the crowd than ${loseContent.name}`)
  }

  // Delivery style
  if (winDelivery) {
    factors.push(`${winDelivery.name} delivery kept the energy up`)
  }

  // Ensure we have at least one factor
  if (factors.length === 0) {
    factors.push(`${winnerName} outperformed across the board`)
  }

  // Generate summary
  let summary = ""
  if (avgDiff >= 1.5) {
    summary = `CLEAR WIN - ${winnerName} dominated this round`
  } else if (avgDiff >= 0.8) {
    summary = `${winnerName} TAKES IT - Solid round edge`
  } else if (avgDiff >= 0.3) {
    summary = `CLOSE ROUND - ${winnerName} edges it`
  } else {
    summary = `DEBATABLE - ${winnerName} gets the nod`
  }

  return { summary, factors }
}

export function BattleSimulatorEnhanced() {
  // Battler selection
  const [battlers, setBattlers] = useState<Battler[]>([])
  const [battlerA, setBattlerA] = useState<Battler | null>(null)
  const [battlerB, setBattlerB] = useState<Battler | null>(null)
  const [controlBoth, setControlBoth] = useState(false)

  // Battle state
  const [phase, setPhase] = useState<BattlePhase>("setup")
  const [currentRound, setCurrentRound] = useState(1)
  const [roundResults, setRoundResults] = useState<RoundResult[]>([])

  // Current round data (prepared during craftRound, used during performance)
  const [currentRoundData, setCurrentRoundData] = useState<RoundResult | null>(null)

  // Content selection for current round
  const [battlerAContent, setBattlerAContent] = useState<ContentType | null>(null)
  const [battlerADelivery, setBattlerADelivery] = useState<DeliveryType | null>(null)
  const [battlerAPerformance, setBattlerAPerformance] = useState<PerformanceType | null>(null)
  const [battlerBContent, setBattlerBContent] = useState<ContentType | null>(null)
  const [battlerBDelivery, setBattlerBDelivery] = useState<DeliveryType | null>(null)
  const [battlerBPerformance, setBattlerBPerformance] = useState<PerformanceType | null>(null)

  // Animation state for segment playback
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [visibleCrowdReactions, setVisibleCrowdReactions] = useState<number[]>([0, 1, 2]) // All 3 always visible
  const [showSegmentScore, setShowSegmentScore] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [skipMode, setSkipMode] = useState(false)

  // Momentum tracking - carries across rounds
  const [momentum, setMomentum] = useState(0) // -100 (B dominant) to +100 (A dominant)
  const [momentumHistory, setMomentumHistory] = useState<number[]>([0]) // Track momentum over time

  // Track A's score for visual comparison (B needs to beat this)
  const [battlerABarScore, setBattlerABarScore] = useState(0) // Running total of A's scores
  const [battlerBCatchupScore, setBattlerBCatchupScore] = useState(0) // B's running total

  // Crowd configuration presets
  type CrowdPreset = "small_room" | "main_stage" | "url_style" | "kotd_style" | "custom"
  const [crowdPreset, setCrowdPreset] = useState<CrowdPreset>("main_stage")
  const [crowdDemographics, setCrowdDemographics] = useState({
    purists: 10,
    street_fans: 20,
    comedy_fans: 15,
    aggression_fans: 25,
    performance_fans: 30,
  })

  // Prep levels (0-10 days each)
  // Writing = affects bar quality (score ceiling)
  // Rehearsal = affects stumble risk (memorization)
  // Research = affects personals effectiveness
  const [battlerAPrepWriting, setBattlerAPrepWriting] = useState(5)
  const [battlerAPrepRehearsal, setBattlerAPrepRehearsal] = useState(5)
  const [battlerAPrepResearch, setBattlerAPrepResearch] = useState(3)
  const [battlerBPrepWriting, setBattlerBPrepWriting] = useState(5)
  const [battlerBPrepRehearsal, setBattlerBPrepRehearsal] = useState(5)
  const [battlerBPrepResearch, setBattlerBPrepResearch] = useState(3)

  // Strategy templates
  const [battlerAStrategy, setBattlerAStrategy] = useState<RoundStrategy | null>(null)
  const [battlerBStrategy, setBattlerBStrategy] = useState<RoundStrategy | null>(null)
  const [showMetrics, setShowMetrics] = useState(true) // Toggle metrics visibility

  // Pre-battle analysis (generated when strategies are selected)
  const [battlerAAnalysis, setBattlerAAnalysis] = useState<PreBattleAnalysis | null>(null)
  const [battlerBAnalysis, setBattlerBAnalysis] = useState<PreBattleAnalysis | null>(null)

  // Round metrics tracking
  const [roundMetricsHistory, setRoundMetricsHistory] = useState<{
    roundNum: number
    battlerAMetrics: RoundMetricsSummary
    battlerBMetrics: RoundMetricsSummary
    winner: 'battlerA' | 'battlerB'
  }[]>([])

  // Venue and coin toss
  const [venueCity, setVenueCity] = useState(VENUE_CITIES[0]) // NYC default
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null) // For venue sprite display
  const [venueCategory, setVenueCategory] = useState<VenueCategory>('small_room')
  const [crowdEnergy, setCrowdEnergy] = useState(50) // 0-100 for silhouette switching
  const [silhouetteHeight, setSilhouetteHeight] = useState(70) // Height in pixels for silhouette
  const [crowdMemberSize, setCrowdMemberSize] = useState(50) // Height in pixels for crowd members
  const [coinTossWinner, setCoinTossWinner] = useState<"A" | "B" | null>(null)
  const [coinTossReason, setCoinTossReason] = useState("")
  const [goesFirst, setGoesFirst] = useState<"A" | "B">("A") // Who performs first each round

  // Crowd preset configurations
  const CROWD_PRESETS = {
    small_room: {
      name: "Small Room Circuit",
      description: "Purist-heavy, appreciate bars over performance",
      demographics: { purists: 45, street_fans: 25, comedy_fans: 15, aggression_fans: 10, performance_fans: 5 },
    },
    main_stage: {
      name: "Main Stage Arena",
      description: "Performance-focused, love energy and showmanship",
      demographics: { purists: 10, street_fans: 20, comedy_fans: 15, aggression_fans: 25, performance_fans: 30 },
    },
    url_style: {
      name: "URL-Style (Street)",
      description: "Street credibility matters most, aggressive energy",
      demographics: { purists: 15, street_fans: 35, comedy_fans: 10, aggression_fans: 30, performance_fans: 10 },
    },
    kotd_style: {
      name: "KOTD-Style (Technical)",
      description: "Appreciate complexity, wordplay, and creativity",
      demographics: { purists: 40, street_fans: 15, comedy_fans: 20, aggression_fans: 10, performance_fans: 15 },
    },
    custom: {
      name: "Custom Mix",
      description: "Configure your own crowd demographics",
      demographics: { purists: 20, street_fans: 20, comedy_fans: 20, aggression_fans: 20, performance_fans: 20 },
    },
  }

  // Fetch battlers on mount
  useEffect(() => {
    async function fetchBattlers() {
      try {
        const res = await fetch("/api/dev/matchmaking?action=overview")
        if (res.ok) {
          const data = await res.json()
          const allBattlers: Battler[] = []
          for (const tier of ["god", "top", "mid", "low"]) {
            const tierBattlers = data.battlers_by_tier?.[tier] || []
            allBattlers.push(
              ...tierBattlers.map((b: any) => ({
                id: b.id,
                name: b.name,
                tier: b.tier,
                region: b.region,
                badges: b.badges || [],
                portrait: b.avatar_url || undefined,
              }))
            )
          }
          setBattlers(allBattlers)
          if (allBattlers.length >= 2) {
            setBattlerA(allBattlers[0])
            setBattlerB(allBattlers[1])
          }
        }
      } catch (err) {
        console.error("Failed to fetch battlers", err)
        // Use mock data if API fails
        const mockBattlers: Battler[] = [
          { id: "1", name: "YOUNG PATTERN", tier: "top", region: "east", badges: ["SCHEME_SPECIALIST", "WORDPLAY_WIZARD", "PEN_GAME_ELITE"] },
          { id: "2", name: "SHOWTIME", tier: "mid", region: "west", badges: ["COMEDY_SPECIALIST", "CROWD_CONTROL_MASTER", "CHARISMATIC"] },
          { id: "3", name: "COLD CASE", tier: "mid", region: "south", badges: ["STREET_BATTLER", "AGGRESSIVE_DELIVERY", "STAGE_DOMINATION"] },
          { id: "4", name: "VERBAL ASSASSIN", tier: "top", region: "east", badges: ["PUNCHLINE_KING", "FREESTYLE_GENIUS", "REBUTTAL_KING"] },
        ]
        setBattlers(mockBattlers)
        setBattlerA(mockBattlers[0])
        setBattlerB(mockBattlers[1])
      }
    }
    fetchBattlers()
  }, [])

  // Reset everything
  const resetBattle = () => {
    setPhase("setup")
    setCurrentRound(1)
    setRoundResults([])
    setCurrentRoundData(null)
    clearSelections()
    setCurrentSegmentIndex(0)
    setVisibleCrowdReactions([])
    setShowSegmentScore(false)
    setIsPlaying(true)
    setSkipMode(false)
    setMomentum(0)
    setMomentumHistory([0])
    setBattlerABarScore(0)
    setBattlerBCatchupScore(0)
    // Reset strategy and metrics state
    setBattlerAStrategy(null)
    setBattlerBStrategy(null)
    setBattlerAAnalysis(null)
    setBattlerBAnalysis(null)
    setRoundMetricsHistory([])
  }

  // Handle strategy selection - auto-fills content/delivery/performance
  const handleStrategySelectA = (strategy: RoundStrategy) => {
    setBattlerAStrategy(strategy)
    // Auto-fill content/delivery/performance from strategy
    if (strategy.contentTypes.length > 0) {
      setBattlerAContent(strategy.contentTypes[0])
    }
    setBattlerADelivery(strategy.deliveryType)
    setBattlerAPerformance(strategy.performanceType)

    // Generate pre-battle analysis with proper attribute format
    const analysis = generatePreBattleAnalysis(
      battlerA?.name || 'Battler A',
      {
        lyricism: 7.5,
        wordplay: 7.5,
        creativity: 7.0,
        stagePresence: 7.0,
        crowdControl: 6.5,
        delivery: 6.5,
        resilience: 6.0,
      },
      {
        writing: battlerAPrepWriting,
        rehearsal: battlerAPrepRehearsal,
        research: battlerAPrepResearch,
        rest: 0,
      },
      battlerA?.badges || [],
      { writing: 0.6, performance: 0.4 },
      6
    )
    setBattlerAAnalysis(analysis)
  }

  const handleStrategySelectB = (strategy: RoundStrategy) => {
    setBattlerBStrategy(strategy)
    // Auto-fill content/delivery/performance from strategy
    if (strategy.contentTypes.length > 0) {
      setBattlerBContent(strategy.contentTypes[0])
    }
    setBattlerBDelivery(strategy.deliveryType)
    setBattlerBPerformance(strategy.performanceType)

    // Generate pre-battle analysis with proper attribute format
    const analysis = generatePreBattleAnalysis(
      battlerB?.name || 'Battler B',
      {
        lyricism: 7.0,
        wordplay: 7.0,
        creativity: 6.5,
        stagePresence: 7.0,
        crowdControl: 6.5,
        delivery: 7.0,
        resilience: 6.5,
      },
      {
        writing: battlerBPrepWriting,
        rehearsal: battlerBPrepRehearsal,
        research: battlerBPrepResearch,
        rest: 0,
      },
      battlerB?.badges || [],
      { writing: 0.6, performance: 0.4 },
      6
    )
    setBattlerBAnalysis(analysis)
  }

  // Apply crowd preset
  const applyCrowdPreset = (preset: CrowdPreset) => {
    setCrowdPreset(preset)
    if (preset !== "custom") {
      setCrowdDemographics(CROWD_PRESETS[preset].demographics)
    }
  }

  const clearSelections = () => {
    setBattlerAContent(null)
    setBattlerADelivery(null)
    setBattlerAPerformance(null)
    setBattlerBContent(null)
    setBattlerBDelivery(null)
    setBattlerBPerformance(null)
  }

  // Start battle from setup - go to coin toss
  const startBattle = () => {
    if (!battlerA || !battlerB) return

    // Select a random venue from the current category
    const categoryVenues = getVenuesByCategory(venueCategory)
    const randomVenue = categoryVenues[Math.floor(Math.random() * categoryVenues.length)]
    setSelectedVenue(randomVenue)
    setCrowdEnergy(50) // Reset crowd energy

    // Calculate coin toss winner (furthest from venue)
    const aCity = BATTLER_CITIES[battlerA.name]
    const bCity = BATTLER_CITIES[battlerB.name]

    const aDistance = aCity ? calculateRegionDistance(aCity.region, venueCity.region) : 1
    const bDistance = bCity ? calculateRegionDistance(bCity.region, venueCity.region) : 1

    let winner: "A" | "B"
    let reason: string

    if (aDistance > bDistance) {
      winner = "A"
      reason = `${aCity?.city || battlerA.name} is further from ${venueCity.name}`
    } else if (bDistance > aDistance) {
      winner = "B"
      reason = `${bCity?.city || battlerB.name} is further from ${venueCity.name}`
    } else {
      // Tie - random
      winner = Math.random() > 0.5 ? "A" : "B"
      reason = "Coin flip (both same distance)"
    }

    setCoinTossWinner(winner)
    setCoinTossReason(reason)
    setGoesFirst("A") // Default, winner will pick
    setPhase("coinToss")
    setCurrentRound(1)
    setRoundResults([])
  }

  // After coin toss winner picks who goes first
  const confirmCoinToss = (first: "A" | "B") => {
    setGoesFirst(first)
    setPhase("craftRound")
  }

  // Lock in round selections and begin battle
  const lockInRound = () => {
    if (!battlerAContent || !battlerADelivery || !battlerAPerformance) return

    const aSelections: RoundSelections = {
      contentTypes: [battlerAContent],
      deliveryTypes: [battlerADelivery],
      performanceTypes: [battlerAPerformance],
    }

    const bSelections: RoundSelections = controlBoth && battlerBContent && battlerBDelivery && battlerBPerformance
      ? {
          contentTypes: [battlerBContent],
          deliveryTypes: [battlerBDelivery],
          performanceTypes: [battlerBPerformance],
        }
      : generateOpponentSelections()

    // Create prep levels from state
    const playerPrep: PrepLevels = {
      writing: battlerAPrepWriting,
      rehearsal: battlerAPrepRehearsal,
      research: battlerAPrepResearch,
    }
    const opponentPrep: PrepLevels = {
      writing: battlerBPrepWriting,
      rehearsal: battlerBPrepRehearsal,
      research: battlerBPrepResearch,
    }

    // Battle format - 3 rounds, 4 segments each (2-minute rounds)
    const format: BattleFormat = {
      rounds: 3,
      segmentsPerRound: 4,
      formatName: "Standard 3-round"
    }

    // Simulate the round with prep values and badges
    const result = simulateMockRoundFull(aSelections, bSelections, {
      segmentsPerRound: 4,
      playerPrep,
      opponentPrep,
      format,
      playerBadges: battlerA?.badges || [],
      opponentBadges: battlerB?.badges || [],
    })

    // Convert to our format
    const roundData: RoundResult = {
      roundNum: currentRound,
      winner: result.roundWinner === "player" ? "battlerA" : "battlerB",
      battlerAPerformance: {
        segments: result.playerSegments.map(s => ({
          segmentIndex: s.segmentIndex,
          score: s.score,
          isPeak: s.isPeak,
          isChoke: s.isChoke,
          isStumble: s.isStumble,
        })),
        averageScore: result.playerResult.averageScore,
        peakScore: result.playerResult.peakScore,
        hasPeak: result.playerSegments.some(s => s.isPeak),
        hasChoke: result.playerSegments.some(s => s.isChoke),
        hasStumble: result.playerSegments.some(s => s.isStumble),
      },
      battlerBPerformance: {
        segments: result.opponentSegments.map(s => ({
          segmentIndex: s.segmentIndex,
          score: s.score,
          isPeak: s.isPeak,
          isChoke: s.isChoke,
          isStumble: s.isStumble,
        })),
        averageScore: result.opponentResult.averageScore,
        peakScore: result.opponentResult.peakScore,
        hasPeak: result.opponentSegments.some(s => s.isPeak),
        hasChoke: result.opponentSegments.some(s => s.isChoke),
        hasStumble: result.opponentSegments.some(s => s.isStumble),
      },
      battlerASelections: aSelections,
      battlerBSelections: bSelections,
    }

    setCurrentRoundData(roundData)
    setCurrentSegmentIndex(0)
    setVisibleCrowdReactions([])
    setShowSegmentScore(false)
    setIsPlaying(true)
    // Reset bar scores for visual momentum meter
    setBattlerABarScore(0)
    setBattlerBCatchupScore(0)
    // Start with whoever won the coin toss (or was picked to go first)
    setPhase(goesFirst === "A" ? "battlerAGoes" : "battlerBGoes")
  }

  // Get current performer's data
  const getCurrentPerformer = () => {
    if (!currentRoundData) return null
    if (phase === "battlerAGoes") {
      return {
        battler: battlerA,
        performance: currentRoundData.battlerAPerformance,
        color: "green",
      }
    } else if (phase === "battlerBGoes") {
      return {
        battler: battlerB,
        performance: currentRoundData.battlerBPerformance,
        color: "red",
      }
    }
    return null
  }

  // Segment playback effect
  useEffect(() => {
    if ((phase !== "battlerAGoes" && phase !== "battlerBGoes") || !isPlaying) return

    const performer = getCurrentPerformer()
    if (!performer || currentSegmentIndex >= performer.performance.segments.length) return

    const segmentDuration = skipMode ? 1000 : 5000
    const reactionInterval = segmentDuration / 4

    // Keep all 3 crowd reactions visible - they stay on screen like looking into the crowd
    setVisibleCrowdReactions([0, 1, 2])
    setShowSegmentScore(false)

    const timers: NodeJS.Timeout[] = []

    // Show segment score and update momentum
    timers.push(setTimeout(() => {
      setShowSegmentScore(true)

      // Update momentum based on current segment
      const segment = performer.performance.segments[currentSegmentIndex]
      if (!currentRoundData) return

      const aSegment = currentRoundData.battlerAPerformance.segments[currentSegmentIndex]
      const bSegment = currentRoundData.battlerBPerformance.segments[currentSegmentIndex]

      if (phase === "battlerAGoes") {
        // A is performing - track their cumulative score for the visual bar
        const segmentsSoFar = currentRoundData.battlerAPerformance.segments.slice(0, currentSegmentIndex + 1)
        const runningAvg = segmentsSoFar.reduce((sum, s) => sum + s.score, 0) / segmentsSoFar.length
        // Map score (5.0-10.0 range) to position (0-100)
        const position = Math.max(0, Math.min(100, (runningAvg - 5) * 20))
        setBattlerABarScore(position)
      } else if (phase === "battlerBGoes") {
        // B is performing - track their cumulative score for the visual catchup
        const bSegmentsSoFar = currentRoundData.battlerBPerformance.segments.slice(0, currentSegmentIndex + 1)
        const bRunningAvg = bSegmentsSoFar.reduce((sum, s) => sum + s.score, 0) / bSegmentsSoFar.length
        // Map score (5.0-10.0 range) to position (0-100)
        const bPosition = Math.max(0, Math.min(100, (bRunningAvg - 5) * 20))
        setBattlerBCatchupScore(bPosition)

        // Also update momentum for the narrative labels
        const scoreDiff = aSegment.score - bSegment.score
        let segmentShift = scoreDiff * 12 // Each 0.1 point diff = 1.2 momentum swing

        // Choke has massive impact
        if (aSegment.isChoke && !bSegment.isChoke) segmentShift -= 25
        if (bSegment.isChoke && !aSegment.isChoke) segmentShift += 25

        // Haymaker bonus when opponent doesn't have one
        if (aSegment.isPeak && !bSegment.isPeak) segmentShift += 10
        if (bSegment.isPeak && !aSegment.isPeak) segmentShift -= 10

        // Apply shift with small carryover (momentum matters but doesn't snowball too hard)
        setMomentum(prev => {
          const carryover = prev * 0.1 // Only 10% carryover
          const newMomentum = Math.max(-100, Math.min(100, prev + segmentShift + carryover))
          setMomentumHistory(h => [...h, newMomentum])
          return newMomentum
        })

        // Update crowd energy based on segment quality (for silhouette switching)
        const avgScore = (aSegment.score + bSegment.score) / 2
        const hasPeak = aSegment.isPeak || bSegment.isPeak
        const hasChoke = aSegment.isChoke || bSegment.isChoke

        setCrowdEnergy(prev => {
          let change = (avgScore - 7) * 8 // Each point above/below 7 = ±8 energy
          if (hasPeak) change += 15 // Haymaker gets crowd hype
          if (hasChoke) change -= 20 // Choke kills energy
          return Math.max(0, Math.min(100, prev + change))
        })
      }
    }, reactionInterval * 3))

    // Move to next segment or transition
    timers.push(setTimeout(() => {
      const nextIndex = currentSegmentIndex + 1
      if (nextIndex < performer.performance.segments.length) {
        setCurrentSegmentIndex(nextIndex)
      } else {
        // Performance complete - determine who goes next based on goesFirst
        const isFirstPerformer = (goesFirst === "A" && phase === "battlerAGoes") ||
                                  (goesFirst === "B" && phase === "battlerBGoes")

        if (isFirstPerformer) {
          // First performer done, now second performer goes
          setCurrentSegmentIndex(0)
          setVisibleCrowdReactions([])
          setShowSegmentScore(false)
          setMomentum(0)
          // Switch to the other battler
          setPhase(phase === "battlerAGoes" ? "battlerBGoes" : "battlerAGoes")
        } else {
          // Both done, show round result
          setPhase("roundResult")
        }
      }
    }, segmentDuration))

    return () => timers.forEach(clearTimeout)
  }, [phase, currentSegmentIndex, isPlaying, skipMode, currentRoundData, goesFirst])

  // Skip current performance
  const skipPerformance = () => {
    if (!currentRoundData) return

    const isFirstPerformer = (goesFirst === "A" && phase === "battlerAGoes") ||
                              (goesFirst === "B" && phase === "battlerBGoes")

    if (phase === "battlerAGoes") {
      // Calculate and set A's FINAL score for the momentum bar
      const aSegments = currentRoundData.battlerAPerformance.segments
      const aFinalAvg = aSegments.reduce((sum, s) => sum + s.score, 0) / aSegments.length
      const aFinalPosition = Math.max(0, Math.min(100, (aFinalAvg - 5) * 20))
      setBattlerABarScore(aFinalPosition)

      if (isFirstPerformer) {
        // A went first, now B goes
        setCurrentSegmentIndex(0)
        setVisibleCrowdReactions([])
        setShowSegmentScore(false)
        setPhase("battlerBGoes")
      } else {
        // A went second, round is done
        setPhase("roundResult")
      }
    } else if (phase === "battlerBGoes") {
      // Calculate and set B's FINAL score for the momentum bar
      const bSegments = currentRoundData.battlerBPerformance.segments
      const bFinalAvg = bSegments.reduce((sum, s) => sum + s.score, 0) / bSegments.length
      const bFinalPosition = Math.max(0, Math.min(100, (bFinalAvg - 5) * 20))
      setBattlerBCatchupScore(bFinalPosition)

      if (isFirstPerformer) {
        // B went first, now A goes
        setCurrentSegmentIndex(0)
        setVisibleCrowdReactions([])
        setShowSegmentScore(false)
        setPhase("battlerAGoes")
      } else {
        // B went second, round is done
        setPhase("roundResult")
      }
    }
  }

  // Continue to next round or end battle
  const continueToNextRound = () => {
    if (!currentRoundData) return

    // Add current round to results
    const newResults = [...roundResults, currentRoundData]
    setRoundResults(newResults)

    // In battle rap, ALL 3 rounds are always performed
    // Winner is determined by best of 3 at the end
    if (newResults.length >= 3) {
      setPhase("battleComplete")
    } else {
      // Continue to next round
      setCurrentRound(prev => prev + 1)
      setCurrentRoundData(null)
      clearSelections()

      // Apply momentum decay between rounds
      // Momentum carries over but decays by 30% - the crowd "resets" somewhat
      // But if you DOMINATED (momentum >= 60), you keep more momentum
      setMomentum(prev => {
        const decayFactor = Math.abs(prev) >= 60 ? 0.80 : 0.70 // Dominant positions decay less
        const newMomentum = prev * decayFactor
        setMomentumHistory(h => [...h, newMomentum])
        return newMomentum
      })

      setPhase("craftRound")
    }
  }

  // Calculate wins
  const aWins = roundResults.filter(r => r.winner === "battlerA").length
  const bWins = roundResults.filter(r => r.winner === "battlerB").length

  // Get crowd reaction with sprite path - uses crowd demographics for varied sprites
  const getCrowdReaction = (score: number, isPeak: boolean, isChoke: boolean = false, isStumble: boolean = false) => {
    const reactionType = mapReactionToSpriteType(score, isPeak, isChoke, isStumble)
    // Randomly pick a demographic for visual variety
    const demographics: ('black' | 'white' | 'mixed')[] = ['black', 'black', 'black', 'white', 'mixed']
    const demographic = demographics[Math.floor(Math.random() * demographics.length)]
    const spritePath = getCrowdSpritePath(reactionType, demographic)
    const label = REACTION_LABELS[reactionType] || "..."
    return { spritePath, label, reactionType }
  }

  const canLockIn = battlerAContent && battlerADelivery && battlerAPerformance &&
    (!controlBoth || (battlerBContent && battlerBDelivery && battlerBPerformance))

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-orange-500 flex items-center gap-2">
          <Swords className="w-5 h-5" /> BATTLE SIMULATOR
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* SETUP PHASE */}
        {phase === "setup" && (
          <div className="space-y-4">
            {/* VS Header with Portraits */}
            <div className="flex items-center justify-between gap-4 py-4 px-6 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex flex-col items-center gap-2">
                <BattlerPortrait battler={battlerA} size="lg" borderColor="green" />
                <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Battler A</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-zinc-600">VS</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BattlerPortrait battler={battlerB} size="lg" borderColor="red" />
                <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Battler B</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 uppercase block mb-1">Battler A</label>
                <select
                  value={battlerA?.id || ""}
                  onChange={(e) => setBattlerA(battlers.find((b) => b.id === e.target.value) || null)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100"
                >
                  {battlers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.tier})
                    </option>
                  ))}
                </select>
                {/* Badge Display for Battler A */}
                {battlerA?.badges && battlerA.badges.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {battlerA.badges.map((badge, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[10px] text-green-300"
                        title={badge.replace(/_/g, ' ')}
                      >
                        {badge.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase block mb-1">Battler B</label>
                <select
                  value={battlerB?.id || ""}
                  onChange={(e) => setBattlerB(battlers.find((b) => b.id === e.target.value) || null)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100"
                >
                  {battlers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.tier})
                    </option>
                  ))}
                </select>
                {/* Badge Display for Battler B */}
                {battlerB?.badges && battlerB.badges.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {battlerB.badges.map((badge, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[10px] text-red-300"
                        title={badge.replace(/_/g, ' ')}
                      >
                        {badge.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={controlBoth}
                onChange={(e) => setControlBoth(e.target.checked)}
                className="accent-orange-500"
              />
              <span className="text-sm text-zinc-300">Control both sides (pick content for both battlers)</span>
            </label>

            {/* VENUE SELECTION */}
            <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
              <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Mic className="w-4 h-4" /> Battle Venue
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {VENUE_CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => setVenueCity(city)}
                    className={`px-3 py-2 text-xs rounded border ${
                      venueCity.name === city.name
                        ? "bg-orange-600 border-orange-500 text-white"
                        : "bg-zinc-700 border-zinc-600 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <div className="font-bold">{city.name}</div>
                    <div className="text-zinc-400 text-[10px]">{city.region}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-xs text-zinc-500">
                <span>
                  {battlerA?.name}: {BATTLER_CITIES[battlerA?.name || ""]?.city || "Unknown"}
                </span>
                <span>
                  {battlerB?.name}: {BATTLER_CITIES[battlerB?.name || ""]?.city || "Unknown"}
                </span>
              </div>

              {/* Venue Category */}
              <div className="mt-4 pt-4 border-t border-zinc-700">
                <p className="text-xs text-zinc-500 mb-2">Venue Type</p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(VENUE_CATEGORIES) as VenueCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setVenueCategory(cat)}
                      className={`px-2 py-2 text-xs rounded border ${
                        venueCategory === cat
                          ? "bg-orange-600 border-orange-500 text-white"
                          : "bg-zinc-700 border-zinc-600 text-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      <div className="font-bold capitalize">{VENUE_CATEGORIES[cat].label}</div>
                      <div className="text-[10px] text-zinc-400">{VENUE_CATEGORIES[cat].capacityRange}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-2 italic">{VENUE_CATEGORIES[venueCategory].description}</p>
              </div>
            </div>

            {/* CROWD CONFIGURATION */}
            <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
              <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> Crowd Configuration
              </h4>

              {/* Preset buttons */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                {(Object.keys(CROWD_PRESETS) as CrowdPreset[]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => applyCrowdPreset(preset)}
                    className={`px-2 py-1 text-xs rounded border ${
                      crowdPreset === preset
                        ? "bg-orange-600 border-orange-500 text-white"
                        : "bg-zinc-700 border-zinc-600 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {CROWD_PRESETS[preset].name.split(" ")[0]}
                  </button>
                ))}
              </div>

              <p className="text-xs text-zinc-400 mb-3">{CROWD_PRESETS[crowdPreset].description}</p>

              {/* Demographics display */}
              <div className="grid grid-cols-5 gap-1 text-xs">
                <div className="text-center">
                  <div className="text-zinc-500">Purists</div>
                  <div className="text-zinc-300 font-bold">{crowdDemographics.purists}%</div>
                </div>
                <div className="text-center">
                  <div className="text-zinc-500">Street</div>
                  <div className="text-zinc-300 font-bold">{crowdDemographics.street_fans}%</div>
                </div>
                <div className="text-center">
                  <div className="text-zinc-500">Comedy</div>
                  <div className="text-zinc-300 font-bold">{crowdDemographics.comedy_fans}%</div>
                </div>
                <div className="text-center">
                  <div className="text-zinc-500">Aggro</div>
                  <div className="text-zinc-300 font-bold">{crowdDemographics.aggression_fans}%</div>
                </div>
                <div className="text-center">
                  <div className="text-zinc-500">Perform</div>
                  <div className="text-zinc-300 font-bold">{crowdDemographics.performance_fans}%</div>
                </div>
              </div>
            </div>

            {/* PREP CONFIGURATION */}
            <div className="grid grid-cols-2 gap-4">
              {/* Battler A Prep */}
              <div className="bg-zinc-800 p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">
                  {battlerA?.name || "Battler A"} Prep
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Writing</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={battlerAPrepWriting}
                        onChange={(e) => setBattlerAPrepWriting(parseInt(e.target.value))}
                        className="w-20 accent-green-500"
                      />
                      <span className="text-xs text-zinc-300 w-4">{battlerAPrepWriting}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Rehearsal</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={battlerAPrepRehearsal}
                        onChange={(e) => setBattlerAPrepRehearsal(parseInt(e.target.value))}
                        className="w-20 accent-green-500"
                      />
                      <span className="text-xs text-zinc-300 w-4">{battlerAPrepRehearsal}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Research</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={battlerAPrepResearch}
                        onChange={(e) => setBattlerAPrepResearch(parseInt(e.target.value))}
                        className="w-20 accent-green-500"
                      />
                      <span className="text-xs text-zinc-300 w-4">{battlerAPrepResearch}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Battler B Prep */}
              <div className="bg-zinc-800 p-4 rounded-lg border-l-4 border-red-500">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">
                  {battlerB?.name || "Battler B"} Prep
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Writing</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={battlerBPrepWriting}
                        onChange={(e) => setBattlerBPrepWriting(parseInt(e.target.value))}
                        className="w-20 accent-red-500"
                      />
                      <span className="text-xs text-zinc-300 w-4">{battlerBPrepWriting}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Rehearsal</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={battlerBPrepRehearsal}
                        onChange={(e) => setBattlerBPrepRehearsal(parseInt(e.target.value))}
                        className="w-20 accent-red-500"
                      />
                      <span className="text-xs text-zinc-300 w-4">{battlerBPrepRehearsal}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Research</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={battlerBPrepResearch}
                        onChange={(e) => setBattlerBPrepResearch(parseInt(e.target.value))}
                        className="w-20 accent-red-500"
                      />
                      <span className="text-xs text-zinc-300 w-4">{battlerBPrepResearch}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={startBattle} className="w-full bg-orange-600 hover:bg-orange-500">
              <Play className="w-4 h-4 mr-2" /> Start Battle
            </Button>
          </div>
        )}

        {/* COIN TOSS PHASE */}
        {phase === "coinToss" && (
          <div className="space-y-6">
            {/* Venue Header */}
            <div className="text-center py-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">BATTLE LOCATION</p>
              <p className="text-2xl font-black text-orange-500">{venueCity.name}</p>
              <p className="text-xs text-zinc-400">{venueCity.region}</p>
            </div>

            {/* Coin Toss Result */}
            <div className="bg-zinc-800 p-6 rounded-lg border-2 border-yellow-600/50">
              <div className="text-center">
                <p className="text-xs text-yellow-500 uppercase tracking-widest mb-2">COIN TOSS</p>
                <p className="text-lg text-zinc-400 mb-4">{coinTossReason}</p>

                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className={`text-center p-4 rounded-lg ${coinTossWinner === "A" ? "bg-green-900/50 border-2 border-green-500" : "bg-zinc-700/50 border border-zinc-600"}`}>
                    <div className="flex justify-center mb-2">
                      <BattlerPortrait
                        battler={battlerA}
                        size="lg"
                        borderColor={coinTossWinner === "A" ? "yellow" : "green"}
                      />
                    </div>
                    <p className={`text-sm font-bold ${coinTossWinner === "A" ? "text-green-400" : "text-zinc-400"}`}>
                      {battlerA?.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {BATTLER_CITIES[battlerA?.name || ""]?.city || "Unknown"}
                    </p>
                    {coinTossWinner === "A" && (
                      <p className="text-xs text-yellow-400 mt-2 font-bold animate-pulse">🪙 DECIDES!</p>
                    )}
                  </div>

                  <div className="text-3xl font-black text-zinc-600">VS</div>

                  <div className={`text-center p-4 rounded-lg ${coinTossWinner === "B" ? "bg-red-900/50 border-2 border-red-500" : "bg-zinc-700/50 border border-zinc-600"}`}>
                    <div className="flex justify-center mb-2">
                      <BattlerPortrait
                        battler={battlerB}
                        size="lg"
                        borderColor={coinTossWinner === "B" ? "yellow" : "red"}
                      />
                    </div>
                    <p className={`text-sm font-bold ${coinTossWinner === "B" ? "text-red-400" : "text-zinc-400"}`}>
                      {battlerB?.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {BATTLER_CITIES[battlerB?.name || ""]?.city || "Unknown"}
                    </p>
                    {coinTossWinner === "B" && (
                      <p className="text-xs text-yellow-400 mt-2 font-bold animate-pulse">🪙 DECIDES!</p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-zinc-300 mb-4">
                  <span className={coinTossWinner === "A" ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                    {coinTossWinner === "A" ? battlerA?.name : battlerB?.name}
                  </span>
                  {" "}calls heads or tails and wins! Who goes first?
                </p>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => confirmCoinToss(coinTossWinner === "A" ? "A" : "B")}
                    className="bg-orange-600 hover:bg-orange-500 px-6"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {coinTossWinner === "A" ? battlerA?.name : battlerB?.name} goes first
                  </Button>
                  <Button
                    onClick={() => confirmCoinToss(coinTossWinner === "A" ? "B" : "A")}
                    variant="outline"
                    className="border-zinc-600 hover:border-zinc-500 px-6"
                  >
                    {coinTossWinner === "A" ? battlerB?.name : battlerA?.name} goes first
                  </Button>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="text-center text-xs text-zinc-500">
              <p>In battle rap, the person who travels furthest picks heads or tails.</p>
              <p>The winner chooses to go first and set the bar, or go second and respond.</p>
            </div>
          </div>
        )}

        {/* CRAFT ROUND PHASE */}
        {phase === "craftRound" && (
          <div className="space-y-4">
            {/* Round indicator - Battle Rap Style */}
            <div className="text-center py-4 bg-zinc-800 rounded-lg">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">CRAFT YOUR ROUND</p>
              <p className="text-3xl font-black text-orange-500">ROUND {currentRound}</p>

              {/* Previous round results */}
              {roundResults.length > 0 && (
                <div className="mt-3 space-y-1">
                  {roundResults.map((round) => (
                    <p key={round.roundNum} className={`text-sm font-bold ${
                      round.winner === "battlerA" ? "text-green-400" : "text-red-400"
                    }`}>
                      {round.winner === "battlerA"
                        ? `${battlerA?.name} wins Round ${round.roundNum}`
                        : `${battlerB?.name} wins Round ${round.roundNum}`}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Metrics Toggle */}
            <div className="flex items-center justify-end gap-2 text-xs">
              <span className="text-zinc-500">Show Metrics</span>
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className={`px-2 py-1 rounded ${showMetrics ? 'bg-orange-600 text-white' : 'bg-zinc-700 text-zinc-400'}`}
              >
                {showMetrics ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Strategy Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Battler A Strategy */}
              <StrategySelector
                battlerName={battlerA?.name || 'Battler A'}
                selectedStrategyId={battlerAStrategy?.id || null}
                onStrategySelect={handleStrategySelectA}
                opponentStrategy={battlerBStrategy}
                borderColor="green"
                showForecast={showMetrics}
                badges={battlerA?.badges || []}
              />

              {/* Battler B Strategy (if controlling both) */}
              {controlBoth ? (
                <StrategySelector
                  battlerName={battlerB?.name || 'Battler B'}
                  selectedStrategyId={battlerBStrategy?.id || null}
                  onStrategySelect={handleStrategySelectB}
                  opponentStrategy={battlerAStrategy}
                  borderColor="red"
                  showForecast={showMetrics}
                  badges={battlerB?.badges || []}
                />
              ) : (
                <div className="bg-zinc-800/50 rounded border-l-4 border-red-500/50 p-3">
                  <p className="text-sm text-zinc-500 italic">
                    {battlerB?.name} will select strategy automatically (AI opponent)
                  </p>
                </div>
              )}
            </div>

            {/* Effectiveness Forecast Panel */}
            {showMetrics && battlerAStrategy && (controlBoth ? battlerBStrategy : true) && (
              <EffectivenessForecastPanel
                strategyA={battlerAStrategy}
                strategyB={battlerBStrategy || ROUND_STRATEGIES[Math.floor(Math.random() * ROUND_STRATEGIES.length)]}
                battlerAName={battlerA?.name || 'Battler A'}
                battlerBName={battlerB?.name || 'Battler B'}
              />
            )}

            {/* Pre-Battle Analysis (if metrics are on) */}
            {showMetrics && battlerAAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PreBattleAnalysisPanel
                  analysis={battlerAAnalysis}
                  borderColor="green"
                />
                {controlBoth && battlerBAnalysis && (
                  <PreBattleAnalysisPanel
                    analysis={battlerBAnalysis}
                    borderColor="red"
                  />
                )}
              </div>
            )}

            {/* Custom Content Override (collapsible) */}
            <details className="bg-zinc-800/50 rounded border border-zinc-700">
              <summary className="px-4 py-2 cursor-pointer text-xs text-zinc-500 hover:text-zinc-400">
                ⚙️ Custom Content Override (Advanced)
              </summary>
              <div className="p-4 space-y-4 border-t border-zinc-700">
                {/* Battler A Custom Selection */}
                <div className="border-l-4 border-green-500/50 pl-3">
                  <h4 className="text-xs font-bold text-green-400 mb-2">{battlerA?.name}'s Custom Content</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Content Type</p>
                      <select
                        value={battlerAContent || ""}
                        onChange={(e) => setBattlerAContent(e.target.value as ContentType)}
                        className="w-full bg-zinc-700 border border-zinc-600 px-2 py-1 text-xs rounded"
                      >
                        <option value="">Select...</option>
                        {CONTENT_TYPES.map((ct) => (
                          <option key={ct} value={ct}>{CONTENT_TYPE_INFO[ct].name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Delivery</p>
                      <select
                        value={battlerADelivery || ""}
                        onChange={(e) => setBattlerADelivery(e.target.value as DeliveryType)}
                        className="w-full bg-zinc-700 border border-zinc-600 px-2 py-1 text-xs rounded"
                      >
                        <option value="">Select...</option>
                        {DELIVERY_TYPES.map((dt) => (
                          <option key={dt} value={dt}>{DELIVERY_TYPE_INFO[dt].name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Performance</p>
                      <select
                        value={battlerAPerformance || ""}
                        onChange={(e) => setBattlerAPerformance(e.target.value as PerformanceType)}
                        className="w-full bg-zinc-700 border border-zinc-600 px-2 py-1 text-xs rounded"
                      >
                        <option value="">Select...</option>
                        {PERFORMANCE_TYPES.map((pt) => (
                          <option key={pt} value={pt}>{PERFORMANCE_TYPE_INFO[pt].name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Battler B Custom Selection (if controlling both) */}
                {controlBoth && (
                  <div className="border-l-4 border-red-500/50 pl-3">
                    <h4 className="text-xs font-bold text-red-400 mb-2">{battlerB?.name}'s Custom Content</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Content Type</p>
                        <select
                          value={battlerBContent || ""}
                          onChange={(e) => setBattlerBContent(e.target.value as ContentType)}
                          className="w-full bg-zinc-700 border border-zinc-600 px-2 py-1 text-xs rounded"
                        >
                          <option value="">Select...</option>
                          {CONTENT_TYPES.map((ct) => (
                            <option key={ct} value={ct}>{CONTENT_TYPE_INFO[ct].name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Delivery</p>
                        <select
                          value={battlerBDelivery || ""}
                          onChange={(e) => setBattlerBDelivery(e.target.value as DeliveryType)}
                          className="w-full bg-zinc-700 border border-zinc-600 px-2 py-1 text-xs rounded"
                        >
                          <option value="">Select...</option>
                          {DELIVERY_TYPES.map((dt) => (
                            <option key={dt} value={dt}>{DELIVERY_TYPE_INFO[dt].name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Performance</p>
                        <select
                          value={battlerBPerformance || ""}
                          onChange={(e) => setBattlerBPerformance(e.target.value as PerformanceType)}
                          className="w-full bg-zinc-700 border border-zinc-600 px-2 py-1 text-xs rounded"
                        >
                          <option value="">Select...</option>
                          {PERFORMANCE_TYPES.map((pt) => (
                            <option key={pt} value={pt}>{PERFORMANCE_TYPE_INFO[pt].name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </details>

            <div className="flex gap-2">
              <Button
                onClick={lockInRound}
                disabled={!canLockIn}
                className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50"
              >
                <Swords className="w-4 h-4 mr-2" /> LOCK IN & BATTLE
              </Button>
              <Button variant="outline" onClick={resetBattle}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* PERFORMANCE PHASES (battlerAGoes or battlerBGoes) */}
        {(phase === "battlerAGoes" || phase === "battlerBGoes") && currentRoundData && (
          <div className="space-y-4">
            {/* WHO'S PERFORMING */}
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-6 rounded-lg ${
                phase === "battlerAGoes"
                  ? "bg-green-500/20 border-2 border-green-500/50"
                  : "bg-red-500/20 border-2 border-red-500/50"
              }`}
            >
              {/* Top/Bottom of Round indicator - like baseball innings */}
              <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">
                {(goesFirst === "A" && phase === "battlerAGoes") || (goesFirst === "B" && phase === "battlerBGoes") ? "TOP" : "BOTTOM"} OF ROUND {currentRound}
              </p>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">NOW PERFORMING</p>

              {/* Portrait and Name */}
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <BattlerPortrait
                    battler={phase === "battlerAGoes" ? battlerA : battlerB}
                    size="xl"
                    borderColor={phase === "battlerAGoes" ? "green" : "red"}
                  />
                </motion.div>
                <h2 className={`text-3xl font-black uppercase ${
                  phase === "battlerAGoes" ? "text-green-400" : "text-red-400"
                }`}>
                  {phase === "battlerAGoes" ? battlerA?.name : battlerB?.name}
                </h2>
              </div>

              <p className="text-sm text-zinc-500 mt-2">
                Segment {currentSegmentIndex + 1} of {
                  phase === "battlerAGoes"
                    ? currentRoundData.battlerAPerformance.segments.length
                    : currentRoundData.battlerBPerformance.segments.length
                }
              </p>
            </motion.div>

            {/* MOMENTUM METER - Face-based visual showing first performer's bar and second's chase */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zinc-800 rounded-lg p-4"
            >
              {phase === "battlerAGoes" ? (
                // A IS PERFORMING
                <>
                  <div className="text-center mb-3">
                    <span className="text-xs text-green-400 uppercase tracking-wider font-bold">
                      {goesFirst === "A"
                        ? `${battlerA?.name} IS SETTING THE BAR`
                        : `${battlerA?.name} MUST CATCH ${battlerB?.name?.toUpperCase()}`
                      }
                    </span>
                  </div>

                  {/* Score track with A's face moving */}
                  <div className="relative h-12 bg-zinc-900 rounded-lg overflow-visible border border-zinc-700">
                    {/* Scale markers */}
                    <div className="absolute inset-0 flex justify-between items-center px-2">
                      <span className="text-[10px] text-zinc-600">5.0</span>
                      <span className="text-[10px] text-zinc-600">6.0</span>
                      <span className="text-[10px] text-zinc-600">7.0</span>
                      <span className="text-[10px] text-zinc-600">8.0</span>
                      <span className="text-[10px] text-zinc-600">9.0</span>
                      <span className="text-[10px] text-zinc-600">10</span>
                    </div>

                    {/* A's trail (showing progress) */}
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-green-600/30 to-green-500/60 rounded-full"
                      style={{ left: "4px" }}
                      animate={{ width: `${Math.max(0, battlerABarScore - 2)}%` }}
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    />

                    {/* A's face avatar */}
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 border-3 border-green-400 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-green-500/40 z-20"
                      animate={{ left: `calc(${battlerABarScore}% - 20px)` }}
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    >
                      {battlerA?.name?.charAt(0) || "A"}
                    </motion.div>
                  </div>

                  {/* Current score display */}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-zinc-500">Building...</span>
                    <span className="text-sm font-bold text-green-400">
                      ~{(5 + (battlerABarScore / 20)).toFixed(1)}
                    </span>
                  </div>
                </>
              ) : (
                // B IS PERFORMING
                <>
                  <div className="text-center mb-3">
                    <span className="text-xs text-red-400 uppercase tracking-wider font-bold">
                      {goesFirst === "B"
                        ? `${battlerB?.name} IS SETTING THE BAR`
                        : `${battlerB?.name} MUST CATCH ${battlerA?.name?.toUpperCase()}`
                      }
                    </span>
                  </div>

                  {/* Score track with both faces */}
                  <div className="relative h-12 bg-zinc-900 rounded-lg overflow-visible border border-zinc-700">
                    {/* Scale markers */}
                    <div className="absolute inset-0 flex justify-between items-center px-2">
                      <span className="text-[10px] text-zinc-600">5.0</span>
                      <span className="text-[10px] text-zinc-600">6.0</span>
                      <span className="text-[10px] text-zinc-600">7.0</span>
                      <span className="text-[10px] text-zinc-600">8.0</span>
                      <span className="text-[10px] text-zinc-600">9.0</span>
                      <span className="text-[10px] text-zinc-600">10</span>
                    </div>

                    {/* A's final position marker (the bar to beat) */}
                    <motion.div
                      className="absolute top-0 bottom-0 w-1 bg-green-500/50 z-10"
                      style={{ left: `${battlerABarScore}%` }}
                    />

                    {/* B's trail */}
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-red-600/30 to-red-500/60 rounded-full"
                      style={{ left: "4px" }}
                      animate={{ width: `${Math.max(0, battlerBCatchupScore - 2)}%` }}
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    />

                    {/* A's face (fixed at their bar position, slightly faded) */}
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-green-600/60 to-green-800/60 border-2 border-green-500/50 flex items-center justify-center text-white/70 font-bold text-xs z-10"
                      style={{ left: `calc(${battlerABarScore}% - 16px)` }}
                    >
                      {battlerA?.name?.charAt(0) || "A"}
                    </motion.div>

                    {/* B's face (moving to catch up) */}
                    <motion.div
                      className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-3 flex items-center justify-center text-white font-black text-sm z-20 ${
                        battlerBCatchupScore > battlerABarScore
                          ? "bg-gradient-to-br from-yellow-500 to-orange-600 border-yellow-400 shadow-lg shadow-yellow-500/40"
                          : battlerBCatchupScore >= battlerABarScore - 5
                          ? "bg-gradient-to-br from-red-500 to-red-700 border-red-400 shadow-lg shadow-red-500/40"
                          : "bg-gradient-to-br from-red-600 to-red-800 border-red-500/50 shadow-lg shadow-red-500/30"
                      }`}
                      animate={{
                        left: `calc(${battlerBCatchupScore}% - 20px)`,
                        scale: battlerBCatchupScore > battlerABarScore ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    >
                      {battlerB?.name?.charAt(0) || "B"}
                    </motion.div>
                  </div>

                  {/* Status display */}
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400 font-bold">{getShortName(battlerA?.name)}: {(5 + (battlerABarScore / 20)).toFixed(1)}</span>
                    </div>
                    <div className="text-center">
                      {battlerBCatchupScore > battlerABarScore ? (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-xs font-black text-yellow-400 uppercase"
                        >
                          PASSED!
                        </motion.span>
                      ) : battlerBCatchupScore >= battlerABarScore - 5 ? (
                        <span className="text-xs font-bold text-orange-400 uppercase">CATCHING UP...</span>
                      ) : (
                        <span className="text-xs font-bold text-red-400 uppercase">CHASING...</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400 font-bold">{getShortName(battlerB?.name)}: {(5 + (battlerBCatchupScore / 20)).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Fighting uphill / taking over indicators */}
                  {battlerBCatchupScore < battlerABarScore - 15 && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-xs text-orange-400 mt-2 font-bold"
                    >
                      {battlerB?.name} FIGHTING UPHILL!
                    </motion.p>
                  )}
                  {battlerBCatchupScore > battlerABarScore + 10 && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-xs text-yellow-400 mt-2 font-bold"
                    >
                      {battlerB?.name} IS TAKING OVER!
                    </motion.p>
                  )}
                </>
              )}
            </motion.div>

            {/* Current segment display */}
            {(() => {
              const performer = getCurrentPerformer()
              if (!performer) return null
              const segment = performer.performance.segments[currentSegmentIndex]
              if (!segment) return null

              return (
                <div className="bg-zinc-800 rounded-lg p-6">
                  {/* Segment progress bar */}
                  <div className="flex gap-2 mb-4">
                    {performer.performance.segments.map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full ${
                          i < currentSegmentIndex
                            ? performer.color === "green" ? "bg-green-500" : "bg-red-500"
                            : i === currentSegmentIndex
                            ? "bg-orange-500 animate-pulse"
                            : "bg-zinc-700"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Segment score (when revealed) */}
                  <AnimatePresence>
                    {showSegmentScore && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className={`text-center py-4 rounded-lg mb-4 ${
                          segment.isPeak
                            ? "bg-yellow-500/20 border-2 border-yellow-500/50"
                            : segment.isChoke
                            ? "bg-red-900/30 border-2 border-red-900/50"
                            : "bg-zinc-700/50"
                        }`}
                      >
                        <p className="text-5xl font-black">{segment.score.toFixed(1)}</p>
                        {segment.isPeak && (
                          <p className="text-yellow-400 font-bold mt-2 flex items-center justify-center gap-2">
                            <Star className="w-4 h-4" /> HAYMAKER! <Star className="w-4 h-4" />
                          </p>
                        )}
                        {segment.isChoke && (
                          <p className="text-red-400 font-bold mt-2">CHOKE!</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Layered Crowd Display: Venue -> Silhouette -> Crowd Members */}
                  <div className="bg-zinc-900 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-2 border-b border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">
                        {selectedVenue?.name || "CROWD REACTION"}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-500">Sil:</span>
                          <input
                            type="range"
                            min="30"
                            max="300"
                            value={silhouetteHeight}
                            onChange={(e) => setSilhouetteHeight(Number(e.target.value))}
                            className="w-16 h-1"
                          />
                          <span className="text-orange-400 w-8">{silhouetteHeight}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-500">Ppl:</span>
                          <input
                            type="range"
                            min="20"
                            max="200"
                            value={crowdMemberSize}
                            onChange={(e) => setCrowdMemberSize(Number(e.target.value))}
                            className="w-16 h-1"
                          />
                          <span className="text-orange-400 w-8">{crowdMemberSize}</span>
                        </div>
                      </div>
                    </div>
                    {/* Layered container - 16:9 aspect ratio for venue backgrounds */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {/* Layer 1: Venue Background */}
                      {selectedVenue && (
                        <div className="absolute inset-0">
                          <Image
                            src={selectedVenue.sprite}
                            alt={selectedVenue.name}
                            fill
                            className="object-cover pixelated opacity-60"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                        </div>
                      )}

                      {/* Layer 2: Crowd Silhouette - behind crowd members */}
                      <div className="absolute bottom-0 left-0 right-0 z-0 flex items-end justify-center">
                        <img
                          src={getCrowdSilhouette(crowdEnergy)}
                          alt="Crowd silhouette"
                          className="pixelated opacity-80"
                          style={{
                            imageRendering: 'pixelated',
                            height: `${silhouetteHeight}px`,
                            width: 'auto',
                            maxWidth: '100%'
                          }}
                        />
                      </div>

                      {/* Layer 3: Individual Crowd Reactions - in FRONT of silhouette */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-around items-end px-4 z-10">
                        {[0, 1, 2].map((idx) => {
                          const reaction = getCrowdReaction(segment.score, segment.isPeak, segment.isChoke, segment.isStumble)
                          return (
                            <AnimatePresence key={idx}>
                              {visibleCrowdReactions.includes(idx) && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ type: "spring", duration: 0.3 }}
                                >
                                  <div className="relative" style={{ width: `${crowdMemberSize * 0.8}px`, height: `${crowdMemberSize}px` }}>
                                    <Image
                                      src={reaction.spritePath}
                                      alt={reaction.label}
                                      fill
                                      className="object-contain object-bottom pixelated"
                                      style={{ imageRendering: 'pixelated' }}
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant="outline"
                className="flex-1"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                onClick={skipPerformance}
                variant="outline"
                className="flex-1"
              >
                <SkipForward className="w-4 h-4 mr-2" /> Skip to {phase === "battlerAGoes" ? battlerB?.name : "Results"}
              </Button>
              <Button
                onClick={() => setSkipMode(!skipMode)}
                variant={skipMode ? "default" : "outline"}
                className={skipMode ? "bg-orange-600" : ""}
              >
                <FastForward className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ROUND RESULT PHASE */}
        {phase === "roundResult" && currentRoundData && (() => {
          const roundExplanation = explainRoundResult(
            currentRoundData.winner,
            currentRoundData.battlerAPerformance,
            currentRoundData.battlerBPerformance,
            currentRoundData.battlerASelections,
            currentRoundData.battlerBSelections,
            battlerA?.name || "A",
            battlerB?.name || "B"
          )

          const aSegments = currentRoundData.battlerAPerformance.segments
          const bSegments = currentRoundData.battlerBPerformance.segments
          const aContent = CONTENT_TYPE_INFO[currentRoundData.battlerASelections.contentTypes[0]]
          const bContent = CONTENT_TYPE_INFO[currentRoundData.battlerBSelections.contentTypes[0]]
          const aDelivery = DELIVERY_TYPE_INFO[currentRoundData.battlerASelections.deliveryTypes[0]]
          const bDelivery = DELIVERY_TYPE_INFO[currentRoundData.battlerBSelections.deliveryTypes[0]]
          const aPerformance = PERFORMANCE_TYPE_INFO[currentRoundData.battlerASelections.performanceTypes[0]]
          const bPerformance = PERFORMANCE_TYPE_INFO[currentRoundData.battlerBSelections.performanceTypes[0]]

          return (
            <div className="space-y-4">
              {/* WHY THEY WON - Main Summary */}
              <div className={`text-center py-6 rounded-lg ${
                currentRoundData.winner === "battlerA"
                  ? "bg-green-500/20 border-2 border-green-500/50"
                  : currentRoundData.winner === "battlerB"
                  ? "bg-red-500/20 border-2 border-red-500/50"
                  : "bg-zinc-800 border-2 border-zinc-700"
              }`}>
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">ROUND {currentRound}</p>

                {/* Winner portrait with VS display */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className={`transition-opacity ${currentRoundData.winner === "battlerA" ? "opacity-100" : "opacity-40"}`}>
                    <BattlerPortrait
                      battler={battlerA}
                      size="lg"
                      borderColor={currentRoundData.winner === "battlerA" ? "green" : "zinc"}
                    />
                  </div>
                  <span className="text-2xl font-black text-zinc-600">VS</span>
                  <div className={`transition-opacity ${currentRoundData.winner === "battlerB" ? "opacity-100" : "opacity-40"}`}>
                    <BattlerPortrait
                      battler={battlerB}
                      size="lg"
                      borderColor={currentRoundData.winner === "battlerB" ? "red" : "zinc"}
                    />
                  </div>
                </div>

                <h2 className={`text-2xl font-black uppercase ${
                  currentRoundData.winner === "battlerA" ? "text-green-400" :
                  currentRoundData.winner === "battlerB" ? "text-red-400" : "text-zinc-400"
                }`}>
                  {roundExplanation.summary}
                </h2>
                <p className="text-3xl font-black mt-2">
                  {aWins + (currentRoundData.winner === "battlerA" ? 1 : 0)} - {bWins + (currentRoundData.winner === "battlerB" ? 1 : 0)}
                </p>
              </div>

              {/* WHY - Key Factors */}
              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">WHY?</h4>
                <ul className="space-y-2">
                  {roundExplanation.factors.map((factor, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ROUND METRICS PANEL (if metrics enabled) */}
              {showMetrics && (
                <RoundMetricsPanel
                  battlerAMetrics={calculateRoundMetrics(
                    currentRoundData.battlerAPerformance.segments.map(s => s.score),
                    currentRoundData.battlerAPerformance.segments.map(() => 70),
                    1.0
                  )}
                  battlerBMetrics={calculateRoundMetrics(
                    currentRoundData.battlerBPerformance.segments.map(s => s.score),
                    currentRoundData.battlerBPerformance.segments.map(() => 70),
                    1.0
                  )}
                  battlerAName={battlerA?.name || 'Battler A'}
                  battlerBName={battlerB?.name || 'Battler B'}
                  roundNumber={currentRound}
                  winner={currentRoundData.winner}
                />
              )}

              {/* SEGMENT BREAKDOWN - Opening & Closing */}
              <div className="grid grid-cols-2 gap-4">
                {/* Battler A Breakdown */}
                <div className={`bg-zinc-800 p-4 rounded border-l-4 ${
                  currentRoundData.winner === "battlerA" ? "border-green-500" : "border-zinc-700"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <BattlerPortrait battler={battlerA} size="sm" borderColor="green" />
                    <h4 className="text-sm font-bold text-green-400">{battlerA?.name}</h4>
                    {currentRoundData.winner === "battlerA" && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">WIN</span>
                    )}
                  </div>

                  {/* Content Choices */}
                  <div className="mb-3 pb-3 border-b border-zinc-700">
                    <p className="text-xs text-zinc-500 uppercase mb-1">Content</p>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-300">{aContent?.name}</p>
                      <p className="text-xs text-zinc-500">{aDelivery?.name} • {aPerformance?.name}</p>
                    </div>
                  </div>

                  {/* Opening Segment */}
                  <div className="mb-2">
                    <p className="text-xs text-zinc-400">
                      {describeSegment(aSegments[0], true, aSegments.length === 1)}
                    </p>
                  </div>

                  {/* Middle segments summary if more than 2 */}
                  {aSegments.length > 2 && (
                    <div className="mb-2">
                      <p className="text-xs text-zinc-500">
                        MID: {aSegments.slice(1, -1).map(s => s.score.toFixed(1)).join(" → ")}
                      </p>
                    </div>
                  )}

                  {/* Closing Segment (if different from opening) */}
                  {aSegments.length > 1 && (
                    <div className="mb-3">
                      <p className="text-xs text-zinc-400">
                        {describeSegment(aSegments[aSegments.length - 1], false, true)}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="pt-2 border-t border-zinc-700 flex justify-between text-xs">
                    <span className="text-zinc-500">AVG: <span className="text-zinc-300 font-bold">{currentRoundData.battlerAPerformance.averageScore.toFixed(1)}</span></span>
                    <span className="text-zinc-500">PEAK: <span className="text-yellow-400 font-bold">{currentRoundData.battlerAPerformance.peakScore.toFixed(1)}</span></span>
                  </div>

                  {/* Haymaker/Choke indicators */}
                  {currentRoundData.battlerAPerformance.hasPeak && (
                    <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                      <Star className="w-3 h-3" /> HAYMAKER
                    </p>
                  )}
                  {currentRoundData.battlerAPerformance.hasChoke && (
                    <p className="text-xs text-red-400 mt-2">CHOKED</p>
                  )}
                </div>

                {/* Battler B Breakdown */}
                <div className={`bg-zinc-800 p-4 rounded border-l-4 ${
                  currentRoundData.winner === "battlerB" ? "border-red-500" : "border-zinc-700"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <BattlerPortrait battler={battlerB} size="sm" borderColor="red" />
                    <h4 className="text-sm font-bold text-red-400">{battlerB?.name}</h4>
                    {currentRoundData.winner === "battlerB" && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">WIN</span>
                    )}
                  </div>

                  {/* Content Choices */}
                  <div className="mb-3 pb-3 border-b border-zinc-700">
                    <p className="text-xs text-zinc-500 uppercase mb-1">Content</p>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-300">{bContent?.name}</p>
                      <p className="text-xs text-zinc-500">{bDelivery?.name} • {bPerformance?.name}</p>
                    </div>
                  </div>

                  {/* Opening Segment */}
                  <div className="mb-2">
                    <p className="text-xs text-zinc-400">
                      {describeSegment(bSegments[0], true, bSegments.length === 1)}
                    </p>
                  </div>

                  {/* Middle segments summary if more than 2 */}
                  {bSegments.length > 2 && (
                    <div className="mb-2">
                      <p className="text-xs text-zinc-500">
                        MID: {bSegments.slice(1, -1).map(s => s.score.toFixed(1)).join(" → ")}
                      </p>
                    </div>
                  )}

                  {/* Closing Segment (if different from opening) */}
                  {bSegments.length > 1 && (
                    <div className="mb-3">
                      <p className="text-xs text-zinc-400">
                        {describeSegment(bSegments[bSegments.length - 1], false, true)}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="pt-2 border-t border-zinc-700 flex justify-between text-xs">
                    <span className="text-zinc-500">AVG: <span className="text-zinc-300 font-bold">{currentRoundData.battlerBPerformance.averageScore.toFixed(1)}</span></span>
                    <span className="text-zinc-500">PEAK: <span className="text-yellow-400 font-bold">{currentRoundData.battlerBPerformance.peakScore.toFixed(1)}</span></span>
                  </div>

                  {/* Haymaker/Choke indicators */}
                  {currentRoundData.battlerBPerformance.hasPeak && (
                    <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                      <Star className="w-3 h-3" /> HAYMAKER
                    </p>
                  )}
                  {currentRoundData.battlerBPerformance.hasChoke && (
                    <p className="text-xs text-red-400 mt-2">CHOKED</p>
                  )}
                </div>
              </div>

              {/* SEGMENT TIMELINE */}
              <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Segment Timeline</p>
                <div className="flex gap-2">
                  {aSegments.map((seg, i) => {
                    const bSeg = bSegments[i]
                    const aWon = seg.score > bSeg?.score
                    const bWon = bSeg?.score > seg.score
                    return (
                      <div key={i} className="flex-1 text-center">
                        <p className="text-xs text-zinc-600 mb-1">S{i + 1}</p>
                        <div className={`text-xs font-bold py-1 rounded ${
                          aWon ? "bg-green-500/20 text-green-400" :
                          bWon ? "bg-red-500/20 text-red-400" : "bg-zinc-700 text-zinc-400"
                        }`}>
                          {seg.score.toFixed(1)} - {bSeg?.score.toFixed(1) || "-"}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* MOMENTUM GOING INTO NEXT ROUND - show for rounds 1 and 2 */}
              {currentRound < 3 && (
                <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase ${momentum >= 15 ? "text-green-400" : "text-zinc-500"}`}>
                      {battlerA?.name}
                    </span>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider">MOMENTUM INTO ROUND {currentRound + 1}</span>
                    <span className={`text-xs font-bold uppercase ${momentum <= -15 ? "text-red-400" : "text-zinc-500"}`}>
                      {battlerB?.name}
                    </span>
                  </div>

                  {/* Compact momentum bar */}
                  <div className="relative h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-600 z-10" />
                    <motion.div
                      className={`absolute top-0 bottom-0 ${momentum >= 0 ? "bg-gradient-to-r from-green-600 to-green-400" : "bg-gradient-to-l from-red-600 to-red-400"}`}
                      style={{
                        left: momentum >= 0 ? "50%" : `${50 + (momentum / 2)}%`,
                        width: `${Math.abs(momentum) / 2}%`,
                      }}
                    />
                    <motion.div
                      className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 z-20 ${
                        Math.abs(momentum) >= 60
                          ? momentum > 0 ? "bg-green-400 border-green-200" : "bg-red-400 border-red-200"
                          : "bg-zinc-300 border-white"
                      }`}
                      style={{ left: `calc(${50 + (momentum / 2)}% - 6px)` }}
                    />
                  </div>

                  <p className={`text-xs text-center mt-2 font-bold ${
                    Math.abs(momentum) >= 35
                      ? momentum > 0 ? "text-green-400" : "text-red-400"
                      : "text-zinc-500"
                  }`}>
                    {Math.abs(momentum) >= 60
                      ? `${momentum > 0 ? battlerA?.name : battlerB?.name} DOMINANT - ${momentum > 0 ? battlerB?.name : battlerA?.name} FIGHTING UPHILL`
                      : Math.abs(momentum) >= 35
                      ? `${momentum > 0 ? battlerA?.name : battlerB?.name} has momentum`
                      : "EVEN - Both battlers on equal footing"}
                  </p>
                </div>
              )}

              <Button onClick={continueToNextRound} className="w-full bg-orange-600 hover:bg-orange-500">
                <ChevronRight className="w-4 h-4 mr-2" />
                {currentRound >= 3 ? "See Final Results" : `Continue to Round ${currentRound + 1}`}
              </Button>
            </div>
          )
        })()}

        {/* BATTLE COMPLETE PHASE */}
        {phase === "battleComplete" && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Profile pictures with winner highlight */}
            <div className="flex items-center justify-center gap-8 pt-4">
              {/* Battler A profile */}
              <motion.div
                className={`text-center relative ${aWins > bWins ? "scale-110" : aWins < bWins ? "opacity-50" : ""}`}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: aWins < bWins ? 0.5 : 1 }}
                transition={{ type: "spring", stiffness: 80 }}
              >
                <div className="relative">
                  <div className={aWins > bWins ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-zinc-900 rounded-full" : ""}>
                    <BattlerPortrait
                      battler={battlerA}
                      size="xl"
                      borderColor={aWins > bWins ? "yellow" : "green"}
                    />
                  </div>
                  {aWins > bWins && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2"
                    >
                      <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
                    </motion.div>
                  )}
                </div>
                <p className={`text-sm font-bold mt-2 ${aWins > bWins ? "text-green-400" : "text-zinc-400"}`}>
                  {getShortName(battlerA?.name)}
                </p>
                <p className="text-2xl font-black text-green-400">{aWins}</p>
              </motion.div>

              {/* VS divider */}
              <div className="text-center">
                <span className="text-3xl font-black text-zinc-600">VS</span>
              </div>

              {/* Battler B profile */}
              <motion.div
                className={`text-center relative ${bWins > aWins ? "scale-110" : bWins < aWins ? "opacity-50" : ""}`}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: bWins < aWins ? 0.5 : 1 }}
                transition={{ type: "spring", stiffness: 80 }}
              >
                <div className="relative">
                  <div className={bWins > aWins ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-zinc-900 rounded-full" : ""}>
                    <BattlerPortrait
                      battler={battlerB}
                      size="xl"
                      borderColor={bWins > aWins ? "yellow" : "red"}
                    />
                  </div>
                  {bWins > aWins && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -left-2"
                    >
                      <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
                    </motion.div>
                  )}
                </div>
                <p className={`text-sm font-bold mt-2 ${bWins > aWins ? "text-red-400" : "text-zinc-400"}`}>
                  {getShortName(battlerB?.name)}
                </p>
                <p className="text-2xl font-black text-red-400">{bWins}</p>
              </motion.div>
            </div>

            {/* Winner announcement */}
            <div className="text-center py-4">
              <h2 className={`text-3xl font-black uppercase ${
                aWins > bWins ? "text-green-400" :
                bWins > aWins ? "text-red-400" : "text-zinc-400"
              }`}>
                {aWins > bWins
                  ? `${battlerA?.name} WINS!`
                  : bWins > aWins
                  ? `${battlerB?.name} WINS!`
                  : "DRAW!"}
              </h2>
              <p className="text-lg font-bold text-zinc-500 mt-1">
                {aWins} - {bWins}
              </p>
            </div>

            {/* Detailed Round breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Round Breakdown</h4>
              {roundResults.map((round, i) => {
                const roundExpl = explainRoundResult(
                  round.winner,
                  round.battlerAPerformance,
                  round.battlerBPerformance,
                  round.battlerASelections,
                  round.battlerBSelections,
                  battlerA?.name || "A",
                  battlerB?.name || "B"
                )

                const aContent = CONTENT_TYPE_INFO[round.battlerASelections.contentTypes[0]]
                const bContent = CONTENT_TYPE_INFO[round.battlerBSelections.contentTypes[0]]

                return (
                  <div
                    key={i}
                    className={`p-4 rounded-lg ${
                      round.winner === "battlerA"
                        ? "bg-green-500/10 border-l-4 border-green-500"
                        : round.winner === "battlerB"
                        ? "bg-red-500/10 border-l-4 border-red-500"
                        : "bg-zinc-700/50 border-l-4 border-zinc-600"
                    }`}
                  >
                    {/* Round header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black uppercase">Round {round.roundNum}</span>
                      <span className={`text-sm font-bold ${
                        round.winner === "battlerA" ? "text-green-400" : "text-red-400"
                      }`}>
                        {round.winner === "battlerA" ? battlerA?.name : battlerB?.name}
                      </span>
                    </div>

                    {/* Score comparison - clearly labeled with names */}
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <div className="flex-1">
                        <div className={`flex items-center gap-2 ${round.winner === "battlerA" ? "font-bold" : ""}`}>
                          <span className="text-green-400">{getShortName(battlerA?.name)}</span>
                          <span className={round.winner === "battlerA" ? "text-green-400 font-black" : "text-zinc-400"}>
                            {round.battlerAPerformance.averageScore.toFixed(1)}
                          </span>
                          <span className="text-zinc-600 text-xs">({aContent?.name})</span>
                        </div>
                      </div>
                      <div className="text-zinc-600 text-xs">vs</div>
                      <div className="flex-1 text-right">
                        <div className={`flex items-center justify-end gap-2 ${round.winner === "battlerB" ? "font-bold" : ""}`}>
                          <span className="text-zinc-600 text-xs">({bContent?.name})</span>
                          <span className={round.winner === "battlerB" ? "text-red-400 font-black" : "text-zinc-400"}>
                            {round.battlerBPerformance.averageScore.toFixed(1)}
                          </span>
                          <span className="text-red-400">{getShortName(battlerB?.name)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Summary of WHY */}
                    <p className="text-xs text-zinc-400 mb-2">{roundExpl.summary}</p>

                    {/* Key factor */}
                    <div className="text-xs text-zinc-500 flex items-start gap-1">
                      <span className="text-orange-500">•</span>
                      <span>{roundExpl.factors[0]}</span>
                    </div>

                    {/* Haymaker/Choke badges */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {round.battlerAPerformance.hasPeak && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                          {getShortName(battlerA?.name)} HAYMAKER
                        </span>
                      )}
                      {round.battlerBPerformance.hasPeak && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                          {getShortName(battlerB?.name)} HAYMAKER
                        </span>
                      )}
                      {round.battlerAPerformance.hasChoke && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                          {getShortName(battlerA?.name)} CHOKED
                        </span>
                      )}
                      {round.battlerBPerformance.hasChoke && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                          {getShortName(battlerB?.name)} CHOKED
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* BATTLE SUMMARY METRICS (if metrics enabled) */}
            {showMetrics && roundResults.length > 0 && (
              <BattleSummaryPanel
                battlerAName={battlerA?.name || 'Battler A'}
                battlerBName={battlerB?.name || 'Battler B'}
                roundResults={roundResults.map((round, i) => ({
                  roundNum: round.roundNum,
                  battlerAMetrics: calculateRoundMetrics(
                    round.battlerAPerformance.segments.map(s => s.score),
                    round.battlerAPerformance.segments.map(() => 70),
                    1.0
                  ),
                  battlerBMetrics: calculateRoundMetrics(
                    round.battlerBPerformance.segments.map(s => s.score),
                    round.battlerBPerformance.segments.map(() => 70),
                    1.0
                  ),
                  winner: round.winner,
                }))}
                winner={aWins > bWins ? 'battlerA' : bWins > aWins ? 'battlerB' : 'battlerA'}
              />
            )}

            {/* Crowd Demographic Breakdown */}
            <div className="mt-6 bg-zinc-800 rounded-lg p-4">
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" /> How The Crowd Scored It
              </h4>

              <div className="space-y-3">
                {Object.entries(crowdDemographics).map(([demoKey, percentage]) => {
                  if (percentage === 0) return null

                  const prefs = DEMOGRAPHIC_PREFERENCES[demoKey]
                  if (!prefs) return null

                  // Calculate this demographic's scores across all rounds
                  let demoATotal = 0
                  let demoBTotal = 0
                  let demoAWins = 0
                  let demoBWins = 0

                  roundResults.forEach((round) => {
                    const demoAScore = calculateDemographicScore(
                      round.battlerASelections,
                      round.battlerAPerformance.averageScore,
                      demoKey
                    )
                    const demoBScore = calculateDemographicScore(
                      round.battlerBSelections,
                      round.battlerBPerformance.averageScore,
                      demoKey
                    )
                    demoATotal += demoAScore
                    demoBTotal += demoBScore
                    // Use overall round winner as tiebreaker when demo scores are equal
                    if (demoAScore > demoBScore) demoAWins++
                    else if (demoBScore > demoAScore) demoBWins++
                    else if (round.winner === "battlerA") demoAWins++
                    else demoBWins++
                  })

                  const demoAAvg = demoATotal / roundResults.length
                  const demoBAvg = demoBTotal / roundResults.length
                  // No ties - use total average as final tiebreaker
                  const demoWinner = demoAWins > demoBWins ? "A" : demoBWins > demoAWins ? "B" : (demoAAvg >= demoBAvg ? "A" : "B")

                  return (
                    <div
                      key={demoKey}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        demoWinner === "A"
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-red-500/10 border border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{prefs.emoji}</span>
                        <div>
                          <p className="text-sm font-bold text-zinc-200">{prefs.label}</p>
                          <p className="text-xs text-zinc-500">{percentage}% of crowd</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Score comparison */}
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm">
                            <span className={demoWinner === "A" ? "text-green-400 font-bold" : "text-zinc-400"}>
                              {demoAAvg.toFixed(1)}
                            </span>
                            <span className="text-zinc-600">-</span>
                            <span className={demoWinner === "B" ? "text-red-400 font-bold" : "text-zinc-400"}>
                              {demoBAvg.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500">
                            {demoWinner === "A"
                              ? `${getShortName(battlerA?.name)} ${demoAWins}-${demoBWins}`
                              : demoWinner === "B"
                              ? `${getShortName(battlerB?.name)} ${demoBWins}-${demoAWins}`
                              : "Split decision"}
                          </p>
                        </div>

                        {/* Winner badge */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                            demoWinner === "A"
                              ? "bg-green-500/20 text-green-400"
                              : demoWinner === "B"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-zinc-600/20 text-zinc-400"
                          }`}
                        >
                          {demoWinner === "A"
                            ? battlerA?.name?.charAt(0)
                            : demoWinner === "B"
                            ? battlerB?.name?.charAt(0)
                            : "="}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Overall breakdown summary */}
              <div className="mt-4 pt-4 border-t border-zinc-700">
                <p className="text-xs text-zinc-500 text-center">
                  Crowd preset: <span className="text-zinc-400">{CROWD_PRESETS[crowdPreset].name}</span>
                </p>
              </div>
            </div>

            <Button onClick={resetBattle} className="w-full bg-orange-600 hover:bg-orange-500">
              <RefreshCw className="w-4 h-4 mr-2" /> New Battle
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
