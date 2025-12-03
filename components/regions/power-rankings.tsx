import type { RankedBattler } from "@/lib/cities"
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PowerRankingsProps {
  battlers: RankedBattler[]
  cityName: string
  highlightBattlerId?: string
}

export function PowerRankings({ battlers, cityName, highlightBattlerId }: PowerRankingsProps) {
  const tierColors: Record<string, string> = {
    god: "bg-yellow-500 text-black",
    top: "bg-purple-500 text-white",
    mid: "bg-blue-500 text-white",
    low: "bg-green-500 text-white",
    none: "bg-zinc-600 text-white",
  }

  const getStreakIcon = (streak: number) => {
    if (streak > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (streak < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-zinc-500" />
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="font-bold text-white">{cityName.toUpperCase()} POWER RANKINGS</h2>
      </div>

      <div className="divide-y divide-zinc-800">
        {battlers.map((battler) => (
          <Link
            key={battler.id}
            href={`/battler/${battler.id}`}
            className={`flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition-colors ${
              battler.isPlayer || battler.id === highlightBattlerId
                ? "bg-orange-500/10 border-l-2 border-orange-500"
                : ""
            }`}
          >
            {/* Rank */}
            <div
              className={`w-8 h-8 flex items-center justify-center font-bold rounded ${
                battler.rank === 1
                  ? "bg-yellow-500 text-black"
                  : battler.rank === 2
                    ? "bg-gray-400 text-black"
                    : battler.rank === 3
                      ? "bg-orange-600 text-white"
                      : "bg-zinc-700 text-zinc-300"
              }`}
            >
              {battler.rank}
            </div>

            {/* Avatar */}
            <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
              <Image
                src={battler.avatarUrl || "/placeholder.svg"}
                alt={battler.stageName}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white truncate">{battler.stageName}</span>
                {battler.isPlayer && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-orange-500 text-white rounded">YOU</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tierColors[battler.tier]}`}>
                  {battler.tier.toUpperCase()}
                </span>
                <span>
                  {battler.wins}-{battler.losses}
                </span>
                <span className="text-zinc-600">|</span>
                <span>{battler.winRate}% WR</span>
              </div>
            </div>

            {/* Rating & Streak */}
            <div className="text-right flex-shrink-0">
              <div className="font-bold text-orange-500">{battler.rating}</div>
              <div className="flex items-center justify-end gap-1 text-xs">
                {getStreakIcon(battler.streak)}
                <span
                  className={
                    battler.streak > 0 ? "text-green-500" : battler.streak < 0 ? "text-red-500" : "text-zinc-500"
                  }
                >
                  {battler.streak > 0
                    ? `W${battler.streak}`
                    : battler.streak < 0
                      ? `L${Math.abs(battler.streak)}`
                      : "-"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
