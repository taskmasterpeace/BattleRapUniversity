"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Plus, ZoomIn, Move } from "lucide-react"
import type { Battler, PortraitCrop } from "@/lib/types"

// Mock battlers for dev
const MOCK_BATTLERS: (Battler & { portrait?: { spriteUrl: string; crop?: PortraitCrop } })[] = [
  {
    id: "1",
    stageName: "TECH WIZARD",
    elo: 1450,
    region: "Southeast",
    tier: "MID TIER",
    league: "URL",
    archetype: "Technical Writer",
    stats: {
      writing: { lyricism: 7.5, wordplay: 8, creativity: 7, flow: 7.5 },
      performance: { stagePresence: 6, crowdControl: 6.5, delivery: 7 },
      personal: { financial: 5, reputation: 6, family: 7, resilience: 6.5 },
    },
    styles: ["Wordplay", "Schemes", "Multis"],
    record: { wins: 11, losses: 4 },
    badges: ["REBUTTAL KING", "WELL RESEARCHED"],
    portrait: {
      spriteUrl: "/sprites/characters/sprite_569.png",
      crop: { scale: 1.2, offsetX: 0, offsetY: -5 },
    },
  },
  {
    id: "2",
    stageName: "YOUNG PATTERN",
    elo: 1320,
    region: "Midwest",
    tier: "LOW TIER",
    league: "RBE",
    archetype: "Angle Rapper",
    stats: {
      writing: { lyricism: 6.5, wordplay: 7, creativity: 8, flow: 6.5 },
      performance: { stagePresence: 7, crowdControl: 7.5, delivery: 6 },
      personal: { financial: 4, reputation: 5, family: 6, resilience: 7 },
    },
    styles: ["Angles", "Personals", "Aggression"],
    record: { wins: 8, losses: 5 },
    badges: [],
    portrait: {
      spriteUrl: "/sprites/characters/sprite_571.png",
      crop: { scale: 1, offsetX: 0, offsetY: 0 },
    },
  },
]

export default function DevBattlersPage() {
  const [battlers, setBattlers] = useState(MOCK_BATTLERS)
  const [selectedBattler, setSelectedBattler] = useState<(typeof MOCK_BATTLERS)[0] | null>(null)
  const [cropSettings, setCropSettings] = useState<PortraitCrop>({ scale: 1, offsetX: 0, offsetY: 0 })

  const handleSelectBattler = (battler: (typeof MOCK_BATTLERS)[0]) => {
    setSelectedBattler(battler)
    setCropSettings(battler.portrait?.crop || { scale: 1, offsetX: 0, offsetY: 0 })
  }

  const handleSaveCrop = () => {
    if (!selectedBattler) return
    setBattlers((prev) =>
      prev.map((b) => (b.id === selectedBattler.id ? { ...b, portrait: { ...b.portrait!, crop: cropSettings } } : b)),
    )
    setSelectedBattler((prev) => (prev ? { ...prev, portrait: { ...prev.portrait!, crop: cropSettings } } : null))
  }

  const getTierColor = (tier: string) => {
    const t = tier.toLowerCase()
    if (t.includes("god")) return "text-amber-400 bg-amber-500/20 border-amber-500/50"
    if (t.includes("top")) return "text-purple-400 bg-purple-500/20 border-purple-500/50"
    if (t.includes("mid")) return "text-blue-400 bg-blue-500/20 border-blue-500/50"
    if (t.includes("low")) return "text-green-400 bg-green-500/20 border-green-500/50"
    return "text-zinc-400 bg-zinc-500/20 border-zinc-500/50"
  }

  const getTierBgColor = (tier: string) => {
    const t = tier.toLowerCase()
    if (t.includes("god")) return "bg-gradient-to-br from-amber-500/40 to-yellow-600/40"
    if (t.includes("top")) return "bg-gradient-to-br from-purple-600/40 to-violet-700/40"
    if (t.includes("mid")) return "bg-gradient-to-br from-blue-600/40 to-cyan-700/40"
    if (t.includes("low")) return "bg-gradient-to-br from-green-600/40 to-emerald-700/40"
    return "bg-gradient-to-br from-zinc-600/40 to-zinc-700/40"
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b-2 border-orange-900/50 bg-zinc-900/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/dev" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-display font-bold text-orange-400">DEV: BATTLER EDITOR</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Battler List */}
          <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold">BATTLERS</h2>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-sm font-bold transition-colors">
                <Plus className="w-4 h-4" />
                ADD NEW
              </button>
            </div>

            <div className="space-y-2">
              {battlers.map((battler) => (
                <button
                  key={battler.id}
                  onClick={() => handleSelectBattler(battler)}
                  className={`w-full flex items-center gap-3 p-3 border-2 transition-colors ${
                    selectedBattler?.id === battler.id
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50"
                  }`}
                >
                  {/* Preview */}
                  <div
                    className={`w-12 h-12 ${getTierBgColor(battler.tier)} border border-zinc-600 overflow-hidden relative`}
                  >
                    <Image
                      src={battler.portrait?.spriteUrl || "/placeholder.svg"}
                      alt={battler.stageName}
                      width={48}
                      height={48}
                      className="absolute pixelated"
                      style={{
                        transform: `scale(${battler.portrait?.crop?.scale || 1}) translate(${battler.portrait?.crop?.offsetX || 0}px, ${battler.portrait?.crop?.offsetY || 0}px)`,
                        transformOrigin: "top center",
                        width: "100%",
                        height: "auto",
                      }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-display font-bold">{battler.stageName}</div>
                    <div className="text-xs text-zinc-400">
                      {battler.league} | {battler.region}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold border ${getTierColor(battler.tier)}`}>
                    {battler.tier.replace(" TIER", "")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Portrait Crop Editor */}
          <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
            <h2 className="text-lg font-display font-bold mb-4">PORTRAIT CROP EDITOR</h2>

            {selectedBattler ? (
              <div className="space-y-4">
                {/* Preview Box */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="text-xs text-zinc-500 text-center mb-2">Preview (96x96)</div>
                    <div
                      className={`w-24 h-24 ${getTierBgColor(selectedBattler.tier)} border-2 border-zinc-600 overflow-hidden relative`}
                    >
                      <Image
                        src={selectedBattler.portrait?.spriteUrl || "/placeholder.svg"}
                        alt={selectedBattler.stageName}
                        width={96}
                        height={96}
                        className="absolute pixelated"
                        style={{
                          transform: `scale(${cropSettings.scale}) translate(${cropSettings.offsetX}px, ${cropSettings.offsetY}px)`,
                          transformOrigin: "top center",
                          width: "100%",
                          height: "auto",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Full Image Reference */}
                <div className="flex items-center justify-center">
                  <div>
                    <div className="text-xs text-zinc-500 text-center mb-2">Full Sprite</div>
                    <div className="border border-zinc-700 bg-zinc-800 p-2">
                      <Image
                        src={selectedBattler.portrait?.spriteUrl || "/placeholder.svg"}
                        alt="Full sprite"
                        width={128}
                        height={128}
                        className="pixelated"
                      />
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-3 pt-4 border-t border-zinc-700">
                  {/* Scale */}
                  <div>
                    <label className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <ZoomIn className="w-4 h-4 text-zinc-400" />
                        Scale
                      </span>
                      <span className="font-mono text-orange-400">{cropSettings.scale.toFixed(2)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.05"
                      value={cropSettings.scale}
                      onChange={(e) =>
                        setCropSettings((prev) => ({ ...prev, scale: Number.parseFloat(e.target.value) }))
                      }
                      className="w-full accent-orange-500"
                    />
                  </div>

                  {/* Offset X */}
                  <div>
                    <label className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <Move className="w-4 h-4 text-zinc-400" />
                        Horizontal Offset
                      </span>
                      <span className="font-mono text-orange-400">{cropSettings.offsetX}px</span>
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={cropSettings.offsetX}
                      onChange={(e) =>
                        setCropSettings((prev) => ({ ...prev, offsetX: Number.parseInt(e.target.value) }))
                      }
                      className="w-full accent-orange-500"
                    />
                  </div>

                  {/* Offset Y */}
                  <div>
                    <label className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <Move className="w-4 h-4 text-zinc-400" />
                        Vertical Offset
                      </span>
                      <span className="font-mono text-orange-400">{cropSettings.offsetY}px</span>
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={cropSettings.offsetY}
                      onChange={(e) =>
                        setCropSettings((prev) => ({ ...prev, offsetY: Number.parseInt(e.target.value) }))
                      }
                      className="w-full accent-orange-500"
                    />
                  </div>

                  {/* Reset & Save */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setCropSettings({ scale: 1, offsetX: 0, offsetY: 0 })}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-sm font-bold transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSaveCrop}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-sm font-bold transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Crop
                    </button>
                  </div>
                </div>

                {/* Sprite URL */}
                <div className="pt-4 border-t border-zinc-700">
                  <label className="text-sm text-zinc-400 block mb-1">Sprite URL</label>
                  <input
                    type="text"
                    value={selectedBattler.portrait?.spriteUrl || ""}
                    readOnly
                    className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm font-mono text-zinc-300"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">Select a battler to edit their portrait crop</div>
            )}
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 bg-zinc-900/50 border border-zinc-800 p-4 text-sm text-zinc-400">
          <p className="font-bold text-zinc-300 mb-2">How to access Dev Tools:</p>
          <p>
            Navigate to <code className="bg-zinc-800 px-1 py-0.5 text-orange-400">/dev</code> in your browser to access
            the main dev tools dashboard. From there you can access this battler editor and other tools.
          </p>
        </div>
      </main>
    </div>
  )
}
