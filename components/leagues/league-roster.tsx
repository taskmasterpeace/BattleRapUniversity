"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Users, ChevronDown, Trophy, Crown, Star, Zap, Loader2 } from "lucide-react"
import type { League } from "@/lib/leagues"

interface BattlerSummary {
  id: string
  name: string
  avatarUrl?: string
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
  const [battlers, setBattlers] = useState<BattlerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real battlers from database
  useEffect(() => {
    async function fetchBattlers() {
      try {
        setLoading(true)
        setError(null)

        // Try to extract UUID from league.id
        // The league.id might be a slug like "underground-kings" or a UUID
        // We need to fetch from the database using the league ID from the mock data
        const response = await fetch(`/api/leagues/${league.id}/battlers`)

        if (!response.ok) {
          throw new Error('Failed to fetch battlers')
        }

        const data = await response.json()
        setBattlers(data.battlers || [])
      } catch (err) {
        console.error('Error fetching battlers:', err)
        setError(err instanceof Error ? err.message : 'Failed to load battlers')
      } finally {
        setLoading(false)
      }
    }

    fetchBattlers()
  }, [league.id])

  // Sort battlers
  const sortedBattlers = [...battlers].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating
    if (sortBy === "wins") return b.wins - a.wins
    const aWinrate = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0
    const bWinrate = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0
    return bWinrate - aWinrate
  })

  const displayBattlers = showAll ? sortedBattlers : sortedBattlers.slice(0, 6)

  return (
    <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 overflow-hidden">
      {/* Accent gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(to right, ${league.primaryColor}, ${league.secondaryColor})` }}
      />

      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 border border-blue-500/30">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-black uppercase tracking-wider">
              League Roster <span className="text-zinc-500 font-normal">({battlers.length})</span>
            </h3>
          </div>

          <div className="flex items-center gap-1 text-xs bg-zinc-800/80 border border-zinc-700/50 p-1">
            {(["rating", "wins", "winrate"] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-2 py-1 capitalize font-bold transition-all ${
                  sortBy === sort
                    ? "bg-orange-500 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                }`}
              >
                {sort === "winrate" ? "Win %" : sort}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            <span className="ml-3 text-zinc-400 font-bold uppercase text-sm">Loading roster...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 text-center">
            <p className="text-red-400 font-bold uppercase text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && battlers.length === 0 && (
          <div className="bg-zinc-800/50 border border-zinc-700/50 p-8 text-center">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-bold uppercase text-sm">No battlers currently signed</p>
            <p className="text-zinc-500 text-xs mt-1">Check back soon for roster updates</p>
          </div>
        )}

        {/* Battler Grid */}
        {!loading && !error && battlers.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {displayBattlers.map((battler, index) => (
            <Link
              key={battler.id}
              href={`/battler/${battler.id}`}
              className="group relative bg-zinc-800/50 border border-zinc-700/50 p-3 hover:border-orange-500/50 transition-all overflow-hidden"
            >
              {/* Rank indicator for top 3 */}
              {index < 3 && sortBy === "rating" && (
                <div className="absolute top-0 left-0 z-10">
                  <div className={`px-1.5 py-0.5 text-[10px] font-black ${
                    index === 0 ? "bg-yellow-500 text-black" :
                    index === 1 ? "bg-zinc-300 text-black" :
                    "bg-amber-700 text-white"
                  }`}>
                    #{index + 1}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-2">
                <div className="relative w-10 h-10 bg-zinc-700 overflow-hidden border border-zinc-600 group-hover:border-orange-500/50 transition-colors flex items-center justify-center">
                  {battler.avatarUrl ? (
                    <Image
                      src={battler.avatarUrl}
                      alt={battler.name}
                      width={40}
                      height={40}
                      className="object-cover image-pixelated"
                    />
                  ) : (
                    <span className="text-xs font-black text-zinc-400">
                      {battler.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate group-hover:text-orange-400 transition-colors">
                    {battler.name}
                  </p>
                  <p className="text-xs font-black" style={{ color: league.primaryColor }}>
                    {battler.rating} ELO
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono">
                  <span className="text-green-400">{battler.wins}</span>
                  <span className="text-zinc-600">-</span>
                  <span className="text-red-400">{battler.losses}</span>
                </span>
                <span className="text-zinc-500 font-bold">
                  {battler.wins + battler.losses > 0
                    ? Math.round((battler.wins / (battler.wins + battler.losses)) * 100)
                    : 0}%
                </span>
                <TierBadge tier={battler.tier} />
              </div>
            </Link>
            ))}
          </div>
        )}

        {!loading && !error && !showAll && sortedBattlers.length > 6 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-4 py-2 text-sm font-bold text-zinc-400 hover:text-orange-400 flex items-center justify-center gap-2 border border-zinc-800 hover:border-orange-500/30 bg-zinc-800/30 transition-all"
          >
            <ChevronDown className="w-4 h-4" />
            Load More ({sortedBattlers.length - 6} remaining)
          </button>
        )}
      </div>
    </div>
  )
}

function TierBadge({ tier }: { tier: string }) {
  const configs: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    god: { bg: "bg-yellow-500/20 border-yellow-500/30", text: "text-yellow-400", icon: <Crown className="w-3 h-3" /> },
    top: { bg: "bg-purple-500/20 border-purple-500/30", text: "text-purple-400", icon: <Trophy className="w-3 h-3" /> },
    mid: { bg: "bg-blue-500/20 border-blue-500/30", text: "text-blue-400", icon: <Star className="w-3 h-3" /> },
    low: { bg: "bg-green-500/20 border-green-500/30", text: "text-green-400", icon: <Zap className="w-3 h-3" /> },
    none: { bg: "bg-zinc-500/20 border-zinc-500/30", text: "text-zinc-400", icon: null },
  }

  const config = configs[tier] || configs.none

  return (
    <span className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-black uppercase border ${config.bg} ${config.text}`}>
      {config.icon}
      {tier}
    </span>
  )
}

