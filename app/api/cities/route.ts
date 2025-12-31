import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// City sprite configuration
const CITY_SPRITE_DIR = 'public/sprites/cities'

// Map city names to sprite file prefixes
const CITY_SPRITE_MAP: Record<string, string> = {
  // NYC area
  'harlem': 'new-york-city',
  'bronx': 'new-york-city',
  'brooklyn': 'new-york-city',
  'queens': 'new-york-city',
  'staten island': 'new-york-city',
  'yonkers': 'new-york-city',
  'new york city': 'new-york-city',
  // NJ
  'newark': 'new-jersey',
  'east orange': 'new-jersey',
  'jersey city': 'new-jersey',
  'paterson': 'new-jersey',
  // LA area
  'los angeles': 'los-angeles',
  'watts': 'los-angeles',
  'compton': 'los-angeles',
  'inglewood': 'los-angeles',
  'long beach': 'los-angeles',
  // Detroit area
  'detroit': 'detroit',
  'pontiac': 'detroit',
  'flint': 'detroit',
  // Direct matches
  'baltimore': 'baltimore',
  'boston': 'boston',
  'philadelphia': 'philadelphia',
  'chicago': 'chicago',
  'st. louis': 'st-louis',
  'tampa': 'tampa',
  'phoenix': 'phoenix',
  'atlanta': 'atlanta',
  'miami': 'miami',
  'houston': 'houston',
  'dallas': 'dallas',
  'memphis': 'memphis',
  'cleveland': 'cleveland',
  'milwaukee': 'milwaukee',
  'minneapolis': 'minneapolis',
  'kansas city': 'kansas-city',
  'charlotte': 'charlotte',
  'pittsburgh': 'pittsburgh',
  'san diego': 'san-diego',
  'oakland': 'oakland',
  'san francisco': 'san-francisco',
  'seattle': 'seattle',
  'denver': 'denver',
  'las vegas': 'las-vegas',
  'new orleans': 'new-orleans',
  'nashville': 'nashville',
  'orlando': 'orlando',
  'toronto': 'toronto',
  'washington': 'washington-dc',
  // Fallbacks by state
  'new haven': 'boston',
}

function getSpritePrefix(cityName: string): string | null {
  const normalized = cityName.toLowerCase()
  return CITY_SPRITE_MAP[normalized] || null
}

function getSpritesForPrefix(prefix: string): string[] {
  const dirPath = path.join(process.cwd(), CITY_SPRITE_DIR)
  try {
    const files = fs.readdirSync(dirPath)
    // Find all files that start with the prefix
    return files.filter(f =>
      f.startsWith(prefix) &&
      f.endsWith('.png') &&
      (f === `${prefix}.png` || f.startsWith(`${prefix}-`))
    ).sort()
  } catch {
    return []
  }
}

export async function GET() {
  try {
    // Get all unique cities from battlers
    const { data: battlers, error } = await supabase
      .from('battlers')
      .select(`
        id,
        stage_name,
        city:cities!battlers_city_id_fkey(
          id,
          name,
          state,
          region
        )
      `)
      .not('city_id', 'is', null)

    if (error) {
      console.error('Error fetching cities:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group battlers by city
    const cityMap = new Map<string, {
      id: string
      name: string
      state: string
      region: string
      battlers: { id: string; stageName: string }[]
      spritePrefix: string | null
      sprites: string[]
    }>()

    for (const battler of battlers || []) {
      if (!battler.city) continue

      const city = battler.city as { id: string; name: string; state: string; region: string }
      const key = `${city.name}-${city.state}`

      if (!cityMap.has(key)) {
        const spritePrefix = getSpritePrefix(city.name)
        cityMap.set(key, {
          id: city.id,
          name: city.name,
          state: city.state,
          region: city.region || 'Unknown',
          battlers: [],
          spritePrefix,
          sprites: spritePrefix ? getSpritesForPrefix(spritePrefix) : []
        })
      }

      cityMap.get(key)!.battlers.push({
        id: battler.id,
        stageName: battler.stage_name
      })
    }

    // Convert to flat array sorted by battler count
    const cities = Array.from(cityMap.values()).sort((a, b) => b.battlers.length - a.battlers.length)

    // Calculate stats
    const totalCities = cities.length
    const citiesWithSprites = cities.filter(c => c.sprites.length > 0).length
    const citiesMissingSprites = totalCities - citiesWithSprites

    return NextResponse.json({
      cities,
      stats: {
        totalCities,
        citiesWithSprites,
        citiesMissingSprites,
      },
      spriteInfo: {
        size: '512x512',
        directory: '/sprites/cities/',
        format: 'PNG'
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
