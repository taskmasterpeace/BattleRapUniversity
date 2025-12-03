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
import { Plus, Trash2, GripVertical, Zap, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"

export interface Segment {
  id: string
  contentType: ContentType
  deliveryType: DeliveryType
  performanceType: PerformanceType
  isFreestyle: boolean
  isCounter: boolean
  counterFor?: string
}

interface SegmentCraftingProps {
  roundCount: number
  roundLength: number // in minutes
  segments: Segment[]
  onSegmentsChange: (segments: Segment[]) => void
  roundAssignments: { [segmentId: string]: number } // segment id -> round number
  onRoundAssignmentChange: (segmentId: string, round: number) => void
  researchLevel: "none" | "casual" | "aggressive"
  writingDays: number
}

export function SegmentCrafting({
  roundCount,
  roundLength,
  segments,
  onSegmentsChange,
  roundAssignments,
  onRoundAssignmentChange,
  researchLevel,
  writingDays,
}: SegmentCraftingProps) {
  const [showCreator, setShowCreator] = useState(false)
  const [expandedRound, setExpandedRound] = useState<number | null>(1)

  // Calculate segments needed per round based on round length
  const segmentsPerRound = roundLength === 3 ? 6 : roundLength === 2 ? 4 : 3
  const totalSegmentsNeeded = segmentsPerRound * roundCount

  // New segment form state
  const [newContent, setNewContent] = useState<ContentType>("punchlines")
  const [newDelivery, setNewDelivery] = useState<DeliveryType>("aggressive")
  const [newPerformance, setNewPerformance] = useState<PerformanceType>("stage_presence")
  const [newIsFreestyle, setNewIsFreestyle] = useState(false)
  const [newIsCounter, setNewIsCounter] = useState(false)

  const handleAddSegment = () => {
    const newSegment: Segment = {
      id: `seg-${Date.now()}`,
      contentType: newContent,
      deliveryType: newDelivery,
      performanceType: newPerformance,
      isFreestyle: newIsFreestyle,
      isCounter: newIsCounter,
    }
    onSegmentsChange([...segments, newSegment])
    setShowCreator(false)
  }

  const handleRemoveSegment = (id: string) => {
    onSegmentsChange(segments.filter((s) => s.id !== id))
  }

  // Get segments for a specific round
  const getSegmentsForRound = (round: number) => {
    return segments.filter((s) => roundAssignments[s.id] === round)
  }

  // Get unassigned segments
  const unassignedSegments = segments.filter((s) => !roundAssignments[s.id])

  return (
    <div className="bg-zinc-900 border-2 border-zinc-700">
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-zinc-700 bg-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-zinc-100 tracking-wide">CONTENT CRAFTING</h2>
          <div className="text-sm font-mono">
            <span className={segments.length >= totalSegmentsNeeded ? "text-green-400" : "text-orange-400"}>
              {segments.length}/{totalSegmentsNeeded}
            </span>
            <span className="text-zinc-500 ml-1">SEGMENTS</span>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          {roundCount} rounds × {segmentsPerRound} segments ({roundLength} min rounds)
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Research Level Indicator */}
        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700">
          <span className="text-xs font-display text-zinc-400">RESEARCH LEVEL:</span>
          <span
            className={`text-sm font-bold ${
              researchLevel === "aggressive"
                ? "text-green-400"
                : researchLevel === "casual"
                  ? "text-yellow-400"
                  : "text-red-400"
            }`}
          >
            {researchLevel.toUpperCase()}
          </span>
          {researchLevel === "none" && <span className="text-xs text-red-400">(Personals will lack credibility!)</span>}
        </div>

        {/* Round Organizer */}
        {[1, 2, 3].slice(0, roundCount).map((round) => {
          const roundSegments = getSegmentsForRound(round)
          const isComplete = roundSegments.length >= segmentsPerRound
          const isExpanded = expandedRound === round

          return (
            <div key={round} className="border border-zinc-700 bg-zinc-800/30">
              <button
                onClick={() => setExpandedRound(isExpanded ? null : round)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-display font-bold text-zinc-100">ROUND {round}</span>
                  <span className={`text-sm font-mono ${isComplete ? "text-green-400" : "text-orange-400"}`}>
                    {roundSegments.length}/{segmentsPerRound}
                  </span>
                  {isComplete && <span className="text-green-400 text-xs">✓ READY</span>}
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
                    <div className="p-4 border-t border-zinc-700 space-y-2">
                      {roundSegments.length === 0 ? (
                        <p className="text-sm text-zinc-500 text-center py-4">
                          No segments assigned. Create segments below and assign them here.
                        </p>
                      ) : (
                        roundSegments.map((segment, idx) => (
                          <div
                            key={segment.id}
                            className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-700"
                          >
                            <GripVertical className="w-4 h-4 text-zinc-600" />
                            <span className="text-xs font-mono text-zinc-500">#{idx + 1}</span>
                            <div className="flex-1 flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold">
                                {CONTENT_TYPE_INFO[segment.contentType].name}
                              </span>
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold">
                                {DELIVERY_TYPE_INFO[segment.deliveryType].name}
                              </span>
                              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                                {PERFORMANCE_TYPE_INFO[segment.performanceType].name}
                              </span>
                              {segment.isFreestyle && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center gap-1">
                                  <Zap className="w-3 h-3" /> FREESTYLE
                                </span>
                              )}
                              {segment.isCounter && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" /> COUNTER
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => onRoundAssignmentChange(segment.id, 0)}
                              className="p-1 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
          <div className="border border-dashed border-zinc-600 p-4">
            <h3 className="text-sm font-display font-bold text-zinc-400 mb-3">
              UNASSIGNED SEGMENTS ({unassignedSegments.length})
            </h3>
            <div className="space-y-2">
              {unassignedSegments.map((segment) => (
                <div key={segment.id} className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-700">
                  <div className="flex-1 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold">
                      {CONTENT_TYPE_INFO[segment.contentType].name}
                    </span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold">
                      {DELIVERY_TYPE_INFO[segment.deliveryType].name}
                    </span>
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      {PERFORMANCE_TYPE_INFO[segment.performanceType].name}
                    </span>
                  </div>
                  <select
                    value=""
                    onChange={(e) => onRoundAssignmentChange(segment.id, Number.parseInt(e.target.value))}
                    className="bg-zinc-700 border border-zinc-600 text-sm px-2 py-1 text-zinc-100"
                  >
                    <option value="">Assign to...</option>
                    {[1, 2, 3].slice(0, roundCount).map((r) => (
                      <option key={r} value={r}>
                        Round {r}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemoveSegment(segment.id)}
                    className="p-1 hover:bg-zinc-700 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Segment Button / Form */}
        {!showCreator ? (
          <button
            onClick={() => setShowCreator(true)}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-zinc-600 hover:border-orange-500 text-zinc-400 hover:text-orange-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-display font-bold">CREATE SEGMENT</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-zinc-800 border-2 border-orange-500/50 space-y-4"
          >
            <h3 className="font-display font-bold text-orange-400">NEW SEGMENT</h3>

            {/* Content Type */}
            <div>
              <label className="text-xs font-display text-zinc-400 mb-2 block">CONTENT TYPE</label>
              <select
                value={newContent}
                onChange={(e) => setNewContent(e.target.value as ContentType)}
                className="w-full bg-zinc-900 border border-zinc-600 p-2 text-zinc-100"
              >
                {CONTENT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {CONTENT_TYPE_INFO[ct].name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 mt-1">{CONTENT_TYPE_INFO[newContent].description}</p>
            </div>

            {/* Delivery Type */}
            <div>
              <label className="text-xs font-display text-zinc-400 mb-2 block">DELIVERY TYPE</label>
              <select
                value={newDelivery}
                onChange={(e) => setNewDelivery(e.target.value as DeliveryType)}
                className="w-full bg-zinc-900 border border-zinc-600 p-2 text-zinc-100"
              >
                {DELIVERY_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {DELIVERY_TYPE_INFO[dt].name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 mt-1">{DELIVERY_TYPE_INFO[newDelivery].description}</p>
            </div>

            {/* Performance Type */}
            <div>
              <label className="text-xs font-display text-zinc-400 mb-2 block">PERFORMANCE TYPE</label>
              <select
                value={newPerformance}
                onChange={(e) => setNewPerformance(e.target.value as PerformanceType)}
                className="w-full bg-zinc-900 border border-zinc-600 p-2 text-zinc-100"
              >
                {PERFORMANCE_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {PERFORMANCE_TYPE_INFO[pt].name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500 mt-1">{PERFORMANCE_TYPE_INFO[newPerformance].description}</p>
            </div>

            {/* Toggles */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsFreestyle}
                  onChange={(e) => setNewIsFreestyle(e.target.checked)}
                  className="w-4 h-4 accent-yellow-500"
                />
                <span className="text-sm text-zinc-300">Freestyle (no writing needed)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsCounter}
                  onChange={(e) => setNewIsCounter(e.target.checked)}
                  className="w-4 h-4 accent-red-500"
                />
                <span className="text-sm text-zinc-300">Counter Segment</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddSegment}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold py-2 transition-colors"
              >
                ADD SEGMENT
              </button>
              <button
                onClick={() => setShowCreator(false)}
                className="px-4 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-display font-bold py-2 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
