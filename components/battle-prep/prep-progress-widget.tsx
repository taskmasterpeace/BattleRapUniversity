"use client"

import Link from "next/link"
import type { ResearchLevel } from "@/lib/types"
import { Swords, Clock, FileText, Mic2, CheckCircle, AlertTriangle, Target } from "lucide-react"

interface PrepProgressWidgetProps {
  battleId: string
  opponentName: string
  opponentAvatar?: string
  league: string
  daysUntilBattle: number
  daysUntilPrepLock: number
  research: {
    level: ResearchLevel
    days: number
  }
  writing: {
    completed: number
    needed: number
  }
  rehearsal: {
    roundsRehearsed: number[]
    totalRounds: number
  }
  rounds: {
    roundNum: number
    segmentsAssigned: number
    segmentsNeeded: number
  }[]
  counters: {
    used: number
    available: number
  }
}

export function PrepProgressWidget({
  battleId,
  opponentName,
  opponentAvatar,
  league,
  daysUntilBattle,
  daysUntilPrepLock,
  research,
  writing,
  rehearsal,
  rounds,
  counters,
}: PrepProgressWidgetProps) {
  const writingPercent = Math.round((writing.completed / writing.needed) * 100)
  const rehearsalPercent = Math.round((rehearsal.roundsRehearsed.length / rehearsal.totalRounds) * 100)

  return (
    <div className="bg-zinc-900 border-2 border-zinc-700">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b-2 border-zinc-700 bg-zinc-800">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-bold text-zinc-100 text-sm sm:text-base">ACTIVE BATTLE PREP</h3>
          <div className="flex items-center gap-1 sm:gap-2 text-orange-400">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-mono">{daysUntilBattle}D</span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Opponent Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {opponentAvatar ? (
            <img
              src={opponentAvatar || "/placeholder.svg"}
              alt={opponentName}
              className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-zinc-600"
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center flex-shrink-0">
              <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-zinc-100 text-sm sm:text-base truncate">VS {opponentName}</div>
            <div className="text-xs sm:text-sm text-zinc-500 truncate">{league}</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2 sm:space-y-3">
          {/* Research */}
          <div>
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
              <span className="text-blue-400 flex items-center gap-1">
                <Target className="w-3 h-3" /> Research
              </span>
              <span
                className={
                  research.level === "aggressive"
                    ? "text-green-400"
                    : research.level === "casual"
                      ? "text-yellow-400"
                      : "text-red-400"
                }
              >
                {research.level.toUpperCase()}
              </span>
            </div>
            <div className="h-1.5 sm:h-2 bg-zinc-800 border border-zinc-700">
              <div
                className={`h-full transition-all ${
                  research.level === "aggressive"
                    ? "bg-green-500"
                    : research.level === "casual"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${research.level === "aggressive" ? 100 : research.level === "casual" ? 50 : 10}%` }}
              />
            </div>
          </div>

          {/* Writing */}
          <div>
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
              <span className="text-orange-400 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Writing
              </span>
              <span className="text-zinc-300">
                {writing.completed}/{writing.needed}
              </span>
            </div>
            <div className="h-1.5 sm:h-2 bg-zinc-800 border border-zinc-700">
              <div
                className={`h-full transition-all ${writingPercent >= 100 ? "bg-green-500" : "bg-orange-500"}`}
                style={{ width: `${Math.min(writingPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Rehearsal */}
          <div>
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
              <span className="text-purple-400 flex items-center gap-1">
                <Mic2 className="w-3 h-3" /> Rehearsal
              </span>
              <span className="text-zinc-300">
                {rehearsal.roundsRehearsed.length}/{rehearsal.totalRounds}
              </span>
            </div>
            <div className="h-1.5 sm:h-2 bg-zinc-800 border border-zinc-700">
              <div
                className={`h-full transition-all ${rehearsalPercent >= 100 ? "bg-green-500" : "bg-purple-500"}`}
                style={{ width: `${Math.min(rehearsalPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Rounds Status */}
        <div className="flex gap-1.5 sm:gap-2">
          {rounds.map((round) => {
            const isReady = round.segmentsAssigned >= round.segmentsNeeded
            return (
              <div
                key={round.roundNum}
                className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-center border ${
                  isReady ? "border-green-500/30 bg-green-500/10" : "border-zinc-700 bg-zinc-800"
                }`}
              >
                <div className="text-[10px] sm:text-xs text-zinc-500">R{round.roundNum}</div>
                <div className={`text-xs sm:text-sm font-mono ${isReady ? "text-green-400" : "text-orange-400"}`}>
                  {round.segmentsAssigned}/{round.segmentsNeeded}
                </div>
                {isReady ? (
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mx-auto mt-0.5 sm:mt-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 mx-auto mt-0.5 sm:mt-1" />
                )}
              </div>
            )
          })}
        </div>

        {/* Counter Status */}
        {counters.available > 0 && (
          <div className="flex items-center justify-between text-xs sm:text-sm p-2 bg-zinc-800 border border-zinc-700">
            <span className="text-red-400">Counters</span>
            <span className="font-mono text-zinc-300">
              {counters.used}/{counters.available}
            </span>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/battle/${battleId}/prep`}
          className="block w-full text-center bg-orange-600 hover:bg-orange-500 py-2.5 sm:py-3 font-display font-bold text-white text-sm sm:text-base transition-colors"
        >
          CONTINUE PREP →
        </Link>
      </div>
    </div>
  )
}
