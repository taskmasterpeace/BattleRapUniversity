"use client"

import { Users } from "lucide-react"
import type { BattlerTier } from "@/lib/types"

interface PlayerStateTabProps {
  playerRating: number
  setPlayerRating: (v: number) => void
  balance: number
  setBalance: (v: number) => void
  xp: number
  setXp: (v: number) => void
  authenticity: number
  setAuthenticity: (v: number) => void
  stressLevel: number
  setStressLevel: (v: number) => void
  onReset: () => void
  addLog: (msg: string) => void
}

function getTier(elo: number): BattlerTier {
  if (elo >= 2000) return "god"
  if (elo >= 1600) return "top"
  if (elo >= 1200) return "mid"
  if (elo >= 800) return "low"
  return "none"
}

function getLevel(xp: number) {
  return Math.floor(xp / 500) + 1
}

export function PlayerStateTab({
  playerRating,
  setPlayerRating,
  balance,
  setBalance,
  xp,
  setXp,
  authenticity,
  setAuthenticity,
  stressLevel,
  setStressLevel,
  onReset,
}: PlayerStateTabProps) {
  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
      <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" /> PLAYER STATE
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Rating */}
        <div>
          <label className="text-xs text-zinc-500 uppercase">Rating (ELO)</label>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="number"
              value={playerRating}
              onChange={(e) => setPlayerRating(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-zinc-100 font-mono text-sm"
            />
            <button
              onClick={() => setPlayerRating(playerRating + 100)}
              className="px-2 py-1.5 bg-green-500/20 border border-green-500/50 text-green-400 text-xs"
            >
              +100
            </button>
            <button
              onClick={() => setPlayerRating(Math.max(0, playerRating - 50))}
              className="px-2 py-1.5 bg-red-500/20 border border-red-500/50 text-red-400 text-xs"
            >
              -50
            </button>
          </div>
          <div
            className={`mt-1 text-xs font-display ${getTier(playerRating) === "god" ? "text-yellow-400" : getTier(playerRating) === "top" ? "text-purple-400" : getTier(playerRating) === "mid" ? "text-blue-400" : getTier(playerRating) === "low" ? "text-green-400" : "text-zinc-500"}`}
          >
            {getTier(playerRating).toUpperCase()} TIER
          </div>
        </div>

        {/* Balance */}
        <div>
          <label className="text-xs text-zinc-500 uppercase">Balance ($)</label>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-zinc-100 font-mono text-sm"
            />
            <button
              onClick={() => setBalance(balance + 1000)}
              className="px-2 py-1.5 bg-green-500/20 border border-green-500/50 text-green-400 text-xs"
            >
              +1k
            </button>
            <button
              onClick={() => setBalance(Math.max(0, balance - 1000))}
              className="px-2 py-1.5 bg-red-500/20 border border-red-500/50 text-red-400 text-xs"
            >
              -1k
            </button>
          </div>
        </div>

        {/* XP */}
        <div>
          <label className="text-xs text-zinc-500 uppercase">XP (Level {getLevel(xp)})</label>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="number"
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-zinc-100 font-mono text-sm"
            />
            <button
              onClick={() => setXp(xp + 500)}
              className="px-2 py-1.5 bg-purple-500/20 border border-purple-500/50 text-purple-400 text-xs"
            >
              LVL+
            </button>
          </div>
        </div>

        {/* Authenticity */}
        <div>
          <label className="text-xs text-zinc-500 uppercase">Authenticity</label>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="number"
              value={authenticity}
              onChange={(e) => setAuthenticity(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-full bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-zinc-100 font-mono text-sm"
            />
            <button
              onClick={() => setAuthenticity(Math.min(100, authenticity + 10))}
              className="px-2 py-1.5 bg-green-500/20 border border-green-500/50 text-green-400 text-xs"
            >
              +10
            </button>
            <button
              onClick={() => setAuthenticity(Math.max(0, authenticity - 10))}
              className="px-2 py-1.5 bg-red-500/20 border border-red-500/50 text-red-400 text-xs"
            >
              -10
            </button>
          </div>
        </div>

        {/* Stress - full width */}
        <div className="col-span-2 sm:col-span-4">
          <label className="text-xs text-zinc-500 uppercase">Stress Level ({stressLevel}%)</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              min="0"
              max="100"
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              className="flex-1 accent-orange-500"
            />
            <button
              onClick={() => setStressLevel(Math.min(100, stressLevel + 10))}
              className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-xs"
            >
              +10
            </button>
            <button
              onClick={() => setStressLevel(Math.max(0, stressLevel - 10))}
              className="px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs"
            >
              -10
            </button>
          </div>
          <div
            className={`text-xs mt-1 ${stressLevel > 70 ? "text-red-500" : stressLevel > 40 ? "text-yellow-500" : "text-green-500"}`}
          >
            {stressLevel > 70 ? "DANGER - Choke risk high!" : stressLevel > 40 ? "Moderate stress" : "Relaxed"}
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full mt-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 font-display uppercase text-sm"
      >
        Full Reset (Rating, Balance, XP, Stress, Rivalries, Attributes)
      </button>
    </div>
  )
}
