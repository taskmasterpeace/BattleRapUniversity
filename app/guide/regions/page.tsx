"use client"

import Link from "next/link"
import { ArrowLeft, MapPin, Trophy, Users, TrendingUp } from "lucide-react"

export default function RegionsGuidePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-900">
        <Link
          href="/guide"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm font-display transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO GUIDE
        </Link>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">REGIONAL SYSTEM</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-teal-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-teal-500 mb-4">REP YOUR CITY</h2>
          <p className="text-zinc-300 leading-relaxed">
            Battle rap is deeply regional. Your home city and region affect your style bonuses, tournament access,
            rivalries, and reputation. Each region has its own culture and legends.
          </p>
        </section>

        {/* Four Regions */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-6">THE FOUR REGIONS</h3>

          <div className="space-y-4">
            <div className="bg-zinc-800 border-l-4 border-blue-500 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-900/50 flex items-center justify-center">
                  <span className="text-2xl">🗽</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-blue-500">EAST COAST</h4>
                  <span className="text-xs text-zinc-500">NYC, Philadelphia, Boston, DMV</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-3">
                The birthplace of battle rap. Known for technical lyricism, complex schemes, and pen-heavy battles.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-blue-400">Style:</span> Technical, bars-heavy
                </div>
                <div>
                  <span className="text-blue-400">Bonus:</span> +10% Lyricism in home battles
                </div>
                <div>
                  <span className="text-blue-400">Badge:</span> East Coast Elite
                </div>
                <div>
                  <span className="text-blue-400">Legends:</span> Technical masters
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-orange-500 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-900/50 flex items-center justify-center">
                  <span className="text-2xl">🌴</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-orange-500">WEST COAST</h4>
                  <span className="text-xs text-zinc-500">Los Angeles, Oakland, San Diego, Phoenix</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-3">
                Entertainment capital influence. Known for performance, crowd work, and stage presence.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-orange-400">Style:</span> Performance, energy
                </div>
                <div>
                  <span className="text-orange-400">Bonus:</span> +10% Stage Presence in home
                </div>
                <div>
                  <span className="text-orange-400">Badge:</span> West Coast Warriors
                </div>
                <div>
                  <span className="text-orange-400">Legends:</span> Crowd commanders
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-red-500 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-900/50 flex items-center justify-center">
                  <span className="text-2xl">🍑</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-red-500">SOUTH</h4>
                  <span className="text-xs text-zinc-500">Atlanta, Houston, Miami, New Orleans</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-3">
                Aggressive and animated style. Known for raw energy, memorable moments, and authentic delivery.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-red-400">Style:</span> Aggressive, animated
                </div>
                <div>
                  <span className="text-red-400">Bonus:</span> +10% Charisma in home
                </div>
                <div>
                  <span className="text-red-400">Badge:</span> Southern Soldiers
                </div>
                <div>
                  <span className="text-red-400">Legends:</span> Energy kings
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-yellow-500 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-900/50 flex items-center justify-center">
                  <span className="text-2xl">🌾</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-yellow-500">MIDWEST</h4>
                  <span className="text-xs text-zinc-500">Chicago, Detroit, Cleveland, Milwaukee</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-3">
                Gritty and authentic. Known for substance, real talk, and hard-hitting content.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-yellow-400">Style:</span> Gritty, authentic
                </div>
                <div>
                  <span className="text-yellow-400">Bonus:</span> +10% Creativity in home
                </div>
                <div>
                  <span className="text-yellow-400">Badge:</span> Midwest Monsters
                </div>
                <div>
                  <span className="text-yellow-400">Legends:</span> Street poets
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* City Rankings */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-display font-bold text-green-500">CITY POWER RANKINGS</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Each city has a power ranking based on the combined ELO of its battlers. Represent your city well to climb
            the rankings.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-zinc-800">
              <span className="text-yellow-500 font-bold w-6">#1</span>
              <span className="text-zinc-100">New York City</span>
              <span className="text-xs text-zinc-500 ml-auto">15,432 combined ELO</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-zinc-800">
              <span className="text-zinc-400 font-bold w-6">#2</span>
              <span className="text-zinc-100">Los Angeles</span>
              <span className="text-xs text-zinc-500 ml-auto">14,891 combined ELO</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-zinc-800">
              <span className="text-amber-700 font-bold w-6">#3</span>
              <span className="text-zinc-100">Atlanta</span>
              <span className="text-xs text-zinc-500 ml-auto">13,245 combined ELO</span>
            </div>
          </div>
        </section>

        {/* Regional Competitions */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-display font-bold text-yellow-500">REGIONAL COMPETITIONS</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-zinc-100 mb-2">CITY VS CITY</h4>
              <p className="text-sm text-zinc-400">
                Monthly battles between top battlers from rival cities. NYC vs Philly, LA vs Oakland, ATL vs Houston.
              </p>
            </div>
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-zinc-100 mb-2">REGIONAL CHAMPIONSHIP</h4>
              <p className="text-sm text-zinc-400">
                Quarterly tournament. Top 8 from the region compete for the regional crown and $10K prize.
              </p>
            </div>
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-zinc-100 mb-2">COAST TO COAST</h4>
              <p className="text-sm text-zinc-400">
                Annual East vs West, North vs South events. Regional pride on the line.
              </p>
            </div>
          </div>
        </section>

        {/* Home Advantage */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-display font-bold text-purple-500">HOME FIELD ADVANTAGE</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">Battling in your home city gives significant bonuses:</p>
          <ul className="text-sm text-zinc-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>
                <strong>+15% Crowd Energy</strong> - Your people show up and show out
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>
                <strong>+10% Regional Stat</strong> - Your region's specialty stat gets boosted
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>
                <strong>-10% Stress</strong> - Comfort of home reduces pressure
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>
                <strong>+$500 Base Pay</strong> - Local hero premium
              </span>
            </li>
          </ul>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/guide/events"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 text-zinc-100 font-display transition-colors"
          >
            ← PREV: TIME & EVENTS
          </Link>
          <Link
            href="/guide/rivalries"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 border-2 border-teal-400 text-white font-display transition-colors"
          >
            NEXT: RIVALRIES →
          </Link>
        </div>
      </div>
    </div>
  )
}
