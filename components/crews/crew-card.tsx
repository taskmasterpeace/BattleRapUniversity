"use client"

import { motion } from "framer-motion"
import { Users, Trophy, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface CrewCardProps {
  crew: {
    id: string
    name: string
    tag: string
    logo_url?: string | null
    reputation: number
    total_wins: number
    total_losses: number
    member_count?: number
  }
  onClick?: () => void
  isPlayerCrew?: boolean
}

function getReputationColor(reputation: number): string {
  if (reputation >= 80) return "text-yellow-500 border-yellow-500/50 bg-yellow-500/10"
  if (reputation >= 60) return "text-purple-500 border-purple-500/50 bg-purple-500/10"
  if (reputation >= 40) return "text-blue-500 border-blue-500/50 bg-blue-500/10"
  return "text-zinc-500 border-zinc-700/50 bg-zinc-800/50"
}

function getReputationLabel(reputation: number): string {
  if (reputation >= 80) return "LEGENDARY"
  if (reputation >= 60) return "RESPECTED"
  if (reputation >= 40) return "KNOWN"
  return "EMERGING"
}

export function CrewCard({ crew, onClick, isPlayerCrew = false }: CrewCardProps) {
  const reputationColor = getReputationColor(crew.reputation)
  const reputationLabel = getReputationLabel(crew.reputation)
  const winRate = crew.total_wins + crew.total_losses > 0
    ? Math.round((crew.total_wins / (crew.total_wins + crew.total_losses)) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`bg-zinc-900 border-2 transition-all cursor-pointer ${
          isPlayerCrew
            ? "border-orange-500/50 hover:border-orange-500"
            : "border-zinc-800 hover:border-zinc-700"
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          {/* Header with name and tag */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-lg text-zinc-100 uppercase tracking-wide truncate">
                {crew.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-orange-400 text-xs font-display font-bold">
                  [{crew.tag}]
                </span>
                {isPlayerCrew && (
                  <span className="px-2 py-0.5 bg-orange-500/20 border border-orange-500/50 text-orange-400 text-xs font-display font-bold">
                    YOUR CREW
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {/* Members */}
            <div className="bg-zinc-800/50 border border-zinc-700 p-2">
              <div className="flex items-center gap-1 mb-1">
                <Users className="w-3 h-3 text-zinc-500" />
                <span className="text-xs text-zinc-500 font-display uppercase">Members</span>
              </div>
              <p className="text-lg font-display font-bold text-zinc-100">
                {crew.member_count || 0}/5
              </p>
            </div>

            {/* Record */}
            <div className="bg-zinc-800/50 border border-zinc-700 p-2">
              <div className="flex items-center gap-1 mb-1">
                <Trophy className="w-3 h-3 text-zinc-500" />
                <span className="text-xs text-zinc-500 font-display uppercase">Record</span>
              </div>
              <p className="text-lg font-display font-bold text-zinc-100 font-mono">
                {crew.total_wins}-{crew.total_losses}
              </p>
            </div>

            {/* Win Rate */}
            <div className="bg-zinc-800/50 border border-zinc-700 p-2">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-zinc-500" />
                <span className="text-xs text-zinc-500 font-display uppercase">Win %</span>
              </div>
              <p className="text-lg font-display font-bold text-green-400">
                {winRate}%
              </p>
            </div>
          </div>

          {/* Reputation Bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500 font-display uppercase">Reputation</span>
              <span className={`text-xs font-display font-bold ${reputationColor.split(' ')[0]}`}>
                {reputationLabel}
              </span>
            </div>
            <div className="relative h-2 bg-zinc-800 border border-zinc-700 overflow-hidden">
              <motion.div
                className={reputationColor.split(' ')[2]}
                initial={{ width: 0 }}
                animate={{ width: `${crew.reputation}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ height: "100%" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-zinc-600 font-display">0</span>
              <span className="text-xs text-zinc-400 font-display font-bold">{crew.reputation}</span>
              <span className="text-xs text-zinc-600 font-display">100</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
