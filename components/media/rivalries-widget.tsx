"use client"

import Link from "next/link"
import { Swords, Flame } from "lucide-react"

const HOT_RIVALRIES = [
  {
    id: 1,
    battler1: "Stage Name",
    battler2: "Tru Foe",
    intensity: 5,
    h2h: "2-1",
    slug: "stage-name-vs-tru-foe",
  },
  {
    id: 2,
    battler1: "Coded Flux",
    battler2: "JC",
    intensity: 3,
    h2h: "1-1",
    slug: "coded-flux-vs-jc",
  },
]

export function RivalriesWidget() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Swords className="w-5 h-5 text-red-500" />
        <h3 className="font-display font-bold text-white uppercase">Hot Rivalries</h3>
      </div>

      <div className="space-y-4">
        {HOT_RIVALRIES.map((rivalry) => (
          <div key={rivalry.id} className="border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
            <div className="text-sm font-bold text-white mb-1">
              {rivalry.battler1} vs {rivalry.battler2}
            </div>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-zinc-500">Intensity:</span>
              {Array.from({ length: 5 }).map((_, i) => (
                <Flame key={i} className={`w-3 h-3 ${i < rivalry.intensity ? "text-orange-500" : "text-zinc-700"}`} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">H2H: {rivalry.h2h}</span>
              <Link href={`/rivalries/${rivalry.slug}`} className="text-xs text-orange-500 hover:underline">
                Follow
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
