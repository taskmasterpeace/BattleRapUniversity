"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Plus, ZoomIn, Move, Square, RefreshCw, AlertTriangle, Crop, Scissors } from "lucide-react"
import type { PortraitCrop } from "@/lib/types"
import { PortraitCropper } from "@/components/dev/portrait-cropper"

interface BattlerData {
  id: string
  stageName: string
  elo: number
  region: string
  city?: { name: string; state: string; region: string } | null
  tier: string
  league: string
  archetype: string
  stats: {
    writing: { lyricism: number; wordplay: number; creativity: number; flow: number }
    performance: { stagePresence: number; crowdControl: number; delivery: number }
    personal: { financial: number; reputation: number; family: number; resilience: number }
  }
  styles: string[]
  record: { wins: number; losses: number }
  badges: string[]
  portrait: {
    spriteUrl: string
    crop?: PortraitCrop
  }
  isPlayer?: boolean
}

// Reusable portrait component that applies crop consistently at any size
function CroppedPortrait({
  src,
  alt,
  size,
  crop,
  className = "",
}: {
  src: string
  alt: string
  size: number
  crop?: PortraitCrop
  className?: string
}) {
  const scale = crop?.scale || 1
  const offsetX = crop?.offsetX || 0
  const offsetY = crop?.offsetY || 0

  // Normalize offsets to the container size (offsets are defined at 96px base)
  const scaledOffsetX = (offsetX * (size / 96)) / scale
  const scaledOffsetY = (offsetY * (size / 96)) / scale

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          left: '50%',
          top: '50%',
          imageRendering: 'pixelated',
          transform: `translate(-50%, -50%) scale(${scale}) translate(${scaledOffsetX}px, ${scaledOffsetY}px)`,
        }}
      />
    </div>
  )
}

export default function DevBattlersPage() {
  const [battlers, setBattlers] = useState<BattlerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBattler, setSelectedBattler] = useState<BattlerData | null>(null)
  const [cropSettings, setCropSettings] = useState<PortraitCrop>({ scale: 1, offsetX: 0, offsetY: 0 })
  const [saving, setSaving] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [editingSpriteUrl, setEditingSpriteUrl] = useState("")
  const [savingSpriteUrl, setSavingSpriteUrl] = useState(false)

  const fetchBattlers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dev/battlers')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setBattlers(json.battlers)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBattlers()
  }, [])

  const handleSelectBattler = (battler: BattlerData) => {
    setSelectedBattler(battler)
    setCropSettings(battler.portrait?.crop || { scale: 1, offsetX: 0, offsetY: 0 })
    setEditingSpriteUrl(battler.portrait?.spriteUrl || "")
  }

  const handleSaveCrop = async () => {
    if (!selectedBattler) return

    setSaving(true)
    try {
      const res = await fetch('/api/dev/battlers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battlerId: selectedBattler.id,
          portraitCrop: cropSettings,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to save')
      }

      // Update local state
      setBattlers((prev) =>
        prev.map((b) => (b.id === selectedBattler.id ? { ...b, portrait: { ...b.portrait!, crop: cropSettings } } : b)),
      )
      setSelectedBattler((prev) => (prev ? { ...prev, portrait: { ...prev.portrait!, crop: cropSettings } } : null))
    } catch (err: any) {
      alert('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSpriteUrl = async () => {
    if (!selectedBattler) return

    setSavingSpriteUrl(true)
    try {
      const res = await fetch('/api/dev/battlers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battlerId: selectedBattler.id,
          spriteUrl: editingSpriteUrl,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to save')
      }

      // Update local state
      setBattlers((prev) =>
        prev.map((b) => (b.id === selectedBattler.id ? { ...b, portrait: { ...b.portrait!, spriteUrl: editingSpriteUrl } } : b)),
      )
      setSelectedBattler((prev) => (prev ? { ...prev, portrait: { ...prev.portrait!, spriteUrl: editingSpriteUrl } } : null))
    } catch (err: any) {
      alert('Failed to save: ' + err.message)
    } finally {
      setSavingSpriteUrl(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchBattlers}
          className="px-4 py-2 bg-orange-500 text-white font-display"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b-2 border-orange-900/50 bg-zinc-900/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dev" className="text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-display font-bold text-orange-400">DEV: BATTLER EDITOR</h1>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1">
                {battlers.length} battlers
              </span>
            </div>
            <button
              onClick={fetchBattlers}
              className="p-2 text-zinc-400 hover:text-white"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Battler List */}
          <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold">BATTLERS</h2>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
                  <div className={`${getTierBgColor(battler.tier)} border border-zinc-600`}>
                    <CroppedPortrait
                      src={battler.portrait?.spriteUrl || "/placeholder.svg"}
                      alt={battler.stageName}
                      size={48}
                      crop={battler.portrait?.crop}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold">{battler.stageName}</span>
                      {battler.isPlayer && (
                        <span className="text-[10px] px-1 bg-orange-500/30 text-orange-400 border border-orange-500/50">
                          PLAYER
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {battler.city ? `${battler.city.name}, ${battler.city.state}` : battler.region} | {battler.record.wins}W-{battler.record.losses}L
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold border ${getTierColor(battler.tier)}`}>
                    {battler.tier.replace(" TIER", "").replace("TIER", "").trim() || "LOW"}
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
                {/* Preview Boxes at Multiple Sizes */}
                <div className="flex items-start justify-center gap-6">
                  {/* 96x96 Preview */}
                  <div className="relative">
                    <div className="flex items-center justify-center gap-1 text-xs text-zinc-500 mb-2">
                      <Square className="w-3 h-3" />
                      <span>96×96</span>
                    </div>
                    <div className={`${getTierBgColor(selectedBattler.tier)} border-2 border-zinc-600`}>
                      <CroppedPortrait
                        src={selectedBattler.portrait?.spriteUrl || "/placeholder.svg"}
                        alt={selectedBattler.stageName}
                        size={96}
                        crop={cropSettings}
                      />
                    </div>
                  </div>

                  {/* 48x48 Preview */}
                  <div className="relative">
                    <div className="flex items-center justify-center gap-1 text-xs text-zinc-500 mb-2">
                      <Square className="w-3 h-3" />
                      <span>48×48</span>
                    </div>
                    <div className={`${getTierBgColor(selectedBattler.tier)} border-2 border-zinc-600`}>
                      <CroppedPortrait
                        src={selectedBattler.portrait?.spriteUrl || "/placeholder.svg"}
                        alt={selectedBattler.stageName}
                        size={48}
                        crop={cropSettings}
                      />
                    </div>
                    <div className="text-xs text-zinc-600 text-center mt-1">List view</div>
                  </div>

                  {/* 32x32 Preview */}
                  <div className="relative">
                    <div className="flex items-center justify-center gap-1 text-xs text-zinc-500 mb-2">
                      <Square className="w-3 h-3" />
                      <span>32×32</span>
                    </div>
                    <div className={`${getTierBgColor(selectedBattler.tier)} border-2 border-zinc-600`}>
                      <CroppedPortrait
                        src={selectedBattler.portrait?.spriteUrl || "/placeholder.svg"}
                        alt={selectedBattler.stageName}
                        size={32}
                        crop={cropSettings}
                      />
                    </div>
                    <div className="text-xs text-zinc-600 text-center mt-1">Tiny</div>
                  </div>
                </div>

                {/* Full Image Reference */}
                <div className="flex items-center justify-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs text-zinc-500 mb-2">
                      <span>Full Sprite (reference)</span>
                    </div>
                    <div className="border border-zinc-700 bg-zinc-800 p-2">
                      <Image
                        src={selectedBattler.portrait?.spriteUrl || "/placeholder.svg"}
                        alt="Full sprite"
                        width={96}
                        height={96}
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
                      max="2.5"
                      step="0.05"
                      value={cropSettings.scale}
                      onChange={(e) =>
                        setCropSettings((prev) => ({ ...prev, scale: Number.parseFloat(e.target.value) }))
                      }
                      className="w-full accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-zinc-600 mt-0.5">
                      <span>0.5x</span>
                      <span>1.0x</span>
                      <span>2.5x</span>
                    </div>
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
                    <div className="flex justify-between text-xs text-zinc-600 mt-0.5">
                      <span>←Left</span>
                      <span>Center</span>
                      <span>Right→</span>
                    </div>
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
                    <div className="flex justify-between text-xs text-zinc-600 mt-0.5">
                      <span>↑Up</span>
                      <span>Center</span>
                      <span>Down↓</span>
                    </div>
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
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Crop'}
                    </button>
                  </div>
                </div>

                {/* Sprite URL - Editable */}
                <div className="pt-4 border-t border-zinc-700">
                  <label className="text-sm text-zinc-400 block mb-1">Sprite URL (change image)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingSpriteUrl}
                      onChange={(e) => setEditingSpriteUrl(e.target.value)}
                      placeholder="/sprites/characters/sprite_xxx.png"
                      className="flex-1 bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm font-mono text-zinc-300 focus:border-orange-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSaveSpriteUrl}
                      disabled={savingSpriteUrl || editingSpriteUrl === selectedBattler.portrait?.spriteUrl}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-sm font-bold transition-colors"
                    >
                      {savingSpriteUrl ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  <div className="text-xs text-zinc-600 mt-1">
                    Enter path like: /sprites/characters/sprite_661.png
                  </div>
                </div>

                {/* Current Crop Values */}
                <div className="pt-2 border-t border-zinc-700">
                  <div className="text-xs text-zinc-500 font-mono">
                    Current: scale={cropSettings.scale.toFixed(2)}, x={cropSettings.offsetX}, y={cropSettings.offsetY}
                  </div>
                  {selectedBattler.portrait?.crop && (
                    <div className="text-xs text-zinc-600 font-mono mt-1">
                      Saved: scale={selectedBattler.portrait.crop.scale.toFixed(2)}, x={selectedBattler.portrait.crop.offsetX}, y={selectedBattler.portrait.crop.offsetY}
                    </div>
                  )}
                </div>

                {/* Destructive Crop Section */}
                <div className="pt-4 mt-4 border-t-2 border-red-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Scissors className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-bold text-red-400">DESTRUCTIVE CROP</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3">
                    Permanently crop the image file. This cannot be undone - the original pixels will be removed.
                  </p>
                  <button
                    onClick={() => setShowCropper(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 text-sm font-bold transition-colors"
                  >
                    <Crop className="w-4 h-4" />
                    Open Destructive Cropper
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">Select a battler to edit their portrait crop</div>
            )}
          </div>
        </div>
      </main>

      {/* Destructive Crop Modal */}
      {showCropper && selectedBattler && (
        <PortraitCropper
          battlerId={selectedBattler.id}
          battlerName={selectedBattler.stageName}
          spriteUrl={selectedBattler.portrait?.spriteUrl || ""}
          onComplete={() => {
            setShowCropper(false)
            // Refresh battlers to get updated image
            fetchBattlers()
          }}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  )
}
