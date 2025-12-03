import { ALL_BATTLERS } from "./data"
import { LEAGUES } from "./leagues"

export interface ScheduledBattle {
  oddsId: string
  opponentId: string
  leagueSlug: string
  daysUntil: number
  battleDate: Date
}

export function getNextScheduledBattle(battlerId: string): ScheduledBattle | null {
  // Get a random opponent that isn't the current battler
  const opponents = ALL_BATTLERS.filter((b) => b.id !== battlerId)
  if (opponents.length === 0) return null

  const opponent = opponents[Math.floor(Math.random() * opponents.length)]

  // Get a random league
  const availableLeagues = LEAGUES.filter((l) => l.tier === "underground" || l.tier === "regional")
  const league = availableLeagues[Math.floor(Math.random() * availableLeagues.length)] || LEAGUES[0]

  // Schedule battle 3-7 days from now
  const daysUntil = 3 + Math.floor(Math.random() * 5)
  const battleDate = new Date()
  battleDate.setDate(battleDate.getDate() + daysUntil)

  return {
    oddsId: `battle-${Date.now()}`,
    opponentId: opponent.id,
    leagueSlug: league.slug,
    daysUntil,
    battleDate,
  }
}

export function getAllScheduledBattles(battlerId: string): ScheduledBattle[] {
  // For now, return a single scheduled battle
  const nextBattle = getNextScheduledBattle(battlerId)
  return nextBattle ? [nextBattle] : []
}
