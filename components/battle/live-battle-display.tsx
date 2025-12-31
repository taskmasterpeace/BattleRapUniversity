"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface CrowdMember {
  id: number
  reaction: "hype" | "thinking" | "bored" | "shocked" | "recording"
  position: "left" | "center" | "right"
  delay: number
}

interface SegmentState {
  segmentIndex: number
  playerScore: number
  opponentScore: number
  isPeak: boolean
  isChoke: boolean
  crowdReactions: CrowdMember[]
}

interface LiveBattleDisplayProps {
  playerName: string
  opponentName: string
  playerAvatar?: string
  opponentAvatar?: string
  currentRound: number
  totalRounds: number
  segments: SegmentState[]
  onSegmentComplete?: (segmentIndex: number) => void
  onRoundComplete?: () => void
  autoPlay?: boolean
  segmentDuration?: number // milliseconds per segment (default 5000)
}

const CROWD_REACTIONS = {
  hype: { emoji: "🔥", label: "FIRE!", color: "text-orange-500" },
  thinking: { emoji: "🤔", label: "Hmm...", color: "text-yellow-500" },
  bored: { emoji: "😐", label: "...", color: "text-zinc-500" },
  shocked: { emoji: "😱", label: "DAMN!", color: "text-red-500" },
  recording: { emoji: "📱", label: "Recording", color: "text-blue-500" },
}

function generateCrowdReactions(score: number, isPeak: boolean, isChoke: boolean): CrowdMember[] {
  const reactions: CrowdMember[] = []
  const positions: ("left" | "center" | "right")[] = ["left", "center", "right"]

  for (let i = 0; i < 3; i++) {
    let reaction: CrowdMember["reaction"]

    if (isChoke) {
      reaction = Math.random() > 0.3 ? "shocked" : "bored"
    } else if (isPeak) {
      reaction = Math.random() > 0.2 ? "hype" : "recording"
    } else if (score >= 7.5) {
      reaction = Math.random() > 0.4 ? "hype" : "thinking"
    } else if (score >= 6) {
      reaction = Math.random() > 0.5 ? "thinking" : "hype"
    } else {
      reaction = Math.random() > 0.6 ? "bored" : "thinking"
    }

    reactions.push({
      id: i,
      reaction,
      position: positions[i],
      delay: i * 1500, // 1.5 seconds between each reaction
    })
  }

  return reactions
}

export function LiveBattleDisplay({
  playerName,
  opponentName,
  playerAvatar,
  opponentAvatar,
  currentRound,
  totalRounds,
  segments,
  onSegmentComplete,
  onRoundComplete,
  autoPlay = true,
  segmentDuration = 5000,
}: LiveBattleDisplayProps) {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [visibleReactions, setVisibleReactions] = useState<number[]>([])
  const [showSegmentScore, setShowSegmentScore] = useState(false)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [playerMomentum, setPlayerMomentum] = useState(50)
  const [opponentMomentum, setOpponentMomentum] = useState(50)

  const currentSegment = segments[currentSegmentIndex]

  // Generate crowd reactions for current segment
  const crowdReactions = currentSegment
    ? generateCrowdReactions(currentSegment.playerScore, currentSegment.isPeak, currentSegment.isChoke)
    : []

  // Play segment animation
  useEffect(() => {
    if (!isPlaying || !currentSegment) return

    setVisibleReactions([])
    setShowSegmentScore(false)

    // Show reactions one by one
    const reactionDelay = segmentDuration / 4 // Split time into 4 parts (3 reactions + score reveal)

    const timers: NodeJS.Timeout[] = []

    // Reaction 1 at 0ms
    timers.push(
      setTimeout(() => {
        setVisibleReactions([0])
      }, 0)
    )

    // Reaction 2 at 1/3 of segment
    timers.push(
      setTimeout(() => {
        setVisibleReactions([0, 1])
      }, reactionDelay)
    )

    // Reaction 3 at 2/3 of segment
    timers.push(
      setTimeout(() => {
        setVisibleReactions([0, 1, 2])
      }, reactionDelay * 2)
    )

    // Show score and update momentum at end
    timers.push(
      setTimeout(() => {
        setShowSegmentScore(true)
        setPlayerMomentum((prev) =>
          Math.min(100, Math.max(0, prev + (currentSegment.playerScore - currentSegment.opponentScore) * 5))
        )
        setOpponentMomentum((prev) =>
          Math.min(100, Math.max(0, prev + (currentSegment.opponentScore - currentSegment.playerScore) * 5))
        )
        onSegmentComplete?.(currentSegmentIndex)
      }, reactionDelay * 3)
    )

    // Move to next segment
    timers.push(
      setTimeout(() => {
        if (currentSegmentIndex < segments.length - 1) {
          setCurrentSegmentIndex((prev) => prev + 1)
        } else {
          setIsPlaying(false)
          onRoundComplete?.()
        }
      }, segmentDuration)
    )

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [currentSegmentIndex, isPlaying, currentSegment, segmentDuration, segments.length, onSegmentComplete, onRoundComplete])

  const handleSkip = () => {
    // Skip to end of current segment
    setVisibleReactions([0, 1, 2])
    setShowSegmentScore(true)
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex((prev) => prev + 1)
    } else {
      setIsPlaying(false)
      onRoundComplete?.()
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handlePlay = () => {
    setIsPlaying(true)
  }

  if (!currentSegment) {
    return <div className="text-center text-zinc-500">No segments to display</div>
  }

  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-800 px-4 py-2 flex justify-between items-center border-b border-zinc-700">
        <span className="text-sm font-display uppercase text-zinc-400">
          Round {currentRound} of {totalRounds}
        </span>
        <span className="text-sm font-display uppercase text-orange-500">
          Segment {currentSegmentIndex + 1} of {segments.length}
        </span>
      </div>

      {/* Battle Arena */}
      <div className="p-6">
        {/* VS Display with Momentum */}
        <div className="flex items-center justify-between mb-6">
          {/* Player Side */}
          <div className="flex-1 text-center">
            <motion.div
              className="w-24 h-24 mx-auto bg-zinc-800 rounded-full border-4 border-green-500 flex items-center justify-center text-4xl mb-2"
              animate={currentSegment.isPeak && showSegmentScore ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {playerAvatar ? (
                <Image src={playerAvatar} alt={playerName} width={96} height={96} className="rounded-full" />
              ) : (
                playerName.charAt(0)
              )}
            </motion.div>
            <p className="font-bold text-white text-lg">{playerName}</p>
            {/* Momentum Bar */}
            <div className="mt-2 h-3 bg-zinc-700 rounded-full overflow-hidden mx-4">
              <motion.div
                className="h-full bg-gradient-to-r from-green-600 to-green-400"
                animate={{ width: `${playerMomentum}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">MOMENTUM</p>
          </div>

          {/* VS */}
          <div className="px-4">
            <motion.div
              className="text-3xl font-black text-orange-500"
              animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              VS
            </motion.div>
          </div>

          {/* Opponent Side */}
          <div className="flex-1 text-center">
            <motion.div
              className="w-24 h-24 mx-auto bg-zinc-800 rounded-full border-4 border-red-500 flex items-center justify-center text-4xl mb-2"
              animate={currentSegment.isChoke && showSegmentScore ? { scale: [1, 0.9, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {opponentAvatar ? (
                <Image src={opponentAvatar} alt={opponentName} width={96} height={96} className="rounded-full" />
              ) : (
                opponentName.charAt(0)
              )}
            </motion.div>
            <p className="font-bold text-white text-lg">{opponentName}</p>
            {/* Momentum Bar */}
            <div className="mt-2 h-3 bg-zinc-700 rounded-full overflow-hidden mx-4">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-red-400"
                animate={{ width: `${opponentMomentum}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">MOMENTUM</p>
          </div>
        </div>

        {/* Segment Score Display */}
        <AnimatePresence>
          {showSegmentScore && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center py-4 px-6 rounded-lg mb-4 ${
                currentSegment.isPeak
                  ? "bg-yellow-500/20 border-2 border-yellow-500/50"
                  : currentSegment.isChoke
                  ? "bg-red-500/20 border-2 border-red-500/50"
                  : "bg-zinc-800 border-2 border-zinc-700"
              }`}
            >
              <div className="flex justify-center items-center gap-8">
                <div>
                  <p className="text-3xl font-black text-green-400">{currentSegment.playerScore.toFixed(1)}</p>
                  <p className="text-xs text-zinc-500">{playerName}</p>
                </div>
                <div className="text-2xl text-zinc-600">—</div>
                <div>
                  <p className="text-3xl font-black text-red-400">{currentSegment.opponentScore.toFixed(1)}</p>
                  <p className="text-xs text-zinc-500">{opponentName}</p>
                </div>
              </div>
              {currentSegment.isPeak && (
                <p className="text-yellow-400 font-bold mt-2 text-sm">🔥 HAYMAKER! 🔥</p>
              )}
              {currentSegment.isChoke && (
                <p className="text-red-400 font-bold mt-2 text-sm">💀 CHOKE! 💀</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crowd Reactions */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3 text-center">CROWD REACTION</p>
          <div className="flex justify-around items-end min-h-[80px]">
            {crowdReactions.map((member, index) => (
              <AnimatePresence key={member.id}>
                {visibleReactions.includes(index) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", duration: 0.4 }}
                    className="text-center"
                  >
                    <div className="text-5xl mb-1">{CROWD_REACTIONS[member.reaction].emoji}</div>
                    <p className={`text-xs font-bold ${CROWD_REACTIONS[member.reaction].color}`}>
                      {CROWD_REACTIONS[member.reaction].label}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>

        {/* Segment Progress */}
        <div className="flex gap-2 mb-4">
          {segments.map((seg, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                i < currentSegmentIndex
                  ? seg.playerScore > seg.opponentScore
                    ? "bg-green-500"
                    : seg.playerScore < seg.opponentScore
                    ? "bg-red-500"
                    : "bg-yellow-500"
                  : i === currentSegmentIndex
                  ? "bg-orange-500 animate-pulse"
                  : "bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {isPlaying ? (
            <>
              <button
                onClick={handlePause}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded hover:border-zinc-500"
              >
                ⏸️ Pause
              </button>
              <button
                onClick={handleSkip}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-500 font-bold"
              >
                ⏭️ Skip Segment
              </button>
            </>
          ) : (
            <button
              onClick={handlePlay}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500 font-bold"
            >
              ▶️ Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
