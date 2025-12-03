"use client"

import type { FocusType } from "@/lib/types"
import { focusColors, focusLabels, focusIcons, focusDescriptions, focusTextColors } from "./focus-legend"
import { X, Check } from "lucide-react"

interface DayDetailPanelProps {
  day: number
  currentFocus: FocusType | null
  onFocusSelect: (focus: FocusType) => void
  onClose: () => void
  isLocked?: boolean
}

const focusEffects: Record<FocusType, { stat: string; value: string; color: string }[]> = {
  research: [
    { stat: "Angle Bonus", value: "+ANGLES", color: "text-blue-500" },
    { stat: "Rebuttal Prep", value: "+1.0", color: "text-blue-500" },
  ],
  writing: [
    { stat: "Lyricism", value: "+1.5", color: "text-green-500" },
    { stat: "Wordplay", value: "+1.2", color: "text-green-500" },
    { stat: "Creativity", value: "+0.8", color: "text-green-500" },
    { stat: "Stress", value: "+2", color: "text-red-500" },
  ],
  performance: [
    { stat: "Stage Presence", value: "+1.0", color: "text-green-500" },
    { stat: "Delivery", value: "+0.8", color: "text-green-500" },
    { stat: "Crowd Control", value: "+0.5", color: "text-green-500" },
    { stat: "Stress", value: "+3", color: "text-red-500" },
  ],
  life: [
    { stat: "Financial", value: "+0.5", color: "text-green-500" },
    { stat: "Family Bond", value: "+0.3", color: "text-green-500" },
    { stat: "Stress", value: "-3", color: "text-green-500" },
  ],
  rest: [
    { stat: "Resilience", value: "+0.5", color: "text-green-500" },
    { stat: "Stress", value: "-5", color: "text-green-500" },
    { stat: "Choke Risk", value: "-1%", color: "text-green-500" },
  ],
}

const allFocusTypes: FocusType[] = ["research", "writing", "performance", "life", "rest"]

export function DayDetailPanel({ day, currentFocus, onFocusSelect, onClose, isLocked }: DayDetailPanelProps) {
  return (
    <div className="bg-zinc-900 border-2 border-zinc-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-zinc-700 bg-zinc-800">
        <h2 className="text-lg font-display font-bold text-zinc-100 tracking-wide">DAY {day}</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <h3 className="text-sm font-display font-bold text-zinc-400 tracking-wide">SELECT DAILY FOCUS:</h3>

        {/* Focus options as radio buttons */}
        <div className="space-y-2">
          {allFocusTypes.map((focus) => {
            const isSelected = currentFocus === focus
            const effects = focusEffects[focus]

            return (
              <button
                key={focus}
                onClick={() => !isLocked && onFocusSelect(focus)}
                disabled={isLocked}
                className={`
                  w-full text-left p-3 border-2 transition-all
                  ${
                    isSelected
                      ? `${focusColors[focus].replace("bg-", "border-")} bg-zinc-800`
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                  }
                  ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Radio indicator */}
                  <div
                    className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0
                    ${isSelected ? focusColors[focus].replace("bg-", "border-") : "border-zinc-600"}
                  `}
                  >
                    {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${focusColors[focus]}`} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Focus name with icon */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{focusIcons[focus]}</span>
                      <span
                        className={`text-sm font-display font-bold tracking-wide ${isSelected ? focusTextColors[focus] : "text-zinc-100"}`}
                      >
                        {focusLabels[focus]}
                        {isSelected && <span className="text-zinc-500 ml-2">(SELECTED)</span>}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-zinc-400 mt-1">{focusDescriptions[focus]}</p>

                    {/* Effects */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {effects.map((effect, i) => (
                        <span key={i} className="text-xs">
                          <span className="text-zinc-500">→ </span>
                          <span className="text-zinc-400">{effect.stat} </span>
                          <span className={effect.color}>{effect.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Confirm/Cancel buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={!currentFocus}
            className={`
              flex-1 py-3 text-sm font-display font-bold tracking-wide transition-colors
              ${
                currentFocus
                  ? "bg-orange-600 hover:bg-orange-500 text-white"
                  : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
              }
            `}
          >
            <Check className="w-4 h-4 inline-block mr-2" />
            CONFIRM
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}
