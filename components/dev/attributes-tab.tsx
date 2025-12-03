"use client"

import { Sliders } from "lucide-react"

interface AttributesTabProps {
  attributes: Record<string, number>
  setAttributes: (attrs: Record<string, number>) => void
}

export function AttributesTab({ attributes, setAttributes }: AttributesTabProps) {
  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
      <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
        <Sliders className="w-4 h-4" /> ATTRIBUTE OVERRIDE
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(attributes).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-zinc-400 uppercase">{key.replace(/([A-Z])/g, " $1")}</label>
              <span className="text-xs font-mono text-orange-400">{value}/8</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={value}
              onChange={(e) => setAttributes({ ...attributes, [key]: Number(e.target.value) })}
              className="w-full accent-orange-500"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setAttributes(Object.fromEntries(Object.keys(attributes).map((k) => [k, 8])))}
          className="flex-1 py-2 bg-green-500/20 border border-green-500/50 text-green-400 text-sm font-display"
        >
          MAX ALL
        </button>
        <button
          onClick={() => setAttributes(Object.fromEntries(Object.keys(attributes).map((k) => [k, 5])))}
          className="flex-1 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 text-sm font-display"
        >
          RESET TO DEFAULT
        </button>
      </div>
    </div>
  )
}
