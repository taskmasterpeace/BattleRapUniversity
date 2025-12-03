"use client"

import Link from "next/link"
import { ArrowLeft, Brain, Pen, Mic, Heart, Shield } from "lucide-react"

export default function AttributesPage() {
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
          <Brain className="w-5 h-5 text-green-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">ATTRIBUTES SYSTEM</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-green-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-green-500 mb-4">YOUR BATTLER'S DNA</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Attributes define what kind of battler you are. They're grouped into three categories: Writing, Performance,
            and Personal. Each attribute ranges from 1-10.
          </p>
          <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
            <p className="text-sm text-zinc-300">
              <strong className="text-yellow-500">STARTING POINTS:</strong> You get 25 points to distribute during
              character creation. Max any single attribute at 8 to start.
            </p>
          </div>
        </section>

        {/* Writing Attributes */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Pen className="w-6 h-6 text-orange-500" />
            <h3 className="text-xl font-display font-bold text-orange-500">WRITING ATTRIBUTES</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            These determine your pen game. Weighted 60% in Small Room Circuit, 40% in Main Stage Arena.
          </p>

          <div className="space-y-4">
            <div className="bg-zinc-800 border-l-4 border-orange-500 p-4">
              <h4 className="font-display font-bold text-orange-400 mb-2">LYRICISM</h4>
              <p className="text-sm text-zinc-300 mb-2">
                Word choice, metaphor depth, poetic quality, vocabulary range.
              </p>
              <div className="text-xs text-zinc-500">
                <span className="text-orange-400">High:</span> Complex multis, literary references, quotable bars
              </div>
              <div className="text-xs text-zinc-500">
                <span className="text-red-400">Low:</span> Simple rhymes, basic vocabulary, forgettable lines
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-orange-500 p-4">
              <h4 className="font-display font-bold text-orange-400 mb-2">WORDPLAY</h4>
              <p className="text-sm text-zinc-300 mb-2">
                Double meanings, puns, homonyms, clever setups and punchlines.
              </p>
              <div className="text-xs text-zinc-500">
                <span className="text-orange-400">High:</span> Mind-bending schemes, unexpected connections
              </div>
              <div className="text-xs text-zinc-500">
                <span className="text-red-400">Low:</span> Obvious punchlines, surface-level wordplay
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-orange-500 p-4">
              <h4 className="font-display font-bold text-orange-400 mb-2">CREATIVITY</h4>
              <p className="text-sm text-zinc-300 mb-2">
                Unique angles, unexpected approaches, originality, fresh concepts.
              </p>
              <div className="text-xs text-zinc-500">
                <span className="text-orange-400">High:</span> Never-before-seen angles, innovative structures
              </div>
              <div className="text-xs text-zinc-500">
                <span className="text-red-400">Low:</span> Recycled bars, predictable angles, generic disses
              </div>
            </div>
          </div>
        </section>

        {/* Performance Attributes */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mic className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-display font-bold text-blue-500">PERFORMANCE ATTRIBUTES</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            These determine your stage presence. Weighted 60% in Main Stage Arena, 40% in Small Room Circuit.
          </p>

          <div className="space-y-4">
            <div className="bg-zinc-800 border-l-4 border-blue-500 p-4">
              <h4 className="font-display font-bold text-blue-400 mb-2">FLOW</h4>
              <p className="text-sm text-zinc-300 mb-2">Rhythm, cadence, delivery smoothness, timing, pocket.</p>
              <div className="text-xs text-zinc-500">
                <span className="text-blue-400">High:</span> Effortless delivery, rhythmic precision, musical quality
              </div>
              <div className="text-xs text-zinc-500">
                <span className="text-red-400">Low:</span> Choppy delivery, off-beat, monotone
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-blue-500 p-4">
              <h4 className="font-display font-bold text-blue-400 mb-2">STAGE PRESENCE</h4>
              <p className="text-sm text-zinc-300 mb-2">
                Command of the room, confidence, energy projection, body language.
              </p>
              <div className="text-xs text-zinc-500">
                <span className="text-blue-400">High:</span> Dominates the stage, intimidating, controls the room
              </div>
              <div className="text-xs text-zinc-500">
                <span className="text-red-400">Low:</span> Looks nervous, shrinks under pressure, forgettable presence
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-blue-500 p-4">
              <h4 className="font-display font-bold text-blue-400 mb-2">CHARISMA</h4>
              <p className="text-sm text-zinc-300 mb-2">
                Crowd connection, likeability, personality, entertainment value.
              </p>
              <div className="text-xs text-zinc-500">
                <span className="text-blue-400">High:</span> Crowd loves you, gets reactions, memorable personality
              </div>
              <div className="text-xs text-zinc-500">
                <span className="text-red-400">Low:</span> Crowd indifferent, no personality, boring to watch
              </div>
            </div>
          </div>
        </section>

        {/* Personal Attributes */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-display font-bold text-purple-500">PERSONAL ATTRIBUTES</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-4">These affect your career stability and mental game.</p>

          <div className="space-y-4">
            <div className="bg-zinc-800 border-l-4 border-purple-500 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <h4 className="font-display font-bold text-purple-400">RESILIENCE</h4>
              </div>
              <p className="text-sm text-zinc-300 mb-2">
                Mental fortitude, ability to handle pressure, recovery from setbacks.
              </p>
              <div className="text-xs text-zinc-500 mb-2">
                <span className="text-purple-400">High:</span> Never rattled, bounces back from losses, clutch performer
              </div>
              <div className="text-xs text-zinc-500 mb-2">
                <span className="text-red-400">Low:</span> Chokes under pressure, tilts after bad rounds, spiral risk
              </div>
              <div className="bg-red-900/20 p-2 mt-2">
                <p className="text-xs text-red-400">
                  <strong>CRITICAL:</strong> Low resilience = higher choke chance. Keep this at 5+ minimum!
                </p>
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-purple-500 p-4">
              <h4 className="font-display font-bold text-purple-400 mb-2">FAMILY BOND</h4>
              <p className="text-sm text-zinc-300 mb-2">Support system strength, personal stability, life balance.</p>
              <div className="text-xs text-zinc-500">
                <span className="text-purple-400">High:</span> Stable home life, support during hard times, positive
                events
              </div>
              <div className="text-xs text-zinc-500">
                <span className="text-red-400">Low:</span> Drama at home, distractions, negative life events more likely
              </div>
            </div>

            <div className="bg-zinc-800 border-l-4 border-purple-500 p-4">
              <h4 className="font-display font-bold text-purple-400 mb-2">FINANCIAL IQ</h4>
              <p className="text-sm text-zinc-300 mb-2">Money management, investment sense, sponsor appeal.</p>
              <div className="text-xs text-zinc-500">
                <span className="text-purple-400">High:</span> Better payouts, sponsor opportunities, wealth
                accumulation
              </div>
              <div className="text-xs text-zinc-500">
                <span className="text-red-400">Low:</span> Money problems, missed opportunities, financial stress
              </div>
            </div>
          </div>
        </section>

        {/* Attribute Scaling */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">ATTRIBUTE SCALE</h3>
          <div className="space-y-2">
            {[
              { range: "1-2", label: "WEAK", color: "red", desc: "Significant liability, avoid relying on this" },
              { range: "3-4", label: "BELOW AVG", color: "orange", desc: "Noticeable weakness, can be exploited" },
              { range: "5-6", label: "COMPETENT", color: "yellow", desc: "Solid foundation, won't hurt you" },
              { range: "7-8", label: "STRONG", color: "green", desc: "Defining strength, lean into this" },
              { range: "9-10", label: "ELITE", color: "purple", desc: "God tier, rare to achieve" },
            ].map((tier) => (
              <div
                key={tier.range}
                className={`flex items-center gap-4 p-3 bg-zinc-800 border-l-4 border-${tier.color}-500`}
              >
                <span className={`font-mono font-bold text-${tier.color}-500 w-12`}>{tier.range}</span>
                <span className={`font-display font-bold text-${tier.color}-400 w-28`}>{tier.label}</span>
                <span className="text-sm text-zinc-400">{tier.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/guide/game-loop"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 text-zinc-100 font-display transition-colors"
          >
            ← PREV: GAME LOOP
          </Link>
          <Link
            href="/guide/prep"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 border-2 border-green-400 text-white font-display transition-colors"
          >
            NEXT: PREP PHASE →
          </Link>
        </div>
      </div>
    </div>
  )
}
