"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BeefPanel } from "@/components/beef/beef-panel"
import { HeatMeter } from "@/components/beef/heat-meter"
import {
  Megaphone,
  Target,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  MessageSquare,
  Users,
  Flame,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface CallOutCardProps {
  callOut: {
    id: string
    caller: {
      id: string
      stageName: string
      tier: string
      crewTag?: string
      avatar?: string
    }
    target: {
      id: string
      stageName: string
      tier: string
      crewTag?: string
      avatar?: string
    }
    template: string
    customMessage?: string
    status: "pending" | "accepted" | "countered" | "ignored" | "expired"
    stakeAmount: number
    league?: {
      id: string
      name: string
    }
    cosignCount: number
    responseDeadline: string
    createdAt: string
  }
  isTargetingMe: boolean
  onRespond: (callOutId: string, response: "accept" | "counter" | "ignore") => void
}

const TEMPLATE_MESSAGES = {
  bars_are_basic: {
    emoji: "📝",
    text: "YOUR BARS ARE BASIC - PROVE ME WRONG",
  },
  not_ready_for_league: {
    emoji: "🚫",
    text: "YOU AIN'T READY FOR THIS LEAGUE",
  },
  body_you_30: {
    emoji: "💀",
    text: "I'LL BODY YOU 3-0",
  },
  stop_ducking: {
    emoji: "🦆",
    text: "STOP DUCKING AND BATTLE ME",
  },
  throne_is_mine: {
    emoji: "👑",
    text: "THAT THRONE IS MINE",
  },
  custom: {
    emoji: "🎤",
    text: "CUSTOM CALL-OUT",
  },
}

export function CallOutCard({ callOut, isTargetingMe, onRespond }: CallOutCardProps) {
  const [showBeef, setShowBeef] = useState(false)
  const [beefIntensity, setBeefIntensity] = useState<number | null>(null)
  const template = TEMPLATE_MESSAGES[callOut.template as keyof typeof TEMPLATE_MESSAGES] || TEMPLATE_MESSAGES.custom

  // Calculate time remaining
  const deadline = new Date(callOut.responseDeadline)
  const now = new Date()
  const hoursRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)))
  const isExpiringSoon = hoursRemaining < 12
  const isExpired = hoursRemaining === 0

  const statusColor = {
    pending: "border-zinc-700",
    accepted: "border-green-500/50 bg-green-950/20",
    countered: "border-yellow-500/50 bg-yellow-950/20",
    ignored: "border-zinc-700/50 bg-zinc-900/50",
    expired: "border-zinc-700/50 bg-zinc-900/50",
  }

  const statusLabel = {
    pending: "PENDING",
    accepted: "ACCEPTED",
    countered: "COUNTERED",
    ignored: "IGNORED",
    expired: "EXPIRED",
  }

  return (
    <div
      className={`bg-zinc-900 border-2 ${isTargetingMe && callOut.status === "pending" ? "border-orange-500/50" : statusColor[callOut.status]} p-4 sm:p-5 transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {isTargetingMe ? (
            <div className="w-10 h-10 bg-red-600/20 border-2 border-red-500/50 flex items-center justify-center">
              <Target className="w-5 h-5 text-red-500" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-orange-600/20 border-2 border-orange-500/50 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-orange-500" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-display font-bold text-zinc-500 uppercase tracking-wider">
                {isTargetingMe ? "CHALLENGING YOU" : "CALL-OUT"}
              </span>
              {callOut.cosignCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-orange-400">
                  <Users className="w-3 h-3" />
                  <span className="font-mono font-bold">{callOut.cosignCount}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-600 font-mono mt-0.5">
              {new Date(callOut.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`text-xs font-mono font-bold px-2 py-1 border ${
              callOut.status === "pending"
                ? "bg-yellow-900/30 border-yellow-700/50 text-yellow-400"
                : callOut.status === "accepted"
                  ? "bg-green-900/30 border-green-700/50 text-green-400"
                  : "bg-zinc-800 border-zinc-700 text-zinc-500"
            }`}
          >
            {statusLabel[callOut.status]}
          </span>
          {callOut.status === "pending" && (
            <div className="flex items-center gap-1 text-xs">
              <Clock
                className={`w-3 h-3 ${isExpiringSoon ? "text-red-400" : "text-zinc-500"}`}
              />
              <span
                className={`font-mono ${isExpiringSoon ? "text-red-400" : "text-zinc-500"}`}
              >
                {hoursRemaining}h left
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Battlers */}
      <div className="flex items-center gap-4 mb-4">
        {/* Caller */}
        <div className="flex-1 flex items-center gap-3">
          <div className="w-12 h-12 bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex-shrink-0">
            {callOut.caller.avatar ? (
              <img
                src={callOut.caller.avatar}
                alt={callOut.caller.stageName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-700" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-zinc-100 text-sm truncate">
              {callOut.caller.stageName}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500">{callOut.caller.tier}</span>
              {callOut.caller.crewTag && (
                <>
                  <span className="text-zinc-700">•</span>
                  <span className="text-orange-400 font-mono">{callOut.caller.crewTag}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-zinc-600 font-display font-black text-lg">VS</div>

        {/* Target */}
        <div className="flex-1 flex items-center gap-3">
          <div className="w-12 h-12 bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex-shrink-0">
            {callOut.target.avatar ? (
              <img
                src={callOut.target.avatar}
                alt={callOut.target.stageName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-700" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-zinc-100 text-sm truncate">
              {callOut.target.stageName}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500">{callOut.target.tier}</span>
              {callOut.target.crewTag && (
                <>
                  <span className="text-zinc-700">•</span>
                  <span className="text-orange-400 font-mono">{callOut.target.crewTag}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="bg-zinc-800/50 border border-zinc-700 p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{template.emoji}</span>
          <div className="flex-1">
            <p className="font-display font-black text-orange-400 text-sm uppercase tracking-wide leading-tight">
              {callOut.customMessage || template.text}
            </p>
            {callOut.league && (
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                League: {callOut.league.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Beef History Toggle */}
      <button
        onClick={() => setShowBeef(!showBeef)}
        className="w-full mb-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 p-3 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-2">
          <Flame className={`w-4 h-4 ${beefIntensity && beefIntensity >= 50 ? 'text-orange-500' : 'text-zinc-500'}`} />
          <span className="text-sm font-display text-zinc-300">
            Beef History
          </span>
          {beefIntensity !== null && beefIntensity > 0 && (
            <span className={`px-1.5 py-0.5 text-xs font-mono ${
              beefIntensity >= 70 ? 'bg-red-900/50 text-red-400 border border-red-700/50' :
              beefIntensity >= 40 ? 'bg-orange-900/50 text-orange-400 border border-orange-700/50' :
              'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}>
              {beefIntensity}% HOT
            </span>
          )}
        </div>
        {showBeef ? (
          <ChevronUp className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        )}
      </button>

      {/* Beef Panel */}
      <AnimatePresence>
        {showBeef && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <BeefPanel
              callerName={callOut.caller.stageName}
              callerId={callOut.caller.id}
              targetName={callOut.target.stageName}
              targetId={callOut.target.id}
              onBeefLoaded={(beef) => setBeefIntensity(beef?.intensity || null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
        {callOut.stakeAmount > 0 && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-zinc-400">Stake:</span>
            <span className="text-green-400 font-mono font-bold">${callOut.stakeAmount}</span>
          </div>
        )}
        {callOut.cosignCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-orange-500" />
            <span className="text-zinc-400">Cosigns:</span>
            <span className="text-orange-400 font-mono font-bold">{callOut.cosignCount}</span>
          </div>
        )}
      </div>

      {/* Actions (only show if targeting user and pending) */}
      {isTargetingMe && callOut.status === "pending" && !isExpired && (
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-zinc-800">
          <Button
            onClick={() => onRespond(callOut.id, "accept")}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-display font-bold text-sm uppercase"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Accept
          </Button>
          <Button
            onClick={() => onRespond(callOut.id, "counter")}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-display font-bold text-sm uppercase"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Counter
          </Button>
          <Button
            onClick={() => onRespond(callOut.id, "ignore")}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 font-display font-bold text-sm uppercase"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Ignore
          </Button>
        </div>
      )}

      {/* Warning if ignoring */}
      {isTargetingMe && callOut.status === "pending" && isExpiringSoon && !isExpired && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700/50"
        >
          <p className="text-xs text-yellow-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Expiring soon! Ignoring too many call-outs can earn you the "Ducking" badge
          </p>
        </motion.div>
      )}
    </div>
  )
}
