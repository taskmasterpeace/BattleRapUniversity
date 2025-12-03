"use client"

import { useState } from "react"
import type { PrepSegment, PrepCounter } from "@/lib/types"
import { CONTENT_TYPE_INFO, CONTENT_TYPES, type ContentType } from "@/lib/round-crafting"
import { Target, Plus, Trash2, AlertTriangle, CheckCircle, Lock } from "lucide-react"

interface CounterSlotManagerProps {
  battleId: string
  segments: PrepSegment[]
  counters: PrepCounter[]
  maxCounterSlots: number // Default 1, badges can increase
  onAddCounter: (counter: Omit<PrepCounter, "id">) => void
  onRemoveCounter: (counterId: string) => void
}

export function CounterSlotManager({
  battleId,
  segments,
  counters,
  maxCounterSlots,
  onAddCounter,
  onRemoveCounter,
}: CounterSlotManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [anticipatedContent, setAnticipatedContent] = useState<ContentType>("personals")
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>("")

  // Get counter segments (segments marked as counters that aren't already assigned to a counter)
  const availableCounterSegments = segments.filter((s) => s.isCounter && !counters.some((c) => c.segmentId === s.id))

  const usedSlots = counters.length
  const hasAvailableSlot = usedSlots < maxCounterSlots

  const handleAddCounter = () => {
    if (!selectedSegmentId || !anticipatedContent) return

    onAddCounter({
      battleId,
      anticipatedContent,
      segmentId: selectedSegmentId,
    })

    setShowForm(false)
    setSelectedSegmentId("")
    setAnticipatedContent("personals")
  }

  return (
    <div className="border-2 border-red-500/30 bg-red-500/5">
      {/* Header */}
      <div className="px-4 py-3 border-b border-red-500/30 bg-red-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-red-400" />
          <h3 className="font-display font-bold text-zinc-100">COUNTER PREPARATION</h3>
        </div>
        <span className="text-sm font-mono text-red-400">
          {usedSlots}/{maxCounterSlots} SLOTS
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Box */}
        <div className="p-3 bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-400 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span>
              If opponent uses anticipated content: <strong className="text-green-400">1.5x multiplier</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>
              If opponent doesn't use it: <strong className="text-red-400">0.5x multiplier</strong>
            </span>
          </div>
        </div>

        {/* Existing Counters */}
        {counters.map((counter) => {
          const segment = segments.find((s) => s.id === counter.segmentId)
          return (
            <div key={counter.id} className="p-4 bg-zinc-900 border border-red-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display text-zinc-400">COUNTER SLOT</span>
                <button
                  onClick={() => onRemoveCounter(counter.id)}
                  className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">IF OPPONENT USES:</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold">
                    {CONTENT_TYPE_INFO[counter.anticipatedContent as ContentType]?.name || counter.anticipatedContent}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">MY COUNTER:</span>
                  {segment && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold">
                      {CONTENT_TYPE_INFO[segment.contentType as ContentType]?.name || segment.contentType}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-zinc-700">
                <div className="p-2 bg-green-500/10 border border-green-500/30">
                  <div className="text-lg font-bold text-green-400">1.5x</div>
                  <div className="text-xs text-zinc-500">If Triggered</div>
                </div>
                <div className="p-2 bg-red-500/10 border border-red-500/30">
                  <div className="text-lg font-bold text-red-400">0.5x</div>
                  <div className="text-xs text-zinc-500">If Missed</div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add Counter Form */}
        {showForm && hasAvailableSlot ? (
          <div className="p-4 bg-zinc-800 border-2 border-red-500/50 space-y-4">
            <h4 className="font-display font-bold text-red-400">NEW COUNTER</h4>

            {availableCounterSegments.length === 0 ? (
              <div className="p-3 bg-zinc-900 border border-zinc-700 text-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">No counter segments available.</p>
                <p className="text-xs text-zinc-500 mt-1">Create a segment with "Counter" enabled first.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs text-zinc-500 mb-2 block">ANTICIPATING OPPONENT TO USE:</label>
                  <select
                    value={anticipatedContent}
                    onChange={(e) => setAnticipatedContent(e.target.value as ContentType)}
                    className="w-full bg-zinc-900 border border-zinc-600 p-2 text-zinc-100"
                  >
                    {CONTENT_TYPES.map((ct) => (
                      <option key={ct} value={ct}>
                        {CONTENT_TYPE_INFO[ct].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 mb-2 block">SELECT COUNTER SEGMENT:</label>
                  <select
                    value={selectedSegmentId}
                    onChange={(e) => setSelectedSegmentId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-600 p-2 text-zinc-100"
                  >
                    <option value="">Choose a counter segment...</option>
                    {availableCounterSegments.map((seg) => (
                      <option key={seg.id} value={seg.id}>
                        {CONTENT_TYPE_INFO[seg.contentType as ContentType]?.name} - {seg.deliveryType}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddCounter}
                    disabled={!selectedSegmentId}
                    className={`flex-1 py-2 font-display font-bold transition-colors ${
                      selectedSegmentId
                        ? "bg-red-600 hover:bg-red-500 text-white"
                        : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    ADD COUNTER
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-display font-bold transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </>
            )}
          </div>
        ) : hasAvailableSlot ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-display font-bold">ADD COUNTER</span>
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-zinc-700 text-zinc-500">
            <Lock className="w-5 h-5" />
            <span className="font-display font-bold">ALL COUNTER SLOTS USED</span>
          </div>
        )}

        {/* Badge Info */}
        {maxCounterSlots === 1 && (
          <p className="text-xs text-zinc-500 text-center">
            Earn the "Prepared" badge for +1 counter slot, or "Over-Preparer" for +2 slots.
          </p>
        )}
      </div>
    </div>
  )
}
