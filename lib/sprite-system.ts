export interface CrowdSprite {
  id: string
  demographic: "black" | "white" | "mixed"
  reaction:
    | "hype"
    | "cheer"
    | "laugh"
    | "stunned"
    | "watch"
    | "record"
    | "think"
    | "talk"
    | "listen"
    | "cringe"
    | "boo"
    | "pause"
    | "confused"
  variant: number
  path: string
}

export interface CitySprite {
  id: string
  cityName: string
  timeOfDay: "day" | "dusk" | "night"
  aspectRatio: "16:9" | "21:9"
  path: string
}

export interface BadgeSprite {
  id: string
  name: string
  category: "content" | "positive" | "negative"
  path: string
}

export interface LeagueSprite {
  id: string
  name: string
  variant: number
  path: string
}

// Crowd reaction weights by score differential
export function getCrowdReactionWeights(scoreDiff: number): Record<string, number> {
  if (scoreDiff >= 3) {
    // Dominant performance
    return { hype: 40, cheer: 30, laugh: 15, stunned: 10, watch: 5 }
  } else if (scoreDiff >= 1) {
    // Winning
    return { hype: 20, cheer: 35, laugh: 20, watch: 15, record: 10 }
  } else if (scoreDiff === 0) {
    // Even
    return { watch: 40, record: 20, think: 20, cheer: 10, hype: 10 }
  } else if (scoreDiff <= -3) {
    // Getting dominated
    return { cringe: 30, boo: 25, watch: 20, confused: 15, talk: 10 }
  } else {
    // Losing
    return { watch: 30, cringe: 20, think: 20, boo: 15, talk: 15 }
  }
}

// Select random crowd sprites based on demographics and reaction
export function selectCrowdSprites(
  count: number,
  demographics: { black: number; white: number; mixed: number },
  reactionWeights: Record<string, number>,
): CrowdSprite[] {
  const sprites: CrowdSprite[] = []

  // Generate demographic distribution
  const demoPool: Array<"black" | "white" | "mixed"> = []
  const total = demographics.black + demographics.white + demographics.mixed

  for (let i = 0; i < count; i++) {
    const rand = Math.random() * total
    let demo: "black" | "white" | "mixed"

    if (rand < demographics.black) {
      demo = "black"
    } else if (rand < demographics.black + demographics.white) {
      demo = "white"
    } else {
      demo = "mixed"
    }

    // Select reaction based on weights
    const reactions = Object.keys(reactionWeights)
    const weights = Object.values(reactionWeights)
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    const randReaction = Math.random() * totalWeight

    let sum = 0
    let reaction = reactions[0]
    for (let j = 0; j < reactions.length; j++) {
      sum += weights[j]
      if (randReaction < sum) {
        reaction = reactions[j]
        break
      }
    }

    // Random variant (1-10 for most reactions)
    const variant = Math.floor(Math.random() * 10) + 1
    const variantStr = variant.toString().padStart(3, "0")

    sprites.push({
      id: `${demo}_${reaction}_${variantStr}`,
      demographic: demo,
      reaction: reaction as any,
      variant,
      path: `/sprites/crowd/${demo}/${reaction}_${variantStr}.png`,
    })
  }

  return sprites
}

// City backdrop system
export const CITY_BACKDROPS: Record<string, CitySprite[]> = {
  miami: [
    {
      id: "miami-day",
      cityName: "Miami",
      timeOfDay: "day",
      aspectRatio: "16:9",
      path: "/sprites/cities/miami-day.png",
    },
  ],
  // More cities will be added as sprites are uploaded
}

export function getCityBackdrop(cityName: string, timeOfDay: "day" | "dusk" | "night" = "day"): CitySprite | null {
  const cityKey = cityName.toLowerCase().replace(/\s+/g, "-")
  const backdrops = CITY_BACKDROPS[cityKey]

  if (!backdrops) return null

  const backdrop = backdrops.find((b) => b.timeOfDay === timeOfDay)
  return backdrop || backdrops[0] // Fallback to first available
}
