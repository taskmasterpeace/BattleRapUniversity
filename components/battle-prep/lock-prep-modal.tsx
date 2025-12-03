"use client"

import { AlertTriangle, Lock, X } from "lucide-react"

interface LockPrepModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  predictedScore: number
  chokeRisk: number
  restDays: number
  stressLevel: number
}

export function LockPrepModal({
  isOpen,
  onClose,
  onConfirm,
  predictedScore,
  chokeRisk,
  restDays,
  stressLevel,
}: LockPrepModalProps) {
  if (!isOpen) return null

  const hasWarnings = restDays === 0 && stressLevel > 60

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-zinc-900 border-2 border-zinc-700 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-zinc-700 bg-zinc-800">
          <h2 className="text-lg font-display font-bold text-zinc-100 tracking-wide">CONFIRM PREP PLAN?</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Prediction summary */}
          <div className="text-center space-y-2">
            <p className="text-sm text-zinc-400">Based on your choices, your</p>
            <p className="text-2xl font-display font-bold text-orange-500">
              Predicted Score: {predictedScore.toFixed(1)} avg
            </p>
            <p className="text-sm text-zinc-400">
              Choke Risk:{" "}
              <span className={chokeRisk > 15 ? "text-red-500" : chokeRisk > 10 ? "text-yellow-500" : "text-green-500"}>
                {chokeRisk}%
              </span>
            </p>
          </div>

          {/* Warnings */}
          {hasWarnings && (
            <div className="bg-yellow-900/20 border border-yellow-600 p-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-500 font-bold">Warning</p>
                <p className="text-xs text-zinc-400 mt-1">
                  You have no REST days and your stress is high ({stressLevel}). This increases choke risk.
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-zinc-400">Are you ready to lock in this strategy?</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors"
            >
              EDIT
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-500 text-sm font-display font-bold text-white tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              CONFIRM LOCK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
