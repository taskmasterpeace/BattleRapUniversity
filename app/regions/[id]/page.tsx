"use client"

import type React from "react"

import { use } from "react"
import { motion } from "framer-motion"
import {
  getCityBySlug,
  getMockCityStats,
  getMockPowerRankings,
  getMockRecentBattles,
  getRegionalBadge,
  getSceneSizeLabel,
  getCityBackdrop,
  getAvailableBackdropTimes,
  type TimeOfDay,
  CITIES,
} from "@/lib/cities"
import { ChevronLeft, MapPin, Users, TrendingUp, Trophy, Swords, Award, Sun, Moon, Sunset } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { staggerContainer, staggerItem } from "@/lib/animations"

const tierColors: Record<string, string> = {
  god: "text-yellow-400 border-yellow-500 bg-yellow-500/10",
  top: "text-purple-400 border-purple-500 bg-purple-500/10",
  mid: "text-blue-400 border-blue-500 bg-blue-500/10",
  low: "text-green-400 border-green-500 bg-green-500/10",
  none: "text-zinc-400 border-zinc-500 bg-zinc-500/10",
}

const sceneSizeStyles: Record<string, string> = {
  major: "border-yellow-500 bg-yellow-500/10 text-yellow-500",
  large: "border-zinc-400 bg-zinc-400/10 text-zinc-400",
  medium: "border-orange-500 bg-orange-500/10 text-orange-500",
  small: "border-zinc-600 bg-zinc-800 text-zinc-400",
}

const timeIcons: Record<TimeOfDay, React.ReactNode> = {
  day: <Sun className="w-4 h-4" />,
  dusk: <Sunset className="w-4 h-4" />,
  night: <Moon className="w-4 h-4" />,
}

export default function CityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const city = getCityBySlug(id)
  const stats = getMockCityStats(city?.slug || "")
  const powerRankings = getMockPowerRankings(city?.slug || "")
  const recentBattles = getMockRecentBattles(city?.slug || "")
  const regionalBadge = getRegionalBadge(city?.slug || "")
  const availableTimes = getAvailableBackdropTimes(city?.slug || "")
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(availableTimes[0] || "day")
  const backdrop = getCityBackdrop(city?.slug || "", timeOfDay)

  if (!city) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">City Not Found</h1>
        <p className="text-zinc-400 mb-2">Looking for slug: "{id}"</p>
        <p className="text-zinc-500 mb-4">Available cities:</p>
        <ul className="text-sm text-zinc-400 space-y-1">
          {CITIES.map((c) => (
            <li key={c.id}>
              <Link href={`/regions/${c.slug}`} className="hover:text-orange-500">
                {c.name} → /regions/{c.slug}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/regions" className="mt-6 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
          Back to All Cities
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-zinc-950 text-white"
    >
      {/* Hero Section with City Backdrop */}
      <div className="relative">
        <div className="aspect-square sm:aspect-video max-h-[400px] w-full relative overflow-hidden">
          {backdrop ? (
            <Image
              src={backdrop || "/placeholder.svg"}
              alt={`${city.name} skyline`}
              fill
              className="object-cover object-center"
              priority
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(/placeholder.svg?height=400&width=800&query=${city.name} city skyline pixel art)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />

          {/* Back button */}
          <div className="absolute top-4 left-4 z-10">
            <Link
              href="/regions"
              className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-900/80 backdrop-blur text-zinc-300 hover:text-orange-500 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              All Cities
            </Link>
          </div>

          {/* Time of Day Switcher */}
          {availableTimes.length > 1 && (
            <div className="absolute top-4 right-4 z-10 flex gap-1 bg-zinc-900/80 backdrop-blur rounded-lg p-1">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setTimeOfDay(time)}
                  className={`p-2 rounded transition-colors ${
                    timeOfDay === time ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                  }`}
                  title={time.charAt(0).toUpperCase() + time.slice(1)}
                >
                  {timeIcons[time]}
                </button>
              ))}
            </div>
          )}

          {/* City Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-zinc-400">{city.region}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white">{city.name.toUpperCase()}</h1>
                <p className="text-zinc-400">{city.state ? `${city.state}, ${city.country}` : city.country}</p>
              </div>
              <span className={`px-3 py-1.5 text-sm font-bold border rounded ${sceneSizeStyles[city.sceneSize]}`}>
                {city.sceneSize.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-b border-zinc-800 bg-zinc-900/50"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs uppercase">Battlers</span>
              </div>
              <p className="text-2xl font-black text-white">{stats.totalBattlers}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                <Swords className="w-4 h-4" />
                <span className="text-xs uppercase">Battles</span>
              </div>
              <p className="text-2xl font-black text-white">{stats.totalBattlesInCity}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs uppercase">Avg Rating</span>
              </div>
              <p className="text-2xl font-black text-white">{stats.avgRating}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs uppercase">Win Rate</span>
              </div>
              <p className="text-2xl font-black text-white">{stats.avgWinRate}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Regional Badge */}
        {regionalBadge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-zinc-800 border-2 border-orange-500 rounded-lg flex items-center justify-center">
                <Award className="w-8 h-8 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-orange-500">{regionalBadge.name}</h3>
                <p className="text-sm text-zinc-400 mb-2">{regionalBadge.description}</p>
                <div className="flex flex-wrap gap-2">
                  {regionalBadge.effects.map((effect, i) => (
                    <span key={i} className="px-2 py-1 bg-zinc-800 text-xs text-green-400 rounded">
                      {effect}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-2">{regionalBadge.holderCount} battlers hold this badge</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Power Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
        >
          <div className="p-4 border-b border-zinc-800">
            <h2 className="font-black text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              POWER RANKINGS
            </h2>
          </div>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            {powerRankings.map((battler, index) => (
              <motion.div
                key={battler.id}
                variants={staggerItem}
                className={`flex items-center gap-4 p-4 ${
                  index < powerRankings.length - 1 ? "border-b border-zinc-800" : ""
                } hover:bg-zinc-800/50 transition-colors`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center font-black text-lg ${
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                        ? "text-zinc-400"
                        : index === 2
                          ? "text-orange-600"
                          : "text-zinc-500"
                  }`}
                >
                  #{battler.rank}
                </div>
                <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded overflow-hidden">
                  <Image
                    src={battler.avatarUrl || "/placeholder.svg"}
                    alt={battler.stageName}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold truncate">{battler.stageName}</h3>
                    {battler.isPlayer && (
                      <span className="px-1.5 py-0.5 bg-orange-500 text-[10px] font-bold rounded">YOU</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className={`px-1.5 py-0.5 text-xs border rounded ${tierColors[battler.tier]}`}>
                      {battler.tier.toUpperCase()}
                    </span>
                    <span>
                      {battler.wins}W - {battler.losses}L
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{battler.rating}</p>
                  <p
                    className={`text-sm ${
                      battler.streak > 0 ? "text-green-500" : battler.streak < 0 ? "text-red-500" : "text-zinc-500"
                    }`}
                  >
                    {battler.streak > 0
                      ? `+${battler.streak} streak`
                      : battler.streak < 0
                        ? `${battler.streak} streak`
                        : "—"}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Recent Battles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
        >
          <div className="p-4 border-b border-zinc-800">
            <h2 className="font-black text-lg flex items-center gap-2">
              <Swords className="w-5 h-5 text-red-500" />
              RECENT BATTLES
            </h2>
          </div>
          <div>
            {recentBattles.map((battle, index) => (
              <div
                key={battle.id}
                className={`p-4 ${index < recentBattles.length - 1 ? "border-b border-zinc-800" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">{battle.date}</span>
                  <span className="text-xs text-orange-500 font-bold">{battle.verdict}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex-1 text-right ${battle.winner === "A" ? "text-green-400" : "text-zinc-400"}`}>
                    <p className="font-bold">{battle.battlerA.stageName}</p>
                    <p className="text-xs text-zinc-500">{battle.battlerA.city}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3">
                    <span className="text-lg font-black text-zinc-600">VS</span>
                  </div>
                  <div className={`flex-1 ${battle.winner === "B" ? "text-green-400" : "text-zinc-400"}`}>
                    <p className="font-bold">{battle.battlerB.stageName}</p>
                    <p className="text-xs text-zinc-500">{battle.battlerB.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${battle.crowdReaction.a}%` }} />
                  </div>
                  <span className="text-xs text-zinc-500 w-16 text-center">
                    {battle.crowdReaction.a} - {battle.crowdReaction.b}
                  </span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 ml-auto" style={{ width: `${battle.crowdReaction.b}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scene Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
        >
          <h2 className="font-black text-lg mb-4">SCENE INFO</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-500 uppercase text-xs mb-1">Scene Size</p>
              <p className="font-bold">{getSceneSizeLabel(city.sceneSize)}</p>
            </div>
            <div>
              <p className="text-zinc-500 uppercase text-xs mb-1">Culture Style</p>
              <p className="font-bold capitalize">{city.cultureStyle}</p>
            </div>
            <div>
              <p className="text-zinc-500 uppercase text-xs mb-1">Region</p>
              <p className="font-bold">{city.region}</p>
            </div>
            <div>
              <p className="text-zinc-500 uppercase text-xs mb-1">Battles This Week</p>
              <p className="font-bold">{stats.battlesThisWeek}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
