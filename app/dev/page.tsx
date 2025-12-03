"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Clock,
  Zap,
  Trophy,
  Users,
  Database,
  MapPin,
  ImageIcon,
  Trash2,
  RefreshCw,
  UserCircle,
  Flame,
  Sliders,
  Bell,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import type { CityBackdrop, Badge } from "@/lib/types"
import { getCityKey } from "@/lib/types"

import { PlayerStateTab } from "@/components/dev/player-state-tab"
import { BattleSimTab } from "@/components/dev/battle-sim-tab"
import { AttributesTab } from "@/components/dev/attributes-tab"
import { DebugLog } from "@/components/dev/debug-log"
import { TimeControlTab } from "@/components/dev/time-control-tab"
import { EventsTab } from "@/components/dev/events-tab"

// Mock data
const INITIAL_BACKDROPS: CityBackdrop[] = [
  {
    cityKey: "new-york-ny",
    url: "/new-york-city-skyline-urban-hip-hop.jpg",
    generatedAt: "2025-01-01",
    battlerCount: 5,
  },
  {
    cityKey: "los-angeles-ca",
    url: "/los-angeles-city-skyline-urban-hip-hop.jpg",
    generatedAt: "2025-01-01",
    battlerCount: 3,
  },
  { cityKey: "chicago-il", url: "/chicago-city-skyline-urban-hip-hop.jpg", generatedAt: "2025-01-01", battlerCount: 2 },
  { cityKey: "atlanta-ga", url: "/atlanta-city-skyline-urban-hip-hop.jpg", generatedAt: "2025-01-01", battlerCount: 4 },
  { cityKey: "detroit-mi", url: "/detroit-city-skyline-urban-hip-hop.jpg", generatedAt: "2025-01-01", battlerCount: 2 },
]

const ALL_BADGES: Badge[] = [
  { id: 1, name: "PUNCHLINE KING", category: "Skill", rarity: "Gold", imageId: 1 },
  { id: 2, name: "STRESS MASTER", category: "Endurance", rarity: "Silver", imageId: null },
  { id: 3, name: "BATTLE CHAMPION", category: "Combat", rarity: "Bronze", imageId: 2 },
]

const MOCK_OPPONENTS = [
  { id: "1", name: "YOUNG PATTERN", rating: 1350, style: "Technical" },
  { id: "2", name: "SHOWTIME", rating: 1280, style: "Performance" },
  { id: "3", name: "VERBAL ASSASSIN", rating: 1450, style: "Aggressive" },
  { id: "4", name: "COLD CASE", rating: 1100, style: "Street" },
]

const MOCK_RIVALRIES = [
  { id: "1", opponent: "YOUNG PATTERN", intensity: 82, origin: "Controversial decision" },
  { id: "2", opponent: "SHOWTIME", intensity: 45, origin: "Social media beef" },
]

const SCENARIO_PRESETS = [
  { id: "fresh", name: "Fresh Start", desc: "New battler, 1000 rating, $500" },
  { id: "pre-tournament", name: "Pre-Tournament", desc: "1400 rating, tournament in 3 days" },
  { id: "mid-season", name: "Mid-Season", desc: "1250 rating, active rivalry" },
  { id: "championship", name: "Championship Week", desc: "1600 rating, finals matchup" },
  { id: "underdog", name: "Underdog Story", desc: "900 rating, vs 1500 opponent" },
  { id: "choke-recovery", name: "Choke Recovery", desc: "Coming off 2 losses, high stress" },
  { id: "rivalry-peak", name: "Rivalry Escalation", desc: "Max intensity beef, grudge match" },
]

type ActiveTab =
  | "player"
  | "time"
  | "events"
  | "battle"
  | "relationships"
  | "attributes"
  | "notifications"
  | "database"
  | "scenarios"
  | "cities"
  | "badges"

export default function DevToolsPage() {
  // Player State
  const [gameDate, setGameDate] = useState("2025-12-15")
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [stressLevel, setStressLevel] = useState(45)
  const [playerRating, setPlayerRating] = useState(1200)
  const [balance, setBalance] = useState(12450)
  const [xp, setXp] = useState(2450)
  const [authenticity, setAuthenticity] = useState(85)
  const [logs, setLogs] = useState<string[]>([])

  // Attributes
  const [attributes, setAttributes] = useState({
    lyricism: 6,
    wordplay: 7,
    creativity: 5,
    flow: 6,
    stagePresence: 5,
    crowdControl: 4,
    delivery: 6,
    resilience: 4,
  })

  // Battle sim
  const [selectedOpponent, setSelectedOpponent] = useState(MOCK_OPPONENTS[0].id)
  const [battleMargin, setBattleMargin] = useState<"close" | "clear" | "dominant">("clear")
  const [playerChoke, setPlayerChoke] = useState(false)
  const [opponentChoke, setOpponentChoke] = useState(false)

  // Relationships
  const [rivalries, setRivalries] = useState(MOCK_RIVALRIES)
  const [newBeefOpponent, setNewBeefOpponent] = useState("")

  // City backdrops
  const [cityBackdrops, setCityBackdrops] = useState<CityBackdrop[]>(INITIAL_BACKDROPS)
  const [selectedBackdrop, setSelectedBackdrop] = useState<CityBackdrop | null>(null)
  const [newBackdropUrl, setNewBackdropUrl] = useState("")
  const [newCityName, setNewCityName] = useState("")
  const [newCityState, setNewCityState] = useState("")

  // Database
  const [dbTable, setDbTable] = useState("battles")
  const [dbFilter, setDbFilter] = useState("")

  // Active tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("player")

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 49)])
  }

  const advanceTime = (days: number) => {
    const current = new Date(gameDate)
    current.setDate(current.getDate() + days)
    setGameDate(current.toISOString().split("T")[0])
    addLog(`Advanced time by ${days} day(s) to ${current.toLocaleDateString()}`)
  }

  const triggerEvent = (eventType: string) => {
    addLog(`Triggered event: ${eventType}`)
    switch (eventType) {
      case "battle_offer":
        addLog("  -> New battle offer generated from YOUNG PATTERN")
        break
      case "life_event":
        addLog("  -> Life event triggered: Family Emergency (-15 stress, -$500)")
        setStressLevel((prev) => Math.min(100, prev + 15))
        setBalance((prev) => prev - 500)
        break
      case "tournament_invite":
        addLog("  -> Tournament invitation: Champion's Circle Grand Prix")
        break
      case "media_scandal":
        addLog("  -> Media scandal triggered: Controversial interview surfaces")
        break
      case "badge_unlock":
        addLog("  -> Badge unlocked: PUNCHLINE KING (Gold)")
        break
      case "win_streak":
        addLog("  -> Win Streak event: 5 wins in a row bonus!")
        setBalance((prev) => prev + 2000)
        break
      case "family_crisis":
        addLog("  -> Family Crisis: -$1000, +25 stress")
        setBalance((prev) => prev - 1000)
        setStressLevel((prev) => Math.min(100, prev + 25))
        break
      case "financial_windfall":
        addLog("  -> Financial Windfall: +$5000")
        setBalance((prev) => prev + 5000)
        break
    }
  }

  const simulateBattle = (result: "win" | "loss" | "random") => {
    const actualResult = result === "random" ? (Math.random() > 0.5 ? "win" : "loss") : result
    const opponent = MOCK_OPPONENTS.find((o) => o.id === selectedOpponent)
    let ratingChange =
      actualResult === "win" ? Math.floor(Math.random() * 30) + 15 : -(Math.floor(Math.random() * 25) + 10)
    if (battleMargin === "dominant") ratingChange = Math.floor(ratingChange * 1.5)
    if (battleMargin === "close") ratingChange = Math.floor(ratingChange * 0.7)
    if (playerChoke) ratingChange -= 20
    if (opponentChoke && actualResult === "win") ratingChange += 10
    const earnings =
      actualResult === "win" ? Math.floor(Math.random() * 1000) + 500 : Math.floor(Math.random() * 300) + 100
    const xpGain = actualResult === "win" ? 150 : 50
    setPlayerRating((prev) => Math.max(0, prev + ratingChange))
    setBalance((prev) => prev + earnings)
    setStressLevel((prev) => Math.min(100, Math.max(0, prev + (actualResult === "win" ? -10 : 15))))
    setXp((prev) => prev + xpGain)
    addLog(`Simulated battle vs ${opponent?.name}: ${actualResult.toUpperCase()}`)
    addLog(
      `  -> Margin: ${battleMargin}${playerChoke ? " (PLAYER CHOKED)" : ""}${opponentChoke ? " (OPPONENT CHOKED)" : ""}`,
    )
    addLog(`  -> Rating: ${ratingChange > 0 ? "+" : ""}${ratingChange} (now ${playerRating + ratingChange})`)
    addLog(`  -> Earnings: +$${earnings}, XP: +${xpGain}`)
  }

  const createBeef = () => {
    if (!newBeefOpponent) return
    setRivalries((prev) => [
      ...prev,
      { id: String(Date.now()), opponent: newBeefOpponent.toUpperCase(), intensity: 25, origin: "Dev tools created" },
    ])
    addLog(`Created new beef with ${newBeefOpponent.toUpperCase()}`)
    setNewBeefOpponent("")
  }

  const escalateBeef = (id: string) => {
    setRivalries((prev) => prev.map((r) => (r.id === id ? { ...r, intensity: Math.min(100, r.intensity + 15) } : r)))
    addLog(`Escalated rivalry intensity +15`)
  }

  const squashBeef = (id: string) => {
    setRivalries((prev) => prev.filter((r) => r.id !== id))
    addLog(`Squashed beef`)
  }

  const applyScenario = (scenarioId: string) => {
    switch (scenarioId) {
      case "fresh":
        setPlayerRating(1000)
        setBalance(500)
        setStressLevel(20)
        setXp(0)
        break
      case "pre-tournament":
        setPlayerRating(1400)
        setBalance(8000)
        setStressLevel(40)
        advanceTime(-3)
        break
      case "mid-season":
        setPlayerRating(1250)
        setBalance(5000)
        setStressLevel(35)
        break
      case "championship":
        setPlayerRating(1600)
        setBalance(25000)
        setStressLevel(60)
        break
      case "underdog":
        setPlayerRating(900)
        setBalance(2000)
        setStressLevel(50)
        break
      case "choke-recovery":
        setPlayerRating(1100)
        setBalance(3000)
        setStressLevel(75)
        break
      case "rivalry-peak":
        setPlayerRating(1350)
        setBalance(10000)
        setStressLevel(55)
        setRivalries([{ id: "1", opponent: "YOUNG PATTERN", intensity: 100, origin: "Escalated beef" }])
        break
    }
    addLog(`Applied scenario: ${scenarioId}`)
  }

  const sendNotification = (type: string) => addLog(`Sent test notification: ${type}`)

  const resetPlayer = () => {
    setPlayerRating(1200)
    setBalance(1000)
    setStressLevel(30)
    setXp(0)
    setAuthenticity(85)
    setGameDate("2025-12-01")
    setRivalries([])
    setAttributes({
      lyricism: 5,
      wordplay: 5,
      creativity: 5,
      flow: 5,
      stagePresence: 5,
      crowdControl: 5,
      delivery: 5,
      resilience: 5,
    })
    addLog("Full player state reset")
  }

  // City backdrop handlers
  const updateBackdropUrl = (cityKey: string, newUrl: string) => {
    setCityBackdrops((prev) =>
      prev.map((b) => (b.cityKey === cityKey ? { ...b, url: newUrl, generatedAt: new Date().toISOString() } : b)),
    )
    addLog(`Updated backdrop for ${cityKey}`)
    setSelectedBackdrop(null)
    setNewBackdropUrl("")
  }

  const addNewBackdrop = () => {
    if (!newCityName || !newCityState) return
    const cityKey = getCityKey(newCityName, newCityState)
    if (cityBackdrops.find((b) => b.cityKey === cityKey)) {
      addLog(`Backdrop for ${cityKey} already exists!`)
      return
    }
    const url =
      newBackdropUrl ||
      `/placeholder.svg?height=360&width=840&query=${encodeURIComponent(`${newCityName} ${newCityState} city skyline urban hip hop`)}`
    setCityBackdrops((prev) => [...prev, { cityKey, url, generatedAt: new Date().toISOString(), battlerCount: 0 }])
    addLog(`Added new backdrop for ${newCityName}, ${newCityState}`)
    setNewCityName("")
    setNewCityState("")
    setNewBackdropUrl("")
  }

  const deleteBackdrop = (cityKey: string) => {
    setCityBackdrops((prev) => prev.filter((b) => b.cityKey !== cityKey))
    addLog(`Deleted backdrop for ${cityKey}`)
  }

  const regenerateBackdrop = (cityKey: string) => {
    const [cityParts, state] = cityKey
      .split("-")
      .reduce<[string[], string]>(
        (acc, part, i, arr) => (i === arr.length - 1 ? [acc[0], part.toUpperCase()] : [[...acc[0], part], acc[1]]),
        [[], ""],
      )
    const cityName = cityParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")
    const newUrl = `/placeholder.svg?height=360&width=840&query=${encodeURIComponent(`${cityName} ${state} city skyline urban hip hop culture night`)}&t=${Date.now()}`
    updateBackdropUrl(cityKey, newUrl)
  }

  const tabs = [
    { id: "player", label: "Player", icon: Users },
    { id: "attributes", label: "Attributes", icon: Sliders },
    { id: "time", label: "Time", icon: Clock },
    { id: "events", label: "Events", icon: Zap },
    { id: "battle", label: "Battle Sim", icon: Trophy },
    { id: "relationships", label: "Relationships", icon: Flame },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "scenarios", label: "Scenarios", icon: Sparkles },
    { id: "database", label: "Database", icon: Database },
    { id: "cities", label: "Cities", icon: MapPin },
    { id: "badges", label: "Badges", icon: Trophy },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b-2 border-red-900/50 bg-red-950/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h1 className="text-lg font-display font-bold text-red-400">DEV TOOLS</h1>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 border border-red-500/50">
                  DO NOT USE IN PRODUCTION
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dev/battlers"
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                Battlers
              </Link>
              <Link
                href="/dev/leagues"
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm transition-colors"
              >
                <Trophy className="w-4 h-4" />
                Leagues
              </Link>
              <Link
                href="/dev/bloggers"
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm transition-colors"
              >
                <Users className="w-4 h-4" />
                Bloggers
              </Link>
              <Link
                href="/dev/venues"
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Venues
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-6 bg-zinc-900 p-2 border border-zinc-800">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as ActiveTab)}
              className={`px-3 py-1.5 flex items-center gap-1.5 font-display text-xs border ${activeTab === id ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-orange-500"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {activeTab === "player" && (
              <PlayerStateTab
                playerRating={playerRating}
                setPlayerRating={setPlayerRating}
                balance={balance}
                setBalance={setBalance}
                xp={xp}
                setXp={setXp}
                authenticity={authenticity}
                setAuthenticity={setAuthenticity}
                stressLevel={stressLevel}
                setStressLevel={setStressLevel}
                onReset={resetPlayer}
                addLog={addLog}
              />
            )}

            {activeTab === "attributes" && <AttributesTab attributes={attributes} setAttributes={setAttributes} />}

            {activeTab === "time" && (
              <TimeControlTab
                gameDate={gameDate}
                setGameDate={setGameDate}
                simulationSpeed={simulationSpeed}
                setSimulationSpeed={setSimulationSpeed}
                onAdvanceTime={advanceTime}
              />
            )}

            {activeTab === "events" && <EventsTab onTriggerEvent={triggerEvent} />}

            {activeTab === "battle" && (
              <BattleSimTab
                opponents={MOCK_OPPONENTS}
                selectedOpponent={selectedOpponent}
                setSelectedOpponent={setSelectedOpponent}
                battleMargin={battleMargin}
                setBattleMargin={setBattleMargin}
                playerChoke={playerChoke}
                setPlayerChoke={setPlayerChoke}
                opponentChoke={opponentChoke}
                setOpponentChoke={setOpponentChoke}
                onSimulate={simulateBattle}
              />
            )}

            {activeTab === "relationships" && (
              <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
                <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
                  <Flame className="w-4 h-4" /> RELATIONSHIP CONTROLS
                </h2>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newBeefOpponent}
                    onChange={(e) => setNewBeefOpponent(e.target.value)}
                    placeholder="Opponent name..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100"
                  />
                  <button
                    onClick={createBeef}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 font-display text-sm"
                  >
                    START BEEF
                  </button>
                </div>
                <div className="space-y-2">
                  {rivalries.length === 0 ? (
                    <p className="text-zinc-500 text-sm">No active rivalries</p>
                  ) : (
                    rivalries.map((rivalry) => (
                      <div
                        key={rivalry.id}
                        className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700"
                      >
                        <div>
                          <div className="font-display text-zinc-100">{rivalry.opponent}</div>
                          <div className="text-xs text-zinc-500">{rivalry.origin}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs text-zinc-500">Intensity</div>
                            <div
                              className={`font-mono ${rivalry.intensity > 70 ? "text-red-500" : rivalry.intensity > 40 ? "text-yellow-500" : "text-green-500"}`}
                            >
                              {rivalry.intensity}/100
                            </div>
                          </div>
                          <button
                            onClick={() => escalateBeef(rivalry.id)}
                            className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-xs"
                          >
                            +15
                          </button>
                          <button
                            onClick={() => squashBeef(rivalry.id)}
                            className="px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs"
                          >
                            Squash
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
                <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4" /> NOTIFICATION TRIGGERS
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "offer", label: "Battle Offer" },
                    { id: "result", label: "Battle Result" },
                    { id: "life_event", label: "Life Event" },
                    { id: "badge", label: "Badge Unlock" },
                    { id: "tournament", label: "Tournament" },
                    { id: "article", label: "New Article" },
                    { id: "rivalry", label: "Rivalry Update" },
                    { id: "level_up", label: "Level Up" },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => sendNotification(id)}
                      className="py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-orange-500 text-sm"
                    >
                      Send: {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "scenarios" && (
              <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
                <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> SCENARIO PRESETS
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SCENARIO_PRESETS.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => applyScenario(scenario.id)}
                      className="p-3 bg-zinc-800 border border-zinc-700 text-left hover:border-orange-500"
                    >
                      <div className="font-display text-zinc-100">{scenario.name}</div>
                      <div className="text-xs text-zinc-500">{scenario.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
                <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4" /> DATABASE INSPECTOR
                </h2>
                <div className="flex gap-2 mb-4">
                  <select
                    value={dbTable}
                    onChange={(e) => setDbTable(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100"
                  >
                    <option value="battles">battles</option>
                    <option value="battlers">battlers</option>
                    <option value="rivalries">rivalries</option>
                    <option value="tournaments">tournaments</option>
                    <option value="articles">articles</option>
                    <option value="badges">badges</option>
                  </select>
                  <input
                    type="text"
                    value={dbFilter}
                    onChange={(e) => setDbFilter(e.target.value)}
                    placeholder="Filter (e.g. status=accepted)"
                    className="flex-1 bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100"
                  />
                  <button className="px-4 py-2 bg-orange-500 text-white font-display text-sm">QUERY</button>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-3 overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="text-zinc-500 border-b border-zinc-800">
                        <th className="text-left p-2">id</th>
                        <th className="text-left p-2">battler_a</th>
                        <th className="text-left p-2">battler_b</th>
                        <th className="text-left p-2">status</th>
                        <th className="text-left p-2">date</th>
                      </tr>
                    </thead>
                    <tbody className="text-zinc-300">
                      <tr className="border-b border-zinc-800/50">
                        <td className="p-2">abc-123...</td>
                        <td className="p-2">WORDSMITH</td>
                        <td className="p-2">SHOWTIME</td>
                        <td className="p-2 text-green-500">accepted</td>
                        <td className="p-2">1/15</td>
                      </tr>
                      <tr className="border-b border-zinc-800/50">
                        <td className="p-2">def-456...</td>
                        <td className="p-2">WORDSMITH</td>
                        <td className="p-2">YOUNG PATTERN</td>
                        <td className="p-2 text-yellow-500">pending</td>
                        <td className="p-2">1/20</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "cities" && (
              <div className="space-y-4">
                <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
                  <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> ADD NEW CITY BACKDROP
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value)}
                      placeholder="City Name"
                      className="bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100"
                    />
                    <input
                      type="text"
                      value={newCityState}
                      onChange={(e) => setNewCityState(e.target.value.toUpperCase().slice(0, 2))}
                      placeholder="ST"
                      maxLength={2}
                      className="bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100 uppercase"
                    />
                    <input
                      type="text"
                      value={newBackdropUrl}
                      onChange={(e) => setNewBackdropUrl(e.target.value)}
                      placeholder="Image URL (optional)"
                      className="bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100"
                    />
                    <button
                      onClick={addNewBackdrop}
                      disabled={!newCityName || !newCityState}
                      className="py-2 bg-orange-500 text-white font-display uppercase disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
                  <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4">
                    CITY BACKDROPS ({cityBackdrops.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cityBackdrops.map((backdrop) => (
                      <div
                        key={backdrop.cityKey}
                        className={`border-2 ${selectedBackdrop?.cityKey === backdrop.cityKey ? "border-orange-500" : "border-zinc-700"} overflow-hidden`}
                      >
                        <div
                          className="relative cursor-pointer"
                          style={{ aspectRatio: "21/9" }}
                          onClick={() =>
                            setSelectedBackdrop(selectedBackdrop?.cityKey === backdrop.cityKey ? null : backdrop)
                          }
                        >
                          <Image
                            src={backdrop.url || "/placeholder.svg"}
                            alt={backdrop.cityKey}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                          <div className="absolute bottom-2 left-2 text-sm font-display text-zinc-100">
                            {backdrop.cityKey
                              .split("-")
                              .slice(0, -1)
                              .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                              .join(" ")}
                            , {backdrop.cityKey.split("-").pop()?.toUpperCase()}
                          </div>
                        </div>
                        <div className="p-2 bg-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                          <span>{backdrop.battlerCount} battler(s)</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => regenerateBackdrop(backdrop.cityKey)}
                              className="p-1 hover:text-orange-500"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                            <button onClick={() => deleteBackdrop(backdrop.cityKey)} className="p-1 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "badges" && (
              <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
                <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> BADGE IMAGE ASSIGNMENT
                </h2>
                <p className="text-xs text-zinc-400 mb-4">
                  Assign sprite images to badges. Images: /public/sprites/badges/
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {ALL_BADGES.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <div className="text-sm font-bold text-zinc-100">{badge.name}</div>
                          <div className="text-xs text-zinc-500">
                            {badge.category} - {badge.rarity}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {badge.imageId ? (
                          <>
                            <Image
                              src={`/sprites/badges/badge_${String(badge.imageId).padStart(3, "0")}.png`}
                              alt={badge.name}
                              width={32}
                              height={32}
                              className="pixelated"
                            />
                            <span className="text-xs text-green-500 font-mono">
                              badge_{String(badge.imageId).padStart(3, "0")}.png
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-zinc-500">No image</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Debug Log Sidebar */}
          <div className="lg:col-span-1">
            <DebugLog logs={logs} onClear={() => setLogs([])} />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 bg-zinc-900 border-2 border-zinc-700 p-4">
          <h2 className="text-sm font-display font-bold text-orange-500 tracking-wide mb-4">QUICK LINKS</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/onboarding", label: "Onboarding" },
              { href: "/dashboard", label: "Dashboard" },
              { href: "/battle/offers", label: "Battle Offers" },
              { href: "/battle/1/prep", label: "Battle Prep" },
              { href: "/battle/1/watch", label: "Live Battle" },
              { href: "/battle/1", label: "Battle Results" },
              { href: "/finances", label: "Finances" },
              { href: "/tournaments", label: "Tournaments" },
              { href: "/life-events", label: "Life Events" },
              { href: "/badges", label: "Badges" },
              { href: "/leagues", label: "Leagues" },
              { href: "/regions", label: "Regions" },
              { href: "/venues", label: "Venues" },
              { href: "/guide", label: "Guide" },
              { href: "/dev/battlers", label: "Battler Editor" },
              { href: "/dev/venues", label: "Venue Editor" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-orange-500 text-sm"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
