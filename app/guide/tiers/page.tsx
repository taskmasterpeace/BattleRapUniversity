"use client"

import Link from "next/link"
import { ArrowLeft, TrendingUp, Crown, Star, Award, Medal } from "lucide-react"

export default function TiersPage() {
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
          <TrendingUp className="w-5 h-5 text-cyan-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">TIER SYSTEM</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-cyan-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-cyan-500 mb-4">CLIMBING THE RANKS</h2>
          <p className="text-zinc-300 leading-relaxed">
            Your tier represents your standing in the battle rap world. It's determined by your ELO rating, which
            changes after every battle based on your performance and opponent's tier.
          </p>
        </section>

        {/* Tier Breakdown */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-6">THE FIVE TIERS</h3>
          <div className="space-y-4">
            <div className="bg-zinc-800 border-l-4 border-zinc-600 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                  <span className="text-zinc-400 text-sm">?</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-zinc-400">NONE TIER</h4>
                  <span className="text-xs text-zinc-500">Under 800 ELO</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mt-2">
                Unknown battler. Limited offers, proving ground leagues only. Everyone starts here.
              </p>
              <div className="mt-3 text-xs text-zinc-500">
                <strong>Unlocks:</strong> Basic battle offers, local events
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-amber-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-amber-900/50 rounded-full flex items-center justify-center">
                  <Medal className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-amber-700">LOW TIER</h4>
                  <span className="text-xs text-zinc-500">800 - 1199 ELO</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mt-2">
                Recognized name in the underground. Starting to get consistent offers and small payouts.
              </p>
              <div className="mt-3 text-xs text-zinc-500">
                <strong>Unlocks:</strong> Regional tournaments, blogger coverage, better payouts
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-yellow-500 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-yellow-900/50 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-yellow-500">MID TIER</h4>
                  <span className="text-xs text-zinc-500">1200 - 1599 ELO</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mt-2">
                Established battler. Regular league appearances, growing fanbase, decent income from battles.
              </p>
              <div className="mt-3 text-xs text-zinc-500">
                <strong>Unlocks:</strong> Main stage events, sponsor opportunities, national recognition
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-purple-500 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-900/50 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-purple-500">TOP TIER</h4>
                  <span className="text-xs text-zinc-500">1600 - 1999 ELO</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mt-2">
                Elite status. Headline events, high-profile matchups, significant paydays, media attention.
              </p>
              <div className="mt-3 text-xs text-zinc-500">
                <strong>Unlocks:</strong> Championship events, premium sponsors, legacy opportunities
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-900/30 to-yellow-900/30 border-l-4 border-orange-500 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-900/50 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-orange-500">GOD TIER</h4>
                  <span className="text-xs text-zinc-500">2000+ ELO</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mt-2">
                Legend status. Historic battles, massive payouts, cultural icon. Only the greatest reach this level.
              </p>
              <div className="mt-3 text-xs text-zinc-500">
                <strong>Unlocks:</strong> Hall of Fame, legacy content, retirement options, mentorship
              </div>
            </div>
          </div>
        </section>

        {/* ELO Changes */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">ELO CHANGES</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Your rating changes after each battle based on the result and opponent tier:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left p-2 text-zinc-400">Opponent</th>
                  <th className="text-center p-2 text-green-500">Win</th>
                  <th className="text-center p-2 text-red-500">Loss</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800">
                  <td className="p-2">Higher Tier</td>
                  <td className="text-center p-2 text-green-400">+40 to +60</td>
                  <td className="text-center p-2 text-red-400">-10 to -20</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="p-2">Same Tier</td>
                  <td className="text-center p-2 text-green-400">+20 to +30</td>
                  <td className="text-center p-2 text-red-400">-20 to -30</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="p-2">Lower Tier</td>
                  <td className="text-center p-2 text-green-400">+10 to +15</td>
                  <td className="text-center p-2 text-red-400">-40 to -60</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mt-4">
            <p className="text-sm text-zinc-300">
              <strong className="text-yellow-500">STRATEGY:</strong> Beat higher-tier opponents to climb fast. Avoid
              losses to lower-tier opponents - they're devastating.
            </p>
          </div>
        </section>

        {/* Tier Benefits */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">TIER BENEFITS</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-zinc-800">
              <span className="text-green-500 font-bold w-24">Pay Scale</span>
              <span className="text-sm text-zinc-400">Higher tier = higher base pay and win bonuses</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-zinc-800">
              <span className="text-blue-500 font-bold w-24">Opponents</span>
              <span className="text-sm text-zinc-400">Access to battles against more prestigious names</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-zinc-800">
              <span className="text-purple-500 font-bold w-24">Tournaments</span>
              <span className="text-sm text-zinc-400">Entry to tier-restricted championship events</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-zinc-800">
              <span className="text-yellow-500 font-bold w-24">Media</span>
              <span className="text-sm text-zinc-400">More coverage, interviews, and content opportunities</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-zinc-800">
              <span className="text-orange-500 font-bold w-24">Sponsors</span>
              <span className="text-sm text-zinc-400">Better sponsor deals and endorsement opportunities</span>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/guide/stress"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 text-zinc-100 font-display transition-colors"
          >
            ← PREV: STRESS
          </Link>
          <Link
            href="/guide/events"
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-400 text-white font-display transition-colors"
          >
            NEXT: TIME & EVENTS →
          </Link>
        </div>
      </div>
    </div>
  )
}
