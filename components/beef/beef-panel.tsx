"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, ChevronDown, ChevronUp, Swords, History, TrendingUp } from "lucide-react"
import { HeatMeter } from "./heat-meter"
import { FakeTweets } from "./fake-tweets"

interface BeefData {
  intensity: number
  rematchDemand: number
  status: "active" | "dormant" | "resolved"
  originType: string
  originStory: string
  headToHead?: {
    battles: number
    playerWins: number
    opponentWins: number
    lastBattleDate?: string
    lastBattleWinner?: string
  }
}

interface BeefPanelProps {
  callerName: string
  callerId: string
  targetName: string
  targetId: string
  onBeefLoaded?: (data: BeefData | null) => void
}

export function BeefPanel({
  callerName,
  callerId,
  targetName,
  targetId,
  onBeefLoaded,
}: BeefPanelProps) {
  const [beef, setBeef] = useState<BeefData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [showTweets, setShowTweets] = useState(false)

  useEffect(() => {
    async function fetchBeef() {
      try {
        const res = await fetch(`/api/beef?battler_a=${callerId}&battler_b=${targetId}`)
        if (res.ok) {
          const data = await res.json()
          setBeef(data.beef)
          onBeefLoaded?.(data.beef)
        } else {
          setBeef(null)
          onBeefLoaded?.(null)
        }
      } catch (err) {
        console.error("Failed to fetch beef data:", err)
        setBeef(null)
        onBeefLoaded?.(null)
      } finally {
        setLoading(false)
      }
    }

    if (callerId && targetId) {
      fetchBeef()
    }
  }, [callerId, targetId, onBeefLoaded])

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 p-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
          <span className="text-xs text-zinc-500">Checking beef history...</span>
        </div>
      </div>
    )
  }

  // If no beef exists, show that there's no history
  if (!beef) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Swords className="w-4 h-4 text-zinc-600" />
          </div>
          <div>
            <p className="text-sm font-display text-zinc-400">No Prior Beef</p>
            <p className="text-xs text-zinc-600">
              First time {callerName} and {targetName} are clashing
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Beef Header */}
      <motion.div
        className="bg-zinc-900/50 border border-zinc-800 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 flex items-center justify-center ${
              beef.intensity >= 70 ? "bg-red-600/20 border-2 border-red-500/50" :
              beef.intensity >= 40 ? "bg-orange-600/20 border-2 border-orange-500/50" :
              "bg-zinc-800 border-2 border-zinc-700"
            }`}>
              <Flame className={`w-4 h-4 ${
                beef.intensity >= 70 ? "text-red-500" :
                beef.intensity >= 40 ? "text-orange-500" :
                "text-zinc-500"
              }`} fill={beef.intensity >= 50 ? "currentColor" : "none"} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-display font-bold text-zinc-200 uppercase">
                  Existing Beef
                </p>
                {beef.intensity >= 70 && (
                  <span className="px-1.5 py-0.5 text-xs font-mono bg-red-900/50 text-red-400 border border-red-700/50">
                    HOT
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 capitalize">{beef.originType} rivalry</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HeatMeter
              intensity={beef.intensity}
              rematchDemand={beef.rematchDemand}
              status={beef.status}
              compact
            />
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-zinc-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-500" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Full Heat Meter */}
            <HeatMeter
              intensity={beef.intensity}
              rematchDemand={beef.rematchDemand}
              status={beef.status}
            />

            {/* Origin Story */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-display font-bold text-zinc-400 uppercase">
                  How It Started
                </span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {beef.originStory}
              </p>
            </div>

            {/* Head to Head (if exists) */}
            {beef.headToHead && beef.headToHead.battles > 0 && (
              <div className="bg-zinc-900/50 border border-zinc-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Swords className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-display font-bold text-zinc-400 uppercase">
                    Head to Head
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-2xl font-display font-black text-green-400">
                      {beef.headToHead.playerWins}
                    </p>
                    <p className="text-xs text-zinc-500">{callerName} Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-display font-bold text-zinc-600">
                      {beef.headToHead.battles}
                    </p>
                    <p className="text-xs text-zinc-600">Total Battles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display font-black text-red-400">
                      {beef.headToHead.opponentWins}
                    </p>
                    <p className="text-xs text-zinc-500">{targetName} Wins</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stakes Effects */}
            {beef.intensity >= 50 && (
              <div className="bg-orange-950/20 border border-orange-900/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-display font-bold text-orange-400 uppercase">
                    Beef Effects
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-orange-300">
                  <li>• Crowd will be {beef.intensity >= 70 ? "EXTREMELY" : "extra"} invested</li>
                  <li>• {Math.floor(beef.intensity / 10)}% bonus to crowd reactions</li>
                  {beef.intensity >= 70 && <li>• Higher chance of viral moments</li>}
                  {beef.intensity >= 80 && <li>• This battle will generate major news coverage</li>}
                </ul>
              </div>
            )}

            {/* Social Media Toggle */}
            <button
              onClick={() => setShowTweets(!showTweets)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-3 flex items-center justify-center gap-2 transition-colors"
            >
              <div className="w-4 h-4 bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">𝕏</span>
              </div>
              <span className="text-sm font-display text-zinc-300">
                {showTweets ? "Hide" : "Show"} Social Reactions
              </span>
            </button>

            {/* Fake Tweets */}
            <AnimatePresence>
              {showTweets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FakeTweets
                    callerName={callerName}
                    targetName={targetName}
                    intensity={beef.intensity}
                    showCount={4}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
