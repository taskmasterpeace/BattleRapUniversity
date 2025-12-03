"use client"

import Link from "next/link"
import { Newspaper, ArrowRight } from "lucide-react"
import type { League } from "@/lib/leagues"

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  type: "recap" | "upset" | "scandal" | "preview"
  publishedAt: string
}

interface LeagueArticlesProps {
  league: League
}

export function LeagueArticles({ league }: LeagueArticlesProps) {
  // Generate mock articles based on league
  const mockArticles: Article[] = [
    {
      id: "1",
      title: `Technical Brilliance: ${league.displayName} Season Highlights`,
      slug: "technical-brilliance-highlights",
      excerpt: "Breaking down the most impressive performances from this season's top battlers...",
      type: "recap",
      publishedAt: "Nov 28, 2025",
    },
    {
      id: "2",
      title: `Newcomer Shocks Top Tier at ${league.displayName}`,
      slug: "newcomer-shocks-top-tier",
      excerpt: "In what many are calling the upset of the month, an unknown battler delivered a masterclass...",
      type: "upset",
      publishedAt: "Nov 26, 2025",
    },
    {
      id: "3",
      title: `Upcoming: ${league.displayName} Championship Preview`,
      slug: "championship-preview",
      excerpt: "Everything you need to know before the biggest event of the year...",
      type: "preview",
      publishedAt: "Nov 24, 2025",
    },
  ]

  const typeStyles: Record<string, string> = {
    recap: "bg-blue-500/20 text-blue-400",
    upset: "bg-orange-500/20 text-orange-400",
    scandal: "bg-red-500/20 text-red-400",
    preview: "bg-green-500/20 text-green-400",
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-orange-400" />
        <h3 className="font-bold">RECENT COVERAGE</h3>
      </div>

      <div className="space-y-3">
        {mockArticles.map((article) => (
          <Link
            key={article.id}
            href={`/media/${article.slug}`}
            className="block bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-orange-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${typeStyles[article.type]}`}>
                {article.type}
              </span>
              <span className="text-xs text-zinc-500">{article.publishedAt}</span>
            </div>
            <h4 className="font-medium text-sm mb-1">{article.title}</h4>
            <p className="text-xs text-zinc-400 line-clamp-2">{article.excerpt}</p>
            <span className="text-xs text-orange-400 mt-2 inline-flex items-center gap-1">
              Read More <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>

      <Link
        href={`/media?league=${league.slug}`}
        className="block text-center text-sm text-zinc-400 hover:text-white mt-4 pt-4 border-t border-zinc-800"
      >
        View All Articles
        <ArrowRight className="w-4 h-4 inline ml-1" />
      </Link>
    </div>
  )
}
