"use client"

import Image from "next/image"
import Link from "next/link"
import type { CityData, BattlerTier } from "@/lib/types"

interface CityBackdropHeaderProps {
  // Option 1: Pass full city object
  city?: CityData
  // Option 2: Pass individual props (backward compat)
  cityName?: string
  stateName?: string
  region?: string

  battlerName?: string
  tier?: BattlerTier
  battlerTier?: BattlerTier
  cityRank?: number
  cityTotal?: number
  regionRank?: number
  regionTotal?: number
  backdropUrl?: string
  showRankings?: boolean
  aspectRatio?: "16:9" | "21:9"
  compact?: boolean
}

const TIER_COLORS: Record<BattlerTier, { bg: string; text: string; border: string }> = {
  none: { bg: "bg-zinc-700/50", text: "text-zinc-400", border: "border-zinc-600" },
  low: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/50" },
  mid: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50" },
  top: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/50" },
  god: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/50" },
}

const TIER_LABELS: Record<BattlerTier, string> = {
  none: "UNRANKED",
  low: "LOW TIER",
  mid: "MID TIER",
  top: "TOP TIER",
  god: "GOD TIER",
}

export function CityBackdropHeader({
  city,
  cityName: propCityName,
  stateName: propStateName,
  region: propRegion,
  battlerName,
  tier,
  battlerTier,
  cityRank,
  cityTotal,
  regionRank,
  regionTotal,
  backdropUrl,
  showRankings = true,
  aspectRatio = "16:9",
  compact = false,
}: CityBackdropHeaderProps) {
  // Support both city object and individual props
  const cityName = city?.name || propCityName || "Unknown City"
  const stateName = city?.state || propStateName || "XX"
  const regionName = city?.region || propRegion || "Unknown"
  const cityTierValue = city?.cityTier || "underground"
  const timezone = city?.timeZone || "EST"

  const actualTier = tier || battlerTier || "none"
  const tierStyle = TIER_COLORS[actualTier]

  const citySlug = cityName.toLowerCase().replace(/\s+/g, "-")
  const regionSlug = regionName.toLowerCase().replace(/\s+/g, "-")

  // Build sprite path - try both formats
  const cityKey = `${cityName.toLowerCase().replace(/\s+/g, "-")}`
  const spriteBackdrop = `/sprites/cities/${cityKey}-day.png`
  const legacyBackdrop = `/${cityKey}-city-skyline-urban-hip-hop.jpg`

  const imageUrl = backdropUrl || city?.backdropUrl || spriteBackdrop

  return (
    <div className={`relative w-full ${compact ? "h-20 sm:h-24" : "h-32 sm:h-40 lg:h-48"}`}>
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={`${cityName}, ${stateName} skyline`}
          fill
          className="object-cover object-center"
          priority
          onError={(e) => {
            // Fallback to legacy path if sprite fails
            const img = e.target as HTMLImageElement
            if (!img.src.includes("placeholder")) {
              img.src = legacyBackdrop
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/90" />
      </div>

      <div className={`relative h-full flex flex-col justify-between ${compact ? "p-2" : "p-3 sm:p-4"}`}>
        {/* Top row - City name and tier */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/regions/${citySlug}`}
              className={`${compact ? "text-sm" : "text-base sm:text-lg"} font-display text-orange-500 hover:text-orange-400 transition-colors`}
            >
              {cityName}, {stateName}
            </Link>
            <span
              className={`text-[10px] font-display uppercase px-1.5 py-0.5 ${
                cityTierValue === "major"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                  : cityTierValue === "regional"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                    : "bg-zinc-600/20 text-zinc-400 border border-zinc-600/50"
              }`}
            >
              {cityTierValue}
            </span>
          </div>

          {/* Battler Tier badge - top right */}
          {!compact && (
            <div className={`px-2 py-1 border ${tierStyle.bg} ${tierStyle.border}`}>
              <div className={`text-xs font-display font-bold ${tierStyle.text}`}>{TIER_LABELS[actualTier]}</div>
            </div>
          )}
        </div>

        {/* Bottom row - Rankings as clickable links */}
        {showRankings && !compact && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* City Rank - clickable */}
            {cityRank !== undefined && (
              <Link
                href={`/regions/${citySlug}`}
                className="px-2 py-1 bg-zinc-800/80 border border-zinc-700 hover:border-orange-500/50 hover:bg-zinc-700/80 transition-colors"
              >
                <span className="text-[10px] text-zinc-500 uppercase">City Rank </span>
                <span className="text-xs font-display font-bold text-zinc-100">
                  #{cityRank}
                  {cityTotal ? `/${cityTotal}` : ""}
                </span>
              </Link>
            )}

            {/* Region Rank - clickable */}
            {regionRank !== undefined && (
              <Link
                href={`/regions?region=${regionSlug}`}
                className="px-2 py-1 bg-zinc-800/80 border border-zinc-700 hover:border-orange-500/50 hover:bg-zinc-700/80 transition-colors"
              >
                <span className="text-[10px] text-zinc-500 uppercase">{regionName} </span>
                <span className="text-xs font-display font-bold text-zinc-100">
                  #{regionRank}
                  {regionTotal ? `/${regionTotal}` : ""}
                </span>
              </Link>
            )}
          </div>
        )}

        {/* Battler name if provided - bottom */}
        {battlerName && !compact && (
          <h1 className="text-xl sm:text-2xl font-display font-bold text-zinc-100 tracking-wide drop-shadow-lg">
            {battlerName}
          </h1>
        )}
      </div>
    </div>
  )
}
