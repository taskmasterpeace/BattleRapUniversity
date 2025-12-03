"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { PrepSegment } from "@/lib/types"
import {
  CONTENT_TYPE_INFO,
  DELIVERY_TYPE_INFO,
  PERFORMANCE_TYPE_INFO,
  type ContentType,
  type DeliveryType,
  type PerformanceType,
} from "@/lib/round-crafting"
import { GripVertical, Trash2, ChevronDown, ChevronUp, Check, AlertTriangle, Zap, Target } from "lucide-react"

interface RoundOrganizerProps {
  segments: PrepSegment[]
  roundCount: number
  segmentsPerRound: number
  onAssignSegment: (segmentId: string, roundNum: number | null, position: number | null) => void
  onRemoveSegment: (segmentId: string) => void
}

export function RoundOrganizer({
  segments,
  roundCount,
  segmentsPerRound,
  onAssignSegment,
  onRemoveSegment,
}: RoundOrganizerProps) {
  const [expandedRound, setExpandedRound] = useState<number | null>(1)
  const [draggedSegment, setDraggedSegment] = useState<string | null>(null)

  const getSegmentsForRound = (round: number) => {
    return segments.filter((s) => s.roundNum === round).sort((a, b) => (a.position || 0) - (b.position || 0))
  }

  const unassignedSegments = segments.filter((s) => s.roundNum === null)

  const handleDragStart = (segmentId: string) => {
    setDraggedSegment(segmentId)
  }

  const handleDragEnd = () => {
    setDraggedSegment(null)
  }

  const handleDropOnRound = (round: number) => {
    if (draggedSegment) {
      const roundSegments = getSegmentsForRound(round)
      if (roundSegments.length < segmentsPerRound) {
        onAssignSegment(draggedSegment, round, roundSegments.length + 1)
      }
    }
    setDraggedSegment(null)
  }

  const handleDropOnUnassigned = () => {
    if (draggedSegment) {
      onAssignSegment(draggedSegment, null, null)
    }
    setDraggedSegment(null)
  }

  return (
    <div className="space-y-4">
      {/* Round Columns */}
      {Array.from({ length: roundCount }, (_, i) => i + 1).map((round) => {
        const roundSegments = getSegmentsForRound(round)
        const isComplete = roundSegments.length >= segmentsPerRound
        const isExpanded = expandedRound === round

        return (
          <div
            key={round}
            className={`border-2 transition-colors ${
              draggedSegment ? "border-dashed border-orange-500/50" : "border-zinc-700"
            } ${isComplete ? "bg-green-500/5" : "bg-zinc-800/30"}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropOnRound(round)}
          >
            <button
              onClick={() => setExpandedRound(isExpanded ? null : round)}
              className="w-full px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-2 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-base sm:text-lg font-display font-bold text-zinc-100">ROUND {round}</span>
                <span className={`text-xs sm:text-sm font-mono ${isComplete ? "text-green-400" : "text-orange-400"}`}>
                  {roundSegments.length}/{segmentsPerRound}
                </span>
                {isComplete ? (
                  <span className="flex items-center gap-1 text-green-400 text-[10px] sm:text-xs">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" /> READY
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-400 text-[10px] sm:text-xs">
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" /> INCOMPLETE
                  </span>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              )}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 sm:p-4 border-t border-zinc-700 space-y-2">
                    {roundSegments.length === 0 ? (
                      <div className="text-center py-4 sm:py-6 text-zinc-500 border-2 border-dashed border-zinc-700">
                        <p className="text-xs sm:text-sm">Drag segments here or use the dropdown below</p>
                      </div>
                    ) : (
                      roundSegments.map((segment, idx) => (
                        <SegmentCard
                          key={segment.id}
                          segment={segment}
                          position={idx + 1}
                          onRemove={() => onAssignSegment(segment.id, null, null)}
                          onDragStart={() => handleDragStart(segment.id)}
                          onDragEnd={handleDragEnd}
                          isDragging={draggedSegment === segment.id}
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Unassigned Segments */}
      {unassignedSegments.length > 0 && (
        <div
          className={`border-2 border-dashed p-3 sm:p-4 transition-colors ${
            draggedSegment ? "border-zinc-500" : "border-zinc-700"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnUnassigned}
        >
          <h3 className="text-xs sm:text-sm font-display font-bold text-zinc-400 mb-3">
            UNASSIGNED ({unassignedSegments.length})
          </h3>
          <div className="space-y-2">
            {unassignedSegments.map((segment) => (
              <div
                key={segment.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-zinc-800 border border-zinc-700"
              >
                <SegmentBadges segment={segment} />
                <div className="flex items-center gap-2 sm:ml-auto">
                  <select
                    value=""
                    onChange={(e) => {
                      const round = Number.parseInt(e.target.value)
                      if (round) {
                        const roundSegments = getSegmentsForRound(round)
                        onAssignSegment(segment.id, round, roundSegments.length + 1)
                      }
                    }}
                    className="flex-1 sm:flex-none bg-zinc-700 border border-zinc-600 text-xs sm:text-sm px-2 py-1.5 text-zinc-100"
                  >
                    <option value="">Assign to...</option>
                    {Array.from({ length: roundCount }, (_, i) => i + 1).map((r) => {
                      const count = getSegmentsForRound(r).length
                      const canAssign = count < segmentsPerRound
                      return (
                        <option key={r} value={r} disabled={!canAssign}>
                          Round {r} ({count}/{segmentsPerRound})
                        </option>
                      )
                    })}
                  </select>
                  <button
                    onClick={() => onRemoveSegment(segment.id)}
                    className="p-1.5 hover:bg-zinc-700 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SegmentBadges({ segment }: { segment: PrepSegment }) {
  return (
    <div className="flex flex-wrap gap-1 sm:gap-2">
      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-500/20 text-purple-400 text-[10px] sm:text-xs font-bold truncate max-w-[80px] sm:max-w-none">
        {CONTENT_TYPE_INFO[segment.contentType as ContentType]?.name || segment.contentType}
      </span>
      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-bold truncate max-w-[60px] sm:max-w-none">
        {DELIVERY_TYPE_INFO[segment.deliveryType as DeliveryType]?.name || segment.deliveryType}
      </span>
      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-bold truncate max-w-[60px] sm:max-w-none">
        {PERFORMANCE_TYPE_INFO[segment.performanceType as PerformanceType]?.name || segment.performanceType}
      </span>
      {segment.isFreestyle && (
        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-500/20 text-yellow-400 text-[10px] sm:text-xs font-bold flex items-center gap-0.5 sm:gap-1">
          <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> FREE
        </span>
      )}
      {segment.isCounter && (
        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500/20 text-red-400 text-[10px] sm:text-xs font-bold flex items-center gap-0.5 sm:gap-1">
          <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> CTR
        </span>
      )}
    </div>
  )
}

function SegmentCard({
  segment,
  position,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  segment: PrepSegment
  position: number
  onRemove: () => void
  onDragStart: () => void
  onDragEnd: () => void
  isDragging: boolean
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-zinc-900 border border-zinc-700 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-zinc-600 hidden sm:block" />
        <span className="text-[10px] sm:text-xs font-mono text-zinc-500">#{position}</span>
      </div>
      <SegmentBadges segment={segment} />
      <button
        onClick={onRemove}
        className="sm:ml-auto p-1 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 self-end sm:self-auto"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
