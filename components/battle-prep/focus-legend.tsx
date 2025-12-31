"use client"

import type { FocusType } from "@/lib/types"

const focusColors: Record<FocusType, string> = {
  research: "bg-blue-500",
  writing: "bg-orange-500",
  performance: "bg-purple-500",
  life: "bg-green-500",
  rest: "bg-teal-500",
}

const focusBorderColors: Record<FocusType, string> = {
  research: "border-blue-500",
  writing: "border-orange-500",
  performance: "border-purple-500",
  life: "border-green-500",
  rest: "border-teal-500",
}

const focusBgColors: Record<FocusType, string> = {
  research: "bg-blue-500/20",
  writing: "bg-orange-500/20",
  performance: "bg-purple-500/20",
  life: "bg-green-500/20",
  rest: "bg-teal-500/20",
}

const focusTextColors: Record<FocusType, string> = {
  research: "text-blue-500",
  writing: "text-orange-500",
  performance: "text-purple-500",
  life: "text-green-500",
  rest: "text-teal-500",
}

const focusLabels: Record<FocusType, string> = {
  research: "STUDY ANGLES",
  writing: "WRITE BARS",
  performance: "REHEARSE",
  life: "LIFE",
  rest: "REST",
}

const focusIcons: Record<FocusType, string> = {
  research: "🔬",
  writing: "📝",
  performance: "🎤",
  life: "🏠",
  rest: "😴",
}

const focusDescriptions: Record<FocusType, string> = {
  research: "Study your opponent - dig for angles, find weaknesses, prepare rebuttals",
  writing: "Craft your bars - schemes, punchlines, haymakers, personals",
  performance: "Rehearse your delivery - projection, cadence, crowd control",
  life: "Handle your business - family, finances, mental health",
  rest: "Recover and reset - avoid burnout, stay sharp for battle day",
}

export function FocusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-6 px-3 sm:px-4 py-3 bg-zinc-900/50 border border-zinc-800">
      <span className="text-xs sm:text-sm font-display font-semibold text-zinc-400 tracking-wide">FOCUS:</span>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {(Object.keys(focusColors) as FocusType[]).map((focus) => (
          <div key={focus} className="flex items-center gap-1 sm:gap-2">
            <div className={`w-3 h-3 ${focusColors[focus]}`} />
            <span className="text-xs font-semibold text-zinc-300 tracking-wide">{focusLabels[focus]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { focusColors, focusBorderColors, focusBgColors, focusTextColors, focusLabels, focusIcons, focusDescriptions }
