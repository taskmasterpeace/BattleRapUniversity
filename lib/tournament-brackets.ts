// Tournament Bracket System - Handles 6 to 64 participants

export interface BracketBattler {
  id: string
  name: string
  seed: number
  avatar: string
  eliminated: boolean
  elo?: number
}

export interface BracketMatch {
  id: string
  round: number
  position: number
  matchNumber: number // Overall match number in tournament
  battler1: BracketBattler | null
  battler2: BracketBattler | null
  winner: string | null // battler id
  score?: string
  completed: boolean
  isBye?: boolean // For odd-number tournaments
  nextMatchId?: string // Which match winner advances to
}

export interface TournamentBracket {
  id: string
  name: string
  league: string
  size: TournamentSize
  rounds: number
  currentRound: number
  matches: BracketMatch[]
  champion: BracketBattler | null
  format: "single_elimination" | "double_elimination"
}

// Supported tournament sizes
export type TournamentSize = 6 | 8 | 12 | 16 | 24 | 32 | 48 | 64

// Get number of rounds for tournament size
export function getRoundCount(size: TournamentSize): number {
  const roundMap: Record<TournamentSize, number> = {
    6: 3, // 6 -> 4 (2 byes) -> 2 -> 1
    8: 3, // 8 -> 4 -> 2 -> 1
    12: 4, // 12 -> 8 (4 byes) -> 4 -> 2 -> 1
    16: 4, // 16 -> 8 -> 4 -> 2 -> 1
    24: 5, // 24 -> 16 (8 byes) -> 8 -> 4 -> 2 -> 1
    32: 5, // 32 -> 16 -> 8 -> 4 -> 2 -> 1
    48: 6, // 48 -> 32 (16 byes) -> 16 -> 8 -> 4 -> 2 -> 1
    64: 6, // 64 -> 32 -> 16 -> 8 -> 4 -> 2 -> 1
  }
  return roundMap[size]
}

// Get round names based on tournament size and round number
export function getRoundName(size: TournamentSize, round: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - round

  if (roundsFromEnd === 0) return "FINALS"
  if (roundsFromEnd === 1) return "SEMIFINALS"
  if (roundsFromEnd === 2) return "QUARTERFINALS"
  if (roundsFromEnd === 3 && size >= 16) return "ROUND OF 16"
  if (roundsFromEnd === 4 && size >= 32) return "ROUND OF 32"
  if (roundsFromEnd === 5 && size >= 64) return "ROUND OF 64"

  // For smaller tournaments or early rounds
  return `ROUND ${round}`
}

// Get all round names for a tournament
export function getAllRoundNames(size: TournamentSize): string[] {
  const totalRounds = getRoundCount(size)
  return Array.from({ length: totalRounds }, (_, i) => getRoundName(size, i + 1, totalRounds))
}

// Calculate number of byes needed
export function calculateByes(size: TournamentSize): number {
  // Find next power of 2
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(size)))
  return nextPowerOf2 - size
}

// Get matches per round
export function getMatchesPerRound(size: TournamentSize, round: number): number {
  const totalRounds = getRoundCount(size)
  const byes = calculateByes(size)

  // First round has (size - byes) / 2 matches
  if (round === 1) {
    return Math.floor((size - byes) / 2)
  }

  // Subsequent rounds halve each time from the effective size
  const effectiveSize = Math.pow(2, Math.ceil(Math.log2(size)))
  return Math.floor(effectiveSize / Math.pow(2, round))
}

// Generate empty bracket structure
export function generateEmptyBracket(
  tournamentId: string,
  name: string,
  league: string,
  size: TournamentSize,
): TournamentBracket {
  const totalRounds = getRoundCount(size)
  const byes = calculateByes(size)
  const effectiveSize = Math.pow(2, Math.ceil(Math.log2(size)))
  const matches: BracketMatch[] = []

  let matchNumber = 1

  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = effectiveSize / Math.pow(2, round)

    for (let position = 1; position <= matchesInRound; position++) {
      const match: BracketMatch = {
        id: `r${round}-m${position}`,
        round,
        position,
        matchNumber: matchNumber++,
        battler1: null,
        battler2: null,
        winner: null,
        completed: false,
      }

      // Calculate next match
      if (round < totalRounds) {
        const nextPosition = Math.ceil(position / 2)
        match.nextMatchId = `r${round + 1}-m${nextPosition}`
      }

      matches.push(match)
    }
  }

  return {
    id: tournamentId,
    name,
    league,
    size,
    rounds: totalRounds,
    currentRound: 1,
    matches,
    champion: null,
    format: "single_elimination",
  }
}

// Seed battlers into bracket (standard seeding - 1v16, 2v15, etc)
export function seedBattlers(bracket: TournamentBracket, battlers: BracketBattler[]): TournamentBracket {
  const sortedBattlers = [...battlers].sort((a, b) => a.seed - b.seed)
  const byes = calculateByes(bracket.size)
  const effectiveSize = Math.pow(2, Math.ceil(Math.log2(bracket.size)))
  const round1Matches = bracket.matches.filter((m) => m.round === 1)

  // Standard bracket seeding positions
  const seedPositions = generateSeedPositions(effectiveSize)

  // Create battler map with byes
  const battlerMap: (BracketBattler | "BYE" | null)[] = new Array(effectiveSize).fill(null)

  // Place battlers according to seed positions
  sortedBattlers.forEach((battler, index) => {
    const position = seedPositions[index]
    if (position !== undefined) {
      battlerMap[position] = battler
    }
  })

  // Fill remaining with byes (top seeds get byes)
  for (let i = 0; i < byes; i++) {
    const byePosition = seedPositions[bracket.size + i]
    if (byePosition !== undefined) {
      battlerMap[byePosition] = "BYE"
    }
  }

  // Assign to matches
  const updatedMatches = bracket.matches.map((match) => {
    if (match.round === 1) {
      const matchIndex = match.position - 1
      const battler1Index = matchIndex * 2
      const battler2Index = matchIndex * 2 + 1

      const b1 = battlerMap[battler1Index]
      const b2 = battlerMap[battler2Index]

      // Handle byes
      if (b1 === "BYE" && b2 && b2 !== "BYE") {
        return {
          ...match,
          battler1: null,
          battler2: b2,
          winner: b2.id,
          completed: true,
          isBye: true,
        }
      }
      if (b2 === "BYE" && b1 && b1 !== "BYE") {
        return {
          ...match,
          battler1: b1,
          battler2: null,
          winner: b1.id,
          completed: true,
          isBye: true,
        }
      }

      return {
        ...match,
        battler1: b1 === "BYE" ? null : b1,
        battler2: b2 === "BYE" ? null : b2,
      }
    }
    return match
  })

  return {
    ...bracket,
    matches: updatedMatches,
  }
}

// Generate standard tournament seeding positions
function generateSeedPositions(size: number): number[] {
  if (size === 2) return [0, 1]

  const halfSize = size / 2
  const topHalf = generateSeedPositions(halfSize)
  const bottomHalf = generateSeedPositions(halfSize)

  const positions: number[] = []
  for (let i = 0; i < halfSize; i++) {
    positions.push(topHalf[i])
    positions.push(size - 1 - bottomHalf[i])
  }

  return positions
}

// Record match result
export function recordMatchResult(
  bracket: TournamentBracket,
  matchId: string,
  winnerId: string,
  score?: string,
): TournamentBracket {
  const matchIndex = bracket.matches.findIndex((m) => m.id === matchId)
  if (matchIndex === -1) return bracket

  const match = bracket.matches[matchIndex]
  const winner = match.battler1?.id === winnerId ? match.battler1 : match.battler2
  const loser = match.battler1?.id === winnerId ? match.battler2 : match.battler1

  // Update match
  const updatedMatches = [...bracket.matches]
  updatedMatches[matchIndex] = {
    ...match,
    winner: winnerId,
    score,
    completed: true,
  }

  // Mark loser as eliminated
  if (loser) {
    updatedMatches.forEach((m) => {
      if (m.battler1?.id === loser.id) {
        m.battler1 = { ...m.battler1, eliminated: true }
      }
      if (m.battler2?.id === loser.id) {
        m.battler2 = { ...m.battler2, eliminated: true }
      }
    })
  }

  // Advance winner to next match
  if (match.nextMatchId && winner) {
    const nextMatchIndex = updatedMatches.findIndex((m) => m.id === match.nextMatchId)
    if (nextMatchIndex !== -1) {
      const nextMatch = updatedMatches[nextMatchIndex]
      const isTopHalf = match.position % 2 === 1

      updatedMatches[nextMatchIndex] = {
        ...nextMatch,
        battler1: isTopHalf ? { ...winner, eliminated: false } : nextMatch.battler1,
        battler2: !isTopHalf ? { ...winner, eliminated: false } : nextMatch.battler2,
      }
    }
  }

  // Check for champion
  let champion: BracketBattler | null = null
  const finalMatch = updatedMatches.find((m) => m.round === bracket.rounds)
  if (finalMatch?.completed && winner && match.round === bracket.rounds) {
    champion = winner
  }

  // Update current round
  let currentRound = bracket.currentRound
  const currentRoundMatches = updatedMatches.filter((m) => m.round === currentRound)
  if (currentRoundMatches.every((m) => m.completed) && currentRound < bracket.rounds) {
    currentRound++
  }

  return {
    ...bracket,
    matches: updatedMatches,
    currentRound,
    champion,
  }
}

// Get bracket statistics
export function getBracketStats(bracket: TournamentBracket) {
  const totalMatches = bracket.matches.length
  const completedMatches = bracket.matches.filter((m) => m.completed && !m.isBye).length
  const byeMatches = bracket.matches.filter((m) => m.isBye).length
  const remainingMatches = totalMatches - completedMatches - byeMatches
  const activeBattlers = new Set<string>()

  bracket.matches.forEach((m) => {
    if (m.battler1 && !m.battler1.eliminated) activeBattlers.add(m.battler1.id)
    if (m.battler2 && !m.battler2.eliminated) activeBattlers.add(m.battler2.id)
  })

  return {
    totalMatches,
    completedMatches,
    byeMatches,
    remainingMatches,
    activeBattlers: activeBattlers.size,
    progressPercent: Math.round((completedMatches / (totalMatches - byeMatches)) * 100),
  }
}

// Generate mock battlers for testing
export function generateMockBattlers(count: number): BracketBattler[] {
  const names = [
    "TH3 SAGA",
    "DANNY MYERS",
    "LOSO",
    "MIKE P",
    "BILL COLLECTOR",
    "STEAMS",
    "GLUEAZY",
    "YOUNG KANNON",
    "RYDA",
    "FRANCHISE",
    "NUNN NUNN",
    "HOLMZIE DA GOD",
    "EMERSON KENNEDY",
    "REEPAH RELL",
    "TINK DA DEMON",
    "MR WAVY",
    "REAL SIKH",
    "JEY THE NITEWING",
    "LU CASTRO",
    "KID CHAOS",
    "RU BANDO",
    "GUNPOWDER PATT",
    "YOUR HONOR",
    "SQUEAKO",
    "FONZ",
    "J KROOGER",
    "EAZY THE BLOCK CAPTAIN",
    "DON MARINO",
    "BROOKLYN HANZ",
    "BIG HANN",
    "BAD NEWZ",
    "ACE AMIN",
    "CHESS",
    "GEECHI GOTTI",
    "LOADED LUX",
    "MURDA MOOK",
    "HOLLOW DA DON",
    "TAY ROC",
    "SURF",
    "HITMAN HOLLA",
    "DIZASTER",
    "DAYLYT",
    "RUM NITTY",
    "AVE",
    "T-TOP",
    "CALICOE",
    "CLIPS",
    "K-SHINE",
    "DNA",
    "PAT STAY",
    "ARSONAL",
    "CORTEZ",
    "MATH HOFFA",
    "SHOTGUN SUGE",
    "B MAGIC",
    "ILL WILL",
    "SERIUS JONES",
    "GOODZ",
    "HEAD ICE",
    "BIG T",
    "CHEF TREZ",
    "JAKKBOY MAINE",
    "NJT",
    "FONZ",
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `battler-${i + 1}`,
    name: names[i] || `BATTLER ${i + 1}`,
    seed: i + 1,
    avatar: `/sprites/characters/sprite_${571 + (i % 100)}.png`,
    eliminated: false,
    elo: 1800 - i * 15,
  }))
}

// Create sample tournaments for different sizes
export function createSampleTournament(
  size: TournamentSize,
  id: string,
  name: string,
  league: string,
  simulateRounds = 0,
): TournamentBracket {
  let bracket = generateEmptyBracket(id, name, league, size)
  const battlers = generateMockBattlers(size)
  bracket = seedBattlers(bracket, battlers)

  // Simulate some rounds if requested
  for (let round = 1; round <= simulateRounds && round <= bracket.rounds; round++) {
    const roundMatches = bracket.matches.filter((m) => m.round === round && !m.completed)
    roundMatches.forEach((match) => {
      if (match.battler1 && match.battler2) {
        // Randomly pick winner (favor higher seed slightly)
        const winner = Math.random() < 0.6 ? match.battler1 : match.battler2
        const scores = ["2-1", "3-0", "2-1", "2-1", "3-0"]
        bracket = recordMatchResult(bracket, match.id, winner.id, scores[Math.floor(Math.random() * scores.length)])
      }
    })
  }

  return bracket
}
