"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, ChevronDown, ChevronUp } from "lucide-react"
import type { StressState } from "@/lib/life-events"

interface StressWidgetProps {
  stress: StressState
  compact?: boolean
}

function getStatusColors(status: string): { textColor: string; bgColor: string } {
  const statusLower = status.toLowerCase()

  // Handle both old format (calm, focused, anxious, overwhelmed)
  // and new format (relaxed, comfortable, managing, strained, breaking_point)
  if (statusLower === "calm" || statusLower === "relaxed") {
    return { textColor: "text-green-500", bgColor: "bg-green-500" }
  }
  if (statusLower === "focused" || statusLower === "comfortable") {
    return { textColor: "text-blue-500", bgColor: "bg-blue-500" }
  }
  if (statusLower === "managing") {
    return { textColor: "text-yellow-500", bgColor: "bg-yellow-500" }
  }
  if (statusLower === "anxious" || statusLower === "strained") {
    return { textColor: "text-orange-500", bgColor: "bg-orange-500" }
  }
  if (statusLower === "overwhelmed" || statusLower === "breaking_point") {
    return { textColor: "text-red-500", bgColor: "bg-red-500" }
  }

  // Default fallback
  return { textColor: "text-yellow-500", bgColor: "bg-yellow-500" }
}

export function StressWidget({ stress, compact = false }: StressWidgetProps) {
  const [expanded, setExpanded] = useState(false)
  const { textColor, bgColor } = getStatusColors(stress?.status || "managing")
  const stressLevel = stress?.level ?? 50
  const contributingFactors = stress?.contributing_factors ?? []
  const statusDisplay = stress?.status?.replace("_", " ") || "unknown"

  if (compact) {
    return (
      <div className="bg-zinc-900 border-2 border-zinc-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className={`w-4 h-4 ${textColor}`} />
            <span className="text-xs font-display font-bold text-zinc-400">STRESS</span>
          </div>
          <span className={`text-sm font-mono font-bold ${textColor}`}>{stressLevel}/100</span>
        </div>
        <div className="mt-2 h-2 bg-zinc-800 overflow-hidden">
          <motion.div
            className={`h-full ${bgColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${stressLevel}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className={`w-5 h-5 ${textColor}`} />
          <span className="text-sm font-display font-bold text-zinc-100">MENTAL STATE</span>
        </div>
        <span className={`px-2 py-0.5 text-xs font-display font-bold uppercase ${bgColor}/20 ${textColor}`}>
          {statusDisplay}
        </span>
      </div>

      {/* Stress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span>Stress Level</span>
          <span className={`font-mono font-bold ${textColor}`}>{stressLevel}/100</span>
        </div>
        <div className="h-3 bg-zinc-800 overflow-hidden">
          <motion.div
            className={`h-full ${bgColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${stressLevel}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-300 py-2 transition-colors"
      >
        <span>Contributing Factors</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Contributing Factors */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              {contributingFactors.map((factor, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span>{factor.icon}</span>
                    <span className="text-zinc-400">{factor.label}</span>
                  </div>
                  <span className="text-red-500 font-mono">+{factor.stress_amount}</span>
                </div>
              ))}
            </div>

            {/* Relief Options */}
            <div className="mt-4 pt-3 border-t border-zinc-800">
              <h4 className="text-xs font-display font-bold text-zinc-500 mb-2">RELIEF OPTIONS</h4>
              <div className="space-y-1 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  <span>Resolve pending life events</span>
                  <span className="text-green-500 font-mono ml-auto">-15 stress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  <span>Take a rest day</span>
                  <span className="text-green-500 font-mono ml-auto">-5 stress/day</span>
                </div>
              </div>
            </div>

            <Link
              href="/life-events"
              className="block mt-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-center text-xs font-display font-bold text-zinc-300 transition-colors"
            >
              VIEW LIFE EVENTS
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
