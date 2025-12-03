"use client"

import type React from "react"

import { TrendingUp, TrendingDown, Clock, Ban, AlertTriangle, Award } from "lucide-react"
import type { Effect } from "@/lib/life-events"

interface EffectPreviewProps {
  effects: Effect[]
  compact?: boolean
}

export function EffectPreview({ effects, compact = false }: EffectPreviewProps) {
  const renderEffect = (effect: Effect, index: number) => {
    const items: React.ReactNode[] = []

    // Permanent attribute changes
    if (effect.attribute_changes) {
      Object.entries(effect.attribute_changes).forEach(([attr, value]) => {
        items.push(
          <div key={`${index}-attr-${attr}`} className={`flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
            {value >= 0 ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={value >= 0 ? "text-green-500" : "text-red-500"}>
              {value >= 0 ? "+" : ""}
              {value} {attr}
            </span>
          </div>,
        )
      })
    }

    // Reputation
    if (effect.reputation !== undefined) {
      items.push(
        <div key={`${index}-rep`} className={`flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
          {effect.reputation >= 0 ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span className={effect.reputation >= 0 ? "text-green-500" : "text-red-500"}>
            {effect.reputation >= 0 ? "+" : ""}
            {effect.reputation} Reputation
          </span>
        </div>,
      )
    }

    // Badge earned/lost
    if (effect.badge_earned) {
      items.push(
        <div key={`${index}-badge-earn`} className={`flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
          <Award className="w-3 h-3 text-yellow-500" />
          <span className="text-yellow-500">Badge: "{effect.badge_earned}"</span>
        </div>,
      )
    }
    if (effect.badge_lost) {
      items.push(
        <div key={`${index}-badge-lose`} className={`flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
          <Award className="w-3 h-3 text-red-500" />
          <span className="text-red-500">Lost Badge: "{effect.badge_lost}"</span>
        </div>,
      )
    }

    // Temporary effects
    if (effect.type === "temporary") {
      if (effect.status_effect) {
        items.push(
          <div key={`${index}-status`} className={`flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
            <Clock className="w-3 h-3 text-blue-500" />
            <span className="text-blue-500">
              Status: {effect.status_effect} ({effect.duration_value} {effect.duration_type})
            </span>
          </div>,
        )
      }
      if (effect.prep_bonus) {
        items.push(
          <div key={`${index}-prep-bonus`} className={`flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-green-500">+{effect.prep_bonus} Prep Bonus</span>
          </div>,
        )
      }
      if (effect.prep_penalty) {
        items.push(
          <div key={`${index}-prep-penalty`} className={`flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
            <TrendingDown className="w-3 h-3 text-red-500" />
            <span className="text-red-500">{effect.prep_penalty} Prep Penalty</span>
          </div>,
        )
      }
    }

    // Lockout effects
    if (effect.type === "lockout" && effect.league_locked) {
      items.push(
        <div key={`${index}-lockout`} className={`flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
          <Ban className="w-3 h-3 text-red-500" />
          <span className="text-red-500">
            Banned from {effect.league_locked.league_id} ({effect.league_locked.duration_battles} battles)
          </span>
        </div>,
      )
    }

    // Conditional effects
    if (effect.type === "conditional" && effect.trigger_condition) {
      items.push(
        <div key={`${index}-cond`} className={`flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span className="text-amber-500">If {effect.trigger_condition}: effect triggers</span>
        </div>,
      )
    }

    // Rival created
    if (effect.rival_created) {
      items.push(
        <div key={`${index}-rival`} className={`flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}>
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span className="text-red-500">New Rival: {effect.rival_created}</span>
        </div>,
      )
    }

    return items
  }

  if (compact) {
    return <div className="flex flex-wrap gap-2">{effects.map((effect, i) => renderEffect(effect, i))}</div>
  }

  return (
    <div className="space-y-2">
      {effects.map((effect, i) => (
        <div key={i} className="space-y-1">
          {effect.type !== "permanent" && (
            <div className="text-xs font-display font-bold text-zinc-500 uppercase mb-1">
              {effect.type} {effect.duration_value && `(${effect.duration_value} ${effect.duration_type})`}
            </div>
          )}
          {renderEffect(effect, i)}
        </div>
      ))}
    </div>
  )
}
