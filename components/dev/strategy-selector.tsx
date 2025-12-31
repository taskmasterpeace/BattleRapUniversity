"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Zap, Shield, Target, Award } from "lucide-react"
import {
  ROUND_STRATEGIES,
  type RoundStrategy,
  getStrategyIcon,
  getStrategyColor,
  getEffectivenessForecast,
  type EffectivenessForecast,
} from "@/lib/game/roundStrategies"
import { getBadgeBonusSummary } from "@/ai-battlerap/lib/game/badgeContentBonuses"

interface StrategySelectorProps {
  battlerName: string
  selectedStrategyId: string | null
  onStrategySelect: (strategy: RoundStrategy) => void
  opponentStrategy?: RoundStrategy | null
  borderColor?: "green" | "red"
  showForecast?: boolean
  badges?: string[]
}

export function StrategySelector({
  battlerName,
  selectedStrategyId,
  onStrategySelect,
  opponentStrategy,
  borderColor = "green",
  showForecast = true,
  badges = [],
}: StrategySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const selectedStrategy = ROUND_STRATEGIES.find(s => s.id === selectedStrategyId)

  const borderColors = {
    green: "border-green-500",
    red: "border-red-500",
  }

  const textColors = {
    green: "text-green-400",
    red: "text-red-400",
  }

  // Calculate forecast if opponent strategy is known
  let forecast: EffectivenessForecast | null = null
  if (selectedStrategy && opponentStrategy && showForecast) {
    forecast = getEffectivenessForecast(selectedStrategy, opponentStrategy)
  }

  // Calculate badge bonuses for selected strategy
  const badgeBonuses = selectedStrategy
    ? getBadgeBonusSummary(
        badges,
        [...selectedStrategy.contentTypes, selectedStrategy.deliveryType, selectedStrategy.performanceType]
      )
    : []

  return (
    <div className={`bg-zinc-800 rounded border-l-4 ${borderColors[borderColor]}`}>
      {/* Header */}
      <div
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {selectedStrategy ? getStrategyIcon(selectedStrategy.id) : '🎯'}
          </span>
          <div>
            <p className={`text-sm font-bold ${textColors[borderColor]}`}>
              {battlerName}'s Strategy
            </p>
            <p className="text-xs text-zinc-400">
              {selectedStrategy ? selectedStrategy.name : 'Select a strategy...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {forecast && (
            <ForecastBadge forecast={forecast} />
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          )}
        </div>
      </div>

      {/* Expanded Strategy List */}
      {isExpanded && (
        <div className="border-t border-zinc-700 p-2 space-y-1 max-h-80 overflow-y-auto">
          {ROUND_STRATEGIES.map((strategy) => (
            <StrategyOption
              key={strategy.id}
              strategy={strategy}
              isSelected={selectedStrategyId === strategy.id}
              onClick={() => {
                onStrategySelect(strategy)
                setIsExpanded(false)
              }}
            />
          ))}
        </div>
      )}

      {/* Selected Strategy Details */}
      {selectedStrategy && !isExpanded && (
        <div className="border-t border-zinc-700 p-3">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-zinc-500 mb-1">Content</p>
              <div className="flex flex-wrap gap-1">
                {selectedStrategy.contentTypes.map(ct => (
                  <span key={ct} className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">
                    {ct.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Delivery</p>
              <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">
                {selectedStrategy.deliveryType.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Performance</p>
              <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">
                {selectedStrategy.performanceType.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          {/* Badge Bonuses */}
          {badgeBonuses.length > 0 && (
            <div className="mt-3 pt-2 border-t border-zinc-700/50">
              <p className="text-[10px] text-zinc-500 mb-1 flex items-center gap-1">
                <Award className="w-3 h-3" /> Badge Bonuses Active
              </p>
              <div className="flex flex-wrap gap-1">
                {badgeBonuses.map((bb, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded text-[10px] text-orange-300"
                  >
                    +{(bb.bonus * 100).toFixed(0)}% {bb.content}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Strategy option in dropdown
function StrategyOption({
  strategy,
  isSelected,
  onClick,
}: {
  strategy: RoundStrategy
  isSelected: boolean
  onClick: () => void
}) {
  const colorClass = getStrategyColor(strategy.id)

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2 rounded transition-colors ${
        isSelected
          ? 'bg-zinc-600 border border-zinc-500'
          : 'hover:bg-zinc-700 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{getStrategyIcon(strategy.id)}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${colorClass.split(' ')[0]}`}>
            {strategy.name}
          </p>
          <p className="text-xs text-zinc-500 truncate">
            {strategy.description}
          </p>
        </div>
      </div>
      {/* Mini matchup indicators */}
      <div className="flex gap-2 mt-1 ml-7">
        {strategy.strengths.length > 0 && (
          <span className="text-[10px] text-green-400">
            <Target className="w-3 h-3 inline mr-0.5" />
            {strategy.strengths.length} strong
          </span>
        )}
        {strategy.weaknesses.length > 0 && (
          <span className="text-[10px] text-red-400">
            <Shield className="w-3 h-3 inline mr-0.5" />
            {strategy.weaknesses.length} weak
          </span>
        )}
      </div>
    </button>
  )
}

// Forecast badge showing advantage/disadvantage
function ForecastBadge({ forecast }: { forecast: EffectivenessForecast }) {
  const { advantage, advantageAmount, yourMultiplier } = forecast

  if (advantage === 'even') {
    return (
      <span className="px-2 py-1 bg-zinc-700 rounded text-xs text-zinc-400">
        EVEN
      </span>
    )
  }

  if (advantage === 'yours') {
    return (
      <span className="px-2 py-1 bg-green-500/20 rounded text-xs text-green-400 flex items-center gap-1">
        <Zap className="w-3 h-3" />
        +{(advantageAmount * 100).toFixed(0)}%
      </span>
    )
  }

  return (
    <span className="px-2 py-1 bg-red-500/20 rounded text-xs text-red-400 flex items-center gap-1">
      <Shield className="w-3 h-3" />
      -{(advantageAmount * 100).toFixed(0)}%
    </span>
  )
}

// Effectiveness Forecast Panel - shows before simulation
export function EffectivenessForecastPanel({
  strategyA,
  strategyB,
  battlerAName,
  battlerBName,
}: {
  strategyA: RoundStrategy | null
  strategyB: RoundStrategy | null
  battlerAName: string
  battlerBName: string
}) {
  if (!strategyA || !strategyB) {
    return (
      <div className="bg-zinc-800/50 rounded p-4 text-center">
        <p className="text-sm text-zinc-500">
          Select strategies for both battlers to see effectiveness forecast
        </p>
      </div>
    )
  }

  const forecastA = getEffectivenessForecast(strategyA, strategyB)
  const forecastB = getEffectivenessForecast(strategyB, strategyA)

  return (
    <div className="bg-zinc-800 rounded-lg p-4 space-y-4">
      <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
        <Zap className="w-4 h-4 text-orange-500" />
        Effectiveness Forecast
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {/* Battler A Forecast */}
        <div className={`p-3 rounded border ${
          forecastA.advantage === 'yours' ? 'border-green-500/50 bg-green-500/10' :
          forecastA.advantage === 'theirs' ? 'border-red-500/50 bg-red-500/10' :
          'border-zinc-600 bg-zinc-700/50'
        }`}>
          <p className="text-xs text-zinc-500 uppercase">{battlerAName}</p>
          <p className="text-2xl font-black text-white">
            {forecastA.yourMultiplier.toFixed(2)}x
          </p>
          <p className={`text-xs ${
            forecastA.advantage === 'yours' ? 'text-green-400' :
            forecastA.advantage === 'theirs' ? 'text-red-400' :
            'text-zinc-400'
          }`}>
            {forecastA.summary}
          </p>
        </div>

        {/* Battler B Forecast */}
        <div className={`p-3 rounded border ${
          forecastB.advantage === 'yours' ? 'border-green-500/50 bg-green-500/10' :
          forecastB.advantage === 'theirs' ? 'border-red-500/50 bg-red-500/10' :
          'border-zinc-600 bg-zinc-700/50'
        }`}>
          <p className="text-xs text-zinc-500 uppercase">{battlerBName}</p>
          <p className="text-2xl font-black text-white">
            {forecastB.yourMultiplier.toFixed(2)}x
          </p>
          <p className={`text-xs ${
            forecastB.advantage === 'yours' ? 'text-green-400' :
            forecastB.advantage === 'theirs' ? 'text-red-400' :
            'text-zinc-400'
          }`}>
            {forecastB.summary}
          </p>
        </div>
      </div>

      {/* Strong/Weak Matchup Details */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          {forecastA.yourMultiplier > 1.1 && (
            <div className="space-y-1">
              <p className="text-green-400 font-bold">{battlerAName}'s Strong Matchups:</p>
              {strategyA.strengths.slice(0, 2).map((s, i) => (
                <p key={i} className="text-zinc-400 pl-2">• {s}</p>
              ))}
            </div>
          )}
          {forecastA.yourMultiplier < 0.9 && (
            <div className="space-y-1">
              <p className="text-red-400 font-bold">{battlerAName}'s Weak Matchups:</p>
              {strategyA.weaknesses.slice(0, 2).map((s, i) => (
                <p key={i} className="text-zinc-400 pl-2">• {s}</p>
              ))}
            </div>
          )}
        </div>
        <div>
          {forecastB.yourMultiplier > 1.1 && (
            <div className="space-y-1">
              <p className="text-green-400 font-bold">{battlerBName}'s Strong Matchups:</p>
              {strategyB.strengths.slice(0, 2).map((s, i) => (
                <p key={i} className="text-zinc-400 pl-2">• {s}</p>
              ))}
            </div>
          )}
          {forecastB.yourMultiplier < 0.9 && (
            <div className="space-y-1">
              <p className="text-red-400 font-bold">{battlerBName}'s Weak Matchups:</p>
              {strategyB.weaknesses.slice(0, 2).map((s, i) => (
                <p key={i} className="text-zinc-400 pl-2">• {s}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
