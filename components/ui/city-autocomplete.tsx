"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { MapPin, Check } from "lucide-react"

// This is a curated list of major US cities - in production you'd use the us-places npm package
const US_CITIES = [
  // Northeast
  {
    name: "New York",
    state: "NY",
    population: 8336817,
    region: "Northeast",
    coordinates: [40.7128, -74.006],
    timeZone: "Eastern",
  },
  {
    name: "Philadelphia",
    state: "PA",
    population: 1584064,
    region: "Northeast",
    coordinates: [39.9526, -75.1652],
    timeZone: "Eastern",
  },
  {
    name: "Boston",
    state: "MA",
    population: 692600,
    region: "Northeast",
    coordinates: [42.3601, -71.0589],
    timeZone: "Eastern",
  },
  {
    name: "Newark",
    state: "NJ",
    population: 311549,
    region: "Northeast",
    coordinates: [40.7357, -74.1724],
    timeZone: "Eastern",
  },
  {
    name: "Jersey City",
    state: "NJ",
    population: 292449,
    region: "Northeast",
    coordinates: [40.7178, -74.0431],
    timeZone: "Eastern",
  },
  {
    name: "Pittsburgh",
    state: "PA",
    population: 302971,
    region: "Northeast",
    coordinates: [40.4406, -79.9959],
    timeZone: "Eastern",
  },
  {
    name: "Baltimore",
    state: "MD",
    population: 585708,
    region: "Northeast",
    coordinates: [39.2904, -76.6122],
    timeZone: "Eastern",
  },
  {
    name: "Washington",
    state: "DC",
    population: 689545,
    region: "Northeast",
    coordinates: [38.9072, -77.0369],
    timeZone: "Eastern",
  },
  // Southeast
  {
    name: "Atlanta",
    state: "GA",
    population: 498715,
    region: "Southeast",
    coordinates: [33.749, -84.388],
    timeZone: "Eastern",
  },
  {
    name: "Miami",
    state: "FL",
    population: 467963,
    region: "Southeast",
    coordinates: [25.7617, -80.1918],
    timeZone: "Eastern",
  },
  {
    name: "Charlotte",
    state: "NC",
    population: 879709,
    region: "Southeast",
    coordinates: [35.2271, -80.8431],
    timeZone: "Eastern",
  },
  {
    name: "Jacksonville",
    state: "FL",
    population: 949611,
    region: "Southeast",
    coordinates: [30.3322, -81.6557],
    timeZone: "Eastern",
  },
  {
    name: "Memphis",
    state: "TN",
    population: 633104,
    region: "Southeast",
    coordinates: [35.1495, -90.049],
    timeZone: "Central",
  },
  {
    name: "New Orleans",
    state: "LA",
    population: 383997,
    region: "Southeast",
    coordinates: [29.9511, -90.0715],
    timeZone: "Central",
  },
  {
    name: "Tampa",
    state: "FL",
    population: 399700,
    region: "Southeast",
    coordinates: [27.9506, -82.4572],
    timeZone: "Eastern",
  },
  {
    name: "Orlando",
    state: "FL",
    population: 307573,
    region: "Southeast",
    coordinates: [28.5383, -81.3792],
    timeZone: "Eastern",
  },
  // Midwest
  {
    name: "Chicago",
    state: "IL",
    population: 2693976,
    region: "Midwest",
    coordinates: [41.8781, -87.6298],
    timeZone: "Central",
  },
  {
    name: "Detroit",
    state: "MI",
    population: 639111,
    region: "Midwest",
    coordinates: [42.3314, -83.0458],
    timeZone: "Eastern",
  },
  {
    name: "Milwaukee",
    state: "WI",
    population: 577222,
    region: "Midwest",
    coordinates: [43.0389, -87.9065],
    timeZone: "Central",
  },
  {
    name: "Cleveland",
    state: "OH",
    population: 372624,
    region: "Midwest",
    coordinates: [41.4993, -81.6944],
    timeZone: "Eastern",
  },
  {
    name: "Columbus",
    state: "OH",
    population: 905748,
    region: "Midwest",
    coordinates: [39.9612, -82.9988],
    timeZone: "Eastern",
  },
  {
    name: "Indianapolis",
    state: "IN",
    population: 887642,
    region: "Midwest",
    coordinates: [39.7684, -86.1581],
    timeZone: "Eastern",
  },
  {
    name: "Minneapolis",
    state: "MN",
    population: 429954,
    region: "Midwest",
    coordinates: [44.9778, -93.265],
    timeZone: "Central",
  },
  {
    name: "St. Louis",
    state: "MO",
    population: 301578,
    region: "Midwest",
    coordinates: [38.627, -90.1994],
    timeZone: "Central",
  },
  {
    name: "Kansas City",
    state: "MO",
    population: 508090,
    region: "Midwest",
    coordinates: [39.0997, -94.5786],
    timeZone: "Central",
  },
  // Southwest
  {
    name: "Houston",
    state: "TX",
    population: 2304580,
    region: "Southwest",
    coordinates: [29.7604, -95.3698],
    timeZone: "Central",
  },
  {
    name: "Dallas",
    state: "TX",
    population: 1304379,
    region: "Southwest",
    coordinates: [32.7767, -96.797],
    timeZone: "Central",
  },
  {
    name: "San Antonio",
    state: "TX",
    population: 1547253,
    region: "Southwest",
    coordinates: [29.4241, -98.4936],
    timeZone: "Central",
  },
  {
    name: "Austin",
    state: "TX",
    population: 978908,
    region: "Southwest",
    coordinates: [30.2672, -97.7431],
    timeZone: "Central",
  },
  {
    name: "Fort Worth",
    state: "TX",
    population: 918915,
    region: "Southwest",
    coordinates: [32.7555, -97.3308],
    timeZone: "Central",
  },
  {
    name: "El Paso",
    state: "TX",
    population: 681728,
    region: "Southwest",
    coordinates: [31.7619, -106.485],
    timeZone: "Mountain",
  },
  {
    name: "Phoenix",
    state: "AZ",
    population: 1608139,
    region: "Southwest",
    coordinates: [33.4484, -112.074],
    timeZone: "Mountain",
  },
  {
    name: "Tucson",
    state: "AZ",
    population: 548073,
    region: "Southwest",
    coordinates: [32.2226, -110.9747],
    timeZone: "Mountain",
  },
  {
    name: "Albuquerque",
    state: "NM",
    population: 564559,
    region: "Southwest",
    coordinates: [35.0844, -106.6504],
    timeZone: "Mountain",
  },
  {
    name: "Las Vegas",
    state: "NV",
    population: 651319,
    region: "Southwest",
    coordinates: [36.1699, -115.1398],
    timeZone: "Pacific",
  },
  // West Coast
  {
    name: "Los Angeles",
    state: "CA",
    population: 3979576,
    region: "West",
    coordinates: [34.0522, -118.2437],
    timeZone: "Pacific",
  },
  {
    name: "San Francisco",
    state: "CA",
    population: 873965,
    region: "West",
    coordinates: [37.7749, -122.4194],
    timeZone: "Pacific",
  },
  {
    name: "San Diego",
    state: "CA",
    population: 1423851,
    region: "West",
    coordinates: [32.7157, -117.1611],
    timeZone: "Pacific",
  },
  {
    name: "San Jose",
    state: "CA",
    population: 1021795,
    region: "West",
    coordinates: [37.3382, -121.8863],
    timeZone: "Pacific",
  },
  {
    name: "Oakland",
    state: "CA",
    population: 433031,
    region: "West",
    coordinates: [37.8044, -122.2712],
    timeZone: "Pacific",
  },
  {
    name: "Long Beach",
    state: "CA",
    population: 466742,
    region: "West",
    coordinates: [33.77, -118.1937],
    timeZone: "Pacific",
  },
  {
    name: "Fresno",
    state: "CA",
    population: 542107,
    region: "West",
    coordinates: [36.7378, -119.7871],
    timeZone: "Pacific",
  },
  {
    name: "Sacramento",
    state: "CA",
    population: 524943,
    region: "West",
    coordinates: [38.5816, -121.4944],
    timeZone: "Pacific",
  },
  {
    name: "Seattle",
    state: "WA",
    population: 753675,
    region: "West",
    coordinates: [47.6062, -122.3321],
    timeZone: "Pacific",
  },
  {
    name: "Portland",
    state: "OR",
    population: 654741,
    region: "West",
    coordinates: [45.5152, -122.6784],
    timeZone: "Pacific",
  },
  {
    name: "Denver",
    state: "CO",
    population: 727211,
    region: "West",
    coordinates: [39.7392, -104.9903],
    timeZone: "Mountain",
  },
]

export interface CityData {
  name: string
  state: string
  population: number
  region: string
  coordinates: [number, number]
  timeZone: string
  cityTier?: "major" | "regional" | "underground"
}

interface CityAutocompleteProps {
  value: CityData | null
  onChange: (city: CityData | null) => void
  placeholder?: string
  error?: boolean
}

function getCityTier(population: number): "major" | "regional" | "underground" {
  if (population >= 1000000) return "major"
  if (population >= 300000) return "regional"
  return "underground"
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
    ).slice(0, 8) // Limit to 8 results
  }, [query])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredCities])

  const handleSelect = (city: (typeof US_CITIES)[0]) => {
    const cityData: CityData = {
      ...city,
      coordinates: city.coordinates as [number, number],
      cityTier: getCityTier(city.population),
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
          className="absolute z-50 w-full mt-1 bg-zinc-800 border-2 border-zinc-700 max-h-64 overflow-auto"
        >
          {filteredCities.map((city, index) => {
            const tier = getCityTier(city.population)
            return (
              <li
                key={`${city.name}-${city.state}`}
                onClick={() => handleSelect(city)}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                  index === highlightedIndex ? "bg-zinc-700" : "hover:bg-zinc-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-zinc-100 font-display">
                      {city.name}, <span className="text-zinc-400">{city.state}</span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {city.region} · Pop: {city.population.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-display uppercase px-2 py-0.5 ${
                    tier === "major"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                      : tier === "regional"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                        : "bg-zinc-600/20 text-zinc-400 border border-zinc-600/50"
                  }`}
                >
                  {tier}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {isOpen && query.length > 0 && filteredCities.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-800 border-2 border-zinc-700 p-4 text-center">
          <p className="text-zinc-500 text-sm">No cities found matching "{query}"</p>
          <p className="text-zinc-600 text-xs mt-1">Try searching for a major US city</p>
        </div>
      )}
    </div>
  )
}
