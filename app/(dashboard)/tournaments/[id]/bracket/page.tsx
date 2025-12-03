"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Crown, X, Users, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import {
  type TournamentBracket,
  type BracketBattler,
  type BracketMatch,
  createSampleTournament,
  getAllRoundNames,
  getBracketStats,
} from "@/lib/tournament-brackets"

// Sample tournaments for different sizes
const SAMPLE_TOURNAMENTS: Record<string, TournamentBracket> = {
  "tourney-6": createSampleTournament(6, "tourney-6", "Proving Grounds 6-Man", "PROVING GROUNDS", 1),
  "tourney-8": createSampleTournament(8, "tourney-8", "Underground 8", "UNDERGROUND KINGS", 2),
  "tourney-16": createSampleTournament(16, "tourney-16", "Ultimate Madness 16", "URL", 2),
  "tourney-32": createSampleTournament(32, "tourney-32", "Summer Madness 32", "SMACK/URL", 3),
  "tourney-64": createSampleTournament(64, "tourney-64", "March Madness 64", "KOTD x URL", 4),
}

// Battler slot component with profile pic and elimination X
function BattlerSlot({
  battler,
  isWinner,
  showSeed = true,
  compact = false,
}: {
  battler: BracketBattler | null
  isWinner: boolean
  showSeed?: boolean
  compact?: boolean
}) {
  if (!battler) {
    return (
      <div
        className={`flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/50 ${compact ? "p-1 min-w-[100px]" : "p-1.5 min-w-[140px] md:min-w-[180px]"}`}
      >
        <div
          className={`${compact ? "w-6 h-6" : "w-8 h-8 md:w-10 md:h-10"} bg-zinc-700/50 flex-shrink-0 flex items-center justify-center`}
        >
          <span className="text-zinc-600 text-[10px]">?</span>
        </div>
        <span className={`text-zinc-600 ${compact ? "text-[10px]" : "text-xs"} font-display`}>TBD</span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 ${compact ? "p-1 min-w-[100px]" : "p-1.5 min-w-[140px] md:min-w-[180px]"} transition-all ${
        battler.eliminated
          ? "bg-zinc-900/80 border border-zinc-800"
          : isWinner
            ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50"
            : "bg-zinc-800 border border-zinc-700"
      }`}
    >
      {/* Profile Picture with X overlay if eliminated */}
      <div className={`relative ${compact ? "w-6 h-6" : "w-8 h-8 md:w-10 md:h-10"} flex-shrink-0`}>
        <Image
          src={battler.avatar || "/placeholder.svg"}
          alt={battler.name}
          fill
          className={`object-cover ${battler.eliminated ? "grayscale opacity-50" : ""}`}
        />
        {battler.eliminated && (
          <div className="absolute inset-0 flex items-center justify-center">
            <X className={`${compact ? "w-6 h-6" : "w-8 h-8 md:w-10 md:h-10"} text-red-500 stroke-[3]`} />
          </div>
        )}
        {isWinner && !battler.eliminated && (
          <div
            className={`absolute -top-1 -right-1 ${compact ? "w-3 h-3" : "w-4 h-4"} bg-amber-500 rounded-full flex items-center justify-center`}
          >
            <Crown className={`${compact ? "w-2 h-2" : "w-2.5 h-2.5"} text-black`} />
          </div>
        )}
      </div>

      {/* Name and Seed */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {showSeed && (
            <span
              className={`${compact ? "text-[8px]" : "text-[10px]"} font-bold ${battler.eliminated ? "text-zinc-600" : "text-orange-500"}`}
            >
              {battler.seed}
            </span>
          )}
          <span
            className={`${compact ? "text-[10px]" : "text-xs md:text-sm"} font-display font-bold truncate ${
              battler.eliminated ? "text-zinc-600 line-through" : "text-zinc-100"
            }`}
          >
            {battler.name}
          </span>
        </div>
      </div>
    </div>
  )
}

// Match component showing two battlers
function MatchCard({
  match,
  compact = false,
  showConnector = false,
  side = "left",
}: {
  match: BracketMatch
  compact?: boolean
  showConnector?: boolean
  side?: "left" | "right"
}) {
  const winner1 = match.winner === match.battler1?.id
  const winner2 = match.winner === match.battler2?.id

  return (
    <div className={`flex items-center ${side === "right" ? "flex-row-reverse" : ""}`}>
      <div className="flex flex-col gap-0.5">
        <BattlerSlot battler={match.battler1} isWinner={winner1} compact={compact} />
        <BattlerSlot battler={match.battler2} isWinner={winner2} compact={compact} />
        {match.completed && match.score && !match.isBye && (
          <div className={`${compact ? "text-[8px]" : "text-[10px]"} text-zinc-500 text-center mt-0.5 font-mono`}>
            {match.score}
          </div>
        )}
        {match.isBye && (
          <div className={`${compact ? "text-[8px]" : "text-[10px]"} text-amber-500/70 text-center mt-0.5 font-mono`}>
            BYE
          </div>
        )}
      </div>

      {/* Connector line */}
      {showConnector && (
        <div className={`${compact ? "w-4" : "w-6 md:w-8"} h-px bg-zinc-700 ${side === "right" ? "mr-2" : "ml-2"}`} />
      )}
    </div>
  )
}

// Full bracket view for desktop
function FullBracketView({ bracket }: { bracket: TournamentBracket }) {
  const roundNames = getAllRoundNames(bracket.size)
  const isLargeTournament = bracket.size >= 32

  // Split rounds into left and right sides
  const midRound = Math.ceil(bracket.rounds / 2)

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[900px] px-4">
        {/* Round Headers */}
        <div className="flex justify-between mb-4">
          {roundNames.map((name, i) => (
            <div
              key={i}
              className={`text-center px-2 py-1 text-xs font-display font-bold ${
                i + 1 === bracket.currentRound ? "text-orange-500 bg-orange-500/10" : "text-zinc-500"
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Bracket Grid */}
        <div className="flex justify-between items-center gap-2">
          {Array.from({ length: bracket.rounds }, (_, roundIndex) => {
            const round = roundIndex + 1
            const roundMatches = bracket.matches.filter((m) => m.round === round)
            const matchHeight = Math.pow(2, roundIndex) * (isLargeTournament ? 50 : 70)

            return (
              <div key={round} className="flex flex-col justify-around flex-1" style={{ gap: `${matchHeight}px` }}>
                {roundMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    compact={isLargeTournament}
                    showConnector={round < bracket.rounds}
                    side={round <= midRound ? "left" : "right"}
                  />
                ))}
              </div>
            )
          })}
        </div>

        {/* Champion Display */}
        {bracket.champion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center mt-8"
          >
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-1">
              <div className="relative w-20 h-20 bg-zinc-900">
                <Image
                  src={bracket.champion.avatar || "/placeholder.svg"}
                  alt={bracket.champion.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <Trophy className="w-8 h-8 text-amber-500 mt-2" />
            <span className="text-amber-500 font-display font-black text-lg mt-1">{bracket.champion.name}</span>
            <span className="text-zinc-500 text-xs">CHAMPION</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Mobile bracket view - one round at a time
function MobileBracketView({
  bracket,
  selectedRound,
  onRoundChange,
}: {
  bracket: TournamentBracket
  selectedRound: number
  onRoundChange: (round: number) => void
}) {
  const roundMatches = bracket.matches.filter((m) => m.round === selectedRound)
  const roundNames = getAllRoundNames(bracket.size)

  // Split matches into left/right for URL-style display
  const halfCount = Math.ceil(roundMatches.length / 2)
  const leftMatches = roundMatches.slice(0, halfCount)
  const rightMatches = roundMatches.slice(halfCount)

  return (
    <div className="px-4">
      {/* Round Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRoundChange(selectedRound - 1)}
          disabled={selectedRound === 1}
          className="text-zinc-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="bg-orange-600 px-6 py-2">
          <h2 className="text-base font-display font-black text-white tracking-wider">
            {roundNames[selectedRound - 1]}
          </h2>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRoundChange(selectedRound + 1)}
          disabled={selectedRound >= bracket.currentRound}
          className="text-zinc-400"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* URL-style split bracket */}
      <div className="flex gap-4">
        {/* Left Side */}
        <div className="flex-1 space-y-3">
          {leftMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MatchCard match={match} compact={bracket.size >= 32} />
            </motion.div>
          ))}
        </div>

        {/* Center Logo */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 space-y-3">
          {rightMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex justify-end"
            >
              <MatchCard match={match} compact={bracket.size >= 32} side="right" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Champion */}
      {bracket.champion && selectedRound === bracket.rounds && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mt-8"
        >
          <Trophy className="w-8 h-8 text-amber-500 mb-2" />
          <span className="text-amber-500 font-display font-black">{bracket.champion.name}</span>
          <span className="text-zinc-500 text-xs">CHAMPION</span>
        </motion.div>
      )}
    </div>
  )
}

export default function TournamentBracketPage() {
  const router = useRouter()
  const params = useParams()
  const tournamentId = params.id as string

  // Get tournament or fallback to 16-man
  const bracket = SAMPLE_TOURNAMENTS[tournamentId] || SAMPLE_TOURNAMENTS["tourney-16"]
  const [selectedRound, setSelectedRound] = useState(bracket.currentRound)
  const stats = useMemo(() => getBracketStats(bracket), [bracket])
  const roundNames = getAllRoundNames(bracket.size)

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/tournaments")}
            className="text-zinc-400 hover:text-zinc-100 mb-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Tournaments
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-display font-black text-zinc-100">{bracket.name}</h1>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>{bracket.league}</span>
                  <span>•</span>
                  <Users className="w-3 h-3" />
                  <span>{bracket.size} Battlers</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-4 text-xs">
              <div className="text-center">
                <div className="text-zinc-100 font-bold">{stats.completedMatches}</div>
                <div className="text-zinc-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-zinc-100 font-bold">{stats.remainingMatches}</div>
                <div className="text-zinc-500">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-zinc-100 font-bold">{stats.activeBattlers}</div>
                <div className="text-zinc-500">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Round Selector */}
        <div className="hidden md:flex overflow-x-auto px-4 pb-3 gap-2">
          {roundNames.map((name, i) => {
            const round = i + 1
            return (
              <button
                key={round}
                onClick={() => setSelectedRound(round)}
                className={`px-4 py-2 text-xs font-display font-bold uppercase whitespace-nowrap transition-all ${
                  selectedRound === round
                    ? "bg-orange-600 text-white"
                    : round <= bracket.currentRound
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                }`}
                disabled={round > bracket.currentRound}
              >
                {name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-zinc-900">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
          style={{ width: `${stats.progressPercent}%` }}
        />
      </div>

      {/* Bracket Content */}
      <div className="py-6">
        {/* Mobile View */}
        <div className="md:hidden">
          <MobileBracketView bracket={bracket} selectedRound={selectedRound} onRoundChange={setSelectedRound} />
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <FullBracketView bracket={bracket} />
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-8">
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50" />
            <span className="text-zinc-400">Winner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 bg-zinc-800 flex items-center justify-center">
              <X className="w-3 h-3 text-red-500 stroke-[3]" />
            </div>
            <span className="text-zinc-400">Eliminated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-zinc-800/50 border border-zinc-700/50" />
            <span className="text-zinc-400">TBD</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500/70 font-mono text-[10px]">BYE</span>
            <span className="text-zinc-400">Automatic Advance</span>
          </div>
        </div>
      </div>
    </div>
  )
}
