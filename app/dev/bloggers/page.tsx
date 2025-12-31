"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft, Save, Upload, Trash2, Search, Sliders, Plus, X,
  Users, FileText, ThumbsUp, ThumbsDown, Flame, Meh, Scale,
  Palette, Hash, Building2, Mic2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { BLOGGERS, type Blogger } from "@/lib/bloggers"
import { getLeagues, type League, getTierInfo } from "@/lib/leagues"

// Emoji options for blogger icons
const EMOJI_OPTIONS = ["👁️", "🔥", "📊", "🎤", "👑", "✊", "🌎", "🧠", "📝", "🎬", "💯", "🏆", "⚡", "💎", "🎯"]

// Color options (tailwind colors)
const COLOR_OPTIONS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Red", value: "#EF4444" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Purple", value: "#A855F7" },
  { name: "Green", value: "#22C55E" },
  { name: "Pink", value: "#EC4899" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Teal", value: "#14B8A6" },
]

// Get unique regions from leagues - will be populated dynamically
const DEFAULT_REGIONS = ["National", "East Coast", "West Coast", "South", "Midwest"]

// Specialty options with descriptions
const SPECIALTY_OPTIONS: { value: string; label: string; description: string }[] = [
  { value: "Battle Recaps", label: "Battle Recaps", description: "In-depth coverage of individual battles, round-by-round analysis" },
  { value: "Bar Analysis", label: "Bar Analysis", description: "Technical breakdown of lyricism, wordplay, and schemes" },
  { value: "Scandals & Drama", label: "Scandals & Drama", description: "Controversies, beef, and behind-the-scenes conflict" },
  { value: "Career Updates", label: "Career Updates", description: "Tracking battler progress, milestones, and career moves" },
  { value: "Rankings & Stats", label: "Rankings & Stats", description: "Power rankings, statistical analysis, and rating systems" },
  { value: "Small Room Coverage", label: "Small Room Coverage", description: "Focus on intimate venues where pen game matters most" },
  { value: "Main Stage Coverage", label: "Main Stage Coverage", description: "Big event coverage, stadium shows, and premier battles" },
  { value: "Culture & Community", label: "Culture & Community", description: "Scene politics, community stories, and cultural impact" },
  { value: "Regional News", label: "Regional News", description: "Coverage of specific cities, regions, and local scenes" },
  { value: "Strategic Analysis", label: "Strategic Analysis", description: "Breakdown of what works, what doesn't, and how to improve" },
]

// What bloggers cover (from the 8 blogger profiles)
const COVERS_OPTIONS = [
  // Technical/Writing
  "Technical writers",
  "Scheme specialists",
  "Underrated pen gamers",
  "Wordplay artists",
  // Battle types
  "Small Room battles",
  "Main Stage Arena battles",
  "Major events",
  "Tournament coverage",
  "Big-name matchups",
  "Controversial decisions",
  // Stats/Career
  "Power rankings",
  "Career milestones",
  "Rating changes",
  "Statistical trends",
  // Drama
  "Scandals",
  "Beef between battlers",
  "Controversial figures",
  "Underground drama",
  // Community
  "Life events",
  "Community stories",
  "Scene politics",
  "Battler backgrounds",
  // Regional
  "Regional matchups",
  "City-specific news",
  "Geographic rivalries",
  "Scene comparisons",
  // Analysis
  "Post-battle analysis",
  "Prep strategies",
  "What went wrong",
  "How to improve",
  "League-specific news",
]

// Writing style options
const WRITING_STYLE_OPTIONS = [
  "Technical analysis",
  "Play-by-play breakdowns",
  "Bar-by-bar scoring",
  "Objective tone",
  "Raw, unfiltered",
  "Controversial takes",
  "Drama-focused",
  "Street vernacular",
  "Data-driven",
  "Statistical breakdowns",
  "Lyric-focused",
  "Appreciates wordplay",
  "Intimate tone",
  "Performance-focused",
  "Hype energy",
  "Mainstream appeal",
  "Entertainment lens",
  "Community-focused",
  "Thoughtful analysis",
  "Human interest",
  "Culture commentary",
  "Geographic focus",
  "Regional comparisons",
  "Local scene coverage",
  "Strategic analysis",
  "Educational tone",
  "Breakdown format",
  "Tactical focus",
]

interface BloggerFormData {
  name: string
  title: string
  icon: string
  color: string
  specialty: string
  homeLeague: string | null
  followers: number
  articleCount: number
  bio: string
  notableTakes: string[]
  writingStyle: string[]
  covers: string[]
  avatarId: string
  avatarCrop: { scale: number; offsetX: number; offsetY: number }
  // DB stats (read-only display)
  credibilityScore: number
  factsCount: number
  capCount: number
  fireCount: number
  midCount: number
}

export default function DevBloggersPage() {
  const [selectedBlogger, setSelectedBlogger] = useState<Blogger | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState<BloggerFormData | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [activeSection, setActiveSection] = useState<"identity" | "stats" | "content" | "avatar">("identity")
  const [leagues, setLeagues] = useState<League[]>([])

  // Load leagues on mount
  useEffect(() => {
    const loadedLeagues = getLeagues()
    setLeagues(loadedLeagues)
  }, [])

  // Get unique regions from loaded leagues
  const leagueRegions = leagues.length > 0
    ? [...new Set(leagues.map(l => l.region))].filter(Boolean).sort()
    : DEFAULT_REGIONS

  const filteredBloggers = BLOGGERS.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 49)])
  }

  const handleSelectBlogger = (blogger: Blogger) => {
    setSelectedBlogger(blogger)
    setFormData({
      name: blogger.name,
      title: blogger.title,
      icon: blogger.icon,
      color: blogger.color,
      specialty: blogger.specialty,
      homeLeague: blogger.homeLeague,
      followers: blogger.followers,
      articleCount: blogger.articleCount,
      bio: blogger.bio,
      notableTakes: [...blogger.notableTakes],
      writingStyle: [...blogger.writingStyle],
      covers: [...blogger.covers],
      avatarId: blogger.avatarId || "",
      avatarCrop: blogger.avatarCrop || { scale: 1, offsetX: 0, offsetY: 0 },
      // DB stats - starts at 0, increases from real user reactions
      credibilityScore: 50, // Base credibility before any reactions
      factsCount: 0,
      capCount: 0,
      fireCount: 0,
      midCount: 0,
    })
    addLog(`Selected blogger: ${blogger.name}`)
  }

  const updateFormField = <K extends keyof BloggerFormData>(field: K, value: BloggerFormData[K]) => {
    if (!formData) return
    setFormData({ ...formData, [field]: value })
  }

  const addArrayItem = (field: "notableTakes" | "writingStyle" | "covers") => {
    if (!formData) return
    setFormData({ ...formData, [field]: [...formData[field], ""] })
  }

  const updateArrayItem = (field: "notableTakes" | "writingStyle" | "covers", index: number, value: string) => {
    if (!formData) return
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData({ ...formData, [field]: newArray })
  }

  const removeArrayItem = (field: "notableTakes" | "writingStyle" | "covers", index: number) => {
    if (!formData) return
    const newArray = formData[field].filter((_, i) => i !== index)
    setFormData({ ...formData, [field]: newArray })
  }

  const handleSave = () => {
    if (!selectedBlogger || !formData) return
    addLog(`Saved changes to ${selectedBlogger.name}`)
    addLog(`  - Name: ${formData.name}`)
    addLog(`  - Title: ${formData.title}`)
    addLog(`  - Icon: ${formData.icon}`)
    addLog(`  - Color: ${formData.color}`)
    addLog(`  - Specialty: ${formData.specialty}`)
    addLog(`  - Home League: ${formData.homeLeague || "Independent"}`)
    addLog(`  - Followers: ${formData.followers}`)
    addLog(`  - Article Count: ${formData.articleCount}`)
    addLog(`  - Notable Takes: ${formData.notableTakes.length} items`)
    addLog(`  - Writing Style: ${formData.writingStyle.length} items`)
    addLog(`  - Covers: ${formData.covers.length} items`)
    addLog(`  - Avatar ID: ${formData.avatarId || "none"}`)
  }

  // Placeholder blogger avatar sprites
  const availableAvatars = [
    "blogger_001", "blogger_002", "blogger_003", "blogger_004",
    "blogger_005", "blogger_006", "blogger_007", "blogger_008",
  ]

  const sectionTabs = [
    { id: "identity", label: "Identity", icon: Hash },
    { id: "stats", label: "Stats & Reputation", icon: ThumbsUp },
    { id: "content", label: "Content & Style", icon: FileText },
    { id: "avatar", label: "Avatar", icon: Upload },
  ] as const

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dev" className="text-zinc-400 hover:text-orange-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-display font-black uppercase text-orange-500">Blogger Editor</h1>
              <p className="text-xs text-zinc-500">Edit all blogger properties: identity, stats, content, avatar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Blogger List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search bloggers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredBloggers.map((blogger) => (
                <button
                  key={blogger.id}
                  onClick={() => handleSelectBlogger(blogger)}
                  className={`w-full p-3 rounded border text-left transition-all ${
                    selectedBlogger?.id === blogger.id
                      ? "bg-orange-500/10 border-orange-500"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${blogger.color}30` }}
                    >
                      {blogger.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm truncate">{blogger.name}</div>
                      <div className="text-xs text-zinc-500 truncate">{blogger.specialty}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-400">{(blogger.followers / 1000).toFixed(1)}K</div>
                      <div className="text-xs text-zinc-600">{blogger.articleCount} articles</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-2">
            {selectedBlogger && formData ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                {/* Blogger Preview Header */}
                <div className="p-6 border-b border-zinc-800" style={{ borderLeftWidth: 4, borderLeftColor: formData.color }}>
                  <div className="flex items-center gap-6">
                    <div
                      className="w-20 h-20 rounded-full border-2 overflow-hidden bg-zinc-800 flex items-center justify-center"
                      style={{ borderColor: formData.color }}
                    >
                      {formData.avatarId ? (
                        <div
                          className="w-full h-full relative"
                          style={{
                            transform: `scale(${formData.avatarCrop.scale}) translate(${formData.avatarCrop.offsetX}px, ${formData.avatarCrop.offsetY}px)`,
                          }}
                        >
                          <Image
                            src={`/sprites/bloggers/${formData.avatarId}.png`}
                            alt="Blogger avatar"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-4xl">{formData.icon}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-display font-black">{formData.name}</h2>
                      <p className="text-zinc-400 italic">"{formData.title}"</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span
                          className="px-2 py-0.5 text-xs font-bold rounded"
                          style={{ backgroundColor: `${formData.color}30`, color: formData.color }}
                        >
                          {formData.specialty}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-zinc-800 text-zinc-400">
                          {formData.homeLeague || "Independent"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2 justify-end">
                        <Users className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-bold">{formData.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <FileText className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm">{formData.articleCount} articles</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Tabs */}
                <div className="border-b border-zinc-800 flex">
                  {sectionTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSection(tab.id)}
                      className={`flex-1 py-3 px-4 text-sm font-display font-bold flex items-center justify-center gap-2 transition-all ${
                        activeSection === tab.id
                          ? "bg-zinc-800 text-orange-500 border-b-2 border-orange-500"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Section Content */}
                <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                  {/* IDENTITY SECTION */}
                  {activeSection === "identity" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) => updateFormField("name", e.target.value)}
                            className="bg-zinc-800 border-zinc-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Title (Tagline)</Label>
                          <Input
                            value={formData.title}
                            onChange={(e) => updateFormField("title", e.target.value)}
                            className="bg-zinc-800 border-zinc-700"
                            placeholder="The Technical Analyst"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-display">Specialty</Label>
                        <div className="space-y-2">
                          <select
                            value={formData.specialty}
                            onChange={(e) => updateFormField("specialty", e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">Select specialty...</option>
                            {SPECIALTY_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          {formData.specialty && (
                            <p className="text-xs text-zinc-400 pl-1">
                              {SPECIALTY_OPTIONS.find(o => o.value === formData.specialty)?.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          Icon (Emoji)
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {EMOJI_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => updateFormField("icon", emoji)}
                              className={`w-10 h-10 rounded text-xl flex items-center justify-center transition-all ${
                                formData.icon === emoji
                                  ? "bg-orange-500/30 ring-2 ring-orange-500"
                                  : "bg-zinc-800 hover:bg-zinc-700"
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          Color
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {COLOR_OPTIONS.map((c) => (
                            <button
                              key={c.value}
                              onClick={() => updateFormField("color", c.value)}
                              className={`w-10 h-10 rounded transition-all ${
                                formData.color === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : ""
                              }`}
                              style={{ backgroundColor: c.value }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 font-display">
                          <Building2 className="w-4 h-4" />
                          Home League
                        </Label>

                        {/* Independent option */}
                        <button
                          onClick={() => updateFormField("homeLeague", null)}
                          className={`w-full px-4 py-2 rounded text-sm font-bold text-left transition-all ${
                            formData.homeLeague === null
                              ? "bg-zinc-700 text-white ring-2 ring-orange-500"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>Independent</span>
                            <span className="text-xs text-zinc-500">No home league</span>
                          </div>
                        </button>

                        {/* Leagues by Region */}
                        <div className="max-h-[280px] overflow-y-auto space-y-3 pr-1">
                          {leagueRegions.map(region => {
                            const regionLeagues = leagues.filter(l => l.region === region)
                            return (
                              <div key={region}>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-display">{region}</div>
                                <div className="space-y-1">
                                  {regionLeagues.map(league => {
                                    const tierInfo = getTierInfo(league.tier)
                                    return (
                                      <button
                                        key={league.id}
                                        onClick={() => updateFormField("homeLeague", league.displayName)}
                                        className={`w-full px-3 py-2 rounded text-sm text-left transition-all ${
                                          formData.homeLeague === league.displayName
                                            ? "bg-zinc-700 text-white ring-2 ring-orange-500"
                                            : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
                                        }`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-bold">{league.displayName}</span>
                                          <span className={`text-xs px-2 py-0.5 rounded ${tierInfo.bgColor} ${tierInfo.color}`}>
                                            {tierInfo.label}
                                          </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{league.tagline}</p>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Selected league description */}
                        {formData.homeLeague && (
                          <div className="p-2 bg-zinc-800/50 rounded text-xs text-zinc-400">
                            {LEAGUES.find(l => l.displayName === formData.homeLeague)?.description}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                          value={formData.bio}
                          onChange={(e) => updateFormField("bio", e.target.value)}
                          className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                          placeholder="Blogger backstory and description..."
                        />
                      </div>
                    </>
                  )}

                  {/* STATS SECTION */}
                  {activeSection === "stats" && (
                    <>
                      {/* Gameplay Stats */}
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-4">
                        <h4 className="text-sm font-display font-bold text-green-500 uppercase flex items-center gap-2">
                          <span>⚡</span>
                          Gameplay Stats (Affects Game)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Followers
                            </Label>
                            <Input
                              type="number"
                              value={formData.followers}
                              onChange={(e) => updateFormField("followers", parseInt(e.target.value) || 0)}
                              className="bg-zinc-800 border-zinc-700"
                            />
                            <p className="text-xs text-zinc-500">
                              Determines reach & visibility of articles
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Article Count
                            </Label>
                            <div className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-400">
                              {formData.articleCount}
                            </div>
                            <p className="text-xs text-zinc-500">
                              Auto-increments as LLM generates articles
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* User Reactions (from DB) */}
                      <div className="p-4 bg-zinc-800/50 rounded-lg space-y-4">
                        <h4 className="text-sm font-display font-bold text-zinc-400 uppercase flex items-center gap-2">
                          <span>💬</span>
                          User Reactions (From Real Players)
                        </h4>
                        <p className="text-xs text-zinc-500">
                          These start at 0. Players can react to articles with FACTS/CAP/FIRE/MID.
                          Reactions feed into blogger credibility over time.
                        </p>

                        <div className="grid grid-cols-4 gap-4">
                          <div className="bg-zinc-900 p-3 rounded text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <span className="text-lg">📰</span>
                              <span className="text-xs text-green-400">FACTS</span>
                            </div>
                            <div className="text-xl font-bold text-green-400">{formData.factsCount}</div>
                          </div>
                          <div className="bg-zinc-900 p-3 rounded text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <span className="text-lg">🧢</span>
                              <span className="text-xs text-red-400">CAP</span>
                            </div>
                            <div className="text-xl font-bold text-red-400">{formData.capCount}</div>
                          </div>
                          <div className="bg-zinc-900 p-3 rounded text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <span className="text-lg">🔥</span>
                              <span className="text-xs text-orange-400">FIRE</span>
                            </div>
                            <div className="text-xl font-bold text-orange-400">{formData.fireCount}</div>
                          </div>
                          <div className="bg-zinc-900 p-3 rounded text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <span className="text-lg">😐</span>
                              <span className="text-xs text-zinc-400">MID</span>
                            </div>
                            <div className="text-xl font-bold text-zinc-400">{formData.midCount}</div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-zinc-700">
                          <div className="flex items-center justify-between">
                            <Label className="text-zinc-500">Credibility Score (derived)</Label>
                            <span className={`text-lg font-bold ${
                              formData.credibilityScore >= 70 ? "text-green-500" :
                              formData.credibilityScore >= 40 ? "text-yellow-500" : "text-red-500"
                            }`}>{formData.credibilityScore}/100</span>
                          </div>
                          <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                formData.credibilityScore >= 70 ? "bg-green-500" :
                                formData.credibilityScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${formData.credibilityScore}%` }}
                            />
                          </div>
                          <p className="text-xs text-zinc-600">
                            Calculated from FACTS vs CAP ratio. Used by LLM for blogger personality/accuracy.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* CONTENT SECTION */}
                  {activeSection === "content" && (
                    <>
                      {/* Notable Takes */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Mic2 className="w-4 h-4" />
                            Notable Takes ({formData.notableTakes.length})
                          </Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addArrayItem("notableTakes")}
                            className="text-orange-500 border-orange-500/30"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {formData.notableTakes.map((take, i) => (
                            <div key={i} className="flex gap-2">
                              <Input
                                value={take}
                                onChange={(e) => updateArrayItem("notableTakes", i, e.target.value)}
                                className="bg-zinc-800 border-zinc-700 flex-1"
                                placeholder={`Quote ${i + 1}...`}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeArrayItem("notableTakes", i)}
                                className="text-red-500 hover:bg-red-500/10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Writing Style */}
                      <div className="space-y-3">
                        <Label>Writing Style - Select up to 4</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto p-2 bg-zinc-800/50 rounded-lg">
                          {WRITING_STYLE_OPTIONS.map((style) => {
                            const isSelected = formData.writingStyle.includes(style)
                            const isDisabled = !isSelected && formData.writingStyle.length >= 4
                            return (
                              <button
                                key={style}
                                onClick={() => {
                                  if (isSelected) {
                                    updateFormField("writingStyle", formData.writingStyle.filter(s => s !== style))
                                  } else if (!isDisabled) {
                                    updateFormField("writingStyle", [...formData.writingStyle, style])
                                  }
                                }}
                                disabled={isDisabled}
                                className={`text-left px-3 py-2 rounded text-sm transition-all ${
                                  isSelected
                                    ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500"
                                    : isDisabled
                                    ? "bg-zinc-900/50 text-zinc-600 cursor-not-allowed"
                                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-700"
                                }`}
                              >
                                <span className="mr-2">{isSelected ? "✓" : "○"}</span>
                                {style}
                              </button>
                            )
                          })}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Selected ({formData.writingStyle.length}/4): {formData.writingStyle.join(", ") || "None"}
                        </div>
                      </div>

                      {/* Covers */}
                      <div className="space-y-3">
                        <Label>Covers (What They Write About) - Select up to 6</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 bg-zinc-800/50 rounded-lg">
                          {COVERS_OPTIONS.map((cover) => {
                            const isSelected = formData.covers.includes(cover)
                            const isDisabled = !isSelected && formData.covers.length >= 6
                            return (
                              <button
                                key={cover}
                                onClick={() => {
                                  if (isSelected) {
                                    updateFormField("covers", formData.covers.filter(c => c !== cover))
                                  } else if (!isDisabled) {
                                    updateFormField("covers", [...formData.covers, cover])
                                  }
                                }}
                                disabled={isDisabled}
                                className={`text-left px-3 py-2 rounded text-sm transition-all ${
                                  isSelected
                                    ? "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500"
                                    : isDisabled
                                    ? "bg-zinc-900/50 text-zinc-600 cursor-not-allowed"
                                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-700"
                                }`}
                              >
                                <span className="mr-2">{isSelected ? "✓" : "○"}</span>
                                {cover}
                              </button>
                            )
                          })}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Selected ({formData.covers.length}/6): {formData.covers.join(", ") || "None"}
                        </div>
                      </div>
                    </>
                  )}

                  {/* AVATAR SECTION */}
                  {activeSection === "avatar" && (
                    <>
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Select Avatar Sprite
                        </Label>
                        <div className="grid grid-cols-4 gap-3">
                          {availableAvatars.map((id) => (
                            <button
                              key={id}
                              onClick={() => {
                                updateFormField("avatarId", id)
                                addLog(`Assigned avatar ${id} to ${selectedBlogger.name}`)
                              }}
                              className={`aspect-square rounded-full border-2 overflow-hidden transition-all bg-zinc-800 flex items-center justify-center ${
                                formData.avatarId === id
                                  ? "border-orange-500 ring-2 ring-orange-500/30"
                                  : "border-zinc-700 hover:border-zinc-500"
                              }`}
                            >
                              <span className="text-zinc-500 text-xs">{id.split("_")[1]}</span>
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-500">Upload blogger avatar sprites to /sprites/bloggers/ folder</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateFormField("avatarId", "")
                            addLog(`Removed avatar from ${selectedBlogger.name}`)
                          }}
                          className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Avatar (Use Emoji)
                        </Button>
                      </div>

                      {/* Avatar Crop Controls */}
                      {formData.avatarId && (
                        <div className="space-y-4 p-4 bg-zinc-800/50 rounded-lg">
                          <Label className="flex items-center gap-2">
                            <Sliders className="w-4 h-4" />
                            Avatar Crop / Position
                          </Label>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                <span>Scale</span>
                                <span>{formData.avatarCrop.scale.toFixed(2)}x</span>
                              </div>
                              <Slider
                                value={[formData.avatarCrop.scale]}
                                onValueChange={([v]) => updateFormField("avatarCrop", { ...formData.avatarCrop, scale: v })}
                                min={0.5}
                                max={2}
                                step={0.05}
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                <span>Offset X</span>
                                <span>{formData.avatarCrop.offsetX}px</span>
                              </div>
                              <Slider
                                value={[formData.avatarCrop.offsetX]}
                                onValueChange={([v]) => updateFormField("avatarCrop", { ...formData.avatarCrop, offsetX: v })}
                                min={-50}
                                max={50}
                                step={1}
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                <span>Offset Y</span>
                                <span>{formData.avatarCrop.offsetY}px</span>
                              </div>
                              <Slider
                                value={[formData.avatarCrop.offsetY]}
                                onValueChange={([v]) => updateFormField("avatarCrop", { ...formData.avatarCrop, offsetY: v })}
                                min={-50}
                                max={50}
                                step={1}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Save Button */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                  <Button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold">
                    <Save className="w-4 h-4 mr-2" />
                    Save All Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
                <div className="text-zinc-500">
                  <span className="text-4xl mb-4 block">📝</span>
                  <p>Select a blogger from the list to edit</p>
                  <p className="text-xs mt-2 text-zinc-600">You can edit: identity, stats, content style, and avatar</p>
                </div>
              </div>
            )}

            {/* Debug Log */}
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-bold text-zinc-400 mb-2">Debug Log</h3>
              <div className="max-h-32 overflow-y-auto font-mono text-xs text-zinc-500 space-y-0.5">
                {logs.length === 0 ? (
                  <p>No actions yet...</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="text-green-400">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
