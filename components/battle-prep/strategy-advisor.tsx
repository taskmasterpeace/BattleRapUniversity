"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  Swords,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  AlertTriangle,
} from "lucide-react"
import {
  ROUND_STRATEGIES,
  getStrategy,
  getEffectivenessForecast,
  getRecommendedStrategies,
  getStrategyColor,
  getStrategyIcon,
  type RoundStrategy,
} from "@/lib/game/roundStrategies"

interface StrategyAdvisorProps {
  opponentId: string
  opponentName: string
  opponentKnownStrategy?: string // If intel reveals opponent's likely strategy
  researchLevel: "none" | "casual" | "aggressive"
  onStrategySelect?: (strategyId: string) => void
}

// Opponent tendencies based on research
interface OpponentTendency {
  likelyStrategies: string[]
  preferredContent: string[]
  weaknesses: string[]
  confidence: number // 0-100
}

function analyzeOpponentTendencies(
  researchLevel: "none" | "casual" | "aggressive",
  opponentId: string
): OpponentTendency {
  // Deterministic "random" based on opponent ID
  const hash = opponentId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  const seededRandom = (index: number) => Math.abs((hash + index) % 100) / 100

  // Base tendencies (no research)
  if (researchLevel === "none") {
    return {
      likelyStrategies: [],
      preferredContent: [],
      weaknesses: [],
      confidence: 0,
    }
  }

  // Get 2-3 likely strategies based on opponent "personality"
  const strategyIndex = Math.floor(seededRandom(1) * ROUND_STRATEGIES.length)
  const secondaryIndex = (strategyIndex + 1) % ROUND_STRATEGIES.length
  const tertiaryIndex = (strategyIndex + 3) % ROUND_STRATEGIES.length

  const likelyStrategies = researchLevel === "aggressive"
    ? [ROUND_STRATEGIES[strategyIndex].id, ROUND_STRATEGIES[secondaryIndex].id]
    : [ROUND_STRATEGIES[strategyIndex].id]

  // Get their content preferences
  const primaryStrategy = ROUND_STRATEGIES[strategyIndex]
  const preferredContent = [...primaryStrategy.contentTypes]

  // Get their weaknesses
  const weaknesses = primaryStrategy.weaknesses || []

  // Confidence based on research level
  const confidence = researchLevel === "aggressive" ? 75 : 45

  return {
    likelyStrategies,
    preferredContent,
    weaknesses,
    confidence,
  }
}

export function StrategyAdvisor({
  opponentId,
  opponentName,
  opponentKnownStrategy,
  researchLevel,
  onStrategySelect,
}: StrategyAdvisorProps) {
  const [expanded, setExpanded] = useState(true)
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [showAllStrategies, setShowAllStrategies] = useState(false)

  // Analyze opponent
  const tendency = analyzeOpponentTendencies(researchLevel, opponentId)

  // Get recommended strategies
  const recommendedStrategies = tendency.likelyStrategies.length > 0
    ? getRecommendedStrategies(tendency.likelyStrategies[0])
    : ROUND_STRATEGIES.slice(0, 3)

  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId)
    onStrategySelect?.(strategyId)
  }

  // Get forecast for selected strategy
  const selectedForecast = selectedStrategy && tendency.likelyStrategies[0]
    ? getEffectivenessForecast(
        getStrategy(selectedStrategy)!,
        getStrategy(tendency.likelyStrategies[0])!
      )
    : null

  return (
    <div className="bg-zinc-900 border border-zinc-800">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="font-display font-bold text-zinc-200 uppercase tracking-wide">
              Strategy Advisor
            </p>
            <p className="text-xs text-zinc-500">
              Intel on {opponentName}'s tendencies
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-zinc-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-500" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {/* Research Level Banner */}
              <div className={`p-3 border ${
                researchLevel === "aggressive"
                  ? "bg-green-950/30 border-green-700/50"
                  : researchLevel === "casual"
                    ? "bg-yellow-950/30 border-yellow-700/50"
                    : "bg-zinc-800 border-zinc-700"
              }`}>
                <div className="flex items-center gap-2">
                  <Info className={`w-4 h-4 ${
                    researchLevel === "aggressive" ? "text-green-400" :
                    researchLevel === "casual" ? "text-yellow-400" :
                    "text-zinc-400"
                  }`} />
                  <span className={`text-xs font-display uppercase tracking-wide ${
                    researchLevel === "aggressive" ? "text-green-400" :
                    researchLevel === "casual" ? "text-yellow-400" :
                    "text-zinc-400"
                  }`}>
                    {researchLevel === "aggressive" ? "Deep Intel Available" :
                     researchLevel === "casual" ? "Basic Intel Available" :
                     "No Research Done"}
                  </span>
                  {tendency.confidence > 0 && (
                    <span className="text-xs text-zinc-500 font-mono ml-auto">
                      {tendency.confidence}% confidence
                    </span>
                  )}
                </div>
              </div>

              {/* Opponent Tendencies */}
              {tendency.likelyStrategies.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-display text-zinc-500 uppercase tracking-wider">
                    {opponentName}'s Likely Approach
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tendency.likelyStrategies.map(stratId => {
                      const strat = getStrategy(stratId)
                      if (!strat) return null
                      return (
                        <div
                          key={stratId}
                          className={`px-3 py-2 bg-zinc-800 border ${getStrategyColor(stratId)}`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{getStrategyIcon(stratId)}</span>
                            <span className="text-sm font-display font-bold">
                              {strat.name}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">
                            {strat.description}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Weaknesses */}
                  {tendency.weaknesses.length > 0 && (
                    <div className="mt-3 p-3 bg-red-950/20 border border-red-900/50">
                      <p className="text-xs font-display text-red-400 uppercase tracking-wider mb-2">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        Their Weaknesses
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {tendency.weaknesses.map(weakness => (
                          <span
                            key={weakness}
                            className="px-2 py-0.5 bg-red-900/30 border border-red-800/50 text-xs text-red-300"
                          >
                            {weakness}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Counters */}
              <div className="space-y-2">
                <p className="text-xs font-display text-zinc-500 uppercase tracking-wider">
                  <Swords className="w-3 h-3 inline mr-1" />
                  Recommended Counters
                </p>
                <div className="grid gap-2">
                  {recommendedStrategies.map((strat, idx) => {
                    const isSelected = selectedStrategy === strat.id
                    const forecast = tendency.likelyStrategies[0]
                      ? getEffectivenessForecast(strat, getStrategy(tendency.likelyStrategies[0])!)
                      : null

                    return (
                      <button
                        key={strat.id}
                        onClick={() => handleStrategySelect(strat.id)}
                        className={`w-full p-3 text-left transition-all ${
                          isSelected
                            ? "bg-orange-600/20 border-2 border-orange-500"
                            : "bg-zinc-800 border border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getStrategyIcon(strat.id)}</span>
                            <div>
                              <p className={`font-display font-bold text-sm ${
                                isSelected ? "text-orange-400" : "text-zinc-200"
                              }`}>
                                {strat.name}
                              </p>
                              <p className="text-xs text-zinc-500">{strat.description}</p>
                            </div>
                          </div>
                          {forecast && (
                            <div className={`px-2 py-1 text-xs font-mono ${
                              forecast.advantage === "yours"
                                ? "bg-green-900/30 text-green-400 border border-green-700/50"
                                : forecast.advantage === "theirs"
                                  ? "bg-red-900/30 text-red-400 border border-red-700/50"
                                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            }`}>
                              {forecast.advantage === "yours" && "+"}
                              {forecast.advantage === "theirs" && "-"}
                              {(forecast.advantageAmount * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                        {idx === 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
                            <Zap className="w-3 h-3" />
                            <span className="font-display uppercase">Best Counter</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Show All Strategies Toggle */}
              <button
                onClick={() => setShowAllStrategies(!showAllStrategies)}
                className="w-full p-2 text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showAllStrategies ? "Show Less" : "Show All 8 Strategies"}
              </button>

              {/* All Strategies (Collapsed) */}
              <AnimatePresence>
                {showAllStrategies && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-2 gap-2 overflow-hidden"
                  >
                    {ROUND_STRATEGIES.filter(s => !recommendedStrategies.includes(s)).map(strat => (
                      <button
                        key={strat.id}
                        onClick={() => handleStrategySelect(strat.id)}
                        className={`p-2 text-left transition-all ${
                          selectedStrategy === strat.id
                            ? "bg-orange-600/20 border-2 border-orange-500"
                            : "bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{getStrategyIcon(strat.id)}</span>
                          <span className="text-xs font-display font-bold text-zinc-300 truncate">
                            {strat.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Strategy Summary */}
              {selectedStrategy && selectedForecast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-orange-950/30 border border-orange-700/50"
                >
                  <p className="text-xs font-display text-orange-400 uppercase tracking-wider mb-2">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Matchup Analysis
                  </p>
                  <p className="text-sm text-zinc-300">
                    {selectedForecast.summary}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-zinc-500">Your Mult: </span>
                      <span className="text-green-400 font-mono">
                        {selectedForecast.yourMultiplier.toFixed(2)}x
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Their Mult: </span>
                      <span className="text-red-400 font-mono">
                        {selectedForecast.opponentMultiplier.toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
