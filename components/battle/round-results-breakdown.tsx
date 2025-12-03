"use client"

import { motion } from "framer-motion"
import { Zap, AlertTriangle, Trophy } from "lucide-react"

interface RoundResultsBreakdownProps {
  roundNum: number
  playerSegments: {
    segmentNum: number
    score: number
    contentUsed: string[]
    hadMoment: boolean
    momentType?: "haymaker" | "stumble" | "choke"
  }[]
  opponentSegments: {
    segmentNum: number
    score: number
    contentUsed: string[]
    hadMoment: boolean
    momentType?: "haymaker" | "stumble" | "choke"
  }[]
  playerTotal: number
  opponentTotal: number
  playerWon: boolean
  crowdReaction: number
}

const momentConfig = {
  haymaker: { label: "HAYMAKER!", color: "text-green-400", icon: Zap },
  stumble: { label: "STUMBLE", color: "text-amber-400", icon: AlertTriangle },
  choke: { label: "CHOKE!", color: "text-red-400", icon: AlertTriangle },
}

function getCrowdLabel(level: number): string {
  if (level >= 80) return "LEGENDARY MOMENT!"
  if (level >= 60) return "Crowd was going crazy!"
  if (level >= 40) return "Crowd was feeling it!"
  if (level >= 20) return "Crowd was paying attention"
  return "Crowd was quiet..."
}

export function RoundResultsBreakdown({
  roundNum,
  playerSegments,
  opponentSegments,
  playerTotal,
  opponentTotal,
  playerWon,
  crowdReaction,
}: RoundResultsBreakdownProps) {
  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg overflow-hidden">
      <div className="bg-zinc-800 px-4 py-3 border-b border-[#3a3d44]">
        <h3 className="font-display font-bold text-zinc-100 text-sm tracking-wide">ROUND {roundNum} BREAKDOWN</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Score summary */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">YOUR ROUND</div>
            <div className={`text-3xl font-mono font-bold ${playerWon ? "text-green-500" : "text-zinc-400"}`}>
              {playerTotal.toFixed(1)}
            </div>
            {playerWon && (
              <div className="flex items-center justify-center gap-1 mt-1 text-green-500 text-xs">
                <Trophy className="w-3 h-3" />
                WINNER
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">OPPONENT'S ROUND</div>
            <div className={`text-3xl font-mono font-bold ${!playerWon ? "text-green-500" : "text-zinc-400"}`}>
              {opponentTotal.toFixed(1)}
            </div>
            {!playerWon && (
              <div className="flex items-center justify-center gap-1 mt-1 text-green-500 text-xs">
                <Trophy className="w-3 h-3" />
                WINNER
              </div>
            )}
          </div>
        </div>

        {/* Segment by segment */}
        <div className="border-t border-zinc-700 pt-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">SEGMENT BY SEGMENT:</div>
          <div className="space-y-2">
            {playerSegments.map((seg, idx) => {
              const oppSeg = opponentSegments[idx]
              const playerWonSeg = seg.score > oppSeg.score

              return (
                <motion.div
                  key={seg.segmentNum}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-xs text-zinc-500 w-12">SEG {seg.segmentNum}:</span>

                  {/* Player score */}
                  <div className="flex-1 flex items-center gap-2">
                    <span className={`font-mono text-sm ${playerWonSeg ? "text-green-400" : "text-zinc-400"}`}>
                      [{seg.score.toFixed(1)}]
                    </span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(seg.score / 10) * 100}%` }}
                        transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
                        className={`h-full ${playerWonSeg ? "bg-green-500" : "bg-zinc-600"}`}
                      />
                    </div>
                  </div>

                  {/* Opponent score */}
                  <div className="flex-1 flex items-center gap-2">
                    <span className={`font-mono text-sm ${!playerWonSeg ? "text-green-400" : "text-zinc-400"}`}>
                      [{oppSeg.score.toFixed(1)}]
                    </span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(oppSeg.score / 10) * 100}%` }}
                        transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
                        className={`h-full ${!playerWonSeg ? "bg-green-500" : "bg-zinc-600"}`}
                      />
                    </div>
                  </div>

                  {/* Moment indicator */}
                  {seg.hadMoment && seg.momentType && (
                    <span className={`text-xs font-display ${momentConfig[seg.momentType].color}`}>
                      {momentConfig[seg.momentType].label}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Crowd reaction */}
        <div className="border-t border-zinc-700 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">CROWD REACTION:</span>
            <span className="font-mono text-zinc-300">{crowdReaction}/100</span>
          </div>
          <div className="text-sm text-zinc-400 mt-1">"{getCrowdLabel(crowdReaction)}"</div>
        </div>
      </div>
    </div>
  )
}
