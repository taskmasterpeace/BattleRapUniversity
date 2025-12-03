"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { type ForecastResult, getMultiplierColor } from "@/lib/round-crafting"
import { ContentTypeBadge } from "./content-type-badge"

interface EffectivenessForecastProps {
  forecast: ForecastResult | null
  isLoading?: boolean
}

export function EffectivenessForecast({ forecast, isLoading }: EffectivenessForecastProps) {
  if (isLoading) {
    return (
      <div className="border border-zinc-700 bg-zinc-900 p-4 animate-pulse">
        <div className="h-6 bg-zinc-800 w-48 mb-4" />
        <div className="h-12 bg-zinc-800 w-32 mb-4" />
        <div className="h-4 bg-zinc-800 w-full" />
      </div>
    )
  }

  if (!forecast) {
    return (
      <div className="border border-zinc-700 bg-zinc-900 p-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-400 mb-2">Effectiveness Forecast</h3>
        <p className="text-zinc-500 text-sm">Select content to see predicted effectiveness</p>
      </div>
    )
  }

  const multiplierPercent = ((forecast.finalMultiplier - 0.5) / 1.5) * 100

  return (
    <div className="border border-zinc-700 bg-zinc-900 p-4 space-y-4">
      {/* Header */}
      <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-400">Effectiveness Forecast</h3>

      {/* Final Multiplier */}
      <div>
        <p className="text-xs text-zinc-500 uppercase mb-1">Final Multiplier</p>
        <div className="flex items-baseline gap-2">
          <span className={cn("font-black text-4xl tabular-nums", getMultiplierColor(forecast.finalMultiplier))}>
            {forecast.finalMultiplier.toFixed(2)}x
          </span>
          {forecast.finalMultiplier >= 1.2 ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : forecast.finalMultiplier < 1.0 ? (
            <TrendingDown className="w-5 h-5 text-red-500" />
          ) : (
            <Minus className="w-5 h-5 text-zinc-500" />
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-zinc-800 mt-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, multiplierPercent))}%` }}
            className={cn(
              "h-full",
              forecast.finalMultiplier >= 1.2
                ? "bg-green-500"
                : forecast.finalMultiplier < 1.0
                  ? "bg-red-500"
                  : "bg-orange-500",
            )}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <p className="text-xs text-zinc-500 uppercase">Breakdown</p>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Effectiveness</span>
            <span className={getMultiplierColor(forecast.effectiveness)}>{forecast.effectiveness.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Crowd Favor</span>
            <span className={getMultiplierColor(forecast.crowdPreference)}>{forecast.crowdPreference.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Context</span>
            <span className={getMultiplierColor(forecast.contextModifier)}>{forecast.contextModifier.toFixed(2)}x</span>
          </div>
        </div>
      </div>

      {/* Strong Against */}
      {forecast.strongAgainst.length > 0 && (
        <div>
          <p className="text-xs text-green-500 uppercase mb-2">Strong Against</p>
          <div className="flex flex-wrap gap-1">
            {forecast.strongAgainst.map((type) => (
              <ContentTypeBadge key={type} type={type} category="content" size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Weak Against */}
      {forecast.weakAgainst.length > 0 && (
        <div>
          <p className="text-xs text-red-500 uppercase mb-2">Weak Against</p>
          <div className="flex flex-wrap gap-1">
            {forecast.weakAgainst.map((type) => (
              <ContentTypeBadge key={type} type={type} category="content" size="sm" />
            ))}
          </div>
        </div>
      )}

      {forecast.weakAgainst.length === 0 && <p className="text-xs text-green-400">No weaknesses - solid selections!</p>}
    </div>
  )
}
