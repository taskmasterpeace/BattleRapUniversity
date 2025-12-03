"use client"

import Link from "next/link"
import { ArrowLeft, Users, Mic, Trophy, MapPin } from "lucide-react"

export default function LeaguesPage() {
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
          <Users className="w-5 h-5 text-purple-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">LEAGUES & CITIES</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-purple-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-purple-500 mb-4">TWO PATHS TO GLORY</h2>
          <p className="text-zinc-300 leading-relaxed">
            Battle rap has two major league systems, each with different scoring, crowds, and career paths. Your
            attributes determine which league suits you best.
          </p>
        </section>

        {/* Small Room Circuit */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mic className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-display font-bold text-blue-500">SMALL ROOM CIRCUIT</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-display font-bold text-zinc-100 mb-3">CHARACTERISTICS</h4>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>• 2-minute rounds (4 segments each)</li>
                <li>• Intimate venues, 50-200 capacity</li>
                <li>• Hardcore fans who catch every bar</li>
                <li>• Pen game rewarded heavily</li>
                <li>• Lower base pay, prestige-focused</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-zinc-100 mb-3">SCORING WEIGHT</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-zinc-800 h-4">
                    <div className="bg-orange-500 h-4" style={{ width: "60%" }}></div>
                  </div>
                  <span className="text-xs text-orange-500 w-16">60% PEN</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-zinc-800 h-4">
                    <div className="bg-blue-500 h-4" style={{ width: "40%" }}></div>
                  </div>
                  <span className="text-xs text-blue-500 w-16">40% PERF</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-3">Best for: Technical Writers, Scheme Lords</p>
            </div>
          </div>
        </section>

        {/* Main Stage Arena */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-display font-bold text-yellow-500">MAIN STAGE ARENA</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-display font-bold text-zinc-100 mb-3">CHARACTERISTICS</h4>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>• 3-minute rounds (6 segments each)</li>
                <li>• Large venues, 500-5000+ capacity</li>
                <li>• Casual fans, energy matters more</li>
                <li>• Performance and crowd control key</li>
                <li>• Higher pay, mainstream exposure</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-zinc-100 mb-3">SCORING WEIGHT</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-zinc-800 h-4">
                    <div className="bg-orange-500 h-4" style={{ width: "40%" }}></div>
                  </div>
                  <span className="text-xs text-orange-500 w-16">40% PEN</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-zinc-800 h-4">
                    <div className="bg-blue-500 h-4" style={{ width: "60%" }}></div>
                  </div>
                  <span className="text-xs text-blue-500 w-16">60% PERF</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-3">Best for: Performers, Crowd Workers</p>
            </div>
          </div>
        </section>

        {/* City Tiers */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-display font-bold text-green-500">CITY TIER SYSTEM</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Your home city affects crowd bonuses, tournament access, and regional rivalries.
          </p>

          <div className="space-y-4">
            <div className="bg-zinc-800 border-l-4 border-purple-500 p-4">
              <h4 className="font-display font-bold text-purple-500 mb-2">MAJOR CITIES (Tier 1)</h4>
              <p className="text-sm text-zinc-300 mb-2">Population 1M+ | NYC, LA, Chicago, Houston, Phoenix</p>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>• +10% crowd energy bonus</li>
                <li>• Access to all major leagues</li>
                <li>• Higher media coverage</li>
                <li>• More frequent battle offers</li>
              </ul>
            </div>

            <div className="bg-zinc-800 border-l-4 border-blue-500 p-4">
              <h4 className="font-display font-bold text-blue-500 mb-2">REGIONAL CITIES (Tier 2)</h4>
              <p className="text-sm text-zinc-300 mb-2">Population 300K-1M | Atlanta, Detroit, Philadelphia</p>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>• +15% local tournament bonus</li>
                <li>• Strong regional identity</li>
                <li>• Loyal hometown fanbase</li>
                <li>• Regional league access</li>
              </ul>
            </div>

            <div className="bg-zinc-800 border-l-4 border-green-500 p-4">
              <h4 className="font-display font-bold text-green-500 mb-2">UNDERGROUND CITIES (Tier 3)</h4>
              <p className="text-sm text-zinc-300 mb-2">Population under 300K | Smaller cities, suburbs</p>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>• +5% authenticity bonus</li>
                <li>• Underdog narrative appeal</li>
                <li>• Must travel for major events</li>
                <li>• Harder to get discovered</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Regions */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">REGIONAL BREAKDOWN</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "East Coast", cities: "NYC, Philly, Boston", style: "Technical, bars-heavy" },
              { name: "West Coast", cities: "LA, Oakland, San Diego", style: "Performance, energy" },
              { name: "South", cities: "Atlanta, Houston, Miami", style: "Aggressive, animated" },
              { name: "Midwest", cities: "Chicago, Detroit, Cleveland", style: "Gritty, authentic" },
            ].map((region) => (
              <div key={region.name} className="bg-zinc-800 p-4">
                <h4 className="font-display font-bold text-zinc-100 mb-2">{region.name}</h4>
                <p className="text-xs text-zinc-500 mb-1">{region.cities}</p>
                <p className="text-xs text-zinc-400">Style: {region.style}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/guide/prep"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 text-zinc-100 font-display transition-colors"
          >
            ← PREV: PREP PHASE
          </Link>
          <Link
            href="/guide/battle"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 border-2 border-purple-400 text-white font-display transition-colors"
          >
            NEXT: BATTLE MECHANICS →
          </Link>
        </div>
      </div>
    </div>
  )
}
