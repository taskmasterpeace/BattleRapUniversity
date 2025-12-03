import type { CityBattle } from "@/lib/cities"
import { Swords, Calendar } from "lucide-react"

interface RecentBattlesSectionProps {
  battles: CityBattle[]
  cityName: string
}

export function RecentBattlesSection({ battles, cityName }: RecentBattlesSectionProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <Swords className="w-5 h-5 text-red-500" />
        <h2 className="font-bold text-white">RECENT {cityName.toUpperCase()} BATTLES</h2>
      </div>

      <div className="divide-y divide-zinc-800">
        {battles.map((battle) => {
          const isWinnerA = battle.winner === "A"
          const isHomeA = battle.battlerA.city === cityName
          const isHomeB = battle.battlerB.city === cityName

          return (
            <div key={battle.id} className="p-4 hover:bg-zinc-800/30 transition-colors">
              <div className="flex items-center justify-between gap-4">
                {/* Battler A */}
                <div className={`flex-1 text-right ${isWinnerA ? "" : "opacity-60"}`}>
                  <div className="font-bold text-white">
                    {battle.battlerA.stageName}
                    {isWinnerA && <span className="ml-2 text-green-500">W</span>}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {battle.battlerA.city}
                    {isHomeA && <span className="ml-1 text-orange-500">(HOME)</span>}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Crowd: <span className="text-orange-500">{battle.crowdReaction.a}</span>
                  </div>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center px-4">
                  <span className="text-xs text-zinc-600 font-bold">VS</span>
                  <span
                    className={`text-xs font-bold mt-1 ${
                      battle.verdict.includes("Body") ? "text-red-500" : "text-orange-500"
                    }`}
                  >
                    {battle.verdict}
                  </span>
                </div>

                {/* Battler B */}
                <div className={`flex-1 ${!isWinnerA ? "" : "opacity-60"}`}>
                  <div className="font-bold text-white">
                    {!isWinnerA && <span className="mr-2 text-green-500">W</span>}
                    {battle.battlerB.stageName}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {isHomeB && <span className="mr-1 text-orange-500">(HOME)</span>}
                    {battle.battlerB.city}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Crowd: <span className="text-orange-500">{battle.crowdReaction.b}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(battle.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
