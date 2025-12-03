"use client"

import { useState } from "react"
import Image from "next/image"
import {
  type VenueType,
  getTierBadgeClasses,
  getModifierDisplay,
  getCrowdIntensityDisplay,
  getPrestigeStars,
} from "@/lib/venues"
import { Users, Mic2, Theater, Zap } from "lucide-react"

interface VenueCardProps {
  venue: VenueType
  cityName?: string
  projectedCrowd?: number
  compact?: boolean
}

export function VenueCard({ venue, cityName, projectedCrowd, compact = false }: VenueCardProps) {
  const [imageError, setImageError] = useState(false)
  const writingMod = getModifierDisplay(venue.writingMod)
  const performanceMod = getModifierDisplay(venue.performanceMod)
  const crowdIntensity = getCrowdIntensityDisplay(venue.crowdIntensity)

  if (compact) {
    return (
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-16 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
            {!imageError ? (
              <Image
                src={`/sprites/venues/${venue.name}.png`}
                alt={venue.displayName}
                width={64}
                height={48}
                className="w-full h-full object-cover pixelated"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Theater className="w-6 h-6 text-zinc-600" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-white truncate">{venue.displayName}</h4>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${getTierBadgeClasses(venue.tier)}`}>
                {venue.tier}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {venue.baseCap}-{venue.maxCap} cap
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Venue Image */}
      <div className="relative aspect-[4/3] bg-zinc-800">
        {!imageError ? (
          <Image
            src={`/sprites/venues/${venue.name}.png`}
            alt={venue.displayName}
            fill
            className="object-cover pixelated"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Theater className="w-16 h-16 text-zinc-600" />
          </div>
        )}
        {/* Tier Badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs px-2 py-1 rounded border uppercase font-medium ${getTierBadgeClasses(venue.tier)}`}>
            {venue.tier}
          </span>
        </div>
        {/* Prestige */}
        <div className="absolute top-2 right-2 text-sm">{getPrestigeStars(venue.prestigeLevel)}</div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white">{venue.displayName}</h3>
        {cityName && <p className="text-sm text-zinc-400">{cityName}</p>}

        {/* Capacity */}
        <div className="flex items-center gap-2 mt-3 text-sm">
          <Users className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-400">Capacity:</span>
          <span className="text-white">
            {venue.baseCap} - {venue.maxCap}
          </span>
          {projectedCrowd && <span className="text-orange-400 ml-auto">~{projectedCrowd} expected</span>}
        </div>

        {/* Crowd Intensity Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-500">Crowd Energy</span>
            <span className={crowdIntensity.color}>
              {crowdIntensity.icon} {crowdIntensity.label}
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
              style={{ width: `${Math.min(venue.crowdIntensity * 75, 100)}%` }}
            />
          </div>
        </div>

        {/* Modifiers */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-zinc-800/50 rounded p-2">
            <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
              <Mic2 className="w-3 h-3" />
              <span>Writing</span>
            </div>
            <span className={`text-sm font-medium ${writingMod.color}`}>
              {venue.writingMod.toFixed(2)}x {writingMod.text !== "0%" && `(${writingMod.text})`}
            </span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
              <Zap className="w-3 h-3" />
              <span>Performance</span>
            </div>
            <span className={`text-sm font-medium ${performanceMod.color}`}>
              {venue.performanceMod.toFixed(2)}x {performanceMod.text !== "0%" && `(${performanceMod.text})`}
            </span>
          </div>
        </div>

        {/* Payout */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500">Payout Modifier</span>
          <span className="text-green-400 font-medium">{venue.payoutMod.toFixed(2)}x</span>
        </div>

        {/* Vibe */}
        <p className="text-xs text-zinc-500 italic mt-3">"{venue.vibe}"</p>
      </div>
    </div>
  )
}
