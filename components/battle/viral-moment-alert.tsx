"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, TrendingUp, AlertTriangle, Sparkles, X, Share2, ThumbsUp, MessageCircle } from "lucide-react"

interface ViralMoment {
  type: string
  description: string
  viral_score: number
}

interface ViralMomentAlertProps {
  battleId: string
  viralMoments?: ViralMoment[]
  onClose?: () => void
}

const VIRAL_ICONS: Record<string, any> = {
  haymaker_reaction: Flame,
  devastating_body: AlertTriangle,
  epic_choke: AlertTriangle,
  comeback_story: TrendingUp,
  crowd_control: ThumbsUp,
  controversy: MessageCircle,
  upset: Sparkles,
}

const VIRAL_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  haymaker_reaction: { bg: "bg-orange-950/40", border: "border-orange-500/50", text: "text-orange-300", icon: "text-orange-500" },
  devastating_body: { bg: "bg-red-950/40", border: "border-red-500/50", text: "text-red-300", icon: "text-red-500" },
  epic_choke: { bg: "bg-yellow-950/40", border: "border-yellow-500/50", text: "text-yellow-300", icon: "text-yellow-500" },
  comeback_story: { bg: "bg-green-950/40", border: "border-green-500/50", text: "text-green-300", icon: "text-green-500" },
  crowd_control: { bg: "bg-blue-950/40", border: "border-blue-500/50", text: "text-blue-300", icon: "text-blue-500" },
  controversy: { bg: "bg-purple-950/40", border: "border-purple-500/50", text: "text-purple-300", icon: "text-purple-500" },
  upset: { bg: "bg-amber-950/40", border: "border-amber-500/50", text: "text-amber-300", icon: "text-amber-500" },
}

export function ViralMomentAlert({ battleId, viralMoments = [], onClose }: ViralMomentAlertProps) {
  const [visible, setVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (viralMoments.length === 0) {
      setVisible(false)
    }
  }, [viralMoments])

  if (!visible || viralMoments.length === 0) return null

  const currentMoment = viralMoments[currentIndex]
  const Icon = VIRAL_ICONS[currentMoment?.type] || Flame
  const colors = VIRAL_COLORS[currentMoment?.type] || VIRAL_COLORS.haymaker_reaction

  const handleClose = () => {
    setVisible(false)
    onClose?.()
  }

  const handleNext = () => {
    if (currentIndex < viralMoments.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      handleClose()
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md ${colors.bg} border-2 ${colors.border} shadow-2xl`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Flame className={`w-5 h-5 ${colors.icon}`} fill="currentColor" />
              </motion.div>
              <span className={`font-display font-black text-sm uppercase tracking-wider ${colors.text}`}>
                VIRAL MOMENT
              </span>
              {viralMoments.length > 1 && (
                <span className="text-xs text-zinc-500 font-mono">
                  ({currentIndex + 1}/{viralMoments.length})
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <div className="flex-1">
                <p className={`${colors.text} text-sm leading-relaxed font-display`}>
                  {currentMoment?.description}
                </p>

                {/* Viral Score Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-500">Viral Score</span>
                    <span className={`font-mono font-bold ${colors.text}`}>
                      {currentMoment?.viral_score}%
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentMoment?.viral_score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${colors.icon.replace('text-', 'bg-')}`}
                    />
                  </div>
                </div>

                {/* Social Stats */}
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Share2 className="w-3 h-3" />
                    <span className="font-mono">{Math.floor(currentMoment?.viral_score * 50)}+ shares</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-500">
                    <MessageCircle className="w-3 h-3" />
                    <span className="font-mono">{Math.floor(currentMoment?.viral_score * 20)}+ comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-zinc-800/50 bg-zinc-900/50">
            <p className="text-xs text-zinc-500">
              This moment is spreading on social media
            </p>
            <button
              onClick={handleNext}
              className={`px-3 py-1.5 ${colors.bg} border ${colors.border} ${colors.text} text-xs font-display font-bold uppercase hover:brightness-125 transition-all`}
            >
              {currentIndex < viralMoments.length - 1 ? "Next" : "Got it"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Compact inline version for battle results page
 */
export function ViralMomentBadge({ moment }: { moment: ViralMoment }) {
  const Icon = VIRAL_ICONS[moment.type] || Flame
  const colors = VIRAL_COLORS[moment.type] || VIRAL_COLORS.haymaker_reaction

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${colors.bg} border ${colors.border}`}>
      <Icon className={`w-4 h-4 ${colors.icon}`} />
      <span className={`text-xs font-display font-bold uppercase ${colors.text}`}>
        {moment.type.replace(/_/g, ' ')}
      </span>
      <span className="text-xs text-zinc-500 font-mono">
        {moment.viral_score}%
      </span>
    </div>
  )
}
