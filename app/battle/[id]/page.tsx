"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { NavHeader } from "@/components/ui/nav-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { PostBattleSummary } from "@/components/battle/post-battle-summary"
import { PostBattleReaction } from "@/components/battle/post-battle-reaction"
import { JudgeScorecard } from "@/components/battle/judge-scorecard"
import { BattleAnalysis } from "@/components/battle/battle-analysis"
import { BattleViewsDisplay } from "@/components/battle/battle-views-display"
import { Play, Flame, Zap, AlertTriangle } from "lucide-react"

// Helper to interpret battle statistics into storytelling
function interpretBattleStats(
  playerName: string,
  opponentName: string,
  rounds: any[],
  segments: any[],
  playerId: string,
  opponentId: string,
  winnerId: string | null
) {
  const playerWon = winnerId === playerId
  const playerRounds = rounds.filter(r => r.battler_id === playerId)
  const opponentRounds = rounds.filter(r => r.battler_id === opponentId)
  const playerSegments = segments.filter(s => s.battler_id === playerId)

  // Find haymakers (segment_score >= 8.5) and chokes
  const haymakers = playerSegments.filter(s => s.segment_score >= 8.5)
  const chokes = playerSegments.filter(s => s.choked)
  const stumbles = playerSegments.filter(s => s.stumbled)

  // Calculate averages
  const avgScore = playerRounds.length > 0
    ? playerRounds.reduce((sum, r) => sum + (r.average_score || 0), 0) / playerRounds.length
    : 0
  const avgCrowd = playerRounds.length > 0
    ? playerRounds.reduce((sum, r) => sum + (r.crowd_reaction || 0), 0) / playerRounds.length
    : 0
  const peakScore = Math.max(...playerRounds.map(r => r.peak_score || 0), 0)

  // Generate interpretation
  const interpretations: string[] = []

  // Opening interpretation
  if (playerWon) {
    if (haymakers.length >= 3) {
      interpretations.push(`${playerName} came out SWINGING! Multiple haymakers had the crowd going crazy.`)
    } else if (avgCrowd > 80) {
      interpretations.push(`${playerName} controlled the room from start to finish. The crowd was with them all night.`)
    } else if (peakScore > 9) {
      interpretations.push(`${playerName} had that ONE moment that sealed the deal. When it hit, the room knew it was over.`)
    } else {
      interpretations.push(`${playerName} showed up and handled business. Solid performance throughout.`)
    }
  } else {
    if (chokes.length > 0) {
      // round_index is already 1-indexed from simulation
      interpretations.push(`Rough night for ${playerName}. That choke in round ${chokes[0].round_index} was hard to watch.`)
    } else if (avgScore < 6) {
      interpretations.push(`${playerName} came in flat. ${opponentName} was just on another level tonight.`)
    } else {
      interpretations.push(`${playerName} put up a fight, but ${opponentName} edged it out. Close battle.`)
    }
  }

  // Key moments
  const keyMoments: { round: number; description: string; impact: "major" | "moderate" | "minor" }[] = []

  if (haymakers.length > 0) {
    const bestHaymaker = haymakers.sort((a, b) => b.segment_score - a.segment_score)[0]
    keyMoments.push({
      // round_index is already 1-indexed from simulation
      round: bestHaymaker.round_index,
      description: `${playerName} dropped a HAYMAKER that had the room in shambles`,
      impact: "major"
    })
  }

  if (chokes.length > 0) {
    keyMoments.push({
      // round_index is already 1-indexed from simulation
      round: chokes[0].round_index,
      description: `${playerName} choked - the worst feeling in battle rap`,
      impact: "major"
    })
  }

  // Strengths and weaknesses based on data
  const strengths: string[] = []
  const weaknesses: string[] = []

  if (avgCrowd > 75) strengths.push("Crowd control was ON POINT")
  if (peakScore > 8.5) strengths.push("Delivered big moments when it counted")
  if (haymakers.length >= 2) strengths.push("Multiple haymaker punches")
  if (avgScore > 7.5) strengths.push("Consistent throughout")

  if (chokes.length > 0) weaknesses.push("Choked under pressure")
  if (stumbles.length > 0) weaknesses.push("Had some stumbles")
  if (avgScore < 6.5) weaknesses.push("Overall performance was weak")
  if (avgCrowd < 60) weaknesses.push("Couldn't connect with the crowd")

  // If no specific strengths/weaknesses, add generic ones
  if (strengths.length === 0) strengths.push("Showed up and competed")
  if (weaknesses.length === 0 && !playerWon) weaknesses.push("Couldn't match opponent's energy")

  return {
    interpretations,
    keyMoments,
    strengths,
    weaknesses,
    stats: {
      avgScore,
      avgCrowd,
      peakScore,
      haymakerCount: haymakers.length,
      chokeCount: chokes.length,
    }
  }
}

// Get crowd reaction phrase based on score
function getCrowdPhrase(crowdReaction: number): string {
  if (crowdReaction >= 90) return "ROOM WENT CRAZY"
  if (crowdReaction >= 80) return "GAS! 🔥"
  if (crowdReaction >= 70) return "They feeling it"
  if (crowdReaction >= 60) return "Crowd engaged"
  if (crowdReaction >= 50) return "Mixed reaction"
  if (crowdReaction >= 40) return "Light work..."
  return "Crickets"
}

// Get battle rap decision type based on score differential and round wins
function getDecisionType(
  playerWins: number,
  opponentWins: number,
  roundResults: { playerScore: number; opponentScore: number; playerCrowd: number; opponentCrowd: number }[],
  isVictory: boolean
): { label: string; color: string; slang?: string; description?: string } {
  const totalPlayerScore = roundResults.reduce((sum, r) => sum + r.playerScore, 0)
  const totalOpponentScore = roundResults.reduce((sum, r) => sum + r.opponentScore, 0)
  const scoreDiff = Math.abs(totalPlayerScore - totalOpponentScore)
  const avgCrowd = roundResults.reduce((sum, r) => sum + Math.max(r.playerCrowd, r.opponentCrowd), 0) / roundResults.length

  // 3-0 scenarios
  if (playerWins === 3 || opponentWins === 3) {
    if (scoreDiff > 4) {
      return {
        label: "BODYBAG",
        color: isVictory ? "text-green-500" : "text-red-500",
        slang: "30",
        description: isVictory ? "You BODIED them! 3-0 no debate." : "You got 30'd. No debate."
      }
    }
    return {
      label: "CLEAR 3-0",
      color: isVictory ? "text-green-400" : "text-red-400",
      description: isVictory ? "Clean sweep - took all 3 rounds" : "Lost all 3 rounds"
    }
  }

  // 2-1 scenarios
  if (scoreDiff < 1.5) {
    // Very close battle
    if (avgCrowd > 75) {
      return {
        label: "CLASSIC",
        color: "text-amber-400",
        description: "This was a CLASSIC - both battlers came with it. Debatable 2-1."
      }
    }
    return {
      label: "DEBATABLE",
      color: "text-zinc-400",
      description: "Fans are split - this one will be debated. Could go either way."
    }
  } else if (scoreDiff < 3) {
    return {
      label: "EDGE",
      color: isVictory ? "text-green-400" : "text-red-400",
      description: isVictory ? "You edged it 2-1 - close battle" : "Lost a close one 2-1"
    }
  } else {
    return {
      label: "CLEAR 2-1",
      color: isVictory ? "text-green-500" : "text-red-500",
      description: isVictory ? "Clear 2-1 victory" : "Clear 2-1 loss"
    }
  }
}

export default function BattleResultsPage() {
  const params = useParams()
  const [selectedRound, setSelectedRound] = useState(1)
  const [battleData, setBattleData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBattle() {
      try {
        const battleId = params.id as string
        const response = await fetch(`/api/battles/${battleId}`)
        if (response.ok) {
          const data = await response.json()
          setBattleData(data)
        } else {
          setError(`Failed to load battle (HTTP ${response.status})`)
        }
      } catch (error: any) {
        console.error('Error fetching battle:', error)
        setError(error.message || 'Network error')
      } finally {
        setLoading(false)
      }
    }
    fetchBattle()
  }, [params.id])

  // Process real data
  const processedData = useMemo(() => {
    if (!battleData) return null

    const { battle, rounds, segments, earnings, rating_change } = battleData
    const playerId = battle?.player_battler?.id
    const opponentId = battle?.ai_battler?.id
    const winnerId = battle?.winner_battler_id

    // Helper function to compute round stats from segments
    const computeRoundStatsFromSegments = (battlerId: string, roundIndex: number) => {
      const roundSegments = (segments || []).filter(
        (s: any) => s.battler_id === battlerId && s.round_index === roundIndex
      )
      if (roundSegments.length === 0) return null

      const scores = roundSegments.map((s: any) => s.segment_score || 0)
      const crowds = roundSegments.map((s: any) => s.crowd_reaction || 0)

      return {
        average_score: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
        peak_score: Math.max(...scores),
        crowd_reaction: crowds.reduce((a: number, b: number) => a + b, 0) / crowds.length,
      }
    }

    // Group rounds by battler and round index (from battle_rounds table)
    const playerRounds = (rounds || []).filter((r: any) => r.battler_id === playerId)
    const opponentRounds = (rounds || []).filter((r: any) => r.battler_id === opponentId)

    // Determine round winners
    const roundResults: { number: number; playerScore: number; opponentScore: number; winner: "player" | "opponent"; playerCrowd: number; opponentCrowd: number; playerPeak: number; opponentPeak: number }[] = []

    // Simulation saves round_index as 1, 2, 3 (not 0-indexed)
    for (let i = 1; i <= 3; i++) {
      // Try to get from battle_rounds table first, fallback to computing from segments
      const pRound = playerRounds.find((r: any) => r.round_index === i) || computeRoundStatsFromSegments(playerId, i)
      const oRound = opponentRounds.find((r: any) => r.round_index === i) || computeRoundStatsFromSegments(opponentId, i)

      const pScore = pRound?.average_score || 0
      const oScore = oRound?.average_score || 0

      roundResults.push({
        number: i,
        playerScore: pScore,
        opponentScore: oScore,
        winner: pScore >= oScore ? "player" : "opponent",
        playerCrowd: pRound?.crowd_reaction || 0,
        opponentCrowd: oRound?.crowd_reaction || 0,
        playerPeak: pRound?.peak_score || 0,
        opponentPeak: oRound?.peak_score || 0,
      })
    }

    // Calculate overall score
    const playerWins = roundResults.filter(r => r.winner === "player").length
    const opponentWins = roundResults.filter(r => r.winner === "opponent").length

    // Determine winner - prefer winnerId from API, but fallback to round count
    let overallWinner: "player" | "opponent"
    if (winnerId && playerId && opponentId) {
      // Use API winner if available
      overallWinner = winnerId === playerId ? "player" : "opponent"
    } else {
      // Fallback: use round wins count
      overallWinner = playerWins >= opponentWins ? "player" : "opponent"
    }

    // Debug logging for winner determination
    console.log('Winner Debug:', { winnerId, playerId, opponentId, playerWins, opponentWins, overallWinner })

    // Get segments for selected round
    const playerSegments = (segments || []).filter((s: any) => s.battler_id === playerId)
    const opponentSegments = (segments || []).filter((s: any) => s.battler_id === opponentId)

    // Get interpretation
    const interpretation = interpretBattleStats(
      battle?.player_battler?.stage_name || "PLAYER",
      battle?.ai_battler?.stage_name || "OPPONENT",
      rounds || [],
      segments || [],
      playerId,
      opponentId,
      winnerId
    )

    return {
      battle,
      playerId,
      opponentId,
      winnerId,
      roundResults,
      playerWins,
      opponentWins,
      overallWinner,
      playerSegments,
      opponentSegments,
      earnings: earnings || { basePay: 500, winBonus: 0, performanceBonus: 0, total: 500 },
      ratingChange: rating_change || 0,
      interpretation,
    }
  }, [battleData])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 font-display">Loading battle results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          <div>
            <p className="text-zinc-300 font-display text-lg mb-2">Failed to Load Battle</p>
            <p className="text-zinc-500 text-sm">{error}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-600 text-white font-display text-sm hover:bg-orange-700 transition-colors"
            >
              RETRY
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-zinc-800 text-zinc-300 font-display text-sm hover:bg-zinc-700 transition-colors"
            >
              BACK TO DASHBOARD
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!battleData || !processedData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-zinc-600 mx-auto" />
          <div>
            <p className="text-zinc-400 font-display text-lg mb-2">Battle Not Found</p>
            <p className="text-zinc-500 text-sm">This battle doesn't exist or hasn't been completed yet</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-orange-600 text-white font-display text-sm hover:bg-orange-700 transition-colors"
          >
            BACK TO DASHBOARD
          </Link>
        </div>
      </div>
    )
  }

  const {
    battle,
    roundResults,
    playerWins,
    opponentWins,
    overallWinner,
    playerSegments,
    opponentSegments,
    earnings,
    ratingChange,
    interpretation
  } = processedData

  const playerName = battle?.player_battler?.stage_name || "PLAYER"
  const opponentName = battle?.ai_battler?.stage_name || "OPPONENT"
  const playerAvatar = battle?.player_battler?.avatar_url || "/rapper-pixel.jpg"
  const opponentAvatar = battle?.ai_battler?.avatar_url || "/rapper-portrait-pixel-art.jpg"
  const isVictory = overallWinner === "player"

  const currentRound = roundResults.find(r => r.number === selectedRound) || roundResults[0]
  // Segments use 1-indexed round_index to match rounds
  const currentRoundSegments = playerSegments.filter((s: any) => s.round_index === selectedRound)

  // Build post-battle summary from API progression data (or fallback to calculated values)
  const apiProgression = battleData?.progression
  const postBattleSummary = {
    ratingChange: apiProgression?.ratingChange ?? (isVictory ? Math.abs(ratingChange) : -Math.abs(ratingChange)),
    newRating: apiProgression?.newRating ?? (1200 + ratingChange),
    attributeChanges: apiProgression?.attributeChanges ?? [],
    badgesEarned: apiProgression?.badgesEarned ?? [],
    stressChange: apiProgression?.stressChange ?? (isVictory ? -5 : 10),
    currentStress: apiProgression?.currentStress ?? 50,
    viewData: apiProgression?.viewData ?? {
      total_views: Math.floor(5000 + Math.random() * 20000),
      view_tier: "mid" as const,
    },
    fanGrowth: apiProgression?.fanGrowth ?? {
      fans_before: 250,
      fans_after: isVictory ? 387 : 260,
      fans_gained: isVictory ? 137 : 10,
      trending_change: isVictory ? 15 : -5,
    },
    levelUpData: apiProgression?.levelUpData ?? {
      leveledUp: false,
      previousLevel: 5,
      newLevel: 5,
      skillPointsEarned: 0,
      xpEarned: isVictory ? 450 : 150,
    },
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <NavHeader title="BATTLE RESULTS" backLabel="DASHBOARD" backHref="/dashboard" />

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Battle Header */}
        <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Player Side */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-800 border-2 border-zinc-600 overflow-hidden shrink-0">
                <Image
                  src={playerAvatar}
                  alt={playerName}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-100">
                  {playerName}
                </h2>
                <span className="text-sm text-zinc-400">{battle?.player_battler?.tier?.toUpperCase() || 'MID'} TIER</span>
              </div>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-mono font-bold">
                <span className={isVictory ? "text-green-500" : "text-zinc-400"}>
                  {playerWins}
                </span>
                <span className="text-zinc-600 mx-3 sm:mx-4">-</span>
                <span className={!isVictory ? "text-green-500" : "text-zinc-400"}>
                  {opponentWins}
                </span>
              </div>
              {(() => {
                const decision = getDecisionType(playerWins, opponentWins, roundResults, isVictory)
                return (
                  <div className="mt-2">
                    <span className={`text-xl font-display font-black tracking-tight ${decision.color}`}>
                      {decision.label}
                      {decision.slang && <span className="text-xs ml-2 text-zinc-500">({decision.slang})</span>}
                    </span>
                    {decision.description && (
                      <p className="text-xs text-zinc-500 mt-1 max-w-48 mx-auto">{decision.description}</p>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Opponent Side */}
            <div className="flex items-center gap-4">
              <div className="text-right sm:block hidden">
                <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-100">
                  {opponentName}
                </h2>
                <span className="text-sm text-zinc-400">{battle?.ai_battler?.tier?.toUpperCase() || 'MID'} TIER</span>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-800 border-2 border-zinc-600 overflow-hidden shrink-0">
                <Image
                  src={opponentAvatar}
                  alt={opponentName}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="text-left sm:hidden">
                <h2 className="text-lg font-display font-bold text-zinc-100">{opponentName}</h2>
                <span className="text-sm text-zinc-400">{battle?.ai_battler?.tier?.toUpperCase() || 'MID'} TIER</span>
              </div>
            </div>
          </div>
        </div>

        {/* Story Interpretation Card */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-2 border-orange-500/30 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-display font-bold text-orange-500 tracking-wide">THE BREAKDOWN</h3>
          </div>
          <p className="text-zinc-200 text-lg leading-relaxed">
            {interpretation.interpretations[0]}
          </p>
          {interpretation.stats.haymakerCount > 0 && (
            <div className="flex items-center gap-2 mt-3 text-amber-400">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-bold">{interpretation.stats.haymakerCount} HAYMAKER{interpretation.stats.haymakerCount > 1 ? 'S' : ''}</span>
            </div>
          )}
          {interpretation.stats.chokeCount > 0 && (
            <div className="flex items-center gap-2 mt-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-bold">{interpretation.stats.chokeCount} CHOKE{interpretation.stats.chokeCount > 1 ? 'S' : ''}</span>
            </div>
          )}
        </div>

        <PostBattleSummary data={postBattleSummary} isVictory={isVictory} />

        {/* Post-Battle Reaction (Grudge System) */}
        <PostBattleReaction battleId={params.id as string} />

        {/* Judge Scorecard */}
        <JudgeScorecard
          playerName={playerName}
          opponentName={opponentName}
          rounds={roundResults.map((r) => ({
            roundNum: r.number,
            playerScore: r.playerScore,
            opponentScore: r.opponentScore,
            playerWon: r.winner === "player",
          }))}
        />

        {/* Battle Views */}
        <BattleViewsDisplay
          views={postBattleSummary.viewData.total_views}
          tier={postBattleSummary.viewData.view_tier}
          trending={isVictory}
          shareCount={Math.floor(postBattleSummary.viewData.total_views * 0.15)}
        />

        {/* Battle Analysis - Using Real Interpretation */}
        <BattleAnalysis
          playerName={playerName}
          opponentName={opponentName}
          playerStrengths={interpretation.strengths}
          playerWeaknesses={interpretation.weaknesses}
          opponentStrengths={["Came prepared", "Competitive energy"]}
          opponentWeaknesses={[]}
          keyMoments={interpretation.keyMoments}
        />

        {/* Earnings Card */}
        <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-5">
          <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">BATTLE PAYOUT</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-zinc-800/50 p-3">
              <span className="text-zinc-500 text-xs block">Base Pay</span>
              <span className="text-zinc-200 font-mono text-lg">${earnings.basePay}</span>
            </div>
            <div className="bg-zinc-800/50 p-3">
              <span className="text-zinc-500 text-xs block">Win Bonus</span>
              <span className={`font-mono text-lg ${earnings.winBonus > 0 ? 'text-green-500' : 'text-zinc-500'}`}>
                ${earnings.winBonus}
              </span>
            </div>
            <div className="bg-zinc-800/50 p-3">
              <span className="text-zinc-500 text-xs block">Performance</span>
              <span className={`font-mono text-lg ${earnings.performanceBonus > 0 ? 'text-green-500' : 'text-zinc-500'}`}>
                ${earnings.performanceBonus}
              </span>
            </div>
            <div className="bg-orange-600/20 border border-orange-500/50 p-3">
              <span className="text-orange-400 text-xs block">TOTAL</span>
              <span className="text-orange-500 font-mono text-lg font-bold">
                ${earnings.basePay + earnings.winBonus + earnings.performanceBonus}
              </span>
            </div>
          </div>
        </div>

        {/* Round Selector */}
        <div className="flex gap-2 sm:gap-3">
          {roundResults.map((round) => (
            <button
              key={round.number}
              onClick={() => setSelectedRound(round.number)}
              className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 border-2 font-display font-bold text-xs sm:text-sm tracking-wide transition-colors ${
                selectedRound === round.number
                  ? "bg-orange-600 border-orange-600 text-white"
                  : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-600"
              }`}
            >
              <span className="hidden sm:inline">ROUND </span>R{round.number}
              <span className={`ml-1 sm:ml-2 ${round.winner === "player" ? "text-green-400" : "text-red-400"}`}>
                {round.winner === "player" ? "W" : "L"}
              </span>
            </button>
          ))}
        </div>

        {/* Round Stats with Crowd Phrases */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Player Stats */}
          <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-5">
            <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">
              {playerName}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Average Score:</span>
                <span className="text-zinc-100 font-mono font-bold">{currentRound.playerScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Peak Score:</span>
                <span className="text-green-500 font-mono">{currentRound.playerPeak.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Crowd Reaction:</span>
                <div className="text-right">
                  <span className="text-green-500 font-mono">{Math.round(currentRound.playerCrowd)}%</span>
                  <span className="text-xs text-zinc-500 ml-2">{getCrowdPhrase(currentRound.playerCrowd)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Opponent Stats */}
          <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-5">
            <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">
              {opponentName}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Average Score:</span>
                <span className="text-zinc-100 font-mono font-bold">{currentRound.opponentScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Peak Score:</span>
                <span className="text-zinc-100 font-mono">{currentRound.opponentPeak.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Crowd Reaction:</span>
                <div className="text-right">
                  <span className="text-zinc-100 font-mono">{Math.round(currentRound.opponentCrowd)}%</span>
                  <span className="text-xs text-zinc-500 ml-2">{getCrowdPhrase(currentRound.opponentCrowd)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Segment Timeline */}
        <div className="bg-zinc-900 border-2 border-zinc-700 p-4 sm:p-5">
          <h3 className="text-sm font-display font-bold text-zinc-100 tracking-wide mb-4">SEGMENT TIMELINE</h3>
          <div className="flex items-end gap-1 h-24 sm:h-32">
            {currentRoundSegments.length > 0 ? (
              currentRoundSegments.map((segment: any, i: number) => {
                const height = ((segment.segment_score || 5) / 10) * 100
                const isHaymaker = segment.segment_score >= 8.5
                const isChoke = segment.choked
                const bgColor = isHaymaker ? "bg-amber-500" : isChoke ? "bg-red-500" : "bg-blue-500"

                return (
                  <div
                    key={segment.id || i}
                    className={`flex-1 ${bgColor} transition-all hover:opacity-80 cursor-pointer`}
                    style={{ height: `${Math.max(height, 10)}%` }}
                    title={`Segment ${i + 1}: ${(segment.segment_score || 0).toFixed(1)}${isHaymaker ? ' - HAYMAKER!' : ''}${isChoke ? ' - CHOKE' : ''}`}
                  />
                )
              })
            ) : (
              // Fallback if no segments
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 transition-all"
                  style={{ height: `${60 + Math.random() * 30}%` }}
                />
              ))
            )}
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500" />
              <span className="text-zinc-400">Haymaker (8.5+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500" />
              <span className="text-zinc-400">Choke</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500" />
              <span className="text-zinc-400">Normal</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <Link
            href={`/battle/${params.id}/watch`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors"
          >
            <Play className="w-4 h-4" />
            WATCH REPLAY
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm font-display font-bold text-zinc-100 tracking-wide transition-colors text-center"
          >
            BACK TO DASHBOARD
          </Link>
          <Link
            href="/battle/offers"
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-sm font-display font-bold text-white tracking-wide transition-colors text-center"
          >
            VIEW NEW OFFERS
          </Link>
        </div>
      </main>
    </div>
  )
}
