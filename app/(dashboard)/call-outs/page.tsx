"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CallOutCard } from "@/components/call-outs/call-out-card"
import { CreateCallOutModal } from "@/components/call-outs/create-call-out-modal"
import { useBattler } from "@/contexts/battler-context"
import {
  Megaphone,
  Plus,
  Filter,
  Flame,
  Target,
  Clock,
  Loader2,
} from "lucide-react"

interface CallOut {
  id: string
  caller: {
    id: string
    stageName: string
    tier: string
    crewTag?: string
    avatar?: string
  }
  target: {
    id: string
    stageName: string
    tier: string
    crewTag?: string
    avatar?: string
  }
  template: string
  customMessage?: string
  status: "pending" | "accepted" | "countered" | "ignored" | "expired"
  stakeAmount: number
  league?: {
    id: string
    name: string
  }
  cosignCount: number
  responseDeadline: string
  createdAt: string
}

export default function CallOutsPage() {
  const { activeBattler, loading: battlerLoading } = useBattler()
  const [callOuts, setCallOuts] = useState<CallOut[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "targeting-me" | "my-callouts">("all")
  const [leagueFilter, setLeagueFilter] = useState<string>("all")
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function fetchCallOuts() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (filter === "targeting-me") params.append("target", "me")
        if (filter === "my-callouts") params.append("caller", "me")
        if (leagueFilter !== "all") params.append("league", leagueFilter)

        const res = await fetch(`/api/call-outs?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setCallOuts(data.callOuts || [])
        }
      } catch (err) {
        console.error("Failed to fetch call-outs:", err)
      } finally {
        setLoading(false)
      }
    }

    if (!battlerLoading) {
      fetchCallOuts()
    }
  }, [filter, leagueFilter, battlerLoading])

  const handleRespond = async (callOutId: string, response: "accept" | "counter" | "ignore") => {
    try {
      const res = await fetch(`/api/call-outs/${callOutId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      })

      if (res.ok) {
        // Refresh call-outs
        const params = new URLSearchParams()
        if (filter === "targeting-me") params.append("target", "me")
        if (filter === "my-callouts") params.append("caller", "me")
        if (leagueFilter !== "all") params.append("league", leagueFilter)

        const refreshRes = await fetch(`/api/call-outs?${params.toString()}`)
        if (refreshRes.ok) {
          const data = await refreshRes.json()
          setCallOuts(data.callOuts || [])
        }
      }
    } catch (err) {
      console.error("Failed to respond to call-out:", err)
    }
  }

  if (battlerLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const targetingMe = callOuts.filter((co) => co.target.id === activeBattler?.id && co.status === "pending")
  const hasTargetedCallOuts = targetingMe.length > 0

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-600/20 border-2 border-orange-500/50 flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-zinc-100 uppercase tracking-tighter">
              Call-Out Board
            </h1>
            <p className="text-sm text-zinc-500 font-display">Public challenges and callouts</p>
          </div>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 text-white font-display font-bold uppercase tracking-wide"
        >
          <Plus className="w-4 h-4 mr-2" />
          Call Someone Out
        </Button>
      </motion.div>

      {/* Alert for targeting */}
      {hasTargetedCallOuts && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-red-950/30 border-red-500/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Target className="w-6 h-6 text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="font-display font-bold text-red-400 text-lg">
                  {targetingMe.length} CALL-OUT{targetingMe.length > 1 ? "S" : ""} TARGETING YOU
                </p>
                <p className="text-xs text-red-400/70">Respond or face reputation damage</p>
              </div>
              <Button
                onClick={() => setFilter("targeting-me")}
                className="bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs uppercase"
              >
                View
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="flex gap-2">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={`font-display text-xs uppercase ${
              filter === "all"
                ? "bg-orange-600 hover:bg-orange-500 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
            }`}
          >
            All Call-Outs
          </Button>
          <Button
            onClick={() => setFilter("targeting-me")}
            variant={filter === "targeting-me" ? "default" : "outline"}
            className={`font-display text-xs uppercase ${
              filter === "targeting-me"
                ? "bg-orange-600 hover:bg-orange-500 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
            }`}
          >
            <Target className="w-3 h-3 mr-1" />
            Targeting Me ({targetingMe.length})
          </Button>
          <Button
            onClick={() => setFilter("my-callouts")}
            variant={filter === "my-callouts" ? "default" : "outline"}
            className={`font-display text-xs uppercase ${
              filter === "my-callouts"
                ? "bg-orange-600 hover:bg-orange-500 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
            }`}
          >
            <Megaphone className="w-3 h-3 mr-1" />
            My Call-Outs
          </Button>
        </div>

        <select
          value={leagueFilter}
          onChange={(e) => setLeagueFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-zinc-300 font-display focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Leagues</option>
          <option value="small-room">Small Room Circuit</option>
          <option value="main-stage">Main Stage Arena</option>
        </select>
      </motion.div>

      {/* Call-Outs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {loading ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-zinc-500 font-display">Loading call-outs...</p>
            </CardContent>
          </Card>
        ) : callOuts.length > 0 ? (
          callOuts.map((callOut, index) => (
            <motion.div
              key={callOut.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <CallOutCard
                callOut={callOut}
                isTargetingMe={callOut.target.id === activeBattler?.id}
                onRespond={handleRespond}
              />
            </motion.div>
          ))
        ) : (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-12 text-center">
              <Megaphone className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 font-display text-lg mb-2">No Call-Outs Found</p>
              <p className="text-zinc-600 text-sm mb-4">
                {filter === "targeting-me"
                  ? "No one is calling you out right now"
                  : filter === "my-callouts"
                    ? "You haven't called anyone out yet"
                    : "The board is empty"}
              </p>
              {filter === "all" && (
                <Button
                  onClick={() => setModalOpen(true)}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-display font-bold text-sm uppercase"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Make the First Call-Out
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-300 font-display text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              How Call-Outs Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-zinc-400">
            <p>• Call out battlers publicly to challenge them to a battle</p>
            <p>• Targets have 48 hours to respond (Accept/Counter/Ignore)</p>
            <p>• Crew members can cosign call-outs to increase pressure</p>
            <p className="text-yellow-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Warning: Ignoring too many call-outs earns the "Ducking" badge
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Call-Out Modal */}
      <CreateCallOutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          // Refresh call-outs
          const params = new URLSearchParams()
          if (filter === "targeting-me") params.append("target", "me")
          if (filter === "my-callouts") params.append("caller", "me")
          if (leagueFilter !== "all") params.append("league", leagueFilter)

          fetch(`/api/call-outs?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => setCallOuts(data.callOuts || []))
        }}
      />
    </div>
  )
}
