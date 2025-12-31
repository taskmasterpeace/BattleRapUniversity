"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, Clock, Share2, Bookmark, Flame } from "lucide-react"
import { useEffect, useState } from "react"
import { ReactionBar } from "@/components/media/reaction-bar"

const TYPE_COLORS: Record<string, string> = {
  battle_recap: "bg-blue-900/50 text-blue-400 border-blue-700/50",
  scandal: "bg-red-900/50 text-red-400 border-red-700/50",
  career_update: "bg-green-900/50 text-green-400 border-green-700/50",
  league_update: "bg-purple-900/50 text-purple-400 border-purple-700/50",
  grudge_coverage: "bg-orange-900/50 text-orange-400 border-orange-700/50",
}

interface Article {
  id: string
  slug: string
  title: string
  type: string
  publishedAt: string
  date: string
  body: string
  meta: Record<string, any>
  primaryBattler?: { id: string; name: string; avatar?: string; tier?: string }
  secondaryBattler?: { id: string; name: string; avatar?: string; tier?: string }
  league?: { id: string; name: string; shortCode: string }
  battle?: { id: string; verdict?: string; decisionType?: string; winnerId?: string }
  readTime: number
}

export default function ArticleDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`/api/news/${slug}`)
        if (!response.ok) throw new Error('Article not found')
        const data = await response.json()
        setArticle(data)

        // Fetch related articles
        const newsResponse = await fetch('/api/news?limit=4')
        if (newsResponse.ok) {
          const newsData = await newsResponse.json()
          setRelatedArticles(newsData.articles?.filter((a: Article) => a.slug !== slug).slice(0, 3) || [])
        }
      } catch (error) {
        console.error('Error fetching article:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Loading article...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Article not found</p>
          <Link href="/media" className="text-orange-500 hover:text-orange-400">
            Back to Media
          </Link>
        </div>
      </div>
    )
  }

  // Check if this is a grudge match article
  const isGrudgeMatch = article.type === "grudge_coverage" || article.title.toLowerCase().includes("grudge")

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-900">
        <Link
          href="/media"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm font-display transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO MEDIA
        </Link>
        <div className="flex items-center gap-3">
          <button className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Article Header */}
        <div className="mb-8">
          {/* Type Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`px-3 py-1 text-xs font-display font-bold uppercase tracking-wide border ${TYPE_COLORS[article.type] || TYPE_COLORS.battle_recap}`}
            >
              {article.type.replace("_", " ")}
            </span>
            {isGrudgeMatch && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-display font-bold uppercase tracking-wide border bg-orange-900/50 text-orange-400 border-orange-700/50">
                <Flame className="w-3 h-3" />
                GRUDGE MATCH
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-zinc-100 tracking-tight mb-4">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <span>By AIBR Media</span>
            <span className="text-zinc-700">•</span>
            <span>{article.date}</span>
            <span className="text-zinc-700">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime} min read
            </span>
          </div>
        </div>

        {/* Rivalry Context Panel (for grudge matches) */}
        {isGrudgeMatch && article.primaryBattler && article.secondaryBattler && (
          <div className="bg-zinc-900 border-2 border-orange-500/30 p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-display font-bold text-orange-500 tracking-wide">RIVALRY CONTEXT</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-3">
              This battle is part of the ongoing rivalry between{" "}
              <span className="text-zinc-100">{article.primaryBattler.name}</span> and{" "}
              <span className="text-zinc-100">{article.secondaryBattler.name}</span>
            </p>
            {article.battle && (
              <div className="mb-3">
                <Link
                  href={`/battle/${article.battle.id}`}
                  className="text-xs text-orange-500 hover:text-orange-400 font-display"
                >
                  VIEW BATTLE BREAKDOWN →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-invert prose-zinc max-w-none">
          <div
            className="text-zinc-300 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: article.body || "" }}
          />
        </article>

        {/* Reaction Bar */}
        <div className="mt-8">
          <ReactionBar slug={slug} />
        </div>

        {/* Battle Link */}
        {article.type === "battle_recap" && article.battle && (
          <div className="mt-8 p-4 bg-zinc-900 border-2 border-zinc-700">
            <p className="text-sm text-zinc-400 mb-3">Want to see the full breakdown?</p>
            <Link
              href={`/battle/${article.battle.id}`}
              className="inline-block bg-orange-600 hover:bg-orange-500 px-6 py-2.5 text-sm font-display font-bold text-white transition-colors"
            >
              VIEW BATTLE BREAKDOWN
            </Link>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">RELATED COVERAGE</h3>
            <div className="space-y-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/media/${related.slug}`}
                  className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-colors"
                >
                  <span className="text-sm text-zinc-200 font-display block">{related.title}</span>
                  <span className="text-xs text-zinc-500">{related.date}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/media"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm font-display transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO MEDIA
          </Link>
          <Link
            href="/dashboard"
            className="text-orange-500 hover:text-orange-400 text-sm font-display transition-colors"
          >
            DASHBOARD →
          </Link>
        </div>
      </main>
    </div>
  )
}
