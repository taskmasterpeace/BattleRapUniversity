import { ALL_BADGES, type Badge } from "@/lib/all-badges"
import { badgeArt } from "@/lib/badge-art"
import type { BadgeInfo, BadgeEffect, NetEffect } from "@/components/battler/character-sheet"

// Effects where a POSITIVE number is a downside (costs), everything else positive = buff.
const NEGATIVE_WHEN_POSITIVE = new Set(["chokeRisk", "stressPerDay"])

const LABELS: Record<string, string> = {
  lyricism: "lyricism",
  wordplay: "wordplay",
  creativity: "creativity",
  flow: "flow",
  stagePresence: "stage presence",
  crowdControl: "crowd control",
  delivery: "delivery",
  consistency: "consistency",
  adaptability: "adaptability",
  resilience: "resilience",
  chokeRisk: "choke risk",
  stressPerDay: "stress / day",
  earningsBonus: "earnings",
  fanGrowth: "fan growth",
  crowdReaction: "crowd reaction",
  selfAwareness: "self awareness",
}

const label = (k: string) => LABELS[k] ?? k.replace(/([A-Z])/g, " $1").toLowerCase()

const TIER_BY_RARITY: Record<string, BadgeInfo["tier"]> = {
  legendary: "gold",
  epic: "silver",
  rare: "bronze",
  common: "bronze",
}

const byId = new Map<string, Badge>(ALL_BADGES.map((b) => [b.id, b]))
const byName = new Map<string, Badge>(ALL_BADGES.map((b) => [b.name.toUpperCase(), b]))

export function findBadge(code: string): Badge | undefined {
  return byId.get(code) ?? byId.get(code.toLowerCase()) ?? byName.get(code.toUpperCase())
}

function formatEffects(b: Badge): BadgeEffect[] {
  return Object.entries(b.effects)
    .filter(([, v]) => typeof v === "number" && v !== 0)
    .map(([k, v]) => {
      const num = v as number
      const bad = NEGATIVE_WHEN_POSITIVE.has(k) ? num > 0 : num < 0
      const sign = num > 0 ? "+" : "−"
      return { delta: `${sign}${Math.abs(num)}%`, label: label(k), good: !bad }
    })
}

/** Map earned badge codes to CharacterSheet badge cards with real sim effects. */
export function toBadgeInfos(codes: string[]): BadgeInfo[] {
  return codes
    .map((code) => {
      const def = findBadge(code)
      if (!def) {
        return { name: code.replace(/[_-]/g, " ").toUpperCase(), tier: "bronze" as const, effects: [] }
      }
      return {
        name: def.name,
        tier: TIER_BY_RARITY[def.rarity] ?? "bronze",
        icon: badgeArt(def.id) ?? badgeArt(def.name),
        emoji: def.icon,
        effects: formatEffects(def),
      }
    })
    .filter(Boolean) as BadgeInfo[]
}

/** Sum every badge's effects into the net-modifier chips. */
export function toNetEffects(codes: string[]): NetEffect[] {
  const totals = new Map<string, number>()
  for (const code of codes) {
    const def = findBadge(code)
    if (!def) continue
    for (const [k, v] of Object.entries(def.effects)) {
      if (typeof v !== "number" || v === 0) continue
      totals.set(k, (totals.get(k) ?? 0) + v)
    }
  }
  return [...totals.entries()]
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .map(([k, v]) => {
      const bad = NEGATIVE_WHEN_POSITIVE.has(k) ? v > 0 : v < 0
      return { label: label(k).toUpperCase(), delta: `${v > 0 ? "+" : "−"}${Math.abs(v)}%`, good: !bad }
    })
}
