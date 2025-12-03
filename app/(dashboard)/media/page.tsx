"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BATTLERS } from "@/lib/battlers"
import { BLOGGERS, getBloggerBySlug } from "@/lib/bloggers"
import { BloggerAvatar } from "@/components/media/blogger-avatar"
import {
  Flame,
  Clock,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Eye,
  Swords,
  Trophy,
  AlertTriangle,
  BarChart3,
  Users,
  ChevronRight,
  ThumbsUp,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { BattlerPortrait } from "@/components/battler-portrait"

type TabId = "for-you" | "latest" | "battle-recaps" | "scandals" | "rankings" | "bloggers"

interface NewsArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  category: "battle-recap" | "scandal" | "ranking" | "interview" | "announcement"
  timestamp: string
  views: number
  comments: number
  likes: number
  image: string
  battlerIds?: string[]
  league?: string
  isHot?: boolean
  bloggerSlug: string
}

const MOCK_NEWS: NewsArticle[] = [
  {
    id: "1",
    slug: "upset-of-the-year-rookie-stuns-veteran",
    title: "UPSET OF THE YEAR: Rookie Stuns Veteran in Main Stage Debut",
    excerpt:
      "In what many are calling the biggest upset of the season, newcomer Flash Wordz delivered a career-defining performance against a 10-year vet. The crowd went silent after the third round haymaker.",
    category: "battle-recap",
    timestamp: "2 hours ago",
    views: 15420,
    comments: 234,
    likes: 1893,
    image: "/battle-rap-stage-lights-crowd-cheering.jpg",
    battlerIds: ["rookie-sensation", "veteran-legend"],
    league: "main-stage",
    isHot: true,
    bloggerSlug: "main-stage-herald",
  },
  {
    id: "2",
    slug: "ghostwriter-allegations-rock-scene",
    title: "BREAKING: Top Battler Accused of Using Ghostwriter",
    excerpt:
      "Allegations surface after suspicious similarities found between recent rounds and an underground writer's portfolio. The accused has yet to respond publicly.",
    category: "scandal",
    timestamp: "5 hours ago",
    views: 28930,
    comments: 892,
    likes: 2341,
    image: "/dramatic-spotlight-microphone-shadows-controversy.jpg",
    isHot: true,
    bloggerSlug: "marijuana-piranha",
  },
  {
    id: "3",
    slug: "power-rankings-week-12",
    title: "Official Power Rankings: Week 12 Update",
    excerpt:
      "Major shakeups in the top 10 after this week's events. Two legends drop out, three newcomers make their debut on the list.",
    category: "ranking",
    timestamp: "1 day ago",
    views: 8750,
    comments: 156,
    likes: 876,
    image: "/leaderboard-rankings-trophy-gold-medals.jpg",
    bloggerSlug: "algorithm-institute",
  },
  {
    id: "4",
    slug: "champion-interview-training-secrets",
    title: "Exclusive Interview: Champion Reveals Training Secrets",
    excerpt:
      "We sit down with the reigning champion to discuss preparation methods, mental game, and what it takes to stay on top in 2024.",
    category: "interview",
    timestamp: "2 days ago",
    views: 12300,
    comments: 89,
    likes: 1456,
    image: "/interview-studio-podcast-microphone-professional.jpg",
    bloggerSlug: "battle-eyez",
  },
  {
    id: "5",
    slug: "league-announces-2025-format",
    title: "League Announces New Tournament Format for 2025",
    excerpt:
      "Revolutionary changes coming to the championship series including new qualification rules, prize pools, and regional representation.",
    category: "announcement",
    timestamp: "3 days ago",
    views: 6420,
    comments: 203,
    likes: 567,
    image: "/tournament-bracket-championship-trophy-stage.jpg",
    bloggerSlug: "coast-to-coast",
  },
  {
    id: "6",
    slug: "small-room-showdown-recap",
    title: "Small Room Showdown: Technical Masterclass",
    excerpt:
      "Two pen-game specialists went bar-for-bar in what critics are calling the most technically impressive battle of the year.",
    category: "battle-recap",
    timestamp: "3 days ago",
    views: 9200,
    comments: 178,
    likes: 1234,
    image: "/intimate-venue-small-crowd-intense-battle-rap.jpg",
    league: "small-room",
    bloggerSlug: "small-room-report",
  },
  {
    id: "7",
    slug: "contract-dispute-escalates",
    title: "Contract Dispute Between Top Battler and League Escalates",
    excerpt:
      "Sources say negotiations have broken down completely. The battler is now exploring options with rival leagues.",
    category: "scandal",
    timestamp: "4 days ago",
    views: 11800,
    comments: 445,
    likes: 987,
    image: "/contract-dispute-tension-argument-silhouettes.jpg",
    bloggerSlug: "underground-voice",
  },
  {
    id: "8",
    slug: "breakdown-what-went-wrong",
    title: "What Went Wrong: Analyzing the Champion's First Loss",
    excerpt:
      "A detailed breakdown of how preparation, angle selection, and crowd management all contributed to the shocking upset.",
    category: "interview",
    timestamp: "5 days ago",
    views: 7650,
    comments: 234,
    likes: 876,
    image: "/chess-strategy-breakdown-analysis-thinking.jpg",
    bloggerSlug: "battle-breakdown",
  },
]

const getCategoryIcon = (category: NewsArticle["category"]) => {
  switch (category) {
    case "battle-recap":
      return <Swords className="w-3 h-3" />
    case "scandal":
      return <AlertTriangle className="w-3 h-3" />
    case "ranking":
      return <BarChart3 className="w-3 h-3" />
    case "interview":
      return <MessageSquare className="w-3 h-3" />
    case "announcement":
      return <Trophy className="w-3 h-3" />
    default:
      return <Flame className="w-3 h-3" />
  }
}

const getCategoryColor = (category: NewsArticle["category"]) => {
  switch (category) {
    case "battle-recap":
      return "text-blue-400 bg-blue-500/20 border-blue-500/50"
    case "scandal":
      return "text-red-400 bg-red-500/20 border-red-500/50"
    case "ranking":
      return "text-cyan-400 bg-cyan-500/20 border-cyan-500/50"
    case "interview":
      return "text-green-400 bg-green-500/20 border-green-500/50"
    case "announcement":
      return "text-yellow-400 bg-yellow-500/20 border-yellow-500/50"
    default:
      return "text-zinc-400 bg-zinc-500/20 border-zinc-500/50"
  }
}

function MediaContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as TabId | null
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || "for-you")

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "for-you", label: "For You", icon: Flame },
    { id: "latest", label: "Latest", icon: Clock },
    { id: "battle-recaps", label: "Battle Recaps", icon: Swords },
    { id: "scandals", label: "Scandals", icon: AlertTriangle },
    { id: "rankings", label: "Rankings", icon: BarChart3 },
    { id: "bloggers", label: "Bloggers", icon: Users },
  ]

  const filteredNews = MOCK_NEWS.filter((article) => {
    if (activeTab === "for-you") return article.isHot || article.views > 10000
    if (activeTab === "latest") return true
    if (activeTab === "battle-recaps") return article.category === "battle-recap"
    if (activeTab === "scandals") return article.category === "scandal"
    if (activeTab === "rankings") return article.category === "ranking"
    return true
  })

  const renderFeaturedCard = (article: NewsArticle) => {
    const blogger = getBloggerBySlug(article.bloggerSlug)

    return (
      <motion.div
        key={article.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full"
      >
        <Link href={`/media/${article.slug}`}>
          <div className="relative bg-zinc-900 border-2 border-orange-500/50 hover:border-orange-500 transition-all overflow-hidden group">
            {/* Featured Image */}
            <div className="relative aspect-[21/9] md:aspect-[3/1]">
              <Image
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

              {/* Hot Badge */}
              {article.isHot && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-display font-bold flex items-center gap-1.5 animate-pulse">
                  <Flame className="w-4 h-4" />
                  HOT STORY
                </div>
              )}
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-2 py-1 text-xs font-display font-bold border ${getCategoryColor(article.category)} flex items-center gap-1.5`}
                >
                  {getCategoryIcon(article.category)}
                  {article.category.replace("-", " ").toUpperCase()}
                </span>
                <span className="text-zinc-400 text-sm">{article.timestamp}</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-black uppercase text-white mb-3 group-hover:text-orange-400 transition-colors">
                {article.title}
              </h2>

              <p className="text-zinc-300 mb-4 line-clamp-2 max-w-3xl">{article.excerpt}</p>

              <div className="flex items-center justify-between">
                {blogger && (
                  <div className="flex items-center gap-3">
                    <BloggerAvatar blogger={blogger} size="sm" />
                    <div>
                      <p className="text-sm font-bold text-white">{blogger.name}</p>
                      <p className="text-xs text-zinc-500">{blogger.title}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-zinc-400 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {article.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4" />
                    {article.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    {article.comments}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  const renderNewsCard = (article: NewsArticle, index: number) => {
    const blogger = getBloggerBySlug(article.bloggerSlug)

    return (
      <motion.div
        key={article.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link href={`/media/${article.slug}`}>
          <div
            className="bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-all overflow-hidden group h-full flex flex-col"
            style={{ borderLeftWidth: "4px", borderLeftColor: blogger?.color || "#f97316" }}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {article.isHot && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-display font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  HOT
                </div>
              )}
              <div className="absolute bottom-2 left-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-display font-bold border backdrop-blur-sm ${getCategoryColor(article.category)} flex items-center gap-1`}
                >
                  {getCategoryIcon(article.category)}
                  {article.category.replace("-", " ").toUpperCase()}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-display font-bold text-white text-sm mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                {article.title}
              </h3>

              <p className="text-zinc-400 text-xs mb-3 line-clamp-2 flex-1">{article.excerpt}</p>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800">
                {blogger && (
                  <div className="flex items-center gap-2">
                    <BloggerAvatar blogger={blogger} size="xs" />
                    <span className="text-xs text-zinc-400 truncate max-w-[100px]">{blogger.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-zinc-500 text-xs">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {(article.views / 1000).toFixed(1)}K
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {article.comments}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  const renderBloggerCard = (blogger: (typeof BLOGGERS)[0], index: number) => (
    <motion.div
      key={blogger.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/media/bloggers/${blogger.slug}`}>
        <div
          className="bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-all p-5 group"
          style={{ borderLeftWidth: "4px", borderLeftColor: blogger.color }}
        >
          <div className="flex items-start gap-4">
            <BloggerAvatar blogger={blogger} size="lg" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-bold text-white group-hover:text-orange-400 transition-colors">
                  {blogger.name}
                </h3>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-orange-500 transition-colors" />
              </div>

              <p className="text-xs text-zinc-500 mb-2">{blogger.title}</p>

              <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
                <span>{(blogger.followers / 1000).toFixed(1)}K followers</span>
                <span>•</span>
                <span>{blogger.articleCount} articles</span>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 p-3">
                <p className="text-xs text-zinc-300 italic line-clamp-2">"{blogger.notableTakes[0]}"</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {blogger.covers.slice(0, 3).map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )

  const renderRankings = () => {
    const topBattlers = BATTLERS.filter((b) => b.stats?.clout).sort(
      (a, b) => (b.stats?.clout || 0) - (a.stats?.clout || 0),
    )

    return (
      <div className="space-y-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="text-orange-500 font-display flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              POWER RANKINGS
              <span className="ml-auto text-xs text-zinc-500 font-normal">Updated 2h ago</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topBattlers.slice(0, 10).map((battler, index) => {
              const change = Math.floor(Math.random() * 5) - 2
              return (
                <motion.div
                  key={battler.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors"
                >
                  <span
                    className={`w-8 h-8 flex items-center justify-center font-display font-bold text-sm ${
                      index === 0
                        ? "bg-yellow-500 text-black"
                        : index === 1
                          ? "bg-zinc-400 text-black"
                          : index === 2
                            ? "bg-orange-700 text-white"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div className="w-12 h-12 border-2 border-zinc-700 overflow-hidden">
                    <BattlerPortrait battler={battler} size="sm" showFrame={false} />
                  </div>

                  <div className="flex-1">
                    <p className="font-display font-bold text-white">{battler.stageName}</p>
                    <p className="text-xs text-zinc-500">
                      {battler.region} • {battler.tier}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-display font-bold text-orange-400 text-lg">{battler.stats?.clout || 0}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Clout</p>
                  </div>

                  <div
                    className={`flex items-center gap-1 w-12 justify-end ${
                      change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-zinc-500"
                    }`}
                  >
                    {change > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold">+{change}</span>
                      </>
                    ) : change < 0 ? (
                      <>
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-bold">{change}</span>
                      </>
                    ) : (
                      <span className="text-xs">—</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </CardContent>
        </Card>

        {/* Trending Topics Sidebar */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="border-b border-zinc-800 py-3">
            <CardTitle className="text-sm text-zinc-400 font-display flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              TRENDING TOPICS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {["#GhostwriterGate", "#UpsetOfTheYear", "#PowerRankings", "#SmallRoomSZN", "#ChampionInterview"].map(
              (topic, i) => (
                <div key={topic} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300 hover:text-orange-400 cursor-pointer transition-colors">
                    {topic}
                  </span>
                  <span className="text-xs text-zinc-500">{Math.floor(Math.random() * 500 + 100)} posts</span>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-display font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-orange-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "rankings" ? (
          <motion.div key="rankings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderRankings()}
          </motion.div>
        ) : activeTab === "bloggers" ? (
          <motion.div
            key="bloggers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-zinc-300">BLOGGERS & ANALYSTS</h2>
              <span className="text-xs text-zinc-500">{BLOGGERS.length} voices in the culture</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {BLOGGERS.map((blogger, index) => renderBloggerCard(blogger, index))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="news"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Featured Article */}
            {activeTab === "for-you" && filteredNews[0] && renderFeaturedCard(filteredNews[0])}

            {/* Article Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNews
                .slice(activeTab === "for-you" ? 1 : 0)
                .map((article, index) => renderNewsCard(article, index))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MediaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-zinc-400 font-display">Loading media...</p>
          </div>
        </div>
      }
    >
      <MediaContent />
    </Suspense>
  )
}
