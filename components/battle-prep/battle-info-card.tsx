"use client"

import Image from "next/image"
import type { BattleInfo } from "@/lib/types"

interface BattleInfoCardProps {
  battle: BattleInfo
}

export function BattleInfoCard({ battle }: BattleInfoCardProps) {
  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-zinc-800 border-2 border-zinc-600 overflow-hidden">
          <Image
            src={battle.opponent.avatar || "/placeholder.svg"}
            alt={battle.opponent.name}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 font-mono">VS</span>
            <h2 className="text-xl font-display font-bold text-zinc-100">{battle.opponent.name}</h2>
            <span className="text-zinc-500">-</span>
            <span className="text-sm font-display text-zinc-400">{battle.opponent.tier}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-zinc-400 font-mono">{battle.league}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-sm text-zinc-400 font-mono">{battle.battleDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
