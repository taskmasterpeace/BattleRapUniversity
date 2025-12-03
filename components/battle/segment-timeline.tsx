"use client"

import { Star, X, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SegmentScore } from "@/lib/round-crafting"

interface SegmentTimelineProps {
  segments: SegmentScore[]
  showLabels?: boolean
  compact?: boolean
}

export function SegmentTimeline({ segments, showLabels = true, compact = false }: SegmentTimelineProps) {
  const maxScore = Math.max(...segments.map((s) => s.score))

  return (
    <div className={cn("flex gap-2", compact ? "" : "gap-3")}>
      {segments.map((segment) => {
        const heightPercent = (segment.score / 10) * 100

        return (
          <div key={segment.segmentIndex} className="flex-1 flex flex-col items-center gap-1">
            {/* Bar */}
            <div className={cn("w-full relative", compact ? "h-12" : "h-16")}>
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 transition-all",
                  segment.isPeak && "bg-green-500/30",
                  segment.isChoke && "bg-red-500/30",
                  segment.isStumble && "bg-orange-500/30",
                  !segment.isPeak && !segment.isChoke && !segment.isStumble && "bg-zinc-700",
                )}
                style={{ height: `${heightPercent}%` }}
              >
                {/* Icon */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {segment.isPeak && <Star className="w-4 h-4 text-green-400 fill-green-400" />}
                  {segment.isChoke && <X className="w-4 h-4 text-red-400" />}
                  {segment.isStumble && <AlertTriangle className="w-3 h-3 text-orange-400" />}
                </div>
              </div>
            </div>

            {/* Score */}
            {showLabels && (
              <span
                className={cn(
                  "text-xs font-bold tabular-nums",
                  segment.isPeak && "text-green-400",
                  segment.isChoke && "text-red-400",
                  segment.isStumble && "text-orange-400",
                  !segment.isPeak && !segment.isChoke && !segment.isStumble && "text-zinc-400",
                )}
              >
                {segment.score.toFixed(1)}
              </span>
            )}

            {/* Segment number */}
            <span className="text-[10px] text-zinc-600 uppercase">{segment.segmentIndex}</span>
          </div>
        )
      })}
    </div>
  )
}
