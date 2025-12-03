"use client"

import { useState } from "react"
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import { type League, getPersonalityDescription } from "@/lib/leagues"

interface LeagueExplainerProps {
  league: League
}

export function LeagueExplainer({ league }: LeagueExplainerProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const sections = [
    {
      id: "weights",
      title: "How League Weights Work",
      content: `Writing (${league.writingWeight}%): Lyricism, wordplay, creativity, flow scores.
Performance (${league.performanceWeight}%): Stage presence, delivery, crowd control.
Crowd (${league.crowdReactionWeight}%): Raw crowd reaction score multiplied by crowd factor.`,
    },
    {
      id: "personality",
      title: `What "${league.personalityStyle.charAt(0).toUpperCase() + league.personalityStyle.slice(1)}" Personality Means`,
      content: getPersonalityDescription(league.personalityStyle),
    },
    {
      id: "crowd",
      title: "How Crowd Factor Affects Your Battles",
      content:
        league.baseCrowdFactor < 1
          ? `${league.baseCrowdFactor}x means crowds are ${Math.round((1 - league.baseCrowdFactor) * 100)}% less reactive than average. Your bars need to be FIRE to get reactions here. Focus on writing quality over crowd-pleasing moments.`
          : league.baseCrowdFactor > 1
            ? `${league.baseCrowdFactor}x means crowds are ${Math.round((league.baseCrowdFactor - 1) * 100)}% more reactive than average. Energy is contagious here. Use that to your advantage with performance-heavy material.`
            : "1.0x means average crowd reactivity. A balanced approach works well here.",
    },
    {
      id: "prestige",
      title: "Prestige & Payout",
      content: `Prestige Level ${league.prestigeLevel}/10 means ${league.prestigeLevel >= 8 ? "maximum" : league.prestigeLevel >= 5 ? "solid" : "developing"} reputation gain per win. Base payout of $${league.basePayout.toLocaleString()} scales with crowd size and win margin.`,
    },
  ]

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-cyan-400" />
        <h3 className="font-bold">UNDERSTANDING THIS LEAGUE</h3>
      </div>

      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.id} className="border border-zinc-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-800/50 transition-colors"
            >
              <span className="text-sm font-medium">{section.title}</span>
              {openSection === section.id ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>
            {openSection === section.id && (
              <div className="px-3 pb-3 text-sm text-zinc-400 whitespace-pre-line">{section.content}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
