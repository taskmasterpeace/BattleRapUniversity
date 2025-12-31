"use client"

import Image from "next/image"
import Link from "next/link"
import type { Battler, CareerTier } from "@/lib/types"
import { getCityByName, getCityBackdrop as getCityBackdropHelper } from "@/lib/cities"
import { ChevronRight, Clock } from "lucide-react"
import { useState } from "react"

interface BattlerCardProps {
  battler: Battler
}

function getAttributeBasedBackdrop(battler: Battler): { backdrop: string; attributeColor: string } {
  const attrs = battler.attributes
  if (!attrs) {
    return { backdrop: "writing", attributeColor: "orange" }
  }

  // Find highest attribute category
  const writingAvg = (attrs.wordplay + attrs.punchlines + attrs.schemes) / 3
  const performanceAvg = (attrs.delivery + attrs.presence + attrs.crowdControl) / 3
  const personalAvg = (attrs.authenticity + attrs.battleIQ) / 2

  const max = Math.max(writingAvg, performanceAvg, personalAvg)

  if (max === writingAvg) {
    return { backdrop: "writing", attributeColor: "orange" }
  } else if (max === performanceAvg) {
    return { backdrop: "performance", attributeColor: "cyan" }
  } else {
    return { backdrop: "personal", attributeColor: "purple" }
  }
}

function getTierBackgroundColor(tier: string): string {
  const tierLower = tier.toLowerCase().replace(" tier", "").trim()
  switch (tierLower) {
    case "god":
      return "bg-gradient-to-br from-amber-500/40 to-yellow-600/40"
    case "top":
      return "bg-gradient-to-br from-purple-600/40 to-violet-700/40"
    case "mid":
      return "bg-gradient-to-br from-blue-600/40 to-cyan-700/40"
    case "low":
      return "bg-gradient-to-br from-green-600/40 to-emerald-700/40"
    default:
      return "bg-gradient-to-br from-zinc-600/40 to-zinc-700/40"
  }
}

function getTierBorderColor(tier: string): string {
  const tierLower = tier.toLowerCase().replace(" tier", "").trim()
  switch (tierLower) {
    case "god":
      return "border-amber-500"
    case "top":
      return "border-purple-500"
    case "mid":
      return "border-blue-500"
    case "low":
      return "border-green-500"
    default:
      return "border-zinc-600"
  }
}

function getCareerTierStyle(tier: CareerTier): { bg: string; text: string; label: string } {
  switch (tier) {
    case "legend":
      return { bg: "bg-amber-500/20", text: "text-amber-400", label: "Legend" }
    case "veteran":
      return { bg: "bg-purple-500/20", text: "text-purple-400", label: "Veteran" }
    case "established":
      return { bg: "bg-blue-500/20", text: "text-blue-400", label: "Established" }
    case "rising":
      return { bg: "bg-green-500/20", text: "text-green-400", label: "Rising" }
    case "rookie":
      return { bg: "bg-zinc-500/20", text: "text-zinc-400", label: "Rookie" }
    default:
      return { bg: "bg-zinc-600/20", text: "text-zinc-500", label: "Unknown" }
  }
}

export function BattlerCard({ battler }: BattlerCardProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)

  const cityData = battler.city?.name ? getCityByName(battler.city.name) : null
  const { attributeColor } = getAttributeBasedBackdrop(battler)

  const getBackdropPath = () => {
    const cityName = cityData?.name || battler.city?.name
    if (cityName) {
      // Try to get backdrop using the helper (handles day/night/dusk fallbacks)
      const backdrop = getCityBackdropHelper(cityName, "day")
      if (backdrop) return backdrop
    }
    return "/city-skyline-pixel-art.jpg"
  }

  const backdropPath = getBackdropPath()

  const portraitUrl = battler.portrait?.spriteUrl || "/sprites/characters/sprite_569.png"
  const crop = battler.portrait?.crop || { scale: 1, offsetX: 0, offsetY: 0 }
  const tierBgColor = getTierBackgroundColor(battler.tier)
  const tierBorderColor = getTierBorderColor(battler.tier)

  const citySlug = cityData?.slug || battler.city?.name?.toLowerCase().replace(/\s+/g, "-") || "unknown"
  const regionSlug = (cityData?.region || battler.city?.region || battler.region || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
  const leagueSlug = battler.league?.toLowerCase().replace(/\s+/g, "-") || "unknown"
  const tierSlug = battler.tier?.toLowerCase().replace(" tier", "").trim() || "none"

  const labelColor = "text-orange-400"

  return (
    <div className="relative bg-zinc-900 border-2 border-zinc-700 overflow-hidden aspect-square sm:aspect-auto">
      <div className="absolute inset-0">
        <Image
          src={backdropPath || "/placeholder.svg"}
          alt={`${battler.city?.name || "City"} backdrop`}
          fill
          className="object-cover object-center"
          onError={(e) => {
            const img = e.target as HTMLImageElement
            img.src = "/city-skyline-pixel-art.jpg"
          }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 via-zinc-900/60 to-zinc-900/95" />
      </div>

      <div className="relative z-10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={`w-24 h-24 border-2 ${tierBorderColor} ${tierBgColor} overflow-hidden relative`}>
              <Image
                src={portraitUrl || "/placeholder.svg"}
                alt={battler.stageName}
                width={96}
                height={96}
                className="absolute pixelated"
                style={{
                  transform: `scale(${crop.scale}) translate(${crop.offsetX}px, ${crop.offsetY}px)`,
                  transformOrigin: "top center",
                  width: "100%",
                  height: "auto",
                }}
              />
            </div>
          </div>

          {/* Info on right side */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white drop-shadow-lg tracking-wide uppercase">
              {battler.stageName}
            </h2>

            <div className="text-xs sm:text-sm space-y-1 sm:space-y-1.5 mt-2 font-display">
              <div className="flex items-center gap-2">
                <span className={`${labelColor} font-semibold uppercase tracking-wide`}>City:</span>
                <Link
                  href={`/regions/${citySlug}`}
                  className="text-white hover:text-orange-400 transition-colors underline underline-offset-2"
                >
                  {battler.city?.name || "Unknown"}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${labelColor} font-semibold uppercase tracking-wide`}>Region:</span>
                <Link
                  href={`/regions?region=${regionSlug}`}
                  className="text-white hover:text-orange-400 transition-colors underline underline-offset-2"
                >
                  {cityData?.region || battler.city?.region || battler.region || "Unknown"}
                </Link>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`${labelColor} font-semibold uppercase tracking-wide`}>Tier:</span>
                <Link
                  href={`/rankings?tier=${tierSlug}`}
                  className="text-white font-bold hover:text-orange-300 transition-colors underline underline-offset-2"
                >
                  {battler.tier.replace(" TIER", "")}
                </Link>
                <span className="text-zinc-500 mx-1">|</span>
                <span className={`${labelColor} font-semibold uppercase tracking-wide`}>Record:</span>
                <Link
                  href="/career/history"
                  className="text-white font-mono font-bold hover:text-orange-400 transition-colors underline underline-offset-2"
                >
                  {battler.record ? `${battler.record.wins}-${battler.record.losses}` : "0-0"}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${labelColor} font-semibold uppercase tracking-wide`}>League:</span>
                <Link
                  href={`/leagues/${leagueSlug}`}
                  className="text-white hover:text-orange-400 transition-colors underline underline-offset-2"
                >
                  {battler.league}
                </Link>
              </div>
              {/* Career row - shows time in the game */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`${labelColor} font-semibold uppercase tracking-wide`}>Career:</span>
                {(() => {
                  const careerStyle = getCareerTierStyle(battler.careerTier || 'unknown')
                  return (
                    <>
                      <span className={`px-1.5 py-0.5 text-[10px] font-display font-bold uppercase ${careerStyle.bg} ${careerStyle.text} border border-current/30`}>
                        {careerStyle.label}
                      </span>
                      <span className="text-white font-mono text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {battler.careerDisplay || '0 days'}
                      </span>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Styles */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {battler.styles.slice(0, 4).map((style) => (
            <span
              key={style}
              className="px-2 py-0.5 bg-orange-900/60 border border-orange-700/70 text-xs text-orange-300 font-display"
            >
              {style}
            </span>
          ))}
        </div>

        {/* View Career link */}
        <div className="mt-2">
          <Link
            href={`/battler/${battler.id}`}
            className="text-xs text-zinc-400 hover:text-orange-400 transition-colors flex items-center gap-1"
          >
            View Career
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {battler.badges && battler.badges.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-700/50">
            <div className="flex items-center gap-2">
              {battler.badges.slice(0, 4).map((badgeName, index) => {
                const spriteMap: Record<string, string> = {
                  "REBUTTAL KING": "badge_046",
                  "MASTER WORDSMITH": "badge_001",
                  "PUNCHLINE KING": "badge_002",
                  "TECHNICAL WRITER": "badge_003",
                  "WELL RESEARCHED": "badge_054",
                }
                const spriteId = spriteMap[badgeName] || `badge_${String(46 + index).padStart(3, "0")}`
                const badgeSlug = badgeName.toLowerCase().replace(/\s+/g, "-")

                return (
                  <div
                    key={index}
                    className="relative flex-shrink-0"
                    onMouseEnter={() => setHoveredBadge(badgeName)}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    <Link
                      href={`/badges?badge=${badgeSlug}`}
                      className="block w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800/80 border border-zinc-600 rounded overflow-hidden hover:border-orange-500 hover:scale-110 transition-all"
                    >
                      <Image
                        src={`/sprites/badges/${spriteId}.png`}
                        alt={badgeName}
                        width={48}
                        height={48}
                        className="object-contain pixelated w-full h-full"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement
                          img.style.display = "none"
                        }}
                      />
                    </Link>
                    {hoveredBadge === badgeName && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-zinc-800 border border-zinc-600 text-xs sm:text-sm text-white whitespace-nowrap z-20 rounded shadow-lg pointer-events-none">
                        <span className="font-bold text-orange-400">{badgeName}</span>
                        <div className="text-zinc-400 text-xs">Click to view in compendium</div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                      </div>
                    )}
                  </div>
                )
              })}
              {battler.badges.length > 4 && (
                <Link
                  href={`/battler/${battler.id}?tab=badges`}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800/60 border border-zinc-600 rounded text-xs sm:text-sm text-zinc-400 hover:text-orange-400 hover:border-orange-500 transition-all"
                >
                  +{battler.badges.length - 4}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
