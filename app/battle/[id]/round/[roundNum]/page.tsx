"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { useActiveBattler } from "@/contexts/battler-context"
import { ALL_BATTLERS } from "@/lib/data"
import { ContentCategorySection } from "@/components/battle/content-category-section"
import { EffectivenessForecast } from "@/components/battle/effectiveness-forecast"
import { QuickSelectPresets } from "@/components/battle/quick-select-presets"
import { BattleScoreTracker } from "@/components/battle/battle-score-tracker"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Swords } from "lucide-react"
import Link from "next/link"
import {
  CONTENT_TYPES,
  DELIVERY_TYPES,
  PERFORMANCE_TYPES,
  isValidSelection,
  getMockForecast,
  type ContentType,
  type DeliveryType,
  type PerformanceType,
} from "@/lib/round-crafting"

export default function RoundCraftingPage() {
  const router = useRouter()
  const params = useParams()
  const battleId = params.id as string
  const roundNum = Number.parseInt(params.roundNum as string)
  const { activeBattler } = useActiveBattler()

  const [content, setContent] = useState<ContentType | null>(null)
  const [delivery, setDelivery] = useState<DeliveryType | null>(null)
  const [performance, setPerformance] = useState<PerformanceType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalRounds = 3
  const opponent = ALL_BATTLERS.find((b) => b.id !== activeBattler?.id) || ALL_BATTLERS[1]

  // Mock current scores (would come from battle state)
  const [playerScore, setPlayerScore] = useState(roundNum > 1 ? Math.floor(Math.random() * 3) : 0)
  const [opponentScore, setOpponentScore] = useState(roundNum > 1 ? Math.floor(Math.random() * 3) : 0)

  const forecast =
    content && delivery && performance
      ? getMockForecast({
          contentType: content,
          deliveryType: delivery,
          performanceType: performance,
          opponentStyle: opponent.style || "aggressive",
        })
      : null

  const handlePresetSelect = (preset: {
    content: ContentType
    delivery: DeliveryType
    performance: PerformanceType
  }) => {
    setContent(preset.content)
    setDelivery(preset.delivery)
    setPerformance(preset.performance)
  }

  const handleSubmit = async () => {
    if (!isValidSelection(content, delivery, performance)) return
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((r) => setTimeout(r, 800))

    // Go to round results
    router.push(`/battle/${battleId}/round/${roundNum}/results`)
  }

  const valid = isValidSelection(content, delivery, performance)

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Made more compact on mobile */}
      <div className="border-b border-zinc-800 p-3 sm:p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column: Selection */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Quick Presets */}
              <QuickSelectPresets onSelect={handlePresetSelect} selectedContent={content} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <ContentCategorySection
                title="Content Type"
                description="What kind of bars are you spitting?"
                items={CONTENT_TYPES}
                selected={content}
                onSelect={(id) => setContent(id as ContentType)}
                required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <ContentCategorySection
                title="Delivery Style"
                description="How are you delivering your content?"
                items={DELIVERY_TYPES}
                selected={delivery}
                onSelect={(id) => setDelivery(id as DeliveryType)}
                required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ContentCategorySection
                title="Performance Energy"
                description="What's your energy level?"
                items={PERFORMANCE_TYPES}
                selected={performance}
                onSelect={(id) => setPerformance(id as PerformanceType)}
                required
              />
            </motion.div>
          </div>

          {/* Right Column: Preview & Submit - Shows below on mobile */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <BattleScoreTracker
                playerName={activeBattler?.stageName || "You"}
                opponentName={opponent.stageName}
                playerScore={playerScore}
                opponentScore={opponentScore}
                currentRound={roundNum}
                totalRounds={totalRounds}
              />
            </motion.div>

            {forecast && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <EffectivenessForecast
                  forecast={forecast}
                  opponentName={opponent.stageName}
                  opponentStyle={opponent.style || "aggressive"}
                />
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Button
                onClick={handleSubmit}
                disabled={!valid || isSubmitting}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-black uppercase tracking-tight"
              >
                {isSubmitting ? (
                  "Performing..."
                ) : (
                  <>
                    <Swords className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Lock In Round {roundNum}
                  </>
                )}
              </Button>

              {!valid && (
                <p className="text-center text-[10px] sm:text-xs text-zinc-500 mt-2">
                  Select all three categories to continue
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
