"use client"

import { type League, getPersonalityDescription } from "@/lib/leagues"
import { Pen, Users, Scale } from "lucide-react"

interface LeagueOverviewCardsProps {
  league: League
}

export function LeagueOverviewCards({ league }: LeagueOverviewCardsProps) {
  const roundMinutes = league.roundDurationSeconds / 60

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card A: League Identity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Pen className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-sm">LEAGUE IDENTITY</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Style:</span>
            <span className="capitalize">{league.personalityStyle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Focus:</span>
            <span>
              {league.writingWeight >= 50
                ? "Writing-First"
                : league.performanceWeight >= 35
                  ? "Performance-Heavy"
                  : "Balanced"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Round Length:</span>
            <span>{roundMinutes} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Rounds:</span>
            <span>{league.roundsPerBattle} per battle</span>
          </div>
          <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-800 mt-2">
            {getPersonalityDescription(league.personalityStyle)}
          </p>
        </div>
      </div>

      {/* Card B: Audience Preferences */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-sm">WHAT THE CROWD WANTS</h3>
        </div>
        <div className="space-y-3">
          <PreferenceBar label="Lyricism" value={league.audienceFavorsLyricism} color="blue" />
          <PreferenceBar label="Delivery" value={league.audienceFavorsDelivery} color="orange" />
          <PreferenceBar label="Storytelling" value={league.audienceFavorsStorytelling} color="purple" />
          <PreferenceBar label="Engagement" value={league.audienceFavorsCrowdEngagement} color="green" />
        </div>
        <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-800 mt-3">
          {league.audienceFavorsLyricism >= 8
            ? '"This crowd analyzes every bar"'
            : league.audienceFavorsCrowdEngagement >= 8
              ? '"They want to be entertained"'
              : '"Balanced appreciation for skill"'}
        </p>
      </div>

      {/* Card C: Battle Mechanics */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-5 h-5 text-orange-400" />
          <h3 className="font-bold text-sm">HOW BATTLES ARE JUDGED</h3>
        </div>
        <div className="space-y-3">
          <WeightBar label="Writing" value={league.writingWeight} color="blue" />
          <WeightBar label="Performance" value={league.performanceWeight} color="orange" />
          <WeightBar label="Crowd" value={league.crowdReactionWeight} color="green" />
        </div>
        <div className="pt-3 border-t border-zinc-800 mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-500">Crowd Factor:</span>
            <span
              className={
                league.baseCrowdFactor < 1
                  ? "text-blue-400"
                  : league.baseCrowdFactor > 1
                    ? "text-red-400"
                    : "text-zinc-400"
              }
            >
              {league.baseCrowdFactor}x
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            {league.baseCrowdFactor < 1
              ? `(${Math.round((1 - league.baseCrowdFactor) * 100)}% less reactive than avg)`
              : league.baseCrowdFactor > 1
                ? `(${Math.round((league.baseCrowdFactor - 1) * 100)}% more reactive than avg)`
                : "(Average crowd reactivity)"}
          </p>
        </div>
      </div>
    </div>
  )
}

function PreferenceBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
  }

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-400">{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  )
}

function WeightBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
  }

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-400">{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 bg-zinc-800 rounded overflow-hidden">
        <div className={`h-full ${colorClasses[color]} rounded transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
