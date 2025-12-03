"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { NavHeader } from "@/components/ui/nav-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { PostBattleSummary } from "@/components/battle/post-battle-summary"
import { JudgeScorecard } from "@/components/battle/judge-scorecard"
import { BattleAnalysis } from "@/components/battle/battle-analysis"
import { BattleViewsDisplay } from "@/components/battle/battle-views-display"
import { mockBattler } from "@/lib/data"
import { Play } from "lucide-react"

// Mock battle result data
const mockBattleResult = {
  id: "b-001",
  winner: "player" as const,
  score: { player: 2, opponent: 1 },
  playerBattler: mockBattler,
  opponentBattler: { ...mockBattler, id: "opp-1", stageName: "YOUNG PATTERN", elo: 1295 },
  rounds: [
    {
      number: 1,
      playerScore: 7.2,
      opponentScore: 8.1,
      winner: "opponent" as const,
      segments: Array.from({ length: 8 }, (_, i) => ({
        id: `s-1-${i}`,
        type: i === 3 ? "haymaker" : i === 6 ? "choke" : ("normal" as const),
        playerScore: 6.5 + Math.random() * 2,
        opponentScore: 7 + Math.random() * 2,
      })),
    },
    {
      number: 2,
      playerScore: 8.5,
      opponentScore: 7.3,
      winner: "player" as const,
      segments: Array.from({ length: 8 }, (_, i) => ({
        id: `s-2-${i}`,
        type: i === 2 || i === 5 ? "haymaker" : ("normal" as const),
        playerScore: 7.5 + Math.random() * 2,
        opponentScore: 6.5 + Math.random() * 1.5,
      })),
    },
    {
      number: 3,
      playerScore: 7.7,
      opponentScore: 7.1,
      winner: "player" as const,
      segments: Array.from({ length: 8 }, (_, i) => ({
        id: `s-3-${i}`,
        type: i === 4 ? "haymaker" : ("normal" as const),
        playerScore: 7 + Math.random() * 1.5,
        opponentScore: 6.5 + Math.random() * 1.5,
      })),
    },
  ],
  date: "Dec 15, 2025",
  league: "SMALL ROOM CIRCUIT",
  ratingChange: 25,
  earnings: {
    basePay: 500,
    winBonus: 1200,
    performanceBonus: 200,
    total: 1900,
  },
}

const mockPostBattleSummary = {
  ratingChange: 25,
  newRating: 1270,
  attributeChanges: [
    { attribute: "Lyricism", category: "writing" as const, oldValue: 6.0, newValue: 6.5, change: 0.5 },
    { attribute: "Stage Presence", category: "performance" as const, oldValue: 5.5, newValue: 5.7, change: 0.2 },
    { attribute: "Reputation", category: "personal" as const, oldValue: 4.0, newValue: 4.3, change: 0.3 },
  ],
  badgesEarned: [
    { id: "b-1", name: "Rising Star", tier: "bronze" as const, icon: "star" },
    { id: "b-2", name: "Haymaker King", tier: "silver" as const, icon: "fist" },
  ],
  stressChange: 5,
  currentStress: 50,
  viewData: {
    total_views: 15000,
    view_tier: "mid" as const,
  },
  fanGrowth: {
    fans_before: 250,
    fans_after: 387,
    fans_gained: 137,
    trending_change: 15,
  },
  levelUpData: {
    leveledUp: true,
    previousLevel: 5,
    newLevel: 6,
    skillPointsEarned: 3,
    xpEarned: 450,
  },
}

export default function BattleResultsPage() {
  const params = useParams()
  const [selectedRound, setSelectedRound] = useState(1)

  const battle = mockBattleResult
  const currentRound = battle.rounds.find((r) => r.number === selectedRound) || battle.rounds[0]
  const isVictory = battle.winner === "player"

  return (
    <div className="min-h-screen bg-zinc-950">
      <NavHeader title="BATTLE RESULTS" backLabel="DASHBOARD" backHref="/dashboard" />

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Battle Header */}
        <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Player Side */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-800 border-2 border-zinc-600 overflow-hidden shrink-0">
                <Image
                  src="/rapper-pixel.jpg"
                  alt={battle.playerBattler.stageName}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-100">
                  {battle.playerBattler.stageName}
                </h2>
                <span className="text-sm text-zinc-400">ELO: {battle.playerBattler.elo}</span>
              </div>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-mono font-bold">
                <span className={battle.winner === "player" ? "text-green-500" : "text-zinc-400"}>
                  {battle.score.player}
                </span>
                <span className="text-zinc-600 mx-3 sm:mx-4">-</span>
                <span className={battle.winner === "opponent" ? "text-green-500" : "text-zinc-400"}>
                  {battle.score.opponent}
                </span>
              </div>
              <StatusBadge variant={battle.winner === "player" ? "victory" : "defeat"} size="md">
                {battle.winner === "player" ? "VICTORY" : "DEFEAT"}
              </StatusBadge>
            </div>

            {/* Opponent Side */}
            <div className="flex items-center gap-4">
              <div className="text-right sm:block hidden">
                <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-100">
                  {battle.opponentBattler.stageName}
                </h2>
                <span className="text-sm text-zinc-400">ELO: {battle.opponentBattler.elo}</span>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-800 border-2 border-zinc-600 overflow-hidden shrink-0">
                <Image
                  src="/rapper-portrait-pixel-art.jpg"
                  alt={battle.opponentBattler.stageName}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div className="text-left sm:hidden">
                <h2 className="text-lg font-display font-bold text-zinc-100">{battle.opponentBattler.stageName}</h2>
                <span className="text-sm text-zinc-400">ELO: {battle.opponentBattler.elo}</span>
              </div>
            </div>
          </div>
        </div>

        <PostBattleSummary data={mockPostBattleSummary} isVictory={isVictory} />

        {/* Judge Scorecard */}
        <JudgeScorecard
          playerName={battle.playerBattler.stageName}
          opponentName={battle.opponentBattler.stageName}
          rounds={battle.rounds.map((r, i) => ({
            roundNumber: i + 1,
            scores: [
              { judgeName: "Judge 1", playerScore: r.playerScore, opponentScore: r.opponentScore },
              { judgeName: "Judge 2", playerScore: r.playerScore + 0.2, opponentScore: r.opponentScore - 0.1 },
              { judgeName: "Judge 3", playerScore: r.playerScore - 0.1, opponentScore: r.opponentScore + 0.2 },
            ],
          }))}
        />

        {/* Battle Views */}
        <BattleViewsDisplay
          views={mockPostBattleSummary.viewData.total_views}
          tier={mockPostBattleSummary.viewData.view_tier}
          trending={true}
          shareCount={Math.floor(mockPostBattleSummary.viewData.total_views * 0.15)}
        />

        {/* Battle Analysis */}
        <BattleAnalysis
          playerName={battle.playerBattler.stageName}
          opponentName={battle.opponentBattler.stageName}
          playerStrengths={["Strong punchlines", "Great crowd control", "Effective rebuttals"]}
          playerWeaknesses={["Inconsistent first rounds"]}
          opponentStrengths={["Technical precision", "Complex schemes"]}
          opponentWeaknesses={["Lower energy", "Predictable patterns"]}
          keyMoments={[
            { round: 2, description: "Devastating haymaker that silenced the crowd", impact: "major" as const },
            { round: 3, description: "Clutch performance under pressure", impact: "moderate" as const },
          ]}
        />

        {/* Earnings Card */}
        <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-5">
          <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">BATTLE PAYOUT</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-zinc-800/50 p-3">
              <span className="text-zinc-500 text-xs block">Base Pay</span>
              <span className="text-zinc-200 font-mono text-lg">${battle.earnings.basePay}</span>
            </div>
            <div className="bg-zinc-800/50 p-3">
              <span className="text-zinc-500 text-xs block">Win Bonus</span>
              <span className="text-green-500 font-mono text-lg">${battle.earnings.winBonus}</span>
            </div>
            <div className="bg-zinc-800/50 p-3">
              <span className="text-zinc-500 text-xs block">Performance</span>
              <span className="text-green-500 font-mono text-lg">${battle.earnings.performanceBonus}</span>
            </div>
            <div className="bg-orange-600/20 border border-orange-500/50 p-3">
              <span className="text-orange-400 text-xs block">TOTAL</span>
              <span className="text-orange-500 font-mono text-lg font-bold">${battle.earnings.total}</span>
            </div>
          </div>
        </div>

        {/* Round Selector */}
        <div className="flex gap-2 sm:gap-3">
          {battle.rounds.map((round) => (
            <button
              key={round.number}
              onClick={() => setSelectedRound(round.number)}
              className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 border-2 font-display font-bold text-xs sm:text-sm tracking-wide transition-colors ${
                selectedRound === round.number
                  ? "bg-orange-600 border-orange-600 text-white"
                  : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-600"
              }`}
            >
              <span className="hidden sm:inline">ROUND </span>R{round.number}
              <span className={`ml-1 sm:ml-2 ${round.winner === "player" ? "text-green-400" : "text-red-400"}`}>
                {round.winner === "player" ? "W" : "L"}
              </span>
            </button>
          ))}
        </div>

        {/* Round Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Player Stats */}
          <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-5">
            <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">
              {battle.playerBattler.stageName}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Average Score:</span>
                <span className="text-zinc-100 font-mono font-bold">{currentRound.playerScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Peak Score:</span>
                <span className="text-green-500 font-mono">{(currentRound.playerScore + 0.8).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Consistency:</span>
                <span className="text-zinc-100 font-mono">1.2 SD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Crowd Reaction:</span>
                <span className="text-green-500 font-mono">85%</span>
              </div>
            </div>
          </div>

          {/* Opponent Stats */}
          <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-5">
            <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">
              {battle.opponentBattler.stageName}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Average Score:</span>
                <span className="text-zinc-100 font-mono font-bold">{currentRound.opponentScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Peak Score:</span>
                <span className="text-zinc-100 font-mono">{(currentRound.opponentScore + 0.6).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Consistency:</span>
                <span className="text-zinc-100 font-mono">1.5 SD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Crowd Reaction:</span>
                <span className="text-zinc-100 font-mono">72%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Segment Timeline */}
        <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-5">
          <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">SEGMENT TIMELINE</h3>
          <div className="flex items-end gap-1 h-24 sm:h-32">
            {currentRound.segments.map((segment, i) => {
              const height = (segment.playerScore / 10) * 100
              const bgColor =
                segment.type === "haymaker" ? "bg-amber-500" : segment.type === "choke" ? "bg-red-500" : "bg-blue-500"

              return (
                <div
                  key={segment.id}
                  className={`flex-1 ${bgColor} transition-all hover:opacity-80`}
                  style={{ height: `${height}%` }}
                  title={`Segment ${i + 1}: ${segment.playerScore.toFixed(1)}`}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500" />
              <span className="text-zinc-400">Haymaker</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500" />
              <span className="text-zinc-400">Choke</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500" />
              <span className="text-zinc-400">Normal</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <Link
            href={`/battle/${params.id}/watch`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors"
          >
            <Play className="w-4 h-4" />
            WATCH REPLAY
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors text-center"
          >
            BACK TO DASHBOARD
          </Link>
          <Link
            href="/battle/offers"
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-sm font-display font-bold text-white tracking-wide transition-colors text-center"
          >
            VIEW NEW OFFERS
          </Link>
        </div>
      </main>
    </div>
  )
}
