"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { MapPin, Check } from "lucide-react"

// Import static US cities data (7,172 cities with pop >= 5000)
// Generated from all-the-cities npm package
import usCitiesData from "@/lib/us-cities-data.json"

// State to Region mapping (exported for use elsewhere)
export const STATE_TO_REGION: Record<string, string> = {
  // Northeast
  CT: "Northeast", DE: "Northeast", MA: "Northeast", MD: "Northeast", ME: "Northeast",
  NH: "Northeast", NJ: "Northeast", NY: "Northeast", PA: "Northeast", RI: "Northeast",
  VT: "Northeast", DC: "Northeast",
  // Southeast
  AL: "Southeast", AR: "Southeast", FL: "Southeast", GA: "Southeast", KY: "Southeast",
  LA: "Southeast", MS: "Southeast", NC: "Southeast", SC: "Southeast", TN: "Southeast",
  VA: "Southeast", WV: "Southeast",
  // Midwest
  IA: "Midwest", IL: "Midwest", IN: "Midwest", KS: "Midwest", MI: "Midwest",
  MN: "Midwest", MO: "Midwest", ND: "Midwest", NE: "Midwest", OH: "Midwest",
  SD: "Midwest", WI: "Midwest",
  // Southwest
  AZ: "Southwest", NM: "Southwest", OK: "Southwest", TX: "Southwest",
  // West
  AK: "West", CA: "West", CO: "West", HI: "West", ID: "West", MT: "West",
  NV: "West", OR: "West", UT: "West", WA: "West", WY: "West",
}

// State to Timezone mapping (exported for use elsewhere)
export const STATE_TO_TIMEZONE: Record<string, string> = {
  // Eastern
  CT: "Eastern", DE: "Eastern", DC: "Eastern", FL: "Eastern", GA: "Eastern",
  IN: "Eastern", KY: "Eastern", MA: "Eastern", MD: "Eastern", ME: "Eastern",
  MI: "Eastern", NC: "Eastern", NH: "Eastern", NJ: "Eastern", NY: "Eastern",
  OH: "Eastern", PA: "Eastern", RI: "Eastern", SC: "Eastern", VA: "Eastern",
  VT: "Eastern", WV: "Eastern",
  // Central
  AL: "Central", AR: "Central", IA: "Central", IL: "Central", KS: "Central",
  LA: "Central", MN: "Central", MO: "Central", MS: "Central", ND: "Central",
  NE: "Central", OK: "Central", SD: "Central", TN: "Central", TX: "Central",
  WI: "Central",
  // Mountain
  AZ: "Mountain", CO: "Mountain", ID: "Mountain", MT: "Mountain", NM: "Mountain",
  UT: "Mountain", WY: "Mountain",
  // Pacific
  CA: "Pacific", NV: "Pacific", OR: "Pacific", WA: "Pacific",
  // Alaska/Hawaii
  AK: "Alaska", HI: "Hawaii",
}

// Type for city data from JSON
interface USCityRaw {
  id: number
  name: string
  state: string
  population: number
  region: string
  lat: number
  lng: number
  timeZone: string
}

// US Cities data - already sorted by population (largest first)
const US_CITIES: USCityRaw[] = usCitiesData as USCityRaw[]

export interface CityData {
  cityId?: number
  name: string
  state: string
  population: number
  region: string
  coordinates: [number, number]
  timeZone: string
}

interface CityAutocompleteProps {
  value: CityData | null
  onChange: (city: CityData | null) => void
  placeholder?: string
  error?: boolean
}

export function CityAutocomplete({
  value,
  onChange,
  placeholder = "Search for your city...",
  error,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value ? `${value.name}, ${value.state}` : "")
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filteredCities = useMemo(() => {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    return US_CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(lowerQuery) ||
        city.state.toLowerCase().includes(lowerQuery) ||
        `${city.name}, ${city.state}`.toLowerCase().includes(lowerQuery),
    ).slice(0, 10) // Limit to 10 results
  }, [query])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredCities])

  const handleSelect = (city: USCityRaw) => {
    const cityData: CityData = {
      cityId: city.id,
      name: city.name,
      state: city.state,
      population: city.population,
      region: city.region,
      coordinates: [city.lat, city.lng],
      timeZone: city.timeZone,
    }
    onChange(cityData)
    setQuery(`${city.name}, ${city.state}`)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredCities.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
        break
      case "Enter":
        e.preventDefault()
        if (filteredCities[highlightedIndex]) {
          handleSelect(filteredCities[highlightedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        break
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    setIsOpen(newValue.length > 0)
    if (value && newValue !== `${value.name}, ${value.state}`) {
      onChange(null) // Clear selection if user modifies input
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className={`w-full bg-zinc-800 border-2 pl-10 pr-10 py-3 text-lg font-display text-zinc-100 focus:outline-none transition-colors ${
            error ? "border-red-500" : value ? "border-green-500" : "border-zinc-700 focus:border-orange-500"
          }`}
        />
        {value && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
      </div>

      {isOpen && filteredCities.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-zinc-800 border-2 border-zinc-700 max-h-80 overflow-auto"
        >
          {filteredCities.map((city, index) => (
              <li
                key={`${city.id}-${city.name}-${city.state}`}
                onClick={() => handleSelect(city)}
                className={`px-4 py-3 cursor-pointer flex items-center gap-3 ${
                  index === highlightedIndex ? "bg-zinc-700" : "hover:bg-zinc-700/50"
                }`}
              >
                <MapPin className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="text-zinc-100 font-display">
                    {city.name}, <span className="text-zinc-400">{city.state}</span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {city.region} · Pop: {city.population.toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}

      {isOpen && query.length > 0 && filteredCities.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-800 border-2 border-zinc-700 p-4 text-center">
          <p className="text-zinc-500 text-sm">No cities found matching "{query}"</p>
          <p className="text-zinc-600 text-xs mt-1">Try searching for a US city name or state</p>
        </div>
      )}
    </div>
  )
}

// Export the cities data for use elsewhere
export { US_CITIES }
