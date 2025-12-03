"use client"

import type { DayPlan } from "@/lib/types"
import { focusBorderColors, focusBgColors, focusIcons, focusLabels } from "./focus-legend"
import { Lock } from "lucide-react"

interface PrepCalendarProps {
  days: DayPlan[]
  totalPrepDays: number
  onDayClick: (day: number) => void
  selectedDay: number | null
  isLocked?: boolean
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export function PrepCalendar({ days, totalPrepDays, onDayClick, selectedDay, isLocked }: PrepCalendarProps) {
  // Calculate how many weeks we need (ceil of totalPrepDays / 7)
  const weeks = Math.ceil(totalPrepDays / 7)

  // Create grid cells for each day
  const gridCells = []
  for (let i = 0; i < weeks * 7; i++) {
    const dayNumber = i + 1
    const dayData = days.find((d) => d.day === dayNumber)
    const isValidDay = dayNumber <= totalPrepDays
    gridCells.push({ dayNumber, dayData, isValidDay })
  }

  return (
    <div className="bg-zinc-900 border-2 border-zinc-700">
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-zinc-700 bg-zinc-800">
        <h2 className="text-lg font-display font-bold text-zinc-100 tracking-wide">PREP CALENDAR</h2>
      </div>

      <div className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-display font-bold text-zinc-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {gridCells.map(({ dayNumber, dayData, isValidDay }) => {
            if (!isValidDay) {
              return (
                <div key={dayNumber} className="aspect-square bg-zinc-900/30 border border-zinc-800/50 opacity-30" />
              )
            }

            const focus = dayData?.focus
            const isSelected = selectedDay === dayNumber
            const bgColor = focus ? focusBgColors[focus] : "bg-zinc-800"
            const borderColor = isSelected
              ? "border-orange-500 border-2"
              : focus
                ? `${focusBorderColors[focus]} border`
                : "border-zinc-700 border border-dashed"

            return (
              <button
                key={dayNumber}
                onClick={() => !isLocked && onDayClick(dayNumber)}
                disabled={isLocked}
                className={`
                  aspect-square ${bgColor} ${borderColor} 
                  flex flex-col items-center justify-center gap-0.5
                  transition-all cursor-pointer hover:border-orange-400
                  ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
                  ${isSelected ? "ring-2 ring-orange-500/50" : ""}
                `}
                title={focus ? `Day ${dayNumber}: ${focusLabels[focus]}` : `Day ${dayNumber}: Not set`}
              >
                {/* Day number */}
                <span className="text-xs sm:text-sm font-display font-bold text-zinc-100">{dayNumber}</span>

                {/* Focus icon or lock */}
                {isLocked ? (
                  <Lock className="w-3 h-3 text-zinc-500" />
                ) : focus ? (
                  <span className="text-sm sm:text-base">{focusIcons[focus]}</span>
                ) : (
                  <span className="text-[10px] text-zinc-600">-</span>
                )}

                {/* Focus label (only on larger screens) */}
                {focus && (
                  <span
                    className={`hidden sm:block text-[8px] font-bold ${focus ? `text-${focus === "research" ? "blue" : focus === "writing" ? "orange" : focus === "performance" ? "purple" : focus === "life" ? "green" : "teal"}-400` : "text-zinc-500"}`}
                  >
                    {focusLabels[focus].slice(0, 3)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
