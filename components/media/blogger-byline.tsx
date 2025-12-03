"use client"

import Link from "next/link"
import { BloggerAvatar } from "./blogger-avatar"
import type { Blogger } from "@/lib/bloggers"

interface BloggerBylineProps {
  blogger: Blogger
  publishedAt: string
  league?: string
  variant: "compact" | "full"
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

export function BloggerByline({ blogger, publishedAt, league, variant }: BloggerBylineProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <BloggerAvatar blogger={blogger} size="sm" />
        <span>
          By{" "}
          <Link href={`/media/bloggers/${blogger.slug}`} className="text-white font-bold hover:text-orange-500">
            {blogger.name}
          </Link>
        </span>
        <span>•</span>
        <span>{formatRelativeTime(publishedAt)}</span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4 p-4 bg-zinc-900 border border-zinc-800">
      <BloggerAvatar blogger={blogger} size="md" />
      <div className="flex-1">
        <Link
          href={`/media/bloggers/${blogger.slug}`}
          className="font-black uppercase text-white hover:text-orange-500"
        >
          {blogger.name}
        </Link>
        <div className="text-sm text-zinc-500 italic">"{blogger.title}"</div>
        <div className="text-sm text-zinc-400 mt-1">
          {league && (
            <Link
              href={`/leagues/${league.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-orange-500 hover:underline"
            >
              {league}
            </Link>
          )}
          {league && " • "}
          {new Date(publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>
      <button className="px-4 py-2 bg-zinc-800 border border-zinc-700 hover:border-orange-500 text-sm font-bold uppercase transition-colors">
        Follow
      </button>
    </div>
  )
}
