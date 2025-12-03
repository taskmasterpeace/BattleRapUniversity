"use client"

import { useState } from "react"
import type { LifeEventV2 } from "@/lib/life-events"
import { EffectPreview } from "./effect-preview"
import { EventImage } from "./event-image"
import { IgnoreWarning } from "./ignore-warning"

interface ThreeChoiceEventProps {
  event: LifeEventV2
  onChoiceMade: (choiceId: string) => void
}

export function ThreeChoiceEvent({ event, onChoiceMade }: ThreeChoiceEventProps) {
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
    <div className="space-y-6">
      {/* Image */}
      {event.presentation_type === "image_text" && event.image_url && (
        <EventImage src={event.image_url} aspectRatio={event.image_aspect_ratio || "16:9"} alt={event.title} />
      )}

      {/* Story */}
      {event.full_text && (
        <div className="space-y-3">
          {event.full_text.split("\n\n").map((p, i) => (
            <p key={i} className="text-sm text-zinc-300 leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      )}

      {/* Three Choices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {choices.map(
          (choice) =>
            choice && (
              <button
                key={choice.id}
                onClick={() => setSelectedChoice(choice.id)}
                className={`text-left p-4 border-2 transition-all h-full flex flex-col ${
                  selectedChoice === choice.id
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
                }`}
              >
                <h3 className="text-sm font-display font-bold text-white mb-2">{choice.short_label}</h3>
                <p className="text-xs text-zinc-400 mb-3 flex-1">{choice.text}</p>
                <EffectPreview effects={choice.effects} compact />
              </button>
            ),
        )}
      </div>

      {/* Ignore Warning */}
      {event.can_ignore && event.ignore_effects && (
        <IgnoreWarning effects={event.ignore_effects} deadline={event.deadline_at} />
      )}

      {/* Selected Choice Preview */}
      {selectedChoiceData && (
        <div className="p-4 bg-zinc-800/50 border border-zinc-700">
          <h4 className="text-xs font-display font-bold text-zinc-400 mb-3">FULL IMPACT PREVIEW</h4>
          <EffectPreview effects={selectedChoiceData.effects} />
        </div>
      )}

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={!selectedChoice || isSubmitting}
        className={`w-full py-3 text-sm font-display font-bold tracking-wide transition-colors ${
          selectedChoice && !isSubmitting
            ? "bg-orange-600 hover:bg-orange-500 text-white"
            : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
        }`}
      >
        {isSubmitting ? "CONFIRMING..." : "CONFIRM CHOICE"}
      </button>
    </div>
  )
}
