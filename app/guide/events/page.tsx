"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, Sparkles, AlertTriangle, Gift, Newspaper } from "lucide-react"

export default function EventsPage() {
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
          <Calendar className="w-5 h-5 text-indigo-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">TIME & EVENTS</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-indigo-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-indigo-500 mb-4">LIFE HAPPENS</h2>
          <p className="text-zinc-300 leading-relaxed">
            Between battles, random events occur that can help or hurt your career. Managing these events and their
            consequences is part of being a professional battler.
          </p>
        </section>

        {/* Time Flow */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">HOW TIME WORKS</h3>
          <div className="space-y-3">
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-zinc-100 mb-2">GAME CALENDAR</h4>
              <p className="text-sm text-zinc-400">
                Time advances in weeks. Each battle cycle takes 2-4 weeks (prep + battle + recovery).
              </p>
            </div>
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-zinc-100 mb-2">SEASONS</h4>
              <p className="text-sm text-zinc-400">
                The game runs on seasons (roughly 1 year each). Season-end tournaments and rankings reset certain stats.
              </p>
            </div>
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-zinc-100 mb-2">CAREER SPAN</h4>
              <p className="text-sm text-zinc-400">
                Battlers have 10-15 year careers. Age affects attributes over time (peak years, veteran decline).
              </p>
            </div>
          </div>
        </section>

        {/* Positive Events */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-display font-bold text-green-500">POSITIVE EVENTS</h3>
          </div>
          <div className="space-y-3">
            {[
              {
                name: "Sponsor Deal",
                effect: "+$5,000-20,000, ongoing income",
                trigger: "High charisma, tier promotion",
              },
              { name: "Viral Moment", effect: "+500 fans, media coverage", trigger: "Haymaker in big battle" },
              { name: "Family Support", effect: "-20% stress, +Family Bond", trigger: "Life prep, high Family Bond" },
              { name: "Feature Request", effect: "+$2,000, +exposure", trigger: "Good media relationships" },
              { name: "Award Nomination", effect: "+prestige, +offers", trigger: "Strong season performance" },
            ].map((event) => (
              <div key={event.name} className="bg-zinc-800 border-l-4 border-green-500 p-3">
                <div className="flex justify-between items-start">
                  <span className="font-display font-bold text-green-400">{event.name}</span>
                  <span className="text-xs text-green-500">{event.effect}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">Trigger: {event.trigger}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Negative Events */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-display font-bold text-red-500">NEGATIVE EVENTS</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: "Injury", effect: "-1 week prep, +15% stress", trigger: "Bad luck, low resilience" },
              { name: "Personal Drama", effect: "+25% stress, -Family Bond", trigger: "Low Family Bond, neglect" },
              { name: "Financial Trouble", effect: "-$2,000, stress increase", trigger: "Low Financial IQ, bad deals" },
              { name: "Beef Escalation", effect: "Forced grudge match", trigger: "Unresolved rivalry" },
              { name: "Media Scandal", effect: "-reputation, blogger attacks", trigger: "Controversy, bad takes" },
            ].map((event) => (
              <div key={event.name} className="bg-zinc-800 border-l-4 border-red-500 p-3">
                <div className="flex justify-between items-start">
                  <span className="font-display font-bold text-red-400">{event.name}</span>
                  <span className="text-xs text-red-500">{event.effect}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">Trigger: {event.trigger}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Choice Events */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-display font-bold text-yellow-500">CHOICE EVENTS</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">Some events present choices that shape your career path:</p>

          <div className="space-y-4">
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-yellow-400 mb-2">LEAGUE SWITCH OFFER</h4>
              <p className="text-sm text-zinc-400 mb-2">A rival league offers you a contract.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-900/20 p-2">
                  <span className="text-green-400">Accept:</span> New opportunities, burn bridges
                </div>
                <div className="bg-red-900/20 p-2">
                  <span className="text-red-400">Decline:</span> Loyalty bonus, stay comfortable
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-yellow-400 mb-2">CONTROVERSIAL ANGLE</h4>
              <p className="text-sm text-zinc-400 mb-2">You find devastating personal info about your opponent.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-900/20 p-2">
                  <span className="text-green-400">Use It:</span> +haymaker chance, -reputation
                </div>
                <div className="bg-red-900/20 p-2">
                  <span className="text-red-400">Pass:</span> Respected, miss advantage
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-yellow-400 mb-2">MEDIA INTERVIEW</h4>
              <p className="text-sm text-zinc-400 mb-2">A blogger wants an exclusive interview.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-900/20 p-2">
                  <span className="text-green-400">Agree:</span> +coverage, time cost
                </div>
                <div className="bg-red-900/20 p-2">
                  <span className="text-red-400">Decline:</span> Focus on prep, less exposure
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tournaments */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-display font-bold text-purple-500">SPECIAL TOURNAMENTS</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">Seasonal tournaments offer big prizes and prestige:</p>

          <div className="space-y-3">
            <div className="bg-zinc-800 p-3">
              <span className="font-display font-bold text-purple-400">Regional Championship</span>
              <p className="text-xs text-zinc-500">
                Top 8 battlers from your region. Winner gets regional badge + $10K.
              </p>
            </div>
            <div className="bg-zinc-800 p-3">
              <span className="font-display font-bold text-yellow-400">League Grand Prix</span>
              <p className="text-xs text-zinc-500">
                Season-end tournament. Top 16 qualify. Winner gets champion badge + $50K.
              </p>
            </div>
            <div className="bg-zinc-800 p-3">
              <span className="font-display font-bold text-orange-400">Battle of the Year</span>
              <p className="text-xs text-zinc-500">
                Invitational for God Tier only. Massive prestige, legacy-defining.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/guide/tiers"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 text-zinc-100 font-display transition-colors"
          >
            ← PREV: TIER SYSTEM
          </Link>
          <Link
            href="/guide/regions"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-400 text-white font-display transition-colors"
          >
            NEXT: REGIONS →
          </Link>
        </div>
      </div>
    </div>
  )
}
