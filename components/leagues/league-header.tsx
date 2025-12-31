"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Star, Users, Trophy, DollarSign, Crown, Zap, Mic2, MapPin } from "lucide-react"
import { type League, getLeagueTierBadge, getPersonalityStyleBadge } from "@/lib/leagues"

interface LeagueHeaderProps {
  league: League
}

// Map city names to city sprite filenames
function getCityBackgroundUrl(city?: string, state?: string): string | null {
  if (!city) return null

  const cityLower = city.toLowerCase().replace(/\s+/g, "-")

  // Map cities to available sprites
  const cityMap: Record<string, string> = {
    "atlanta": "atlanta-dusk",
    "philadelphia": "philadelphia-dusk",
    "detroit": "detroit-dusk",
    "phoenix": "phoenix-dusk",
    "boston": "boston-dusk",
    "new-york": "new-york-city-dusk",
    "chicago": "chicago-dusk",
    "los-angeles": "los-angeles-dusk",
    "miami": "miami-day",
    "baltimore": "baltimore-dusk",
    "st-louis": "st-louis-dusk",
    "tampa": "tampa-dusk",
    "new-jersey": "new-jersey-dusk",
  }

  const spriteFile = cityMap[cityLower]
  return spriteFile ? `/sprites/cities/${spriteFile}.png` : null
}

// Get tier icon
function getTierIcon(tier: string) {
  switch (tier) {
    case "premier":
      return <Crown className="w-4 h-4" />
    case "national":
      return <Trophy className="w-4 h-4" />
    case "regional":
      return <Zap className="w-4 h-4" />
    default:
      return <Mic2 className="w-4 h-4" />
  }
}

export function LeagueHeader({ league }: LeagueHeaderProps) {
  const cityBg = getCityBackgroundUrl(league.city, league.state)
  const prestigeStars = Math.ceil(league.prestigeLevel / 2)

  return (
    <div className="relative bg-zinc-900 border-b-2 border-zinc-800 overflow-hidden">
      {/* City Background Image */}
      {cityBg && (
        <div className="absolute inset-0 z-0">
          <Image
            src={cityBg}
            alt={`${league.city} skyline`}
            fill
            className="object-cover opacity-50 image-pixelated"
            priority
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/70 to-zinc-900/30" />
        </div>
      )}

      {/* Animated Color gradient bars */}
      <div className="relative z-10">
        <div
          className="h-1"
          style={{
            background: `linear-gradient(to right, ${league.primaryColor}, ${league.secondaryColor}, ${league.primaryColor})`,
            backgroundSize: "200% 100%",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />
        <style jsx>{`
          @keyframes shimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      </div>

      {/* Back Button */}
      <Link
        href="/leagues"
        className="absolute top-4 left-4 p-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 hover:border-orange-500/50 transition-all z-20 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:text-orange-400 transition-colors" />
      </Link>

      {/* League Info with Logo */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 pt-16">
        <div className="flex items-start gap-4 md:gap-6">
          {/* Enhanced Logo Display */}
          <div className="relative flex-shrink-0">
            {/* Glow effect behind logo */}
            <div
              className="absolute inset-0 blur-xl opacity-50 rounded-lg z-0"
              style={{ backgroundColor: league.primaryColor }}
            />

            {league.logoUrl || league.logoId ? (
              <div
                className="relative w-24 h-24 md:w-32 md:h-32 bg-zinc-900/80 backdrop-blur-sm border-2 overflow-hidden z-10"
                style={{ borderColor: league.primaryColor }}
              >
                <Image
                  src={league.logoId ? `/sprites/leagues/${league.logoId}.png` : league.logoUrl!}
                  alt={league.displayName}
                  width={128}
                  height={128}
                  className="w-full h-full object-contain p-2 image-pixelated"
                />
              </div>
            ) : (
              <div
                className="relative w-24 h-24 md:w-32 md:h-32 border-2 flex items-center justify-center text-3xl md:text-4xl font-black z-10"
                style={{
                  backgroundColor: league.primaryColor + "30",
                  borderColor: league.primaryColor,
                }}
              >
                {league.displayName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 3)}
              </div>
            )}

          </div>

          <div className="flex-1 min-w-0">
            {/* Tags Row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Tier Tag with Icon */}
              <Link
                href={`/leagues?tier=${league.tier}`}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border capitalize hover:brightness-125 transition-all font-bold ${getLeagueTierBadge(league.tier)}`}
              >
                {getTierIcon(league.tier)}
                {league.tier}
              </Link>

              {/* Personality Style */}
              <span
                className={`text-xs px-3 py-1.5 border capitalize font-bold ${getPersonalityStyleBadge(league.personalityStyle)}`}
              >
                {league.personalityStyle}
              </span>

              {/* Location Tag */}
              {league.city && (
                <Link
                  href={`/regions/${league.city.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border bg-zinc-800/80 text-zinc-300 border-zinc-600 hover:border-orange-500/50 hover:text-orange-400 transition-colors font-medium"
                >
                  <MapPin className="w-3 h-3" />
                  {league.city}, {league.state}
                </Link>
              )}
            </div>

            {/* League Name - Large and Bold */}
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-2 truncate drop-shadow-lg">
              {league.displayName}
            </h1>

            {/* Tagline with quote styling */}
            <p className="text-zinc-400 italic text-sm md:text-base mb-4 flex items-center gap-2">
              <span className="text-orange-500">"</span>
              {league.tagline}
              <span className="text-orange-500">"</span>
            </p>

            {/* Quick Stats Row - Enhanced */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              {/* Prestige Stars */}
              <div className="flex items-center gap-2 bg-zinc-800/60 backdrop-blur-sm px-3 py-1.5 border border-yellow-500/20">
                <Star className="w-4 h-4 text-yellow-400" fill="#facc15" />
                <span className="text-yellow-400 font-bold tracking-wide">
                  {"★".repeat(prestigeStars)}{"☆".repeat(5 - prestigeStars)}
                </span>
              </div>

              {/* Base Payout */}
              <div className="flex items-center gap-2 bg-zinc-800/60 backdrop-blur-sm px-3 py-1.5 border border-green-500/20">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-bold">${league.basePayout.toLocaleString()}</span>
              </div>

              {/* Total Battles */}
              <div className="flex items-center gap-2 bg-zinc-800/60 backdrop-blur-sm px-3 py-1.5 border border-orange-500/20">
                <Trophy className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 font-bold">{league.totalBattles}</span>
                <span className="text-xs text-zinc-500">battles</span>
              </div>

              {/* Battler Count */}
              <div className="flex items-center gap-2 bg-zinc-800/60 backdrop-blur-sm px-3 py-1.5 border border-blue-500/20">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-bold">{league.battlerCount}</span>
                <span className="text-xs text-zinc-500">battlers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Format Quick Info */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">{league.roundsPerBattle} ROUNDS</span>
            <span className="text-zinc-600">•</span>
            <span>{league.roundDurationSeconds / 60} MIN EACH</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-600">|</span>
            <span className="font-bold text-zinc-300">{league.writingWeight}%</span>
            <span>WRITING</span>
            <span className="text-zinc-600">•</span>
            <span className="font-bold text-zinc-300">{league.performanceWeight}%</span>
            <span>PERFORMANCE</span>
            <span className="text-zinc-600">•</span>
            <span className="font-bold text-zinc-300">{league.crowdReactionWeight}%</span>
            <span>CROWD</span>
          </div>
        </div>
      </div>

      {/* Bottom gradient bar */}
      <div
        className="relative z-10 h-1"
        style={{
          background: `linear-gradient(to right, transparent, ${league.primaryColor}, ${league.secondaryColor}, ${league.primaryColor}, transparent)`,
        }}
      />
    </div>
  )
}
