"use client"

import { useState } from "react"
import { Scale, Zap, AlertTriangle, Target, TrendingUp, Award, Users, Trophy, Info, ChevronDown, ChevronRight } from "lucide-react"

// All game balance constants in one place for visibility and tuning
const SIMULATION_CONFIG = {
  SEGMENT_VARIANCE: 0.15,
  SCORE_FLOOR: 1.0,
  SCORE_CEILING: 10.0,
  CHOKE_BASE_PROBABILITY: 0.015,
  CHOKE_MINIMUM: 0.007,
  CHOKE_MAXIMUM: 0.25,
  CHOKE_SCORE_MULTIPLIER: 0.15,
  CHOKE_RESILIENCE_FACTOR: 0.008,
  CHOKE_PREP_REDUCTION: 0.003,
  STUMBLE_BASE_PROBABILITY: 0.050,
  STUMBLE_MINIMUM: 0.010,
  STUMBLE_MAXIMUM: 0.15,
  STUMBLE_SCORE_MULTIPLIER: 0.85,
  STUMBLE_RECOVERY_MULTIPLIER: 0.90,
  STUMBLE_PREP_REDUCTION: 0.005,
  PREP_EFFECT_MULTIPLIER: 0.20,
  NO_SHOW_PENALTY: 0.5,
  COUNTER_TRIGGERED_MULTIPLIER: 1.5,
  COUNTER_MISSED_MULTIPLIER: 0.5,
  COUNTER_BASE_TRIGGER_CHANCE: 0.40,
  ROUND_JUDGING_AVERAGE_WEIGHT: 0.40,
  ROUND_JUDGING_PEAK_WEIGHT: 0.35,
  ROUND_JUDGING_CROWD_WEIGHT: 0.25,
  ROUND_JUDGING_CROWD_SCALE: 10,
  DECISION_BODYBAG_THRESHOLD: 3.0,
  DECISION_CLASSIC_THRESHOLD: 2.0,
  DECISION_CLASSIC_CROWD_MIN: 70,
  RATING_K_FACTOR: 32,
}

const PROGRESSION_CONFIG = {
  HIGH_SCORE_THRESHOLD: 7.0,
  HIGH_CROWD_THRESHOLD: 75,
  HAYMAKER_THRESHOLD: 8.5,
  BASE_WRITING_GAIN: 0.05,
  BASE_PERFORMANCE_GAIN: 0.05,
  BASE_RESILIENCE_GAIN: 0.05,
  WINNER_BONUS: 0.02,
  HAYMAKER_BONUS: 0.1,
  LOSER_PENALTY: 0.5,
  ATTRIBUTE_CAP: 10.0,
  MAX_TOTAL_GAIN: 0.3,
}

const GRUDGE_CONFIG = {
  WINNER_GOOD_BATTLE: -5,
  WINNER_RUN_IT_BACK: 20,
  WINNER_THAT_WAS_EASY: 30,
  WINNER_CAREER_OVER: 50,
  LOSER_YOU_GOT_ME: -10,
  LOSER_REMATCH_NOW: 20,
  LOSER_YOU_GOT_LUCKY: 25,
  LOSER_I_GOT_ROBBED: 35,
  INTENSITY_MAX: 100,
  INTENSITY_HEATED: 50,
  INTENSITY_GRUDGE_MATCH: 75,
  INTENSITY_LEGENDARY: 90,
}

const BADGE_CHOKE_EFFECTS = {
  FREESTYLE_GENIUS: -0.025,
  CLUTCH_PERFORMER: -0.04,
  RESILIENT_BATTLER: -0.03,
  RESPECTED_VETERAN: -0.02,
  REBUTTAL_KING: -0.02,
  KNOWN_CHOKER: 0.07,
  CHOKER: 0.02,
  AGGRESSIVE: 0.01,
  SPEED_RAPPING: 0.015,
  UNRELIABLE: 0.02,
  SUBSTANCE_ISSUES: 0.06,
  HEALTH_ISSUES: 0.05,
  WEAK_CHIN: 0.04,
}

const MEDIA_REACTION_EFFECTS = {
  FACTS: 2,
  CAP: -2,
  FIRE: 3,
  MID: -1,
  DEBATABLE: 1,
}

const DUCKING_CONFIG = {
  ELO_RANGE_MIN: 100,
  DUCKING_BADGE_THRESHOLD: 3,
  CALL_OUT_EXPIRY_DAYS: 30,
  REPEAT_BATTLE_COOLDOWN_DAYS: 60,
}

type ConfigSection = "simulation" | "progression" | "grudge" | "badges" | "media" | "ducking"

interface ConfigDetail {
  value: number
  unit?: string
  description: string
  increaseMeans: string
  decreaseMeans: string
  affectedBy: string[]
  affects: string[]
  formula?: string
  example?: string
}

// Detailed explanations for each config
const CONFIG_DETAILS: Record<string, ConfigDetail> = {
  // === SIMULATION - SEGMENT SCORING ===
  SEGMENT_VARIANCE: {
    value: SIMULATION_CONFIG.SEGMENT_VARIANCE,
    unit: "%",
    description: "Random variance applied to each segment's base score. Creates natural performance fluctuation.",
    increaseMeans: "More unpredictable battles. Upsets more likely. Inconsistent battlers hurt more.",
    decreaseMeans: "More predictable outcomes. Better stats almost always win. Less exciting.",
    affectedBy: ["Badge: Unorthodox (+40%)", "Badge: Consistent Writer (-40%)", "Badge: Inconsistent Performer (+80%)"],
    affects: ["Segment scores", "Consistency rating", "Peak vs average spread"],
    formula: "segment_score = base_score × (1 ± SEGMENT_VARIANCE × random)",
    example: "Base 7.0 score can become 5.95-8.05 with ±15% variance"
  },
  SCORE_FLOOR: {
    value: SIMULATION_CONFIG.SCORE_FLOOR,
    description: "Minimum possible score for any segment. Prevents complete 0s.",
    increaseMeans: "Raises minimum performance. Bad segments aren't as punishing.",
    decreaseMeans: "Allows worse performances. Chokes/stumbles more devastating.",
    affectedBy: ["Nothing - this is a hard floor"],
    affects: ["Minimum segment score", "Average score calculations"],
    example: "Even if you choke, you can't score below 1.0"
  },
  SCORE_CEILING: {
    value: SIMULATION_CONFIG.SCORE_CEILING,
    description: "Maximum possible score for any segment. The 'perfect performance' cap.",
    increaseMeans: "Allows superhuman performances. GOD tier battlers more dominant.",
    decreaseMeans: "Caps excellence. Even GOD tier can't dominate as hard.",
    affectedBy: ["Nothing - this is a hard ceiling"],
    affects: ["Maximum segment score", "Peak score calculations", "Haymaker potential"],
    example: "A perfect segment maxes at 10.0 regardless of attributes"
  },

  // === CHOKE MECHANICS ===
  CHOKE_BASE_PROBABILITY: {
    value: SIMULATION_CONFIG.CHOKE_BASE_PROBABILITY,
    unit: "% per segment",
    description: "Base chance to choke on ANY segment. This is before modifiers.",
    increaseMeans: "Chokes more common. Game feels more stressful/unpredictable.",
    decreaseMeans: "Chokes rarer. Reliability matters less. Less dramatic moments.",
    affectedBy: [
      "Resilience attribute (-0.8% per point above 5)",
      "Writing prep days (-0.3% per day)",
      "Rest prep days (indirect via resilience buff)",
      "All badge choke modifiers"
    ],
    affects: ["Choke frequency", "Round outcomes", "Drama factor"],
    formula: "choke_chance = max(CHOKE_MINIMUM, min(CHOKE_MAXIMUM, BASE - (resilience-5)×0.008 - prep_days×0.003 + badge_modifiers))",
    example: "1.5% base × 6 segments = ~9% per round before modifiers"
  },
  CHOKE_MINIMUM: {
    value: SIMULATION_CONFIG.CHOKE_MINIMUM,
    unit: "% per segment",
    description: "Floor for choke probability. Even GOD tier battlers can choke.",
    increaseMeans: "Nobody is safe. Even Clutch Performers can choke.",
    decreaseMeans: "Elite battlers become nearly immune to choking.",
    affectedBy: ["Nothing - this is a hard floor"],
    affects: ["Minimum choke rate for anyone (~4% per battle with 6 segments)"],
    example: "Even with 10 resilience + 10 prep days + Clutch Performer, you still have 0.7% per segment chance"
  },
  CHOKE_MAXIMUM: {
    value: SIMULATION_CONFIG.CHOKE_MAXIMUM,
    unit: "% per segment",
    description: "Cap for choke probability. Prevents guaranteed chokes.",
    increaseMeans: "Known Chokers become even more unreliable. Could be 100%+ without cap.",
    decreaseMeans: "Even the worst chokers have a fighting chance.",
    affectedBy: ["Nothing - this is a hard ceiling"],
    affects: ["Maximum choke rate"],
    example: "Known Choker (+7%) + Substance Issues (+6%) would be 14.5% per segment, capped at 25%"
  },
  CHOKE_SCORE_MULTIPLIER: {
    value: SIMULATION_CONFIG.CHOKE_SCORE_MULTIPLIER,
    description: "Score multiplier when choked. 0.15 = you get 15% of your normal score (85% penalty).",
    increaseMeans: "Chokes less devastating. Can still win round despite choking.",
    decreaseMeans: "Chokes become instant round losses. More punishing.",
    affectedBy: ["Nothing - flat penalty"],
    affects: ["Segment score when choked", "Round outcomes after choke"],
    formula: "choked_score = normal_score × CHOKE_SCORE_MULTIPLIER",
    example: "Normal 8.0 segment becomes 1.2 when choked (8.0 × 0.15)"
  },
  CHOKE_RESILIENCE_FACTOR: {
    value: SIMULATION_CONFIG.CHOKE_RESILIENCE_FACTOR,
    unit: "% reduction per resilience point",
    description: "How much each resilience point above 5 reduces choke chance.",
    increaseMeans: "Resilience attribute becomes more valuable. High resilience = much safer.",
    decreaseMeans: "Resilience matters less. Everyone chokes at similar rates.",
    affectedBy: ["Nothing - this is the multiplier"],
    affects: ["Value of resilience attribute", "Build diversity"],
    formula: "reduction = (resilience - 5) × CHOKE_RESILIENCE_FACTOR",
    example: "Resilience 9 gives (9-5)×0.8% = 3.2% reduction per segment"
  },
  CHOKE_PREP_REDUCTION: {
    value: SIMULATION_CONFIG.CHOKE_PREP_REDUCTION,
    unit: "% reduction per prep day",
    description: "How much each day of WRITING prep reduces choke chance.",
    increaseMeans: "Prep matters more for reliability. Well-prepared battlers very safe.",
    decreaseMeans: "Prep matters less. Freestylers not at huge disadvantage.",
    affectedBy: ["Only writing prep days count"],
    affects: ["Value of writing prep", "Freestyle Genius balance"],
    formula: "reduction = writing_prep_days × CHOKE_PREP_REDUCTION",
    example: "10 days writing prep = 3% total reduction per segment"
  },

  // === STUMBLE MECHANICS ===
  STUMBLE_BASE_PROBABILITY: {
    value: SIMULATION_CONFIG.STUMBLE_BASE_PROBABILITY,
    unit: "% per segment",
    description: "Base chance to stumble (minor mistake). More common than chokes but less severe.",
    increaseMeans: "More imperfect performances. Consistency matters more.",
    decreaseMeans: "Cleaner performances. Less texture to battles.",
    affectedBy: [
      "Resilience attribute",
      "Performance prep days (-0.5% per day)",
      "Badge: Freestyle Genius (-0.5%)",
      "Badge: Substance Issues (+1%)"
    ],
    affects: ["Stumble frequency", "Consistency scores"],
    formula: "stumble_chance = max(MIN, min(MAX, BASE - prep×0.005 + badge_mods))",
    example: "5% base × 6 segments = ~30% chance of at least one stumble per round"
  },
  STUMBLE_SCORE_MULTIPLIER: {
    value: SIMULATION_CONFIG.STUMBLE_SCORE_MULTIPLIER,
    description: "Score multiplier on stumble. 0.85 = 15% penalty (much less than choke).",
    increaseMeans: "Stumbles barely matter. Almost no penalty.",
    decreaseMeans: "Stumbles become more punishing. Consistency super important.",
    affectedBy: ["Nothing - flat penalty"],
    affects: ["Segment score when stumbled"],
    formula: "stumbled_score = normal_score × STUMBLE_SCORE_MULTIPLIER",
    example: "Normal 8.0 segment becomes 6.8 when stumbled (8.0 × 0.85)"
  },
  STUMBLE_RECOVERY_MULTIPLIER: {
    value: SIMULATION_CONFIG.STUMBLE_RECOVERY_MULTIPLIER,
    description: "Score multiplier if you recover well from stumble. 0.90 = only 10% penalty.",
    increaseMeans: "Good recovery almost negates stumble. Experienced battlers recover easily.",
    decreaseMeans: "Even good recovery hurts. Stumbles always cost something.",
    affectedBy: ["Delivery attribute affects recovery chance", "Badge: Freestyle Genius helps recovery"],
    affects: ["Effective stumble penalty", "Value of delivery attribute"],
    example: "Normal 8.0, stumbled with recovery = 7.2 (8.0 × 0.90)"
  },

  // === PREP EFFECTS ===
  PREP_EFFECT_MULTIPLIER: {
    value: SIMULATION_CONFIG.PREP_EFFECT_MULTIPLIER,
    unit: "% improvement per day",
    description: "How much each prep day improves relevant attributes for the battle.",
    increaseMeans: "Prep becomes crucial. No-prep = guaranteed loss.",
    decreaseMeans: "Prep matters less. Can wing it more successfully.",
    affectedBy: [
      "Badge: Technical Writer (+35% writing prep)",
      "Badge: Freestyle Genius (doesn't need prep)",
      "Badge: Workaholic (+15% all prep)",
      "Badge: Lazy Writer (-40% writing prep)"
    ],
    affects: ["All attribute bonuses from prep", "Value of prep planning"],
    formula: "attribute_bonus = days × PREP_EFFECT_MULTIPLIER × badge_efficiency",
    example: "5 days writing prep = 100% bonus to writing attributes (5 × 20%)"
  },
  NO_SHOW_PENALTY: {
    value: SIMULATION_CONFIG.NO_SHOW_PENALTY,
    description: "Multiplier applied to ALL stats if you don't prep at all. 0.5 = 50% of normal stats.",
    increaseMeans: "No-show less punishing. Can sometimes win unprepared.",
    decreaseMeans: "No-show = automatic loss. Must always prep.",
    affectedBy: ["Badge: Freestyle Genius partially negates this"],
    affects: ["All attributes when unprepared", "Consequence of skipping prep"],
    example: "Lyricism 8 becomes effective 4 if no prep (8 × 0.5)"
  },

  // === ROUND JUDGING ===
  ROUND_JUDGING_AVERAGE_WEIGHT: {
    value: SIMULATION_CONFIG.ROUND_JUDGING_AVERAGE_WEIGHT,
    unit: "% weight",
    description: "How much your AVERAGE segment score matters for winning the round.",
    increaseMeans: "Consistency rewarded. Must be good throughout the round.",
    decreaseMeans: "Average matters less. Big moments can carry weak rounds.",
    affectedBy: ["Nothing - judging formula constant"],
    affects: ["Value of consistency", "Consistent Writer badge value"],
    formula: "round_score = avg×0.40 + peak×0.35 + crowd×0.25",
    example: "Average 7.0 contributes 2.8 points to round score (7.0 × 0.40)"
  },
  ROUND_JUDGING_PEAK_WEIGHT: {
    value: SIMULATION_CONFIG.ROUND_JUDGING_PEAK_WEIGHT,
    unit: "% weight",
    description: "How much your BEST segment (haymaker) matters for winning the round.",
    increaseMeans: "One big moment can win rounds. Punchline Kings favored.",
    decreaseMeans: "Peaks matter less. Can't coast on one good bar.",
    affectedBy: ["Nothing - judging formula constant"],
    affects: ["Value of peak moments", "Punchline King badge value", "Haymaker strategy"],
    example: "Peak 9.5 contributes 3.325 points to round score (9.5 × 0.35)"
  },
  ROUND_JUDGING_CROWD_WEIGHT: {
    value: SIMULATION_CONFIG.ROUND_JUDGING_CROWD_WEIGHT,
    unit: "% weight",
    description: "How much CROWD REACTION (0-100) matters for winning the round.",
    increaseMeans: "Crowd pleasers win more. Performance > writing.",
    decreaseMeans: "Crowd matters less. Technical skill wins.",
    affectedBy: ["Scaled by ROUND_JUDGING_CROWD_SCALE"],
    affects: ["Value of crowd control", "Charismatic badge value", "League differences"],
    formula: "crowd_contribution = (crowd_reaction / CROWD_SCALE) × CROWD_WEIGHT",
    example: "Crowd 80 contributes 2.0 points (80/10 × 0.25)"
  },

  // === DECISION CLASSIFICATION ===
  DECISION_BODYBAG_THRESHOLD: {
    value: SIMULATION_CONFIG.DECISION_BODYBAG_THRESHOLD,
    description: "Point margin needed for a 'BODYBAG' (3-0 domination) classification.",
    increaseMeans: "Harder to get bodybag. Most battles just '3-0'.",
    decreaseMeans: "Bodybags more common. More humiliating losses.",
    affectedBy: ["Nothing - classification threshold"],
    affects: ["Battle classification", "Media coverage tone", "Reputation damage"],
    example: "Win by 3+ points total = BODYBAG headline, max reputation damage"
  },
  RATING_K_FACTOR: {
    value: SIMULATION_CONFIG.RATING_K_FACTOR,
    description: "ELO K-factor. Higher = more rating swing per battle.",
    increaseMeans: "Faster rating changes. One battle can massively change rank.",
    decreaseMeans: "Slower rating changes. Need many battles to climb/fall.",
    affectedBy: ["Nothing - ELO constant"],
    affects: ["Rating gains/losses", "Climb speed", "Upset impact"],
    formula: "rating_change = K × (actual - expected)",
    example: "Upset win vs +400 opponent = ~28 rating gain (K=32)"
  },

  // === PROGRESSION ===
  HIGH_SCORE_THRESHOLD: {
    value: PROGRESSION_CONFIG.HIGH_SCORE_THRESHOLD,
    description: "Average score needed to trigger writing attribute improvements.",
    increaseMeans: "Harder to improve. Only great performances count.",
    decreaseMeans: "Easier to improve. Mediocre battles still grow you.",
    affectedBy: ["Nothing - threshold constant"],
    affects: ["Lyricism, Wordplay, Creativity gains"],
    example: "Average 7.0+ across rounds = +0.05 to writing attributes"
  },
  HIGH_CROWD_THRESHOLD: {
    value: PROGRESSION_CONFIG.HIGH_CROWD_THRESHOLD,
    description: "Crowd reaction needed to trigger performance attribute improvements.",
    increaseMeans: "Harder to improve performance. Must really rock the crowd.",
    decreaseMeans: "Easier to improve. Decent crowd reactions enough.",
    affectedBy: ["Nothing - threshold constant"],
    affects: ["Stage Presence, Crowd Control, Delivery gains"],
    example: "Crowd 75+ = +0.05 to performance attributes"
  },
  HAYMAKER_THRESHOLD: {
    value: PROGRESSION_CONFIG.HAYMAKER_THRESHOLD,
    description: "Peak score needed to trigger bonus creativity/wordplay improvement.",
    increaseMeans: "Need truly exceptional moment for bonus. Very rare.",
    decreaseMeans: "Good peaks count. More frequent haymaker bonuses.",
    affectedBy: ["Nothing - threshold constant"],
    affects: ["Creativity, Wordplay bonus gains"],
    example: "Peak 8.5+ = +0.1 creativity, +0.05 wordplay bonus"
  },
  BASE_WRITING_GAIN: {
    value: PROGRESSION_CONFIG.BASE_WRITING_GAIN,
    unit: " attribute points",
    description: "Base improvement to writing attributes when threshold met.",
    increaseMeans: "Faster writing growth. Battlers improve quicker.",
    decreaseMeans: "Slower progression. Many battles to improve.",
    affectedBy: ["HIGH_SCORE_THRESHOLD must be met", "Winner bonus adds +0.02", "Loser penalty halves it"],
    affects: ["Lyricism, Wordplay, Creativity growth rate"],
    example: "Meet threshold + win = 0.05 + 0.02 = 0.07 gain"
  },
  WINNER_BONUS: {
    value: PROGRESSION_CONFIG.WINNER_BONUS,
    unit: " extra points",
    description: "Extra attribute improvement added to ALL stats when you win.",
    increaseMeans: "Winning much better for growth. Winners pull ahead faster.",
    decreaseMeans: "Winning vs losing similar growth. Can improve while losing.",
    affectedBy: ["Must win the battle"],
    affects: ["All attribute gains"],
    example: "Win = +0.02 to every attribute improvement"
  },
  LOSER_PENALTY: {
    value: PROGRESSION_CONFIG.LOSER_PENALTY,
    description: "Multiplier on attribute gains when you lose. 0.5 = half improvement.",
    increaseMeans: "Losers still grow reasonably. Not as punishing.",
    decreaseMeans: "Losing = barely any growth. Must win to improve.",
    affectedBy: ["Must lose the battle"],
    affects: ["All attribute gains when losing"],
    example: "0.05 base gain × 0.5 = 0.025 when losing"
  },
  MAX_TOTAL_GAIN: {
    value: PROGRESSION_CONFIG.MAX_TOTAL_GAIN,
    unit: " total points",
    description: "Cap on total attribute improvement per battle across all stats.",
    increaseMeans: "Can grow faster per battle. Fewer battles to max out.",
    decreaseMeans: "Slower per-battle growth. More games needed to reach GOD tier.",
    affectedBy: ["Nothing - hard cap"],
    affects: ["Maximum growth rate", "Time to max attributes"],
    example: "Even if all thresholds met + win, can't gain more than 0.3 total"
  },

  // === GRUDGE/RIVALRY ===
  WINNER_GOOD_BATTLE: {
    value: GRUDGE_CONFIG.WINNER_GOOD_BATTLE,
    unit: " intensity",
    description: "Intensity change when winner says 'Good Battle' (respectful).",
    increaseMeans: "Respect cools things down more. Easier to squash beef.",
    decreaseMeans: "Respect barely helps. Rivalries stay heated.",
    affectedBy: ["Winner's choice only"],
    affects: ["Rivalry intensity", "Future payout modifiers"],
    example: "Intensity 60 → 55 after Good Battle"
  },
  WINNER_CAREER_OVER: {
    value: GRUDGE_CONFIG.WINNER_CAREER_OVER,
    unit: " intensity",
    description: "Intensity change when winner says 'Career Over' (max disrespect).",
    increaseMeans: "Max disrespect creates legendary beef instantly.",
    decreaseMeans: "Even max disrespect doesn't escalate that much.",
    affectedBy: ["Winner's choice only"],
    affects: ["Rivalry intensity", "Media coverage", "Grudge match eligibility"],
    example: "Intensity 30 → 80 after Career Over (instantly Grudge Match eligible!)"
  },
  INTENSITY_GRUDGE_MATCH: {
    value: GRUDGE_CONFIG.INTENSITY_GRUDGE_MATCH,
    unit: " intensity threshold",
    description: "Intensity level needed for 'Grudge Match' status (+50% payout).",
    increaseMeans: "Harder to reach grudge match. Takes more beefing.",
    decreaseMeans: "Grudge matches more common. Easier to get bonus payout.",
    affectedBy: ["Post-battle reactions from both sides", "Media events"],
    affects: ["Battle payout", "Media attention", "Stakes"],
    example: "At 75+ intensity: next battle = GRUDGE MATCH with 1.5x payout"
  },

  // === DUCKING ===
  ELO_RANGE_MIN: {
    value: DUCKING_CONFIG.ELO_RANGE_MIN,
    unit: " ELO",
    description: "How close in rating someone must be for declining to count as 'ducking'.",
    increaseMeans: "Wider range counts as ducking. Can't avoid anyone near your level.",
    decreaseMeans: "Only very close matchups count. More valid reasons to decline.",
    affectedBy: ["Nothing - fixed range"],
    affects: ["What counts as ducking", "Ducker badge earning"],
    example: "1200 ELO battler declining 1290 opponent = ducking (within 100)"
  },
  DUCKING_BADGE_THRESHOLD: {
    value: DUCKING_CONFIG.DUCKING_BADGE_THRESHOLD,
    unit: " declined calls",
    description: "How many valid ducking incidents before earning 'Ducker' badge.",
    increaseMeans: "More chances before labeled. Harder to get bad reputation.",
    decreaseMeans: "Quickly labeled. One or two declines = permanent reputation.",
    affectedBy: ["Only declined calls within ELO range count"],
    affects: ["Ducker badge acquisition", "Reputation"],
    example: "Decline 3 battlers within 100 ELO = 'Ducker' badge (permanent)"
  },
  REPEAT_BATTLE_COOLDOWN_DAYS: {
    value: DUCKING_CONFIG.REPEAT_BATTLE_COOLDOWN_DAYS,
    unit: " days",
    description: "How long before you can rematch the same opponent.",
    increaseMeans: "Long wait for sequels. More opponent variety forced.",
    decreaseMeans: "Quick rematches allowed. Can run back immediately.",
    affectedBy: ["Nothing - fixed cooldown"],
    affects: ["Sequel timing", "Opponent variety", "Rivalry buildup time"],
    example: "Beat someone Dec 1 → Can't rematch until Feb 1 (60 days)"
  },

  // === BADGES ===
  KNOWN_CHOKER: {
    value: BADGE_CHOKE_EFFECTS.KNOWN_CHOKER,
    unit: "% per segment added",
    description: "Extra choke chance per segment for 'Known Choker' badge.",
    increaseMeans: "Known Chokers become nearly unplayable. Choke most battles.",
    decreaseMeans: "Badge less punishing. Can still compete with reputation.",
    affectedBy: ["Stacks with other badges", "Can be partially offset by resilience/prep"],
    affects: ["Choke frequency for this battler"],
    formula: "With 6 segments: 7% × 6 = 42% base, plus normal 1.5% × 6 = ~51% per battle",
    example: "Known Choker chokes roughly every other battle"
  },
  CLUTCH_PERFORMER: {
    value: BADGE_CHOKE_EFFECTS.CLUTCH_PERFORMER,
    unit: "% per segment reduced",
    description: "Choke chance reduction per segment for 'Clutch Performer' badge.",
    increaseMeans: "Clutch badge makes you nearly choke-proof.",
    decreaseMeans: "Badge helps but doesn't guarantee safety.",
    affectedBy: ["Stacks with resilience and prep"],
    affects: ["Choke frequency for this battler"],
    formula: "1.5% base - 4% badge = hits floor of 0.7% per segment",
    example: "Clutch Performer: ~4% per battle (0.7% × 6 segments)"
  },
}

type ConfigSection2 = "simulation" | "progression" | "grudge" | "badges" | "media" | "ducking"

export function GameBalanceTab() {
  const [activeSection, setActiveSection] = useState<ConfigSection2>("simulation")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpand = (key: string) => {
    const newSet = new Set(expandedItems)
    if (newSet.has(key)) {
      newSet.delete(key)
    } else {
      newSet.add(key)
    }
    setExpandedItems(newSet)
  }

  const sections = [
    { id: "simulation", label: "Simulation", icon: Scale },
    { id: "progression", label: "Progression", icon: TrendingUp },
    { id: "grudge", label: "Grudge/Rivalry", icon: Zap },
    { id: "badges", label: "Badge Effects", icon: Award },
    { id: "media", label: "Media System", icon: Users },
    { id: "ducking", label: "Ducking/Sequels", icon: AlertTriangle },
  ]

  const renderDetailedConfig = (keys: string[], title: string, description: string) => (
    <div className="mb-6">
      <h3 className="text-sm font-display font-bold text-orange-500 mb-2">{title}</h3>
      <p className="text-xs text-zinc-500 mb-3">{description}</p>
      <div className="space-y-2">
        {keys.map((key) => {
          const detail = CONFIG_DETAILS[key]
          if (!detail) return null
          const isExpanded = expandedItems.has(key)

          return (
            <div key={key} className="bg-zinc-950 border border-zinc-800 overflow-hidden">
              {/* Header row - always visible */}
              <button
                onClick={() => toggleExpand(key)}
                className="w-full p-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  )}
                  <span className="text-orange-400 font-mono text-sm">{key}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-400 font-mono text-sm">
                    {typeof detail.value === "number" && detail.value < 1 && detail.value > 0 && !detail.unit
                      ? `${(detail.value * 100).toFixed(1)}%`
                      : detail.value}
                    {detail.unit || ""}
                  </span>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-zinc-800 bg-zinc-900/30">
                  {/* Description */}
                  <div className="pt-3">
                    <p className="text-sm text-zinc-300">{detail.description}</p>
                  </div>

                  {/* Increase/Decrease effects */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-900/20 border border-green-700/30 p-2">
                      <div className="text-xs font-display text-green-400 mb-1">↑ INCREASE MEANS</div>
                      <p className="text-xs text-zinc-300">{detail.increaseMeans}</p>
                    </div>
                    <div className="bg-red-900/20 border border-red-700/30 p-2">
                      <div className="text-xs font-display text-red-400 mb-1">↓ DECREASE MEANS</div>
                      <p className="text-xs text-zinc-300">{detail.decreaseMeans}</p>
                    </div>
                  </div>

                  {/* Affected by */}
                  <div className="bg-zinc-800/50 p-2">
                    <div className="text-xs font-display text-blue-400 mb-1">AFFECTED BY:</div>
                    <ul className="text-xs text-zinc-400 space-y-0.5">
                      {detail.affectedBy.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Affects */}
                  <div className="bg-zinc-800/50 p-2">
                    <div className="text-xs font-display text-purple-400 mb-1">AFFECTS:</div>
                    <ul className="text-xs text-zinc-400 space-y-0.5">
                      {detail.affects.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Formula if exists */}
                  {detail.formula && (
                    <div className="bg-yellow-900/20 border border-yellow-700/30 p-2">
                      <div className="text-xs font-display text-yellow-400 mb-1">FORMULA:</div>
                      <code className="text-xs text-yellow-300 font-mono">{detail.formula}</code>
                    </div>
                  )}

                  {/* Example if exists */}
                  {detail.example && (
                    <div className="bg-zinc-800/50 p-2">
                      <div className="text-xs font-display text-zinc-400 mb-1">EXAMPLE:</div>
                      <p className="text-xs text-zinc-300 italic">{detail.example}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
      <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
        <Scale className="w-4 h-4" /> GAME BALANCE CONFIGURATION
      </h2>

      <p className="text-xs text-zinc-400 mb-2">
        All game balance numbers with detailed explanations. Click any row to see what it does.
      </p>
      <p className="text-xs text-red-400 mb-4">
        Changes require code updates in lib/game/config.ts
      </p>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as ConfigSection2)}
            className={`px-3 py-1.5 flex items-center gap-1.5 font-display text-xs border ${
              activeSection === id
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-orange-500"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="max-h-[600px] overflow-y-auto pr-2">
        {activeSection === "simulation" && (
          <>
            {renderDetailedConfig(
              ["SEGMENT_VARIANCE", "SCORE_FLOOR", "SCORE_CEILING"],
              "Segment Scoring",
              "How individual segments are scored during battle simulation"
            )}
            {renderDetailedConfig(
              ["CHOKE_BASE_PROBABILITY", "CHOKE_MINIMUM", "CHOKE_MAXIMUM", "CHOKE_SCORE_MULTIPLIER", "CHOKE_RESILIENCE_FACTOR", "CHOKE_PREP_REDUCTION"],
              "Choke Mechanics",
              "When a battler completely forgets their bars. Devastating 85% penalty."
            )}
            {renderDetailedConfig(
              ["STUMBLE_BASE_PROBABILITY", "STUMBLE_SCORE_MULTIPLIER", "STUMBLE_RECOVERY_MULTIPLIER"],
              "Stumble Mechanics",
              "Minor mistakes that can be recovered from. 15% penalty, less if recovered."
            )}
            {renderDetailedConfig(
              ["PREP_EFFECT_MULTIPLIER", "NO_SHOW_PENALTY"],
              "Prep Effects",
              "How preparation affects battle performance"
            )}
            {renderDetailedConfig(
              ["ROUND_JUDGING_AVERAGE_WEIGHT", "ROUND_JUDGING_PEAK_WEIGHT", "ROUND_JUDGING_CROWD_WEIGHT"],
              "Round Scoring Weights",
              "How rounds are judged: 40% average, 35% peak moments, 25% crowd reaction"
            )}
            {renderDetailedConfig(
              ["DECISION_BODYBAG_THRESHOLD", "RATING_K_FACTOR"],
              "Decision & ELO",
              "How battles are classified and how rating changes are calculated"
            )}
          </>
        )}

        {activeSection === "progression" && (
          <>
            {renderDetailedConfig(
              ["HIGH_SCORE_THRESHOLD", "HIGH_CROWD_THRESHOLD", "HAYMAKER_THRESHOLD"],
              "Performance Thresholds",
              "What counts as 'good' performance for attribute gains"
            )}
            {renderDetailedConfig(
              ["BASE_WRITING_GAIN", "BASE_PERFORMANCE_GAIN", "BASE_RESILIENCE_GAIN", "WINNER_BONUS", "HAYMAKER_BONUS", "LOSER_PENALTY"],
              "Attribute Gains",
              "How much attributes improve after battles"
            )}
            {renderDetailedConfig(
              ["MAX_TOTAL_GAIN"],
              "Limits",
              "Caps on attribute growth"
            )}
          </>
        )}

        {activeSection === "grudge" && (
          <>
            <div className="mb-6 bg-orange-900/20 border border-orange-500/30 p-3">
              <h3 className="text-sm font-display font-bold text-orange-400 mb-2">Rivalry Intensity System</h3>
              <p className="text-xs text-zinc-400 mb-2">
                After battles, players choose reactions that affect rivalry intensity (0-100).
                Higher intensity = bigger payouts but more pressure.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-900/50 p-2">
                  <div className="text-green-400">0-24: Low tension (normal payout)</div>
                  <div className="text-yellow-400">25-49: Building tension (normal payout)</div>
                </div>
                <div className="bg-zinc-900/50 p-2">
                  <div className="text-orange-400">50-74: Heated (+25% payout)</div>
                  <div className="text-red-400">75+: Grudge Match (+50% payout)</div>
                </div>
              </div>
            </div>
            {renderDetailedConfig(
              ["WINNER_GOOD_BATTLE", "WINNER_CAREER_OVER"],
              "Winner Reactions",
              "Intensity changes when winner responds after battle"
            )}
            {renderDetailedConfig(
              ["INTENSITY_GRUDGE_MATCH"],
              "Intensity Thresholds",
              "When special match statuses are triggered"
            )}
          </>
        )}

        {activeSection === "badges" && (
          <>
            <div className="mb-6 bg-red-900/20 border border-red-500/30 p-3">
              <h3 className="text-sm font-display font-bold text-red-400 mb-2">Choke Probability Math</h3>
              <p className="text-xs text-zinc-400">
                <strong>Base formula per segment:</strong><br/>
                choke% = BASE(1.5%) - resilience_bonus - prep_bonus + badge_modifiers<br/><br/>
                <strong>Example calculations:</strong><br/>
                • Average battler: 1.5% × 6 segments = ~9% per round<br/>
                • Known Choker: (1.5% + 7%) × 6 = ~51% per round<br/>
                • Clutch Performer: max(0.7%, 1.5% - 4%) × 6 = ~4% per round
              </p>
            </div>
            {renderDetailedConfig(
              ["KNOWN_CHOKER", "CLUTCH_PERFORMER"],
              "Key Badge Effects",
              "How badges modify choke probability (per segment)"
            )}
            <div className="mt-4 bg-zinc-800 p-3 border border-zinc-700">
              <h4 className="text-xs font-display font-bold text-zinc-300 mb-2">All Choke Modifiers</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-green-400 font-bold mb-1">Reduce Choke:</div>
                  <div>• Freestyle Genius: -2.5%/seg</div>
                  <div>• Clutch Performer: -4.0%/seg</div>
                  <div>• Resilient Battler: -3.0%/seg</div>
                  <div>• Respected Veteran: -2.0%/seg</div>
                  <div>• Rebuttal King: -2.0%/seg</div>
                </div>
                <div>
                  <div className="text-red-400 font-bold mb-1">Increase Choke:</div>
                  <div>• Known Choker: +7.0%/seg</div>
                  <div>• Choker: +2.0%/seg</div>
                  <div>• Substance Issues: +6.0%/seg</div>
                  <div>• Health Issues: +5.0%/seg</div>
                  <div>• Weak Chin: +4.0%/seg</div>
                  <div>• Unreliable: +2.0%/seg</div>
                  <div>• Speed Rapping: +1.5%/seg</div>
                  <div>• Aggressive: +1.0%/seg</div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSection === "media" && (
          <>
            <div className="mb-6 bg-blue-900/20 border border-blue-500/30 p-3">
              <h3 className="text-sm font-display font-bold text-blue-400 mb-2">Media Reaction System</h3>
              <p className="text-xs text-zinc-400">
                Bloggers write articles about battles. Fans react with FACTS/CAP/FIRE/MID/DEBATABLE.
                These affect blogger credibility (0-100) which impacts whether fans trust future articles.
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-3">
              <h4 className="text-xs font-display font-bold text-zinc-300 mb-3">Reaction Effects on Blogger Credibility</h4>
              <div className="space-y-2">
                {Object.entries(MEDIA_REACTION_EFFECTS).map(([reaction, effect]) => (
                  <div key={reaction} className="flex items-center justify-between p-2 bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {reaction === "FACTS" ? "📰" :
                         reaction === "CAP" ? "🧢" :
                         reaction === "FIRE" ? "🔥" :
                         reaction === "MID" ? "😐" : "⚖️"}
                      </span>
                      <span className="text-sm text-zinc-300">{reaction}</span>
                    </div>
                    <span className={`font-mono text-sm ${effect > 0 ? "text-green-400" : "text-red-400"}`}>
                      {effect > 0 ? "+" : ""}{effect} credibility
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-zinc-500">
                <strong>How it works:</strong><br/>
                • High credibility bloggers' articles are trusted more<br/>
                • Low credibility = fans doubt their takes<br/>
                • Affects how battle narratives spread in game world
              </div>
            </div>
          </>
        )}

        {activeSection === "ducking" && (
          <>
            <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 p-3">
              <h3 className="text-sm font-display font-bold text-yellow-400 mb-2">Ducking & Sequel Logic Explained</h3>
              <div className="text-xs text-zinc-400 space-y-2">
                <p>
                  <strong>DUCKING:</strong> When you decline a call-out from someone within {DUCKING_CONFIG.ELO_RANGE_MIN} ELO of your rating.
                  This is considered "ducking" because you're avoiding a fair fight.
                </p>
                <p>
                  <strong>DUCKER BADGE:</strong> After {DUCKING_CONFIG.DUCKING_BADGE_THRESHOLD} ducking incidents, you earn the permanent
                  "Ducker" badge which damages your reputation and reduces battle offers.
                </p>
                <p>
                  <strong>SEQUEL LOGIC:</strong> After battling someone, you must wait {DUCKING_CONFIG.REPEAT_BATTLE_COOLDOWN_DAYS} days
                  before a rematch. This builds anticipation and prevents immediate runbacks.
                </p>
              </div>
            </div>
            {renderDetailedConfig(
              ["ELO_RANGE_MIN", "DUCKING_BADGE_THRESHOLD", "REPEAT_BATTLE_COOLDOWN_DAYS"],
              "Ducking & Sequel Rules",
              "Rules for call-outs, ducking accusations, and rematch timing"
            )}
          </>
        )}
      </div>
    </div>
  )
}
