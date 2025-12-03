"use client"

import { Database } from "lucide-react"

interface DebugLogProps {
  logs: string[]
  onClear: () => void
}

export function DebugLog({ logs, onClear }: DebugLogProps) {
  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide flex items-center gap-2">
          <Database className="w-4 h-4" /> DEBUG LOG
        </h2>
        <button onClick={onClear} className="text-xs text-zinc-500 hover:text-zinc-300">
          Clear
        </button>
      </div>
      <div className="bg-zinc-950 border border-zinc-800 p-3 h-64 overflow-y-auto font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-zinc-600">No logs yet.</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={log.startsWith("  ->") ? "text-zinc-500 pl-2" : "text-zinc-300"}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
