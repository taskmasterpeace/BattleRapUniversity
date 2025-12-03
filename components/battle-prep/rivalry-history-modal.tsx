"use client"

import { X, Flame, TrendingUp } from "lucide-react"
import type { BattleInfo } from "@/lib/types"

interface RivalryHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  opponent: BattleInfo["opponent"]
  playerName: string
}

export function RivalryHistoryModal({ isOpen, onClose, opponent, playerName }: RivalryHistoryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-orange-500/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b-2 border-orange-500/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-display font-bold text-orange-500 tracking-wide">RIVALRY HISTORY:</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-5">
          {/* Rivalry Title */}
          <div className="text-center mb-5">
            <h3 className="text-xl font-display font-bold text-orange-400">
              {playerName} <span className="text-zinc-500">vs</span> {opponent.name}
            </h3>
          </div>

          {/* Head-to-Head Record */}
          <div className="bg-zinc-800/50 border border-zinc-700 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-display font-bold text-zinc-100 tracking-wide">HEAD-TO-HEAD:</span>
              <span className="text-orange-400 font-mono font-bold">1-0 (You Lead)</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-display font-bold text-zinc-100 tracking-wide">INTENSITY:</span>
              <span className="text-orange-500 font-mono font-bold">82/100 (Hot)</span>
            </div>
            <div className="h-3 bg-zinc-900 border border-zinc-700 overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-orange-600 to-red-500" style={{ width: "82%" }} />
            </div>
          </div>

          {/* Recent Battles */}
          <div className="bg-zinc-800/50 border border-zinc-700 p-4 mb-4">
            <h4 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-3">
              <span className="inline-flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500" />
                DEC 15, 2025:
              </span>
            </h4>
            <div className="pl-3 mb-4">
              <p className="text-sm text-zinc-300 mb-1">Controversial 2-1 Win (You) • 3 Media Articles</p>
              <p className="text-xs text-zinc-500">Close decision sparked debate across battle rap forums</p>
            </div>

            <h4 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-3">
              <span className="inline-flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500" />
                DEC 10, 2025:
              </span>
            </h4>
            <div className="pl-3">
              <p className="text-sm text-zinc-300 mb-1">Online Trash Talk • 1 Article</p>
              <p className="text-xs text-zinc-500">Social media beef intensified after comments</p>
            </div>
          </div>

          {/* Fan Sentiment */}
          <div className="bg-zinc-800/50 border border-zinc-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-display font-bold text-zinc-100 tracking-wide">FAN SENTIMENT:</span>
              <span className="text-orange-400 font-mono text-sm">70% Demand Rematch</span>
            </div>
            <div className="h-2 bg-zinc-900 border border-zinc-700 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400" style={{ width: "70%" }} />
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-4 py-2.5 text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}
