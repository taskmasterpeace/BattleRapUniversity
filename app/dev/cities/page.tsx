"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Search, MapPin, Users, Star } from "lucide-react"
import { CITIES, type CityData } from "@/lib/cities"

export default function DevCitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null)

  const filteredCities = CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.region.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-900">
        <Link href="/dev" className="text-zinc-400 hover:text-orange-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-display font-bold text-zinc-100 tracking-wide">CITY EDITOR</h1>
          <p className="text-sm text-zinc-500">Manage cities and backdrops</p>
        </div>
      </header>

      <div className="flex">
        {/* City List */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Cities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCities.map((city) => (
              <div
                key={city.slug}
                onClick={() => setSelectedCity(city)}
                className={`bg-zinc-900 border-2 ${
                  selectedCity?.slug === city.slug ? "border-orange-500" : "border-zinc-700 hover:border-zinc-600"
                } cursor-pointer transition-colors overflow-hidden`}
              >
                {/* Backdrop Preview */}
                <div className="aspect-[21/9] bg-zinc-800 relative">
                  <Image
                    src={city.backdropSprite || "/placeholder-city-backdrop-16x9.jpg"}
                    alt={city.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder-city-backdrop-16x9.jpg"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <div className="font-display font-bold text-white">{city.name}</div>
                    <div className="text-xs text-zinc-400">
                      {city.state}, {city.countryCode}
                    </div>
                  </div>
                </div>

                {/* City Info */}
                <div className="p-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {city.region}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {(city.population / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                        city.sceneSize === "major"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : city.sceneSize === "large"
                            ? "bg-orange-500/20 text-orange-500"
                            : city.sceneSize === "medium"
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-zinc-500/20 text-zinc-400"
                      }`}
                    >
                      {city.sceneSize}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400">{city.cultureStyle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected City Editor */}
        {selectedCity && (
          <aside className="w-96 border-l border-zinc-800 p-4 hidden lg:block">
            <h2 className="text-xs font-display font-bold text-zinc-500 uppercase mb-3">Edit City</h2>

            {/* Large Backdrop Preview */}
            <div className="aspect-video bg-zinc-800 relative mb-4 overflow-hidden">
              <Image
                src={selectedCity.backdropSprite || "/placeholder-city-backdrop-16x9.jpg"}
                alt={selectedCity.name}
                fill
                className="object-cover"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                <span className="px-4 py-2 bg-orange-600 text-white font-display font-bold text-sm">
                  Change Backdrop
                </span>
              </button>
            </div>

            {/* Edit Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">City Name</label>
                <input
                  type="text"
                  defaultValue={selectedCity.name}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">State</label>
                  <input
                    type="text"
                    defaultValue={selectedCity.state}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Country</label>
                  <input
                    type="text"
                    defaultValue={selectedCity.countryCode}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Region</label>
                <select
                  defaultValue={selectedCity.region}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="east-coast">East Coast</option>
                  <option value="west-coast">West Coast</option>
                  <option value="midwest">Midwest</option>
                  <option value="south">South</option>
                  <option value="southwest">Southwest</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Scene Size</label>
                <select
                  defaultValue={selectedCity.sceneSize}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="major">Major</option>
                  <option value="large">Large</option>
                  <option value="medium">Medium</option>
                  <option value="small">Small</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Culture Style</label>
                <input
                  type="text"
                  defaultValue={selectedCity.cultureStyle}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Population</label>
                <input
                  type="number"
                  defaultValue={selectedCity.population}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    defaultValue={selectedCity.latitude}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    defaultValue={selectedCity.longitude}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Regional Badges */}
              <div>
                <label className="block text-xs text-zinc-500 mb-2">Regional Badges</label>
                <div className="space-y-2">
                  {selectedCity.regionalBadges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-zinc-800 border border-zinc-700">
                      <Star className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-white">{badge.name}</span>
                    </div>
                  ))}
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
