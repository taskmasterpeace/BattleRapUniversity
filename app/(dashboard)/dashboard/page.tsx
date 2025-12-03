"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useBattler } from "@/contexts/battler-context"
import { getNextScheduledBattle } from "@/lib/battle-scheduler"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CalendarCheck,
  Play,
  ChevronRight,
  Clock,
  TrendingUp,
  DollarSign,
  Swords,
  Flame,
  Mail,
  AlertCircle,
} from "lucide-react"
import { LEAGUES } from "@/lib/leagues"
import { BattlerPortrait } from "@/components/battler-portrait"
import { motion } from "framer-motion"
import { BATTLERS } from "@/lib/battlers"
import { StressWidget } from "@/components/life-events/stress-widget"
import { RegionalSceneWidget } from "@/components/dashboard/regional-scene-widget"
import { RivalriesWidget } from "@/components/media/rivalries-widget"
import { BattlerCard } from "@/components/dashboard/battler-card"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { PrepProgressWidget } from "@/components/battle-prep/prep-progress-widget"
import type { StressState } from "@/lib/life-events"

export default function DashboardPage() {
  const { activeBattler } = useBattler()
  const [nextBattle, setNextBattle] = useState<ReturnType<typeof getNextScheduledBattle>>(null)

  useEffect(() => {
    if (activeBattler) {
      const battle = getNextScheduledBattle(activeBattler.id)
      setNextBattle(battle)
    }
  }, [activeBattler])

  if (!activeBattler) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-400">Loading battler data...</p>
      </div>
    )
  }

  const battleOpponent = nextBattle ? BATTLERS.find((b) => b.id === nextBattle.opponentId) : null
  const battleLeague = nextBattle ? LEAGUES.find((l) => l.slug === nextBattle.leagueSlug) : null

  const mockStress: StressState = {
    level: activeBattler.stats?.stress || 35,
    status:
      (activeBattler.stats?.stress || 35) < 25
        ? "calm"
        : (activeBattler.stats?.stress || 35) < 50
          ? "focused"
          : (activeBattler.stats?.stress || 35) < 75
            ? "anxious"
            : "overwhelmed",
    contributing_factors: [
      { icon: "📅", label: "Upcoming battle pressure", stress_amount: 10 },
      { icon: "💰", label: "Financial concerns", stress_amount: 8 },
      { icon: "🎤", label: "Recent loss", stress_amount: 12 },
    ],
  }

  const battleOffers = [
    {
      id: "offer-1",
      opponent: BATTLERS.find((b) => b.id !== activeBattler.id && b.tier === "prospect"),
      league: LEAGUES[2],
      purse: 500,
      daysToRespond: 3,
    },
    {
      id: "offer-2",
      opponent: BATTLERS.find((b) => b.id !== activeBattler.id && b.tier === "contender"),
      league: LEAGUES[1],
      purse: 1500,
      daysToRespond: 5,
    },
  ].filter((o) => o.opponent)

  const recentBattles = [
    { opponent: BATTLERS.find((b) => b.id !== activeBattler.id), result: "W", league: LEAGUES[0] },
    {
      opponent: BATTLERS.find((b) => b.id !== activeBattler.id && b.tier === "veteran"),
      result: "L",
      league: LEAGUES[1],
    },
  ].filter((b) => b.opponent)

  const pendingLifeEvents = 2

  const hasActivePrepBattle = nextBattle && battleOpponent

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* BattlerCard at top left showing player stats and hometown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1"
        >
          <BattlerCard battler={activeBattler} />
        </motion.div>

        {/* StatsGrid showing attribute meters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="lg:col-span-1"
        >
          <StatsGrid battler={activeBattler} />
        </motion.div>

        {/* Stress + Pending Events Column */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StressWidget stress={mockStress} />
          </motion.div>

          {pendingLifeEvents > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Link href="/life-events">
                <Card className="bg-yellow-500/10 border-yellow-500/50 hover:border-yellow-500 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-500/20 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-yellow-500 text-lg">{pendingLifeEvents} PENDING</p>
                      <p className="text-xs text-yellow-500/70">Life events need attention</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {hasActivePrepBattle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
        >
          <PrepProgressWidget
            battleId={nextBattle.oddsId || "next"}
            opponentName={battleOpponent.stageName}
            opponentAvatar={battleOpponent.portrait?.spriteUrl}
            league={battleLeague?.displayName || "Unknown League"}
            daysUntilBattle={nextBattle.daysUntil}
            daysUntilPrepLock={Math.max(0, nextBattle.daysUntil - 2)}
            research={{
              level: "casual",
              days: 2,
            }}
            writing={{
              completed: 8,
              needed: 12,
            }}
            rehearsal={{
              roundsRehearsed: [1],
              totalRounds: 3,
            }}
            rounds={[
              { roundNum: 1, segmentsAssigned: 4, segmentsNeeded: 4 },
              { roundNum: 2, segmentsAssigned: 2, segmentsNeeded: 4 },
              { roundNum: 3, segmentsAssigned: 0, segmentsNeeded: 4 },
            ]}
            counters={{
              used: 0,
              available: 1,
            }}
          />
        </motion.div>
      )}

      {/* Next Battle Card - Hero */}
      {nextBattle && battleOpponent && battleLeague && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/20 border-orange-500/30 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-orange-500 font-display flex items-center gap-2">
                  <Swords className="w-5 h-5" />
                  NEXT BATTLE
                </CardTitle>
                <span className="text-xs text-zinc-500 font-mono">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {nextBattle.daysUntil} days
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center">
                  <div className="w-20 h-20 mx-auto mb-2 border-2 border-orange-500/50 bg-zinc-800 overflow-hidden">
                    <BattlerPortrait battler={activeBattler} size="md" showFrame={false} />
                  </div>
                  <p className="font-display font-bold text-orange-400 text-sm truncate">{activeBattler.stageName}</p>
                  <p className="text-xs text-zinc-500">{activeBattler.tier}</p>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-display font-black text-zinc-600">VS</span>
                  <span className="text-[10px] text-zinc-600 font-mono">{battleLeague.displayName}</span>
                </div>

                <div className="flex-1 text-center">
                  <div className="w-20 h-20 mx-auto mb-2 border-2 border-red-500/50 bg-zinc-800 overflow-hidden">
                    <BattlerPortrait battler={battleOpponent} size="md" showFrame={false} />
                  </div>
                  <p className="font-display font-bold text-red-400 text-sm truncate">{battleOpponent.stageName}</p>
                  <p className="text-xs text-zinc-500">{battleOpponent.tier}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link href="/battle/next/prep" className="flex-1">
                  <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-display">
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    PREP
                  </Button>
                </Link>
                <Link href={`/battle/${nextBattle.oddsId}/mode`} className="flex-1">
                  <Button className="w-full bg-orange-600 hover:bg-orange-500 text-white font-display font-bold">
                    <Play className="w-4 h-4 mr-2" />
                    BATTLE NOW
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {battleOffers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-zinc-300 font-display text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  BATTLE OFFERS
                </CardTitle>
                <Link
                  href="/battle/offers"
                  className="text-xs text-orange-500 hover:text-orange-400 font-display flex items-center"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {battleOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {offer.opponent && (
                      <div className="w-10 h-10 border border-zinc-600 overflow-hidden">
                        <BattlerPortrait battler={offer.opponent} size="sm" showFrame={false} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-display font-bold text-zinc-200">{offer.opponent?.stageName}</p>
                      <p className="text-xs text-zinc-500">{offer.league?.displayName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display font-bold text-green-400">${offer.purse.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">{offer.daysToRespond}d left</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-display">RECORD</p>
                <p className="text-xl font-display font-bold text-zinc-100">
                  {activeBattler.stats?.wins || 0}-{activeBattler.stats?.losses || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-display">CLOUT</p>
                <p className="text-xl font-display font-bold text-orange-400">{activeBattler.stats?.clout || 0}</p>
              </div>
              <Flame className="w-8 h-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-display">BALANCE</p>
                <p className="text-xl font-display font-bold text-green-400">
                  ${(activeBattler.stats?.bankBalance || 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-display">BATTLES</p>
                <p className="text-xl font-display font-bold text-zinc-100">
                  {(activeBattler.stats?.wins || 0) + (activeBattler.stats?.losses || 0)}
                </p>
              </div>
              <Swords className="w-8 h-8 text-zinc-500/50" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Battles + Rivalries */}
        <div className="space-y-6">
          {/* Recent Battles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-zinc-300 font-display text-sm">RECENT BATTLES</CardTitle>
                  <Link
                    href="/battles/history"
                    className="text-xs text-orange-500 hover:text-orange-400 font-display flex items-center"
                  >
                    View All <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentBattles.map((battle, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-zinc-800 border border-zinc-700">
                    <div className="flex items-center gap-2">
                      {battle.opponent && (
                        <div className="w-8 h-8 border border-zinc-600 overflow-hidden">
                          <BattlerPortrait battler={battle.opponent} size="sm" showFrame={false} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-display font-bold text-zinc-200">{battle.opponent?.stageName}</p>
                        <p className="text-xs text-zinc-500">{battle.league?.displayName}</p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-display font-bold ${battle.result === "W" ? "text-green-500" : "text-red-500"}`}
                    >
                      {battle.result}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Rivalries Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <RivalriesWidget />
          </motion.div>
        </div>

        {/* Right Column: Regional Scene */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <RegionalSceneWidget
            playerCitySlug={activeBattler.hometown?.toLowerCase().replace(/\s+/g, "-") || "atlanta"}
            playerRankInCity={7}
          />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="grid grid-cols-2 gap-3"
      >
        <Link href="/media">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-display font-bold text-zinc-200 text-sm">Media Hub</p>
                <p className="text-xs text-zinc-500">News & Rankings</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/leagues">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-display font-bold text-zinc-200 text-sm">Leagues</p>
                <p className="text-xs text-zinc-500">Browse Events</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  )
}
