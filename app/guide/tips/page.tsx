"use client"

import Link from "next/link"
import { ArrowLeft, Lightbulb, AlertTriangle, CheckCircle, Star } from "lucide-react"

export default function TipsPage() {
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
          <Lightbulb className="w-5 h-5 text-lime-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">PRO TIPS</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-lime-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-lime-500 mb-4">ADVANCED STRATEGIES</h2>
          <p className="text-zinc-300 leading-relaxed">
            These tips come from mastering the game mechanics. Use them to climb faster and avoid common pitfalls.
          </p>
        </section>

        {/* Early Game */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">EARLY GAME (None → Low Tier)</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-zinc-800">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-zinc-100">Specialize Early</span>
                <p className="text-sm text-zinc-400">
                  Pick one league (Small Room or Main Stage) and master it before branching out.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-zinc-800">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-zinc-100">Never Skip Prep</span>
                <p className="text-sm text-zinc-400">
                  Even 3 days of rest is better than no prep. The penalty for no prep is brutal.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-zinc-800">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-zinc-100">Build Win Streaks</span>
                <p className="text-sm text-zinc-400">
                  Take easier battles to build momentum. Confidence reduces stress naturally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mid Game */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">MID GAME (Low → Mid Tier)</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-zinc-800">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-zinc-100">Challenge Up Strategically</span>
                <p className="text-sm text-zinc-400">
                  Beat higher-tier opponents for big ELO gains. But only when well-prepped.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-zinc-800">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-zinc-100">Cultivate Rivalries</span>
                <p className="text-sm text-zinc-400">Keep 2-3 rivalries in the 50-75 heat range for payout bonuses.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-zinc-800">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-zinc-100">Badge Synergies</span>
                <p className="text-sm text-zinc-400">
                  Focus on badges that multiply your strengths, not fix weaknesses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Late Game */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">LATE GAME (Top → God Tier)</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-zinc-800">
              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-zinc-100">Protect Your Rating</span>
                <p className="text-sm text-zinc-400">
                  Losses to lower-tier opponents are devastating. Be selective with battles.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-zinc-800">
              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-zinc-100">Tournament Focus</span>
                <p className="text-sm text-zinc-400">
                  Championships offer the biggest prestige. Time your peak for tournament season.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-zinc-800">
              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-zinc-100">Legacy Building</span>
                <p className="text-sm text-zinc-400">
                  At God tier, it's about memorable moments. Take big grudge matches for history.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="bg-red-900/20 border-2 border-red-500 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-display font-bold text-red-500">COMMON MISTAKES</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-red-500 font-bold">✗</span>
              <div>
                <span className="font-display font-bold text-zinc-100">Ignoring Resilience</span>
                <p className="text-sm text-zinc-400">
                  Below 5 resilience = frequent chokes. Don't neglect mental game.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500 font-bold">✗</span>
              <div>
                <span className="font-display font-bold text-zinc-100">Back-to-Back Battles</span>
                <p className="text-sm text-zinc-400">No recovery time = stress accumulation = eventual breakdown.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500 font-bold">✗</span>
              <div>
                <span className="font-display font-bold text-zinc-100">Chasing Payouts Over ELO</span>
                <p className="text-sm text-zinc-400">
                  Early career, focus on rating. Money comes with tier progression.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500 font-bold">✗</span>
              <div>
                <span className="font-display font-bold text-zinc-100">Neglecting Life Stats</span>
                <p className="text-sm text-zinc-400">Low Family Bond and Financial IQ trigger negative life events.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500 font-bold">✗</span>
              <div>
                <span className="font-display font-bold text-zinc-100">Fighting Outside Your League</span>
                <p className="text-sm text-zinc-400">
                  Technical writer in Main Stage Arena = playing to your weakness.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pro Formulas */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">OPTIMAL PREP FORMULAS</h3>
          <div className="space-y-4">
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-green-500 mb-2">TECHNICAL WRITER (10+ Day Prep)</h4>
              <p className="text-sm text-zinc-400 font-mono">Research(2) → Writing(6) → Performance(1) → Rest(1)</p>
            </div>
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-blue-500 mb-2">PERFORMER (7-10 Day Prep)</h4>
              <p className="text-sm text-zinc-400 font-mono">Research(1) → Performance(5) → Rest(1-3)</p>
            </div>
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-purple-500 mb-2">BALANCED (10 Day Prep)</h4>
              <p className="text-sm text-zinc-400 font-mono">Research(2) → Writing(3) → Performance(3) → Rest(2)</p>
            </div>
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-yellow-500 mb-2">HIGH STRESS RECOVERY</h4>
              <p className="text-sm text-zinc-400 font-mono">Rest(3) → Life(2) → Research(2) → Writing/Perf(rest)</p>
            </div>
          </div>
        </section>

        {/* Final Wisdom */}
        <section className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border-2 border-orange-500 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">FINAL WISDOM</h3>
          <blockquote className="text-zinc-300 italic text-lg leading-relaxed">
            "The best battlers aren't just skilled - they're strategic. Know your strengths, manage your weaknesses, and
            always be three moves ahead. Battle rap is chess, not checkers."
          </blockquote>
          <p className="text-sm text-zinc-500 mt-3 text-right">- Battle Rap University</p>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/guide/rivalries"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 text-zinc-100 font-display transition-colors"
          >
            ← PREV: RIVALRIES
          </Link>
          <Link
            href="/guide"
            className="px-6 py-3 bg-lime-600 hover:bg-lime-500 border-2 border-lime-400 text-white font-display transition-colors"
          >
            BACK TO GUIDE HUB →
          </Link>
        </div>
      </div>
    </div>
  )
}
