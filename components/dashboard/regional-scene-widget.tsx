"use client"

import { CITIES, getMockCityStats, getMockPowerRankings, getCityBySlug } from "@/lib/cities"
import { MapPin, Trophy, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface RegionalSceneWidgetProps {
  playerCitySlug: string
  playerRankInCity: number
}

export function RegionalSceneWidget({ playerCitySlug, playerRankInCity }: RegionalSceneWidgetProps) {
  const [selectedCity, setSelectedCity] = useState(playerCitySlug)

  const city = getCityBySlug(selectedCity)
  const stats = getMockCityStats(selectedCity)
  const rankings = getMockPowerRankings(selectedCity).slice(0, 3)
  const isPlayerCity = selectedCity === playerCitySlug

  if (!city) return null

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-white">YOUR REGIONAL SCENE</h2>
          </div>
          {isPlayerCity && <span className="text-xs text-orange-500">Home City</span>}
        </div>
      </div>

      {/* City selector */}
      <div className="p-3 border-b border-zinc-800 flex gap-2 overflow-x-auto">
        {CITIES.slice(0, 5).map((c) => (
          <button
            key={c.slug}
            onClick={() => setSelectedCity(c.slug)}
            className={`px-3 py-1.5 text-xs font-bold rounded whitespace-nowrap transition-colors ${
              selectedCity === c.slug ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {c.name.split(" ")[0]}
            {c.slug === playerCitySlug && " ★"}
          </button>
        ))}
      </div>

      {/* City stats */}
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-400 mb-2">{city.name.toUpperCase()}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-zinc-500">Your Rank</div>
            <div className="text-lg font-bold text-orange-500">#{isPlayerCity ? playerRankInCity : "-"}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Top Rating</div>
            <div className="text-lg font-bold text-white">{rankings[0]?.rating || "-"}</div>
          </div>
        </div>
      </div>

      {/* Top 3 battlers */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-bold text-zinc-400">TOP BATTLERS</span>
        </div>

        <div className="space-y-2">
          {rankings.map((battler) => (
            <div
              key={battler.id}
              className={`flex items-center gap-3 p-2 rounded ${
                battler.isPlayer ? "bg-orange-500/10 border border-orange-500/30" : "bg-zinc-800/50"
              }`}
            >
              <span
                className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${
                  battler.rank === 1
                    ? "bg-yellow-500 text-black"
                    : battler.rank === 2
                      ? "bg-gray-400 text-black"
                      : "bg-orange-600 text-white"
                }`}
              >
                {battler.rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white truncate">{battler.stageName}</span>
                  {battler.isPlayer && (
                    <span className="px-1 py-0.5 text-[8px] bg-orange-500 text-white rounded">YOU</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-orange-500">{battler.rating}</div>
                <div className="text-[10px] text-zinc-500">{battler.tier.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href={`/regions/${selectedCity}`}
          className="flex items-center justify-center gap-2 mt-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-orange-500 font-bold transition-colors"
        >
          VIEW FULL RANKINGS
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
