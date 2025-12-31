"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, Search, Star, MapPin, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BattlerPortrait } from "@/components/battler-portrait"

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

interface SignBattlerModalProps {
  open: boolean
  onClose: () => void
  onSignComplete: () => void
}

export function SignBattlerModal({ open, onClose, onSignComplete }: SignBattlerModalProps) {
  const [battlers, setBattlers] = useState<AvailableBattler[]>([])
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBattler, setSelectedBattler] = useState<AvailableBattler | null>(null)

  useEffect(() => {
    if (open) {
      fetchBattlers()
    }
  }, [open, tierFilter])

  const fetchBattlers = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (tierFilter !== "all") {
        params.set("tier", tierFilter)
      }
      params.set("limit", "50")

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

      onSignComplete()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSigning(null)
    }
  }

  const filteredBattlers = battlers.filter((b) =>
    b.stageName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getWritingAvg = (stats: AvailableBattler["stats"]) => {
    if (!stats) return 0
    const { lyricism, wordplay, creativity, flow } = stats.writing
    return Math.round(((lyricism + wordplay + creativity + flow) / 4) * 10) / 10
  }

  const getPerformanceAvg = (stats: AvailableBattler["stats"]) => {
    if (!stats) return 0
    const { stagePresence, crowdControl, delivery } = stats.performance
    return Math.round(((stagePresence + crowdControl + delivery) / 3) * 10) / 10
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-lg font-display font-black text-zinc-100 uppercase">
              Sign a Battler
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-zinc-800 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search battlers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 font-display text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["all", "rookie", "prospect", "contender", "veteran", "elite", "legend"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1.5 text-xs font-display font-bold uppercase whitespace-nowrap transition-colors ${
                    tierFilter === tier
                      ? "bg-orange-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : filteredBattlers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-500">No battlers available to sign.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBattlers.map((battler) => (
                  <BattlerPreviewCard
                    key={battler.id}
                    battler={battler}
                    selected={selectedBattler?.id === battler.id}
                    onSelect={() => setSelectedBattler(battler)}
                    onSign={() => handleSign(battler.id)}
                    signing={signing === battler.id}
                    writingAvg={getWritingAvg(battler.stats)}
                    performanceAvg={getPerformanceAvg(battler.stats)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface BattlerPreviewCardProps {
  battler: AvailableBattler
  selected: boolean
  onSelect: () => void
  onSign: () => void
  signing: boolean
  writingAvg: number
  performanceAvg: number
}

function BattlerPreviewCard({
  battler,
  selected,
  onSelect,
  onSign,
  signing,
  writingAvg,
  performanceAvg,
}: BattlerPreviewCardProps) {
  const tierColors: Record<string, string> = {
    rookie: "text-zinc-400 border-zinc-600",
    prospect: "text-green-400 border-green-600",
    contender: "text-blue-400 border-blue-600",
    veteran: "text-purple-400 border-purple-600",
    elite: "text-orange-400 border-orange-600",
    legend: "text-yellow-400 border-yellow-600",
  }

  const tierColor = tierColors[battler.tier?.toLowerCase()] || "text-zinc-400 border-zinc-600"

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-zinc-800 border ${
        selected ? "border-orange-500 ring-2 ring-orange-500/20" : "border-zinc-700 hover:border-zinc-600"
      } cursor-pointer transition-colors`}
      onClick={onSelect}
    >
      {/* Portrait */}
      <div className="aspect-square bg-zinc-900 overflow-hidden">
        <BattlerPortrait
          battler={{
            stageName: battler.stageName,
            portrait: battler.portrait,
            tier: battler.tier,
          }}
          size="xl"
          showFrame={false}
        />
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-zinc-100 text-sm truncate">
            {battler.stageName}
          </h3>
          <span className={`text-xs font-display font-bold uppercase px-1.5 py-0.5 border ${tierColor}`}>
            {battler.tier}
          </span>
        </div>

        {/* Location */}
        {battler.city && (
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="w-3 h-3" />
            <span>{battler.city.name}, {battler.city.state}</span>
          </div>
        )}

        {/* League */}
        {battler.league && (
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Trophy className="w-3 h-3" />
            <span>{battler.league.name}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="text-center">
            <div className="text-xs text-zinc-500 uppercase">Writing</div>
            <div className="text-sm font-bold text-orange-400">{writingAvg}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-zinc-500 uppercase">Performance</div>
            <div className="text-sm font-bold text-blue-400">{performanceAvg}</div>
          </div>
        </div>

        {/* Record */}
        <div className="flex items-center justify-center gap-1 text-xs text-zinc-400">
          <span className="text-green-500">{battler.record.wins}W</span>
          <span>-</span>
          <span className="text-red-500">{battler.record.losses}L</span>
        </div>

        {/* Style Tags */}
        {battler.styleTags && battler.styleTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {battler.styleTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-zinc-700 text-zinc-300 px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Sign Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onSign()
          }}
          disabled={signing}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-display text-xs mt-2"
        >
          {signing ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Signing...
            </>
          ) : (
            "SIGN"
          )}
        </Button>
      </div>
    </motion.div>
  )
}
