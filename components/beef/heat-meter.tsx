"use client"

import { Flame, Thermometer } from "lucide-react"
import { motion } from "framer-motion"

interface HeatMeterProps {
  intensity: number // 0-100
  rematchDemand: number // 0-100
  status: "active" | "dormant" | "resolved"
  compact?: boolean
}

export function HeatMeter({ intensity, rematchDemand, status, compact = false }: HeatMeterProps) {
  // Heat level labels
  const getHeatLevel = (value: number) => {
    if (value >= 90) return { label: "BLOOD FEUD", color: "bg-red-600", textColor: "text-red-400", flames: 5 }
    if (value >= 70) return { label: "HEATED", color: "bg-orange-500", textColor: "text-orange-400", flames: 4 }
    if (value >= 50) return { label: "TENSION", color: "bg-yellow-500", textColor: "text-yellow-400", flames: 3 }
    if (value >= 30) return { label: "BREWING", color: "bg-blue-500", textColor: "text-blue-400", flames: 2 }
    if (value >= 10) return { label: "COLD", color: "bg-zinc-500", textColor: "text-zinc-400", flames: 1 }
    return { label: "NEUTRAL", color: "bg-zinc-700", textColor: "text-zinc-500", flames: 0 }
  }

  const heat = getHeatLevel(intensity)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Flame
              key={i}
              className={`w-3 h-3 ${i < heat.flames ? heat.textColor : "text-zinc-700"}`}
              fill={i < heat.flames ? "currentColor" : "none"}
            />
          ))}
        </div>
        <span className={`text-xs font-mono font-bold ${heat.textColor}`}>
          {intensity}%
        </span>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-display font-bold text-zinc-400 uppercase tracking-wider">
            Beef Heat
          </span>
        </div>
        <span className={`text-xs font-display font-black uppercase ${heat.textColor}`}>
          {heat.label}
        </span>
      </div>

      {/* Heat Bar */}
      <div className="relative h-4 bg-zinc-800 mb-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${intensity}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`absolute inset-y-0 left-0 ${heat.color}`}
        />
        {/* Heat segments */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-zinc-900/50 last:border-r-0"
            />
          ))}
        </div>
        {/* Flame icons */}
        <div className="absolute inset-y-0 right-2 flex items-center gap-0.5">
          {Array.from({ length: heat.flames }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <Flame className="w-3 h-3 text-white/80" fill="currentColor" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-zinc-500">Intensity: </span>
            <span className={`font-mono font-bold ${heat.textColor}`}>{intensity}%</span>
          </div>
          <div>
            <span className="text-zinc-500">Rematch Demand: </span>
            <span className="font-mono font-bold text-orange-400">{rematchDemand}%</span>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-xs font-mono uppercase ${
          status === "active" ? "bg-red-900/30 text-red-400 border border-red-700/50" :
          status === "dormant" ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700/50" :
          "bg-green-900/30 text-green-400 border border-green-700/50"
        }`}>
          {status}
        </span>
      </div>

      {/* Intensity Description */}
      {intensity >= 70 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-red-950/30 border border-red-900/50"
        >
          <p className="text-xs text-red-400">
            <Flame className="w-3 h-3 inline mr-1" />
            {intensity >= 90
              ? "This beef is REAL. Expect fireworks when they battle."
              : "Tensions are high. The crowd will be expecting drama."}
          </p>
        </motion.div>
      )}
    </div>
  )
}
