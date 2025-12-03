import type { RegionalBadge } from "@/lib/cities"
import { Award, Users, Sparkles } from "lucide-react"

interface RegionalBadgeCardProps {
  badge: RegionalBadge
}

export function RegionalBadgeCard({ badge }: RegionalBadgeCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-500" />
        <h2 className="font-bold text-white">REGIONAL BADGE</h2>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Badge icon placeholder */}
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Award className="w-8 h-8 text-yellow-500" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-yellow-500">{badge.name}</h3>
            <p className="text-sm text-zinc-400 italic">"{badge.description}"</p>

            <div className="flex items-center gap-2 mt-2 text-sm">
              <Users className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-300">
                Held by: <strong>{badge.holderCount}</strong> battlers
              </span>
            </div>
          </div>
        </div>

        {/* Effects */}
        <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-zinc-400">BADGE EFFECTS</span>
          </div>
          <ul className="space-y-1">
            {badge.effects.map((effect, i) => (
              <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                <span className="text-green-500">+</span>
                {effect}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
