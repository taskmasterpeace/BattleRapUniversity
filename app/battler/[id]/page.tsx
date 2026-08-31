"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ArrowLeft, Flame, Newspaper, Swords, TrendingUp, TrendingDown } from "lucide-react"
import { CharacterSheet } from "@/components/battler/character-sheet"
import { toBadgeInfos, toNetEffects } from "@/lib/badge-display"
import { leagueCrest } from "@/lib/league-crests"
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

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Flyer System character sheet — big face, every stat, every badge effect */}
        <div className="mb-6">
          <CharacterSheet
            name={battler.stageName}
            portrait={battler.portrait?.spriteUrl || "/sprites/characters/sprite_661.png"}
            portraits={(battler as any).portraits || []}
            cityName={(battler as any).city?.name}
            cityBackdrop={(battler as any).city?.backdrop}
            tierLabel={battler.tier}
            record={`${battler.record?.wins || 0}W · ${battler.record?.losses || 0}L`}
            elo={battler.elo}
            level={(battler as any).level ?? 1}
            styleTags={battler.styleTags || []}
            league={{
              name: battler.league,
              crest: leagueCrest(battler.league),
              subtitle: (battler as any).city?.name ? `${(battler as any).city.name} scene` : undefined,
            }}
            groups={[
              {
                title: "Writing & Rapping",
                scale10: true,
                rows: [
                  { label: "Lyricism", value: battler.stats.writing.lyricism },
                  { label: "Wordplay", value: battler.stats.writing.wordplay },
                  { label: "Creativity", value: battler.stats.writing.creativity },
                  { label: "Flow", value: battler.stats.writing.flow },
                ],
              },
              {
                title: "Performance",
                scale10: true,
                rows: [
                  { label: "Stage Presence", value: battler.stats.performance.stagePresence },
                  { label: "Crowd Control", value: battler.stats.performance.crowdControl },
                  { label: "Delivery", value: battler.stats.performance.delivery },
                ],
              },
              {
                title: "Personal",
                scale10: true,
                rows: [
                  { label: "Financial Stab.", value: battler.stats.personal.financial },
                  { label: "Reputation", value: battler.stats.personal.reputation },
                  { label: "Family Bond", value: battler.stats.personal.family },
                ],
              },
              {
                title: "Mental",
                scale10: true,
                rows: [{ label: "Resilience", value: battler.stats.personal.resilience }],
              },
            ]}
            badges={toBadgeInfos(battler.badges || [])}
            netEffects={toNetEffects(battler.badges || [])}
          />
        </div>

        {/* Quick stats strip */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-zinc-500 block">WIN RATE</span>
              <span className="text-lg font-mono font-bold text-green-500">
                {battler.record && battler.record.wins + battler.record.losses > 0
                  ? Math.round((battler.record.wins / (battler.record.wins + battler.record.losses)) * 100)
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
              {/* Attributes + badges now live in the CharacterSheet above */}
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
