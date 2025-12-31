/**
 * Memorization & Comfort Threshold System
 *
 * This system tracks how "ready" a battler is based on their prep,
 * with self-awareness affecting how accurately they perceive their readiness.
 *
 * Key Concepts:
 * - ACTUAL MEMORIZATION: Real % of material memorized (based on rehearsal days)
 * - PERCEIVED MEMORIZATION: What the battler THINKS their memorization is
 * - COMFORT THRESHOLD: The point (usually ~70%) where choke risk drops significantly
 * - SELF-AWARENESS: How accurate the perceived vs actual memorization is
 */

export interface BattleFormat {
  rounds: number           // 1, 2, or 3 rounds
  segmentsPerRound: number // 4 (2-min) or 6 (3-min)
  formatName: string
}

export interface MemorizationState {
  // The real numbers
  actualMemorization: number      // 0-100%, true memorization level
  actualChokeRisk: number         // 0-100%, true choke risk per segment

  // What the battler perceives (shown to player, affected by self-awareness)
  perceivedMemorization: number   // 0-100%, what they THINK their memorization is
  perceivedReadiness: 'not_ready' | 'risky' | 'okay' | 'confident' | 'locked_in'

  // Threshold info
  comfortThreshold: number        // The % needed to feel "safe" (usually 70)
  isAboveThreshold: boolean       // True if actual >= threshold
  perceivedAboveThreshold: boolean // What they THINK (may be wrong)

  // Accuracy info
  perceptionAccuracy: number      // How close perceived is to actual (0-100%)
  isOverconfident: boolean        // Thinks they're more ready than they are
  isUnderconfident: boolean       // Thinks they're less ready than they are

  // Debug info
  selfAwarenessLevel: number
  rehearsalDays: number
  requiredDays: number
}

/**
 * Calculate how many rehearsal days are needed for a battle format
 */
export function calculateRequiredRehearsalDays(format: BattleFormat): number {
  const totalSegments = format.rounds * format.segmentsPerRound
  // Rule: ~1 day per 2 segments for full memorization
  // 3 rounds x 4 segments = 12 segments = 6 days for 100%
  // 3 rounds x 6 segments = 18 segments = 9 days for 100%
  return Math.ceil(totalSegments / 2)
}

/**
 * Calculate actual memorization percentage based on rehearsal days
 */
export function calculateActualMemorization(
  rehearsalDays: number,
  format: BattleFormat
): number {
  const required = calculateRequiredRehearsalDays(format)

  if (rehearsalDays <= 0) {
    return 0 // No rehearsal = nothing memorized
  }

  // Diminishing returns after 100% - extra practice helps but doesn't go above 100
  const rawPercent = (rehearsalDays / required) * 100

  // Cap at 100%, but track that they over-prepared
  return Math.min(100, rawPercent)
}

/**
 * Calculate the comfort threshold for a battler
 * This is the memorization % where they feel "safe"
 *
 * Base threshold: 70%
 * Modified by resilience and experience
 */
export function calculateComfortThreshold(
  resilience: number = 5,  // 1-10
  battlesCompleted: number = 0
): number {
  // Base threshold: 70% memorization needed to feel safe
  let threshold = 70

  // High resilience lowers the threshold (they can handle more risk)
  // Low resilience raises it (they need more security)
  // Range: 60-80%
  threshold -= (resilience - 5) * 2  // resilience 10 = 60%, resilience 1 = 78%

  // Experience also lowers threshold slightly (veterans know they can recover)
  const experienceBonus = Math.min(5, Math.floor(battlesCompleted / 10))
  threshold -= experienceBonus

  return Math.max(50, Math.min(85, threshold))
}

/**
 * Calculate perceived memorization (what the battler THINKS)
 * Self-awareness affects accuracy
 *
 * HIGH self-awareness (8-10): Perceived is very close to actual
 * MID self-awareness (5-7): Some variance, slight over/underconfidence
 * LOW self-awareness (1-4): Can be way off, often overconfident
 */
export function calculatePerceivedMemorization(
  actualMemorization: number,
  selfAwareness: number, // 1-10
  badges: string[] = []
): { perceived: number; isOverconfident: boolean; isUnderconfident: boolean } {
  // Badge modifiers to self-awareness
  let adjustedSA = selfAwareness
  if (badges.includes('self_aware')) {
    adjustedSA += 3 // Much more accurate perception
  }
  if (badges.includes('clutch_performer')) {
    adjustedSA += 2
  }
  if (badges.includes('overconfident')) {
    adjustedSA -= 3 // Less accurate, biased toward overconfidence
  }
  if (badges.includes('overthinking')) {
    adjustedSA -= 2 // Less accurate, biased toward underconfidence
  }
  if (badges.includes('gunslinger')) {
    adjustedSA -= 1 // Slightly less aware
  }
  adjustedSA = Math.max(1, Math.min(10, adjustedSA))

  // Normalize self-awareness to 0-1
  const awareness = adjustedSA / 10

  // Max error based on self-awareness
  // SA 10 = max 5% error
  // SA 5 = max 20% error
  // SA 1 = max 40% error
  const maxError = (1 - awareness) * 40 + 5

  // Random error within range, biased toward overconfidence for low SA
  // Overthinking badge biases toward underconfidence
  // Overconfident badge biases toward overconfidence
  let error = 0
  const hasOverthinking = badges.includes('overthinking')
  const hasOverconfident = badges.includes('overconfident')

  if (hasOverconfident) {
    // Overconfident: always thinks they're more ready than they are
    error = Math.random() * maxError // Always positive error
  } else if (hasOverthinking) {
    // Overthinking: always thinks they're less ready than they are
    error = -Math.random() * maxError // Always negative error
  } else if (adjustedSA <= 4) {
    // Low SA: 70% chance of overconfidence
    error = Math.random() < 0.7
      ? Math.random() * maxError  // Overconfident (positive error)
      : -Math.random() * maxError * 0.5  // Underconfident (smaller negative)
  } else if (adjustedSA <= 7) {
    // Mid SA: 50/50 split
    error = (Math.random() - 0.5) * maxError * 2
  } else {
    // High SA: Small random variance, no bias
    error = (Math.random() - 0.5) * maxError
  }

  const perceived = Math.max(0, Math.min(100, actualMemorization + error))

  return {
    perceived: Math.round(perceived),
    isOverconfident: perceived > actualMemorization + 5,
    isUnderconfident: perceived < actualMemorization - 5
  }
}

/**
 * Calculate choke risk based on memorization and threshold
 */
export function calculateChokeRiskFromMemorization(
  actualMemorization: number,
  comfortThreshold: number,
  resilience: number = 5,
  badges: string[] = []
): number {
  // Base choke risk calculation
  // Below threshold: 5-25% risk
  // Above threshold: 1-5% risk
  // Way above threshold (100%+): minimal risk

  let chokeRisk = 0

  if (actualMemorization >= comfortThreshold) {
    // Above threshold - low risk
    const surplus = actualMemorization - comfortThreshold
    chokeRisk = Math.max(1, 5 - (surplus / 10)) // 1-5%
  } else {
    // Below threshold - risk scales with how far below
    const deficit = comfortThreshold - actualMemorization
    chokeRisk = 5 + (deficit / 3) // 5% base + up to 23% more

    // Zero memorization is catastrophic
    if (actualMemorization === 0) {
      chokeRisk = 35 // Very high risk
    } else if (actualMemorization < 20) {
      chokeRisk = Math.max(chokeRisk, 25) // At least 25%
    }
  }

  // Resilience modifier
  const resilienceModifier = (5 - resilience) * 1.5 // -6% to +6%
  chokeRisk += resilienceModifier

  // Badge modifiers
  if (badges.includes('known_choker') || badges.includes('choker')) {
    chokeRisk += 10
  }
  if (badges.includes('clutch_performer')) {
    chokeRisk -= 5
  }
  if (badges.includes('freestyle_genius')) {
    chokeRisk -= 8 // Can improvise if they forget
  }
  if (badges.includes('bars_on_lock')) {
    chokeRisk -= 3 // Material stays locked in
  }
  if (badges.includes('gunslinger')) {
    // Gunslinger is comfortable with low memorization but still has variance
    if (actualMemorization < 50) {
      chokeRisk -= 5 // Less worried about low memorization
    }
  }

  return Math.max(1, Math.min(50, Math.round(chokeRisk)))
}

/**
 * Convert memorization % to a readiness label
 */
export function getReadinessLabel(
  memorization: number,
  threshold: number
): 'not_ready' | 'risky' | 'okay' | 'confident' | 'locked_in' {
  if (memorization >= 100) return 'locked_in'
  if (memorization >= threshold + 15) return 'confident'
  if (memorization >= threshold) return 'okay'
  if (memorization >= threshold - 20) return 'risky'
  return 'not_ready'
}

/**
 * Master function: Calculate full memorization state for a battler
 */
export function calculateMemorizationState(
  rehearsalDays: number,
  format: BattleFormat,
  selfAwareness: number,
  resilience: number = 5,
  battlesCompleted: number = 0,
  badges: string[] = []
): MemorizationState {
  const requiredDays = calculateRequiredRehearsalDays(format)
  const actualMemorization = calculateActualMemorization(rehearsalDays, format)
  const comfortThreshold = calculateComfortThreshold(resilience, battlesCompleted)
  const { perceived, isOverconfident, isUnderconfident } = calculatePerceivedMemorization(
    actualMemorization,
    selfAwareness,
    badges
  )
  const actualChokeRisk = calculateChokeRiskFromMemorization(
    actualMemorization,
    comfortThreshold,
    resilience,
    badges
  )

  const isAboveThreshold = actualMemorization >= comfortThreshold
  const perceivedAboveThreshold = perceived >= comfortThreshold

  // How accurate is their perception?
  const perceptionError = Math.abs(perceived - actualMemorization)
  const perceptionAccuracy = Math.max(0, 100 - perceptionError * 2)

  return {
    actualMemorization: Math.round(actualMemorization),
    actualChokeRisk,
    perceivedMemorization: Math.round(perceived),
    perceivedReadiness: getReadinessLabel(perceived, comfortThreshold),
    comfortThreshold,
    isAboveThreshold,
    perceivedAboveThreshold,
    perceptionAccuracy: Math.round(perceptionAccuracy),
    isOverconfident,
    isUnderconfident,
    selfAwarenessLevel: selfAwareness,
    rehearsalDays,
    requiredDays
  }
}

/**
 * Get a text description of the battler's perceived state
 * This is what they would SAY about their readiness
 */
export function getPerceivedStateDescription(state: MemorizationState): string {
  const { perceivedReadiness, isOverconfident, isUnderconfident, perceivedMemorization } = state

  if (perceivedReadiness === 'locked_in') {
    if (isOverconfident) {
      return "I got this. Every bar is LOCKED. Let's go!" // But they might be wrong...
    }
    return "Material is 100% memorized. Ready to perform."
  }

  if (perceivedReadiness === 'confident') {
    if (isOverconfident) {
      return "I'm feeling good about this one. Should be smooth."
    }
    return `${perceivedMemorization}% memorized. Feeling confident.`
  }

  if (perceivedReadiness === 'okay') {
    if (isUnderconfident) {
      return "I think I'm ready... mostly. Might need to look at a few bars again."
    }
    return "Above the threshold. Should be okay."
  }

  if (perceivedReadiness === 'risky') {
    if (isOverconfident) {
      return "It'll come to me when I'm up there. Always does." // Famous last words
    }
    return "Still working on it. Might be a little shaky."
  }

  // not_ready
  if (isOverconfident) {
    return "I mean, I know my style. I'll figure it out." // Danger zone
  }
  return "Not ready. Need more time with this material."
}

/**
 * Get a warning if the battler's perception is significantly off
 * This is for UI hints (maybe shown to player with high game knowledge)
 */
export function getPerceptionWarning(state: MemorizationState): string | null {
  if (state.perceptionAccuracy >= 80) {
    return null // Perception is close enough
  }

  if (state.isOverconfident && !state.isAboveThreshold && state.perceivedAboveThreshold) {
    return "Warning: Battler may be overestimating their readiness"
  }

  if (state.isUnderconfident && state.isAboveThreshold && !state.perceivedAboveThreshold) {
    return "Note: Battler is more prepared than they realize"
  }

  if (state.isOverconfident) {
    return "Battler confidence may not match actual preparation"
  }

  return null
}
