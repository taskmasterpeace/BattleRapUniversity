"use client"

import { Search, FileText, Mic } from "lucide-react"

interface PrepProgressBarsProps {
  research: { percent: number; label: string }
  writing: { percent: number; label: string }
  rehearsal: { percent: number; label: string }
  compact?: boolean
}

export function PrepProgressBars({ research, writing, rehearsal, compact = false }: PrepProgressBarsProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-4">
        {/* Research - Compact */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-bold text-blue-400">R</span>
          <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all" style={{ width: `${research.percent}%` }} />
          </div>
          <span className="text-xs text-zinc-400 w-8">{research.percent}%</span>
        </div>

        {/* Writing - Compact */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-bold text-green-400">W</span>
          <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full transition-all" style={{ width: `${writing.percent}%` }} />
          </div>
          <span className="text-xs text-zinc-400 w-8">{writing.percent}%</span>
        </div>

        {/* Rehearsal - Compact */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-bold text-purple-400">H</span>
          <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full transition-all" style={{ width: `${rehearsal.percent}%` }} />
          </div>
          <span className="text-xs text-zinc-400 w-8">{rehearsal.percent}%</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Research */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 w-24">
          <Search className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-zinc-500 uppercase font-bold">Research</span>
        </div>
        <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full transition-all" style={{ width: `${research.percent}%` }} />
        </div>
        <span className="text-xs text-zinc-400 w-24 text-right">
          {research.percent}% • {research.label}
        </span>
      </div>

      {/* Writing */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 w-24">
          <FileText className="w-4 h-4 text-green-400" />
          <span className="text-xs text-zinc-500 uppercase font-bold">Writing</span>
        </div>
        <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div className="bg-green-500 h-full transition-all" style={{ width: `${writing.percent}%` }} />
        </div>
        <span className="text-xs text-zinc-400 w-24 text-right">
          {writing.percent}% • {writing.label}
        </span>
      </div>

      {/* Rehearsal */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 w-24">
          <Mic className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-zinc-500 uppercase font-bold">Rehearsal</span>
        </div>
        <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div className="bg-purple-500 h-full transition-all" style={{ width: `${rehearsal.percent}%` }} />
        </div>
        <span className="text-xs text-zinc-400 w-24 text-right">
          {rehearsal.percent}% • {rehearsal.label}
        </span>
      </div>
    </div>
  )
}
