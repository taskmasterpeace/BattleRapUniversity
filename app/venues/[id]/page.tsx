"use client"

import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ArrowLeft, Users, Mic2, Zap, DollarSign, Volume2, Theater } from "lucide-react"
import {
  getVenueType,
  getTierBadgeClasses,
  getModifierDisplay,
  getCrowdIntensityDisplay,
  getPrestigeStars,
  calculateCrowdSize,
} from "@/lib/venues"
import { notFound } from "next/navigation"

export default function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const venue = getVenueType(id)
  const [imageError, setImageError] = useState(false)

  if (!venue) {
    notFound()
  }

  const writingMod = getModifierDisplay(venue.writingMod)
  const performanceMod = getModifierDisplay(venue.performanceMod)
  const crowdIntensity = getCrowdIntensityDisplay(venue.crowdIntensity)

  // Example crowd calculations
  const exampleCrowds = [
    { label: "Low-tier match", rating: 900, grudge: false, tournament: false },
    { label: "Mid-tier grudge", rating: 1300, grudge: true, tournament: false },
    { label: "Tournament finals", rating: 1600, grudge: false, tournament: true },
    { label: "Premier grudge tournament", rating: 1800, grudge: true, tournament: true },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header Image */}
      <div className="relative h-64 sm:h-80 bg-zinc-900">
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
            <Theater className="w-24 h-24 text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />

        {/* Back Button */}
        <Link
          href="/venues"
          className="absolute top-4 left-4 p-2 bg-zinc-900/80 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Venue Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`text-xs px-2 py-1 rounded border uppercase font-medium ${getTierBadgeClasses(venue.tier)}`}
            >
              {venue.tier}
            </span>
            <span className="text-lg">{getPrestigeStars(venue.prestigeLevel)}</span>
          </div>
          <h1 className="text-3xl font-bold">{venue.displayName}</h1>
          <p className="text-zinc-400 italic mt-1">"{venue.vibe}"</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
              <Users className="w-4 h-4" />
              <span>Capacity</span>
            </div>
            <div className="text-xl font-bold">
              {venue.baseCap} - {venue.maxCap}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
              <Zap className="w-4 h-4" />
              <span>Crowd Energy</span>
            </div>
            <div className={`text-xl font-bold ${crowdIntensity.color}`}>
              {crowdIntensity.icon} {crowdIntensity.label}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
              <DollarSign className="w-4 h-4" />
              <span>Payout</span>
            </div>
            <div className="text-xl font-bold text-green-400">{venue.payoutMod.toFixed(2)}x</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
              <Volume2 className="w-4 h-4" />
              <span>Ambient</span>
            </div>
            <div className="text-xl font-bold capitalize">{venue.ambientSound}</div>
          </div>
        </div>

        {/* Modifiers Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">MODIFIER BREAKDOWN</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Writing */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mic2 className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">Writing</span>
                </div>
                <span className={`text-lg font-bold ${writingMod.color}`}>{venue.writingMod.toFixed(2)}x</span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${venue.writingMod >= 1 ? "bg-blue-500" : "bg-red-500"}`}
                  style={{ width: `${(venue.writingMod / 1.2) * 100}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {venue.writingMod > 1
                  ? "Intimate crowd appreciates lyrical content"
                  : venue.writingMod < 1
                    ? "Large crowd values performance over bars"
                    : "Neutral writing environment"}
              </p>
            </div>

            {/* Performance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span className="font-medium">Performance</span>
                </div>
                <span className={`text-lg font-bold ${performanceMod.color}`}>{venue.performanceMod.toFixed(2)}x</span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${venue.performanceMod >= 1 ? "bg-orange-500" : "bg-red-500"}`}
                  style={{ width: `${(venue.performanceMod / 1.4) * 100}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {venue.performanceMod > 1
                  ? "Stage presence and delivery are amplified"
                  : venue.performanceMod < 1
                    ? "Intimate setting reduces performance impact"
                    : "Neutral performance environment"}
              </p>
            </div>
          </div>

          {/* Crowd Intensity */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Crowd Reactivity</span>
              <span className={`text-lg font-bold ${crowdIntensity.color}`}>
                {(venue.crowdIntensity * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                style={{ width: `${venue.crowdIntensity * 75}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {venue.crowdIntensity > 1.1
                ? "Crowd reactions significantly impact round scoring"
                : venue.crowdIntensity < 0.95
                  ? "Reserved crowd - less impact from reactions"
                  : "Standard crowd reactivity"}
            </p>
          </div>
        </div>

        {/* Crowd Projections */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">CROWD PROJECTIONS</h2>
          <div className="space-y-3">
            {exampleCrowds.map((example, i) => {
              const crowd = calculateCrowdSize(venue, example.rating, example.grudge, example.tournament)
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <div>
                    <span className="text-sm">{example.label}</span>
                    <div className="text-xs text-zinc-500">
                      {example.rating} avg rating
                      {example.grudge && " • Grudge"}
                      {example.tournament && " • Tournament"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-500" />
                    <span className="font-bold text-orange-400">{crowd.toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Back Link */}
        <Link
          href="/venues"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Venue Catalog
        </Link>
      </main>
    </div>
  )
}
