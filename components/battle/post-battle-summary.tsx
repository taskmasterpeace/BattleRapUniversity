"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Trophy, AlertTriangle, Users, Eye, Star, ChevronDown, ChevronUp } from "lucide-react"

interface AttributeChange {
  attribute: string
  category: "writing" | "performance" | "personal"
  oldValue: number
  newValue: number
  change: number
}

interface BadgeEarned {
  id: string
  name: string
  tier: "bronze" | "silver" | "gold"
  icon: string
}

interface PostBattleSummaryData {
  ratingChange: number
  newRating: number
  attributeChanges: AttributeChange[]
  badgesEarned: BadgeEarned[]
  stressChange: number
  currentStress: number
  viewData: {
    total_views: number
    view_tier: "low" | "mid" | "high" | "viral"
  }
  fanGrowth: {
    fans_before: number
    fans_after: number
    fans_gained: number
    trending_change: number
  }
  levelUpData?: {
    leveledUp: boolean
    previousLevel: number
    newLevel: number
    skillPointsEarned: number
    xpEarned: number
  }
}

interface PostBattleSummaryProps {
  data: PostBattleSummaryData
  isVictory: boolean
}

export function PostBattleSummary({ data, isVictory }: PostBattleSummaryProps) {
  const [expanded, setExpanded] = useState(false)

  const getCategoryColor = (category: AttributeChange["category"]) => {
    switch (category) {
      case "writing":
        return "text-orange-500"
      case "performance":
        return "text-purple-500"
      case "personal":
        return "text-green-500"
    }
  }

  const getTierColor = (tier: BadgeEarned["tier"]) => {
    switch (tier) {
      case "gold":
        return "bg-amber-500/20 border-amber-500 text-amber-400"
      case "silver":
        return "bg-zinc-400/20 border-zinc-400 text-zinc-300"
      case "bronze":
        return "bg-orange-700/20 border-orange-700 text-orange-500"
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 overflow-hidden">
      {/* Header */}
      <div
        className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
          isVictory ? "bg-green-900/20" : "bg-red-900/20"
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className={`w-5 h-5 ${isVictory ? "text-green-500" : "text-red-500"}`} />
            <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide">POST-BATTLE PROGRESSION</h3>
          </div>
          <div className="flex items-center gap-4">
            {/* Quick stats */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Rating:</span>
              <span
                className={`text-sm font-mono font-bold ${data.ratingChange >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {data.ratingChange >= 0 ? "+" : ""}
                {data.ratingChange}
              </span>
            </div>
            {data.badgesEarned.length > 0 && (
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-500 font-mono">{data.badgesEarned.length}</span>
              </div>
            )}
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-zinc-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-500" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-6">
          {/* Rating Change */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-800/50 p-3 border border-zinc-700">
              <div className="text-xs text-zinc-500 mb-1">New Rating</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-bold text-zinc-100">{data.newRating}</span>
                <span className={`text-sm font-mono ${data.ratingChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {data.ratingChange >= 0 ? "+" : ""}
                  {data.ratingChange}
                </span>
                {data.ratingChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            <div className="bg-zinc-800/50 p-3 border border-zinc-700">
              <div className="text-xs text-zinc-500 mb-1">Stress</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-bold text-zinc-100">{data.currentStress}</span>
                <span className={`text-sm font-mono ${data.stressChange <= 0 ? "text-green-500" : "text-orange-500"}`}>
                  {data.stressChange >= 0 ? "+" : ""}
                  {data.stressChange}
                </span>
                {data.stressChange > 10 && <AlertTriangle className="w-4 h-4 text-orange-500" />}
              </div>
            </div>

            <div className="bg-zinc-800/50 p-3 border border-zinc-700">
              <div className="text-xs text-zinc-500 mb-1">Views</div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-xl font-mono font-bold text-zinc-100">
                  {formatNumber(data.viewData.total_views)}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 font-mono uppercase ${
                    data.viewData.view_tier === "viral"
                      ? "bg-purple-600 text-white"
                      : data.viewData.view_tier === "high"
                        ? "bg-green-600 text-white"
                        : data.viewData.view_tier === "mid"
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-600 text-white"
                  }`}
                >
                  {data.viewData.view_tier}
                </span>
              </div>
            </div>

            <div className="bg-zinc-800/50 p-3 border border-zinc-700">
              <div className="text-xs text-zinc-500 mb-1">Fan Growth</div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-xl font-mono font-bold text-green-500">+{data.fanGrowth.fans_gained}</span>
              </div>
            </div>
          </div>

          {/* Level Up Banner */}
          {data.levelUpData?.leveledUp && (
            <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-2 border-amber-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500 flex items-center justify-center">
                    <span className="text-2xl font-mono font-bold text-black">{data.levelUpData.newLevel}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-display font-bold text-amber-400">LEVEL UP!</h4>
                    <p className="text-sm text-zinc-400">
                      Level {data.levelUpData.previousLevel} → {data.levelUpData.newLevel}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-400">Skill Points Earned</div>
                  <div className="text-2xl font-mono font-bold text-amber-400">
                    +{data.levelUpData.skillPointsEarned}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attribute Changes */}
          {data.attributeChanges.length > 0 && (
            <div>
              <h4 className="text-xs font-display font-bold text-zinc-400 tracking-wide mb-3">ATTRIBUTE CHANGES</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.attributeChanges.map((attr, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-zinc-800/30 px-3 py-2 border border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs uppercase ${getCategoryColor(attr.category)}`}>{attr.category}</span>
                      <span className="text-sm text-zinc-300">{attr.attribute}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{attr.oldValue.toFixed(1)}</span>
                      <span className="text-zinc-600">→</span>
                      <span className="text-sm font-mono text-zinc-100">{attr.newValue.toFixed(1)}</span>
                      <span className={`text-xs font-mono ${attr.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        ({attr.change >= 0 ? "+" : ""}
                        {attr.change.toFixed(1)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges Earned */}
          {data.badgesEarned.length > 0 && (
            <div>
              <h4 className="text-xs font-display font-bold text-zinc-400 tracking-wide mb-3">BADGES EARNED</h4>
              <div className="flex flex-wrap gap-3">
                {data.badgesEarned.map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-2 px-3 py-2 border ${getTierColor(badge.tier)}`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-display font-bold">{badge.name}</span>
                    <span className="text-xs uppercase opacity-75">({badge.tier})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fan Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-display font-bold text-zinc-400 tracking-wide mb-2">FAN GROWTH</h4>
              <div className="bg-zinc-800/30 p-3 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">Before</span>
                  <span className="text-sm font-mono text-zinc-400">{formatNumber(data.fanGrowth.fans_before)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">After</span>
                  <span className="text-sm font-mono text-zinc-100">{formatNumber(data.fanGrowth.fans_after)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                  <span className="text-xs text-zinc-500">Gained</span>
                  <span className="text-sm font-mono font-bold text-green-500">
                    +{formatNumber(data.fanGrowth.fans_gained)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-display font-bold text-zinc-400 tracking-wide mb-2">TRENDING</h4>
              <div className="bg-zinc-800/30 p-3 border border-zinc-800">
                <div className="flex items-center gap-2">
                  {data.fanGrowth.trending_change > 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span
                    className={`text-2xl font-mono font-bold ${data.fanGrowth.trending_change >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {data.fanGrowth.trending_change >= 0 ? "+" : ""}
                    {data.fanGrowth.trending_change}%
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">Social media momentum</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
