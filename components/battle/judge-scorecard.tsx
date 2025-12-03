"use client"

import { motion } from "framer-motion"
import { Trophy } from "lucide-react"

interface JudgeScorecardProps {
  rounds: {
    roundNum: number
    playerScore: number // 0-10
    opponentScore: number // 0-10
    playerWon: boolean
  }[]
  playerName: string
  opponentName: string
}

export function JudgeScorecard({ rounds, playerName, opponentName }: JudgeScorecardProps) {
  if (!rounds || rounds.length === 0) {
    return (
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg overflow-hidden">
        <div className="bg-zinc-800 px-6 py-4 border-b border-[#3a3d44]">
          <h3 className="font-display font-bold text-zinc-100 text-sm tracking-wide text-center">JUDGE SCORECARD</h3>
        </div>
        <div className="p-6 text-center text-zinc-500">No round data available</div>
      </div>
    )
  }

  const validRounds = rounds.filter(
    (r) => r && typeof r.playerScore === "number" && typeof r.opponentScore === "number",
  )

  const playerRoundsWon = validRounds.filter((r) => r.playerWon).length
  const opponentRoundsWon = validRounds.filter((r) => !r.playerWon).length
  const playerTotalScore = validRounds.reduce((sum, r) => sum + (r.playerScore ?? 0), 0)
  const opponentTotalScore = validRounds.reduce((sum, r) => sum + (r.opponentScore ?? 0), 0)
  const playerWins = playerRoundsWon > opponentRoundsWon

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg overflow-hidden">
      <div className="bg-zinc-800 px-6 py-4 border-b border-[#3a3d44]">
        <h3 className="font-display font-bold text-zinc-100 text-sm tracking-wide text-center">JUDGE SCORECARD</h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Header - battler names */}
        <div className="flex items-center justify-center gap-4 text-center pb-4 border-b border-zinc-700">
          <span className={`font-display font-bold text-lg ${playerWins ? "text-green-500" : "text-zinc-300"}`}>
            {playerName}
          </span>
          <span className="text-zinc-600 font-display">vs</span>
          <span className={`font-display font-bold text-lg ${!playerWins ? "text-green-500" : "text-zinc-300"}`}>
            {opponentName}
          </span>
        </div>

        {/* Round by round scores */}
        <div className="space-y-3">
          {validRounds.map((round, index) => {
            const playerScore = round.playerScore ?? 0
            const opponentScore = round.opponentScore ?? 0

            return (
              <motion.div
                key={round.roundNum}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="bg-zinc-800/50 border border-zinc-700 p-4 rounded"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-display text-zinc-500 uppercase tracking-wider">
                    Round {round.roundNum}
                  </span>
                  {round.playerWon && <span className="text-xs text-green-500">W</span>}
                  {!round.playerWon && <span className="text-xs text-red-500">L</span>}
                </div>

                <div className="flex items-center gap-4">
                  {/* Player score */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-mono font-bold text-lg ${round.playerWon ? "text-green-500" : "text-zinc-400"}`}
                      >
                        [{playerScore.toFixed(1)}]
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(playerScore / 10) * 100}%` }}
                        transition={{ delay: index * 0.15 + 0.2, duration: 0.5 }}
                        className={`h-full ${round.playerWon ? "bg-green-500" : "bg-zinc-600"}`}
                      />
                    </div>
                  </div>

                  <span className="text-zinc-600">─────</span>

                  {/* Opponent score */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-mono font-bold text-lg ${!round.playerWon ? "text-green-500" : "text-zinc-400"}`}
                      >
                        [{opponentScore.toFixed(1)}]
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(opponentScore / 10) * 100}%` }}
                        transition={{ delay: index * 0.15 + 0.2, duration: 0.5 }}
                        className={`h-full ${!round.playerWon ? "bg-green-500" : "bg-zinc-600"}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Final results */}
        <div className="pt-4 border-t-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400">
              FINAL:{" "}
              <span className="font-mono font-bold text-zinc-100">
                {playerRoundsWon}-{opponentRoundsWon}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className={`w-5 h-5 ${playerWins ? "text-amber-500" : "text-zinc-600"}`} />
              <span className={`font-display font-bold ${playerWins ? "text-green-500" : "text-red-500"}`}>
                WINNER: {playerWins ? playerName : opponentName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
