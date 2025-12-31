"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { useActiveBattler } from "@/contexts/battler-context"
import { RoundCraftingWizard } from "@/components/battle/round-crafting-wizard"
import { BattleScoreTracker } from "@/components/battle/battle-score-tracker"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { ContentType, DeliveryType, PerformanceType } from "@/lib/round-crafting"

export default function RoundCraftingPage() {
  const router = useRouter()
  const params = useParams()
  const battleId = params.id as string
  const roundNum = Number.parseInt(params.roundNum as string)
  const activeBattler = useActiveBattler()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [opponent, setOpponent] = useState({ stageName: "OPPONENT", style: "aggressive" })

  const totalRounds = 3

  useEffect(() => {
    // Fetch battle data to get opponent info
    async function fetchBattle() {
      try {
        const response = await fetch(`/api/battles/${battleId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.battle?.ai_battler) {
            setOpponent({
              stageName: data.battle.ai_battler.stage_name,
              style: data.battle.ai_battler.style_tags?.[0] || "aggressive",
            })
          }
        }
      } catch (error) {
        console.error('Error fetching battle:', error)
      }
    }
    fetchBattle()
  }, [battleId])

  // Score is 0-0 during prep since simulation happens after all rounds are submitted
  const playerScore = 0
  const opponentScore = 0

  const handleSubmit = async (
    content: ContentType,
    delivery: DeliveryType,
    performance: PerformanceType
  ) => {
    setIsSubmitting(true)

    try {
      // 1. Save round selections to prep_segments
      const segmentResponse = await fetch(`/api/battles/${battleId}/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundNum,
          position: 1, // Main segment for this round
          contentType: content,
          deliveryType: delivery,
          performanceType: performance,
          isFreestyle: false,
          isCounter: false,
        }),
      })

      if (!segmentResponse.ok) {
        console.error('Failed to save round selections')
      }

      // 2. If this is the final round, trigger full battle simulation
      if (roundNum === totalRounds) {
        const lockInResponse = await fetch(`/api/battles/${battleId}/lock-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!lockInResponse.ok) {
          const errorData = await lockInResponse.json()
          console.error('Simulation error:', errorData.error)
          // Even if simulation fails, proceed to results to see what happened
        } else {
          const simResult = await lockInResponse.json()
          console.log('Battle simulated:', simResult)
        }

        // After final round, go to battle results page
        router.push(`/battle/${battleId}`)
      } else {
        // For rounds 1 and 2, go to round results then continue
        router.push(`/battle/${battleId}/round/${roundNum}/results`)
      }
    } catch (error) {
      console.error('Error during lock-in:', error)
      // Still navigate even on error
      router.push(`/battle/${battleId}/round/${roundNum}/results`)
    }
  }

  // Get player badges (would come from battler data)
  const playerBadges = activeBattler?.badges || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-zinc-800 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={roundNum === 1 ? `/battle/${battleId}/mode` : `/battle/${battleId}/round/${roundNum - 1}/results`}
            className="inline-flex items-center gap-1 sm:gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Back</span>
          </Link>
          <div className="text-center">
            <h1 className="font-black text-base sm:text-xl uppercase tracking-tighter">
              Round {roundNum} of {totalRounds}
            </h1>
            <p className="text-[10px] sm:text-xs text-zinc-500">
              vs <span className="text-orange-500">{opponent.stageName}</span>
            </p>
          </div>
          <div className="w-12 sm:w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content: Wizard */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6"
            >
              <RoundCraftingWizard
                roundNum={roundNum}
                totalRounds={totalRounds}
                opponentName={opponent.stageName}
                opponentStyle={opponent.style}
                playerBadges={playerBadges}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          </div>

          {/* Side Panel: Score Tracker */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BattleScoreTracker
                playerName={activeBattler?.stageName || "You"}
                opponentName={opponent.stageName}
                playerScore={playerScore}
                opponentScore={opponentScore}
                currentRound={roundNum}
                totalRounds={totalRounds}
              />
            </motion.div>

            {/* Tips Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-zinc-800 bg-zinc-900 p-4"
            >
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-3">
                Battle Tips
              </h3>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Content type determines what bars you're spitting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Delivery affects stumble risk and intensity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Performance energy controls crowd reaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Some content types counter others - check matchups!</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
