"use client"

import Link from "next/link"
import { BloggerAvatar } from "./blogger-avatar"
import { formatFollowers, type Blogger } from "@/lib/bloggers"

interface BloggerCardProps {
  blogger: Blogger
}

export function BloggerCard({ blogger }: BloggerCardProps) {
  return (
    <Link
      href={`/media/bloggers/${blogger.slug}`}
      className="block bg-zinc-900 border border-zinc-800 hover:border-orange-500 transition-all p-6 text-center group"
      style={{ borderLeftWidth: "4px", borderLeftColor: blogger.color }}
    >
      <div className="flex justify-center mb-4">
        <BloggerAvatar blogger={blogger} size="lg" showBadge />
      </div>

      <h3 className="font-black uppercase text-white text-lg group-hover:text-orange-500 transition-colors">
        {blogger.name}
      </h3>
      <p className="text-zinc-500 text-sm italic mb-4">"{blogger.title}"</p>

      <div className="space-y-2 text-sm text-left bg-zinc-800/50 p-3 rounded">
        <div className="flex justify-between">
          <span className="text-zinc-400">Articles</span>
          <span className="text-white font-bold">{blogger.articleCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Followers</span>
          <span className="text-white font-bold">{formatFollowers(blogger.followers)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Home League</span>
          <span className="text-orange-500 font-bold">{blogger.homeLeague || "Independent"}</span>
        </div>
      </div>

      <div className="mt-4 w-full py-3 bg-zinc-800 border border-zinc-700 group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-black font-black uppercase text-sm transition-all text-center">
        View Profile
      </div>
    </Link>
  )
}
