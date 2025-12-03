"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Upload, Trash2, Search, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { BLOGGERS, type Blogger } from "@/lib/bloggers"

export default function DevBloggersPage() {
  const [selectedBlogger, setSelectedBlogger] = useState<Blogger | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [editedName, setEditedName] = useState("")
  const [editedTitle, setEditedTitle] = useState("")
  const [editedBio, setEditedBio] = useState("")
  const [avatarId, setAvatarId] = useState("")
  const [avatarCrop, setAvatarCrop] = useState({ scale: 1, offsetX: 0, offsetY: 0 })
  const [logs, setLogs] = useState<string[]>([])

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
    setEditedName(blogger.name)
    setEditedTitle(blogger.title)
    setEditedBio(blogger.bio)
    setAvatarId(blogger.avatarId || "")
    setAvatarCrop(blogger.avatarCrop || { scale: 1, offsetX: 0, offsetY: 0 })
    addLog(`Selected blogger: ${blogger.name}`)
  }

  const handleSave = () => {
    if (!selectedBlogger) return
    addLog(`Saved changes to ${selectedBlogger.name}`)
    addLog(`  - Name: ${editedName}`)
    addLog(`  - Title: ${editedTitle}`)
    addLog(`  - Avatar ID: ${avatarId || "none"}`)
    addLog(`  - Crop: scale=${avatarCrop.scale}, x=${avatarCrop.offsetX}, y=${avatarCrop.offsetY}`)
  }

  // Placeholder blogger avatar sprites (would be real sprites)
  const availableAvatars = [
    "blogger_001",
    "blogger_002",
    "blogger_003",
    "blogger_004",
    "blogger_005",
    "blogger_006",
    "blogger_007",
    "blogger_008",
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
              <h1 className="text-xl font-black uppercase text-orange-500">Blogger Editor</h1>
              <p className="text-xs text-zinc-500">Edit blogger names, avatars, and bios</p>
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
                      <div className="font-bold text-sm truncate">{blogger.name}</div>
                      <div className="text-xs text-zinc-500 truncate">{blogger.specialty}</div>
                    </div>
                    {blogger.avatarId && <span className="text-xs text-green-500">Has Avatar</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-2">
            {selectedBlogger ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
                {/* Blogger Preview */}
                <div className="flex items-center gap-6 pb-6 border-b border-zinc-800">
                  <div
                    className="w-24 h-24 rounded-full border-2 overflow-hidden bg-zinc-800 flex items-center justify-center"
                    style={{ borderColor: selectedBlogger.color }}
                  >
                    {avatarId ? (
                      <div
                        className="w-full h-full relative"
                        style={{
                          transform: `scale(${avatarCrop.scale}) translate(${avatarCrop.offsetX}px, ${avatarCrop.offsetY}px)`,
                        }}
                      >
                        <Image
                          src={`/sprites/bloggers/${avatarId}.png`}
                          alt="Blogger avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-4xl">{selectedBlogger.icon}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{editedName}</h2>
                    <p className="text-zinc-400">{editedTitle}</p>
                    <div className="flex gap-2 mt-2">
                      <span
                        className="px-2 py-0.5 text-xs font-bold rounded"
                        style={{ backgroundColor: `${selectedBlogger.color}30`, color: selectedBlogger.color }}
                      >
                        {selectedBlogger.specialty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                  />
                </div>

                {/* Avatar Selection */}
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
                          setAvatarId(id)
                          addLog(`Assigned avatar ${id} to ${selectedBlogger.name}`)
                        }}
                        className={`aspect-square rounded-full border-2 overflow-hidden transition-all bg-zinc-800 flex items-center justify-center ${
                          avatarId === id
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
                      setAvatarId("")
                      addLog(`Removed avatar from ${selectedBlogger.name}`)
                    }}
                    className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Avatar
                  </Button>
                </div>

                {/* Avatar Crop Controls */}
                {avatarId && (
                  <div className="space-y-4 p-4 bg-zinc-800/50 rounded-lg">
                    <Label className="flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      Avatar Crop / Position
                    </Label>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Scale</span>
                          <span>{avatarCrop.scale.toFixed(2)}x</span>
                        </div>
                        <Slider
                          value={[avatarCrop.scale]}
                          onValueChange={([v]) => setAvatarCrop((prev) => ({ ...prev, scale: v }))}
                          min={0.5}
                          max={2}
                          step={0.05}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Offset X</span>
                          <span>{avatarCrop.offsetX}px</span>
                        </div>
                        <Slider
                          value={[avatarCrop.offsetX]}
                          onValueChange={([v]) => setAvatarCrop((prev) => ({ ...prev, offsetX: v }))}
                          min={-50}
                          max={50}
                          step={1}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Offset Y</span>
                          <span>{avatarCrop.offsetY}px</span>
                        </div>
                        <Slider
                          value={[avatarCrop.offsetY]}
                          onValueChange={([v]) => setAvatarCrop((prev) => ({ ...prev, offsetY: v }))}
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
                  <span className="text-4xl mb-4 block">📝</span>
                  <p>Select a blogger from the list to edit</p>
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
