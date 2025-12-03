"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Star, Users, Trophy, DollarSign } from "lucide-react"
import { type League, getLeagueTierBadge, getPersonalityStyleBadge } from "@/lib/leagues"

interface LeagueHeaderProps {
  league: League
}

export function LeagueHeader({ league }: LeagueHeaderProps) {
  return (
    <div className="relative bg-zinc-900 border-b border-zinc-800">
      {/* Color gradient bar */}
      <div
        className="h-2"
        style={{
          background: `linear-gradient(to right, ${league.primaryColor}, ${league.secondaryColor})`,
        }}
      />

      {/* Back Button */}
      <Link
        href="/leagues"
        className="absolute top-4 left-4 p-2 bg-zinc-800/80 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* League Info with Logo */}
      <div className="max-w-4xl mx-auto px-4 py-6 pt-14">
        <div className="flex items-start gap-4 md:gap-6">
          {league.logoUrl ? (
            <div className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28 bg-zinc-800 rounded-lg border-2 border-zinc-700 overflow-hidden">
              <Image
                src={league.logoUrl || "/placeholder.svg"}
                alt={league.displayName}
                width={112}
                height={112}
                className="w-full h-full object-contain p-1"
              />
            </div>
          ) : (
            <div
              className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-lg border-2 border-zinc-700 flex items-center justify-center text-2xl md:text-3xl font-bold"
              style={{ backgroundColor: league.primaryColor + "40" }}
            >
              {league.displayName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 3)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                href={`/leagues?tier=${league.tier}`}
                className={`text-xs px-2 py-1 rounded border capitalize hover:brightness-125 transition-all ${getLeagueTierBadge(league.tier)}`}
              >
                {league.tier}
              </Link>
              <span
                className={`text-xs px-2 py-1 rounded border capitalize ${getPersonalityStyleBadge(league.personalityStyle)}`}
              >
                {league.personalityStyle}
              </span>
              {league.city && (
                <Link
                  href={`/regions/${league.city.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-xs px-2 py-1 rounded border bg-zinc-800/50 text-zinc-300 border-zinc-600 hover:border-orange-500/50 transition-colors"
                >
                  {league.city}, {league.state}
                </Link>
              )}
            </div>

            <h1 className="text-xl md:text-3xl font-bold mb-1 truncate">{league.displayName}</h1>
            <p className="text-zinc-400 italic text-sm md:text-base mb-3">"{league.tagline}"</p>

            {/* Quick Stats Row */}
            <div className="flex flex-wrap items-center gap-3 md:gap-5 text-xs md:text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400">{"★".repeat(Math.ceil(league.prestigeLevel / 2))}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-green-400">${league.basePayout.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400">{league.totalBattles}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400">{league.battlerCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
