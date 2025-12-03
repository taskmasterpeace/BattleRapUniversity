"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Upload, Search, Grid, List, Edit2, Trash2, Plus } from "lucide-react"

// Asset categories that need management
const ASSET_CATEGORIES = [
  { id: "battlers", name: "Battlers", prefix: "sprite_", folder: "characters", count: 2 },
  { id: "leagues", name: "Leagues", prefix: "league_", folder: "leagues", count: 8 },
  { id: "bloggers", name: "Bloggers", prefix: "blogger_", folder: "bloggers", count: 0 },
  { id: "badges", name: "Badges", prefix: "badge_", folder: "badges", count: 2 },
  { id: "cities", name: "Cities", prefix: "city_", folder: "cities", count: 1 },
  { id: "venues", name: "Venues", prefix: "venue_", folder: "venues", count: 0 },
  { id: "flyers", name: "Battle Flyers", prefix: "flyer_", folder: "flyers", count: 0 },
]

interface AssetItem {
  id: string
  filename: string
  name: string
  category: string
  assignedTo?: string
  cropSettings?: {
    scale: number
    offsetX: number
    offsetY: number
  }
}

// Mock assets
const MOCK_ASSETS: AssetItem[] = [
  {
    id: "sprite_569",
    filename: "sprite_569.png",
    name: "Battler 569",
    category: "battlers",
    assignedTo: "Tech Wizard",
  },
  { id: "sprite_571", filename: "sprite_571.png", name: "Battler 571", category: "battlers" },
  {
    id: "league_089",
    filename: "league_089.png",
    name: "Stay Forever",
    category: "leagues",
    assignedTo: "Stay Forever Battle League",
  },
  {
    id: "league_090",
    filename: "league_090.png",
    name: "Bar God",
    category: "leagues",
    assignedTo: "Bar God Battle League",
  },
  { id: "league_091", filename: "league_091.png", name: "Respect The Craft", category: "leagues" },
  { id: "league_092", filename: "league_092.png", name: "Milwaukee Massacre", category: "leagues" },
  { id: "league_093", filename: "league_093.png", name: "I Do What I Want", category: "leagues" },
  { id: "league_094", filename: "league_094.png", name: "G.U.N.", category: "leagues" },
  { id: "league_095", filename: "league_095.png", name: "Underground Kings", category: "leagues" },
  { id: "league_096", filename: "league_096.png", name: "Global Word War", category: "leagues" },
  {
    id: "badge_046",
    filename: "badge_046.png",
    name: "Rebuttal King",
    category: "badges",
    assignedTo: "rebuttal-king",
  },
  {
    id: "badge_054",
    filename: "badge_054.png",
    name: "Well Researched",
    category: "badges",
    assignedTo: "well-researched",
  },
  { id: "miami-day", filename: "miami-day.png", name: "Miami Day", category: "cities", assignedTo: "miami" },
]

export default function DevAssetsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null)

  const filteredAssets = MOCK_ASSETS.filter((asset) => {
    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryFolder = (category: string) => {
    return ASSET_CATEGORIES.find((c) => c.id === category)?.folder || category
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-4">
          <Link href="/dev" className="text-zinc-400 hover:text-orange-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-display font-bold text-zinc-100 tracking-wide">ASSET MANAGER</h1>
            <p className="text-sm text-zinc-500">Manage all game sprites and images</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold uppercase text-sm">
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </header>

      <div className="flex">
        {/* Sidebar - Categories */}
        <aside className="w-64 border-r border-zinc-800 p-4 hidden md:block">
          <h2 className="text-xs font-display font-bold text-zinc-500 uppercase mb-3">Categories</h2>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left px-3 py-2 text-sm font-display ${
                selectedCategory === "all"
                  ? "bg-orange-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              All Assets ({MOCK_ASSETS.length})
            </button>
            {ASSET_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-3 py-2 text-sm font-display flex justify-between ${
                  selectedCategory === cat.id
                    ? "bg-orange-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-xs opacity-60">{MOCK_ASSETS.filter((a) => a.category === cat.id).length}</span>
              </button>
            ))}
          </div>

          {/* Quick Links */}
          <h2 className="text-xs font-display font-bold text-zinc-500 uppercase mb-3 mt-6">Quick Edit</h2>
          <div className="space-y-1">
            <Link
              href="/dev/battlers"
              className="block px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Battler Editor
            </Link>
            <Link
              href="/dev/leagues"
              className="block px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              League Editor
            </Link>
            <Link
              href="/dev/bloggers"
              className="block px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Blogger Editor
            </Link>
            <Link
              href="/dev/venues"
              className="block px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Venue Editor
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {/* Search and View Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1 bg-zinc-800 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-orange-600 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-orange-600 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Asset Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Add New Button */}
              <button className="aspect-square bg-zinc-900 border-2 border-dashed border-zinc-700 hover:border-orange-500 flex flex-col items-center justify-center gap-2 transition-colors">
                <Plus className="w-8 h-8 text-zinc-600" />
                <span className="text-xs text-zinc-500 font-display">Add Asset</span>
              </button>

              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`aspect-square bg-zinc-900 border-2 ${
                    selectedAsset?.id === asset.id ? "border-orange-500" : "border-zinc-700 hover:border-zinc-600"
                  } p-2 cursor-pointer transition-colors group relative`}
                >
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    <Image
                      src={`/sprites/${getCategoryFolder(asset.category)}/${asset.filename}`}
                      alt={asset.name}
                      width={120}
                      height={120}
                      className="object-contain pixelated"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/sparkling-sprite.png"
                      }}
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-zinc-900/90 p-1 text-center">
                    <div className="text-xs text-white font-display truncate">{asset.id}</div>
                    {asset.assignedTo && <div className="text-[10px] text-orange-500 truncate">{asset.assignedTo}</div>}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button className="p-1 bg-zinc-800 hover:bg-orange-600 text-white">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button className="p-1 bg-zinc-800 hover:bg-red-600 text-white">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-700">
              {filteredAssets.map((asset, i) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`flex items-center gap-4 p-3 cursor-pointer ${
                    i !== filteredAssets.length - 1 ? "border-b border-zinc-800" : ""
                  } ${selectedAsset?.id === asset.id ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
                >
                  <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center overflow-hidden">
                    <Image
                      src={`/sprites/${getCategoryFolder(asset.category)}/${asset.filename}`}
                      alt={asset.name}
                      width={48}
                      height={48}
                      className="object-contain pixelated"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/sparkling-sprite.png"
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-display font-bold text-white">{asset.id}</div>
                    <div className="text-xs text-zinc-500">{asset.category}</div>
                  </div>
                  {asset.assignedTo && <div className="text-xs text-orange-500">{asset.assignedTo}</div>}
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-orange-600 text-zinc-400 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Right Sidebar - Asset Details */}
        {selectedAsset && (
          <aside className="w-80 border-l border-zinc-800 p-4 hidden lg:block">
            <h2 className="text-xs font-display font-bold text-zinc-500 uppercase mb-3">Asset Details</h2>

            {/* Preview */}
            <div className="bg-zinc-900 border border-zinc-700 p-4 mb-4">
              <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden mb-3">
                <Image
                  src={`/sprites/${getCategoryFolder(selectedAsset.category)}/${selectedAsset.filename}`}
                  alt={selectedAsset.name}
                  width={200}
                  height={200}
                  className="object-contain pixelated"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/sparkling-sprite.png"
                  }}
                />
              </div>
              <div className="text-center">
                <div className="font-display font-bold text-white">{selectedAsset.id}</div>
                <div className="text-xs text-zinc-500">{selectedAsset.filename}</div>
              </div>
            </div>

            {/* Edit Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Display Name</label>
                <input
                  type="text"
                  defaultValue={selectedAsset.name}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Assigned To</label>
                <input
                  type="text"
                  defaultValue={selectedAsset.assignedTo || ""}
                  placeholder="Not assigned"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Crop Controls */}
              <div>
                <label className="block text-xs text-zinc-500 mb-2">Crop Settings</label>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Scale</span>
                      <span>{selectedAsset.cropSettings?.scale || 1.0}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      defaultValue={selectedAsset.cropSettings?.scale || 1}
                      className="w-full accent-orange-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Offset X</span>
                      <span>{selectedAsset.cropSettings?.offsetX || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      defaultValue={selectedAsset.cropSettings?.offsetX || 0}
                      className="w-full accent-orange-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Offset Y</span>
                      <span>{selectedAsset.cropSettings?.offsetY || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      defaultValue={selectedAsset.cropSettings?.offsetY || 0}
                      className="w-full accent-orange-500"
                    />
                  </div>
                </div>
              </div>

              <button className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold uppercase text-sm">
                Save Changes
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
