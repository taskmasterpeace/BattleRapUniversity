"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Calendar, MapPin } from "lucide-react"

interface MatchupPreviewProps {
  player: {
    name: string
    rating: number
    record: string // "12-3"
    streak: string // "W3" or "L1"
    styleTags: string[]
    avatar?: string
  }
  opponent: {
    name: string
    rating: number
    record: string
    streak: string
    styleTags: string[]
    avatar?: string
  }
  league: string
  scheduledDate: string
}

export function MatchupPreview({ player, opponent, league, scheduledDate }: MatchupPreviewProps) {
  const ratingDiff = player.rating - opponent.rating
  const playerFavored = ratingDiff > 0

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg overflow-hidden">
      <div className="bg-zinc-800 px-4 py-3 border-b border-[#3a3d44]">
        <h3 className="font-display font-bold text-zinc-100 text-sm tracking-wide text-center">MATCHUP PREVIEW</h3>
      </div>

      <div className="p-6">
        {/* League and date */}
        <div className="flex items-center justify-center gap-4 text-sm text-zinc-400 mb-6">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {league}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {scheduledDate}
          </span>
        </div>

        {/* Battler comparison */}
        <div className="grid grid-cols-3 gap-4 items-start">
          {/* Player */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
            <div className="w-24 h-24 mx-auto bg-zinc-800 border-2 border-green-500/50 overflow-hidden mb-3">
              <Image
                src={player.avatar || "/placeholder.svg?height=96&width=96&query=rapper"}
                alt={player.name}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            <h4 className="font-display font-bold text-zinc-100 text-base mb-1">{player.name}</h4>
            <div className="text-xs text-zinc-400 space-y-1">
              <div>
                Rating: <span className="text-zinc-200 font-mono">{player.rating}</span>
              </div>
              <div>
                Record: <span className="text-zinc-200">{player.record}</span>
              </div>
              <div>
                Streak:{" "}
                <span className={player.streak.startsWith("W") ? "text-green-400" : "text-red-400"}>
                  {player.streak}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-1 mt-3">
              {player.styleTags.map((tag) => (
                <span key={tag} className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* VS */}
          <div className="text-center pt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-[#ff8c42] text-2xl font-black font-display"
            >
              VS
            </motion.div>
          </div>

          {/* Opponent */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
            <div className="w-24 h-24 mx-auto bg-zinc-800 border-2 border-red-500/50 overflow-hidden mb-3">
              <Image
                src={opponent.avatar || "/placeholder.svg?height=96&width=96&query=rapper opponent"}
                alt={opponent.name}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            <h4 className="font-display font-bold text-zinc-100 text-base mb-1">{opponent.name}</h4>
            <div className="text-xs text-zinc-400 space-y-1">
              <div>
                Rating: <span className="text-zinc-200 font-mono">{opponent.rating}</span>
              </div>
              <div>
                Record: <span className="text-zinc-200">{opponent.record}</span>
              </div>
              <div>
                Streak:{" "}
                <span className={opponent.streak.startsWith("W") ? "text-green-400" : "text-red-400"}>
                  {opponent.streak}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-1 mt-3">
              {opponent.styleTags.map((tag) => (
                <span key={tag} className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Rating advantage */}
        <div className="mt-6 pt-4 border-t border-zinc-700 text-center">
          <span className={`font-display font-bold ${playerFavored ? "text-green-400" : "text-red-400"}`}>
            RATING ADVANTAGE: {ratingDiff > 0 ? "+" : ""}
            {ratingDiff} ({playerFavored ? "PLAYER FAVORED" : "OPPONENT FAVORED"})
          </span>
        </div>
      </div>
    </div>
  )
}
