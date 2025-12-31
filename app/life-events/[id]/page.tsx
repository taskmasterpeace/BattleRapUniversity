"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { NavHeader } from "@/components/ui/nav-header"
import { Heart, DollarSign, Briefcase, AlertTriangle, Clock, Zap, Ban } from "lucide-react"
import { mockLifeEventsV2, getUrgencyColor, getUrgencyLabel, type EventCategory } from "@/lib/life-events"
import { EventImage } from "@/components/life-events/event-image"
import { EffectPreview } from "@/components/life-events/effect-preview"
import { IgnoreWarning } from "@/components/life-events/ignore-warning"
import { ThreeChoiceEvent } from "@/components/life-events/three-choice-event"
import { fadeIn } from "@/lib/animations"

const getCategoryIcon = (category: EventCategory) => {
  switch (category) {
    case "relationship":
    case "personal":
      return <Heart className="w-6 h-6" />
    case "financial":
      return <DollarSign className="w-6 h-6" />
    case "career":
      return <Briefcase className="w-6 h-6" />
    case "scandal":
      return <AlertTriangle className="w-6 h-6" />
    default:
      return <Briefcase className="w-6 h-6" />
  }
}

const getCategoryColor = (category: EventCategory) => {
  switch (category) {
    case "relationship":
    case "personal":
      return "text-pink-500 bg-pink-500/20 border-pink-500"
    case "financial":
      return "text-green-500 bg-green-500/20 border-green-500"
    case "career":
      return "text-blue-500 bg-blue-500/20 border-blue-500"
    case "scandal":
      return "text-red-500 bg-red-500/20 border-red-500"
    default:
      return "text-purple-500 bg-purple-500/20 border-purple-500"
  }
}

const getUrgencyIcon = (urgency: string) => {
  switch (urgency) {
    case "immediate":
      return <Zap className="w-5 h-5 text-red-500" />
    case "timed":
      return <Clock className="w-5 h-5 text-orange-500" />
    case "battle_gated":
      return <Ban className="w-5 h-5 text-yellow-500" />
    default:
      return null
  }
}

export default function LifeEventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const event = mockLifeEventsV2.find((e) => e.id === params.id)

  if (!event) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <NavHeader title="LIFE EVENT" backLabel="LIFE EVENTS" backHref="/life-events" />
        <div className="max-w-3xl mx-auto p-6 text-center">
          <p className="text-zinc-400">Event not found</p>
        </div>
      </div>
    )
  }

  const handleMakeChoice = async () => {
    if (!selectedChoice) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/life-events")
  }

  const handleThreeChoiceMade = (choiceId: string) => {
    router.push("/life-events")
  }

  const choices = [event.choice_a, event.choice_b, event.choice_c].filter(Boolean)
  const hasThreeChoices = choices.length === 3

  return (
    <div className="min-h-screen bg-zinc-950">
      <NavHeader title="LIFE EVENT" backLabel="LIFE EVENTS" backHref="/life-events" />

      <motion.main
        className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Event Header */}
        <div
          className={`bg-zinc-900 border-2 p-6 ${
            event.urgency === "immediate"
              ? "border-red-600"
              : event.urgency === "battle_gated"
                ? "border-yellow-600"
                : event.urgency === "timed"
                  ? "border-orange-600"
                  : "border-zinc-700"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 border-2 ${getCategoryColor(event.category)}`}>{getCategoryIcon(event.category)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {getUrgencyIcon(event.urgency)}
                <h1 className="text-xl font-display font-bold text-zinc-100">{event.title}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className={`px-2 py-1 font-display font-bold uppercase ${getUrgencyColor(event.urgency)}`}>
                  {getUrgencyLabel(event.urgency)}
                </span>
                <span
                  className={`px-2 py-1 font-mono uppercase ${
                    event.severity === "critical"
                      ? "bg-red-500/20 text-red-500"
                      : event.severity === "major"
                        ? "bg-orange-500/20 text-orange-500"
                        : event.severity === "moderate"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-zinc-500/20 text-zinc-400"
                  }`}
                >
                  {event.severity}
                </span>
                <span className="text-zinc-500 capitalize">{event.category}</span>
                <span className="text-zinc-500">{event.created_at}</span>
                {event.deadline_at && event.status === "pending" && (
                  <span className="text-orange-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Expires: {new Date(event.deadline_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Use ThreeChoiceEvent for 3 choices, otherwise custom layout */}
        {event.status === "pending" && hasThreeChoices ? (
          <div className="bg-zinc-900 border-2 border-zinc-700 p-6">
            <ThreeChoiceEvent event={event} onChoiceMade={handleThreeChoiceMade} />
          </div>
        ) : (
          <>
            {/* Event Image */}
            {event.presentation_type === "image_text" && event.image_url && (
              <div className="bg-zinc-900 border-2 border-zinc-700 overflow-hidden">
                <EventImage src={event.image_url} aspectRatio={event.image_aspect_ratio || "16:9"} alt={event.title} />
              </div>
            )}

            {/* Event Story */}
            <div className="bg-zinc-900 border-2 border-zinc-700 p-6">
              <h2 className="text-sm font-display font-bold text-zinc-400 tracking-wide mb-4">WHAT HAPPENED</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                {(event.full_text || event.description).split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-zinc-300 mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Choices (2 choice version) */}
            {event.status === "pending" && choices.length > 0 && (
              <div className="bg-zinc-900 border-2 border-zinc-700 p-6">
                <h2 className="text-sm font-display font-bold text-zinc-400 tracking-wide mb-4">MAKE YOUR CHOICE</h2>
                <div className="space-y-3">
                  {choices.map(
                    (choice) =>
                      choice && (
                        <button
                          key={choice.id}
                          onClick={() => setSelectedChoice(choice.id)}
                          className={`w-full text-left p-4 border-2 transition-colors ${
                            selectedChoice === choice.id
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
                          }`}
                        >
                          <h3 className="text-sm font-display font-bold text-zinc-100 mb-1">{choice.short_label}</h3>
                          <p className="text-xs text-zinc-400 mb-3">{choice.text}</p>
                          <EffectPreview effects={choice.effects} compact />
                        </button>
                      ),
                  )}
                </div>

                {/* Ignore Warning */}
                {event.can_ignore && event.ignore_effects && (
                  <div className="mt-6">
                    <IgnoreWarning effects={event.ignore_effects} deadline={event.deadline_at} />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleMakeChoice}
                  disabled={!selectedChoice || isSubmitting}
                  className={`w-full mt-6 py-3 text-sm font-display font-bold tracking-wide transition-colors ${
                    selectedChoice && !isSubmitting
                      ? "bg-orange-600 hover:bg-orange-500 text-white"
                      : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "CONFIRMING..." : "CONFIRM CHOICE"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Resolved/Expired State */}
        {event.status !== "pending" && (
          <div
            className={`bg-zinc-900 border-2 p-6 ${
              event.status === "resolved" ? "border-green-600" : "border-zinc-600"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`text-sm font-display font-bold ${
                  event.status === "resolved" ? "text-green-500" : "text-zinc-500"
                }`}
              >
                {event.status === "resolved" ? "RESOLVED" : "EXPIRED"}
              </span>
            </div>
            {event.choice_made && <p className="text-sm text-zinc-400">Choice made: {event.choice_made}</p>}
          </div>
        )}

        {/* Back Button */}
        <Link
          href="/life-events"
          className="block w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-center text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors"
        >
          BACK TO LIFE EVENTS
        </Link>
      </motion.main>
    </div>
  )
}
