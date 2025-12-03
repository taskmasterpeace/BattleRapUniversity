"use client"

import type { ImpactPreview, PrepRecommendation } from "@/lib/types"
import { Lightbulb, Check, AlertTriangle } from "lucide-react"

interface PrepAssistantProps {
  recommendations: PrepRecommendation[]
  impact: ImpactPreview
  onCopyLastBattle: () => void
  onBalancedStrategy: () => void
  onGrindStrategy: () => void
}

function StatBar({ value, max = 10, color }: { value: number; max?: number; color: string }) {
  const filled = Math.round((Math.abs(value) / max) * 8)
  return (
    <div className="flex gap-px sm:gap-0.5 flex-1 min-w-0 max-w-[100px] sm:max-w-[120px]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`flex-1 h-3 min-w-0 ${i < filled ? color : "bg-zinc-700"}`} />
      ))}
    </div>
  )
}

export function PrepAssistant({
  recommendations,
  impact,
  onCopyLastBattle,
  onBalancedStrategy,
  onGrindStrategy,
}: PrepAssistantProps) {
  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 py-3 border-b-2 border-zinc-700 bg-zinc-800">
        <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-100 tracking-wide">BATTLE PREP</h2>
        <span className="text-zinc-600 text-xl hidden sm:inline">|</span>
        <span className="text-lg sm:text-xl font-display font-bold text-orange-500 tracking-wide">ASSISTANT</span>
      </div>

      <div className="p-3 sm:p-4 space-y-4">
        {/* Recommendations */}
        <div className="bg-zinc-800/50 border border-zinc-700 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0" />
            <h3 className="text-xs sm:text-sm font-display font-bold text-zinc-100 tracking-wide">
              PREP RECOMMENDATIONS
            </h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2">
                {rec.type === "success" ? (
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : rec.type === "warning" ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                ) : null}
                <p className="text-xs sm:text-sm text-zinc-300 min-w-0">
                  {rec.text}{" "}
                  {rec.highlight && (
                    <span
                      className={`font-bold ${
                        rec.highlight === "WRITING"
                          ? "text-orange-500"
                          : rec.highlight === "REST"
                            ? "text-zinc-400"
                            : rec.highlight === "RESEARCH"
                              ? "text-green-500"
                              : "text-orange-500"
                      }`}
                    >
                      {rec.highlight}
                    </span>
                  )}
                  {rec.action && <span className="text-zinc-400"> {rec.action}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Preview */}
        <div className="bg-zinc-800/50 border border-zinc-700 p-3 sm:p-4 overflow-hidden">
          <h3 className="text-xs sm:text-sm font-display font-bold text-zinc-100 tracking-wide mb-3">
            IMPACT PREVIEW <span className="text-zinc-500 font-normal">(REAL-TIME)</span>
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-xs sm:text-sm text-zinc-400 shrink-0">Lyricism:</span>
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`text-xs sm:text-sm font-mono font-bold shrink-0 ${impact.lyricism >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {impact.lyricism >= 0 ? "+" : ""}
                  {impact.lyricism}
                </span>
                <StatBar value={impact.lyricism} color="bg-orange-500" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-xs sm:text-sm text-zinc-400 shrink-0">Flow:</span>
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`text-xs sm:text-sm font-mono font-bold shrink-0 ${impact.flow >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {impact.flow >= 0 ? "+" : ""}
                  {impact.flow}
                </span>
                <StatBar value={impact.flow} color="bg-orange-500" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-xs sm:text-sm text-zinc-400 shrink-0">Resilience:</span>
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`text-xs sm:text-sm font-mono font-bold shrink-0 ${impact.resilience >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {impact.resilience >= 0 ? "+" : ""}
                  {impact.resilience}
                </span>
                <StatBar
                  value={Math.abs(impact.resilience)}
                  color={impact.resilience >= 0 ? "bg-green-500" : "bg-red-500"}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1 min-w-0">
              <span className="text-xs sm:text-sm text-zinc-400 shrink-0">Stress:</span>
              <span className="text-xs sm:text-sm font-mono">
                <span className="text-zinc-400">{impact.stressChange.from}</span>
                <span className="text-zinc-500"> → </span>
                <span
                  className={`font-bold ${
                    impact.stressChange.to > 60
                      ? "text-red-500"
                      : impact.stressChange.to > 50
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  {impact.stressChange.to}
                </span>
                <span className="text-yellow-500 ml-1">(FOCUSED)</span>
              </span>
            </div>
            <div className="border-t border-zinc-700 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-zinc-400">Predicted Score:</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-zinc-100">
                  {impact.predictedScore} avg
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-zinc-400">Choke Risk:</span>
                <span
                  className={`text-xs sm:text-sm font-mono font-bold ${
                    impact.chokeRisk > 15
                      ? "text-red-500"
                      : impact.chokeRisk > 10
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  {impact.chokeRisk}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2">
          <button
            onClick={onCopyLastBattle}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-2 sm:px-3 py-2 text-xs font-display font-bold text-zinc-100 tracking-wide transition-colors truncate"
          >
            COPY LAST BATTLE
          </button>
          <button
            onClick={onBalancedStrategy}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-2 sm:px-3 py-2 text-xs font-display font-bold text-zinc-100 tracking-wide transition-colors truncate"
          >
            BALANCED STRATEGY
          </button>
          <button
            onClick={onGrindStrategy}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-2 sm:px-3 py-2 text-xs font-display font-bold text-zinc-100 tracking-wide transition-colors truncate"
          >
            GRIND STRATEGY
          </button>
        </div>
      </div>
    </div>
  )
}
