"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Zap } from "lucide-react"
import type { LifeEventV2 } from "@/lib/life-events"
import { EffectPreview } from "./effect-preview"
import { EventImage } from "./event-image"

interface ImmediateEventModalProps {
  event: LifeEventV2
  onChoiceMade: (choiceId: string) => void
}

export function ImmediateEventModal({ event, onChoiceMade }: ImmediateEventModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!selectedChoice) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onChoiceMade(selectedChoice)
  }

  const choices = [event.choice_a, event.choice_b, event.choice_c].filter(Boolean)
  const selectedChoiceData = choices.find((c) => c?.id === selectedChoice)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-2 border-red-600"
      >
        {/* Header */}
        <div className="bg-red-600 px-4 py-3 flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-white" />
          <span className="text-sm font-display font-bold text-white tracking-wide">IMMEDIATE DECISION</span>
          <Zap className="w-5 h-5 text-white" />
        </div>

        {/* Image */}
        {event.presentation_type === "image_text" && event.image_url && (
          <EventImage src={event.image_url} aspectRatio={event.image_aspect_ratio || "16:9"} alt={event.title} />
        )}

        {/* Content */}
        <div className="p-6">
          {/* Category & Severity */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 text-xs font-display font-bold uppercase bg-zinc-800 text-zinc-300">
              {event.category}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-display font-bold uppercase ${
                event.severity === "critical"
                  ? "bg-red-500/20 text-red-500"
                  : event.severity === "major"
                    ? "bg-orange-500/20 text-orange-500"
                    : "bg-yellow-500/20 text-yellow-500"
              }`}
            >
              {event.severity}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-display font-bold text-white mb-4">{event.title}</h1>

          {/* Description */}
          {event.full_text && (
            <div className="mb-6 space-y-3">
              {event.full_text.split("\n\n").map((p, i) => (
                <p key={i} className="text-sm text-zinc-300 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* Choices */}
          <div className="space-y-3 mb-6">
            {choices.map(
              (choice) =>
                choice && (
                  <button
                    key={choice.id}
                    onClick={() => setSelectedChoice(choice.id)}
                    className={`w-full text-left p-4 border-2 transition-all ${
                      selectedChoice === choice.id
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
                    }`}
                  >
                    <h3 className="text-sm font-display font-bold text-white mb-2">{choice.short_label}</h3>
                    <p className="text-xs text-zinc-400 mb-3">{choice.text}</p>
                    <EffectPreview effects={choice.effects} compact />
                  </button>
                ),
            )}
          </div>

          {/* Selected Choice Preview */}
          {selectedChoiceData && (
            <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700">
              <h4 className="text-xs font-display font-bold text-zinc-400 mb-3">FULL IMPACT PREVIEW</h4>
              <EffectPreview effects={selectedChoiceData.effects} />
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!selectedChoice || isSubmitting}
            className={`w-full py-4 text-sm font-display font-bold tracking-wide transition-colors ${
              selectedChoice && !isSubmitting
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "CONFIRMING..." : "CONFIRM CHOICE"}
          </button>

          {/* Warning */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-red-500">
            <AlertTriangle className="w-4 h-4" />
            <span>You must choose. This modal cannot be closed.</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
