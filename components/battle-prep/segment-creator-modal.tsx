"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CONTENT_TYPE_INFO,
  DELIVERY_TYPE_INFO,
  PERFORMANCE_TYPE_INFO,
  CONTENT_TYPES,
  DELIVERY_TYPES,
  PERFORMANCE_TYPES,
  type ContentType,
  type DeliveryType,
  type PerformanceType,
} from "@/lib/round-crafting"
import type { PrepSegment, ResearchLevel } from "@/lib/types"
import { X, Zap, Target, AlertTriangle } from "lucide-react"

interface SegmentCreatorModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateSegment: (segment: Omit<PrepSegment, "id" | "createdAt" | "updatedAt">) => void
  battleId: string
  researchLevel: ResearchLevel
  existingSegmentsCount: number
  maxSegments: number
}

export function SegmentCreatorModal({
  isOpen,
  onClose,
  onCreateSegment,
  battleId,
  researchLevel,
  existingSegmentsCount,
  maxSegments,
}: SegmentCreatorModalProps) {
  const [contentType, setContentType] = useState<ContentType>("punchlines")
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("aggressive")
  const [performanceType, setPerformanceType] = useState<PerformanceType>("stage_presence")
  const [isFreestyle, setIsFreestyle] = useState(false)
  const [isCounter, setIsCounter] = useState(false)
  const [counterTarget, setCounterTarget] = useState<ContentType>("personals")

  // Check if personals have credibility risk
  const personalsRisk = contentType === "personals" && researchLevel === "none"
  const personalsWarning = contentType === "personals" && researchLevel === "casual"

  const handleCreate = () => {
    const segment: Omit<PrepSegment, "id" | "createdAt" | "updatedAt"> = {
      battleId,
      roundNum: null,
      position: null,
      contentType,
      deliveryType,
      performanceType,
      isFreestyle,
      isCounter,
      counterTarget: isCounter ? counterTarget : undefined,
      isWritten: isFreestyle,
      isRehearsed: false,
    }
    onCreateSegment(segment)
    onClose()
    setContentType("punchlines")
    setDeliveryType("aggressive")
    setPerformanceType("stage_presence")
    setIsFreestyle(false)
    setIsCounter(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#3a3d44] bg-zinc-800">
            <h2 className="text-xl font-display font-bold text-zinc-100">CREATE SEGMENT</h2>
            <button onClick={onClose} className="p-1 hover:bg-zinc-700 rounded transition-colors">
              <X className="w-6 h-6 text-zinc-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Segment Count */}
            <div className="flex items-center justify-between p-3 bg-zinc-800 border border-[#3a3d44] rounded-lg">
              <span className="text-sm text-zinc-400">Segments Created</span>
              <span
                className={`font-mono font-bold ${existingSegmentsCount >= maxSegments ? "text-green-400" : "text-[#ff8c42]"}`}
              >
                {existingSegmentsCount}/{maxSegments}
              </span>
            </div>

            {/* Content Type */}
            <div>
              <label className="text-sm font-display font-bold text-zinc-300 mb-3 block">CONTENT TYPE</label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setContentType(ct)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                      contentType === ct ? "bg-[#ff8c42] text-black" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {CONTENT_TYPE_INFO[ct].name}
                  </button>
                ))}
              </div>

              {/* Personals Warning */}
              {personalsRisk && (
                <div className="mt-3 p-3 bg-orange-900/30 border border-orange-600 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-orange-300">NO RESEARCH = CREDIBILITY RISK</div>
                    <div className="text-xs text-zinc-400 mt-1">
                      Personals without Aggressive research may hurt credibility if opponent calls you out.
                    </div>
                  </div>
                </div>
              )}
              {personalsWarning && (
                <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-300">
                    Casual research - stick to public facts for safe personals.
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Type */}
            <div>
              <label className="text-sm font-display font-bold text-zinc-300 mb-3 block">DELIVERY TYPE</label>
              <div className="flex flex-wrap gap-2">
                {DELIVERY_TYPES.map((dt) => (
                  <button
                    key={dt}
                    onClick={() => setDeliveryType(dt)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                      deliveryType === dt ? "bg-[#ff8c42] text-black" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {DELIVERY_TYPE_INFO[dt].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Type */}
            <div>
              <label className="text-sm font-display font-bold text-zinc-300 mb-3 block">PERFORMANCE TYPE</label>
              <div className="flex flex-wrap gap-2">
                {PERFORMANCE_TYPES.map((pt) => (
                  <button
                    key={pt}
                    onClick={() => setPerformanceType(pt)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                      performanceType === pt ? "bg-[#ff8c42] text-black" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {PERFORMANCE_TYPE_INFO[pt].name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#3a3d44] pt-4 space-y-4">
              <h4 className="text-sm font-display font-bold text-zinc-300">OPTIONS</h4>

              {/* Freestyle Toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-800 border border-[#3a3d44] rounded-lg hover:bg-zinc-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isFreestyle}
                  onChange={(e) => setIsFreestyle(e.target.checked)}
                  className="w-5 h-5 accent-yellow-500"
                />
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="font-display font-bold text-zinc-100">Mark as FREESTYLE (no writing needed)</span>
              </label>

              {/* Counter Toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-800 border border-[#3a3d44] rounded-lg hover:bg-zinc-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isCounter}
                  onChange={(e) => setIsCounter(e.target.checked)}
                  className="w-5 h-5 accent-red-500"
                />
                <Target className="w-5 h-5 text-red-400" />
                <span className="font-display font-bold text-zinc-100">
                  Mark as COUNTER (for anticipated opponent content)
                </span>
              </label>

              {isCounter && (
                <div className="ml-8 p-3 bg-zinc-900 border border-[#3a3d44] rounded-lg">
                  <label className="text-xs text-zinc-500 mb-2 block">ANTICIPATING OPPONENT TO USE:</label>
                  <select
                    value={counterTarget}
                    onChange={(e) => setCounterTarget(e.target.value as ContentType)}
                    className="w-full bg-zinc-800 border border-[#3a3d44] rounded p-2 text-zinc-100"
                  >
                    {CONTENT_TYPES.map((ct) => (
                      <option key={ct} value={ct}>
                        {CONTENT_TYPE_INFO[ct].name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t-2 border-[#3a3d44] bg-zinc-800 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-display font-bold rounded-lg transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-4 py-3 bg-[#ff8c42] hover:bg-[#ff9f5a] text-black font-display font-bold rounded-lg transition-colors"
            >
              CREATE SEGMENT
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
