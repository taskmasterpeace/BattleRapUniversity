import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function leagueToSlug(league: string) {
  return league.toLowerCase().replace(/\s+/g, "-")
}

export function tierToSlug(tier: string) {
  return tier.toLowerCase().replace(/\s+/g, "-")
}
