"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CreateCrewModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateCrewModal({ isOpen, onClose, onCreated }: CreateCrewModalProps) {
  const [name, setName] = useState("")
  const [tag, setTag] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    setError("")

    // Validate inputs
    if (!name.trim()) {
      setError("Crew name is required")
      return
    }

    if (!tag.trim()) {
      setError("Crew tag is required")
      return
    }

    if (tag.length < 2 || tag.length > 5) {
      setError("Tag must be 2-5 characters")
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch('/api/crews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), tag: tag.trim().toUpperCase() })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create crew')
        setIsCreating(false)
        return
      }

      // Success - close modal and refresh
      setName("")
      setTag("")
      onCreated()
      onClose()
    } catch (err) {
      console.error('Create crew error:', err)
      setError('Failed to create crew')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-zinc-900 border-2 border-orange-500/50 max-w-md w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <h2 className="text-xl font-display font-bold text-zinc-100 uppercase tracking-wide">
                  Create Crew
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                disabled={isCreating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-3">
                <p className="text-xs text-yellow-500 font-display uppercase tracking-wide">
                  ⚠️ WARNING: Crew membership is PERMANENT on your record - opponents can use it as an angle!
                </p>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs text-zinc-400 font-display uppercase tracking-wide mb-2">
                  Crew Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="The Golden Kings"
                  maxLength={30}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-4 py-2 focus:outline-none focus:border-orange-500 font-display"
                  disabled={isCreating}
                />
                <p className="text-xs text-zinc-500 mt-1 font-display">
                  {name.length}/30 characters
                </p>
              </div>

              {/* Tag Input */}
              <div>
                <label className="block text-xs text-zinc-400 font-display uppercase tracking-wide mb-2">
                  Crew Tag (2-5 chars)
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value.toUpperCase())}
                  placeholder="TGK"
                  maxLength={5}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-4 py-2 focus:outline-none focus:border-orange-500 font-display uppercase"
                  disabled={isCreating}
                />
                <p className="text-xs text-zinc-500 mt-1 font-display">
                  Short code displayed on crew badge
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 p-3"
                >
                  <p className="text-xs text-red-500 font-display">
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Info */}
              <div className="bg-zinc-800/50 border border-zinc-700 p-3 space-y-2">
                <p className="text-xs text-zinc-400 font-display">
                  • You will be the crew leader
                </p>
                <p className="text-xs text-zinc-400 font-display">
                  • Max 5 members per crew
                </p>
                <p className="text-xs text-zinc-400 font-display">
                  • Crew name and tag must be unique
                </p>
                <p className="text-xs text-zinc-400 font-display">
                  • Members can help with prep and share badge bonuses
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-4 border-t border-zinc-800">
              <Button
                onClick={onClose}
                disabled={isCreating}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-display font-bold"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !name.trim() || !tag.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    CREATING...
                  </>
                ) : (
                  "CREATE CREW"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
