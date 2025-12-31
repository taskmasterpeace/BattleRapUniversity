"use client"

import { Check } from "lucide-react"

export type OriginType = "text_forums" | "app_camera" | "crew"

interface Origin {
  id: OriginType
  name: string
  tagline: string
  description: string
  bonuses: string[]
  penalties: string[]
}

const origins: Origin[] = [
  {
    id: "text_forums",
    name: "TEXT FORUMS",
    tagline: "The pen game scholar",
    description:
      "You honed your craft writing bars in forums, dissecting lyrics, and studying the greats. Your writing is sharp, but you lack stage experience.",
    bonuses: ["+2 LYRICISM", "+1 WORDPLAY", "+1 CREATIVITY"],
    penalties: ["-1 STAGE PRESENCE", "-1 DELIVERY"],
  },
  {
    id: "app_camera",
    name: "APP CAMERA",
    tagline: "The new wave performer",
    description:
      "You built your name dropping videos on social apps, mastering delivery and crowd energy. Your stage presence is strong, but your pen needs work.",
    bonuses: ["+2 STAGE PRESENCE", "+1 DELIVERY", "+1 CROWD CONTROL"],
    penalties: ["-1 LYRICISM", "-1 WORDPLAY"],
  },
  {
    id: "crew",
    name: "CREW",
    tagline: "The circle-tested battler",
    description:
      "You came up battling in your crew, building reputation and resilience through real competition. You're battle-tested but financially unstable.",
    bonuses: ["+1 REPUTATION", "+1 RESILIENCE"],
    penalties: ["-1 FINANCIAL STABILITY"],
  },
]

interface OriginSelectorProps {
  selectedOrigin: OriginType | null
  onSelect: (origin: OriginType) => void
}

export function OriginSelector({ selectedOrigin, onSelect }: OriginSelectorProps) {
  return (
    <div>
      <p className="text-zinc-400 text-sm mb-6 text-center">
        How did you get into battle rap? Your origin shapes your initial strengths and weaknesses.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {origins.map((origin) => {
          const isSelected = selectedOrigin === origin.id
          return (
            <button
              key={origin.id}
              onClick={() => onSelect(origin.id)}
              className={`relative border-2 transition-colors text-left p-4 ${
                isSelected ? "border-orange-500 bg-orange-500/10" : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
              }`}
            >
              {/* Header */}
              <div className="mb-3">
                <h3 className="text-base font-display font-bold text-zinc-100 uppercase">{origin.name}</h3>
                <p className="text-xs text-orange-500 italic mt-1">{origin.tagline}</p>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{origin.description}</p>

              {/* Bonuses */}
              <div className="mb-3">
                <p className="text-xs font-display text-green-500 uppercase tracking-wide mb-1">BONUSES</p>
                <div className="space-y-1">
                  {origin.bonuses.map((bonus, i) => (
                    <div key={i} className="text-xs text-green-400">
                      + {bonus}
                    </div>
                  ))}
                </div>
              </div>

              {/* Penalties */}
              <div>
                <p className="text-xs font-display text-red-500 uppercase tracking-wide mb-1">PENALTIES</p>
                <div className="space-y-1">
                  {origin.penalties.map((penalty, i) => (
                    <div key={i} className="text-xs text-red-400">
                      - {penalty}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
