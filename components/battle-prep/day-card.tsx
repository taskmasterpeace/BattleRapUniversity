"use client"

import type { FocusType, DayPlan } from "@/lib/types"
import { focusColors } from "./focus-legend"
import { ChevronDown } from "lucide-react"

interface DayCardProps {
  day: DayPlan
  onFocusChange: (day: number, focus: FocusType) => void
  onDayClick: (day: number) => void
  isSelected?: boolean
}

const focusOptions: { value: FocusType; label: string }[] = [
  { value: "research", label: "RESEARCH" },
  { value: "writing", label: "WRITING" },
  { value: "performance", label: "PERFORMANCE" },
  { value: "life", label: "LIFE" },
  { value: "rest", label: "REST" },
]

export function DayCard({ day, onFocusChange, onDayClick, isSelected }: DayCardProps) {
  const borderColor = day.focus ? focusColors[day.focus].replace("bg-", "border-") : "border-zinc-700"

  return (
    <div
      className={`bg-zinc-900 border-2 ${isSelected ? "border-orange-500" : borderColor} transition-colors cursor-pointer hover:border-orange-400`}
      onClick={() => onDayClick(day.day)}
    >
      <div className={`px-3 py-2 border-b ${day.focus ? focusColors[day.focus] : "bg-zinc-800"} border-zinc-700`}>
        <span className="text-sm font-display font-bold text-white tracking-wide">DAY {day.day}</span>
      </div>
      <div className="p-2">
        <div className="relative">
          <select
            value={day.focus || ""}
            onChange={(e) => {
              e.stopPropagation()
              onFocusChange(day.day, e.target.value as FocusType)
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-mono py-2 px-3 pr-8 appearance-none cursor-pointer hover:bg-zinc-700 focus:outline-none focus:border-orange-500"
          >
            <option value="">SELECT...</option>
            {focusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
