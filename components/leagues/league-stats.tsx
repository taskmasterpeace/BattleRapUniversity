"use client"

import { BarChart3, Users, Flame, AlertTriangle, DollarSign, TrendingUp } from "lucide-react"
import type { LeagueStats as LeagueStatsType } from "@/lib/leagues"
import { StatCard } from "./StatCard" // Import StatCard component

interface LeagueStatsProps {
  stats: LeagueStatsType
  basePayout: number
}

export function LeagueStats({ stats, basePayout }: LeagueStatsProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-green-400" />
        <h3 className="font-bold">LEAGUE STATISTICS</h3>
      </div>

      {/* Battle Counts */}
      <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-zinc-800">
        <div>
          <p className="text-zinc-500 text-xs">Total Battles (All Time)</p>
          <p className="text-2xl font-bold">{stats.totalBattles}</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-xs">This Month</p>
          <p className="text-xl font-bold text-orange-400">{stats.thisMonth}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Flame className="w-4 h-4 text-orange-400" />}
          label="AVG CROWD"
          value={`${stats.avgCrowdReaction}/100`}
          subtext={stats.avgCrowdReaction > 75 ? "Hype" : stats.avgCrowdReaction > 50 ? "Engaged" : "Reserved"}
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
        />
        <StatCard
          icon={<DollarSign className="w-4 h-4 text-green-400" />}
          label="BASE PAY"
          value={`$${basePayout.toLocaleString()}`}
        />
      </div>
    </div>
  )
}

// StatCard component is imported above, no need to redefine here
