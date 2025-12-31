"use client"

import { cn } from "@/lib/utils"

interface BattleScoreTrackerProps {
  playerName: string
  opponentName: string
  playerScore: number
  opponentScore: number
  currentRound: number
  totalRounds: number
}

export function BattleScoreTracker({
  playerName,
  opponentName,
  playerScore,
  opponentScore,
  currentRound,
  totalRounds,
}: BattleScoreTrackerProps) {
  // Generate rounds array from scores
  const rounds = Array.from({ length: totalRounds }, (_, i) => ({
    roundIndex: i + 1,
    playerWon: i < playerScore ? true : i < playerScore + opponentScore ? false : null,
    completed: i < currentRound,
  }))

  return (
    <div className="border border-zinc-700 bg-zinc-900 p-4 rounded-lg">
      <div className="text-center mb-3">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">
          Round {currentRound} of {totalRounds}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {/* Player side */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm uppercase text-orange-500">{playerName}</span>
          <div className="flex gap-1">
            {rounds.map((round) => (
              <div
                key={round.roundIndex}
                className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                  !round.completed && "border-zinc-600 bg-transparent",
                  round.completed && round.playerWon === true && "border-green-500 bg-green-500",
                  round.completed && round.playerWon === false && "border-transparent bg-transparent",
                )}
              />
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="text-center">
          <span className="font-black text-2xl tabular-nums">
            <span className={playerScore > opponentScore ? "text-green-500" : "text-white"}>{playerScore}</span>
            <span className="text-zinc-600 mx-2">-</span>
            <span className={opponentScore > playerScore ? "text-red-500" : "text-white"}>{opponentScore}</span>
          </span>
        </div>

        {/* Opponent side */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {rounds.map((round) => (
              <div
                key={round.roundIndex}
                className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                  !round.completed && "border-zinc-600 bg-transparent",
                  round.completed && round.playerWon === false && "border-red-500 bg-red-500",
                  round.completed && round.playerWon === true && "border-transparent bg-transparent",
                )}
              />
            ))}
          </div>
          <span className="font-bold text-sm uppercase text-zinc-400">{opponentName}</span>
        </div>
      </div>

      {/* Status message */}
      {playerScore === 2 && <p className="text-center text-green-500 text-sm mt-2 font-bold uppercase">Victory!</p>}
      {opponentScore === 2 && <p className="text-center text-red-500 text-sm mt-2 font-bold uppercase">Defeat</p>}
      {playerScore === 1 && opponentScore === 1 && currentRound === 3 && (
        <p className="text-center text-orange-500 text-sm mt-2 font-bold uppercase">Round 3 Deciding!</p>
      )}
    </div>
  )
}
