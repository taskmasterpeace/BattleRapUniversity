/**
 * Metrics Calculator
 *
 * Centralizes all battle simulation metrics calculations for transparency.
 * Exposes hidden calculations so they can be displayed in the UI.
 */

import type { ContentType, DeliveryType, PerformanceType, PrepLevels } from '@/lib/round-crafting'
import { calculateAverageEffectiveness, getEffectiveness, getEffectivenessLabel } from '@/ai-battlerap/lib/game/contentEffectiveness'
import {
  getAllContentBonuses,
  getBadgeBonusSummary,
  calculateEffectivenessWithBadges,
  type BattlerContentBonuses,
} from '@/ai-battlerap/lib/game/badgeContentBonuses'

// =====================================================
// METRICS TYPES
// =====================================================

export interface BattlerPowerMetrics {
  writingPower: number
  performancePower: number
  weightedBase: number
  writingBonus: number
  performanceBonus: number
  modifiedWriting: number
  modifiedPerformance: number
  leagueWeight: {
    writing: number
    performance: number
  }
}

export interface RiskMetrics {
  chokeBaseProbability: number
  chokeProbabilityPerSegment: number
  stumbleProbabilityPerSegment: number
  expectedChokesPerRound: number
  expectedStumblesPerRound: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface EffectivenessMetrics {
  yourMultiplier: number
  opponentMultiplier: number
  netAdvantage: number
  strongMatchups: { content: string; multiplier: number; label: string }[]
  weakMatchups: { content: string; multiplier: number; label: string }[]
}

export interface SegmentMetrics {
  segmentNumber: number
  baseScore: number
  prepWritingBonus: number
  prepPerformanceBonus: number
  varianceRoll: number
  effectivenessMultiplier: number
  badgeBonus: number
  rawScore: number
  finalScore: number
  events: string[]
  crowdReaction: number
  crowdBreakdown: {
    scoreContribution: number
    performanceContribution: number
  }
}

export interface RoundMetricsSummary {
  averageScore: number
  peakScore: number
  consistencyScore: number
  crowdReaction: number
  haymakerCount: number
  stumbleCount: number
  chokeCount: number
  compositeScore: number
  compositeBreakdown: {
    avgContribution: number
    peakContribution: number
    crowdContribution: number
  }
  effectivenessMultiplier: number
  effectivenessImpact: number
}

export interface PreBattleAnalysis {
  battlerName: string
  powerMetrics: BattlerPowerMetrics
  riskMetrics: RiskMetrics
  prepSummary: {
    writingDays: number
    rehearsalDays: number
    researchDays: number
    restDays: number
    prepEffectiveness: number
  }
  badgeBonuses: { badge: string; contentType: string; bonus: number }[]
}

export interface MatchupAnalysis {
  effectivenessMetrics: EffectivenessMetrics
  recommendation: string
  confidenceLevel: 'high' | 'medium' | 'low'
}

// =====================================================
// CONSTANTS (from game config)
// =====================================================

const PREP_EFFECT_MULTIPLIER = 0.20 // 20% per day
const CHOKE_BASE_PROBABILITY = 0.015 // 1.5% per segment
const CHOKE_MINIMUM = 0.007 // 0.7% minimum
const CHOKE_MAXIMUM = 0.25 // 25% maximum
const STUMBLE_BASE_PROBABILITY = 0.050 // 5% per segment
const COMPOSITE_WEIGHTS = {
  average: 0.40,
  peak: 0.35,
  crowd: 0.25,
}

// =====================================================
// POWER CALCULATION
// =====================================================

/**
 * Calculate battler's base power metrics
 */
export function calculatePowerMetrics(
  attributes: {
    lyricism: number
    wordplay: number
    creativity: number
    stagePresence: number
    crowdControl: number
    delivery: number
  },
  prepLevels: {
    writing: number
    rehearsal: number
    research: number
    rest: number
  },
  leagueWeights: {
    writing: number
    performance: number
  } = { writing: 0.5, performance: 0.5 }
): BattlerPowerMetrics {
  // Base power calculations
  const writingPower = (attributes.lyricism + attributes.wordplay + attributes.creativity) / 3
  const performancePower = (attributes.stagePresence + attributes.crowdControl + attributes.delivery) / 3

  // Prep bonuses
  const writingBonus = prepLevels.writing * PREP_EFFECT_MULTIPLIER
  const performanceBonus = prepLevels.rehearsal * PREP_EFFECT_MULTIPLIER

  // Modified power (capped at 10)
  const modifiedWriting = Math.min(10, writingPower + writingBonus)
  const modifiedPerformance = Math.min(10, performancePower + performanceBonus)

  // Weighted base score
  const weightedBase = modifiedWriting * leagueWeights.writing + modifiedPerformance * leagueWeights.performance

  return {
    writingPower: parseFloat(writingPower.toFixed(2)),
    performancePower: parseFloat(performancePower.toFixed(2)),
    weightedBase: parseFloat(weightedBase.toFixed(2)),
    writingBonus: parseFloat(writingBonus.toFixed(2)),
    performanceBonus: parseFloat(performanceBonus.toFixed(2)),
    modifiedWriting: parseFloat(modifiedWriting.toFixed(2)),
    modifiedPerformance: parseFloat(modifiedPerformance.toFixed(2)),
    leagueWeight: leagueWeights,
  }
}

// =====================================================
// RISK CALCULATION
// =====================================================

/**
 * Calculate choke/stumble risk metrics
 */
export function calculateRiskMetrics(
  resilience: number,
  prepRehearsal: number,
  segmentsPerRound: number = 6,
  badges: string[] = []
): RiskMetrics {
  // Base choke probability with resilience modifier
  let chokeProb = CHOKE_BASE_PROBABILITY - (resilience - 5) * 0.008
  chokeProb = Math.max(CHOKE_MINIMUM, Math.min(CHOKE_MAXIMUM, chokeProb))

  // Badge modifiers
  if (badges.includes('choker')) chokeProb += 0.070 // +7% per segment
  if (badges.includes('clutch_performer')) chokeProb -= 0.030 // -3%
  if (badges.includes('freestyle_genius')) chokeProb -= 0.025 // -2.5%
  if (badges.includes('composed')) chokeProb -= 0.015 // -1.5%
  if (badges.includes('gunslinger')) chokeProb += 0.005 // +0.5%

  chokeProb = Math.max(CHOKE_MINIMUM, Math.min(CHOKE_MAXIMUM, chokeProb))

  // Stumble probability based on rehearsal
  let stumbleProb = STUMBLE_BASE_PROBABILITY
  if (prepRehearsal < 3) stumbleProb += 0.10 // Under-rehearsed
  if (prepRehearsal >= 7) stumbleProb -= 0.02 // Well-rehearsed

  // Expected events per round
  const expectedChokes = chokeProb * segmentsPerRound
  const expectedStumbles = stumbleProb * segmentsPerRound

  // Risk level assessment
  let riskLevel: RiskMetrics['riskLevel'] = 'low'
  if (expectedChokes > 0.3 || expectedStumbles > 0.5) riskLevel = 'medium'
  if (expectedChokes > 0.5 || expectedStumbles > 0.8) riskLevel = 'high'
  if (expectedChokes > 1.0) riskLevel = 'critical'

  return {
    chokeBaseProbability: CHOKE_BASE_PROBABILITY,
    chokeProbabilityPerSegment: parseFloat((chokeProb * 100).toFixed(2)),
    stumbleProbabilityPerSegment: parseFloat((stumbleProb * 100).toFixed(2)),
    expectedChokesPerRound: parseFloat(expectedChokes.toFixed(2)),
    expectedStumblesPerRound: parseFloat(expectedStumbles.toFixed(2)),
    riskLevel,
  }
}

// =====================================================
// EFFECTIVENESS CALCULATION
// =====================================================

/**
 * Calculate effectiveness metrics between two content selections
 */
export function calculateEffectivenessMetrics(
  yourContent: (ContentType | DeliveryType | PerformanceType)[],
  opponentContent: (ContentType | DeliveryType | PerformanceType)[]
): EffectivenessMetrics {
  const yourMult = calculateAverageEffectiveness(yourContent, opponentContent)
  const oppMult = calculateAverageEffectiveness(opponentContent, yourContent)
  const netAdvantage = yourMult - oppMult

  // Find strong and weak individual matchups
  const strongMatchups: EffectivenessMetrics['strongMatchups'] = []
  const weakMatchups: EffectivenessMetrics['weakMatchups'] = []

  for (const yourType of yourContent) {
    for (const oppType of opponentContent) {
      const mult = getEffectiveness(yourType, oppType)
      if (mult === 2.0) {
        strongMatchups.push({
          content: `${yourType} vs ${oppType}`,
          multiplier: mult,
          label: getEffectivenessLabel(mult),
        })
      } else if (mult === 0.5) {
        weakMatchups.push({
          content: `${yourType} vs ${oppType}`,
          multiplier: mult,
          label: getEffectivenessLabel(mult),
        })
      }
    }
  }

  return {
    yourMultiplier: parseFloat(yourMult.toFixed(3)),
    opponentMultiplier: parseFloat(oppMult.toFixed(3)),
    netAdvantage: parseFloat(netAdvantage.toFixed(3)),
    strongMatchups,
    weakMatchups,
  }
}

/**
 * Calculate effectiveness metrics WITH badge bonuses applied
 * This shows the full picture including soft specialization from badges
 */
export function calculateEffectivenessWithBadgeMetrics(
  yourContent: (ContentType | DeliveryType | PerformanceType)[],
  opponentContent: (ContentType | DeliveryType | PerformanceType)[],
  yourBadges: string[],
  opponentBadges: string[]
): EffectivenessMetrics & {
  yourBadgeBonuses: { content: string; badge: string; bonus: number }[]
  opponentBadgeBonuses: { content: string; badge: string; bonus: number }[]
  yourBaseMultiplier: number
  opponentBaseMultiplier: number
} {
  // Calculate base effectiveness (without badges)
  const yourBaseMult = calculateAverageEffectiveness(yourContent, opponentContent)
  const oppBaseMult = calculateAverageEffectiveness(opponentContent, yourContent)

  // Calculate effectiveness with badge bonuses
  const yourMult = calculateEffectivenessWithBadges(yourBaseMult, yourBadges, yourContent)
  const oppMult = calculateEffectivenessWithBadges(oppBaseMult, opponentBadges, opponentContent)
  const netAdvantage = yourMult - oppMult

  // Find strong and weak individual matchups
  const strongMatchups: EffectivenessMetrics['strongMatchups'] = []
  const weakMatchups: EffectivenessMetrics['weakMatchups'] = []

  for (const yourType of yourContent) {
    for (const oppType of opponentContent) {
      const mult = getEffectiveness(yourType, oppType)
      if (mult === 2.0) {
        strongMatchups.push({
          content: `${yourType} vs ${oppType}`,
          multiplier: mult,
          label: getEffectivenessLabel(mult),
        })
      } else if (mult === 0.5) {
        weakMatchups.push({
          content: `${yourType} vs ${oppType}`,
          multiplier: mult,
          label: getEffectivenessLabel(mult),
        })
      }
    }
  }

  // Get badge bonuses for display
  const yourBadgeBonuses = getBadgeBonusSummary(yourBadges, yourContent)
  const opponentBadgeBonuses = getBadgeBonusSummary(opponentBadges, opponentContent)

  return {
    yourMultiplier: parseFloat(yourMult.toFixed(3)),
    opponentMultiplier: parseFloat(oppMult.toFixed(3)),
    netAdvantage: parseFloat(netAdvantage.toFixed(3)),
    strongMatchups,
    weakMatchups,
    yourBadgeBonuses,
    opponentBadgeBonuses,
    yourBaseMultiplier: parseFloat(yourBaseMult.toFixed(3)),
    opponentBaseMultiplier: parseFloat(oppBaseMult.toFixed(3)),
  }
}

// =====================================================
// COMPOSITE SCORE CALCULATION
// =====================================================

/**
 * Calculate composite round score from individual metrics
 */
export function calculateCompositeScore(
  averageScore: number,
  peakScore: number,
  crowdReaction: number // 0-100
): {
  compositeScore: number
  breakdown: {
    avgContribution: number
    peakContribution: number
    crowdContribution: number
  }
} {
  const avgContrib = averageScore * COMPOSITE_WEIGHTS.average
  const peakContrib = peakScore * COMPOSITE_WEIGHTS.peak
  const crowdContrib = (crowdReaction / 100) * 10 * COMPOSITE_WEIGHTS.crowd // Scale to 0-10

  const composite = avgContrib + peakContrib + crowdContrib

  return {
    compositeScore: parseFloat(composite.toFixed(3)),
    breakdown: {
      avgContribution: parseFloat(avgContrib.toFixed(3)),
      peakContribution: parseFloat(peakContrib.toFixed(3)),
      crowdContribution: parseFloat(crowdContrib.toFixed(3)),
    },
  }
}

// =====================================================
// CONSISTENCY CALCULATION
// =====================================================

/**
 * Calculate consistency score from segment scores
 */
export function calculateConsistencyScore(segmentScores: number[]): number {
  if (segmentScores.length === 0) return 10

  const avg = segmentScores.reduce((a, b) => a + b, 0) / segmentScores.length
  const variance = segmentScores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / segmentScores.length
  const stdDev = Math.sqrt(variance)

  // Higher consistency = lower variance = score closer to 10
  const consistency = Math.max(0, Math.min(10, 10 - stdDev * 2))
  return parseFloat(consistency.toFixed(2))
}

// =====================================================
// PRE-BATTLE ANALYSIS
// =====================================================

/**
 * Generate complete pre-battle analysis for a battler
 */
export function generatePreBattleAnalysis(
  battlerName: string,
  attributes: {
    lyricism: number
    wordplay: number
    creativity: number
    stagePresence: number
    crowdControl: number
    delivery: number
    resilience: number
  },
  prepLevels: {
    writing: number
    rehearsal: number
    research: number
    rest: number
  },
  badges: string[],
  leagueWeights: { writing: number; performance: number } = { writing: 0.5, performance: 0.5 },
  segmentsPerRound: number = 6
): PreBattleAnalysis {
  const powerMetrics = calculatePowerMetrics(attributes, prepLevels, leagueWeights)
  const riskMetrics = calculateRiskMetrics(
    attributes.resilience,
    prepLevels.rehearsal,
    segmentsPerRound,
    badges
  )

  // Calculate prep effectiveness (how close to ideal prep)
  const totalPrepDays = prepLevels.writing + prepLevels.rehearsal + prepLevels.research + prepLevels.rest
  const idealPrepDays = 10
  const prepEffectiveness = Math.min(1, totalPrepDays / idealPrepDays)

  // Badge bonuses for content types - using centralized badge system
  const badgeBonusData = getAllContentBonuses(badges)
  const badgeBonuses: PreBattleAnalysis['badgeBonuses'] = badgeBonusData.bonuses.map(b => ({
    badge: b.contributingBadges.join(', '),
    contentType: b.contentType.replace(/_/g, ' '),
    bonus: b.totalBonus,
  }))

  return {
    battlerName,
    powerMetrics,
    riskMetrics,
    prepSummary: {
      writingDays: prepLevels.writing,
      rehearsalDays: prepLevels.rehearsal,
      researchDays: prepLevels.research,
      restDays: prepLevels.rest,
      prepEffectiveness: parseFloat((prepEffectiveness * 100).toFixed(0)),
    },
    badgeBonuses,
  }
}

// =====================================================
// MATCHUP ANALYSIS
// =====================================================

/**
 * Generate matchup analysis between two battlers
 */
export function generateMatchupAnalysis(
  yourContent: (ContentType | DeliveryType | PerformanceType)[],
  opponentContent: (ContentType | DeliveryType | PerformanceType)[]
): MatchupAnalysis {
  const effectivenessMetrics = calculateEffectivenessMetrics(yourContent, opponentContent)

  // Generate recommendation
  let recommendation = 'Even matchup - execution will determine the outcome'
  let confidenceLevel: MatchupAnalysis['confidenceLevel'] = 'low'

  if (effectivenessMetrics.netAdvantage > 0.2) {
    recommendation = `Strong advantage! Your content selection counters opponent's style.`
    confidenceLevel = 'high'
  } else if (effectivenessMetrics.netAdvantage > 0.1) {
    recommendation = `Slight advantage. Consider emphasizing ${effectivenessMetrics.strongMatchups[0]?.content || 'your strengths'}.`
    confidenceLevel = 'medium'
  } else if (effectivenessMetrics.netAdvantage < -0.2) {
    recommendation = `Uphill battle! Opponent's content counters yours. Consider changing strategy.`
    confidenceLevel = 'high'
  } else if (effectivenessMetrics.netAdvantage < -0.1) {
    recommendation = `Slight disadvantage. Watch out for ${effectivenessMetrics.weakMatchups[0]?.content || 'weak matchups'}.`
    confidenceLevel = 'medium'
  }

  return {
    effectivenessMetrics,
    recommendation,
    confidenceLevel,
  }
}

// =====================================================
// ROUND METRICS AGGREGATION
// =====================================================

/**
 * Calculate all round-level metrics from segment data
 */
export function calculateRoundMetrics(
  segmentScores: number[],
  crowdReactions: number[],
  events: { chokes: number; stumbles: number; haymakers: number },
  effectivenessMultiplier: number = 1.0
): RoundMetricsSummary {
  const averageScore = segmentScores.reduce((a, b) => a + b, 0) / segmentScores.length
  const peakScore = Math.max(...segmentScores)
  const avgCrowd = crowdReactions.reduce((a, b) => a + b, 0) / crowdReactions.length
  const consistencyScore = calculateConsistencyScore(segmentScores)

  const { compositeScore, breakdown } = calculateCompositeScore(averageScore, peakScore, avgCrowd)

  // Calculate effectiveness impact (how much did content matchup affect score?)
  const effectivenessImpact = (effectivenessMultiplier - 1) * averageScore

  return {
    averageScore: parseFloat(averageScore.toFixed(2)),
    peakScore: parseFloat(peakScore.toFixed(2)),
    consistencyScore,
    crowdReaction: parseFloat(avgCrowd.toFixed(0)),
    haymakerCount: events.haymakers,
    stumbleCount: events.stumbles,
    chokeCount: events.chokes,
    compositeScore,
    compositeBreakdown: breakdown,
    effectivenessMultiplier,
    effectivenessImpact: parseFloat(effectivenessImpact.toFixed(2)),
  }
}
