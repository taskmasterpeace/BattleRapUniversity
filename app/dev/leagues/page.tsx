"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Upload, Trash2, Search, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { LEAGUES, type League } from "@/lib/leagues"
import { LeagueLogo } from "@/components/leagues/league-logo"

export default function DevLeaguesPage() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [editedName, setEditedName] = useState("")
  const [editedTagline, setEditedTagline] = useState("")
  const [logoId, setLogoId] = useState("")
  const [logoCrop, setLogoCrop] = useState({ scale: 1, offsetX: 0, offsetY: 0 })
  const [logs, setLogs] = useState<string[]>([])

  const filteredLeagues = LEAGUES.filter(
    (l) =>
      l.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.tier.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 49)])
  }

  const handleSelectLeague = (league: League) => {
    setSelectedLeague(league)
    setEditedName(league.displayName)
    setEditedTagline(league.tagline)
    setLogoId(league.logoId || "")
    setLogoCrop({ scale: 1, offsetX: 0, offsetY: 0 })
    addLog(`Selected league: ${league.displayName}`)
  }

  const handleSave = () => {
    if (!selectedLeague) return
    addLog(`Saved changes to ${selectedLeague.displayName}`)
    addLog(`  - Name: ${editedName}`)
    addLog(`  - Tagline: ${editedTagline}`)
    addLog(`  - Logo ID: ${logoId || "none"}`)
    addLog(`  - Crop: scale=${logoCrop.scale}, x=${logoCrop.offsetX}, y=${logoCrop.offsetY}`)
  }

  // Available logo sprites
  const availableLogos = [
    "league_089",
    "league_090",
    "league_091",
    "league_092",
    "league_093",
    "league_094",
    "league_095",
    "league_096",
  ]

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
              <h1 className="text-xl font-black uppercase text-orange-500">League Editor</h1>
              <p className="text-xs text-zinc-500">Edit league names, logos, and settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* League List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search leagues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredLeagues.map((league) => (
                <button
                  key={league.id}
                  onClick={() => handleSelectLeague(league)}
                  className={`w-full p-3 rounded border text-left transition-all ${
                    selectedLeague?.id === league.id
                      ? "bg-orange-500/10 border-orange-500"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LeagueLogo league={league} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{league.displayName}</div>
                      <div className="text-xs text-zinc-500 capitalize">{league.tier}</div>
                    </div>
                    {league.logoId && <span className="text-xs text-green-500">Has Logo</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-2">
            {selectedLeague ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
                {/* League Preview */}
                <div className="flex items-center gap-6 pb-6 border-b border-zinc-800">
                  <div
                    className="w-32 h-32 rounded-lg border-2 overflow-hidden bg-zinc-800 flex items-center justify-center"
                    style={{ borderColor: selectedLeague.primaryColor }}
                  >
                    {logoId ? (
                      <div
                        className="w-full h-full relative"
                        style={{
                          transform: `scale(${logoCrop.scale}) translate(${logoCrop.offsetX}px, ${logoCrop.offsetY}px)`,
                        }}
                      >
                        <Image
                          src={`/sprites/leagues/${logoId}.png`}
                          alt="League logo"
                          fill
                          className="object-contain image-pixelated"
                        />
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-sm">No Logo</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase">{editedName}</h2>
                    <p className="text-zinc-400 italic">"{editedTagline}"</p>
                    <div className="flex gap-2 mt-2">
                      <span
                        className="px-2 py-0.5 text-xs font-bold uppercase rounded"
                        style={{
                          backgroundColor: `${selectedLeague.primaryColor}30`,
                          color: selectedLeague.primaryColor,
                        }}
                      >
                        {selectedLeague.tier}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-zinc-800 rounded">{selectedLeague.region}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input
                      value={editedTagline}
                      onChange={(e) => setEditedTagline(e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>

                {/* Logo Selection */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Select Logo Sprite
                  </Label>
                  <div className="grid grid-cols-4 gap-3">
                    {availableLogos.map((id) => (
                      <button
                        key={id}
                        onClick={() => {
                          setLogoId(id)
                          addLog(`Assigned logo ${id} to ${selectedLeague.displayName}`)
                        }}
                        className={`aspect-square rounded border-2 overflow-hidden transition-all ${
                          logoId === id
                            ? "border-orange-500 ring-2 ring-orange-500/30"
                            : "border-zinc-700 hover:border-zinc-500"
                        }`}
                      >
                        <Image
                          src={`/sprites/leagues/${id}.png`}
                          alt={id}
                          width={96}
                          height={96}
                          className="w-full h-full object-contain bg-zinc-800 p-1 image-pixelated"
                        />
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLogoId("")
                      addLog(`Removed logo from ${selectedLeague.displayName}`)
                    }}
                    className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Logo
                  </Button>
                </div>

                {/* Logo Crop Controls */}
                {logoId && (
                  <div className="space-y-4 p-4 bg-zinc-800/50 rounded-lg">
                    <Label className="flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      Logo Crop / Position
                    </Label>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Scale</span>
                          <span>{logoCrop.scale.toFixed(2)}x</span>
                        </div>
                        <Slider
                          value={[logoCrop.scale]}
                          onValueChange={([v]) => setLogoCrop((prev) => ({ ...prev, scale: v }))}
                          min={0.5}
                          max={2}
                          step={0.05}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Offset X</span>
                          <span>{logoCrop.offsetX}px</span>
                        </div>
                        <Slider
                          value={[logoCrop.offsetX]}
                          onValueChange={([v]) => setLogoCrop((prev) => ({ ...prev, offsetX: v }))}
                          min={-50}
                          max={50}
                          step={1}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Offset Y</span>
                          <span>{logoCrop.offsetY}px</span>
                        </div>
                        <Slider
                          value={[logoCrop.offsetY]}
                          onValueChange={([v]) => setLogoCrop((prev) => ({ ...prev, offsetY: v }))}
                          min={-50}
                          max={50}
                          step={1}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <Button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
                <div className="text-zinc-500">
                  <span className="text-4xl mb-4 block">🏆</span>
                  <p>Select a league from the list to edit</p>
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
