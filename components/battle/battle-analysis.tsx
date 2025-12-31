"use client"

import { motion } from "framer-motion"
import { Target, Shield, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react"

interface AnalysisPoint {
  category: "strength" | "weakness" | "opportunity" | "threat"
  title: string
  description: string
  impact: "high" | "medium" | "low"
}

interface BattleAnalysisProps {
  playerPerformance: {
    bestMoment: string // "Round 2 haymaker"
    worstMoment: string // "Round 3 stumble"
    effectiveContent: string[] // ["Wordplay", "Angles"]
    ineffectiveContent: string[] // ["Comedy"]
    crowdHighPoint: number // 0-100
    crowdLowPoint: number // 0-100
  }
  opponentPerformance: {
    bestMoment: string
    worstMoment: string
    effectiveContent: string[]
    ineffectiveContent: string[]
  }
  keyTurningPoint: string // "Round 2 rebuttal shifted momentum"
}

const categoryConfig = {
  strength: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  weakness: { icon: AlertCircle, color: "text-red-500", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" },
  opportunity: {
    icon: Target,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  threat: { icon: Shield, color: "text-purple-500", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
}

const impactBadges = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
}

export function BattleAnalysis({ playerPerformance, opponentPerformance, keyTurningPoint }: BattleAnalysisProps) {
  // Defensive defaults for missing data
  const player = {
    bestMoment: playerPerformance?.bestMoment || "No standout moment",
    worstMoment: playerPerformance?.worstMoment || "Stayed consistent",
    effectiveContent: playerPerformance?.effectiveContent || [],
    ineffectiveContent: playerPerformance?.ineffectiveContent || [],
    crowdHighPoint: playerPerformance?.crowdHighPoint ?? 75,
    crowdLowPoint: playerPerformance?.crowdLowPoint ?? 50,
  }

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg overflow-hidden">
      <div className="bg-zinc-800 px-4 py-3 border-b border-[#3a3d44]">
        <h3 className="font-display font-bold text-zinc-100 text-sm tracking-wide">BATTLE ANALYSIS</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Your performance */}
        <div>
          <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">YOUR PERFORMANCE</h4>
          <div className="border-t border-zinc-700 pt-3 space-y-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-zinc-500">BEST MOMENT:</span>
                <p className="text-sm text-zinc-200">{player.bestMoment}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-zinc-500">WORST MOMENT:</span>
                <p className="text-sm text-zinc-200">{player.worstMoment}</p>
              </div>
            </div>
          </div>
        </div>

        {/* What worked / didn't */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">WHAT WORKED:</h5>
            <div className="space-y-1">
              {player.effectiveContent.map((content) => (
                <motion.div
                  key={content}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="text-green-400">[{content}]</span>
                  <span className="text-green-500 text-xs">+1.2x</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">WHAT DIDN'T:</h5>
            <div className="space-y-1">
              {player.ineffectiveContent.map((content) => (
                <motion.div
                  key={content}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="text-red-400">[{content}]</span>
                  <span className="text-red-500 text-xs">0.7x</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Key turning point */}
        <div className="border-t border-zinc-700 pt-4">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h5 className="text-xs text-zinc-500 uppercase tracking-wider mb-1">KEY TURNING POINT</h5>
              <p className="text-sm text-zinc-200">"{keyTurningPoint}"</p>
            </div>
          </div>
        </div>

        {/* Crowd reaction range */}
        <div className="border-t border-zinc-700 pt-4">
          <h5 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">CROWD REACTION RANGE</h5>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">Low: {player.crowdLowPoint}</span>
            <div className="flex-1 h-3 bg-zinc-800 rounded overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${player.crowdHighPoint}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-zinc-600 via-orange-500 to-green-500"
              />
              {/* Low point marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                style={{ left: `${player.crowdLowPoint}%` }}
              />
              {/* High point marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-green-400"
                style={{ left: `${player.crowdHighPoint}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400">High: {player.crowdHighPoint}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
