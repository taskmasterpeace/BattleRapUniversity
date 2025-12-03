"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ModeSelectionCard } from "@/components/battle/mode-selection-card"
import { Button } from "@/components/ui/button"
import { useActiveBattler } from "@/contexts/battler-context"
import { ALL_BATTLERS } from "@/lib/data"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BattleModeSelectionPage() {
  const router = useRouter()
  const params = useParams()
  const battleId = params.id as string
  const { activeBattler } = useActiveBattler()
  const [selectedMode, setSelectedMode] = useState<"locked_in" | "auto" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock opponent
  const opponent = ALL_BATTLERS.find((b) => b.id !== activeBattler?.id) || ALL_BATTLERS[1]

  const handleConfirm = async () => {
    if (!selectedMode) return
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((r) => setTimeout(r, 500))

    if (selectedMode === "locked_in") {
      router.push(`/battle/${battleId}/round/1`)
    } else {
      // Auto mode - go straight to results
      router.push(`/battle/${battleId}`)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 p-4">
        <Link
          href={`/battle/${battleId}/prep`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Prep</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-black text-3xl sm:text-4xl uppercase tracking-tighter text-white">Battle Ready</h1>
            <p className="text-zinc-400">
              vs <span className="text-orange-500 font-bold">{opponent.stageName}</span>
            </p>
          </div>

          {/* Question */}
          <p className="text-center text-lg text-zinc-300">How do you want to approach this battle?</p>

          {/* Mode Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <ModeSelectionCard
              mode="locked_in"
              title="Locked In"
              description="Craft each round strategically with full control over your content selections."
              features={[
                "Select content for each round",
                "See matchup effectiveness preview",
                "Round-by-round gameplay",
              ]}
              duration="2-3 minutes"
              selected={selectedMode === "locked_in"}
              onClick={() => setSelectedMode("locked_in")}
            />

            <ModeSelectionCard
              mode="auto"
              title="Auto Mode"
              description="Quick simulation with content auto-selected based on your badges and style."
              features={["Badge-based content picks", "All rounds simulated at once", "Fast results"]}
              duration="10 seconds"
              selected={selectedMode === "auto"}
              onClick={() => setSelectedMode("auto")}
            />
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            disabled={!selectedMode || isSubmitting}
            className="w-full h-14 text-lg font-black uppercase tracking-tight bg-orange-600 hover:bg-orange-500 text-white"
          >
            {isSubmitting ? "Starting Battle..." : "Start Battle"}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
