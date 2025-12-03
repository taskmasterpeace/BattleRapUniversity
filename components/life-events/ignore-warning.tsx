"use client"

import { AlertTriangle } from "lucide-react"
import type { Effect } from "@/lib/life-events"
import { EffectPreview } from "./effect-preview"

interface IgnoreWarningProps {
  effects: Effect[]
  deadline?: string
}

export function IgnoreWarning({ effects, deadline }: IgnoreWarningProps) {
  return (
    <div className="bg-red-900/20 border border-red-600/50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-display font-bold text-red-500 mb-2">WHAT HAPPENS IF YOU IGNORE THIS</h4>
          {deadline && (
            <p className="text-xs text-zinc-400 mb-3">
              If not resolved by {new Date(deadline).toLocaleDateString()}, the following will automatically apply:
            </p>
          )}
          <EffectPreview effects={effects} />
        </div>
      </div>
    </div>
  )
}
