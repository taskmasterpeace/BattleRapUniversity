"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { useBattler } from "@/contexts/battler-context"
import Image from "next/image"
import {
  Trophy,
  Lock,
  Zap,
  Award,
  Pen,
  Theater,
  Users,
  MapPin,
  Medal,
  Skull,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Search,
} from "lucide-react"
import { ALL_BADGES, type Badge, type BadgeCategory, type BadgeRarity } from "@/lib/all-badges"
import { Input } from "@/components/ui/input"

const categoryIcons: Record<BadgeCategory, React.ElementType> = {
  writing: Pen,
  performance: Theater,
  reputation: Users,
  content_style: Sparkles,
  regional: MapPin,
  tournament: Trophy,
  special_ability: Zap,
  city: MapPin,
  region: MapPin,
  milestone: Medal,
}

const categoryLabels: Record<BadgeCategory, string> = {
  writing: "Writing",
  performance: "Performance",
  reputation: "Reputation",
  content_style: "Content Style",
  regional: "Regional",
  tournament: "Tournament",
  special_ability: "Special Ability",
  city: "City",
  region: "Region",
  milestone: "Milestone",
}

const getRarityColor = (rarity: BadgeRarity) => {
  switch (rarity) {
    case "common":
      return "text-zinc-400 border-zinc-500 bg-zinc-500/10"
    case "rare":
      return "text-blue-400 border-blue-500 bg-blue-500/10"
    case "epic":
      return "text-purple-400 border-purple-500 bg-purple-500/10"
    case "legendary":
      return "text-amber-400 border-amber-500 bg-amber-500/10"
  }
}

const getRarityGlow = (rarity: BadgeRarity, earned: boolean) => {
  if (!earned) return ""
  switch (rarity) {
    case "common":
      return ""
    case "rare":
      return "shadow-blue-500/20 shadow-lg"
    case "epic":
      return "shadow-purple-500/30 shadow-lg"
    case "legendary":
      return "shadow-amber-500/40 shadow-xl animate-pulse"
  }
}

const badgeSpriteMap: Record<string, string> = {
  "rebuttal king/queen": "/sprites/badges/badge_046.png",
  "rebuttal king": "/sprites/badges/badge_046.png",
  "well researched": "/sprites/badges/badge_054.png",
  "punchline king/queen": "/images/badge-046.png",
  "double entendre expert": "/images/badge-048.png",
}

function getBadgeImage(badge: Badge): string | null {
  const lowerName = badge.name.toLowerCase()
  if (badgeSpriteMap[lowerName]) {
    return badgeSpriteMap[lowerName]
  }
  // Try to find by partial match
  for (const [key, value] of Object.entries(badgeSpriteMap)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return value
    }
  }
  return null
}

function BadgeDetailModal({ badge, earned, onClose }: { badge: Badge; earned: boolean; onClose: () => void }) {
  const badgeImage = getBadgeImage(badge)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border-2 border-zinc-700 max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 flex items-center justify-center border-2 ${
              earned ? getRarityColor(badge.rarity) : "border-zinc-700 bg-zinc-800"
            } ${earned ? getRarityGlow(badge.rarity, earned) : ""}`}
          >
            {earned ? (
              badgeImage ? (
                <Image
                  src={badgeImage || "/placeholder.svg"}
                  alt={badge.name}
                  width={80}
                  height={80}
                  className="pixelated"
                />
              ) : (
                <span className="text-3xl sm:text-4xl">{badge.icon}</span>
              )
            ) : (
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-600" />
            )}
          </div>
          <h2 className="font-display font-black text-lg sm:text-xl text-zinc-100 uppercase tracking-wide">
            {badge.name}
          </h2>
          <span
            className={`text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 border uppercase font-display font-bold ${getRarityColor(badge.rarity)}`}
          >
            {badge.rarity}
          </span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-zinc-800/50 p-2 sm:p-3 border border-zinc-700">
            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase font-display mb-1">Description</p>
            <p className="text-xs sm:text-sm text-zinc-300">{badge.fullEffectText || badge.description}</p>
          </div>

          <div className="bg-zinc-800/50 p-2 sm:p-3 border border-zinc-700">
            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase font-display mb-1">Category</p>
            <p className="text-xs sm:text-sm text-zinc-300 font-display">{categoryLabels[badge.category]}</p>
          </div>

          {Object.keys(badge.effects).length > 0 && (
            <div className="bg-zinc-800/50 p-2 sm:p-3 border border-zinc-700">
              <p className="text-[10px] sm:text-xs text-zinc-500 uppercase font-display mb-2">Effects</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {Object.entries(badge.effects).map(([key, value]) => (
                  <span
                    key={key}
                    className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-display font-bold ${
                      (value as number) > 0
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {key.replace(/([A-Z])/g, " $1").trim()}: {(value as number) > 0 ? "+" : ""}
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {badge.isNegative && (
            <div className="bg-red-500/10 border border-red-500/30 p-2 sm:p-3">
              <p className="text-[10px] sm:text-xs text-red-400 font-display">
                <Skull className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                NEGATIVE BADGE
                {badge.removable && badge.removalCondition && (
                  <span className="block mt-1 sm:mt-2 text-zinc-400 text-[10px] sm:text-xs">
                    Remove by: {badge.removalCondition}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3 bg-amber-600 hover:bg-amber-500 text-zinc-900 text-xs sm:text-sm font-display font-black uppercase tracking-wider transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function BadgesPage() {
  const { activeBattler } = useBattler()
  const [filterRarity, setFilterRarity] = useState<"all" | BadgeRarity>("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "earned" | "locked">("all")
  const [expandedCategories, setExpandedCategories] = useState<Set<BadgeCategory>>(
    new Set([
      "writing",
      "performance",
      "reputation",
      "content_style",
      "milestone",
      "tournament",
      "special_ability",
      "city",
      "region",
      "regional",
    ]),
  )
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const earnedBadgeIds = useMemo(() => {
    const earned = new Set<string>()
    if (activeBattler?.badges) {
      activeBattler.badges.forEach((b) => {
        const id = b.toLowerCase().replace(/\s+/g, "_")
        earned.add(id)
      })
    }
    // Demo earned badges
    earned.add("first_blood")
    earned.add("crowd_pleaser")
    earned.add("streak_master")
    earned.add("rebuttal_king")
    earned.add("well_researched")
    return earned
  }, [activeBattler])

  const isBadgeEarned = (badge: Badge) => {
    return earnedBadgeIds.has(badge.id) || earnedBadgeIds.has(badge.name.toLowerCase().replace(/\s+/g, "_"))
  }

  const badgesByCategory = useMemo(() => {
    const grouped: Record<BadgeCategory, Badge[]> = {
      writing: [],
      performance: [],
      reputation: [],
      content_style: [],
      regional: [],
      tournament: [],
      special_ability: [],
      city: [],
      region: [],
      milestone: [],
    }

    ALL_BADGES.forEach((badge) => {
      // Search filter
      if (
        searchQuery &&
        !badge.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !badge.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return
      }
      if (filterRarity !== "all" && badge.rarity !== filterRarity) return
      const earned = isBadgeEarned(badge)
      if (filterStatus === "earned" && !earned) return
      if (filterStatus === "locked" && earned) return

      grouped[badge.category].push(badge)
    })

    return grouped
  }, [filterRarity, filterStatus, earnedBadgeIds, searchQuery])

  const totalBadges = ALL_BADGES.length
  const earnedCount = ALL_BADGES.filter((b) => isBadgeEarned(b)).length

  const toggleCategory = (category: BadgeCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-display font-black text-3xl text-amber-500 uppercase tracking-wider mb-2">
          Badge Compendium
        </h1>
        <p className="text-zinc-400 font-display text-sm">Unlock badges to define your style and gain unique bonuses</p>
      </div>

      {/* Stats Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
        <Card className="bg-zinc-900 border-2 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <p className="text-3xl font-display font-black text-zinc-100">{earnedCount}</p>
            <p className="text-xs text-zinc-500 font-display uppercase">Earned</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-2 border-zinc-700">
          <CardContent className="p-4 text-center">
            <Lock className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-3xl font-display font-black text-zinc-100">{totalBadges - earnedCount}</p>
            <p className="text-xs text-zinc-500 font-display uppercase">Locked</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-2 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <Award className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <p className="text-3xl font-display font-black text-zinc-100">
              {Math.round((earnedCount / totalBadges) * 100)}%
            </p>
            <p className="text-xs text-zinc-500 font-display uppercase">Complete</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <Input
          placeholder="Search badges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-900 border-2 border-zinc-700 text-zinc-100 font-display placeholder:text-zinc-600"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-zinc-500 uppercase font-display font-bold">Status:</span>
          {(["all", "earned", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 text-xs font-display font-bold uppercase transition-colors ${
                filterStatus === f
                  ? "bg-amber-600 text-zinc-900"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-zinc-500 uppercase font-display font-bold">Rarity:</span>
          {(["all", "common", "rare", "epic", "legendary"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterRarity(f)}
              className={`px-3 py-1.5 text-xs font-display font-bold uppercase transition-colors ${
                filterRarity === f
                  ? "bg-amber-600 text-zinc-900"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Badges by Category */}
      <div className="space-y-3">
        {(Object.keys(badgesByCategory) as BadgeCategory[]).map((category) => {
          const badges = badgesByCategory[category]
          if (badges.length === 0) return null

          const CategoryIcon = categoryIcons[category]
          const isExpanded = expandedCategories.has(category)
          const earnedInCategory = badges.filter((b) => isBadgeEarned(b)).length

          return (
            <motion.div key={category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 bg-zinc-900 border-2 border-zinc-700 hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon className="w-6 h-6 text-amber-500" />
                  <span className="font-display font-black text-zinc-100 uppercase tracking-wide">
                    {categoryLabels[category]}
                  </span>
                  <span className="text-sm text-zinc-500 font-display">
                    ({earnedInCategory}/{badges.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-zinc-500" />
                )}
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4 bg-zinc-950 border-2 border-t-0 border-zinc-700"
                >
                  {badges.map((badge, index) => {
                    const earned = isBadgeEarned(badge)
                    const badgeImage = getBadgeImage(badge)
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => setSelectedBadge(badge)}
                        className="cursor-pointer group"
                      >
                        <Card
                          className={`bg-zinc-900 border-2 transition-all hover:border-amber-500/50 hover:scale-105 ${
                            earned
                              ? `${getRarityGlow(badge.rarity, earned)} border-zinc-700`
                              : "opacity-50 border-zinc-800"
                          } ${badge.isNegative ? "border-red-500/30" : ""}`}
                        >
                          <CardContent className="p-3 text-center">
                            <div
                              className={`w-16 h-16 mx-auto mb-2 flex items-center justify-center border-2 ${
                                earned ? getRarityColor(badge.rarity) : "border-zinc-700 bg-zinc-800"
                              } ${badge.isNegative && earned ? "border-red-500 bg-red-500/10" : ""}`}
                            >
                              {earned ? (
                                badgeImage ? (
                                  <Image
                                    src={badgeImage || "/placeholder.svg"}
                                    alt={badge.name}
                                    width={48}
                                    height={48}
                                    className="pixelated"
                                  />
                                ) : (
                                  <span className="text-2xl">{badge.icon}</span>
                                )
                              ) : (
                                <Lock className="w-6 h-6 text-zinc-600" />
                              )}
                            </div>
                            <h3 className="font-display font-bold text-zinc-200 text-xs mb-1 line-clamp-2 uppercase">
                              {badge.name}
                            </h3>
                            <span
                              className={`text-[10px] px-2 py-0.5 border uppercase font-display font-bold ${getRarityColor(badge.rarity)}`}
                            >
                              {badge.rarity}
                            </span>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          earned={isBadgeEarned(selectedBadge)}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  )
}
