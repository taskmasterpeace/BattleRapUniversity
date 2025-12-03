"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Upload, Trash2, Theater } from "lucide-react"
import { VENUE_TYPES, type VenueType, getTierBadgeClasses } from "@/lib/venues"

export default function DevVenuesPage() {
  const [venues, setVenues] = useState(VENUE_TYPES)
  const [selectedVenue, setSelectedVenue] = useState<VenueType | null>(null)
  const [editedName, setEditedName] = useState("")
  const [saved, setSaved] = useState(false)

  const handleSelectVenue = (venue: VenueType) => {
    setSelectedVenue(venue)
    setEditedName(venue.displayName)
    setSaved(false)
  }

  const handleSave = () => {
    if (!selectedVenue) return
    setVenues((prev) => prev.map((v) => (v.id === selectedVenue.id ? { ...v, displayName: editedName } : v)))
    setSelectedVenue({ ...selectedVenue, displayName: editedName })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dev" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">DEV: VENUE EDITOR</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Venue List */}
          <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
            <h2 className="text-sm font-bold text-zinc-400 mb-3">ALL VENUES ({venues.length})</h2>
            <div className="space-y-2">
              {venues.map((venue) => (
                <button
                  key={venue.id}
                  onClick={() => handleSelectVenue(venue)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedVenue?.id === venue.id
                      ? "bg-orange-500/10 border-orange-500/50"
                      : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{venue.displayName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${getTierBadgeClasses(venue.tier)}`}
                    >
                      {venue.tier}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">{venue.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-2">
            {selectedVenue ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-6">Edit Venue: {selectedVenue.name}</h2>

                {/* Sprite Preview */}
                <div className="mb-6">
                  <label className="block text-sm text-zinc-400 mb-2">Sprite Image</label>
                  <div className="relative aspect-[4/3] max-w-md bg-zinc-800 rounded-lg overflow-hidden">
                    <Image
                      src={`/sprites/venues/${selectedVenue.name}.png`}
                      alt={selectedVenue.displayName}
                      fill
                      className="object-cover pixelated"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Theater className="w-16 h-16 text-zinc-600" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload Sprite
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm hover:bg-red-500/30 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">Expected path: /sprites/venues/{selectedVenue.name}.png</p>
                </div>

                {/* Display Name */}
                <div className="mb-6">
                  <label className="block text-sm text-zinc-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Read-only Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Tier</label>
                    <span
                      className={`text-sm px-2 py-1 rounded border capitalize ${getTierBadgeClasses(selectedVenue.tier)}`}
                    >
                      {selectedVenue.tier}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Capacity</label>
                    <span className="text-sm">
                      {selectedVenue.baseCap} - {selectedVenue.maxCap}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Writing Mod</label>
                    <span className={`text-sm ${selectedVenue.writingMod >= 1 ? "text-green-400" : "text-red-400"}`}>
                      {selectedVenue.writingMod.toFixed(2)}x
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Performance Mod</label>
                    <span
                      className={`text-sm ${selectedVenue.performanceMod >= 1 ? "text-green-400" : "text-red-400"}`}
                    >
                      {selectedVenue.performanceMod.toFixed(2)}x
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Crowd Intensity</label>
                    <span className="text-sm">{(selectedVenue.crowdIntensity * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Payout Mod</label>
                    <span className="text-sm text-green-400">{selectedVenue.payoutMod.toFixed(2)}x</span>
                  </div>
                </div>

                {/* Vibe */}
                <div className="mb-6">
                  <label className="block text-xs text-zinc-500 mb-1">Vibe Description</label>
                  <p className="text-sm italic text-zinc-400">"{selectedVenue.vibe}"</p>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-black font-medium rounded-lg hover:bg-orange-400 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center text-zinc-500">
                Select a venue from the list to edit
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
