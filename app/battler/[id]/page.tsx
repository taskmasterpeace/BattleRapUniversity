"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ArrowLeft, Flame, Trophy, Newspaper, Swords, TrendingUp, TrendingDown } from "lucide-react"
import { CityBackdropHeader } from "@/components/ui/city-backdrop-header"
import type { Battler } from "@/lib/types"

type TabType = "overview" | "battles" | "rivalries" | "media"

interface BattleHistoryItem {
  id: string
  opponent: { id: string; name: string; avatar?: string }
  result: string
  verdict: string
  date: string
  league: string
  payout: number
}

interface NewsArticleItem {
  id: string
  slug: string
  title: string
  type: string
  date: string
}

export default function BattlerCareerPage() {
  const params = useParams()
  const battlerId = params.id as string
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [battler, setBattler] = useState<Battler | null>(null)
  const [battles, setBattles] = useState<BattleHistoryItem[]>([])
  const [articles, setArticles] = useState<NewsArticleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch battler data
        const battlerRes = await fetch(`/api/battler/${battlerId}`)
        if (battlerRes.ok) {
          const battlerData = await battlerRes.json()
          setBattler(battlerData)
        }

        // Fetch battle history
        const battlesRes = await fetch('/api/battles/history')
        if (battlesRes.ok) {
          const battlesData = await battlesRes.json()
          setBattles(battlesData.battles || [])
        }

        // Fetch news articles
        const newsRes = await fetch('/api/news')
        if (newsRes.ok) {
          const newsData = await newsRes.json()
          setArticles(newsData.articles || [])
        }
      } catch (error) {
        console.error('Error fetching battler data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [battlerId])

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "battles", label: "Battles", icon: <Swords className="w-4 h-4" /> },
    { id: "rivalries", label: "Rivalries", icon: <Flame className="w-4 h-4" /> },
    { id: "media", label: "Media", icon: <Newspaper className="w-4 h-4" /> },
  ]

  const getTierFromElo = (elo: number): "none" | "low" | "mid" | "top" | "god" => {
    if (elo >= 2000) return "god"
    if (elo >= 1600) return "top"
    if (elo >= 1200) return "mid"
    if (elo >= 800) return "low"
    return "none"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Loading battler profile...</p>
      </div>
    )
  }

  if (!battler) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Battler not found</p>
          <Link href="/dashboard" className="text-orange-500 hover:text-orange-400">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-900">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm font-display transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          DASHBOARD
        </Link>
        <span className="text-sm font-display font-bold text-orange-500">BATTLER CAREER</span>
        <div className="w-20" />
      </header>

      <CityBackdropHeader
        battlerName={battler.stageName}
        cityName={battler.city?.name || "New York"}
        stateName={battler.city?.state || "NY"}
        region={battler.region || "Northeast"}
        tier={getTierFromElo(battler.elo)}
        cityRank={3}
        cityTotal={12}
        regionRank={8}
        regionTotal={45}
        backdropUrl={`/${(battler.city?.name || "new-york").toLowerCase().replace(/\s+/g, "-")}-city-skyline-urban-hip-hop.jpg`}
      />

      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="bg-zinc-900 border-2 border-zinc-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Portrait - smaller now */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-800 border-2 border-orange-500 overflow-hidden shrink-0">
              <Image
                src={battler.portrait?.spriteUrl || "/rapper-pixel.jpg"}
                alt={battler.stageName}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Quick Stats - horizontal layout */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <span className="text-xs text-zinc-500 block">ELO</span>
                <span className="text-lg font-mono font-bold text-orange-500">{battler.elo}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">RECORD</span>
                <span className="text-lg font-mono font-bold text-zinc-100">
                  {battler.record?.wins || 0}-{battler.record?.losses || 0}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">WIN RATE</span>
                <span className="text-lg font-mono font-bold text-green-500">
                  {battler.record
                    ? Math.round(
                        (battler.record.wins / (battler.record.wins + battler.record.losses)) * 100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">STREAK</span>
                <span className="text-lg font-mono font-bold text-orange-500">
                  {battler.streak > 0 ? `${battler.streak} W` : battler.streak < 0 ? `${Math.abs(battler.streak)} L` : "0"}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">LEAGUE</span>
                <span className="text-sm font-display font-bold text-zinc-300">{battler.league}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-display font-bold transition-colors ${
                activeTab === tab.id
                  ? "bg-orange-600 text-white"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-orange-500"
              }`}
            >
              {tab.icon}
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
              <span className="xs:hidden sm:hidden">{tab.label.slice(0, 4)}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Attributes */}
              <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-6">
                <h2 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">ATTRIBUTES</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Writing */}
                  <div>
                    <h3 className="text-xs text-green-500 font-display font-bold mb-3">WRITING</h3>
                    <div className="space-y-2">
                      {Object.entries(battler.stats.writing).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 w-20 capitalize">{key}</span>
                          <div className="flex-1 h-2 bg-zinc-800">
                            <div className="h-full bg-green-500" style={{ width: `${value * 10}%` }} />
                          </div>
                          <span className="text-xs font-mono text-zinc-400 w-6">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Performance */}
                  <div>
                    <h3 className="text-xs text-blue-500 font-display font-bold mb-3">PERFORMANCE</h3>
                    <div className="space-y-2">
                      {Object.entries(battler.stats.performance).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 w-20 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <div className="flex-1 h-2 bg-zinc-800">
                            <div className="h-full bg-blue-500" style={{ width: `${value * 10}%` }} />
                          </div>
                          <span className="text-xs font-mono text-zinc-400 w-6">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Personal */}
                  <div>
                    <h3 className="text-xs text-purple-500 font-display font-bold mb-3">PERSONAL</h3>
                    <div className="space-y-2">
                      {Object.entries(battler.stats.personal).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 w-20 capitalize">{key}</span>
                          <div className="flex-1 h-2 bg-zinc-800">
                            <div className="h-full bg-purple-500" style={{ width: `${value * 10}%` }} />
                          </div>
                          <span className="text-xs font-mono text-zinc-400 w-6">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-display font-bold text-zinc-100 tracking-wide">BADGES EARNED</h2>
                  <Link href="/badges" className="text-xs text-orange-500 hover:text-orange-400 font-display">
                    VIEW ALL
                  </Link>
                </div>
                <div className="flex flex-wrap gap-3">
                  {battler.badges && battler.badges.length > 0 ? (
                    battler.badges.slice(0, 5).map((badge, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 bg-yellow-600/20 border border-yellow-500/40"
                      >
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-display text-yellow-400">{badge}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">No badges earned yet</span>
                  )}
                </div>
              </div>

              {/* Style Tags */}
              <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-6">
                <h2 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">BATTLE STYLES</h2>
                <div className="flex flex-wrap gap-2">
                  {battler.styleTags && battler.styleTags.length > 0 ? (
                    battler.styleTags.map((style, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-orange-900/30 border border-orange-700/50 text-orange-400 text-sm font-display"
                      >
                        {style}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">No styles defined</span>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "battles" && (
            <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-6">
              <h2 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">BATTLE HISTORY</h2>
              {battles.length > 0 ? (
                <div className="space-y-3">
                  {battles.map((battle) => (
                    <Link
                      key={battle.id}
                      href={`/battle/${battle.id}`}
                      className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 hover:border-orange-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-zinc-700 border border-zinc-600 overflow-hidden shrink-0">
                          <Image
                            src={battle.opponent.avatar || "/rapper-pixel.jpg"}
                            alt={battle.opponent.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm text-zinc-200 font-display block truncate">
                            vs {battle.opponent.name}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {battle.date} • {battle.league}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-lg font-mono font-bold ${
                            battle.result === "W" ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {battle.verdict}
                        </span>
                        {battle.result === "W" ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No battles yet</p>
              )}
            </div>
          )}

          {activeTab === "rivalries" && (
            <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-6">
              <h2 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">ACTIVE RIVALRIES</h2>
              <p className="text-sm text-zinc-500">
                Rivalry tracking coming soon. Check back after more battles to see your biggest opponents!
              </p>
              {/* TODO: Implement rivalries API when ready */}
            </div>
          )}

          {activeTab === "media" && (
            <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-6">
              <h2 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">MEDIA COVERAGE</h2>
              {articles.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {articles.slice(0, 5).map((article) => (
                      <Link
                        key={article.id}
                        href={`/media/${article.slug}`}
                        className="block p-3 bg-zinc-800 border border-zinc-700 hover:border-orange-500/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-400 border border-blue-700/50 font-display uppercase">
                            {article.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-zinc-500">{article.date}</span>
                        </div>
                        <span className="text-sm text-zinc-200 font-display">{article.title}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/media"
                    className="inline-block mt-4 text-orange-500 hover:text-orange-400 text-sm font-display"
                  >
                    VIEW ALL MEDIA →
                  </Link>
                </>
              ) : (
                <p className="text-sm text-zinc-500">No media coverage yet. Win some battles to get featured!</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
