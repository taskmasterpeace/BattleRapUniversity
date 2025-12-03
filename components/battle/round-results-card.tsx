"use client"

import { motion } from "framer-motion"
import { Trophy, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { type RoundResult, type SegmentScore, getMultiplierColor } from "@/lib/round-crafting"
import { ContentTypeBadge } from "./content-type-badge"
import { SegmentTimeline } from "./segment-timeline"

interface RoundResultsCardProps {
  roundIndex: 1 | 2 | 3
  playerResult: RoundResult
  opponentResult: RoundResult
  playerSegments: SegmentScore[]
  opponentSegments: SegmentScore[]
  roundWinner: "player" | "opponent" | "tie"
  playerName: string
  opponentName: string
}

export function RoundResultsCard({
  roundIndex,
  playerResult,
  opponentResult,
  playerSegments,
  opponentSegments,
  roundWinner,
  playerName,
  opponentName,
}: RoundResultsCardProps) {
  return (
    <div className="border border-zinc-700 bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-800 p-4 border-b border-zinc-700">
        <h2 className="font-black text-xl uppercase tracking-tight text-center">Round {roundIndex} Complete</h2>
      </div>

      {/* Score comparison */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Player */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "text-center p-4 border",
              roundWinner === "player" ? "border-green-500 bg-green-500/10" : "border-zinc-700",
            )}
          >
            {roundWinner === "player" && <Trophy className="w-6 h-6 text-green-500 mx-auto mb-2" />}
            <p className="text-sm text-orange-500 font-bold uppercase mb-2">{playerName}</p>
            <p
              className={cn(
                "font-black text-5xl tabular-nums",
                roundWinner === "player" ? "text-green-400" : "text-white",
              )}
            >
              {playerResult.averageScore.toFixed(2)}
            </p>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-zinc-400">
              <span>Peak: {playerResult.peakScore.toFixed(1)}</span>
              <span>Consistency: {playerResult.consistencyScore}%</span>
            </div>
            {playerResult.choked && (
              <div className="flex items-center justify-center gap-1 mt-2 text-red-500 text-sm">
                <X className="w-4 h-4" />
                <span>Choked</span>
              </div>
            )}
          </motion.div>

          {/* Opponent */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "text-center p-4 border",
              roundWinner === "opponent" ? "border-red-500 bg-red-500/10" : "border-zinc-700",
            )}
          >
            {roundWinner === "opponent" && <Trophy className="w-6 h-6 text-red-500 mx-auto mb-2" />}
            <p className="text-sm text-zinc-400 font-bold uppercase mb-2">{opponentName}</p>
            <p
              className={cn(
                "font-black text-5xl tabular-nums",
                roundWinner === "opponent" ? "text-red-400" : "text-white",
              )}
            >
              {opponentResult.averageScore.toFixed(2)}
            </p>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-zinc-400">
              <span>Peak: {opponentResult.peakScore.toFixed(1)}</span>
              <span>Consistency: {opponentResult.consistencyScore}%</span>
            </div>
            {opponentResult.choked && (
              <div className="flex items-center justify-center gap-1 mt-2 text-red-500 text-sm">
                <X className="w-4 h-4" />
                <span>Choked</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Selections breakdown */}
      <div className="p-6 pt-0 space-y-4">
        {/* Player selections */}
        <div className="border border-zinc-700 p-4">
          <p className="text-xs text-zinc-500 uppercase mb-2">Your Selections</p>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {playerResult.contentTypes.map((t) => (
                <ContentTypeBadge key={t} type={t} category="content" size="sm" />
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {playerResult.deliveryTypes.map((t) => (
                <ContentTypeBadge key={t} type={t} category="delivery" size="sm" />
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {playerResult.performanceTypes.map((t) => (
                <ContentTypeBadge key={t} type={t} category="performance" size="sm" />
              ))}
            </div>
          </div>

          {/* Multipliers */}
          <div className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-4 gap-2 text-xs">
            <div>
              <p className="text-zinc-500">Effect</p>
              <p className={getMultiplierColor(playerResult.effectivenessMultiplier)}>
                {playerResult.effectivenessMultiplier.toFixed(2)}x
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Crowd</p>
              <p className={getMultiplierColor(playerResult.crowdPreferenceMultiplier)}>
                {playerResult.crowdPreferenceMultiplier.toFixed(2)}x
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Context</p>
              <p className={getMultiplierColor(playerResult.contextModifier)}>
                {playerResult.contextModifier.toFixed(2)}x
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Final</p>
              <p className={cn("font-bold", getMultiplierColor(playerResult.finalMultiplier))}>
                {playerResult.finalMultiplier.toFixed(2)}x
              </p>
            </div>
          </div>
        </div>

        {/* Opponent selections */}
        <div className="border border-zinc-700 p-4">
          <p className="text-xs text-zinc-500 uppercase mb-2">Opponent's Selections</p>
          <div className="flex flex-wrap gap-1">
            {opponentResult.contentTypes.map((t) => (
              <ContentTypeBadge key={t} type={t} category="content" size="sm" />
            ))}
            {opponentResult.deliveryTypes.map((t) => (
              <ContentTypeBadge key={t} type={t} category="delivery" size="sm" />
            ))}
            {opponentResult.performanceTypes.map((t) => (
              <ContentTypeBadge key={t} type={t} category="performance" size="sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Segment timeline */}
      <div className="p-6 pt-0">
        <p className="text-xs text-zinc-500 uppercase mb-3">Segment Timeline</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-orange-500 mb-2">{playerName}</p>
            <SegmentTimeline segments={playerSegments} />
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-2">{opponentName}</p>
            <SegmentTimeline segments={opponentSegments} />
          </div>
        </div>
      </div>
    </div>
  )
}
