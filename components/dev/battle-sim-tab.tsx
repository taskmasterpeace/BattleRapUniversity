"use client"

import { Trophy, Play } from "lucide-react"

interface Opponent {
  id: string
  name: string
  rating: number
  style: string
}

interface BattleSimTabProps {
  opponents: Opponent[]
  selectedOpponent: string
  setSelectedOpponent: (id: string) => void
  battleMargin: "close" | "clear" | "dominant"
  setBattleMargin: (m: "close" | "clear" | "dominant") => void
  playerChoke: boolean
  setPlayerChoke: (v: boolean) => void
  opponentChoke: boolean
  setOpponentChoke: (v: boolean) => void
  onSimulate: (result: "win" | "loss" | "random") => void
}

export function BattleSimTab({
  opponents,
  selectedOpponent,
  setSelectedOpponent,
  battleMargin,
  setBattleMargin,
  playerChoke,
  setPlayerChoke,
  opponentChoke,
  setOpponentChoke,
  onSimulate,
}: BattleSimTabProps) {
  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
      <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4" /> BATTLE SIMULATION
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Opponent Selection */}
        <div>
          <label className="text-xs text-zinc-500 uppercase mb-1 block">Select Opponent</label>
          <select
            value={selectedOpponent}
            onChange={(e) => setSelectedOpponent(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100"
          >
            {opponents.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.name} ({opp.rating} - {opp.style})
              </option>
            ))}
          </select>
        </div>

        {/* Battle Margin */}
        <div>
          <label className="text-xs text-zinc-500 uppercase mb-1 block">Victory Margin</label>
          <div className="flex gap-2">
            {(["close", "clear", "dominant"] as const).map((margin) => (
              <button
                key={margin}
                onClick={() => setBattleMargin(margin)}
                className={`flex-1 py-2 border text-sm capitalize ${battleMargin === margin ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}
              >
                {margin}
              </button>
            ))}
          </div>
        </div>

        {/* Choke Options */}
        <div className="sm:col-span-2 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={playerChoke}
              onChange={(e) => setPlayerChoke(e.target.checked)}
              className="accent-red-500"
            />
            <span className="text-sm text-zinc-300">Player Chokes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={opponentChoke}
              onChange={(e) => setOpponentChoke(e.target.checked)}
              className="accent-green-500"
            />
            <span className="text-sm text-zinc-300">Opponent Chokes</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onSimulate("win")}
          className="py-4 bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 font-display uppercase flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" /> WIN
        </button>
        <button
          onClick={() => onSimulate("loss")}
          className="py-4 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 font-display uppercase flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" /> LOSS
        </button>
        <button
          onClick={() => onSimulate("random")}
          className="py-4 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-orange-500 font-display uppercase flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" /> RANDOM
        </button>
      </div>
    </div>
  )
}
