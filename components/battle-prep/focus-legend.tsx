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
  research: "RESEARCH",
  writing: "WRITING",
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
  research: "Study opponent, find angles, dig up info",
  writing: "Write bars, schemes, punchlines",
  performance: "Practice delivery, memorize material",
  life: "Handle personal stuff, reduce stress",
  rest: "Recover, mental prep, avoid burnout",
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
