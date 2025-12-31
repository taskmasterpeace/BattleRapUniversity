"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, CheckCircle, AlertCircle } from "lucide-react"

interface ActionOption {
  label: string
  emoji: string
  change: number
  description: string
}

interface PostBattleReactionProps {
  battleId: string
  onComplete?: () => void
}

export function PostBattleReaction({ battleId, onComplete }: PostBattleReactionProps) {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [isWinner, setIsWinner] = useState(false)
  const [opponentName, setOpponentName] = useState("")
  const [availableActions, setAvailableActions] = useState<Record<string, ActionOption>>({})
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [currentIntensity, setCurrentIntensity] = useState(0)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch(`/api/battles/${battleId}/grudge-action`)
        if (response.ok) {
          const data = await response.json()
          setIsWinner(data.isWinner)
          setOpponentName(data.opponentName)
          setAvailableActions(data.availableActions)
          setSelectedAction(data.selectedAction)
          setCurrentIntensity(data.currentIntensity)
        } else if (response.status === 403) {
          // Not a participant - hide component
          setError('not_participant')
        } else if (response.status === 404) {
          // API not implemented yet - hide component gracefully
          setError('not_implemented')
        }
      } catch (err) {
        console.error('Error fetching grudge status:', err)
        setError('fetch_error')
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [battleId])

  const handleSubmit = async (actionType: string) => {
    if (submitting || selectedAction) return
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/battles/${battleId}/grudge-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType }),
      })

      const data = await response.json()

      if (response.ok) {
        setSelectedAction(actionType)
        setCurrentIntensity(data.newIntensity)
        setMessage(data.message)
        setSuccess(true)
        onComplete?.()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to submit reaction')
    } finally {
      setSubmitting(false)
    }
  }

  // Don't show if loading, not a participant, or already acted
  if (loading) {
    return (
      <div className="bg-zinc-900 border-2 border-zinc-800 p-6 animate-pulse">
        <div className="h-24 bg-zinc-800 rounded" />
      </div>
    )
  }

  // Hide component if API not available or user not participant
  if (error === 'not_participant' || error === 'not_implemented' || error === 'fetch_error') {
    return null
  }

  // Show completed state
  if (selectedAction && success) {
    const action = availableActions[selectedAction]
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border-2 border-green-500/30 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h3 className="text-sm font-display font-bold text-green-500 tracking-wide">YOUR RESPONSE</h3>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl">{action?.emoji}</span>
          <div>
            <p className="text-lg font-display font-bold text-zinc-100">{action?.label}</p>
            <p className="text-sm text-zinc-400">{message}</p>
          </div>
        </div>

        {/* Intensity meter */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-display text-zinc-500">RIVALRY INTENSITY</span>
            <span className={`text-sm font-display font-bold ${
              currentIntensity >= 75 ? 'text-red-500' :
              currentIntensity >= 50 ? 'text-orange-500' :
              currentIntensity >= 25 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {currentIntensity}
            </span>
          </div>
          <div className="h-2 bg-zinc-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentIntensity}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${
                currentIntensity >= 75 ? 'bg-red-500' :
                currentIntensity >= 50 ? 'bg-orange-500' :
                currentIntensity >= 25 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {currentIntensity >= 90 ? 'LEGENDARY RIVALRY' :
             currentIntensity >= 75 ? 'Grudge Match eligible (+50% payout)' :
             currentIntensity >= 50 ? 'Heated rivalry (+25% payout)' :
             currentIntensity >= 25 ? 'Building tension' : 'Low tension'}
          </p>
        </div>
      </motion.div>
    )
  }

  // Already submitted before (from API)
  if (selectedAction && !success) {
    const action = availableActions[selectedAction]
    return (
      <div className="bg-zinc-900 border-2 border-zinc-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-5 h-5 text-zinc-500" />
          <h3 className="text-sm font-display font-bold text-zinc-400 tracking-wide">ALREADY RESPONDED</h3>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-3xl">{action?.emoji}</span>
          <div>
            <p className="text-lg font-display font-bold text-zinc-300">{action?.label}</p>
            <p className="text-sm text-zinc-500">You already responded to this battle</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border-2 border-orange-500/30 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="text-sm font-display font-bold text-orange-500 tracking-wide">
          {isWinner ? 'WINNER RESPONSE' : 'YOUR RESPONSE'}
        </h3>
      </div>

      <p className="text-sm text-zinc-400 mb-4">
        How do you feel about {isWinner ? 'your victory over' : 'losing to'}{' '}
        <span className="text-zinc-100 font-bold">{opponentName}</span>?
      </p>

      {/* Error message */}
      {error && error !== 'not_participant' && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(availableActions).map(([actionType, action]) => (
          <motion.button
            key={actionType}
            onClick={() => handleSubmit(actionType)}
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-4 border-2 text-left transition-all
              ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${action.change >= 30
                ? 'border-red-500/30 hover:border-red-500 hover:bg-red-900/20'
                : action.change >= 10
                ? 'border-orange-500/30 hover:border-orange-500 hover:bg-orange-900/20'
                : action.change < 0
                ? 'border-green-500/30 hover:border-green-500 hover:bg-green-900/20'
                : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
              }
            `}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{action.emoji}</span>
              <span className="text-sm font-display font-bold text-zinc-100">{action.label}</span>
            </div>
            <p className="text-xs text-zinc-500">{action.description}</p>
            <div className={`absolute top-2 right-2 text-xs font-display font-bold ${
              action.change > 0 ? 'text-red-400' : action.change < 0 ? 'text-green-400' : 'text-zinc-500'
            }`}>
              {action.change > 0 ? '+' : ''}{action.change}
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-zinc-600 mt-4">
        Your response affects rivalry intensity. Higher intensity = bigger payouts but more pressure.
      </p>
    </motion.div>
  )
}
