"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, ArrowLeftRight, X } from "lucide-react"

interface RoundShiftModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmShift: () => void
  currentRound: number
  opponentRoundScore: number
  rounds: {
    roundNum: number
    primaryContent: string
    isRehearsed: boolean
  }[]
  shiftsRemaining: number
}

export function RoundShiftModal({
  isOpen,
  onClose,
  onConfirmShift,
  currentRound,
  opponentRoundScore,
  rounds,
  shiftsRemaining,
}: RoundShiftModalProps) {
  if (!isOpen) return null

  const remainingRounds = rounds.filter((r) => r.roundNum > currentRound)
  const opponentWasStrong = opponentRoundScore >= 7.5
  const opponentWasWeak = opponentRoundScore < 6.5

  // Calculate penalty
  const basePenalty = 5
  const rehearsedPenalty = remainingRounds.some((r) => r.isRehearsed) ? 10 : 0
  const totalPenalty = basePenalty + rehearsedPenalty

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-900 border-2 border-zinc-700 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-zinc-700 bg-zinc-800">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-display font-bold text-zinc-100">ROUND SHIFT</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-zinc-700 transition-colors">
              <X className="w-6 h-6 text-zinc-400" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Opponent Performance */}
            <div
              className={`p-4 border ${opponentWasStrong ? "border-red-500/30 bg-red-500/10" : opponentWasWeak ? "border-green-500/30 bg-green-500/10" : "border-zinc-700 bg-zinc-800"}`}
            >
              <div className="text-sm text-zinc-400">Opponent's Round {currentRound}:</div>
              <div
                className={`text-2xl font-display font-bold ${opponentWasStrong ? "text-red-400" : opponentWasWeak ? "text-green-400" : "text-zinc-300"}`}
              >
                {opponentRoundScore.toFixed(1)}/10 -{" "}
                {opponentWasStrong ? "STRONG" : opponentWasWeak ? "WEAK" : "AVERAGE"}
              </div>
            </div>

            {/* Shift Option */}
            <div className="space-y-3">
              <div className="text-sm text-zinc-300">You can shift your remaining rounds:</div>

              <div className="space-y-2">
                <div className="text-xs text-zinc-500">CURRENT ORDER:</div>
                {remainingRounds.map((round) => (
                  <div
                    key={round.roundNum}
                    className="flex items-center justify-between p-2 bg-zinc-800 border border-zinc-700"
                  >
                    <span className="font-mono text-zinc-400">Round {round.roundNum}</span>
                    <span className="text-sm text-zinc-300">{round.primaryContent}</span>
                    {round.isRehearsed && <span className="text-xs text-purple-400">REHEARSED</span>}
                  </div>
                ))}
              </div>

              <div className="text-xs text-zinc-500">AFTER SHIFT:</div>
              {remainingRounds
                .slice()
                .reverse()
                .map((round, idx) => (
                  <div
                    key={round.roundNum}
                    className="flex items-center justify-between p-2 bg-yellow-500/10 border border-yellow-500/30"
                  >
                    <span className="font-mono text-yellow-400">Round {currentRound + 1 + idx}</span>
                    <span className="text-sm text-zinc-300">{round.primaryContent}</span>
                  </div>
                ))}
            </div>

            {/* Penalty Warning */}
            <div className="p-3 bg-zinc-800 border border-zinc-700 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="text-yellow-400 font-bold">PENALTY: -{totalPenalty}% consistency</div>
                <div className="text-zinc-500 mt-1">
                  {basePenalty}% base adaptation confusion
                  {rehearsedPenalty > 0 && (
                    <span className="block">+{rehearsedPenalty}% for shifting rehearsed rounds</span>
                  )}
                </div>
              </div>
            </div>

            {/* Shifts Remaining */}
            <div className="text-center text-sm text-zinc-500">
              Shifts remaining this battle: <span className="text-orange-400 font-bold">{shiftsRemaining}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t-2 border-zinc-700 bg-zinc-800 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-display font-bold transition-colors"
            >
              KEEP ORDER
            </button>
            <button
              onClick={() => {
                onConfirmShift()
                onClose()
              }}
              disabled={shiftsRemaining === 0}
              className={`flex-1 px-4 py-3 font-display font-bold transition-colors ${
                shiftsRemaining > 0
                  ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                  : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              }`}
            >
              SHIFT ROUNDS
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
