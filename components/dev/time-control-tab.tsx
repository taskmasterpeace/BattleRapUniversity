"use client"

import { Clock } from "lucide-react"

interface TimeControlTabProps {
  gameDate: string
  setGameDate: (d: string) => void
  simulationSpeed: number
  setSimulationSpeed: (s: number) => void
  onAdvanceTime: (days: number) => void
}

export function TimeControlTab({
  gameDate,
  setGameDate,
  simulationSpeed,
  setSimulationSpeed,
  onAdvanceTime,
}: TimeControlTabProps) {
  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
      <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" /> TIME CONTROL
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-zinc-500 uppercase">Real Date</label>
          <div className="text-lg font-mono text-zinc-300">{new Date().toLocaleDateString()}</div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase">Virtual Game Date</label>
          <input
            type="date"
            value={gameDate}
            onChange={(e) => setGameDate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        <button
          onClick={() => onAdvanceTime(1)}
          className="py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-orange-500 text-sm"
        >
          +1D
        </button>
        <button
          onClick={() => onAdvanceTime(7)}
          className="py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-orange-500 text-sm"
        >
          +1W
        </button>
        <button
          onClick={() => onAdvanceTime(14)}
          className="py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-orange-500 text-sm"
        >
          +2W
        </button>
        <button
          onClick={() => onAdvanceTime(30)}
          className="py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-orange-500 text-sm"
        >
          +1M
        </button>
        <button
          onClick={() => setGameDate("2025-12-01")}
          className="py-2 bg-red-500/20 border border-red-500/50 text-red-400 text-sm"
        >
          RESET
        </button>
      </div>

      <div>
        <label className="text-xs text-zinc-500 uppercase">Simulation Speed</label>
        <div className="flex gap-2 mt-2">
          {[1, 2, 5, 10].map((speed) => (
            <button
              key={speed}
              onClick={() => setSimulationSpeed(speed)}
              className={`flex-1 py-2 border text-sm font-display ${simulationSpeed === speed ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-orange-500"}`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
