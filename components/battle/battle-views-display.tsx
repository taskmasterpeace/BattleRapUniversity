"use client"

import { motion } from "framer-motion"
import { Eye, Heart, MessageSquare, Share2, TrendingUp } from "lucide-react"

interface BattleViewsDisplayProps {
  views: number
  likes: number
  comments: number
  shares: number
  trending?: boolean
  leagueName: string
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function BattleViewsDisplay({
  views,
  likes,
  comments,
  shares,
  trending = false,
  leagueName,
}: BattleViewsDisplayProps) {
  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg overflow-hidden">
      <div className="bg-zinc-800 px-4 py-3 border-b border-[#3a3d44]">
        <h3 className="font-display font-bold text-zinc-100 text-sm tracking-wide">BATTLE STATS</h3>
      </div>

      <div className="p-4">
        {/* League and trending */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-zinc-300">{leagueName}</span>
          {trending && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs font-display animate-pulse flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3" />
              TRENDING
            </motion.span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-6 text-zinc-400">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span className="font-mono">{formatNumber(views)}</span>
            <span className="text-xs text-zinc-500">views</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 text-red-400" />
            <span className="font-mono">{formatNumber(likes)}</span>
            <span className="text-xs text-zinc-500">likes</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-mono">{formatNumber(comments)}</span>
            <span className="text-xs text-zinc-500">comments</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span className="font-mono">{formatNumber(shares)}</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
