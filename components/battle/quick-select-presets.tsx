"use client"

import { Zap, Mic, Laugh, Scale } from "lucide-react"
import { cn } from "@/lib/utils"
import { QUICK_PRESETS, type RoundSelections } from "@/lib/round-crafting"

interface QuickSelectPresetsProps {
  onSelect: (selections: RoundSelections) => void
  currentSelections?: RoundSelections
}

const PRESET_ICONS = {
  tech_heavy: Mic,
  street_mode: Zap,
  entertainment: Laugh,
  balanced: Scale,
}

export function QuickSelectPresets({ onSelect, currentSelections }: QuickSelectPresetsProps) {
  return (
    <div className="border border-zinc-700 bg-zinc-900 p-3 sm:p-4">
      <h3 className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 mb-2 sm:mb-3">
        Quick Presets
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        {QUICK_PRESETS.map((preset) => {
          const Icon = PRESET_ICONS[preset.id as keyof typeof PRESET_ICONS] || Zap

          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.selections)}
              className={cn(
                "p-2 sm:p-3 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700",
                "text-left transition-colors active:scale-95",
              )}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mb-1 sm:mb-2" />
              <p className="font-bold text-xs sm:text-sm text-white truncate">{preset.name}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 line-clamp-1 hidden sm:block">{preset.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
