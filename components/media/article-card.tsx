"use client"

import Link from "next/link"
import { BloggerByline } from "./blogger-byline"
import { getBloggerBySlug, BLOGGERS } from "@/lib/bloggers"
import { Flame } from "lucide-react"

interface ArticleCardProps {
  article: {
    id: string
    slug: string
    title: string
    type: string
    excerpt?: string
    publishedAt: string
    bloggerSlug: string
    league?: string
  }
  variant?: "compact" | "featured" | "list"
}

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  battle_recap: { label: "BATTLE RECAP", color: "bg-blue-900/50 text-blue-400 border-blue-700" },
  scandal: { label: "SCANDAL", color: "bg-red-900/50 text-red-400 border-red-700" },
  career_update: { label: "CAREER UPDATE", color: "bg-green-900/50 text-green-400 border-green-700" },
  league_update: { label: "LEAGUE UPDATE", color: "bg-purple-900/50 text-purple-400 border-purple-700" },
  grudge_coverage: { label: "RIVALRY", color: "bg-orange-900/50 text-orange-400 border-orange-700" },
  rankings: { label: "RANKINGS", color: "bg-cyan-900/50 text-cyan-400 border-cyan-700" },
  preview: { label: "PREVIEW", color: "bg-yellow-900/50 text-yellow-400 border-yellow-700" },
}

function formatRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function ArticleCard({ article, variant = "list" }: ArticleCardProps) {
  const blogger = getBloggerBySlug(article.bloggerSlug) || BLOGGERS[0]
  const typeBadge = TYPE_BADGES[article.type] || TYPE_BADGES.career_update
  const isGrudge = article.type === "grudge_coverage"

  if (variant === "featured") {
    return (
      <Link
        href={`/media/${article.slug}`}
        className="block bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-orange-500/50 hover:border-orange-500 transition-all p-6 group"
      >
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-display font-bold text-orange-500 tracking-wide">FEATURED STORY</span>
        </div>

        <span className={`inline-block px-2 py-1 text-xs font-display font-bold border mb-3 ${typeBadge.color}`}>
          {typeBadge.label}
        </span>

        <h2 className="text-2xl md:text-3xl font-display font-black uppercase text-white mb-3 group-hover:text-orange-500 transition-colors">
          {article.title}
        </h2>

        {article.excerpt && <p className="text-zinc-400 mb-4 line-clamp-2">{article.excerpt}</p>}

        <BloggerByline blogger={blogger} publishedAt={article.publishedAt} league={article.league} variant="compact" />
      </Link>
    )
  }

  return (
    <Link
      href={`/media/${article.slug}`}
      className="block bg-zinc-900 border border-zinc-800 hover:border-orange-500 transition-all p-5 group"
      style={{ borderLeftWidth: "4px", borderLeftColor: blogger.color }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-1 text-xs font-display font-bold border ${typeBadge.color}`}>{typeBadge.label}</span>
        <div className="flex items-center gap-2">
          {isGrudge && <Flame className="w-4 h-4 text-orange-500" />}
          <span className="text-sm text-zinc-500">{formatRelativeTime(article.publishedAt)}</span>
        </div>
      </div>

      <h3 className="text-xl font-display font-black uppercase text-white mb-2 group-hover:text-orange-500 transition-colors">
        {article.title}
      </h3>

      {article.excerpt && <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{article.excerpt}</p>}

      <div className="flex items-center justify-between">
        <BloggerByline blogger={blogger} publishedAt={article.publishedAt} variant="compact" />
        <span className="text-zinc-500 group-hover:text-orange-500 transition-colors">→</span>
      </div>
    </Link>
  )
}
