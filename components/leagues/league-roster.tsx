"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Users, ChevronDown } from "lucide-react"
import type { League } from "@/lib/leagues"

interface BattlerSummary {
  id: string
  name: string
  avatarUrl: string
  rating: number
  wins: number
  losses: number
  tier: "none" | "low" | "mid" | "top" | "god"
}

interface LeagueRosterProps {
  league: League
}

export function LeagueRoster({ league }: LeagueRosterProps) {
  const [sortBy, setSortBy] = useState<"rating" | "wins" | "winrate">("rating")
  const [showAll, setShowAll] = useState(false)

  // Generate mock battlers based on league
  const mockBattlers: BattlerSummary[] = Array.from({ length: league.battlerCount }, (_, i) => {
    const baseRating = league.avgRating + (Math.random() - 0.5) * 400
    const wins = Math.floor(5 + Math.random() * 20)
    const losses = Math.floor(2 + Math.random() * 12)

    return {
      id: `battler-${league.id}-${i}`,
      name: generateBattlerName(i),
      avatarUrl: `/placeholder.svg?height=64&width=64&query=battle rapper portrait ${i}`,
      rating: Math.round(baseRating),
      wins,
      losses,
      tier:
        baseRating >= 2000
          ? "god"
          : baseRating >= 1600
            ? "top"
            : baseRating >= 1200
              ? "mid"
              : baseRating >= 800
                ? "low"
                : "none",
    }
  })

  // Sort battlers
  const sortedBattlers = [...mockBattlers].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating
    if (sortBy === "wins") return b.wins - a.wins
    return b.wins / (b.wins + b.losses) - a.wins / (a.wins + a.losses)
  })

  const displayBattlers = showAll ? sortedBattlers : sortedBattlers.slice(0, 6)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold">LEAGUE ROSTER ({league.battlerCount})</h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500">Sort by:</span>
          {(["rating", "wins", "winrate"] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-2 py-1 rounded capitalize ${sortBy === sort ? "bg-orange-500/20 text-orange-400" : "text-zinc-400 hover:text-white"}`}
            >
              {sort === "winrate" ? "Win %" : sort}
            </button>
          ))}
        </div>
      </div>

      {/* Battler Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {displayBattlers.map((battler) => (
          <Link
            key={battler.id}
            href={`/battler/${battler.id}`}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 hover:border-orange-500/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-zinc-700 rounded overflow-hidden">
                <Image
                  src={battler.avatarUrl || "/placeholder.svg"}
                  alt={battler.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{battler.name}</p>
                <p className="text-xs text-orange-400">{battler.rating} ELO</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                {battler.wins}-{battler.losses}
              </span>
              <span className="text-zinc-500">
                {Math.round((battler.wins / (battler.wins + battler.losses)) * 100)}% WR
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${getTierBadge(battler.tier)}`}>
                {battler.tier}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {!showAll && sortedBattlers.length > 6 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-4 py-2 text-sm text-zinc-400 hover:text-white flex items-center justify-center gap-1"
        >
          Load More ({sortedBattlers.length - 6} remaining)
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function getTierBadge(tier: string): string {
  switch (tier) {
    case "god":
      return "bg-yellow-500/20 text-yellow-400"
    case "top":
      return "bg-purple-500/20 text-purple-400"
    case "mid":
      return "bg-blue-500/20 text-blue-400"
    case "low":
      return "bg-green-500/20 text-green-400"
    default:
      return "bg-zinc-500/20 text-zinc-400"
  }
}

function generateBattlerName(index: number): string {
  const prefixes = ["Lyric", "Bar", "Flow", "Punch", "Scheme", "Word", "Verse", "Mic", "Rhyme", "Spit"]
  const suffixes = ["Master", "King", "Lord", "God", "Wizard", "Savage", "Beast", "Killer", "Slayer", "Smith"]
  return `${prefixes[index % prefixes.length]} ${suffixes[Math.floor(index / prefixes.length) % suffixes.length]}`
}
