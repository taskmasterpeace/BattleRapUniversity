"use client"

import { motion } from "framer-motion"
import { Trophy, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoundResultsCardProps {
  roundNumber: number
  playerName: string
  opponentName: string
  playerScore: number
  opponentScore: number
  playerSelections: {
    content: string
    delivery: string
    performance: string
  }
  opponentSelections: {
    content: string
    delivery: string
    performance: string
  }
  winner: "player" | "opponent" | "tie"
}

export function RoundResultsCard({
  roundNumber,
  playerName,
  opponentName,
  playerScore,
  opponentScore,
  playerSelections,
  opponentSelections,
  winner,
}: RoundResultsCardProps) {
  return (
    <div className="border border-zinc-700 bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-800 p-4 border-b border-zinc-700">
        <h2 className="font-black text-xl uppercase tracking-tight text-center">
          Round {roundNumber} Complete
        </h2>
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
              winner === "player" ? "border-green-500 bg-green-500/10" : "border-zinc-700",
            )}
          >
            {winner === "player" && <Trophy className="w-6 h-6 text-green-500 mx-auto mb-2" />}
            <p className="text-sm text-orange-500 font-bold uppercase mb-2">{playerName}</p>
            <p
              className={cn(
                "font-black text-5xl tabular-nums",
                winner === "player" ? "text-green-400" : "text-white",
              )}
            >
              {playerScore.toFixed(1)}
            </p>
            <div className="mt-3 space-y-1 text-xs text-zinc-400">
              <p><span className="text-purple-400">Content:</span> {playerSelections.content}</p>
              <p><span className="text-blue-400">Delivery:</span> {playerSelections.delivery}</p>
              <p><span className="text-emerald-400">Energy:</span> {playerSelections.performance}</p>
            </div>
          </motion.div>

          {/* Opponent */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "text-center p-4 border",
              winner === "opponent" ? "border-red-500 bg-red-500/10" : "border-zinc-700",
            )}
          >
            {winner === "opponent" && <Trophy className="w-6 h-6 text-red-500 mx-auto mb-2" />}
            <p className="text-sm text-zinc-400 font-bold uppercase mb-2">{opponentName}</p>
            <p
              className={cn(
                "font-black text-5xl tabular-nums",
                winner === "opponent" ? "text-red-400" : "text-white",
              )}
            >
              {opponentScore.toFixed(1)}
            </p>
            <div className="mt-3 space-y-1 text-xs text-zinc-400">
              <p><span className="text-purple-400">Content:</span> {opponentSelections.content}</p>
              <p><span className="text-blue-400">Delivery:</span> {opponentSelections.delivery}</p>
              <p><span className="text-emerald-400">Energy:</span> {opponentSelections.performance}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Winner announcement */}
      <div className="px-6 pb-6">
        <div
          className={cn(
            "p-4 text-center border",
            winner === "player"
              ? "border-green-500/30 bg-green-500/10"
              : winner === "opponent"
                ? "border-red-500/30 bg-red-500/10"
                : "border-zinc-700 bg-zinc-800",
          )}
        >
          <p className="font-black text-lg uppercase tracking-tight">
            {winner === "player" ? (
              <span className="text-green-500">You won this round!</span>
            ) : winner === "opponent" ? (
              <span className="text-red-500">{opponentName} took this round</span>
            ) : (
              <span className="text-zinc-400">Debatable Round</span>
            )}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {Math.abs(playerScore - opponentScore) < 0.5
              ? "A close round that could go either way"
              : Math.abs(playerScore - opponentScore) < 1.0
                ? "Clear but not dominant"
                : "Dominant performance"}
          </p>
        </div>
      </div>
    </div>
  )
}
