"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { useActiveBattler } from "@/contexts/battler-context"
import { ALL_BATTLERS } from "@/lib/data"
import { RoundResultsCard } from "@/components/battle/round-results-card"
import { RoundResultsBreakdown } from "@/components/battle/round-results-breakdown"
import { CrowdReactionWindow } from "@/components/battle/crowd-reaction-window"
import { SegmentTimeline } from "@/components/battle/segment-timeline"
import { BattleScoreTracker } from "@/components/battle/battle-score-tracker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Home, Trophy, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { simulateMockRound, type RoundResult } from "@/lib/round-crafting"

export default function RoundResultsPage() {
  const router = useRouter()
  const params = useParams()
  const battleId = params.id as string
  const roundNum = Number.parseInt(params.roundNum as string)
  const { activeBattler } = useActiveBattler()
  const [result, setResult] = useState<RoundResult | null>(null)

  const totalRounds = 3
  const opponent = ALL_BATTLERS.find((b) => b.id !== activeBattler?.id) || ALL_BATTLERS[1]
  const isFinalRound = roundNum >= totalRounds

  useEffect(() => {
    // Simulate round result
    const mockResult = simulateMockRound({
      contentType: "punchlines",
      deliveryType: "aggressive",
      performanceType: "high_energy",
      opponentStyle: opponent.style || "technical",
    })
    setResult(mockResult)
  }, [opponent.style])

  // Mock cumulative scores
  const playerWins = Math.floor(Math.random() * (roundNum + 1))
  const opponentWins = roundNum - playerWins + (result?.winner === "opponent" ? 1 : 0)
  const adjustedPlayerWins = playerWins + (result?.winner === "player" ? 1 : 0)

  const handleNextRound = () => {
    router.push(`/battle/${battleId}/round/${roundNum + 1}`)
  }

  const handleFinishBattle = () => {
    router.push(`/battle/${battleId}`)
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-zinc-400">Calculating results...</p>
      </div>
    )
  }

  const playerWon = result.winner === "player"

  return (
    <div className="min-h-screen bg-background">
      {/* Header with result banner */}
      <div
        className={`border-b p-6 ${playerWon ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <h1
              className={`font-black text-4xl uppercase tracking-tighter ${playerWon ? "text-green-500" : "text-red-500"}`}
            >
              Round {roundNum} {playerWon ? "Won!" : "Lost"}
            </h1>
            <p className="text-zinc-400 mt-2">
              {activeBattler?.stageName} vs {opponent.stageName}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Score Tracker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <BattleScoreTracker
            playerName={activeBattler?.stageName || "You"}
            opponentName={opponent.stageName}
            playerScore={adjustedPlayerWins}
            opponentScore={opponentWins}
            currentRound={roundNum}
            totalRounds={totalRounds}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <CrowdReactionWindow
            playerMomentum={playerWon ? 75 : 35}
            crowdEnergy={playerWon ? 85 : 55}
            viralMoment={playerWon && Math.random() > 0.5}
          />
        </motion.div>

        {/* Round Results Comparison */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <RoundResultsCard
            roundNumber={roundNum}
            playerName={activeBattler?.stageName || "You"}
            opponentName={opponent.stageName}
            playerScore={result.playerScore}
            opponentScore={result.opponentScore}
            playerSelections={{
              content: "Punchlines",
              delivery: "Aggressive",
              performance: "High Energy",
            }}
            opponentSelections={{
              content: "Wordplay",
              delivery: "Technical",
              performance: "Controlled",
            }}
            winner={result.winner}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <RoundResultsBreakdown
            playerName={activeBattler?.stageName || "You"}
            opponentName={opponent.stageName}
            categories={[
              { name: "Lyricism", playerScore: result.playerScore * 0.9, opponentScore: result.opponentScore * 0.85 },
              { name: "Delivery", playerScore: result.playerScore * 0.95, opponentScore: result.opponentScore * 1.05 },
              { name: "Impact", playerScore: result.playerScore * 1.1, opponentScore: result.opponentScore * 0.9 },
              {
                name: "Crowd Control",
                playerScore: result.playerScore * 1.0,
                opponentScore: result.opponentScore * 0.95,
              },
            ]}
          />
        </motion.div>

        {/* Segment Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-display uppercase tracking-wider text-zinc-400">
                Segment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SegmentTimeline
                segments={result.segments}
                playerName={activeBattler?.stageName || "You"}
                opponentName={opponent.stageName}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Moments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm font-display uppercase tracking-wider text-zinc-400">Key Moments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.highlights.map((highlight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800 border border-zinc-700">
                  {highlight.type === "player" ? (
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-zinc-200">{highlight.description}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {highlight.type === "player" ? activeBattler?.stageName : opponent.stageName} •{" "}
                      {highlight.impact > 0 ? "+" : ""}
                      {highlight.impact} points
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          {isFinalRound ? (
            <>
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full h-14 font-display bg-transparent">
                  <Home className="w-5 h-5 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={handleFinishBattle}
                className="flex-1 h-14 font-black uppercase tracking-tight bg-orange-600 hover:bg-orange-500"
              >
                <Trophy className="w-5 h-5 mr-2" />
                View Final Results
              </Button>
            </>
          ) : (
            <Button
              onClick={handleNextRound}
              className="w-full h-14 font-black uppercase tracking-tight bg-orange-600 hover:bg-orange-500"
            >
              Continue to Round {roundNum + 1}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
