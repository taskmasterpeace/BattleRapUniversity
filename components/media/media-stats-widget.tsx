"use client"

import Link from "next/link"
import { BarChart3, TrendingUp } from "lucide-react"

export function MediaStatsWidget() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-cyan-500" />
        <h3 className="font-display font-bold text-white uppercase">Your Media Stats</h3>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">Articles About You</span>
          <span className="text-white font-bold">12</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Total Mentions</span>
          <span className="text-white font-bold">28</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Sentiment</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 font-bold">72% Positive</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-500 mb-2">Most Coverage By:</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-300">Battle Eyez</span>
            <span className="text-orange-500">5 articles</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-300">Algorithm Institute</span>
            <span className="text-orange-500">3 articles</span>
          </div>
        </div>
      </div>

      <Link href="/media?about=me" className="block mt-4 text-center text-sm text-orange-500 hover:underline">
        View All Coverage →
      </Link>
    </div>
  )
}
