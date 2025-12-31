"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useBattler } from "@/contexts/battler-context"
import {
  X,
  Megaphone,
  Target,
  DollarSign,
  Clock,
  Loader2,
  ChevronDown,
} from "lucide-react"

interface CreateCallOutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Battler {
  id: string
  stageName: string
  tier: string
  avatar?: string
  rating: number
}

const TEMPLATES = [
  {
    id: "bars_are_basic",
    emoji: "📝",
    text: "YOUR BARS ARE BASIC - PROVE ME WRONG",
  },
  {
    id: "not_ready_for_league",
    emoji: "🚫",
    text: "YOU AIN'T READY FOR THIS LEAGUE",
  },
  {
    id: "body_you_30",
    emoji: "💀",
    text: "I'LL BODY YOU 3-0",
  },
  {
    id: "stop_ducking",
    emoji: "🦆",
    text: "STOP DUCKING AND BATTLE ME",
  },
  {
    id: "throne_is_mine",
    emoji: "👑",
    text: "THAT THRONE IS MINE",
  },
]

export function CreateCallOutModal({ isOpen, onClose, onSuccess }: CreateCallOutModalProps) {
  const { activeBattler } = useBattler()
  const [battlers, setBattlers] = useState<Battler[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [selectedBattler, setSelectedBattler] = useState<string>("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("bars_are_basic")
  const [stakeAmount, setStakeAmount] = useState<number>(0)

  useEffect(() => {
    async function fetchBattlers() {
      if (!isOpen) return
      setLoading(true)
      try {
        const res = await fetch("/api/battlers")
        if (res.ok) {
          const data = await res.json()
          // Filter out player's own battler
          const otherBattlers = data.battlers?.filter(
            (b: Battler) => b.id !== activeBattler?.id
          ) || []
          setBattlers(otherBattlers)
        }
      } catch (err) {
        console.error("Failed to fetch battlers:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBattlers()
  }, [isOpen, activeBattler?.id])

  const handleSubmit = async () => {
    if (!selectedBattler) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/call-outs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetBattlerId: selectedBattler,
          template: selectedTemplate,
          stakeAmount: stakeAmount,
        }),
      })

      if (res.ok) {
        onSuccess()
      } else {
        const error = await res.json()
        console.error("Failed to create call-out:", error)
      }
    } catch (err) {
      console.error("Error creating call-out:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedTemplate_data = TEMPLATES.find((t) => t.id === selectedTemplate)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-zinc-900 border-2 border-orange-500/50 z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600/20 border-2 border-orange-500/50 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-orange-500" />
                </div>
                <h2 className="text-xl font-display font-black text-zinc-100 uppercase tracking-tighter">
                  Call Someone Out
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Select Target */}
              <div>
                <label className="flex items-center gap-2 text-sm font-display font-bold text-zinc-300 uppercase tracking-wide mb-3">
                  <Target className="w-4 h-4 text-orange-500" />
                  Select Target
                </label>
                {loading ? (
                  <div className="bg-zinc-800 border border-zinc-700 p-4 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedBattler}
                      onChange={(e) => setSelectedBattler(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 font-display focus:outline-none focus:border-orange-500 appearance-none"
                    >
                      <option value="">Choose a battler...</option>
                      {battlers.map((battler) => (
                        <option key={battler.id} value={battler.id}>
                          {battler.stageName} ({battler.tier}) - Rating: {battler.rating}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Select Template */}
              <div>
                <label className="flex items-center gap-2 text-sm font-display font-bold text-zinc-300 uppercase tracking-wide mb-3">
                  <Megaphone className="w-4 h-4 text-orange-500" />
                  Choose Your Call-Out
                </label>
                <div className="space-y-2">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full text-left p-4 border-2 transition-all ${
                        selectedTemplate === template.id
                          ? "bg-orange-950/30 border-orange-500 shadow-lg shadow-orange-500/20"
                          : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{template.emoji}</span>
                        <p className="flex-1 font-display font-black text-sm uppercase tracking-wide text-orange-400">
                          {template.text}
                        </p>
                        {selectedTemplate === template.id && (
                          <div className="w-5 h-5 bg-orange-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Stake */}
              <div>
                <label className="flex items-center gap-2 text-sm font-display font-bold text-zinc-300 uppercase tracking-wide mb-3">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Optional Stake (increases pressure)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    step="100"
                    className="w-full bg-zinc-800 border border-zinc-700 pl-10 pr-4 py-3 text-sm text-zinc-100 font-mono focus:outline-none focus:border-orange-500"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Adding a stake increases the intensity and payout if accepted
                </p>
              </div>

              {/* Preview */}
              {selectedBattler && selectedTemplate_data && (
                <div className="bg-zinc-800/30 border border-zinc-700 p-4">
                  <p className="text-xs font-display font-bold text-zinc-500 uppercase tracking-wide mb-3">
                    Preview
                  </p>
                  <div className="bg-zinc-900 border border-zinc-700 p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{selectedTemplate_data.emoji}</span>
                      <div className="flex-1">
                        <p className="font-display font-black text-orange-400 text-sm uppercase tracking-wide leading-tight">
                          {selectedTemplate_data.text}
                        </p>
                        {stakeAmount > 0 && (
                          <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Stake: ${stakeAmount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-zinc-800/30 border border-zinc-700 p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2 text-xs text-zinc-400">
                    <p className="font-display font-bold text-yellow-400 uppercase">48-Hour Deadline</p>
                    <p>• Target has 48 hours to respond (Accept/Counter/Ignore)</p>
                    <p>• Crew members can cosign your call-out to increase pressure</p>
                    <p className="text-yellow-400">
                      • Warning: If they ignore too many call-outs, they'll earn the "Ducking" badge
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-4 flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 font-display font-bold uppercase"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedBattler || submitting}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Megaphone className="w-4 h-4 mr-2" />
                    Issue Call-Out
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
