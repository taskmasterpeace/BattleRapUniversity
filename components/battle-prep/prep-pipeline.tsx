"use client"

import type { ResearchLevel } from "@/lib/types"
import { ArrowRight, Search, FileText, Mic, AlertTriangle, CheckCircle } from "lucide-react"

interface PrepPipelineProps {
  research: {
    level: ResearchLevel
    percent: number
  }
  writing: {
    segmentsWritten: number
    segmentsNeeded: number
    percent: number
  }
  rehearsal: {
    roundsRehearsed: number[]
    totalRounds: number
    percent: number
  }
}

const STAGE_STATUS = {
  notStarted: {
    border: "border-zinc-700",
    bg: "bg-[#2d2f35]",
    text: "text-zinc-500",
  },
  inProgress: {
    border: "border-orange-500",
    bg: "bg-[#2d2f35]",
    text: "text-orange-400",
  },
  complete: {
    border: "border-green-600",
    bg: "bg-green-500/10",
    text: "text-green-400",
  },
}

export function PrepPipeline({ research, writing, rehearsal }: PrepPipelineProps) {
  const getResearchStatus = () => {
    if (research.level === "aggressive") return "complete"
    if (research.level === "casual" || research.percent > 0) return "inProgress"
    return "notStarted"
  }

  const getWritingStatus = () => {
    if (writing.percent >= 100) return "complete"
    if (writing.percent > 0) return "inProgress"
    return "notStarted"
  }

  const getRehearsalStatus = () => {
    if (rehearsal.percent >= 100) return "complete"
    if (rehearsal.percent > 0) return "inProgress"
    return "notStarted"
  }

  const researchStatus = getResearchStatus()
  const writingStatus = getWritingStatus()
  const rehearsalStatus = getRehearsalStatus()

  // Generate tips based on current state
  const tips: string[] = []
  if (research.level === "none") {
    tips.push("Research enables better personals and angles")
  }
  if (writing.segmentsWritten < writing.segmentsNeeded) {
    const remaining = writing.segmentsNeeded - writing.segmentsWritten
    tips.push(`${remaining} more segment${remaining !== 1 ? "s" : ""} needed for all rounds`)
  }
  if (rehearsal.roundsRehearsed.length < rehearsal.totalRounds && writing.percent >= 100) {
    const unrehearsed = Array.from({ length: rehearsal.totalRounds }, (_, i) => i + 1).filter(
      (r) => !rehearsal.roundsRehearsed.includes(r),
    )
    tips.push(`Round${unrehearsed.length > 1 ? "s" : ""} ${unrehearsed.join(", ")} not rehearsed yet`)
  }

  return (
    <div className="border-2 border-[#3a3d44] bg-[#2d2f35] p-4">
      <h3 className="font-display font-bold text-zinc-100 mb-4">PREP PIPELINE</h3>

      {/* Pipeline Stages */}
      <div className="flex items-center justify-between gap-2">
        {/* Research Stage */}
        <div
          className={`flex-1 border-2 ${STAGE_STATUS[researchStatus].border} ${STAGE_STATUS[researchStatus].bg} rounded-lg p-3 text-center`}
        >
          <Search className={`w-6 h-6 ${STAGE_STATUS[researchStatus].text} mx-auto mb-2`} />
          <div className="text-xs font-display font-bold text-zinc-400 mb-1">RESEARCH</div>
          <div className={`text-sm font-bold ${STAGE_STATUS[researchStatus].text} capitalize`}>{research.level}</div>
          <div className="mt-2 bg-zinc-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all" style={{ width: `${research.percent}%` }} />
          </div>
          <div className="text-xs text-zinc-500 mt-1">{research.percent}%</div>
        </div>

        {/* Arrow */}
        <ArrowRight className="w-5 h-5 text-zinc-600 flex-shrink-0" />

        {/* Writing Stage */}
        <div
          className={`flex-1 border-2 ${STAGE_STATUS[writingStatus].border} ${STAGE_STATUS[writingStatus].bg} rounded-lg p-3 text-center`}
        >
          <FileText className={`w-6 h-6 ${STAGE_STATUS[writingStatus].text} mx-auto mb-2`} />
          <div className="text-xs font-display font-bold text-zinc-400 mb-1">WRITING</div>
          <div className={`text-sm font-bold ${STAGE_STATUS[writingStatus].text}`}>
            {writing.segmentsWritten}/{writing.segmentsNeeded}
          </div>
          <div className="mt-2 bg-zinc-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full transition-all" style={{ width: `${writing.percent}%` }} />
          </div>
          <div className="text-xs text-zinc-500 mt-1">{writing.percent}%</div>
        </div>

        {/* Arrow */}
        <ArrowRight className="w-5 h-5 text-zinc-600 flex-shrink-0" />

        {/* Rehearsal Stage */}
        <div
          className={`flex-1 border-2 ${STAGE_STATUS[rehearsalStatus].border} ${STAGE_STATUS[rehearsalStatus].bg} rounded-lg p-3 text-center`}
        >
          <Mic className={`w-6 h-6 ${STAGE_STATUS[rehearsalStatus].text} mx-auto mb-2`} />
          <div className="text-xs font-display font-bold text-zinc-400 mb-1">REHEARSAL</div>
          <div className={`text-sm font-bold ${STAGE_STATUS[rehearsalStatus].text}`}>
            {rehearsal.roundsRehearsed.length}/{rehearsal.totalRounds} rnds
          </div>
          <div className="mt-2 bg-zinc-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full transition-all" style={{ width: `${rehearsal.percent}%` }} />
          </div>
          <div className="text-xs text-zinc-500 mt-1">{rehearsal.percent}%</div>
        </div>
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="mt-4 space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
              <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* All Complete */}
      {researchStatus === "complete" && writingStatus === "complete" && rehearsalStatus === "complete" && (
        <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-display font-bold text-green-400">PREP COMPLETE - READY FOR BATTLE!</span>
        </div>
      )}
    </div>
  )
}
