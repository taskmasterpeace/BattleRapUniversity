"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2, Search, MapPin, Trophy, ArrowLeft,
  Pen, Mic, Heart, Zap, ChevronLeft, ChevronRight,
  Star, Users, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BattlerPortrait } from "@/components/battler-portrait"
import { useBattler } from "@/contexts/battler-context"
import Link from "next/link"

interface AvailableBattler {
  id: string
  stageName: string
  tier: string
  rating: number
  region: string
  city: {
    name: string
    state: string
    region: string
  } | null
  league: {
    id: string
    name: string
    shortCode: string
    tier: string
  } | null
  archetype: string
  stats: {
    writing: {
      lyricism: number
      wordplay: number
      creativity: number
      flow: number
    }
    performance: {
      stagePresence: number
      crowdControl: number
      delivery: number
    }
    personal: {
      financial: number
      reputation: number
      family: number
      resilience: number
    }
  } | null
  styleTags: string[]
  record: {
    wins: number
    losses: number
  }
  portrait: {
    spriteUrl: string
    crop?: {
      scale: number
      offsetX: number
      offsetY: number
    }
  }
}

// Compact stat bar for the preview panel
function StatBar({ label, value, maxValue = 10, color = "orange" }: {
  label: string
  value: number
  maxValue?: number
  color?: "orange" | "blue" | "green" | "purple" | "yellow"
}) {
  const percentage = (value / maxValue) * 100
  const colorClasses = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-zinc-500 w-14 uppercase truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 overflow-hidden">
        <motion.div
          className={`h-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] text-zinc-400 w-5 text-right font-mono">{value.toFixed(1)}</span>
    </div>
  )
}

export default function SignBattlerPage() {
  const router = useRouter()
  const { refreshBattler } = useBattler()
  const [battlers, setBattlers] = useState<AvailableBattler[]>([])
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBattler, setSelectedBattler] = useState<AvailableBattler | null>(null)
  const [hoveredBattler, setHoveredBattler] = useState<AvailableBattler | null>(null)

  // The battler to show in the preview panel (hovered takes priority)
  const previewBattler = hoveredBattler || selectedBattler

  // Get unique regions from battlers
  const regions = Array.from(new Set(battlers.map(b => b.region).filter(Boolean))).sort()

  // City sprite mapping
  const CITY_SPRITES: Record<string, string[]> = {
    'new-york-city': ['new-york-city-dusk.png', 'new-york-day.png'],
    'new-jersey': ['new-jersey-dusk.png'],
    'los-angeles': ['los-angeles-dusk.png', 'los-angeles-night.png'],
    'detroit': ['detroit-dusk.png'],
    'baltimore': ['baltimore-dusk.png'],
    'boston': ['boston-dusk.png'],
    'philadelphia': ['philadelphia-dusk.png'],
    'chicago': ['chicago-dusk.png', 'chicago-day.png'],
    'st-louis': ['st-louis-dusk.png'],
    'tampa': ['tampa-dusk.png'],
    'phoenix': ['phoenix-dusk.png'],
    'atlanta': ['atlanta-dusk.png'],
    'miami': ['miami-day.png'],
  }

  const getCitySprite = useCallback((city: AvailableBattler["city"], battlerId?: string) => {
    if (!city) return null
    const cityName = city.name.toLowerCase()
    const state = city.state.toLowerCase()
    let prefix: string | null = null

    if (["harlem", "bronx", "brooklyn", "staten island", "yonkers", "queens", "new york city"].includes(cityName) ||
        (state === "ny" && !["rochester", "buffalo", "syracuse", "albany"].includes(cityName))) {
      prefix = "new-york-city"
    } else if (state === "nj" || ["newark", "east orange", "jersey city", "paterson"].includes(cityName)) {
      prefix = "new-jersey"
    } else if (["los angeles", "watts", "compton", "long beach", "inglewood"].includes(cityName)) {
      prefix = "los-angeles"
    } else if (["detroit", "pontiac", "flint"].includes(cityName) || state === "mi") {
      prefix = "detroit"
    } else if (cityName === "baltimore") prefix = "baltimore"
    else if (cityName === "boston") prefix = "boston"
    else if (cityName === "philadelphia") prefix = "philadelphia"
    else if (cityName === "chicago") prefix = "chicago"
    else if (cityName === "st. louis") prefix = "st-louis"
    else if (cityName === "tampa") prefix = "tampa"
    else if (cityName === "phoenix") prefix = "phoenix"
    else if (cityName === "atlanta") prefix = "atlanta"
    else if (cityName === "miami") prefix = "miami"
    else if (state === "ct" || state === "ma") prefix = "boston"
    else if (state === "pa") prefix = "philadelphia"
    else if (state === "il" || state === "mo") prefix = "chicago"
    else if (state === "fl") prefix = "tampa"
    else if (state === "ga") prefix = "atlanta"
    else if (state === "ca") prefix = "los-angeles"
    else if (state === "az") prefix = "phoenix"

    if (!prefix) return null
    const sprites = CITY_SPRITES[prefix]
    if (!sprites || sprites.length === 0) return null

    const seed = battlerId || `${cityName}-${state}`
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i)
      hash |= 0
    }
    const spriteIndex = Math.abs(hash) % sprites.length
    return `/sprites/cities/${sprites[spriteIndex]}`
  }, [])

  useEffect(() => {
    fetchBattlers()
  }, [tierFilter])

  // Auto-select first battler when loaded
  useEffect(() => {
    if (battlers.length > 0 && !selectedBattler) {
      setSelectedBattler(battlers[0])
    }
  }, [battlers, selectedBattler])

  const fetchBattlers = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (tierFilter !== "all") {
        params.set("tier", tierFilter)
      }
      params.set("limit", "100")

      const res = await fetch(`/api/battlers/available?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch battlers")
      }

      setBattlers(data.battlers || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSign = async (battlerId: string) => {
    setSigning(battlerId)
    setError(null)
    try {
      const res = await fetch("/api/battlers/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ battlerId }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign battler")
      }

      // Refresh the battler context before navigating
      await refreshBattler()
      router.push("/roster")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSigning(null)
    }
  }

  const filteredBattlers = battlers
    .filter((b) => {
      const matchesSearch = b.stageName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRegion = regionFilter === "all" || b.region === regionFilter
      return matchesSearch && matchesRegion
    })
    .sort((a, b) => {
      const tierOrder: Record<string, number> = { god: 1, top: 2, mid: 3, low: 4 }
      return (tierOrder[a.tier?.toLowerCase()] || 5) - (tierOrder[b.tier?.toLowerCase()] || 5)
    })

  const tierColors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    god: { border: "border-yellow-500", bg: "bg-yellow-500/20", text: "text-yellow-400", glow: "shadow-yellow-500/50" },
    top: { border: "border-orange-500", bg: "bg-orange-500/20", text: "text-orange-400", glow: "shadow-orange-500/50" },
    mid: { border: "border-blue-500", bg: "bg-blue-500/20", text: "text-blue-400", glow: "shadow-blue-500/50" },
    low: { border: "border-zinc-500", bg: "bg-zinc-500/20", text: "text-zinc-400", glow: "shadow-zinc-500/50" },
  }

  // Calculate grid dimensions - aim for 8 columns
  const GRID_COLS = 8
  const rows = Math.ceil(filteredBattlers.length / GRID_COLS)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header Bar */}
      <div className="bg-zinc-900/90 border-b-2 border-orange-600 px-4 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/roster"
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-display font-black text-orange-500 uppercase tracking-tight">
                FREE AGENTS
              </h1>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Select a battler to manage
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 font-display text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="text-sm text-zinc-500 font-mono">
            {filteredBattlers.length} AVAILABLE
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-2">
        <div className="max-w-[1600px] mx-auto flex items-center gap-6">
          {/* Tier Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase">Tier:</span>
            <div className="flex gap-1">
              {["all", "god", "top", "mid", "low"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1 text-xs font-display font-bold uppercase transition-all ${
                    tierFilter === tier
                      ? "bg-orange-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase">Region:</span>
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setRegionFilter("all")}
                className={`px-3 py-1 text-xs font-display font-bold uppercase transition-all ${
                  regionFilter === "all"
                    ? "bg-orange-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                }`}
              >
                All
              </button>
              {regions.slice(0, 6).map((region) => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region)}
                  className={`px-3 py-1 text-xs font-display font-bold uppercase whitespace-nowrap transition-all ${
                    regionFilter === region
                      ? "bg-orange-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Selected Battler Preview */}
        <div className="w-[400px] flex-shrink-0 bg-zinc-900/80 border-r border-zinc-800 flex flex-col">
          <AnimatePresence mode="wait">
            {previewBattler ? (
              <motion.div
                key={previewBattler.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                {/* Portrait Area - Compact */}
                <div className="relative h-[200px] overflow-hidden flex-shrink-0">
                  {/* City Backdrop */}
                  {getCitySprite(previewBattler.city, previewBattler.id) && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-50"
                      style={{ backgroundImage: `url(${getCitySprite(previewBattler.city, previewBattler.id)})` }}
                    />
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 to-transparent" />

                  {/* Battler Portrait */}
                  <div className="relative z-10 w-full h-full flex items-end justify-center">
                    <div className="w-[180px] h-[180px]">
                      <BattlerPortrait
                        battler={{
                          stageName: previewBattler.stageName,
                          portrait: previewBattler.portrait,
                          tier: previewBattler.tier,
                        }}
                        size="lg"
                        showFrame={false}
                      />
                    </div>
                  </div>

                  {/* Tier Badge */}
                  <div className="absolute top-2 right-2 z-20">
                    <span className={`px-2 py-1 text-xs font-display font-black uppercase ${tierColors[previewBattler.tier?.toLowerCase()]?.bg} ${tierColors[previewBattler.tier?.toLowerCase()]?.text} border ${tierColors[previewBattler.tier?.toLowerCase()]?.border}`}>
                      {previewBattler.tier}
                    </span>
                  </div>
                </div>

                {/* Info Panel - Compact */}
                <div className="flex-1 p-3 overflow-y-auto">
                  {/* Name & Location Row */}
                  <div className="mb-2">
                    <h2 className="text-xl font-display font-black text-zinc-100 uppercase tracking-tight leading-tight">
                      {previewBattler.stageName}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      {previewBattler.city && (
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                          <MapPin className="w-3 h-3 text-orange-500" />
                          <span>{previewBattler.city.name}, {previewBattler.city.state}</span>
                        </div>
                      )}
                      {previewBattler.league && (
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                          <Trophy className="w-3 h-3 text-yellow-500" />
                          <span>{previewBattler.league.shortCode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Record - Compact horizontal */}
                  <div className="flex items-center gap-3 mb-3 py-2 px-3 bg-zinc-800/50 border border-zinc-700">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-display font-black text-green-500">{previewBattler.record.wins}</span>
                      <span className="text-[10px] text-zinc-500 uppercase">W</span>
                    </div>
                    <span className="text-zinc-600">-</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-display font-black text-red-500">{previewBattler.record.losses}</span>
                      <span className="text-[10px] text-zinc-500 uppercase">L</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <span className="text-lg font-display font-black text-zinc-300">{previewBattler.rating || "—"}</span>
                      <span className="text-[10px] text-zinc-500 uppercase">RTG</span>
                    </div>
                  </div>

                  {/* Stats - Two columns for Writing & Performance */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {/* Writing Stats */}
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Pen className="w-3 h-3 text-orange-500" />
                        <span className="text-[10px] font-display font-bold text-orange-500 uppercase">Writing</span>
                      </div>
                      <div className="space-y-1">
                        <StatBar label="Lyric" value={previewBattler.stats?.writing.lyricism || 0} color="orange" />
                        <StatBar label="Words" value={previewBattler.stats?.writing.wordplay || 0} color="orange" />
                        <StatBar label="Create" value={previewBattler.stats?.writing.creativity || 0} color="orange" />
                        <StatBar label="Flow" value={previewBattler.stats?.writing.flow || 0} color="orange" />
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Mic className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] font-display font-bold text-blue-500 uppercase">Perform</span>
                      </div>
                      <div className="space-y-1">
                        <StatBar label="Stage" value={previewBattler.stats?.performance.stagePresence || 0} color="blue" />
                        <StatBar label="Crowd" value={previewBattler.stats?.performance.crowdControl || 0} color="blue" />
                        <StatBar label="Deliv" value={previewBattler.stats?.performance.delivery || 0} color="blue" />
                      </div>
                    </div>
                  </div>

                  {/* Personal Stats - Compact row */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Heart className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] font-display font-bold text-green-500 uppercase">Personal</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <StatBar label="Money" value={previewBattler.stats?.personal.financial || 0} color="green" />
                      <StatBar label="Rep" value={previewBattler.stats?.personal.reputation || 0} color="green" />
                      <StatBar label="Family" value={previewBattler.stats?.personal.family || 0} color="green" />
                      <StatBar label="Resil" value={previewBattler.stats?.personal.resilience || 0} color="green" />
                    </div>
                  </div>

                  {/* Style Tags - Inline */}
                  {previewBattler.styleTags && previewBattler.styleTags.length > 0 && (
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase mb-1">Style</div>
                      <div className="flex flex-wrap gap-1">
                        {previewBattler.styleTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign Button - Compact */}
                <div className="p-3 border-t border-zinc-800 bg-zinc-900 flex-shrink-0">
                  <Button
                    onClick={() => handleSign(previewBattler.id)}
                    disabled={signing === previewBattler.id}
                    className="w-full h-10 bg-orange-600 hover:bg-orange-500 text-white font-display font-black text-sm uppercase tracking-wide"
                  >
                    {signing === previewBattler.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        SIGNING...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        SIGN TO ROSTER
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-600">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm uppercase">Select a battler</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Character Grid */}
        <div className="flex-1 overflow-auto p-4 bg-zinc-950">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : filteredBattlers.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500">
              No free agents available matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2">
              {filteredBattlers.map((battler, index) => {
                const tierColor = tierColors[battler.tier?.toLowerCase()] || tierColors.low
                const isSelected = selectedBattler?.id === battler.id
                const isHovered = hoveredBattler?.id === battler.id

                return (
                  <motion.button
                    key={battler.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => setSelectedBattler(battler)}
                    onMouseEnter={() => setHoveredBattler(battler)}
                    onMouseLeave={() => setHoveredBattler(null)}
                    className={`
                      relative aspect-square bg-zinc-900 border-2 transition-all duration-150
                      ${isSelected
                        ? `${tierColor.border} ${tierColor.glow} shadow-lg ring-2 ring-white/20`
                        : isHovered
                          ? `${tierColor.border} ${tierColor.glow} shadow-md scale-105 z-10`
                          : "border-zinc-800 hover:border-zinc-600"
                      }
                    `}
                  >
                    {/* Portrait */}
                    <div className="absolute inset-0 overflow-hidden">
                      <BattlerPortrait
                        battler={{
                          stageName: battler.stageName,
                          portrait: battler.portrait,
                          tier: battler.tier,
                        }}
                        size="md"
                        showFrame={false}
                      />
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-transparent to-zinc-900/30" />

                    {/* Tier indicator */}
                    <div className={`absolute top-1 right-1 w-2 h-2 ${tierColor.bg} ${tierColor.border} border`} />

                    {/* Name plate */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-zinc-900/80">
                      <div className="text-[10px] font-display font-bold text-zinc-100 uppercase truncate leading-tight">
                        {battler.stageName}
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <motion.div
                        layoutId="selector"
                        className="absolute -inset-0.5 border-2 border-white/50 pointer-events-none"
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-zinc-900/90 border-t-2 border-orange-600 px-4 py-2">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-zinc-500 uppercase">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500/20 border border-yellow-500" />
              GOD
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500/20 border border-orange-500" />
              TOP
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500/20 border border-blue-500" />
              MID
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-zinc-500/20 border border-zinc-500" />
              LOW
            </span>
          </div>
          <div className="text-xs text-zinc-600">
            HOVER TO PREVIEW • CLICK TO SELECT • SIGN TO MANAGE
          </div>
        </div>
      </div>
    </div>
  )
}
