"use client"

import Link from "next/link"
import { ArrowLeft, TrendingUp, TrendingDown, ChevronRight, Filter, LayoutGrid, List, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { BattleFlyerCard } from "@/components/battle-flyer"
import { MOCK_BATTLE_FLYERS } from "@/lib/battle-flyers"
import { useActiveBattler } from "@/contexts/battler-context"

interface BattleHistoryItem {
  id: string
  opponent: {
    id: string
    name: string
    tier: string
    avatar: string
    rating: number
    styles: string[]
  }
  league: string
  date: string
  result: 'W' | 'L'
  verdict: string
  decisionType: string
  roundResults: string[]
  payout: number
}

export default function CareerHistoryPage() {
  const [filter, setFilter] = useState<"all" | "wins" | "losses">("all")
  const [viewMode, setViewMode] = useState<"list" | "flyers">("flyers")
  const [battles, setBattles] = useState<BattleHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeBattler = useActiveBattler()

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true)
        const res = await fetch('/api/battles/history')
        if (!res.ok) throw new Error('Failed to fetch battle history')
        const data = await res.json()
        setBattles(data.battles || [])
      } catch (err) {
        console.error('Failed to load battle history:', err)
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [])

  const filteredBattles = battles.filter((battle) => {
    if (filter === "wins") return battle.result === "W"
    if (filter === "losses") return battle.result === "L"
    return true
  })

  const totalWins = battles.filter((b) => b.result === "W").length
  const totalLosses = battles.filter((b) => b.result === "L").length
  const winRate = totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-900">
        <Link href="/dashboard" className="text-zinc-400 hover:text-orange-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-display font-bold text-zinc-100 tracking-wide">BATTLE HISTORY</h1>
          <p className="text-sm text-zinc-500">{activeBattler?.stageName || 'Player'}'s Career Record</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 border-2 border-zinc-700 p-4 text-center">
            <div className="text-3xl font-mono font-bold text-zinc-100">{totalWins + totalLosses}</div>
            <div className="text-xs text-zinc-500 font-display">TOTAL BATTLES</div>
          </div>
          <div className="bg-zinc-900 border-2 border-green-500/30 p-4 text-center">
            <div className="text-3xl font-mono font-bold text-green-500">{totalWins}</div>
            <div className="text-xs text-zinc-500 font-display">WINS</div>
          </div>
          <div className="bg-zinc-900 border-2 border-red-500/30 p-4 text-center">
            <div className="text-3xl font-mono font-bold text-red-500">{totalLosses}</div>
            <div className="text-xs text-zinc-500 font-display">LOSSES</div>
          </div>
        </div>

        {/* Win Rate Bar */}
        <div className="bg-zinc-900 border-2 border-zinc-700 p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-zinc-400 font-display">WIN RATE</span>
            <span className="text-lg font-mono font-bold text-orange-500">{winRate}%</span>
          </div>
          <div className="h-3 bg-zinc-800 overflow-hidden flex">
            {totalWins + totalLosses > 0 && (
              <>
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(totalWins / (totalWins + totalLosses)) * 100}%` }}
                />
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${(totalLosses / (totalWins + totalLosses)) * 100}%` }}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-xs font-display ${
                filter === "all" ? "bg-orange-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilter("wins")}
              className={`px-3 py-1 text-xs font-display ${
                filter === "wins" ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              WINS
            </button>
            <button
              onClick={() => setFilter("losses")}
              className={`px-3 py-1 text-xs font-display ${
                filter === "losses" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              LOSSES
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-zinc-800 p-1">
            <button
              onClick={() => setViewMode("flyers")}
              className={`p-2 ${viewMode === "flyers" ? "bg-orange-600 text-white" : "text-zinc-400 hover:text-white"}`}
              title="Flyer View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-orange-600 text-white" : "text-zinc-400 hover:text-white"}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === "flyers" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_BATTLE_FLYERS.map((flyer) => (
              <Link key={flyer.id} href={`/battle/${flyer.id}`} className="block hover:opacity-90 transition-opacity">
                <BattleFlyerCard flyer={flyer} size="md" />
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-zinc-900 border-2 border-zinc-700">
            {filteredBattles.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                No battles found. Start battling to build your history!
              </div>
            ) : (
              filteredBattles.map((battle, index) => (
                <Link
                  key={battle.id}
                  href={`/battle/${battle.id}`}
                  className={`flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors ${
                    index !== filteredBattles.length - 1 ? "border-b border-zinc-800" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Result Icon */}
                    <div
                      className={`w-10 h-10 flex items-center justify-center ${
                        battle.result === "W" ? "bg-green-500/20" : "bg-red-500/20"
                      }`}
                    >
                      {battle.result === "W" ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                    </div>

                    {/* Opponent Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-200 font-display font-bold">
                          vs {battle.opponent.name}
                        </span>
                        <span
                          className={`text-xs font-mono ${battle.result === "W" ? "text-green-500" : "text-red-500"}`}
                        >
                          {battle.result}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {battle.league} • {battle.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg font-mono font-bold ${
                        battle.result === "W" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {battle.verdict}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
