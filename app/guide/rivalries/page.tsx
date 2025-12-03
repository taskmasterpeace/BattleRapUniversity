"use client"

import Link from "next/link"
import { ArrowLeft, Shield, Flame, Zap, DollarSign, TrendingUp } from "lucide-react"

export default function RivalriesPage() {
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
          <Shield className="w-5 h-5 text-amber-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">RIVALRIES & GRUDGES</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-amber-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-amber-500 mb-4">BEEF SELLS TICKETS</h2>
          <p className="text-zinc-300 leading-relaxed">
            Rivalries are the lifeblood of battle rap. Building beef with opponents increases stakes, media coverage,
            and payouts. But unresolved beef can spiral into forced grudge matches.
          </p>
        </section>

        {/* How Rivalries Form */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-display font-bold text-red-500">HOW RIVALRIES FORM</h3>
          </div>
          <div className="space-y-3">
            {[
              { trigger: "Competitive Battle", heat: "+20", desc: "Close battles naturally create tension" },
              { trigger: "Controversial Loss", heat: "+40", desc: "Disputed decisions breed grudges" },
              { trigger: "Public Call-Out", heat: "+30", desc: "Calling someone out in media" },
              { trigger: "Regional Beef", heat: "+15", desc: "City vs city natural rivalries" },
              { trigger: "Personal Attack", heat: "+50", desc: "Crossing lines with personal bars" },
            ].map((item) => (
              <div key={item.trigger} className="flex items-center gap-4 p-3 bg-zinc-800">
                <span className="text-red-500 font-mono font-bold w-12">{item.heat}</span>
                <div>
                  <span className="font-display font-bold text-zinc-100">{item.trigger}</span>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rivalry Levels */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">RIVALRY HEAT LEVELS</h3>
          <div className="space-y-3">
            <div className="bg-zinc-800 border-l-4 border-blue-500 p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-display font-bold text-blue-500">RESPECT</h4>
                <span className="text-xs text-zinc-500">0-25 Heat</span>
              </div>
              <p className="text-sm text-zinc-400">Mutual respect between competitors. Clean battles, no drama.</p>
            </div>
            <div className="bg-zinc-800 border-l-4 border-yellow-500 p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-display font-bold text-yellow-500">TENSION</h4>
                <span className="text-xs text-zinc-500">26-50 Heat</span>
              </div>
              <p className="text-sm text-zinc-400">Growing friction. Fans want the rematch. +25% payout bonus.</p>
            </div>
            <div className="bg-zinc-800 border-l-4 border-orange-500 p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-display font-bold text-orange-500">RIVALRY</h4>
                <span className="text-xs text-zinc-500">51-75 Heat</span>
              </div>
              <p className="text-sm text-zinc-400">Full rivalry. Media coverage intensifies. +50% payout bonus.</p>
            </div>
            <div className="bg-zinc-800 border-l-4 border-red-500 p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-display font-bold text-red-500">GRUDGE</h4>
                <span className="text-xs text-zinc-500">76-100 Heat</span>
              </div>
              <p className="text-sm text-zinc-400">Personal beef. Must settle it. +100% payout, but +25% stress.</p>
            </div>
          </div>
        </section>

        {/* Grudge Matches */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-display font-bold text-yellow-500">GRUDGE MATCHES</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">When rivalry heat hits 100, a grudge match is triggered:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/20 border border-green-500/30 p-4">
              <h4 className="font-display font-bold text-green-500 mb-2">BENEFITS</h4>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• 2x base payout</li>
                <li>• Massive media coverage</li>
                <li>• +ELO bonus for winner</li>
                <li>• Potential viral moments</li>
                <li>• Career-defining opportunity</li>
              </ul>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 p-4">
              <h4 className="font-display font-bold text-red-500 mb-2">RISKS</h4>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• +25% stress going in</li>
                <li>• Choke risk increased</li>
                <li>• Can't decline (forced match)</li>
                <li>• Loss is devastating to rep</li>
                <li>• May escalate further if close</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Managing Rivalries */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-display font-bold text-green-500">RIVALRY STRATEGY</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-zinc-100 mb-2">BUILD CONTROLLED BEEF</h4>
              <p className="text-sm text-zinc-400">
                Keep heat in the 50-75 range for payout bonuses without forced matches. Use media to stoke flames
                strategically.
              </p>
            </div>
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-zinc-100 mb-2">SETTLE WHEN READY</h4>
              <p className="text-sm text-zinc-400">
                If you're well-prepped and confident, let it hit 100 and take the grudge match. Win decisively to end
                it.
              </p>
            </div>
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-zinc-100 mb-2">COOL DOWN OPTIONS</h4>
              <p className="text-sm text-zinc-400">
                Avoid the opponent, make public peace, or let time pass. Heat decays 5 points per month naturally.
              </p>
            </div>
          </div>
        </section>

        {/* Rivalry Badges */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-display font-bold text-purple-500">RIVALRY BADGES</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">Earn special badges through rivalry performance:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-zinc-800">
              <span className="text-xl">🔥</span>
              <div>
                <span className="font-display font-bold text-zinc-100">Grudge Settler</span>
                <p className="text-xs text-zinc-500">Win 3 grudge matches</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-zinc-800">
              <span className="text-xl">👊</span>
              <div>
                <span className="font-display font-bold text-zinc-100">Beef Magnet</span>
                <p className="text-xs text-zinc-500">Have 5+ active rivalries</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-zinc-800">
              <span className="text-xl">🕊️</span>
              <div>
                <span className="font-display font-bold text-zinc-100">Peacemaker</span>
                <p className="text-xs text-zinc-500">Resolve 3 grudges without battling</p>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/guide/regions"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 text-zinc-100 font-display transition-colors"
          >
            ← PREV: REGIONS
          </Link>
          <Link
            href="/guide/tips"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 border-2 border-amber-400 text-white font-display transition-colors"
          >
            NEXT: PRO TIPS →
          </Link>
        </div>
      </div>
    </div>
  )
}
