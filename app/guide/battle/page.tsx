"use client"

import Link from "next/link"
import { ArrowLeft, Swords, TrendingUp, Zap, AlertTriangle } from "lucide-react"

export default function BattleMechanicsPage() {
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
          <Swords className="w-5 h-5 text-red-500" />
          <span className="text-xl font-display font-bold text-zinc-100 tracking-wide">BATTLE MECHANICS</span>
        </div>
        <div className="w-20" />
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Overview */}
        <section className="bg-zinc-900 border-2 border-red-500/30 p-6">
          <h2 className="text-2xl font-display font-bold text-red-500 mb-4">HOW BATTLES WORK</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Every battle is best-of-three rounds. Win 2 rounds, you win the battle. Each round is divided into 30-second
            segments that get scored independently.
          </p>
        </section>

        {/* Structure */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">BATTLE STRUCTURE</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-800 border-l-4 border-blue-500 p-4">
              <h4 className="font-display font-bold text-blue-500 mb-2">SMALL ROOM CIRCUIT</h4>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>• 2-minute rounds</li>
                <li>• 4 segments per round</li>
                <li>• 60% writing weight</li>
                <li>• 40% performance weight</li>
                <li>• Lower crowd factor</li>
              </ul>
            </div>
            <div className="bg-zinc-800 border-l-4 border-purple-500 p-4">
              <h4 className="font-display font-bold text-purple-500 mb-2">MAIN STAGE ARENA</h4>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>• 3-minute rounds</li>
                <li>• 6 segments per round</li>
                <li>• 40% writing weight</li>
                <li>• 60% performance weight</li>
                <li>• Higher crowd factor</li>
              </ul>
            </div>
          </div>
        </section>

        {/* What You See */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            WHAT YOU SEE DURING A BATTLE
          </h3>
          <ul className="text-sm text-zinc-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>
                <strong>Segment-by-segment scores</strong> for both battlers (real-time feedback)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>
                <strong>Round summaries</strong> (average score, peak score, consistency, crowd reaction)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>
                <strong>Special moments</strong> (haymakers, chokes, momentum shifts)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>
                <strong>Final result</strong> (who won which rounds, overall winner)
              </span>
            </li>
          </ul>
        </section>

        {/* Scoring */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">HOW SCORING WORKS</h3>
          <div className="space-y-4">
            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-green-500 mb-2">STEP 1: CALCULATE BASE WRITING POWER</h4>
              <p className="text-sm text-zinc-300">Average your 3 writing stats (Lyricism, Wordplay, Creativity)</p>
              <p className="text-xs text-zinc-500 mt-1">Example: (8 + 8 + 7) / 3 = 7.67</p>
            </div>

            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-blue-500 mb-2">STEP 2: CALCULATE BASE PERFORMANCE POWER</h4>
              <p className="text-sm text-zinc-300">Average your 3 performance stats (Flow, Stage Presence, Charisma)</p>
              <p className="text-xs text-zinc-500 mt-1">Example: (5 + 5 + 6) / 3 = 5.33</p>
            </div>

            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-purple-500 mb-2">STEP 3: APPLY LEAGUE WEIGHTS</h4>
              <p className="text-sm text-zinc-300 mb-2">
                <strong>Small Room:</strong> (7.67 × 0.60) + (5.33 × 0.40) = 4.60 + 2.13 = <strong>6.73</strong>
              </p>
              <p className="text-sm text-zinc-300">
                <strong>Main Stage:</strong> (7.67 × 0.40) + (5.33 × 0.60) = 3.07 + 3.20 = <strong>6.27</strong>
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                See the difference? Technical writers score higher in Small Room!
              </p>
            </div>

            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-yellow-500 mb-2">STEP 4: ADD RANDOM VARIANCE</h4>
              <p className="text-sm text-zinc-300">Each segment gets ±25% variance</p>
              <p className="text-xs text-zinc-500 mt-1">
                Score of 6.73 can become 5.05-8.41 (creates unpredictability)
              </p>
            </div>

            <div className="bg-zinc-800 p-4">
              <h4 className="font-display font-bold text-red-500 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                STEP 5: CHECK FOR SPECIAL MOMENTS
              </h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li>
                  <span className="text-yellow-500 font-bold">HAYMAKER:</span> 15% chance (30% if you did research) →
                  Score ×1.2-1.4
                </li>
                <li>
                  <span className="text-red-500 font-bold">CHOKE:</span> 3% base chance (modified by resilience/stress)
                  → Score ×0.3
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Special Moments */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            SPECIAL MOMENTS
          </h3>

          <div className="space-y-4">
            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
              <h4 className="font-display font-bold text-yellow-500 mb-2">✨ HAYMAKERS</h4>
              <p className="text-sm text-zinc-300 mb-2">
                A "haymaker" is a BIG moment that significantly boosts your segment score.
              </p>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>• Base 15% chance per segment (30% if you did research prep)</li>
                <li>• Multiplies your score by 1.2-1.4x</li>
                <li>• Can turn the tide of a round</li>
                <li>• Research prep is key to getting more haymakers</li>
              </ul>
            </div>

            <div className="bg-red-900/20 border-l-4 border-red-500 p-4">
              <h4 className="font-display font-bold text-red-500 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                CHOKES
              </h4>
              <p className="text-sm text-zinc-300 mb-2">A "choke" is when you blank, forget your bars, or stumble.</p>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>• Base 3% chance (increases with stress and pressure)</li>
                <li>• Multiplies your score by 0.3x (devastating!)</li>
                <li>• High Resilience reduces choke chance significantly</li>
                <li>• Rest prep helps prevent choking</li>
                <li>• Freestyle Genius badge gives -25% choke chance</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Round Scoring */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">ROUND SCORING</h3>
          <p className="text-sm text-zinc-300 mb-4">After all segments, the game calculates:</p>
          <ul className="text-sm text-zinc-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">•</span>
              <span>
                <strong>Average Score</strong> - Mean of all your segments (PRIMARY metric for determining winner)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">•</span>
              <span>
                <strong>Peak Score</strong> - Your best segment (the "haymaker")
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>
                <strong>Consistency Score</strong> - How close your segments were (low variance = consistent)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>
                <strong>Crowd Reaction</strong> - Based on performance stats + league crowd factor
              </span>
            </li>
          </ul>
          <div className="mt-4 bg-green-900/20 border-l-4 border-green-500 p-4">
            <p className="text-sm font-bold text-green-500">ROUND WINNER:</p>
            <p className="text-sm text-zinc-300">Higher average score wins (or peak score if tied)</p>
          </div>
        </section>

        {/* Why This Matters */}
        <section className="bg-zinc-900 border-2 border-zinc-700 p-6">
          <h3 className="text-xl font-display font-bold text-orange-500 mb-4">WHY THIS MATTERS</h3>
          <div className="space-y-3 text-sm text-zinc-300">
            <p className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>You can have ONE amazing round (peak 9.5) but lose 1-2 overall</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>Consistency beats flashiness (three 7.5 rounds beats 9.5, 6.0, 6.0)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>The crowd doesn't always pick the winner (average score does)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <span>Choking ONE segment can cost you the entire round</span>
            </p>
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
            href="/badges"
            className="px-6 py-3 bg-red-600 hover:bg-red-500 border-2 border-red-400 text-white font-display transition-colors"
          >
            NEXT: BADGE SYSTEM →
          </Link>
        </div>
      </div>
    </div>
  )
}
