// League crest art: public/sprites/leagues/league_089.png … league_096.png
// Known-name mapping first; unknown leagues get a stable deterministic pick so a
// league always shows the same crest. Replace with real logoId data when populated.
const CRESTS = [89, 90, 91, 92, 93, 94, 95, 96].map(
  (n) => `/sprites/leagues/league_${String(n).padStart(3, "0")}.png`,
)

const KNOWN: Record<string, string> = {
  "small room circuit": CRESTS[0],
  "gunbarz assembly": CRESTS[1],
  "royal wordsmiths": CRESTS[2],
  "underground kings": CRESTS[6],
}

export function leagueCrest(name?: string | null): string | undefined {
  if (!name) return undefined
  const key = name.trim().toLowerCase()
  if (KNOWN[key]) return KNOWN[key]
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return CRESTS[h % CRESTS.length]
}

export function allCrests(): string[] {
  return [...CRESTS]
}
