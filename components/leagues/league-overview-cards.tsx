"use client"

import { type League, getPersonalityDescription } from "@/lib/leagues"
import { Pen, Users, Scale, Mic2, Clock, Target } from "lucide-react"

interface LeagueOverviewCardsProps {
  league: League
}

export function LeagueOverviewCards({ league }: LeagueOverviewCardsProps) {
  const roundMinutes = league.roundDurationSeconds / 60

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card A: League Identity */}
      <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 overflow-hidden group hover:border-zinc-700 transition-all">
        {/* Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(to right, ${league.primaryColor}, ${league.secondaryColor})` }}
        />

        {/* Glow effect on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
          style={{ backgroundColor: league.primaryColor }}
        />

        <div className="relative p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-500/20 border border-blue-500/30">
              <Pen className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-black text-sm uppercase tracking-wider">League Identity</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/50">
              <span className="text-zinc-500 flex items-center gap-2">
                <Target className="w-3 h-3" />
                Style
              </span>
              <span className="font-bold capitalize" style={{ color: league.primaryColor }}>
                {league.personalityStyle}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/50">
              <span className="text-zinc-500 flex items-center gap-2">
                <Pen className="w-3 h-3" />
                Focus
              </span>
              <span className="font-bold">
                {league.writingWeight >= 50
                  ? "Writing-First"
                  : league.performanceWeight >= 35
                    ? "Performance-Heavy"
                    : "Balanced"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/50">
              <span className="text-zinc-500 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Rounds
              </span>
              <span className="font-bold">{roundMinutes} min × {league.roundsPerBattle}</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 pt-3 mt-3 border-t border-zinc-800 italic">
            "{getPersonalityDescription(league.personalityStyle)}"
          </p>
        </div>
      </div>

      {/* Card B: Audience Preferences */}
      <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 overflow-hidden group hover:border-zinc-700 transition-all">
        {/* Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(to right, ${league.secondaryColor}, ${league.primaryColor})` }}
        />

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
          style={{ backgroundColor: league.secondaryColor }}
        />

        <div className="relative p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-purple-500/20 border border-purple-500/30">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-black text-sm uppercase tracking-wider">What The Crowd Wants</h3>
          </div>

          <div className="space-y-3">
            <PreferenceBar label="Lyricism" value={league.audienceFavorsLyricism} color="blue" />
            <PreferenceBar label="Delivery" value={league.audienceFavorsDelivery} color="orange" />
            <PreferenceBar label="Storytelling" value={league.audienceFavorsStorytelling} color="purple" />
            <PreferenceBar label="Engagement" value={league.audienceFavorsCrowdEngagement} color="green" />
          </div>

          <p className="text-xs text-zinc-500 pt-3 mt-3 border-t border-zinc-800 italic">
            {league.audienceFavorsLyricism >= 8
              ? '"This crowd analyzes every bar"'
              : league.audienceFavorsCrowdEngagement >= 8
                ? '"They want to be entertained"'
                : '"Balanced appreciation for skill"'}
          </p>
        </div>
      </div>

      {/* Card C: Battle Mechanics */}
      <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 overflow-hidden group hover:border-zinc-700 transition-all">
        {/* Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(to right, ${league.primaryColor}, ${league.secondaryColor}, ${league.primaryColor})` }}
        />

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
          style={{ backgroundColor: league.primaryColor }}
        />

        <div className="relative p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-orange-500/20 border border-orange-500/30">
              <Scale className="w-4 h-4 text-orange-400" />
            </div>
            <h3 className="font-black text-sm uppercase tracking-wider">How Battles Are Judged</h3>
          </div>

          <div className="space-y-3">
            <WeightBar label="Writing" value={league.writingWeight} color="blue" primaryColor={league.primaryColor} />
            <WeightBar label="Performance" value={league.performanceWeight} color="orange" primaryColor={league.primaryColor} />
            <WeightBar label="Crowd" value={league.crowdReactionWeight} color="green" primaryColor={league.primaryColor} />
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-800">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-zinc-500 flex items-center gap-2">
                <Mic2 className="w-3 h-3" />
                Crowd Factor
              </span>
              <span
                className={`font-black text-lg ${
                  league.baseCrowdFactor < 1
                    ? "text-blue-400"
                    : league.baseCrowdFactor > 1
                      ? "text-red-400"
                      : "text-zinc-400"
                }`}
              >
                {league.baseCrowdFactor}×
              </span>
            </div>
            <p className="text-xs text-zinc-500 italic">
              {league.baseCrowdFactor < 1
                ? `${Math.round((1 - league.baseCrowdFactor) * 100)}% less reactive`
                : league.baseCrowdFactor > 1
                  ? `${Math.round((league.baseCrowdFactor - 1) * 100)}% more reactive`
                  : "Average reactivity"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreferenceBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, { bg: string; glow: string; text: string }> = {
    blue: { bg: "bg-blue-500", glow: "shadow-blue-500/50", text: "text-blue-400" },
    orange: { bg: "bg-orange-500", glow: "shadow-orange-500/50", text: "text-orange-400" },
    purple: { bg: "bg-purple-500", glow: "shadow-purple-500/50", text: "text-purple-400" },
    green: { bg: "bg-green-500", glow: "shadow-green-500/50", text: "text-green-400" },
  }

  const colors = colorClasses[color] || colorClasses.blue
  const isHigh = value >= 8
  const isMid = value >= 5

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className={isHigh ? colors.text : isMid ? "text-zinc-300" : "text-zinc-500"}>
          {value}/10 {isHigh && "★"}
        </span>
      </div>
      <div className="h-2 bg-zinc-800/80 overflow-hidden border border-zinc-700/50">
        <div
          className={`h-full ${colors.bg} transition-all duration-500 ${isHigh ? `shadow-md ${colors.glow}` : ""}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  )
}

function WeightBar({ label, value, color, primaryColor }: { label: string; value: number; color: string; primaryColor?: string }) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-500", text: "text-blue-400" },
    orange: { bg: "bg-orange-500", text: "text-orange-400" },
    green: { bg: "bg-green-500", text: "text-green-400" },
  }

  const colors = colorClasses[color] || colorClasses.blue
  const isHighest = value >= 40

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-400 font-medium">{label}</span>
        <span className={`font-bold ${isHighest ? colors.text : "text-zinc-300"}`}>
          {value}%
        </span>
      </div>
      <div className="h-3 bg-zinc-800/80 overflow-hidden border border-zinc-700/50">
        <div
          className={`h-full ${colors.bg} transition-all duration-500`}
          style={{
            width: `${value}%`,
            boxShadow: isHighest ? `0 0 10px ${primaryColor || colors.bg}40` : undefined
          }}
        />
      </div>
    </div>
  )
}
