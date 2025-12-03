"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { ALL_BATTLERS as INITIAL_BATTLERS } from "@/lib/data"
import type { Battler } from "@/lib/types"

interface BattlerContextType {
  battlers: Battler[]
  activeBattler: Battler | undefined
  switchBattler: (id: string) => void
  getBattlerById: (id: string) => Battler | undefined
}

const BattlerContext = createContext<BattlerContextType | null>(null)

export function BattlerProvider({ children }: { children: ReactNode }) {
  const [battlers, setBattlers] = useState<Battler[]>(INITIAL_BATTLERS)

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

  return (
    <BattlerContext.Provider value={{ battlers, activeBattler, switchBattler, getBattlerById }}>
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
