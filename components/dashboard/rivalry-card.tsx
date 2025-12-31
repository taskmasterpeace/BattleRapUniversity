"use client"

import Image from "next/image"
import type { Rivalry } from "@/lib/types"
import { Flame, ArrowRight } from "lucide-react"

interface RivalryCardProps {
  rivalry: Rivalry
  compact?: boolean
}

export function RivalryCard({ rivalry, compact }: RivalryCardProps) {
  const spriteUrl = rivalry.opponent.avatar || "/placeholder.svg"

  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-zinc-800 border border-zinc-600 overflow-hidden">
          <Image
            src={spriteUrl || "/placeholder.svg"}
            alt={rivalry.opponent.name}
            width={48}
            height={48}
            className="w-full h-full object-cover object-top pixelated"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-display font-bold text-zinc-100">{rivalry.opponent.name}</span>
          </div>
        </div>
      </div>

      {/* Intensity Bar */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-display">INTENSITY</span>
          <span className="text-orange-500 font-mono">{rivalry.intensity}%</span>
        </div>
        <div className="h-2 bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-600 to-red-500"
            style={{ width: `${rivalry.intensity}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <div>
          <span className="text-zinc-500">REMATCH DEMAND:</span>
          <span className="text-zinc-100 ml-1 font-mono">{rivalry.rematchDemand}%</span>
        </div>
        <div className="flex items-center gap-1 text-orange-500">
          <span>Rematch</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
      <div className="text-xs text-zinc-500 mt-1">
        LAST BATTLE: <span className="text-orange-500">{rivalry.lastBattle}</span>
      </div>
    </div>
  )
}
