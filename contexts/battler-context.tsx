"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { Battler } from "@/lib/types"

interface BattlerContextType {
  battlers: Battler[]
  activeBattler: Battler | undefined
  loading: boolean
  error: string | null
  switchBattler: (id: string) => void
  getBattlerById: (id: string) => Battler | undefined
  refreshBattler: () => Promise<void>
}

const BattlerContext = createContext<BattlerContextType | null>(null)

export function BattlerProvider({ children }: { children: ReactNode }) {
  const [battlers, setBattlers] = useState<Battler[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load battlers from API
  const loadBattlers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch roster (all battlers the player can see)
      const response = await fetch('/api/roster')
      if (!response.ok) {
        throw new Error('Failed to fetch roster')
      }
      const data = await response.json()

      // Map API response to Battler interface
      const mappedBattlers: Battler[] = (data.battlers || []).map((b: any) => ({
        id: b.id,
        stageName: b.stageName || b.stage_name,
        elo: b.stats?.rating || b.rating || 1000,
        region: b.region || b.city?.region || 'Unknown',
        // City data from API
        city: b.city ? {
          name: b.city.name,
          state: b.city.state,
          region: b.city.region,
          population: 0,
          coordinates: [0, 0] as [number, number],
          timeZone: '',
          cityTier: 'regional' as const,
        } : undefined,
        tier: b.tier || 'MID TIER',
        league: b.league?.name?.toUpperCase() || 'SMALL ROOM CIRCUIT',
        archetype: b.archetype || 'All-Rounder',
        stats: b.stats || {
          writing: { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
          performance: { stagePresence: 5, crowdControl: 5, delivery: 5 },
          personal: { financial: 5, reputation: 5, family: 5, resilience: 5 },
        },
        styles: b.styleTags || b.style_tags || [],
        record: { wins: b.stats?.wins || b.wins || 0, losses: b.stats?.losses || b.losses || 0 },
        streak: b.stats?.streak || b.streak || 0,
        stress: b.stress || 50,
        badges: b.badges || [],
        styleTags: b.styleTags || b.style_tags || [],
        portrait: {
          spriteUrl: b.avatarUrl || b.sprite_url || b.avatar_url || '/sprites/characters/sprite_661.png',
          crop: { scale: 1, offsetX: 0, offsetY: 0 },
        },
        crew: b.crew ? {
          id: b.crew.id,
          name: b.crew.name,
          tag: b.crew.tag,
        } : undefined,
        isActive: b.isActive !== undefined ? b.isActive : !b.is_ai,
        // Career tracking data
        careerDays: b.careerDays || b.career_days || 0,
        careerPublic: b.careerPublic || b.career_public || false,
        careerTier: b.careerTier || b.career_tier || 'rookie',
        careerDisplay: b.careerDisplay || b.career_display || '0 days',
        // Flyer System: city backdrop + progression for the command hero
        cityBackdrop: b.city?.backdrop || undefined,
        level: b.level || 1,
        xp: { current: b.currentLevelXp || 0, needed: 1000 },
      }))

      // If no battlers, keep empty array
      setBattlers(mappedBattlers)
    } catch (err) {
      console.error('Failed to load battlers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load battlers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBattlers()
  }, [loadBattlers])

  const activeBattler = battlers.find((b) => b.isActive)

  const switchBattler = useCallback((id: string) => {
    setBattlers((prev) =>
      prev.map((b) => ({
        ...b,
        isActive: b.id === id,
      })),
    )
  }, [])

  const getBattlerById = useCallback(
    (id: string) => {
      return battlers.find((b) => b.id === id)
    },
    [battlers],
  )

  const refreshBattler = useCallback(async () => {
    await loadBattlers()
  }, [loadBattlers])

  return (
    <BattlerContext.Provider
      value={{
        battlers,
        activeBattler,
        loading,
        error,
        switchBattler,
        getBattlerById,
        refreshBattler
      }}
    >
      {children}
    </BattlerContext.Provider>
  )
}

export function useBattler() {
  const context = useContext(BattlerContext)
  if (!context) {
    throw new Error("useBattler must be used within a BattlerProvider")
  }
  return context
}

export function useActiveBattler() {
  const { activeBattler } = useBattler()
  return activeBattler
}
