"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ReactionCounts {
  facts: number
  cap: number
  fire: number
  mid: number
  debatable: number
}

interface Blogger {
  name: string
  handle: string
  credibility_score: number
}

interface ReactionBarProps {
  slug: string
}

const REACTIONS = [
  { type: 'facts', emoji: '👏', label: 'FACTS', color: 'green', description: 'Accurate take' },
  { type: 'cap', emoji: '🤡', label: 'CAP', color: 'red', description: 'Inaccurate' },
  { type: 'fire', emoji: '🔥', label: 'FIRE', color: 'orange', description: 'Entertaining' },
  { type: 'mid', emoji: '😴', label: 'MID', color: 'zinc', description: 'Boring' },
  { type: 'debatable', emoji: '⚖️', label: 'DEBATABLE', color: 'purple', description: 'Controversial' },
] as const

export function ReactionBar({ slug }: ReactionBarProps) {
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({
    facts: 0, cap: 0, fire: 0, mid: 0, debatable: 0
  })
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [blogger, setBlogger] = useState<Blogger | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchReactions() {
      try {
        const response = await fetch(`/api/news/${slug}/reactions`)
        if (response.ok) {
          const data = await response.json()
          setReactionCounts(data.reactionCounts)
          setUserReaction(data.userReaction)
          setBlogger(data.blogger)
        }
      } catch (error) {
        console.error('Error fetching reactions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReactions()
  }, [slug])

  const handleReaction = async (reactionType: string) => {
    if (submitting) return
    setSubmitting(true)

    try {
      if (userReaction === reactionType) {
        // Remove reaction
        const response = await fetch(`/api/news/${slug}/reactions`, {
          method: 'DELETE',
        })
        if (response.ok) {
          const data = await response.json()
          setReactionCounts(data.reactionCounts)
          setUserReaction(null)
        }
      } else {
        // Add/change reaction
        const response = await fetch(`/api/news/${slug}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reactionType }),
        })
        if (response.ok) {
          const data = await response.json()
          setReactionCounts(data.reactionCounts)
          setUserReaction(data.userReaction)
        }
      }
    } catch (error) {
      console.error('Error saving reaction:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0)

  if (loading) {
    return (
      <div className="bg-zinc-900 border-2 border-zinc-800 p-4 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border-2 border-zinc-800 p-4">
      {/* Blogger credibility */}
      {blogger && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
          <div>
            <span className="text-xs text-zinc-500 font-display">WRITTEN BY</span>
            <p className="text-sm text-zinc-200 font-display font-bold">{blogger.name}</p>
            <p className="text-xs text-zinc-500">{blogger.handle}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-500 font-display">CREDIBILITY</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    blogger.credibility_score >= 70 ? 'bg-green-500' :
                    blogger.credibility_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${blogger.credibility_score}%` }}
                />
              </div>
              <span className={`text-sm font-display font-bold ${
                blogger.credibility_score >= 70 ? 'text-green-500' :
                blogger.credibility_score >= 40 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {blogger.credibility_score}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-display font-bold text-zinc-400 tracking-wide">WHAT'S THE VERDICT?</h4>
        {totalReactions > 0 && (
          <span className="text-xs text-zinc-500">{totalReactions} reaction{totalReactions !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Reaction buttons */}
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((reaction) => {
          const isSelected = userReaction === reaction.type
          const count = reactionCounts[reaction.type as keyof ReactionCounts]

          return (
            <motion.button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              disabled={submitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative flex items-center gap-2 px-3 py-2 border-2 transition-all
                ${isSelected
                  ? reaction.color === 'green' ? 'bg-green-900/50 border-green-500 text-green-400' :
                    reaction.color === 'red' ? 'bg-red-900/50 border-red-500 text-red-400' :
                    reaction.color === 'orange' ? 'bg-orange-900/50 border-orange-500 text-orange-400' :
                    reaction.color === 'zinc' ? 'bg-zinc-800 border-zinc-500 text-zinc-300' :
                    'bg-purple-900/50 border-purple-500 text-purple-400'
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                }
                ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={reaction.description}
            >
              <span className="text-lg">{reaction.emoji}</span>
              <span className="text-xs font-display font-bold tracking-wide">{reaction.label}</span>
              <AnimatePresence mode="wait">
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className={`
                      text-xs font-bold px-1.5 py-0.5
                      ${isSelected
                        ? 'bg-zinc-900 text-zinc-200'
                        : 'bg-zinc-700 text-zinc-300'
                      }
                    `}
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {/* Your selection indicator */}
      {userReaction && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-xs text-zinc-500"
        >
          You reacted with {REACTIONS.find(r => r.type === userReaction)?.emoji}
          <button
            onClick={() => handleReaction(userReaction)}
            className="ml-2 text-zinc-400 hover:text-zinc-200 underline"
          >
            remove
          </button>
        </motion.div>
      )}
    </div>
  )
}
