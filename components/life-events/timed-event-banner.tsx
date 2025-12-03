"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, AlertTriangle } from "lucide-react"
import type { LifeEventV2 } from "@/lib/life-events"

interface TimedEventBannerProps {
  event: LifeEventV2
}

export function TimedEventBanner({ event }: TimedEventBannerProps) {
  const [timeLeft, setTimeLeft] = useState("")
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    if (!event.deadline_at) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const deadline = new Date(event.deadline_at!).getTime()
      const diff = deadline - now

      if (diff <= 0) {
        setTimeLeft("EXPIRED")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setIsUrgent(hours < 12)
      setTimeLeft(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [event.deadline_at])

  return (
    <Link
      href={`/life-events/${event.id}`}
      className={`block border-2 p-3 transition-colors ${
        isUrgent
          ? "bg-orange-900/20 border-orange-600 hover:bg-orange-900/30"
          : "bg-zinc-900 border-orange-600/50 hover:bg-zinc-800"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 ${isUrgent ? "bg-orange-500" : "bg-orange-500/20"}`}>
            <Clock className={`w-4 h-4 ${isUrgent ? "text-white" : "text-orange-500"}`} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-display font-bold text-zinc-100 truncate">{event.title}</h3>
            <p className="text-xs text-zinc-500 truncate">{event.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isUrgent && <AlertTriangle className="w-4 h-4 text-orange-500" />}
          <span className={`text-sm font-mono font-bold ${isUrgent ? "text-orange-500" : "text-zinc-400"}`}>
            {timeLeft}
          </span>
        </div>
      </div>
    </Link>
  )
}
