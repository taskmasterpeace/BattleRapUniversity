"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Check, Swords, Zap, Shield, Target, AlertTriangle, Flame, Skull, Brain, Mic2, Drama } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  CONTENT_TYPES,
  DELIVERY_TYPES,
  PERFORMANCE_TYPES,
  CONTENT_TYPE_INFO,
  DELIVERY_TYPE_INFO,
  PERFORMANCE_TYPE_INFO,
  QUICK_PRESETS,
  type ContentType,
  type DeliveryType,
  type PerformanceType,
  type RoundSelections,
} from "@/lib/round-crafting"

// ============================================
// PRESET ICON MAPPING (placeholders until real art)
// Icons should be 64x64px PNG with transparent background
// ============================================
const PRESET_ICONS: Record<string, React.ReactNode> = {
  "tech_heavy": <Brain className="w-8 h-8 text-purple-400" />,
  "street_mode": <Skull className="w-8 h-8 text-red-400" />,
  "entertainment": <Flame className="w-8 h-8 text-orange-400" />,
  "balanced": <Target className="w-8 h-8 text-blue-400" />,
  "raw_aggression": <Mic2 className="w-8 h-8 text-red-500" />,
  "storyteller": <Drama className="w-8 h-8 text-emerald-400" />,
}

// ============================================
// STRATEGIC MATCHUP DATA
// ============================================

interface MatchupInfo {
  strongAgainst: string[]
  weakAgainst: string[]
  badges: string[]
  crowdBonus: "high" | "medium" | "low"
}

const CONTENT_MATCHUPS: Record<ContentType, MatchupInfo> = {
  personals: {
    strongAgainst: ["comedy", "freestyles"],
    weakAgainst: ["rebuttals"],
    badges: ["Angle King", "Research Monster"],
    crowdBonus: "high",
  },
  wordplay: {
    strongAgainst: ["gun_bars", "street_talk"],
    weakAgainst: ["personals"],
    badges: ["Wordsmith", "Pen Game Elite"],
    crowdBonus: "medium",
  },
  schemes: {
    strongAgainst: ["punchlines", "name_flips"],
    weakAgainst: ["freestyles", "rebuttals"],
    badges: ["Schemer", "Setup King"],
    crowdBonus: "medium",
  },
  punchlines: {
    strongAgainst: ["storytelling", "social_commentary"],
    weakAgainst: ["schemes"],
    badges: ["Haymaker", "Punchline King"],
    crowdBonus: "high",
  },
  comedy: {
    strongAgainst: ["gun_bars", "shock_value"],
    weakAgainst: ["personals", "street_talk"],
    badges: ["Comedy King", "Entertainer"],
    crowdBonus: "high",
  },
  storytelling: {
    strongAgainst: ["name_flips", "pop_culture_refs"],
    weakAgainst: ["punchlines", "rebuttals"],
    badges: ["Storyteller", "Painter"],
    crowdBonus: "medium",
  },
  gun_bars: {
    strongAgainst: ["freestyles", "pop_culture_refs"],
    weakAgainst: ["wordplay", "comedy"],
    badges: ["Street Certified", "Menace"],
    crowdBonus: "medium",
  },
  street_talk: {
    strongAgainst: ["comedy", "social_commentary"],
    weakAgainst: ["wordplay", "schemes"],
    badges: ["Authentic", "Street Poet"],
    crowdBonus: "medium",
  },
  freestyles: {
    strongAgainst: ["schemes", "storytelling"],
    weakAgainst: ["personals", "gun_bars"],
    badges: ["Freestyle Artist", "Off the Top"],
    crowdBonus: "high",
  },
  rebuttals: {
    strongAgainst: ["personals", "schemes"],
    weakAgainst: ["punchlines"],
    badges: ["Quick Wit", "Counterpuncher"],
    crowdBonus: "high",
  },
  pop_culture_refs: {
    strongAgainst: ["street_talk", "gun_bars"],
    weakAgainst: ["storytelling"],
    badges: ["Culture Vulture", "Relevant"],
    crowdBonus: "medium",
  },
  name_flips: {
    strongAgainst: ["freestyles", "rebuttals"],
    weakAgainst: ["schemes", "storytelling"],
    badges: ["Name Flipper", "Creative"],
    crowdBonus: "high",
  },
  shock_value: {
    strongAgainst: ["wordplay", "social_commentary"],
    weakAgainst: ["comedy"],
    badges: ["Shock Master", "Controversy"],
    crowdBonus: "high",
  },
  social_commentary: {
    strongAgainst: ["comedy", "pop_culture_refs"],
    weakAgainst: ["punchlines", "street_talk"],
    badges: ["Conscious", "Deep Thinker"],
    crowdBonus: "low",
  },
}

const DELIVERY_INFO: Record<DeliveryType, { riskLevel: string; crowdEffect: string }> = {
  aggressive: { riskLevel: "Medium", crowdEffect: "High energy, crowd loves intensity" },
  smooth_flow: { riskLevel: "Low", crowdEffect: "Consistent, reliable performance" },
  speed_rapping: { riskLevel: "High", crowdEffect: "High reward but more stumble risk" },
  staccato: { riskLevel: "Medium", crowdEffect: "Punctuated delivery, emphatic moments" },
  passionate: { riskLevel: "Medium", crowdEffect: "Emotional connection with crowd" },
  nonchalant: { riskLevel: "Low", crowdEffect: "Cool confidence, unbothered energy" },
  conversational: { riskLevel: "Low", crowdEffect: "Relatable, approachable vibe" },
}

const PERFORMANCE_INFO: Record<PerformanceType, { effect: string }> = {
  stage_presence: { effect: "Commands attention, controls the room" },
  crowd_interaction: { effect: "+15% crowd reaction bonus" },
  theatrical: { effect: "+10% crowd reaction, memorable moments" },
  charismatic: { effect: "Natural magnetism, draws people in" },
  dynamic_range: { effect: "Varies intensity for maximum impact" },
  facial_expression: { effect: "Visual emphasis on key bars" },
  strategic_pauses: { effect: "Builds tension before haymakers" },
  minimalist: { effect: "Lets the bars speak for themselves" },
}

// ============================================
// COMPONENT PROPS
// ============================================

interface RoundCraftingWizardProps {
  roundNum: number
  totalRounds: number
  opponentName: string
  opponentStyle?: string
  playerBadges?: string[]
  onSubmit: (content: ContentType, delivery: DeliveryType, performance: PerformanceType) => void
  isSubmitting?: boolean
}

// ============================================
// WIZARD STEP COMPONENT
// ============================================

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {labels.map((label, idx) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
              idx < currentStep
                ? "bg-green-500 text-black"
                : idx === currentStep
                  ? "bg-orange-500 text-black"
                  : "bg-zinc-700 text-zinc-400"
            )}
          >
            {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
          </div>
          <span
            className={cn(
              "text-xs font-bold uppercase tracking-wider hidden sm:block",
              idx === currentStep ? "text-orange-500" : "text-zinc-500"
            )}
          >
            {label}
          </span>
          {idx < totalSteps - 1 && (
            <div
              className={cn(
                "w-8 h-0.5",
                idx < currentStep ? "bg-green-500" : "bg-zinc-700"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================
// MAIN WIZARD COMPONENT
// ============================================

export function RoundCraftingWizard({
  roundNum,
  totalRounds,
  opponentName,
  opponentStyle,
  playerBadges = [],
  onSubmit,
  isSubmitting = false,
}: RoundCraftingWizardProps) {
  const [step, setStep] = useState(0)
  const [content, setContent] = useState<ContentType | null>(null)
  const [delivery, setDelivery] = useState<DeliveryType | null>(null)
  const [performance, setPerformance] = useState<PerformanceType | null>(null)

  const steps = ["Content", "Delivery", "Energy"]

  const handlePresetSelect = (selections: RoundSelections) => {
    setContent(selections.contentTypes[0])
    setDelivery(selections.deliveryTypes[0])
    setPerformance(selections.performanceTypes[0])
    setStep(2) // Jump to final step after preset
  }

  const canProceed = () => {
    if (step === 0) return content !== null
    if (step === 1) return delivery !== null
    if (step === 2) return performance !== null
    return false
  }

  const handleNext = () => {
    if (step < 2 && canProceed()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSubmit = () => {
    if (content && delivery && performance) {
      onSubmit(content, delivery, performance)
    }
  }

  const isComplete = content !== null && delivery !== null && performance !== null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-black text-xl uppercase tracking-tighter">
          Craft Your Round
        </h2>
        <p className="text-sm text-zinc-500">
          Round {roundNum} vs <span className="text-orange-500">{opponentName}</span>
        </p>
      </div>

      {/* QUICK PRESETS - Always visible, prominent section */}
      {step === 0 && (
        <div className="border-2 border-orange-500/50 bg-gradient-to-b from-orange-500/10 to-zinc-900 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-sm uppercase tracking-wider text-orange-500">
              Quick Strategies
            </h3>
            <span className="text-xs text-zinc-500">Pick a preset or customize below</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.selections)}
                className="group p-3 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-orange-500 hover:scale-105 text-center transition-all flex flex-col items-center gap-2"
              >
                {/* Icon placeholder - replace with Image when you have artwork */}
                <div className="w-12 h-12 rounded-lg bg-zinc-700 group-hover:bg-zinc-600 flex items-center justify-center transition-colors">
                  {PRESET_ICONS[preset.id] || <Swords className="w-6 h-6 text-zinc-500" />}
                </div>
                <div>
                  <p className="font-bold text-xs text-white group-hover:text-orange-400 transition-colors leading-tight">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 hidden sm:block">
                    {preset.description.split(' ').slice(0, 3).join(' ')}...
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step Indicator - Always show */}
      <StepIndicator currentStep={step} totalSteps={3} labels={steps} />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 0: Content Type */}
        {step === 0 && (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="border border-purple-500/30 bg-zinc-900 p-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-purple-400 mb-1">
                Content Type
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                What kind of bars are you spitting?
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[350px] overflow-y-auto">
                {CONTENT_TYPES.map((type) => {
                  const info = CONTENT_TYPE_INFO[type]
                  const matchup = CONTENT_MATCHUPS[type]
                  const isSelected = content === type

                  return (
                    <button
                      key={type}
                      onClick={() => setContent(type)}
                      className={cn(
                        "p-3 border text-left transition-all relative",
                        isSelected
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-zinc-700 bg-zinc-800 hover:border-purple-500/50"
                      )}
                    >
                      {/* Crowd bonus indicator */}
                      <div className={cn(
                        "absolute top-1 right-1 w-2 h-2 rounded-full",
                        matchup.crowdBonus === "high" ? "bg-green-500" :
                        matchup.crowdBonus === "medium" ? "bg-yellow-500" : "bg-zinc-600"
                      )} title={`Crowd: ${matchup.crowdBonus}`} />

                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-sm font-bold", isSelected ? "text-purple-400" : "text-white")}>
                          {info.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-green-500" />}
                      </div>

                      <p className="text-[10px] text-zinc-500 mb-2 line-clamp-1">{info.description}</p>

                      {/* Effectiveness indicators - Pokemon style */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[9px] text-green-500 flex items-center gap-0.5" title={`Strong vs: ${matchup.strongAgainst.join(', ')}`}>
                          <Target className="w-3 h-3" />
                          {matchup.strongAgainst.length}
                        </span>
                        <span className="text-[9px] text-red-500 flex items-center gap-0.5" title={`Weak vs: ${matchup.weakAgainst.join(', ')}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {matchup.weakAgainst.length}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Strategic Info for selected content */}
            {content && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-zinc-700 bg-zinc-900 p-4 space-y-3"
              >
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                  Strategic Analysis
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Strong Against */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-500">
                      <Target className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Strong Against</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {CONTENT_MATCHUPS[content].strongAgainst.map((type) => (
                        <span key={type} className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                          {CONTENT_TYPE_INFO[type as ContentType]?.name || type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Weak Against */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Weak Against</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {CONTENT_MATCHUPS[content].weakAgainst.map((type) => (
                        <span key={type} className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                          {CONTENT_TYPE_INFO[type as ContentType]?.name || type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Crowd Bonus */}
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-zinc-400">Crowd Appeal:</span>
                  <span
                    className={cn(
                      "text-xs font-bold uppercase",
                      CONTENT_MATCHUPS[content].crowdBonus === "high"
                        ? "text-green-500"
                        : CONTENT_MATCHUPS[content].crowdBonus === "medium"
                          ? "text-yellow-500"
                          : "text-zinc-500"
                    )}
                  >
                    {CONTENT_MATCHUPS[content].crowdBonus}
                  </span>
                </div>

                {/* Badges that boost this */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-zinc-400">Boosted by:</span>
                  {CONTENT_MATCHUPS[content].badges.map((badge) => (
                    <span
                      key={badge}
                      className={cn(
                        "px-2 py-0.5 text-xs rounded",
                        playerBadges.includes(badge)
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                          : "bg-zinc-800 text-zinc-500"
                      )}
                    >
                      {badge}
                      {playerBadges.includes(badge) && " ✓"}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 1: Delivery Style */}
        {step === 1 && (
          <motion.div
            key="delivery"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="border border-blue-500/30 bg-zinc-900 p-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-blue-400 mb-1">
                Delivery Style
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                How are you delivering your content?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DELIVERY_TYPES.map((type) => {
                  const info = DELIVERY_TYPE_INFO[type]
                  const stratInfo = DELIVERY_INFO[type]
                  const isSelected = delivery === type

                  return (
                    <button
                      key={type}
                      onClick={() => setDelivery(type)}
                      className={cn(
                        "p-4 border text-left transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-500/20"
                          : "border-zinc-700 bg-zinc-800 hover:border-blue-500/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn("text-sm font-bold", isSelected ? "text-blue-400" : "text-white")}>
                          {info.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-green-500" />}
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">{info.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className={cn(
                          "font-bold",
                          stratInfo.riskLevel === "Low" ? "text-green-500" :
                          stratInfo.riskLevel === "Medium" ? "text-yellow-500" : "text-red-500"
                        )}>
                          Risk: {stratInfo.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{stratInfo.crowdEffect}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Performance Energy */}
        {step === 2 && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="border border-emerald-500/30 bg-zinc-900 p-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-emerald-400 mb-1">
                Performance Energy
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                What's your energy level and stage presence?
              </p>

              <div className="grid grid-cols-2 gap-2">
                {PERFORMANCE_TYPES.map((type) => {
                  const info = PERFORMANCE_TYPE_INFO[type]
                  const stratInfo = PERFORMANCE_INFO[type]
                  const isSelected = performance === type

                  return (
                    <button
                      key={type}
                      onClick={() => setPerformance(type)}
                      className={cn(
                        "p-3 border text-left transition-all",
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/20"
                          : "border-zinc-700 bg-zinc-800 hover:border-emerald-500/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-sm font-bold", isSelected ? "text-emerald-400" : "text-white")}>
                          {info.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-green-500" />}
                      </div>
                      <p className="text-xs text-zinc-500">{info.description}</p>
                      <p className="text-xs text-emerald-400/70 mt-1">{stratInfo.effect}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Final Summary */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-orange-500/30 bg-zinc-900 p-4"
              >
                <h4 className="font-bold text-xs uppercase tracking-wider text-orange-500 mb-3">
                  Your Round Strategy
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-purple-400 uppercase mb-1">Content</p>
                    <p className="text-sm font-bold text-white">
                      {content && CONTENT_TYPE_INFO[content].name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-400 uppercase mb-1">Delivery</p>
                    <p className="text-sm font-bold text-white">
                      {delivery && DELIVERY_TYPE_INFO[delivery].name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-400 uppercase mb-1">Energy</p>
                    <p className="text-sm font-bold text-white">
                      {performance && PERFORMANCE_TYPE_INFO[performance].name}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {step < 2 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className="gap-2 bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? (
              "Performing..."
            ) : (
              <>
                <Swords className="w-4 h-4" />
                Lock In Round {roundNum}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
