"use client"

import Link from "next/link"
import { ArrowLeft, Target, Calendar, Swords, Trophy, TrendingUp, Repeat } from "lucide-react"

export default function GameLoopPage() {
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
          <Target className="w-5 h-5 text-orange-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">THE GAME LOOP</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-orange-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-orange-500 mb-4">THE CORE CYCLE</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Battle Rap University follows a simple but deep loop. Master each phase to climb the ranks from unknown to
            God Tier.
          </p>
        </section>

        {/* Visual Loop */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-6 text-center">THE LOOP</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
            {[
              { icon: Calendar, label: "OFFERS", color: "green", desc: "Accept battle offers" },
              { icon: Target, label: "PREP", color: "blue", desc: "Prepare for battle" },
              { icon: Swords, label: "BATTLE", color: "red", desc: "Perform on stage" },
              { icon: Trophy, label: "RESULTS", color: "yellow", desc: "Get scored & rated" },
              { icon: TrendingUp, label: "GROW", color: "purple", desc: "Level up & unlock" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 md:gap-4">
                <div className={`flex flex-col items-center p-4 bg-zinc-800 border-2 border-${step.color}-500/50`}>
                  <step.icon className={`w-8 h-8 text-${step.color}-500 mb-2`} />
                  <span className={`font-display font-bold text-${step.color}-500 text-sm`}>{step.label}</span>
                  <span className="text-xs text-zinc-500 text-center mt-1">{step.desc}</span>
                </div>
                {i < 4 && <Repeat className="w-4 h-4 text-zinc-600 rotate-0 md:rotate-0 hidden md:block" />}
              </div>
            ))}
          </div>
        </section>

        {/* Phase 1: Offers */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-display font-bold text-green-500">PHASE 1: BATTLE OFFERS</h3>
          </div>
          <p className="text-zinc-300 mb-4">
            You'll receive battle offers from leagues based on your tier and reputation. Each offer shows:
          </p>
          <ul className="text-sm text-zinc-400 space-y-2 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>
                <strong>Opponent</strong> - Their name, tier, record, and style
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>
                <strong>League</strong> - Small Room Circuit or Main Stage Arena
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>
                <strong>Payout</strong> - Base pay + bonuses for wins
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>
                <strong>Prep Time</strong> - 7-14 days to prepare
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>
                <strong>Grudge Match</strong> - Higher stakes rivalry battles
              </span>
            </li>
          </ul>
          <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
            <p className="text-sm text-zinc-300">
              <strong className="text-yellow-500">TIP:</strong> Don't always take the highest paying offer. Consider
              your matchup - a lower-tier opponent might be safer for building momentum.
            </p>
          </div>
        </section>

        {/* Phase 2: Prep */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-display font-bold text-blue-500">PHASE 2: PREPARATION</h3>
          </div>
          <p className="text-zinc-300 mb-4">This is where battles are won or lost. Each day you choose one focus:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Research", color: "green", effect: "Study opponent, boost haymaker chance" },
              { name: "Writing", color: "orange", effect: "Craft bars, boost lyricism/wordplay" },
              { name: "Performance", color: "blue", effect: "Practice delivery, boost flow/presence" },
              { name: "Life", color: "purple", effect: "Handle personal matters, build stability" },
              { name: "Rest", color: "cyan", effect: "Reduce stress, prevent choking" },
            ].map((prep) => (
              <div key={prep.name} className={`bg-zinc-800 border-l-4 border-${prep.color}-500 p-3`}>
                <span className={`font-display font-bold text-${prep.color}-500`}>{prep.name}</span>
                <p className="text-xs text-zinc-400 mt-1">{prep.effect}</p>
              </div>
            ))}
          </div>
          <Link href="/guide/prep" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 underline">
            Learn more about prep strategies →
          </Link>
        </section>

        {/* Phase 3: Battle */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Swords className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-display font-bold text-red-500">PHASE 3: THE BATTLE</h3>
          </div>
          <p className="text-zinc-300 mb-4">
            Battles are best-of-three rounds. Each round is broken into segments that get scored independently.
          </p>
          <div className="space-y-3">
            <div className="bg-zinc-800 p-3">
              <span className="font-display font-bold text-zinc-100">Segment Scoring</span>
              <p className="text-xs text-zinc-400 mt-1">
                Your attributes + prep bonuses + random variance = segment score
              </p>
            </div>
            <div className="bg-zinc-800 p-3">
              <span className="font-display font-bold text-yellow-500">Haymakers</span>
              <p className="text-xs text-zinc-400 mt-1">15-30% chance for a big moment (1.2-1.4x multiplier)</p>
            </div>
            <div className="bg-zinc-800 p-3">
              <span className="font-display font-bold text-red-500">Chokes</span>
              <p className="text-xs text-zinc-400 mt-1">3% base chance to blank (0.3x multiplier - devastating!)</p>
            </div>
          </div>
          <Link href="/guide/battle" className="inline-block mt-4 text-sm text-red-400 hover:text-red-300 underline">
            Learn more about battle mechanics →
          </Link>
        </section>

        {/* Phase 4: Results */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-display font-bold text-yellow-500">PHASE 4: RESULTS</h3>
          </div>
          <p className="text-zinc-300 mb-4">After the battle, you receive:</p>
          <ul className="text-sm text-zinc-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                <strong>ELO Change</strong> - Win/lose rating points based on opponent tier
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                <strong>Payout</strong> - Base pay + win bonus + performance bonuses
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                <strong>Media Coverage</strong> - Bloggers write about your performance
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                <strong>Badge Progress</strong> - Track achievements towards unlocking badges
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                <strong>Rivalry Updates</strong> - Build or settle beef with opponents
              </span>
            </li>
          </ul>
        </section>

        {/* Phase 5: Growth */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-display font-bold text-purple-500">PHASE 5: GROWTH</h3>
          </div>
          <p className="text-zinc-300 mb-4">Between battles, your career progresses:</p>
          <ul className="text-sm text-zinc-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>
                <strong>Tier Promotion</strong> - Hit ELO thresholds to rank up
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>
                <strong>Badge Unlocks</strong> - Earn new badges with permanent effects
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>
                <strong>Life Events</strong> - Random events that affect your career
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>
                <strong>Tournament Invites</strong> - Special high-stakes competitions
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>
                <strong>New Offers</strong> - Better opponents as you climb
              </span>
            </li>
          </ul>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/guide"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-600 text-zinc-100 font-display transition-colors"
          >
            ← BACK TO GUIDE
          </Link>
          <Link
            href="/guide/attributes"
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 border-2 border-orange-400 text-white font-display transition-colors"
          >
            NEXT: ATTRIBUTES →
          </Link>
        </div>
      </div>
    </div>
  )
}
