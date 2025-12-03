"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { LEAGUES, getLeagueTierBadge, type League } from "@/lib/leagues"
import { Building2, MapPin, Users, Trophy, Star, ChevronRight, Search } from "lucide-react"

type TierFilter = "all" | "underground" | "regional" | "national" | "premier"

export default function LeaguesPage() {
  const [tierFilter, setTierFilter] = useState<TierFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLeagues = LEAGUES.filter((league) => {
    const matchesTier = tierFilter === "all" || league.tier === tierFilter
    const matchesSearch =
      league.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      league.city.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTier && matchesSearch
  })

  const tierCounts = {
    all: LEAGUES.length,
    underground: LEAGUES.filter((l) => l.tier === "underground").length,
    regional: LEAGUES.filter((l) => l.tier === "regional").length,
    national: LEAGUES.filter((l) => l.tier === "national").length,
    premier: LEAGUES.filter((l) => l.tier === "premier").length,
  }

  const renderLeagueCard = (league: League, index: number) => {
    const tierClass = getLeagueTierBadge(league.tier)

    return (
      <motion.div
        key={league.slug}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link href={`/leagues/${league.slug}`}>
          <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition-all cursor-pointer group h-full">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* League Logo */}
                <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {league.logoUrl ? (
                    <Image
                      src={league.logoUrl || "/placeholder.svg"}
                      alt={league.displayName}
                      width={64}
                      height={64}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-zinc-600" />
                  )}
                </div>

                {/* League Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-zinc-100 group-hover:text-orange-400 transition-colors truncate">
                      {league.displayName}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 border font-display font-bold uppercase ${tierClass}`}>
                      {league.tier}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {league.city}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{league.description}</p>

                  <div className="flex items-center gap-3 text-xs text-zinc-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {league.battlerCount || "50+"} battlers
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {league.eventCount || "12"} events/yr
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {league.prestige}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search leagues or cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 font-display text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "underground", "regional", "national", "premier"] as TierFilter[]).map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-2 text-xs font-display font-bold uppercase whitespace-nowrap transition-colors ${
                tierFilter === tier
                  ? "bg-orange-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
              }`}
            >
              {tier} ({tierCounts[tier]})
            </button>
          ))}
        </div>
      </div>

      {/* Leagues Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredLeagues.map((league, index) => renderLeagueCard(league, index))}
      </div>

      {filteredLeagues.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No leagues found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
