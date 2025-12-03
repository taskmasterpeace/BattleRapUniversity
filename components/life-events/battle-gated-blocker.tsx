"use client"

import Link from "next/link"
import { Ban, AlertTriangle, ChevronRight } from "lucide-react"
import type { LifeEventV2 } from "@/lib/life-events"

interface BattleGatedBlockerProps {
  events: LifeEventV2[]
}

export function BattleGatedBlocker({ events }: BattleGatedBlockerProps) {
  if (events.length === 0) return null

  return (
    <div className="bg-yellow-900/20 border-2 border-yellow-600 p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-500">
          <Ban className="w-5 h-5 text-black" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-display font-bold text-yellow-500 mb-1">CANNOT ACCEPT BATTLES</h3>
          <p className="text-xs text-zinc-400 mb-3">
            You have unresolved life events that must be handled before you can battle again.
          </p>

          <div className="space-y-2">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/life-events/${event.id}`}
                className="flex items-center justify-between p-2 bg-zinc-800/50 border border-zinc-700 hover:border-yellow-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-zinc-200">{event.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
            ))}
          </div>

          <Link
            href={`/life-events/${events[0].id}`}
            className="block mt-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-center text-sm font-display font-bold text-black transition-colors"
          >
            RESOLVE NOW
          </Link>
        </div>
      </div>
    </div>
  )
}
