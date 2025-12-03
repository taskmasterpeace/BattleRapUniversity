"use client"

import Link from "next/link"
import { Flame } from "lucide-react"

const TRENDING_TOPICS = [
  { id: 1, topic: "Coded Flux 3-0 Victory", slug: "coded-flux-victory" },
  { id: 2, topic: "NYC vs Philly Beef", slug: "nyc-philly-beef" },
  { id: 3, topic: "Tournament Bracket Drop", slug: "tournament-bracket" },
  { id: 4, topic: "Rookie of the Month", slug: "rookie-month" },
  { id: 5, topic: "Best Bars of November", slug: "best-bars-november" },
]

export function TrendingWidget() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="font-display font-bold text-white uppercase">Trending</h3>
      </div>

      <div className="space-y-3">
        {TRENDING_TOPICS.map((item, index) => (
          <Link key={item.id} href={`/media?topic=${item.slug}`} className="flex items-start gap-3 group">
            <span className="text-orange-500 font-bold text-sm">#{index + 1}</span>
            <span className="text-zinc-300 text-sm group-hover:text-orange-500 transition-colors">{item.topic}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
