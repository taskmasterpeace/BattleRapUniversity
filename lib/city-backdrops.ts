// City Backdrop Management System
// Handles generation and caching of city header images (21:9 aspect ratio)

import type { CityBackdrop } from "./types"
import { getCityKey } from "./types"

// In-memory store for city backdrops (in production, this would be a database)
const cityBackdrops: Map<string, CityBackdrop> = new Map()

// Default backdrops for major cities (pre-generated)
const DEFAULT_BACKDROPS: Record<string, string> = {
  "new-york-ny": "/city-backdrops/new-york-ny.jpg",
  "los-angeles-ca": "/city-backdrops/los-angeles-ca.jpg",
  "chicago-il": "/city-backdrops/chicago-il.jpg",
  "houston-tx": "/city-backdrops/houston-tx.jpg",
  "atlanta-ga": "/city-backdrops/atlanta-ga.jpg",
  "detroit-mi": "/city-backdrops/detroit-mi.jpg",
  "philadelphia-pa": "/city-backdrops/philadelphia-pa.jpg",
  "miami-fl": "/city-backdrops/miami-fl.jpg",
}

export function getCityBackdrop(cityName: string, state: string): CityBackdrop | null {
  const key = getCityKey(cityName, state)
  return cityBackdrops.get(key) || null
}

export function setCityBackdrop(cityName: string, state: string, url: string): CityBackdrop {
  const key = getCityKey(cityName, state)
  const existing = cityBackdrops.get(key)

  const backdrop: CityBackdrop = {
    cityKey: key,
    url,
    generatedAt: new Date().toISOString(),
    battlerCount: existing ? existing.battlerCount + 1 : 1,
  }

  cityBackdrops.set(key, backdrop)
  return backdrop
}

export function getOrCreateCityBackdrop(cityName: string, state: string, generateUrl?: () => string): CityBackdrop {
  const key = getCityKey(cityName, state)

  // Check if backdrop already exists
  const existing = cityBackdrops.get(key)
  if (existing) {
    // Increment battler count
    existing.battlerCount++
    return existing
  }

  // Check if we have a default backdrop for this city
  const defaultUrl = DEFAULT_BACKDROPS[key]
  if (defaultUrl) {
    return setCityBackdrop(cityName, state, defaultUrl)
  }

  // Generate new backdrop URL (in production, this would trigger image generation)
  const url = generateUrl
    ? generateUrl()
    : `/placeholder.svg?height=360&width=840&query=${encodeURIComponent(`${cityName} ${state} city skyline urban hip hop culture`)}`

  return setCityBackdrop(cityName, state, url)
}

export function getAllCityBackdrops(): CityBackdrop[] {
  return Array.from(cityBackdrops.values())
}

export function updateCityBackdropUrl(cityKey: string, newUrl: string): boolean {
  const existing = cityBackdrops.get(cityKey)
  if (!existing) return false

  existing.url = newUrl
  existing.generatedAt = new Date().toISOString()
  cityBackdrops.set(cityKey, existing)
  return true
}

export function deleteCityBackdrop(cityKey: string): boolean {
  return cityBackdrops.delete(cityKey)
}

// Initialize with some default backdrops
Object.entries(DEFAULT_BACKDROPS).forEach(([key, url]) => {
  const [cityPart, state] = key.split("-").reduce(
    (acc, part, i, arr) => {
      if (i === arr.length - 1) {
        acc[1] = part
      } else {
        acc[0] = acc[0] ? `${acc[0]} ${part}` : part
      }
      return acc
    },
    ["", ""],
  )

  cityBackdrops.set(key, {
    cityKey: key,
    url,
    generatedAt: new Date().toISOString(),
    battlerCount: 0,
  })
})
