"use client"

import { BarChart3, Users, Flame, AlertTriangle, DollarSign, TrendingUp, Swords, Calendar } from "lucide-react"
import type { LeagueStats as LeagueStatsType } from "@/lib/leagues"
import { StatCard } from "./StatCard"

interface LeagueStatsProps {
  stats: LeagueStatsType
  basePayout: number
}

export function LeagueStats({ stats, basePayout }: LeagueStatsProps) {
  return (
    <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 overflow-hidden">
      {/* Accent gradient top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500" />

      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-green-500/20 border border-green-500/30">
            <BarChart3 className="w-4 h-4 text-green-400" />
          </div>
          <h3 className="font-black uppercase tracking-wider">League Statistics</h3>
        </div>

        {/* Battle Counts - Enhanced */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-800/80 border border-zinc-700/50">
              <Swords className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Total Battles</p>
              <p className="text-3xl font-black">{stats.totalBattles}</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-4">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">This Month</p>
              <p className="text-2xl font-black text-orange-400">{stats.thisMonth}</p>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/30">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard
            icon={<Flame className="w-4 h-4 text-orange-400" />}
            label="AVG CROWD"
            value={`${stats.avgCrowdReaction}/100`}
            subtext={stats.avgCrowdReaction > 75 ? "🔥 Hype" : stats.avgCrowdReaction > 50 ? "Engaged" : "Reserved"}
            highlight={stats.avgCrowdReaction > 75}
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4 text-green-400" />}
            label="BODY RATE"
            value={`${stats.bodyRate}%`}
            subtext="(3-0 wins)"
          />
          <StatCard
            icon={<Users className="w-4 h-4 text-blue-400" />}
            label="CLOSE RATE"
            value={`${stats.closeRate}%`}
            subtext="(2-1 wins)"
          />
          <StatCard
            icon={<BarChart3 className="w-4 h-4 text-purple-400" />}
            label="AVG RATING"
            value={stats.avgRating.toString()}
          />
          <StatCard
            icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
            label="CHOKE RATE"
            value={`${stats.chokeRate}%`}
            subtext={stats.chokeRate > 10 ? "High pressure" : "Composed"}
          />
          <StatCard
            icon={<DollarSign className="w-4 h-4 text-green-400" />}
            label="BASE PAY"
            value={`$${basePayout.toLocaleString()}`}
            highlight
          />
        </div>
      </div>
    </div>
  )
}

// StatCard component is imported above, no need to redefine here
