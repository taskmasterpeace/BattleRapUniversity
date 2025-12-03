"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, Search, Pen, Mic, Heart, BedDouble } from "lucide-react"

export default function PrepPhasePage() {
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
          <Calendar className="w-5 h-5 text-blue-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">THE PREP PHASE</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-blue-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-blue-500 mb-4">PREPARATION IS EVERYTHING</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Every battle has a 7-14 day prep window. What you do during this time determines your performance. This is
            the core of the game.
          </p>
          <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
            <p className="text-sm font-display font-bold text-yellow-500 mb-2">KEY RULE:</p>
            <p className="text-sm text-zinc-300">
              Each day, you choose ONE focus. Good prep can take you from "competent" (5) to "god tier" (8) for that
              battle!
            </p>
          </div>
        </section>

        {/* Focus Types */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">DAILY FOCUS OPTIONS</h3>
          <div className="space-y-6">
            {/* Research */}
            <div className="bg-zinc-800 border-l-4 border-green-500 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Search className="w-6 h-6 text-green-500" />
                <h4 className="font-display font-bold text-green-500 text-lg">RESEARCH</h4>
              </div>
              <p className="text-sm text-zinc-300 mb-3">Study your opponent, find angles, discover weaknesses.</p>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>
                  <strong className="text-green-400">Effect:</strong> +0.05 Creativity/day, +0.03 Lyricism/day
                </p>
                <p>
                  <strong className="text-green-400">Bonus:</strong> Doubles haymaker chance (15% → 30%)
                </p>
                <p>
                  <strong className="text-green-400">Best For:</strong> Angle Masters, anyone who wants big peak moments
                </p>
              </div>
              <div className="mt-3 bg-zinc-900 p-3 text-xs text-zinc-400 italic">
                "You spend the day watching old battles, taking notes on patterns. You discover he always starts
                slow—you can capitalize on that."
              </div>
            </div>

            {/* Writing */}
            <div className="bg-zinc-800 border-l-4 border-orange-500 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Pen className="w-6 h-6 text-orange-500" />
                <h4 className="font-display font-bold text-orange-500 text-lg">WRITING</h4>
              </div>
              <p className="text-sm text-zinc-300 mb-3">Craft bars, schemes, and complex wordplay.</p>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>
                  <strong className="text-orange-400">Effect:</strong> +0.10 Lyricism/day, +0.10 Wordplay/day, +0.10
                  Creativity/day
                </p>
                <p>
                  <strong className="text-orange-400">Bonus:</strong> Stacks with Technical Writer badge (1.35x
                  multiplier!)
                </p>
                <p>
                  <strong className="text-orange-400">Best For:</strong> Technical Writers, Small Room Circuit
                  specialists
                </p>
              </div>
              <div className="mt-3 bg-zinc-900 p-3 text-xs text-zinc-400 italic">
                "You lock yourself in a room with a notepad, crafting multi-syllable schemes and layered metaphors for
                hours."
              </div>
            </div>

            {/* Performance */}
            <div className="bg-zinc-800 border-l-4 border-blue-500 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Mic className="w-6 h-6 text-blue-500" />
                <h4 className="font-display font-bold text-blue-500 text-lg">PERFORMANCE</h4>
              </div>
              <p className="text-sm text-zinc-300 mb-3">Practice delivery, stage presence, and crowd control.</p>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>
                  <strong className="text-blue-400">Effect:</strong> +0.10 Flow/day, +0.10 Stage Presence/day, +0.10
                  Charisma/day
                </p>
                <p>
                  <strong className="text-blue-400">Bonus:</strong> Stacks with Performance Beast badge (1.3x!)
                </p>
                <p>
                  <strong className="text-blue-400">Best For:</strong> Performers, Main Stage Arena specialists
                </p>
              </div>
              <div className="mt-3 bg-zinc-900 p-3 text-xs text-zinc-400 italic">
                "You rent a studio and practice in front of a mirror, working on timing, energy projection, and crowd
                engagement."
              </div>
            </div>

            {/* Life */}
            <div className="bg-zinc-800 border-l-4 border-purple-500 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-6 h-6 text-purple-500" />
                <h4 className="font-display font-bold text-purple-500 text-lg">LIFE</h4>
              </div>
              <p className="text-sm text-zinc-300 mb-3">Handle personal matters, build support system, manage money.</p>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>
                  <strong className="text-purple-400">Effect:</strong> +0.10 Family Bond/day, +0.05 Financial/day
                </p>
                <p>
                  <strong className="text-purple-400">Bonus:</strong> Triggers positive life events, builds long-term
                  stability
                </p>
                <p>
                  <strong className="text-purple-400">Best For:</strong> Sustainable careers, recovering from drama
                </p>
              </div>
              <div className="mt-3 bg-zinc-900 p-3 text-xs text-zinc-400 italic">
                "You spend time with family, attend a sponsor meeting, and handle business. Your support system
                strengthens."
              </div>
            </div>

            {/* Rest */}
            <div className="bg-zinc-800 border-l-4 border-cyan-500 p-4">
              <div className="flex items-center gap-3 mb-3">
                <BedDouble className="w-6 h-6 text-cyan-500" />
                <h4 className="font-display font-bold text-cyan-500 text-lg">REST</h4>
              </div>
              <p className="text-sm text-zinc-300 mb-3">Recover energy, reduce stress, prevent burnout.</p>
              <div className="text-xs text-zinc-400 space-y-1">
                <p>
                  <strong className="text-cyan-400">Effect:</strong> +0.10 Resilience/day, reduces stress
                </p>
                <p>
                  <strong className="text-cyan-400">Bonus:</strong> Significantly lowers choke probability
                </p>
                <p>
                  <strong className="text-cyan-400">Best For:</strong> Everyone! Especially after consecutive battles
                </p>
              </div>
              <div className="mt-3 bg-zinc-900 p-3 text-xs text-zinc-400 italic">
                "You take a day off, sleep in, hang with friends. When you wake up, your mind is sharper and the
                pressure feels lighter."
              </div>
            </div>
          </div>
        </section>

        {/* Example Schedules */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">EXAMPLE PREP SCHEDULES</h3>

          <div className="space-y-4">
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-green-500 mb-2">TECHNICAL WRITER (10-Day Prep)</h4>
              <div className="text-sm text-zinc-300 space-y-2">
                <p>
                  <span className="text-green-500">Day 1-2:</span> Research (find angles, study opponent)
                </p>
                <p>
                  <span className="text-orange-500">Day 3-8:</span> Writing (craft complex schemes - 6 days!)
                </p>
                <p>
                  <span className="text-blue-500">Day 9:</span> Performance (practice delivery once)
                </p>
                <p>
                  <span className="text-cyan-500">Day 10:</span> Rest (reduce choke risk before battle)
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Expected: +1.08 Lyricism, +1.08 Wordplay, +1.08 Creativity (before badge multipliers)
                </p>
              </div>
            </div>

            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-blue-500 mb-2">PERFORMER (7-Day Prep)</h4>
              <div className="text-sm text-zinc-300 space-y-2">
                <p>
                  <span className="text-green-500">Day 1:</span> Research (basic opponent study)
                </p>
                <p>
                  <span className="text-blue-500">Day 2-6:</span> Performance (stage work, crowd control - 5 days!)
                </p>
                <p>
                  <span className="text-cyan-500">Day 7:</span> Rest (stay sharp)
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Expected: +0.50 to all performance stats (before badge multipliers)
                </p>
              </div>
            </div>

            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-purple-500 mb-2">
                FREESTYLE GENIUS (3-Day Prep - Low Prep Bonus!)
              </h4>
              <div className="text-sm text-zinc-300 space-y-2">
                <p>
                  <span className="text-green-500">Day 1-2:</span> Research (prep scenarios, not bars)
                </p>
                <p>
                  <span className="text-cyan-500">Day 3:</span> Rest (stay loose and ready to improvise)
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Expected: Lower raw numbers BUT gets +15% Low Prep Bonus (thrives on minimal prep!)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Warnings */}
        <section className="bg-red-900/20 border-2 border-red-500 p-6">
          <h3 className="text-xl font-display font-bold text-red-500 mb-3">⚠️ WHAT HAPPENS IF YOU DON'T PREP?</h3>
          <p className="text-zinc-300 mb-3">
            <strong className="text-red-400">No-Show Penalty:</strong> -30% to ALL attributes, tripled choke chance,
            extra rating penalty
          </p>
          <p className="text-sm text-zinc-400">
            Never skip prep entirely! Even 3 days of rest is better than nothing. The game will punish you severely for
            not preparing.
          </p>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/guide/character-creation"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 text-zinc-100 font-display transition-colors"
          >
            ← PREV: CHARACTER CREATION
          </Link>
          <Link
            href="/guide/battle"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 border-2 border-blue-400 text-white font-display transition-colors"
          >
            NEXT: BATTLE MECHANICS →
          </Link>
        </div>
      </div>
    </div>
  )
}
