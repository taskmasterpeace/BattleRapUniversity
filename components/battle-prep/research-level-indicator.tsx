"use client"

import type { ResearchLevel } from "@/lib/types"
import { Search, User, Eye } from "lucide-react"

interface ResearchLevelIndicatorProps {
  level: ResearchLevel
  daysSpent: number
  className?: string
}

const LEVEL_CONFIG = {
  none: {
    label: "NONE",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30",
    icon: Search,
    description: "Generic angles only. Personals are made up = credibility risk",
    daysNeeded: 0,
  },
  casual: {
    label: "CASUAL",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30",
    icon: User,
    description: "Basic info: city, crew, loss record, public beefs",
    daysNeeded: 1,
  },
  aggressive: {
    label: "AGGRESSIVE",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/30",
    icon: Eye,
    description: "Deep info: family, secrets, embarrassing moments. +20% personals effectiveness",
    daysNeeded: 3,
  },
}

export function ResearchLevelIndicator({ level, daysSpent, className = "" }: ResearchLevelIndicatorProps) {
  const config = LEVEL_CONFIG[level]
  const Icon = config.icon

  return (
    <div className={`border-2 ${config.borderColor} ${config.bgColor} p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <span className="text-sm font-display font-bold text-zinc-300">RESEARCH LEVEL</span>
        </div>
        <span className={`text-lg font-display font-bold ${config.color}`}>{config.label}</span>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-4 h-4 rounded-full border-2 ${daysSpent >= 0 ? "bg-red-500 border-red-400" : "border-zinc-600"}`}
        />
        <div className="w-8 h-0.5 bg-zinc-700" />
        <div
          className={`w-4 h-4 rounded-full border-2 ${daysSpent >= 1 ? "bg-yellow-500 border-yellow-400" : "border-zinc-600"}`}
        />
        <div className="w-8 h-0.5 bg-zinc-700" />
        <div
          className={`w-4 h-4 rounded-full border-2 ${daysSpent >= 3 ? "bg-green-500 border-green-400" : "border-zinc-600"}`}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
        <span>None</span>
        <span>Casual (1+ days)</span>
        <span>Aggressive (3+ days)</span>
      </div>

      <p className="text-sm text-zinc-400">{config.description}</p>

      <div className="mt-3 text-xs text-zinc-500">
        {daysSpent} day{daysSpent !== 1 ? "s" : ""} of research completed
      </div>
    </div>
  )
}
