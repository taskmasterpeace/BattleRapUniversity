"use client"

import { Zap } from "lucide-react"

interface EventsTabProps {
  onTriggerEvent: (eventType: string) => void
}

const EVENTS = [
  { id: "battle_offer", label: "Generate Battle Offer" },
  { id: "life_event", label: "Trigger Life Event" },
  { id: "tournament_invite", label: "Tournament Invitation" },
  { id: "media_scandal", label: "Media Scandal" },
  { id: "badge_unlock", label: "Unlock Random Badge" },
  { id: "win_streak", label: "Win Streak Bonus" },
  { id: "family_crisis", label: "Family Crisis" },
  { id: "financial_windfall", label: "Financial Windfall" },
]

export function EventsTab({ onTriggerEvent }: EventsTabProps) {
  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
      <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4" /> EVENT TRIGGERS
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {EVENTS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onTriggerEvent(id)}
            className="py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-orange-500 text-left px-3 text-sm"
          >
            <span className="text-orange-500 mr-1">+</span> {label}
          </button>
        ))}
      </div>
    </div>
  )
}
