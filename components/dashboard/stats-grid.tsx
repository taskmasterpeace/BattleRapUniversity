"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { Battler } from "@/lib/types"

interface StatsGridProps {
  battler: Battler
}

function StatBar({ value, max = 10, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex gap-px flex-1 min-w-0">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`flex-1 h-2.5 min-w-0 ${i < value ? color : "bg-zinc-700"}`} />
      ))}
    </div>
  )
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs text-zinc-400 font-display w-28 shrink-0">{label}</span>
      <StatBar value={value} color={color} />
      <span className="text-xs text-zinc-300 font-mono w-4 text-right shrink-0">{value}</span>
    </div>
  )
}

function getGrade(average: number): { grade: string; color: string } {
  if (average >= 8) return { grade: "S", color: "text-amber-400" }
  if (average >= 7) return { grade: "A", color: "text-green-500" }
  if (average >= 6) return { grade: "B", color: "text-blue-500" }
  if (average >= 5) return { grade: "C", color: "text-yellow-500" }
  if (average >= 4) return { grade: "D", color: "text-orange-500" }
  return { grade: "F", color: "text-red-500" }
}

export function StatsGrid({ battler }: StatsGridProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    writing: true,
    performance: false,
    personal: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const attrs = battler.attributes || {
    wordplay: 5,
    punchlines: 5,
    schemes: 5,
    delivery: 5,
    presence: 5,
    crowdControl: 5,
    authenticity: 5,
    battleIQ: 5,
  }

  // Calculate averages for each category
  const writingAvg = ((attrs.wordplay || 5) + (attrs.punchlines || 5) + (attrs.schemes || 5)) / 3
  const performanceAvg = ((attrs.delivery || 5) + (attrs.presence || 5) + (attrs.crowdControl || 5)) / 3
  const personalAvg = ((attrs.authenticity || 5) + (attrs.battleIQ || 5)) / 2

  const writingGrade = getGrade(writingAvg)
  const performanceGrade = getGrade(performanceAvg)
  const personalGrade = getGrade(personalAvg)

  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-3 sm:p-4 overflow-hidden min-w-0">
      <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-3">ATTRIBUTES</h3>

      <div className="space-y-3">
        {/* Writing Section */}
        <div>
          <button
            onClick={() => toggleSection("writing")}
            className="flex items-center gap-2 w-full hover:bg-zinc-800/50 p-2 -m-2 rounded transition-colors"
          >
            <span className="text-base">📝</span>
            <span className="text-xs font-display font-bold text-orange-500 tracking-wide">WRITING</span>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-zinc-400">{writingAvg.toFixed(1)}</span>
              <span className={`text-base font-bold ${writingGrade.color}`}>{writingGrade.grade}</span>
              {expandedSections.writing ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
            </div>
          </button>
          {expandedSections.writing && (
            <div className="space-y-1.5 pl-6 mt-2">
              <StatRow label="Wordplay" value={attrs.wordplay || 5} color="bg-orange-500" />
              <StatRow label="Punchlines" value={attrs.punchlines || 5} color="bg-orange-500" />
              <StatRow label="Schemes" value={attrs.schemes || 5} color="bg-orange-500" />
            </div>
          )}
        </div>

        {/* Performance Section */}
        <div>
          <button
            onClick={() => toggleSection("performance")}
            className="flex items-center gap-2 w-full hover:bg-zinc-800/50 p-2 -m-2 rounded transition-colors"
          >
            <span className="text-base">🎭</span>
            <span className="text-xs font-display font-bold text-purple-500 tracking-wide">PERFORMANCE</span>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-zinc-400">{performanceAvg.toFixed(1)}</span>
              <span className={`text-base font-bold ${performanceGrade.color}`}>{performanceGrade.grade}</span>
              {expandedSections.performance ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
            </div>
          </button>
          {expandedSections.performance && (
            <div className="space-y-1.5 pl-6 mt-2">
              <StatRow label="Delivery" value={attrs.delivery || 5} color="bg-purple-500" />
              <StatRow label="Stage Presence" value={attrs.presence || 5} color="bg-purple-500" />
              <StatRow label="Crowd Control" value={attrs.crowdControl || 5} color="bg-purple-500" />
            </div>
          )}
        </div>

        {/* Personal Section */}
        <div>
          <button
            onClick={() => toggleSection("personal")}
            className="flex items-center gap-2 w-full hover:bg-zinc-800/50 p-2 -m-2 rounded transition-colors"
          >
            <span className="text-base">👤</span>
            <span className="text-xs font-display font-bold text-green-500 tracking-wide">MENTAL</span>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-zinc-400">{personalAvg.toFixed(1)}</span>
              <span className={`text-base font-bold ${personalGrade.color}`}>{personalGrade.grade}</span>
              {expandedSections.personal ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
            </div>
          </button>
          {expandedSections.personal && (
            <div className="space-y-1.5 pl-6 mt-2">
              <StatRow label="Authenticity" value={attrs.authenticity || 5} color="bg-green-500" />
              <StatRow label="Battle IQ" value={attrs.battleIQ || 5} color="bg-green-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
