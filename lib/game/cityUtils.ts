/**
 * City and Distance Utilities
 * Used for coin toss logic (furthest from venue picks first)
 */

import citiesData from '@/lib/us-cities-data.json'

export interface CityCoordinates {
  name: string
  lat: number
  lng: number
  state: string
  region: string
}

// Load city data from JSON
const citiesMap = new Map<string, CityCoordinates>()
citiesData.forEach((city: any) => {
  citiesMap.set(city.name.toLowerCase(), {
    name: city.name,
    lat: city.lat,
    lng: city.lng,
    state: city.state,
    region: city.region,
  })
})

/**
 * Haversine formula to calculate distance between two points on Earth
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Get city coordinates by name
 */
export function getCityCoordinates(cityName: string): CityCoordinates | null {
  // Try exact match first
  const exact = citiesMap.get(cityName.toLowerCase())
  if (exact) return exact

  // Try partial match
  for (const [key, city] of citiesMap) {
    if (key.includes(cityName.toLowerCase()) || cityName.toLowerCase().includes(key)) {
      return city
    }
  }

  return null
}

/**
 * Calculate distance between two city names
 * @returns Distance in miles, or null if cities not found
 */
export function getDistanceBetweenCities(city1: string, city2: string): number | null {
  const coords1 = getCityCoordinates(city1)
  const coords2 = getCityCoordinates(city2)

  if (!coords1 || !coords2) return null

  return calculateDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng)
}

/**
 * Determine who wins the coin toss (furthest from venue)
 * Returns the battler who should pick first/second
 */
export function determineCoinTossWinner(
  battlerACity: string,
  battlerBCity: string,
  venueCity: string
): {
  winner: 'A' | 'B' | 'tie'
  distanceA: number | null
  distanceB: number | null
  reason: string
} {
  const distanceA = getDistanceBetweenCities(battlerACity, venueCity)
  const distanceB = getDistanceBetweenCities(battlerBCity, venueCity)

  // If we can't calculate distances, random winner
  if (distanceA === null || distanceB === null) {
    return {
      winner: Math.random() > 0.5 ? 'A' : 'B',
      distanceA,
      distanceB,
      reason: 'Random (city data unavailable)'
    }
  }

  // The one furthest from venue wins
  if (distanceA > distanceB + 10) { // 10 mile buffer for "tie"
    return {
      winner: 'A',
      distanceA,
      distanceB,
      reason: `${battlerACity} is ${Math.round(distanceA - distanceB)} miles further from ${venueCity}`
    }
  } else if (distanceB > distanceA + 10) {
    return {
      winner: 'B',
      distanceA,
      distanceB,
      reason: `${battlerBCity} is ${Math.round(distanceB - distanceA)} miles further from ${venueCity}`
    }
  } else {
    // Essentially same distance - random
    return {
      winner: Math.random() > 0.5 ? 'A' : 'B',
      distanceA,
      distanceB,
      reason: 'Coin flip (both same distance from venue)'
    }
  }
}

/**
 * Get crowd sprite path based on reaction type and demographic
 */
export function getCrowdSpritePath(
  reaction: 'hype' | 'stunned' | 'boo' | 'cheer' | 'cringe' | 'record' | 'think' | 'watch' | 'unimpressed' | 'laugh' | 'listen' | 'disappointed' | 'talk',
  demographic: 'black' | 'white' | 'mixed'
): string {
  // Get a random sprite for this reaction type and demographic
  const sprites: Record<string, Record<string, string[]>> = {
    black: {
      hype: ['hype_001', 'hype_002', 'hype_003', 'hype_005', 'hype_006', 'hype_013', 'hype_014'],
      stunned: ['stunned_001', 'stunned_003', 'stunned_004', 'stunned_005', 'stunned_007', 'stunned_008', 'stunned_009', 'stunned_010'],
      boo: ['boo_001', 'boo_002', 'boo_003', 'boo_007', 'boo_009'],
      cheer: ['cheer_001', 'cheer_002', 'cheer_006', 'cheer_009', 'cheer_010', 'cheer_013'],
      cringe: ['cringe_001', 'cringe_004', 'cringe_005', 'cringe_009'],
      record: ['record_001', 'record_002', 'record_003', 'record_004', 'record_005', 'record_006'],
      think: ['think_001', 'think_002', 'think_005', 'think_007', 'think_014'],
      watch: ['watch_001', 'watch_002', 'watch_003', 'watch_004', 'watch_007', 'watch_008'],
      unimpressed: ['unimpressed_001', 'unimpressed_002', 'unimpressed_004', 'unimpressed_006'],
      laugh: ['laugh_001'],
      listen: ['listen_001', 'listen_002'],
      disappointed: ['disappointed_001', 'disappointed_002', 'disappointed_004'],
      talk: ['talk_003', 'talk_007'],
    },
    white: {
      hype: ['hype_003', 'hype_004', 'hype_005', 'hype_006'],
      stunned: ['stunned_001', 'stunned_002', 'stunned_004', 'stunned_008'],
      cheer: ['cheer_001', 'cheer_002', 'cheer_003', 'cheer_007'],
      cringe: ['cringe_001', 'cringe_002', 'cringe_003'],
      record: ['record_001', 'record_002', 'record_003', 'record_004', 'record_005', 'record_006'],
      think: ['think_002', 'think_003'],
      watch: ['watch_005', 'watch_008', 'watch_013'],
      laugh: ['laugh_001'],
      listen: ['listen_001'],
      boo: [],
      unimpressed: [],
      disappointed: [],
      talk: [],
    },
    mixed: {
      hype: ['hype_003', 'hype_005'],
      cheer: ['cheer_001', 'cheer_004'],
      think: ['think_001', 'think_002'],
      watch: ['watch_001', 'watch_003', 'watch_006', 'watch_008', 'watch_009', 'watch_011', 'watch_012', 'watch_013'],
      stunned: [],
      boo: [],
      cringe: [],
      record: [],
      unimpressed: [],
      laugh: [],
      listen: [],
      disappointed: [],
      talk: [],
    }
  }

  const available = sprites[demographic]?.[reaction] || []

  // Fallback to black if no sprites available
  if (available.length === 0) {
    const blackAvailable = sprites.black[reaction] || []
    if (blackAvailable.length === 0) {
      return '/sprites/crowd/black/watch_001.png' // Ultimate fallback
    }
    const randomSprite = blackAvailable[Math.floor(Math.random() * blackAvailable.length)]
    return `/sprites/crowd/black/${randomSprite}.png`
  }

  const randomSprite = available[Math.floor(Math.random() * available.length)]
  return `/sprites/crowd/${demographic}/${randomSprite}.png`
}

/**
 * Map crowd reaction to sprite reaction type
 */
export function mapReactionToSpriteType(
  score: number,
  isPeak: boolean,
  isChoke: boolean,
  isStumble: boolean = false
): 'hype' | 'stunned' | 'boo' | 'cheer' | 'cringe' | 'record' | 'think' | 'watch' | 'unimpressed' {
  if (isChoke) {
    return Math.random() > 0.5 ? 'cringe' : 'boo'
  }

  // Stumble is less severe than choke - crowd notices but he recovered
  if (isStumble) {
    return Math.random() > 0.5 ? 'cringe' : 'unimpressed'
  }

  if (isPeak) {
    return Math.random() > 0.3 ? 'stunned' : 'hype'
  }

  if (score >= 8.5) {
    return Math.random() > 0.4 ? 'hype' : 'record'
  }

  if (score >= 7.5) {
    return Math.random() > 0.5 ? 'cheer' : 'hype'
  }

  if (score >= 6.5) {
    return Math.random() > 0.6 ? 'think' : 'watch'
  }

  if (score >= 5.5) {
    return Math.random() > 0.5 ? 'unimpressed' : 'watch'
  }

  // Low score
  return Math.random() > 0.3 ? 'boo' : 'cringe'
}
