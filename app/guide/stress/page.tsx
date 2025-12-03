"use client"

import Link from "next/link"
import { ArrowLeft, Heart, AlertTriangle, Shield, BedDouble, TrendingDown } from "lucide-react"

export default function StressPage() {
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
          <Heart className="w-5 h-5 text-pink-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">STRESS & RESILIENCE</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-pink-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-pink-500 mb-4">THE MENTAL GAME</h2>
          <p className="text-zinc-300 leading-relaxed">
            Stress is an invisible stat that affects your performance. High stress increases choke probability and
            reduces consistency. Managing stress is crucial for sustained success.
          </p>
        </section>

        {/* Stress Meter */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">STRESS LEVELS</h3>
          <div className="space-y-3">
            {[
              { level: "0-20%", label: "CALM", color: "green", effect: "Optimal performance, lowest choke risk" },
              { level: "21-40%", label: "FOCUSED", color: "blue", effect: "Slight edge, manageable pressure" },
              { level: "41-60%", label: "TENSE", color: "yellow", effect: "Noticeable pressure, +5% choke risk" },
              { level: "61-80%", label: "STRESSED", color: "orange", effect: "High pressure, +15% choke risk" },
              { level: "81-100%", label: "CRITICAL", color: "red", effect: "Breakdown risk, +30% choke risk" },
            ].map((tier) => (
              <div
                key={tier.level}
                className={`flex items-center gap-4 p-3 bg-zinc-800 border-l-4 border-${tier.color}-500`}
              >
                <span className={`font-mono font-bold text-${tier.color}-500 w-16`}>{tier.level}</span>
                <span className={`font-display font-bold text-${tier.color}-400 w-24`}>{tier.label}</span>
                <span className="text-sm text-zinc-400">{tier.effect}</span>
              </div>
            ))}
          </div>
        </section>

        {/* What Causes Stress */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-display font-bold text-red-500">STRESS TRIGGERS</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-display font-bold text-zinc-100">BATTLE-RELATED</h4>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">+15%</span>
                  <span>Losing a battle</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">+25%</span>
                  <span>Choking during a round</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">+10%</span>
                  <span>Facing higher-tier opponent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">+20%</span>
                  <span>Grudge match pressure</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-display font-bold text-zinc-100">LIFE EVENTS</h4>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">+20%</span>
                  <span>Negative life event</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">+15%</span>
                  <span>Financial problems</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">+10%</span>
                  <span>Media scandal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">+5%</span>
                  <span>Back-to-back battles</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Resilience */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-display font-bold text-purple-500">RESILIENCE STAT</h3>
          </div>
          <p className="text-zinc-300 mb-4">Resilience is your natural stress resistance. Higher resilience means:</p>
          <ul className="text-sm text-zinc-400 space-y-2 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>Lower base choke chance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>Stress triggers have reduced effect</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>Faster natural stress recovery</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>Better performance under pressure</span>
            </li>
          </ul>
          <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
            <p className="text-sm text-zinc-300">
              <strong className="text-yellow-500">RECOMMENDATION:</strong> Keep Resilience at 5+ minimum. Below 4,
              you'll choke frequently in high-stakes battles.
            </p>
          </div>
        </section>

        {/* Reducing Stress */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BedDouble className="w-6 h-6 text-cyan-500" />
            <h3 className="text-xl font-display font-bold text-cyan-500">STRESS RECOVERY</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-zinc-800 border-l-4 border-cyan-500 p-4">
              <h4 className="font-display font-bold text-cyan-400 mb-2">REST PREP (-15% per day)</h4>
              <p className="text-sm text-zinc-400">
                Most effective stress reducer. Essential after losses or before big battles.
              </p>
            </div>
            <div className="bg-zinc-800 border-l-4 border-purple-500 p-4">
              <h4 className="font-display font-bold text-purple-400 mb-2">LIFE PREP (-5% per day)</h4>
              <p className="text-sm text-zinc-400">
                Moderate stress relief while building Family Bond and Financial stats.
              </p>
            </div>
            <div className="bg-zinc-800 border-l-4 border-green-500 p-4">
              <h4 className="font-display font-bold text-green-400 mb-2">WINNING BATTLES (-10%)</h4>
              <p className="text-sm text-zinc-400">Success breeds confidence. Winning reduces stress naturally.</p>
            </div>
            <div className="bg-zinc-800 border-l-4 border-yellow-500 p-4">
              <h4 className="font-display font-bold text-yellow-400 mb-2">POSITIVE LIFE EVENTS (-20%)</h4>
              <p className="text-sm text-zinc-400">Good news at home, sponsor deals, and milestone achievements.</p>
            </div>
          </div>
        </section>

        {/* Choke Formula */}
        <section className="bg-red-900/20 border-2 border-red-500 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-display font-bold text-red-500">CHOKE PROBABILITY</h3>
          </div>
          <div className="bg-zinc-900 p-4 font-mono text-sm text-zinc-300 mb-4">
            <p>Base Choke = 3%</p>
            <p>+ (Stress Level × 0.3)</p>
            <p>- (Resilience × 0.5)</p>
            <p>+ Pressure Modifiers</p>
            <p className="text-zinc-500 mt-2">= Final Choke Chance per segment</p>
          </div>
          <p className="text-sm text-zinc-400">
            Example: 60% stress, 5 resilience = 3 + 18 - 2.5 ={" "}
            <strong className="text-red-400">18.5% choke chance</strong>
          </p>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/guide/battle"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 text-zinc-100 font-display transition-colors"
          >
            ← PREV: BATTLE MECHANICS
          </Link>
          <Link
            href="/guide/tiers"
            className="px-6 py-3 bg-pink-600 hover:bg-pink-500 border-2 border-pink-400 text-white font-display transition-colors"
          >
            NEXT: TIER SYSTEM →
          </Link>
        </div>
      </div>
    </div>
  )
}
