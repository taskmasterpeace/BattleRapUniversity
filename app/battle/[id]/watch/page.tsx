"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Flame, Trophy, Volume2, VolumeX, Play, Pause, SkipForward, RotateCcw, Loader2 } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const cityBackgrounds: Record<string, { day: string; dusk: string; night: string }> = {
  "new-york": {
    day: "/new-york-city-battle-rap-venue-daytime.jpg",
    dusk: "/new-york-city-battle-rap-venue-sunset-dusk.jpg",
    night: "/new-york-city-battle-rap-venue-night-purple-lighti.jpg",
  },
  toronto: {
    day: "/toronto-battle-rap-venue-daytime.jpg",
    dusk: "/toronto-battle-rap-venue-sunset.jpg",
    night: "/toronto-battle-rap-venue-night.jpg",
  },
  atlanta: {
    day: "/atlanta-battle-rap-venue-daytime.jpg",
    dusk: "/atlanta-battle-rap-venue-sunset.jpg",
    night: "/atlanta-battle-rap-venue-night.jpg",
  },
  default: {
    day: "/battle-rap-venue-stage-daytime.jpg",
    dusk: "/battle-rap-venue-stage-sunset.jpg",
    night: "/battle-rap-venue-stage-night-dark.jpg",
  },
}

function getTimeVariant(scheduledAt: string): "day" | "dusk" | "night" {
  const hour = new Date(scheduledAt).getHours()
  if (hour >= 6 && hour < 17) return "day"
  if (hour >= 17 && hour < 20) return "dusk"
  return "night"
}

function getCrowdReaction(score: number, eventFlags: string[]): CrowdReaction {
  if (eventFlags.includes("haymaker")) return "stunned"
  if (eventFlags.includes("choke")) return "cringe"
  if (score >= 90) return "hype"
  if (score >= 75) return "cheer"
  if (score >= 60) return "watch"
  if (score >= 40) return "think"
  if (score >= 20) return "unimpressed"
  return "boo"
}

type CrowdReaction = "watch" | "hype" | "cheer" | "laugh" | "boo" | "cringe" | "stunned" | "think" | "unimpressed"
type BattlePhase = "loading" | "intro" | "round_title" | "battle" | "round_end" | "winner"

const crowdReactionColors: Record<CrowdReaction, string> = {
  watch: "text-zinc-400",
  think: "text-zinc-300",
  hype: "text-orange-500",
  cheer: "text-green-500",
  laugh: "text-yellow-500",
  boo: "text-red-500",
  cringe: "text-red-400",
  stunned: "text-purple-500",
  unimpressed: "text-zinc-500",
}

const crowdReactionLabels: Record<CrowdReaction, string> = {
  watch: "WATCHING...",
  think: "CROWD THINKING...",
  hype: "CROWD GOES WILD!",
  cheer: "CROWD CHEERS!",
  laugh: "CROWD LAUGHING!",
  boo: "CROWD BOOS!",
  cringe: "CROWD CRINGES!",
  stunned: "CROWD STUNNED!",
  unimpressed: "NOT IMPRESSED...",
}

const crowdOverlays: Record<string, Record<CrowdReaction, string>> = {
  left: {
    hype: "/crowd-cheering-hype-silhouette-left-side.jpg",
    cheer: "/crowd-cheering-silhouette-left.jpg",
    watch: "/placeholder.svg?height=400&width=300",
    think: "/placeholder.svg?height=400&width=300",
    laugh: "/placeholder.svg?height=400&width=300",
    boo: "/placeholder.svg?height=400&width=300",
    cringe: "/placeholder.svg?height=400&width=300",
    stunned: "/placeholder.svg?height=400&width=300",
    unimpressed: "/placeholder.svg?height=400&width=300",
  },
  right: {
    hype: "/placeholder.svg?height=400&width=300",
    cheer: "/placeholder.svg?height=400&width=300",
    watch: "/placeholder.svg?height=400&width=300",
    think: "/placeholder.svg?height=400&width=300",
    laugh: "/placeholder.svg?height=400&width=300",
    boo: "/placeholder.svg?height=400&width=300",
    cringe: "/placeholder.svg?height=400&width=300",
    stunned: "/placeholder.svg?height=400&width=300",
    unimpressed: "/placeholder.svg?height=400&width=300",
  },
}

export default function LiveBattleViewerPage() {
  const params = useParams()
  const router = useRouter()
  const battleId = params.id as string

  const { data, error, isLoading } = useSWR(`/api/battles/${battleId}`, fetcher)

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [battlePhase, setBattlePhase] = useState<BattlePhase>("intro")
  const [isMuted, setIsMuted] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  // Score tracking
  const [roundsWon, setRoundsWon] = useState({ player: 0, opponent: 0 })
  const [currentCrowdReaction, setCurrentCrowdReaction] = useState<CrowdReaction>("watch")

  const [showHaymakerFlash, setShowHaymakerFlash] = useState(false)
  const [showChokeOverlay, setShowChokeOverlay] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Get derived data from API response
  const battle = data?.battle
  const allRounds = data?.rounds || []
  const allSegments = data?.segments || []

  // Get current round segments
  const currentRoundSegments = allSegments.filter((s: { round_index: number }) => s.round_index === currentRound)
  const currentSegment = currentRoundSegments[currentSegmentIndex]

  // Get round data for current round
  const playerRoundData = allRounds.find(
    (r: { round_index: number; battler_id: string }) =>
      r.round_index === currentRound && r.battler_id === battle?.player_battler?.id,
  )
  const opponentRoundData = allRounds.find(
    (r: { round_index: number; battler_id: string }) =>
      r.round_index === currentRound && r.battler_id === battle?.ai_battler?.id,
  )

  // Determine round winner
  const getRoundWinner = (roundIndex: number) => {
    const playerData = allRounds.find(
      (r: { round_index: number; battler_id: string }) =>
        r.round_index === roundIndex && r.battler_id === battle?.player_battler?.id,
    )
    const opponentData = allRounds.find(
      (r: { round_index: number; battler_id: string }) =>
        r.round_index === roundIndex && r.battler_id === battle?.ai_battler?.id,
    )
    if (!playerData || !opponentData) return null
    return playerData.average_score > opponentData.average_score ? "player" : "opponent"
  }

  // Get venue background
  const getVenueBackground = () => {
    if (!battle) return cityBackgrounds.default.night
    const cityId = battle.league?.city_id || "default"
    const city = cityBackgrounds[cityId] || cityBackgrounds.default
    const timeVariant = getTimeVariant(battle.scheduled_at)
    return city[timeVariant]
  }

  const triggerHaymakerEffect = useCallback(() => {
    setShowHaymakerFlash(true)
    setTimeout(() => setShowHaymakerFlash(false), 500)
  }, [])

  const triggerChokeEffect = useCallback(() => {
    setShowChokeOverlay(true)
    setTimeout(() => setShowChokeOverlay(false), 1000)
  }, [])

  // Advance to next segment/round
  const advancePlayback = useCallback(() => {
    if (!battle) return

    if (battlePhase === "intro") {
      setBattlePhase("round_title")
      return
    }

    if (battlePhase === "round_title") {
      setBattlePhase("battle")
      return
    }

    if (battlePhase === "battle") {
      if (currentSegmentIndex < currentRoundSegments.length - 1) {
        // Next segment
        const nextIndex = currentSegmentIndex + 1
        setCurrentSegmentIndex(nextIndex)
        const nextSegment = currentRoundSegments[nextIndex]

        // Update crowd reaction
        const crowdScore = nextSegment.segment_score * 10
        const reaction = getCrowdReaction(crowdScore, nextSegment.event_flags || [])
        setCurrentCrowdReaction(reaction)

        // Trigger special effects
        if (nextSegment.event_flags?.includes("haymaker")) {
          triggerHaymakerEffect()
        }
        if (nextSegment.event_flags?.includes("choke")) {
          triggerChokeEffect()
        }
      } else {
        // End of round
        setBattlePhase("round_end")
        const winner = getRoundWinner(currentRound)
        if (winner) {
          setRoundsWon((prev) => ({
            player: prev.player + (winner === "player" ? 1 : 0),
            opponent: prev.opponent + (winner === "opponent" ? 1 : 0),
          }))
        }
      }
      return
    }

    if (battlePhase === "round_end") {
      if (currentRound < 3) {
        // Next round
        setCurrentRound((prev) => prev + 1)
        setCurrentSegmentIndex(0)
        setBattlePhase("round_title")
        setCurrentCrowdReaction("watch")
      } else {
        // Battle over
        setBattlePhase("winner")
        setIsPlaying(false)
        setShowConfetti(true)
      }
    }
  }, [
    battlePhase,
    currentRound,
    currentSegmentIndex,
    currentRoundSegments,
    battle,
    triggerHaymakerEffect,
    triggerChokeEffect,
  ])

  const skipToResults = () => {
    router.push(`/battle/${battleId}`)
  }

  const replayBattle = () => {
    setCurrentRound(1)
    setCurrentSegmentIndex(0)
    setBattlePhase("intro")
    setRoundsWon({ player: 0, opponent: 0 })
    setCurrentCrowdReaction("watch")
    setShowConfetti(false)
    setIsPlaying(false)
  }

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying || !battle) return

    const baseInterval = battlePhase === "round_title" ? 1500 : 2000
    const interval = setInterval(() => {
      advancePlayback()
    }, baseInterval / playbackSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, advancePlayback, playbackSpeed, battlePhase, battle])

  // Calculate segment progress for the timeline bar
  const totalSegments = allSegments.length
  const completedSegments =
    allSegments.filter((s: { round_index: number }) => s.round_index < currentRound).length +
    (battlePhase === "battle" || battlePhase === "round_end" ? currentSegmentIndex + 1 : 0)

  // Determine winner
  const isPlayerWinner = battle?.winner_battler_id === battle?.player_battler?.id

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 font-display">LOADING BATTLE...</p>
        </div>
      </div>
    )
  }

  if (error || !battle) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-display text-xl mb-4">FAILED TO LOAD BATTLE</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 font-display hover:bg-zinc-700"
          >
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {showHaymakerFlash && <div className="fixed inset-0 z-50 bg-yellow-500/30 pointer-events-none animate-pulse" />}

      {showChokeOverlay && <div className="fixed inset-0 z-50 bg-red-900/40 pointer-events-none" />}

      {showConfetti && (
        <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                backgroundColor: ["#f97316", "#22c55e", "#eab308", "#3b82f6"][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Venue Background with Overlay */}
      <div className="relative flex-1 flex flex-col">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={getVenueBackground() || "/placeholder.svg"}
            alt="Venue"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        {battlePhase === "battle" && (
          <>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 z-10 opacity-60">
              <Image
                src={crowdOverlays.left[currentCrowdReaction] || "/placeholder.svg"}
                alt="Crowd"
                fill
                className="object-contain object-bottom"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-1/3 h-1/2 z-10 opacity-60">
              <Image
                src={crowdOverlays.right[currentCrowdReaction] || "/placeholder.svg"}
                alt="Crowd"
                fill
                className="object-contain object-bottom"
              />
            </div>
          </>
        )}

        {/* Top Bar - League & Round Info */}
        <div className="relative z-20 flex items-center justify-between p-4 border-b border-zinc-800/50 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Image
                src={battle.league?.logo_url || "/placeholder.svg"}
                alt={battle.league?.name || "League"}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-display font-bold text-zinc-100 tracking-wide">
                {battle.league?.name}
              </h1>
              {battle.is_grudge_match && (
                <div className="flex items-center gap-1 text-xs">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-orange-500 font-bold">GRUDGE MATCH</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg sm:text-2xl font-mono font-bold text-zinc-100">
              ROUND {currentRound} <span className="text-zinc-500">OF 3</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-zinc-800/80 border border-zinc-700 hover:bg-zinc-700 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-100" />
              )}
            </button>
          </div>
        </div>

        {/* Main Battle View */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
          {battlePhase === "round_title" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
              <div className="text-center animate-pulse">
                <h2 className="text-5xl sm:text-7xl font-display font-black text-orange-500 tracking-wider">
                  ROUND {currentRound}
                </h2>
              </div>
            </div>
          )}

          {/* Battler Portraits & Score */}
          <div className="w-full max-w-4xl flex items-center justify-between mb-6 sm:mb-8">
            {/* Player Side */}
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 border-4 overflow-hidden transition-all ${
                  currentSegment?.battler_id === battle.player_battler?.id
                    ? "border-orange-500 scale-105 sm:scale-110 shadow-lg shadow-orange-500/30"
                    : "border-zinc-700"
                }`}
              >
                <Image
                  src={battle.player_battler?.avatar_url || "/placeholder.svg"}
                  alt={battle.player_battler?.stage_name || "Player"}
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              </div>
              <h2 className="mt-2 sm:mt-3 text-base sm:text-xl font-display font-bold text-zinc-100">
                {battle.player_battler?.stage_name}
              </h2>
              <span className="text-xs sm:text-sm text-zinc-400">{battle.player_battler?.tier}</span>
            </div>

            {/* Center Score Display */}
            <div className="text-center px-2">
              {battlePhase === "intro" ? (
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-100">VS</div>
                  <div className="text-xs sm:text-sm text-zinc-400">Press Play to Start</div>
                </div>
              ) : battlePhase === "winner" ? (
                <div className="space-y-3">
                  <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-yellow-500" />
                  <div className="text-2xl sm:text-3xl font-display font-bold text-green-500">
                    {isPlayerWinner ? "VICTORY!" : "DEFEAT"}
                  </div>
                  <div className="text-4xl sm:text-5xl font-mono font-bold">
                    <span className={isPlayerWinner ? "text-green-500" : "text-zinc-400"}>{roundsWon.player}</span>
                    <span className="text-zinc-600 mx-2 sm:mx-4">-</span>
                    <span className={!isPlayerWinner ? "text-green-500" : "text-zinc-400"}>{roundsWon.opponent}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl sm:text-6xl font-mono font-bold">
                    <span className={roundsWon.player > roundsWon.opponent ? "text-green-500" : "text-zinc-100"}>
                      {roundsWon.player}
                    </span>
                    <span className="text-zinc-600 mx-2 sm:mx-4">-</span>
                    <span className={roundsWon.opponent > roundsWon.player ? "text-green-500" : "text-zinc-100"}>
                      {roundsWon.opponent}
                    </span>
                  </div>
                  {battlePhase === "round_end" && (
                    <div className="text-sm sm:text-lg font-display font-bold text-orange-500">
                      ROUND {currentRound} - {getRoundWinner(currentRound) === "player" ? "YOU WIN!" : "OPPONENT WINS"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Opponent Side */}
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 border-4 overflow-hidden transition-all ${
                  currentSegment?.battler_id === battle.ai_battler?.id
                    ? "border-red-500 scale-105 sm:scale-110 shadow-lg shadow-red-500/30"
                    : "border-zinc-700"
                }`}
              >
                <Image
                  src={battle.ai_battler?.avatar_url || "/placeholder.svg"}
                  alt={battle.ai_battler?.stage_name || "Opponent"}
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              </div>
              <h2 className="mt-2 sm:mt-3 text-base sm:text-xl font-display font-bold text-zinc-100">
                {battle.ai_battler?.stage_name}
              </h2>
              <span className="text-xs sm:text-sm text-zinc-400">{battle.ai_battler?.tier}</span>
            </div>
          </div>

          {/* Crowd Reaction */}
          {battlePhase === "battle" && (
            <div
              className={`text-center mb-4 sm:mb-6 transition-all ${crowdReactionColors[currentCrowdReaction]} animate-pulse`}
            >
              <div className="text-lg sm:text-2xl font-display font-bold tracking-wider">
                {crowdReactionLabels[currentCrowdReaction]}
              </div>
            </div>
          )}

          {/* Current Segment Score */}
          {battlePhase === "battle" && currentSegment && (
            <div className="bg-zinc-900/90 border-2 border-zinc-700 p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-4 sm:gap-8">
                <div className="text-center">
                  <div className="text-xs text-zinc-400 mb-1">
                    {currentSegment.battler_id === battle.player_battler?.id
                      ? battle.player_battler?.stage_name
                      : battle.ai_battler?.stage_name}
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-mono font-bold ${
                      currentSegment.event_flags?.includes("haymaker")
                        ? "text-yellow-500"
                        : currentSegment.event_flags?.includes("choke")
                          ? "text-red-500"
                          : "text-zinc-100"
                    }`}
                  >
                    {currentSegment.segment_score?.toFixed(1)}
                  </div>
                  {currentSegment.event_flags?.includes("haymaker") && (
                    <div className="text-xs font-bold mt-1 text-yellow-500 animate-pulse">HAYMAKER!</div>
                  )}
                  {currentSegment.event_flags?.includes("choke") && (
                    <div className="text-xs font-bold mt-1 text-red-500 animate-pulse">CHOKE!</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Segment Timeline */}
          {battlePhase !== "intro" && battlePhase !== "winner" && battlePhase !== "round_title" && (
            <div className="w-full max-w-2xl px-2">
              <div className="flex gap-1 mb-2">
                {currentRoundSegments.map(
                  (seg: { segment_index: number; battler_id: string; event_flags?: string[] }, i: number) => {
                    const isActive = i === currentSegmentIndex && battlePhase === "battle"
                    const isCompleted = i < currentSegmentIndex || battlePhase === "round_end"
                    const isPlayer = seg.battler_id === battle.player_battler?.id

                    let bgColor = "bg-zinc-700"
                    if (isCompleted || isActive) {
                      if (seg.event_flags?.includes("haymaker")) bgColor = "bg-yellow-500"
                      else if (seg.event_flags?.includes("choke")) bgColor = "bg-red-500"
                      else bgColor = isPlayer ? "bg-green-500" : "bg-blue-500"
                    }

                    return (
                      <div
                        key={seg.segment_index}
                        className={`flex-1 h-2 sm:h-3 transition-all ${bgColor} ${isActive ? "ring-2 ring-white" : ""}`}
                      />
                    )
                  },
                )}
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>
                  Segment {currentSegmentIndex + 1} / {currentRoundSegments.length}
                </span>
                <div className="flex gap-2 sm:gap-3">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500" /> Haymaker
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500" /> Choke
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="relative z-20 bg-zinc-900/95 border-t border-zinc-800 p-3 sm:p-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            {/* Progress Bar */}
            <div className="flex-1">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${(completedSegments / totalSegments) * 100}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {battlePhase !== "winner" && (
                <button
                  onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 3 : 1)}
                  className="px-2 sm:px-3 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-xs sm:text-sm font-mono text-zinc-300 transition-colors"
                >
                  {playbackSpeed}x
                </button>
              )}

              {battlePhase === "winner" ? (
                <>
                  <button
                    onClick={replayBattle}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 font-display font-bold tracking-wide transition-colors hover:bg-zinc-700 flex items-center gap-2 text-sm sm:text-base"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" /> REPLAY
                  </button>
                  <button
                    onClick={() => router.push(`/battle/${battleId}`)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold tracking-wide transition-colors text-sm sm:text-base"
                  >
                    VIEW RESULTS
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold tracking-wide transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> PAUSE
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 sm:w-5 sm:h-5" /> {battlePhase === "intro" ? "START" : "PLAY"}
                      </>
                    )}
                  </button>

                  <button
                    onClick={skipToResults}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center gap-2 text-zinc-300 text-sm sm:text-base"
                    title="Skip to Results"
                  >
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">SKIP</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
