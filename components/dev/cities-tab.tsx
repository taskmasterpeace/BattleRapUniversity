"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, ImageIcon, Check, X, RefreshCw, Users, AlertTriangle, Upload, Crop, Eye, Plus } from "lucide-react"
import { CitySpriteCropper } from "./city-sprite-cropper"

interface CityData {
  id: string
  name: string
  state: string
  region: string
  battlers: { id: string; stageName: string }[]
  spritePrefix: string | null
  sprites: string[] // List of available sprite files
}

interface CitiesResponse {
  cities: CityData[]
  stats: {
    totalCities: number
    citiesWithSprites: number
    citiesMissingSprites: number
  }
  spriteInfo: {
    size: string
    directory: string
    format: string
  }
}

export function CitiesTab() {
  const [data, setData] = useState<CitiesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "with-sprites" | "missing">("all")
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const [cropperFile, setCropperFile] = useState<File | null>(null)
  const [cropperPrefix, setCropperPrefix] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchCities = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cities')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCities()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingFor) return

    // Open cropper with the selected file
    setCropperFile(file)
    setCropperPrefix(uploadingFor)
    setUploadingFor(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCropComplete = async () => {
    setCropperFile(null)
    setCropperPrefix(null)
    await fetchCities()
  }

  const handleCropCancel = () => {
    setCropperFile(null)
    setCropperPrefix(null)
  }

  if (loading) {
    return (
      <div className="bg-zinc-900 border-2 border-zinc-700 p-8 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchCities}
          className="mt-4 px-4 py-2 bg-orange-500 text-white font-display text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  // Filter cities based on selection
  const filteredCities = data.cities.filter(city => {
    if (filter === "with-sprites") return city.sprites.length > 0
    if (filter === "missing") return city.sprites.length === 0
    return true
  })

  // Group by region for display
  const byRegion = filteredCities.reduce((acc, city) => {
    const region = city.region || 'Unknown'
    if (!acc[region]) acc[region] = []
    acc[region].push(city)
    return acc
  }, {} as Record<string, CityData[]>)

  const regionOrder = ['East Coast', 'West Coast', 'Midwest', 'South', 'Canada', 'International', 'Unknown']
  const sortedRegions = Object.keys(byRegion).sort((a, b) => {
    const aIdx = regionOrder.indexOf(a)
    const bIdx = regionOrder.indexOf(b)
    if (aIdx === -1 && bIdx === -1) return a.localeCompare(b)
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  })

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Cropper Modal */}
      {cropperFile && cropperPrefix && (
        <CitySpriteCropper
          file={cropperFile}
          cityPrefix={cropperPrefix}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Sprite Specs & Stats */}
      <div className="bg-zinc-900 border-2 border-zinc-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-display font-bold text-orange-500 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> CITY SPRITES
          </h3>
          <div className="text-xs text-zinc-500 font-mono">
            512×512 PNG • /sprites/cities/
          </div>
        </div>

        {/* Quick Stats as Clickable Filters */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`p-3 border text-center transition-colors ${
              filter === "all"
                ? "bg-orange-500/20 border-orange-500 text-orange-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <div className="text-2xl font-display font-bold">{data.stats.totalCities}</div>
            <div className="text-xs uppercase">Total Cities</div>
          </button>
          <button
            onClick={() => setFilter("with-sprites")}
            className={`p-3 border text-center transition-colors ${
              filter === "with-sprites"
                ? "bg-green-500/20 border-green-500 text-green-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <div className="text-2xl font-display font-bold text-green-400">{data.stats.citiesWithSprites}</div>
            <div className="text-xs uppercase">Have Sprites</div>
          </button>
          <button
            onClick={() => setFilter("missing")}
            className={`p-3 border text-center transition-colors ${
              filter === "missing"
                ? "bg-red-500/20 border-red-500 text-red-400"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <div className="text-2xl font-display font-bold text-red-400">{data.stats.citiesMissingSprites}</div>
            <div className="text-xs uppercase">Missing</div>
          </button>
        </div>
      </div>

      {/* Cities List */}
      <div className="bg-zinc-900 border-2 border-zinc-700">
        <div className="p-3 border-b border-zinc-700 flex items-center justify-between">
          <h3 className="text-sm font-display font-bold text-zinc-300">
            {filter === "all" ? "ALL" : filter === "with-sprites" ? "WITH SPRITES" : "MISSING SPRITES"} ({filteredCities.length})
          </h3>
          <button
            onClick={fetchCities}
            className="p-1.5 text-zinc-500 hover:text-orange-500"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {sortedRegions.map(region => (
            <div key={region}>
              {/* Region Header */}
              <div className="px-3 py-2 bg-zinc-800/50 border-b border-zinc-700 sticky top-0">
                <span className="text-xs font-display font-bold text-zinc-500 uppercase">{region}</span>
                <span className="text-xs text-zinc-600 ml-2">({byRegion[region].length})</span>
              </div>

              {/* Cities in Region */}
              {byRegion[region]
                .sort((a, b) => b.battlers.length - a.battlers.length)
                .map(city => (
                <div
                  key={`${city.name}-${city.state}`}
                  className={`flex items-center gap-3 px-3 py-2 border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer ${
                    selectedCity?.id === city.id ? 'bg-orange-500/10' : ''
                  }`}
                  onClick={() => setSelectedCity(selectedCity?.id === city.id ? null : city)}
                >
                  {/* Sprite Preview Thumbnail */}
                  <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 flex-shrink-0 overflow-hidden">
                    {city.sprites.length > 0 ? (
                      <img
                        src={`/sprites/cities/${city.sprites[0]}`}
                        alt={city.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* City Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-100 font-medium truncate">{city.name}</span>
                      <span className="text-xs text-zinc-500">{city.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {city.battlers.length}
                      </span>
                      {city.sprites.length > 0 && (
                        <span className="text-green-500">{city.sprites.length} sprite{city.sprites.length > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {city.sprites.length > 0 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-400/50" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Selected City Details */}
      {selectedCity && (
        <div className="bg-zinc-900 border-2 border-orange-500/50 p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-orange-500">
                {selectedCity.name}, {selectedCity.state}
              </h3>
              <p className="text-xs text-zinc-500">
                {selectedCity.region} • {selectedCity.battlers.length} battler{selectedCity.battlers.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => {
                setUploadingFor(selectedCity.spritePrefix || selectedCity.name.toLowerCase().replace(/\s+/g, '-'))
                fileInputRef.current?.click()
              }}
              className="px-3 py-1.5 bg-orange-500 text-white text-sm font-display flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Add Sprite
            </button>
          </div>

          {/* Sprite prefix info */}
          <div className="mb-4 p-2 bg-zinc-800 border border-zinc-700 text-xs">
            <span className="text-zinc-500">Sprite prefix: </span>
            <span className="text-zinc-300 font-mono">
              {selectedCity.spritePrefix || selectedCity.name.toLowerCase().replace(/\s+/g, '-')}
            </span>
          </div>

          {/* Battlers from this city */}
          <div className="mb-4">
            <h4 className="text-xs text-zinc-500 uppercase mb-2">Battlers</h4>
            <div className="flex flex-wrap gap-1">
              {selectedCity.battlers.map((battler) => (
                <span key={battler.id} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-xs">
                  {battler.stageName}
                </span>
              ))}
            </div>
          </div>

          {/* Current Sprites */}
          {selectedCity.sprites.length > 0 && (
            <div>
              <h4 className="text-xs text-zinc-500 uppercase mb-2">Sprites ({selectedCity.sprites.length})</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {selectedCity.sprites.map((sprite) => (
                  <div key={sprite} className="relative group">
                    <div className="aspect-square bg-zinc-800 border border-zinc-700 overflow-hidden">
                      <img
                        src={`/sprites/cities/${sprite}`}
                        alt={sprite}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-zinc-300 font-mono px-1 text-center break-all">
                        {sprite.replace('.png', '')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No sprites message */}
          {selectedCity.sprites.length === 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-center">
              <ImageIcon className="w-8 h-8 text-red-400/50 mx-auto mb-2" />
              <p className="text-sm text-red-400">No sprites for this city</p>
              <p className="text-xs text-zinc-500 mt-1">
                Upload a 512×512 PNG to add one
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
