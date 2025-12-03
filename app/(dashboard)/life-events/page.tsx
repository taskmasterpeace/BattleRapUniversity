"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBattler } from "@/contexts/battler-context"
import {
  Calendar,
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Mic,
  Star,
  Clock,
  CheckCircle,
} from "lucide-react"

interface LifeEvent {
  id: string
  type: "opportunity" | "challenge" | "relationship" | "financial" | "career"
  title: string
  description: string
  daysRemaining?: number
  choices?: {
    id: string
    label: string
    effects: {
      stat: string
      value: number
    }[]
  }[]
  resolved?: boolean
  outcome?: string
}

const MOCK_EVENTS: LifeEvent[] = [
  {
    id: "1",
    type: "opportunity",
    title: "Record Label Interest",
    description:
      "A mid-tier record label has reached out about potentially signing you for a mixtape deal. This could boost your exposure but might limit your battle schedule.",
    daysRemaining: 5,
    choices: [
      {
        id: "accept",
        label: "Sign the Deal",
        effects: [
          { stat: "clout", value: 50 },
          { stat: "income", value: 5000 },
          { stat: "battleFrequency", value: -20 },
        ],
      },
      {
        id: "decline",
        label: "Stay Independent",
        effects: [
          { stat: "respect", value: 25 },
          { stat: "battleFrequency", value: 10 },
        ],
      },
      {
        id: "negotiate",
        label: "Counter Offer",
        effects: [
          { stat: "clout", value: 30 },
          { stat: "income", value: 3000 },
        ],
      },
    ],
  },
  {
    id: "2",
    type: "challenge",
    title: "Social Media Beef",
    description:
      "Another battler has been dissing you online, calling you out for ducking battles. Your fans are waiting for a response.",
    daysRemaining: 2,
    choices: [
      {
        id: "respond",
        label: "Fire Back Online",
        effects: [
          { stat: "clout", value: 20 },
          { stat: "stress", value: 15 },
        ],
      },
      {
        id: "ignore",
        label: "Stay Silent",
        effects: [
          { stat: "respect", value: -10 },
          { stat: "stress", value: -5 },
        ],
      },
      {
        id: "challenge",
        label: "Challenge to Battle",
        effects: [
          { stat: "clout", value: 40 },
          { stat: "pressure", value: 30 },
        ],
      },
    ],
  },
  {
    id: "3",
    type: "relationship",
    title: "Family Emergency",
    description: "A family member needs financial help. This could impact your savings but strengthen family bonds.",
    daysRemaining: 3,
    choices: [
      {
        id: "help",
        label: "Help Financially ($2,000)",
        effects: [
          { stat: "bankBalance", value: -2000 },
          { stat: "morale", value: 30 },
          { stat: "familySupport", value: 50 },
        ],
      },
      {
        id: "partial",
        label: "Help Partially ($500)",
        effects: [
          { stat: "bankBalance", value: -500 },
          { stat: "morale", value: 10 },
          { stat: "familySupport", value: 20 },
        ],
      },
      {
        id: "decline-help",
        label: "Can't Help Right Now",
        effects: [
          { stat: "morale", value: -20 },
          { stat: "familySupport", value: -30 },
        ],
      },
    ],
  },
  {
    id: "4",
    type: "career",
    title: "Battle Offer from URL",
    description: "URL wants you for their next card. This is a big opportunity but against a tough opponent.",
    resolved: true,
    outcome: "You accepted and are now scheduled to battle on the URL card next month!",
  },
]

const getEventIcon = (type: LifeEvent["type"]) => {
  switch (type) {
    case "opportunity":
      return <Star className="w-4 h-4" />
    case "challenge":
      return <AlertTriangle className="w-4 h-4" />
    case "relationship":
      return <Heart className="w-4 h-4" />
    case "financial":
      return <DollarSign className="w-4 h-4" />
    case "career":
      return <Mic className="w-4 h-4" />
    default:
      return <Calendar className="w-4 h-4" />
  }
}

const getEventColor = (type: LifeEvent["type"]) => {
  switch (type) {
    case "opportunity":
      return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
    case "challenge":
      return "text-red-400 bg-red-500/20 border-red-500/30"
    case "relationship":
      return "text-pink-400 bg-pink-500/20 border-pink-500/30"
    case "financial":
      return "text-green-400 bg-green-500/20 border-green-500/30"
    case "career":
      return "text-orange-400 bg-orange-500/20 border-orange-500/30"
    default:
      return "text-zinc-400 bg-zinc-500/20 border-zinc-500/30"
  }
}

const getEffectIcon = (stat: string, value: number) => {
  const isPositive = value > 0
  if (stat.includes("income") || stat.includes("Balance")) {
    return <DollarSign className={`w-3 h-3 ${isPositive ? "text-green-400" : "text-red-400"}`} />
  }
  if (stat.includes("clout") || stat.includes("respect")) {
    return isPositive ? (
      <TrendingUp className="w-3 h-3 text-green-400" />
    ) : (
      <TrendingDown className="w-3 h-3 text-red-400" />
    )
  }
  if (stat.includes("stress") || stat.includes("pressure")) {
    return <AlertTriangle className={`w-3 h-3 ${isPositive ? "text-red-400" : "text-green-400"}`} />
  }
  return isPositive ? (
    <TrendingUp className="w-3 h-3 text-green-400" />
  ) : (
    <TrendingDown className="w-3 h-3 text-red-400" />
  )
}

export default function LifeEventsPage() {
  const { activeBattler } = useBattler()
  const [events, setEvents] = useState<LifeEvent[]>(MOCK_EVENTS)
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null)

  const activeEvents = events.filter((e) => !e.resolved)
  const resolvedEvents = events.filter((e) => e.resolved)

  const handleChoice = (eventId: string, choiceId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === eventId) {
          const choice = event.choices?.find((c) => c.id === choiceId)
          return {
            ...event,
            resolved: true,
            outcome: `You chose: ${choice?.label}. Effects applied to your battler.`,
          }
        }
        return event
      }),
    )
    setSelectedEvent(null)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Active Events */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-zinc-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          ACTIVE EVENTS ({activeEvents.length})
        </h2>

        {activeEvents.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No active events right now.</p>
              <p className="text-xs text-zinc-500 mt-1">Check back later for new opportunities and challenges.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedEvent(event)}
              >
                <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition-all cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] px-2 py-0.5 border font-display font-bold uppercase flex items-center gap-1 ${getEventColor(event.type)}`}
                      >
                        {getEventIcon(event.type)}
                        {event.type}
                      </span>
                      {event.daysRemaining && (
                        <span className="text-xs text-orange-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.daysRemaining}d left
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-zinc-100 font-display text-lg">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-400 line-clamp-2">{event.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{event.choices?.length} choices available</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Events */}
      {resolvedEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-zinc-500 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            RESOLVED ({resolvedEvents.length})
          </h2>
          <div className="space-y-2">
            {resolvedEvents.map((event) => (
              <Card key={event.id} className="bg-zinc-900/50 border-zinc-800/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-display font-bold text-zinc-400">{event.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1">{event.outcome}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <Card className="bg-zinc-900 border-zinc-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] px-2 py-0.5 border font-display font-bold uppercase flex items-center gap-1 ${getEventColor(selectedEvent.type)}`}
                    >
                      {getEventIcon(selectedEvent.type)}
                      {selectedEvent.type}
                    </span>
                    {selectedEvent.daysRemaining && (
                      <span className="text-xs text-orange-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedEvent.daysRemaining} days remaining
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-zinc-100 font-display text-xl">{selectedEvent.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-300">{selectedEvent.description}</p>

                  <div className="space-y-3">
                    <h4 className="text-xs font-display font-bold text-zinc-500 uppercase">Your Options</h4>
                    {selectedEvent.choices?.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoice(selectedEvent.id, choice.id)}
                        className="w-full text-left p-3 bg-zinc-800 border border-zinc-700 hover:border-orange-500/50 transition-colors"
                      >
                        <p className="font-display font-bold text-zinc-200 mb-2">{choice.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {choice.effects.map((effect, i) => (
                            <span
                              key={i}
                              className={`text-[10px] px-2 py-0.5 border flex items-center gap-1 ${
                                effect.value > 0
                                  ? "text-green-400 border-green-500/30 bg-green-500/10"
                                  : "text-red-400 border-red-500/30 bg-red-500/10"
                              }`}
                            >
                              {getEffectIcon(effect.stat, effect.value)}
                              {effect.stat}: {effect.value > 0 ? "+" : ""}
                              {effect.value}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full text-zinc-500 hover:text-zinc-300"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Decide Later
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
