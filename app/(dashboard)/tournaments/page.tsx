"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getLeagues, League } from "@/lib/leagues"
import { Trophy, Calendar, Users, MapPin, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Tournament {
  id: string
  name: string
  leagueSlug: string
  startDate: string
  endDate: string
  prizePool: number
  entrants: number
  maxEntrants: number
  status: "upcoming" | "in-progress" | "completed"
  format: "single-elimination" | "double-elimination" | "round-robin"
  entryFee: number
}

// MOCK_TOURNAMENTS removed - now fetches from /api/tournaments

const getStatusColor = (status: Tournament["status"]) => {
  switch (status) {
    case "upcoming":
      return "text-blue-400 bg-blue-500/20 border-blue-500/30"
    case "in-progress":
      return "text-green-400 bg-green-500/20 border-green-500/30"
    case "completed":
      return "text-zinc-400 bg-zinc-500/20 border-zinc-500/30"
  }
}

const getSizeBadgeColor = (size: number) => {
  if (size >= 64) return "text-purple-400 bg-purple-500/20 border-purple-500/30"
  if (size >= 32) return "text-amber-400 bg-amber-500/20 border-amber-500/30"
  if (size >= 16) return "text-orange-400 bg-orange-500/20 border-orange-500/30"
  return "text-zinc-400 bg-zinc-500/20 border-zinc-500/30"
}

export default function TournamentsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | Tournament["status"]>("all")
  const [leagues, setLeagues] = useState<League[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLeagues(getLeagues())
  }, [])

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const res = await fetch('/api/tournaments')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setTournaments(data.tournaments || [])
      } catch (err: any) {
        console.error('Failed to fetch tournaments:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTournaments()
  }, [])

  const filteredTournaments = tournaments.filter((t) => statusFilter === "all" || t.status === statusFilter)

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 font-display">Loading tournaments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <Trophy className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-zinc-300 font-display">Failed to load tournaments</p>
          <p className="text-zinc-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-600 text-white font-display text-sm hover:bg-orange-700 transition-colors"
          >
            RETRY
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-black text-zinc-100">Tournaments</h1>
          <p className="text-sm text-zinc-500">Compete in brackets from 6 to 64 battlers</p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange-500" />
          <span className="text-sm text-zinc-400">{tournaments.length} Total</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "upcoming", "in-progress", "completed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-xs font-display font-bold uppercase whitespace-nowrap transition-colors ${
              statusFilter === status
                ? "bg-orange-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
            }`}
          >
            {status.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Tournaments List */}
      <div className="space-y-4">
        {filteredTournaments.map((tournament, index) => {
          const league = leagues.find((l) => l.slug === tournament.leagueSlug)

          return (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* League Logo */}
                    <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {league?.logoUrl ? (
                        <Image
                          src={league.logoUrl || "/placeholder.svg"}
                          alt={league.displayName}
                          width={64}
                          height={64}
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <Trophy className="w-8 h-8 text-zinc-600" />
                      )}
                    </div>

                    {/* Tournament Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 border font-display font-bold uppercase ${getStatusColor(tournament.status)}`}
                        >
                          {tournament.status.replace("-", " ")}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 border font-display font-bold ${getSizeBadgeColor(tournament.maxEntrants)}`}
                        >
                          {tournament.maxEntrants}-MAN
                        </span>
                        <span className="text-xs text-zinc-500">{tournament.format.replace("-", " ")}</span>
                      </div>

                      <h3 className="font-display font-bold text-zinc-100 text-lg mb-1">{tournament.name}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {tournament.entrants}/{tournament.maxEntrants}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {league?.city || "TBD"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-[10px] text-zinc-500">PRIZE POOL</p>
                            <p className="font-display font-bold text-green-400">
                              ${tournament.prizePool.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500">ENTRY FEE</p>
                            <p className="font-display font-bold text-orange-400">${tournament.entryFee}</p>
                          </div>
                        </div>

                        {tournament.status === "upcoming" && (
                          <Button className="bg-orange-600 hover:bg-orange-500 text-white font-display text-sm">
                            ENTER
                          </Button>
                        )}
                        {tournament.status === "in-progress" && (
                          <Link href={`/tournaments/${tournament.id}/bracket`}>
                            <Button
                              variant="outline"
                              className="border-orange-500 text-orange-500 hover:bg-orange-500/10 font-display text-sm bg-transparent"
                            >
                              VIEW BRACKET
                            </Button>
                          </Link>
                        )}
                        {tournament.status === "completed" && (
                          <Link href={`/tournaments/${tournament.id}/bracket`}>
                            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200 font-display text-sm">
                              RESULTS <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No tournaments found.</p>
        </div>
      )}
    </div>
  )
}
