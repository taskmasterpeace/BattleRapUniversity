import type { SecretType } from '@/components/ui/secret-badge'

// How secrets can be discovered
export type DiscoveryMethod =
  | 'research'      // Through prep research phase
  | 'crew'          // Crew member shares intel
  | 'blogger'       // Media/blogger reveals
  | 'life_event'    // Triggered by life events
  | 'battle'        // Revealed during/after battle
  | 'social_media'  // Public posts, receipts

// Full secret definition for game mechanics
export interface SecretDefinition {
  type: SecretType
  name: string
  description: string

  // How damaging this secret is when exposed
  damageLevel: 1 | 2 | 3 | 4 | 5

  // What attributes are affected when exposed
  attributeEffects: {
    reputation?: number    // Usually negative
    resilience?: number    // Usually negative
    financial?: number     // For broke/addiction
    family?: number        // For personal secrets
  }

  // Battle effects when used as an angle
  battleEffects: {
    crowdReaction: number     // +/- to crowd reaction
    opponentMorale: number    // Morale hit to opponent
    riskOfBackfire: number    // % chance it backfires if weak delivery
  }

  // How this secret can be discovered
  discoveryMethods: DiscoveryMethod[]
  discoveryDifficulty: 'easy' | 'medium' | 'hard' | 'very_hard'

  // Days of research needed to uncover (if through research)
  researchDaysRequired: number

  // Can this secret be "owned" / pre-empted (8 Mile style)?
  canBeOwned: boolean

  // If owned, how much damage reduction?
  ownedDamageReduction: number // percentage

  // Possible angles to use this secret
  angleTypes: string[]

  // Can this be made up / fabricated?
  canBeFabricated: boolean

  // If fabricated without proof, backfire chance
  fabricationBackfireChance: number
}

export const SECRETS: Record<SecretType, SecretDefinition> = {
  'snitch': {
    type: 'snitch',
    name: 'Snitch',
    description: 'Known to give up information to authorities or rivals',
    damageLevel: 5,
    attributeEffects: {
      reputation: -3,
      resilience: -1,
    },
    battleEffects: {
      crowdReaction: 25,      // Crowd goes crazy for snitch exposure
      opponentMorale: -30,    // Devastating morale hit
      riskOfBackfire: 15,     // Can backfire if not delivered well
    },
    discoveryMethods: ['research', 'crew', 'blogger'],
    discoveryDifficulty: 'hard',
    researchDaysRequired: 5,
    canBeOwned: false,        // You can't really "own" being a snitch
    ownedDamageReduction: 0,
    angleTypes: ['character', 'street_cred', 'loyalty'],
    canBeFabricated: true,    // Can accuse without proof
    fabricationBackfireChance: 40, // High risk if no receipts
  },

  'substance-abuse': {
    type: 'substance-abuse',
    name: 'Substance Abuse',
    description: 'Has known issues with drugs or alcohol',
    damageLevel: 3,
    attributeEffects: {
      reputation: -1,
      resilience: -2,
      family: -1,
    },
    battleEffects: {
      crowdReaction: 10,
      opponentMorale: -15,
      riskOfBackfire: 30,     // High risk - could seem low/personal
    },
    discoveryMethods: ['research', 'blogger', 'life_event', 'social_media'],
    discoveryDifficulty: 'medium',
    researchDaysRequired: 3,
    canBeOwned: true,         // Can address it openly
    ownedDamageReduction: 60, // Reduces impact significantly
    angleTypes: ['personal', 'lifestyle', 'reliability'],
    canBeFabricated: false,   // Need proof
    fabricationBackfireChance: 70,
  },

  'crew-beef': {
    type: 'crew-beef',
    name: 'Crew Beef',
    description: 'Has internal conflict or falling out with crew members',
    damageLevel: 2,
    attributeEffects: {
      reputation: -1,
    },
    battleEffects: {
      crowdReaction: 15,
      opponentMorale: -10,
      riskOfBackfire: 20,
    },
    discoveryMethods: ['research', 'crew', 'blogger', 'social_media'],
    discoveryDifficulty: 'easy',
    researchDaysRequired: 2,
    canBeOwned: true,
    ownedDamageReduction: 50,
    angleTypes: ['loyalty', 'character', 'relationships'],
    canBeFabricated: true,
    fabricationBackfireChance: 30,
  },

  'addiction': {
    type: 'addiction',
    name: 'Addiction',
    description: 'Actively struggling with addiction',
    damageLevel: 4,
    attributeEffects: {
      reputation: -2,
      resilience: -2,
      financial: -2,
      family: -1,
    },
    battleEffects: {
      crowdReaction: 5,       // Lower - seen as punching down
      opponentMorale: -20,
      riskOfBackfire: 40,     // Very high risk of backfire
    },
    discoveryMethods: ['life_event', 'blogger'],
    discoveryDifficulty: 'medium',
    researchDaysRequired: 4,
    canBeOwned: true,         // Addressing struggles can be powerful
    ownedDamageReduction: 70,
    angleTypes: ['personal', 'reliability', 'lifestyle'],
    canBeFabricated: false,
    fabricationBackfireChance: 80,
  },

  'no-show': {
    type: 'no-show',
    name: 'No Show History',
    description: 'Has ducked battles or failed to show up',
    damageLevel: 2,
    attributeEffects: {
      reputation: -2,
    },
    battleEffects: {
      crowdReaction: 20,
      opponentMorale: -10,
      riskOfBackfire: 10,     // Safe angle to use
    },
    discoveryMethods: ['research', 'blogger'],
    discoveryDifficulty: 'easy',
    researchDaysRequired: 1,
    canBeOwned: true,
    ownedDamageReduction: 40,
    angleTypes: ['character', 'reliability', 'career'],
    canBeFabricated: false,   // Either happened or it didn't
    fabricationBackfireChance: 90,
  },

  'broke': {
    type: 'broke',
    name: 'Financial Troubles',
    description: 'Struggling financially, possible debt',
    damageLevel: 2,
    attributeEffects: {
      financial: -3,
      reputation: -1,
    },
    battleEffects: {
      crowdReaction: 12,
      opponentMorale: -8,
      riskOfBackfire: 25,     // Can seem petty
    },
    discoveryMethods: ['research', 'crew', 'life_event', 'social_media'],
    discoveryDifficulty: 'medium',
    researchDaysRequired: 3,
    canBeOwned: true,         // "I came from nothing" angle
    ownedDamageReduction: 55,
    angleTypes: ['lifestyle', 'success', 'career'],
    canBeFabricated: true,
    fabricationBackfireChance: 35,
  },

  'shady-deal': {
    type: 'shady-deal',
    name: 'Shady Dealings',
    description: 'Involved in questionable business or deals',
    damageLevel: 3,
    attributeEffects: {
      reputation: -2,
    },
    battleEffects: {
      crowdReaction: 18,
      opponentMorale: -15,
      riskOfBackfire: 20,
    },
    discoveryMethods: ['research', 'crew'],
    discoveryDifficulty: 'hard',
    researchDaysRequired: 4,
    canBeOwned: false,
    ownedDamageReduction: 0,
    angleTypes: ['character', 'loyalty', 'street_cred'],
    canBeFabricated: true,
    fabricationBackfireChance: 45,
  },

  'mental-health': {
    type: 'mental-health',
    name: 'Mental Health Struggles',
    description: 'Dealing with depression, anxiety, or other mental health issues',
    damageLevel: 3,
    attributeEffects: {
      resilience: -2,
      family: -1,
    },
    battleEffects: {
      crowdReaction: -5,      // Negative - crowd doesn't like this angle
      opponentMorale: -10,
      riskOfBackfire: 60,     // Very high risk - seen as low
    },
    discoveryMethods: ['life_event'],
    discoveryDifficulty: 'very_hard',
    researchDaysRequired: 6,
    canBeOwned: true,         // Owning mental health can be powerful
    ownedDamageReduction: 80,
    angleTypes: ['personal'],
    canBeFabricated: false,
    fabricationBackfireChance: 90,
  },

  'ghostwriter': {
    type: 'ghostwriter',
    name: 'Uses Ghostwriter',
    description: "Doesn't write their own bars",
    damageLevel: 5,
    attributeEffects: {
      reputation: -4,
    },
    battleEffects: {
      crowdReaction: 30,      // Huge crowd reaction
      opponentMorale: -35,    // Devastating
      riskOfBackfire: 10,     // Safe if you have proof
    },
    discoveryMethods: ['research', 'crew'],
    discoveryDifficulty: 'very_hard',
    researchDaysRequired: 7,
    canBeOwned: false,        // Can't really own this in battle rap
    ownedDamageReduction: 0,
    angleTypes: ['authenticity', 'skill', 'character'],
    canBeFabricated: true,
    fabricationBackfireChance: 50,
  },

  // NEW TYPES FROM RESEARCH

  'fake-gangster': {
    type: 'fake-gangster',
    name: 'Fake Gangster',
    description: 'Lying about street cred - not really about that life (Rick Ross, 6ix9ine style)',
    damageLevel: 5,
    attributeEffects: {
      reputation: -4,
    },
    battleEffects: {
      crowdReaction: 35,      // Massive - crowd loves exposing frauds
      opponentMorale: -40,    // Career-ending level
      riskOfBackfire: 15,
    },
    discoveryMethods: ['research', 'blogger', 'social_media'],
    discoveryDifficulty: 'hard',
    researchDaysRequired: 5,
    canBeOwned: false,        // Can't own being fake
    ownedDamageReduction: 0,
    angleTypes: ['authenticity', 'street_cred', 'character'],
    canBeFabricated: true,
    fabricationBackfireChance: 55,
  },

  'stolen-bars': {
    type: 'stolen-bars',
    name: 'Stolen Bars',
    description: 'Caught using someone else\'s material - plagiarism (Prez Mafia scandal)',
    damageLevel: 5,
    attributeEffects: {
      reputation: -4,
    },
    battleEffects: {
      crowdReaction: 28,
      opponentMorale: -35,
      riskOfBackfire: 5,      // Very safe if you have receipts
    },
    discoveryMethods: ['research', 'blogger'],
    discoveryDifficulty: 'medium',
    researchDaysRequired: 3,
    canBeOwned: false,
    ownedDamageReduction: 0,
    angleTypes: ['authenticity', 'skill', 'character'],
    canBeFabricated: false,   // Need the actual receipts
    fabricationBackfireChance: 95,
  },

  'baby-mama-drama': {
    type: 'baby-mama-drama',
    name: 'Baby Mama Drama',
    description: 'Child support issues, cheating, multiple kids by different women',
    damageLevel: 3,
    attributeEffects: {
      reputation: -1,
      family: -2,
      financial: -1,
    },
    battleEffects: {
      crowdReaction: 18,
      opponentMorale: -15,
      riskOfBackfire: 25,     // Can seem like punching down
    },
    discoveryMethods: ['research', 'social_media', 'blogger'],
    discoveryDifficulty: 'easy',
    researchDaysRequired: 2,
    canBeOwned: true,         // Can address and flip it
    ownedDamageReduction: 45,
    angleTypes: ['personal', 'relationships', 'character'],
    canBeFabricated: true,
    fabricationBackfireChance: 40,
  },

  'pressed': {
    type: 'pressed',
    name: 'Got Pressed',
    description: 'Got beat up, punked, or violated and didn\'t do anything about it',
    damageLevel: 4,
    attributeEffects: {
      reputation: -3,
      resilience: -1,
    },
    battleEffects: {
      crowdReaction: 25,
      opponentMorale: -25,
      riskOfBackfire: 15,
    },
    discoveryMethods: ['crew', 'blogger', 'social_media'],
    discoveryDifficulty: 'medium',
    researchDaysRequired: 3,
    canBeOwned: false,        // Hard to own getting pressed
    ownedDamageReduction: 20,
    angleTypes: ['street_cred', 'character', 'toughness'],
    canBeFabricated: true,
    fabricationBackfireChance: 50,
  },

  'charges-filed': {
    type: 'charges-filed',
    name: 'Filed Charges',
    description: 'Pressed charges after street beef - went to the police',
    damageLevel: 5,
    attributeEffects: {
      reputation: -4,
    },
    battleEffects: {
      crowdReaction: 30,      // Ultimate violation
      opponentMorale: -35,
      riskOfBackfire: 10,
    },
    discoveryMethods: ['research', 'blogger'],
    discoveryDifficulty: 'hard',
    researchDaysRequired: 5,
    canBeOwned: false,
    ownedDamageReduction: 0,
    angleTypes: ['street_cred', 'character', 'loyalty'],
    canBeFabricated: false,   // Court records exist or they don't
    fabricationBackfireChance: 85,
  },
}

// ========== HELPER FUNCTIONS ==========

// Get secrets by discovery difficulty
export function getSecretsByDifficulty(difficulty: SecretDefinition['discoveryDifficulty']): SecretType[] {
  return Object.values(SECRETS)
    .filter(s => s.discoveryDifficulty === difficulty)
    .map(s => s.type)
}

// Get secrets that can be discovered through a specific method
export function getSecretsByDiscoveryMethod(method: DiscoveryMethod): SecretType[] {
  return Object.values(SECRETS)
    .filter(s => s.discoveryMethods.includes(method))
    .map(s => s.type)
}

// Calculate total damage potential of a secret
export function getSecretDamagePotential(type: SecretType): number {
  const secret = SECRETS[type]
  const attrDamage = Object.values(secret.attributeEffects).reduce((sum, val) => sum + Math.abs(val || 0), 0)
  const battleImpact = secret.battleEffects.crowdReaction + Math.abs(secret.battleEffects.opponentMorale)
  return secret.damageLevel * 10 + attrDamage * 5 + battleImpact
}

// Get secrets that can be pre-empted / "owned" (8 Mile style)
export function getOwnableSecrets(): SecretType[] {
  return Object.values(SECRETS)
    .filter(s => s.canBeOwned)
    .map(s => s.type)
}

// Get secrets that can be fabricated (made up without proof)
export function getFabricatableSecrets(): SecretType[] {
  return Object.values(SECRETS)
    .filter(s => s.canBeFabricated)
    .map(s => s.type)
}

// Calculate research days needed based on battler's research stat
export function calculateResearchDays(type: SecretType, researchStat: number): number {
  const basedays = SECRETS[type].researchDaysRequired
  // Higher research stat reduces days needed (min 1)
  const reduction = Math.floor(researchStat / 3) // Every 3 points = 1 day reduction
  return Math.max(1, basedays - reduction)
}

// Calculate backfire chance based on delivery stat and whether secret is proven
export function calculateBackfireChance(
  type: SecretType,
  deliveryStat: number,
  hasProof: boolean,
  isFabricated: boolean
): number {
  const secret = SECRETS[type]
  let baseChance = secret.battleEffects.riskOfBackfire

  // If fabricated without proof, use the fabrication backfire chance
  if (isFabricated && !hasProof) {
    baseChance = secret.fabricationBackfireChance
  }

  // Delivery stat reduces backfire chance
  const deliveryReduction = deliveryStat * 3 // Each point = 3% reduction

  return Math.max(5, baseChance - deliveryReduction)
}

// ========== ANGLES VS PERSONALS ==========

// PERSONALS: Quick hits, individual attacks
// - Slot into segments
// - Lower setup time
// - Good for momentum

// ANGLES: Overarching narrative/theme
// - Build across multiple segments
// - Higher setup = higher payoff
// - Like Loaded Lux's father angle

export type ContentApproach = 'personal' | 'angle'

export interface SecretUsage {
  secretType: SecretType
  approach: ContentApproach
  hasProof: boolean
  isFabricated: boolean
  setupSegments: number // How many segments building to it (for angles)
}

// Calculate the impact of using a secret based on approach
export function calculateSecretImpact(usage: SecretUsage, deliveryStat: number): {
  crowdBonus: number
  moraleHit: number
  backfireChance: number
} {
  const secret = SECRETS[usage.secretType]
  let crowdBonus = secret.battleEffects.crowdReaction
  let moraleHit = secret.battleEffects.opponentMorale

  // ANGLES get bonus for setup (Lux building to the father angle)
  if (usage.approach === 'angle') {
    const setupMultiplier = 1 + (usage.setupSegments * 0.15) // 15% per setup segment
    crowdBonus = Math.round(crowdBonus * setupMultiplier)
    moraleHit = Math.round(moraleHit * setupMultiplier)
  }

  // PERSONALS are quicker but less impactful
  if (usage.approach === 'personal') {
    crowdBonus = Math.round(crowdBonus * 0.7) // 30% less impact
    moraleHit = Math.round(moraleHit * 0.7)
  }

  const backfireChance = calculateBackfireChance(
    usage.secretType,
    deliveryStat,
    usage.hasProof,
    usage.isFabricated
  )

  return { crowdBonus, moraleHit, backfireChance }
}
