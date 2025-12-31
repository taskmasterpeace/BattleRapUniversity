"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Category {
  name: string
  playerScore: number
  opponentScore: number
}

interface RoundResultsBreakdownProps {
  playerName: string
  opponentName: string
  categories: Category[]
}

export function RoundResultsBreakdown({
  playerName,
  opponentName,
  categories,
}: RoundResultsBreakdownProps) {
  const playerTotal = categories.reduce((sum, cat) => sum + cat.playerScore, 0)
  const opponentTotal = categories.reduce((sum, cat) => sum + cat.opponentScore, 0)
  const playerWon = playerTotal > opponentTotal

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
      <div className="bg-zinc-800 px-4 py-3 border-b border-zinc-700">
        <h3 className="font-display font-bold text-zinc-100 text-sm tracking-wide uppercase">
          Performance Breakdown
        </h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_80px_80px] gap-4 text-xs text-zinc-500 uppercase tracking-wider">
          <div>Category</div>
          <div className="text-center text-orange-500">{playerName}</div>
          <div className="text-center">{opponentName}</div>
        </div>

        {/* Categories */}
        {categories.map((category, idx) => {
          const playerWonCategory = category.playerScore > category.opponentScore
          return (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="grid grid-cols-[1fr_80px_80px] gap-4 items-center"
            >
              <div className="text-sm text-zinc-300">{category.name}</div>
              <div
                className={cn(
                  "text-center font-mono text-sm font-bold",
                  playerWonCategory ? "text-green-400" : "text-zinc-400"
                )}
              >
                {category.playerScore.toFixed(1)}
              </div>
              <div
                className={cn(
                  "text-center font-mono text-sm font-bold",
                  !playerWonCategory ? "text-green-400" : "text-zinc-400"
                )}
              >
                {category.opponentScore.toFixed(1)}
              </div>
            </motion.div>
          )
        })}

        {/* Totals */}
        <div className="border-t border-zinc-700 pt-4 mt-4">
          <div className="grid grid-cols-[1fr_80px_80px] gap-4 items-center">
            <div className="text-sm font-bold text-zinc-100 uppercase">Total</div>
            <div
              className={cn(
                "text-center font-mono text-lg font-black",
                playerWon ? "text-green-400" : "text-zinc-400"
              )}
            >
              {playerTotal.toFixed(1)}
            </div>
            <div
              className={cn(
                "text-center font-mono text-lg font-black",
                !playerWon ? "text-green-400" : "text-zinc-400"
              )}
            >
              {opponentTotal.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
