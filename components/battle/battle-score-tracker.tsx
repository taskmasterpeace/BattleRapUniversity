"use client"

import { cn } from "@/lib/utils"

interface BattleScoreTrackerProps {
  rounds: Array<{
    roundIndex: number
    playerWon: boolean | null
    tie: boolean
  }>
  playerName: string
  opponentName: string
}

export function BattleScoreTracker({ rounds, playerName, opponentName }: BattleScoreTrackerProps) {
  const playerWins = rounds.filter((r) => r.playerWon === true).length
  const opponentWins = rounds.filter((r) => r.playerWon === false).length

  return (
    <div className="border border-zinc-700 bg-zinc-900 p-4">
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
                  round.playerWon === null && "border-zinc-600 bg-transparent",
                  round.playerWon === true && "border-green-500 bg-green-500",
                  round.playerWon === false && "border-transparent bg-transparent",
                  round.tie && "border-zinc-500 bg-zinc-500",
                )}
              />
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="text-center">
          <span className="font-black text-2xl tabular-nums">
            <span className={playerWins > opponentWins ? "text-green-500" : "text-white"}>{playerWins}</span>
            <span className="text-zinc-600 mx-2">-</span>
            <span className={opponentWins > playerWins ? "text-red-500" : "text-white"}>{opponentWins}</span>
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
                  round.playerWon === null && "border-zinc-600 bg-transparent",
                  round.playerWon === false && "border-red-500 bg-red-500",
                  round.playerWon === true && "border-transparent bg-transparent",
                  round.tie && "border-zinc-500 bg-zinc-500",
                )}
              />
            ))}
          </div>
          <span className="font-bold text-sm uppercase text-zinc-400">{opponentName}</span>
        </div>
      </div>

      {/* Status message */}
      {playerWins === 2 && <p className="text-center text-green-500 text-sm mt-2 font-bold uppercase">Victory!</p>}
      {opponentWins === 2 && <p className="text-center text-red-500 text-sm mt-2 font-bold uppercase">Defeat</p>}
      {playerWins === 1 && opponentWins === 1 && rounds.filter((r) => r.playerWon !== null).length === 2 && (
        <p className="text-center text-orange-500 text-sm mt-2 font-bold uppercase">Round 3 Deciding!</p>
      )}
    </div>
  )
}
