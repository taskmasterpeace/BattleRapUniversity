"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Upload, Search, Grid, List, Edit2, Trash2, Plus, Crop, AlertCircle, Check, X, RefreshCw, FolderOpen, Layers, FileImage } from "lucide-react"
import { ASSET_TYPES, AssetType } from "@/lib/game/assetTypes"
import { AssetCropper, CropData } from "@/components/dev/asset-cropper"
import { SpriteSheetExtractor, ExtractedSprite } from "@/components/dev/sprite-sheet-extractor"

// Asset categories that need management
const ASSET_CATEGORIES = [
  { id: "battlers", name: "Battler Portraits", assetType: "battler_portrait", folder: "characters" },
  { id: "cities", name: "City Backgrounds", assetType: "city_background", folder: "cities" },
  { id: "venues", name: "Venue Backgrounds", assetType: "venue_background", folder: "venues" },
  { id: "crowd", name: "Crowd Members", assetType: "crowd_member", folder: "crowd" },
  { id: "leagues", name: "League Logos", assetType: "league_logo", folder: "leagues" },
  { id: "badges", name: "Badge Icons", assetType: "badge_icon", folder: "badges" },
]

interface AssetItem {
  id: string
  filename: string
  path: string  // Full path to sprite
  name: string
  category: string
  assetTypeId: string
  assignedTo?: string
  needsCrop?: boolean  // Flag if dimensions don't match recommended
}

// Generate asset list from actual sprite folders
function generateAssetId(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
}

// These will be populated dynamically, but start with known assets
const INITIAL_ASSETS: AssetItem[] = [
  // Battler portraits - will scan public/sprites/characters
  { id: "sprite_569", filename: "sprite_569.png", path: "/sprites/characters/sprite_569.png", name: "Battler 569", category: "battlers", assetTypeId: "battler_portrait", assignedTo: "Tech Wizard" },
  { id: "sprite_571", filename: "sprite_571.png", path: "/sprites/characters/sprite_571.png", name: "Battler 571", category: "battlers", assetTypeId: "battler_portrait" },

  // City backgrounds - will scan public/sprites/cities
  { id: "miami-day", filename: "miami-day.png", path: "/sprites/cities/miami-day.png", name: "Miami Day", category: "cities", assetTypeId: "city_background", assignedTo: "miami" },
  { id: "new-york-day", filename: "new-york-day.png", path: "/sprites/cities/new-york-day.png", name: "New York Day", category: "cities", assetTypeId: "city_background" },
  { id: "atlanta-dusk", filename: "atlanta-dusk.png", path: "/sprites/cities/atlanta-dusk.png", name: "Atlanta Dusk", category: "cities", assetTypeId: "city_background" },
  { id: "chicago-day", filename: "chicago-day.png", path: "/sprites/cities/chicago-day.png", name: "Chicago Day", category: "cities", assetTypeId: "city_background" },
  { id: "los-angeles-night", filename: "los-angeles-night.png", path: "/sprites/cities/los-angeles-night.png", name: "Los Angeles Night", category: "cities", assetTypeId: "city_background" },

  // Venues - will scan public/sprites/venues
  { id: "venue_small_room_01", filename: "small_room_01.png", path: "/sprites/venues/small_room_01.png", name: "Small Room 01", category: "venues", assetTypeId: "venue_background" },

  // Crowd - will scan public/sprites/crowd
  { id: "crowd_black_cheer_001", filename: "cheer_001.png", path: "/sprites/crowd/black/cheer_001.png", name: "Cheer Black 001", category: "crowd", assetTypeId: "crowd_member" },
  { id: "crowd_white_hype_005", filename: "hype_005.png", path: "/sprites/crowd/white/hype_005.png", name: "Hype White 005", category: "crowd", assetTypeId: "crowd_member" },
]

export default function DevAssetsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null)
  const [assets, setAssets] = useState<AssetItem[]>(INITIAL_ASSETS)

  // Cropper state
  const [showCropper, setShowCropper] = useState(false)
  const [cropperAsset, setCropperAsset] = useState<AssetItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null)

  // Sprite sheet extractor state
  const [showExtractor, setShowExtractor] = useState(false)
  const [extractStatus, setExtractStatus] = useState<{ success: boolean; message: string } | null>(null)

  // Filter assets based on category and search
  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryFolder = (category: string) => {
    return ASSET_CATEGORIES.find((c) => c.id === category)?.folder || category
  }

  const getAssetType = (assetTypeId: string): AssetType | undefined => {
    return ASSET_TYPES[assetTypeId]
  }

  // Open cropper for an asset
  const openCropper = (asset: AssetItem) => {
    setCropperAsset(asset)
    setShowCropper(true)
    setSaveStatus(null)
  }

  // Close cropper
  const closeCropper = () => {
    setShowCropper(false)
    setCropperAsset(null)
  }

  // Handle crop save
  const handleCropSave = async (cropData: CropData) => {
    if (!cropperAsset) return

    setIsSaving(true)
    setSaveStatus(null)

    try {
      const response = await fetch('/api/dev/assets/crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: cropperAsset.path,
          assetTypeId: cropperAsset.assetTypeId,
          crop: cropData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSaveStatus({ success: true, message: `${result.message}` })
        // Close after a brief delay
        setTimeout(() => {
          closeCropper()
          // Force refresh the image by adding timestamp
          setAssets(prev => prev.map(a =>
            a.id === cropperAsset.id
              ? { ...a, path: `${a.path}?t=${Date.now()}` }
              : a
          ))
        }, 1500)
      } else {
        setSaveStatus({ success: false, message: result.error || 'Crop failed' })
      }
    } catch (error) {
      setSaveStatus({ success: false, message: 'Network error' })
    } finally {
      setIsSaving(false)
    }
  }

  // Get asset counts per category
  const getAssetCount = (categoryId: string) => {
    if (categoryId === 'all') return assets.length
    return assets.filter(a => a.category === categoryId).length
  }

  // Handle sprite extraction
  const handleSpriteExtract = async (sprite: ExtractedSprite, assetTypeId: string, filename: string) => {
    setExtractStatus(null)
    setIsSaving(true)

    try {
      const response = await fetch('/api/dev/assets/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: sprite.dataUrl,
          assetTypeId,
          filename,
          resize: true,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setExtractStatus({ success: true, message: result.message })
        // Add to assets list
        const assetType = ASSET_TYPES[assetTypeId]
        const category = ASSET_CATEGORIES.find(c => c.assetType === assetTypeId)
        if (assetType && category) {
          setAssets(prev => [...prev, {
            id: result.output.filename.replace('.png', ''),
            filename: result.output.filename,
            path: result.output.path,
            name: filename,
            category: category.id,
            assetTypeId,
          }])
        }
        // Close extractor after success
        setTimeout(() => {
          setShowExtractor(false)
          setExtractStatus(null)
        }, 1500)
      } else {
        setExtractStatus({ success: false, message: result.error || 'Extraction failed' })
      }
    } catch (error) {
      setExtractStatus({ success: false, message: 'Network error' })
    } finally {
      setIsSaving(false)
    }
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExtractor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-display font-bold uppercase text-sm"
          >
            <Layers className="w-4 h-4" />
            Sprite Sheet
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold uppercase text-sm">
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
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
              All Assets ({getAssetCount('all')})
            </button>
            {ASSET_CATEGORIES.map((cat) => {
              const assetType = ASSET_TYPES[cat.assetType]
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 text-sm font-display flex justify-between ${
                    selectedCategory === cat.id
                      ? "bg-orange-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {cat.name}
                    <span className="text-[10px] text-zinc-600">{assetType?.aspectRatioLabel}</span>
                  </span>
                  <span className="text-xs opacity-60">{getAssetCount(cat.id)}</span>
                </button>
              )
            })}
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

              {filteredAssets.map((asset) => {
                const assetType = getAssetType(asset.assetTypeId)
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`aspect-square bg-zinc-900 border-2 ${
                      selectedAsset?.id === asset.id ? "border-orange-500" : "border-zinc-700 hover:border-zinc-600"
                    } p-2 cursor-pointer transition-colors group relative`}
                  >
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                      <Image
                        src={asset.path}
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
                      <div className="flex items-center justify-center gap-2">
                        {asset.assignedTo && <span className="text-[10px] text-orange-500 truncate">{asset.assignedTo}</span>}
                        {assetType && <span className="text-[10px] text-zinc-600">{assetType.aspectRatioLabel}</span>}
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openCropper(asset)
                        }}
                        className="p-1 bg-zinc-800 hover:bg-blue-600 text-white"
                        title="Crop Image"
                      >
                        <Crop className="w-3 h-3" />
                      </button>
                      <button className="p-1 bg-zinc-800 hover:bg-orange-600 text-white" title="Edit Details">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button className="p-1 bg-zinc-800 hover:bg-red-600 text-white" title="Delete">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-700">
              {filteredAssets.map((asset, i) => {
                const assetType = getAssetType(asset.assetTypeId)
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`flex items-center gap-4 p-3 cursor-pointer ${
                      i !== filteredAssets.length - 1 ? "border-b border-zinc-800" : ""
                    } ${selectedAsset?.id === asset.id ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
                  >
                    <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center overflow-hidden">
                      <Image
                        src={asset.path}
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
                      <div className="text-xs text-zinc-500 flex gap-2">
                        <span>{asset.category}</span>
                        {assetType && <span className="text-zinc-600">• {assetType.aspectRatioLabel}</span>}
                      </div>
                    </div>
                    {asset.assignedTo && <div className="text-xs text-orange-500">{asset.assignedTo}</div>}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openCropper(asset)
                        }}
                        className="p-2 hover:bg-blue-600 text-zinc-400 hover:text-white transition-colors"
                        title="Crop Image"
                      >
                        <Crop className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-orange-600 text-zinc-400 hover:text-white transition-colors" title="Edit Details">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
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
                  src={selectedAsset.path}
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

            {/* Asset Type Info */}
            {(() => {
              const assetType = getAssetType(selectedAsset.assetTypeId)
              return assetType && (
                <div className="bg-zinc-900 border border-zinc-700 p-3 mb-4">
                  <div className="text-xs text-zinc-500 mb-2">Asset Type</div>
                  <div className="font-display font-bold text-white text-sm">{assetType.name}</div>
                  <div className="text-xs text-zinc-400 mt-1">{assetType.description}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <div>
                      <span className="text-zinc-500">Ratio: </span>
                      <span className="text-orange-400">{assetType.aspectRatioLabel}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Size: </span>
                      <span className="text-orange-400">{assetType.recommendedWidth}×{assetType.recommendedHeight}</span>
                    </div>
                  </div>
                </div>
              )
            })()}

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

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openCropper(selectedAsset)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-display font-bold uppercase text-sm flex items-center justify-center gap-2"
                >
                  <Crop className="w-4 h-4" />
                  Crop
                </button>
                <button className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white font-display font-bold uppercase text-sm">
                  Save
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Cropper Modal */}
      {showCropper && cropperAsset && (() => {
        const assetType = getAssetType(cropperAsset.assetTypeId)
        return assetType && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border-2 border-zinc-700 max-w-4xl w-full max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
                <div>
                  <h3 className="font-display font-bold text-white">CROP: {cropperAsset.name}</h3>
                  <div className="text-xs text-zinc-500">
                    Target: {assetType.name} ({assetType.aspectRatioLabel}) - {assetType.recommendedWidth}×{assetType.recommendedHeight}px
                  </div>
                </div>
                <button
                  onClick={closeCropper}
                  className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Messages */}
              {saveStatus && (
                <div className={`px-4 py-2 text-sm ${saveStatus.success ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                  {saveStatus.success ? <Check className="w-4 h-4 inline mr-2" /> : <AlertCircle className="w-4 h-4 inline mr-2" />}
                  {saveStatus.message}
                </div>
              )}

              {/* Cropper Component */}
              <div className="flex-1 overflow-auto p-4">
                <AssetCropper
                  imageUrl={cropperAsset.path.split('?')[0]} // Remove cache-busting query
                  assetType={assetType}
                  entityId={cropperAsset.id}
                  entityName={cropperAsset.name}
                  onSave={handleCropSave}
                  onCancel={closeCropper}
                />
              </div>

              {/* Loading Overlay */}
              {isSaving && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white font-display flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Cropping...
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Sprite Sheet Extractor Modal */}
      {showExtractor && (
        <SpriteSheetExtractor
          onExtract={handleSpriteExtract}
          onClose={() => {
            setShowExtractor(false)
            setExtractStatus(null)
          }}
        />
      )}

      {/* Extract Status Toast */}
      {extractStatus && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-2 ${
          extractStatus.success ? 'bg-green-600' : 'bg-red-600'
        } text-white font-display`}>
          {extractStatus.success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {extractStatus.message}
        </div>
      )}
    </div>
  )
}
