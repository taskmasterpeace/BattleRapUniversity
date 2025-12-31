/**
 * Round Strategy Templates
 *
 * Predefined content/delivery/performance bundles for quick selection.
 * Players can pick a strategy to auto-fill their round, then customize if desired.
 */

import type { ContentType, DeliveryType, PerformanceType } from '@/lib/round-crafting'
import { calculateAverageEffectiveness } from '@/ai-battlerap/lib/game/contentEffectiveness'

// =====================================================
// STRATEGY TYPES
// =====================================================

export interface RoundStrategy {
  id: string
  name: string
  description: string
  contentTypes: ContentType[]
  deliveryType: DeliveryType
  performanceType: PerformanceType
  strengths: string[]
  weaknesses: string[]
  bestAgainst: string[]
  worstAgainst: string[]
}

// =====================================================
// STRATEGY TEMPLATES (8 Total)
// =====================================================

export const ROUND_STRATEGIES: RoundStrategy[] = [
  // Technical / Bar-Heavy Strategies
  {
    id: 'technical_assault',
    name: 'Technical Assault',
    description: 'Overwhelming pen game with complex wordplay and schemes',
    contentTypes: ['wordplay', 'schemes', 'punchlines'],
    deliveryType: 'smooth_flow',
    performanceType: 'strategic_pauses',
    strengths: ['Gun bars (2.0x)', 'Shock value (2.0x)'],
    weaknesses: ['Comedy (0.5x)', 'Street talk (0.5x)'],
    bestAgainst: ['street_pressure', 'high_energy'],
    worstAgainst: ['entertainment_package', 'street_pressure'],
  },
  {
    id: 'scheme_heavy',
    name: 'Scheme Heavy',
    description: 'Extended metaphors and multi-bar setups with big payoffs',
    contentTypes: ['schemes', 'storytelling', 'wordplay'],
    deliveryType: 'passionate',
    performanceType: 'dynamic_range',
    strengths: ['Shock value (2.0x)', 'Name flips (2.0x)'],
    weaknesses: ['Punchlines (0.5x)', 'Comedy (0.5x)', 'Street talk (0.5x)'],
    bestAgainst: ['high_energy'],
    worstAgainst: ['punch_god', 'entertainment_package', 'street_pressure'],
  },

  // Street / Aggressive Strategies
  {
    id: 'street_pressure',
    name: 'Street Pressure',
    description: 'Authentic street credibility with aggressive energy',
    contentTypes: ['street_talk', 'gun_bars', 'personals'],
    deliveryType: 'aggressive',
    performanceType: 'stage_presence',
    strengths: ['Gun bars (2.0x)', 'Schemes (2.0x)', 'Comedy (2.0x)'],
    weaknesses: ['Wordplay (0.5x)', 'Personals (0.5x)'],
    bestAgainst: ['technical_assault', 'scheme_heavy'],
    worstAgainst: ['deep_research', 'technical_assault'],
  },
  {
    id: 'high_energy',
    name: 'High Energy',
    description: 'Pure aggression with haymaker punches and gun bars',
    contentTypes: ['gun_bars', 'punchlines', 'shock_value'],
    deliveryType: 'aggressive',
    performanceType: 'theatrical',
    strengths: ['Freestyles (2.0x)', 'Social commentary (2.0x)'],
    weaknesses: ['Personals (0.5x)', 'Street talk (0.5x)', 'Wordplay (0.5x)'],
    bestAgainst: ['freestyle_mode', 'balanced_attack'],
    worstAgainst: ['deep_research', 'street_pressure', 'technical_assault'],
  },

  // Entertainment Strategies
  {
    id: 'entertainment_package',
    name: 'Entertainment Package',
    description: 'Crowd-pleasing comedy and pop culture references',
    contentTypes: ['comedy', 'pop_culture_refs', 'name_flips'],
    deliveryType: 'conversational',
    performanceType: 'crowd_interaction',
    strengths: ['Wordplay (2.0x)', 'Schemes (2.0x)', 'Social commentary (2.0x)'],
    weaknesses: ['Personals (0.5x)'],
    bestAgainst: ['technical_assault', 'scheme_heavy', 'balanced_attack'],
    worstAgainst: ['deep_research', 'street_pressure'],
  },

  // Research / Angle Strategies
  {
    id: 'deep_research',
    name: 'Deep Research',
    description: 'Personal angles, rebuttals, and storytelling based on opponent info',
    contentTypes: ['personals', 'rebuttals', 'storytelling'],
    deliveryType: 'passionate',
    performanceType: 'charismatic',
    strengths: ['Comedy (2.0x)', 'Gun bars (2.0x)', 'Shock value (2.0x)'],
    weaknesses: ['Rebuttals (0.5x)', 'Punchlines (0.5x)'],
    bestAgainst: ['entertainment_package', 'high_energy', 'street_pressure'],
    worstAgainst: ['freestyle_mode', 'punch_god'],
  },

  // Adaptive Strategies
  {
    id: 'freestyle_mode',
    name: 'Freestyle Mode',
    description: 'Improvised content with rebuttals and crowd work',
    contentTypes: ['freestyles', 'rebuttals', 'pop_culture_refs'],
    deliveryType: 'conversational',
    performanceType: 'crowd_interaction',
    strengths: ['Rebuttals (2.0x)', 'Schemes (2.0x)'],
    weaknesses: ['Gun bars (0.5x)'],
    bestAgainst: ['scheme_heavy', 'deep_research'],
    worstAgainst: ['high_energy', 'street_pressure'],
  },

  // Balanced Strategy
  {
    id: 'balanced_attack',
    name: 'Balanced Attack',
    description: 'Mix of technical writing and crowd-pleasing performance',
    contentTypes: ['punchlines', 'wordplay', 'personals'],
    deliveryType: 'smooth_flow',
    performanceType: 'dynamic_range',
    strengths: ['Schemes (2.0x)', 'Storytelling (2.0x)', 'Name flips (2.0x)'],
    weaknesses: [],
    bestAgainst: ['scheme_heavy'],
    worstAgainst: ['entertainment_package'],
  },

  // Pure Puncher Strategy
  {
    id: 'punch_god',
    name: 'Punch God',
    description: 'Haymaker after haymaker - nothing but knockout blows',
    contentTypes: ['punchlines', 'gun_bars', 'name_flips'],
    deliveryType: 'staccato',
    performanceType: 'stage_presence',
    strengths: ['Schemes (2.0x)', 'Storytelling (2.0x)', 'Name flips (2.0x)'],
    weaknesses: ['Street talk (0.5x)', 'Personals (0.5x)'],
    bestAgainst: ['scheme_heavy', 'deep_research'],
    worstAgainst: ['street_pressure', 'deep_research'],
  },
]

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get a strategy by ID
 */
export function getStrategy(id: string): RoundStrategy | undefined {
  return ROUND_STRATEGIES.find(s => s.id === id)
}

/**
 * Get all strategies
 */
export function getAllStrategies(): RoundStrategy[] {
  return ROUND_STRATEGIES
}

/**
 * Calculate effectiveness multiplier between two strategies
 * Uses the full effectiveness matrix
 */
export function calculateStrategyEffectiveness(
  yourStrategy: RoundStrategy,
  opponentStrategy: RoundStrategy
): number {
  return calculateAverageEffectiveness(
    [...yourStrategy.contentTypes, yourStrategy.deliveryType, yourStrategy.performanceType],
    [...opponentStrategy.contentTypes, opponentStrategy.deliveryType, opponentStrategy.performanceType]
  )
}

/**
 * Get effectiveness forecast between two strategies
 */
export interface EffectivenessForecast {
  yourMultiplier: number
  opponentMultiplier: number
  advantage: 'yours' | 'theirs' | 'even'
  advantageAmount: number
  summary: string
}

export function getEffectivenessForecast(
  yourStrategy: RoundStrategy,
  opponentStrategy: RoundStrategy
): EffectivenessForecast {
  const yourMult = calculateStrategyEffectiveness(yourStrategy, opponentStrategy)
  const oppMult = calculateStrategyEffectiveness(opponentStrategy, yourStrategy)

  const diff = yourMult - oppMult
  let advantage: 'yours' | 'theirs' | 'even' = 'even'
  if (diff > 0.1) advantage = 'yours'
  if (diff < -0.1) advantage = 'theirs'

  let summary = 'Even matchup - execution decides'
  if (advantage === 'yours') {
    summary = `Your strategy has ${(diff * 100).toFixed(0)}% advantage`
  } else if (advantage === 'theirs') {
    summary = `Opponent has ${(Math.abs(diff) * 100).toFixed(0)}% advantage`
  }

  return {
    yourMultiplier: yourMult,
    opponentMultiplier: oppMult,
    advantage,
    advantageAmount: Math.abs(diff),
    summary,
  }
}

/**
 * Get recommended strategies against a given opponent strategy
 */
export function getRecommendedStrategies(opponentStrategyId: string): RoundStrategy[] {
  const oppStrategy = getStrategy(opponentStrategyId)
  if (!oppStrategy) return ROUND_STRATEGIES

  return ROUND_STRATEGIES
    .map(s => ({
      strategy: s,
      effectiveness: calculateStrategyEffectiveness(s, oppStrategy),
    }))
    .sort((a, b) => b.effectiveness - a.effectiveness)
    .slice(0, 3)
    .map(s => s.strategy)
}

/**
 * Get strategy color coding for UI
 */
export function getStrategyColor(strategyId: string): string {
  const colorMap: Record<string, string> = {
    technical_assault: 'text-purple-400 border-purple-500',
    scheme_heavy: 'text-indigo-400 border-indigo-500',
    street_pressure: 'text-red-400 border-red-500',
    high_energy: 'text-orange-400 border-orange-500',
    entertainment_package: 'text-yellow-400 border-yellow-500',
    deep_research: 'text-blue-400 border-blue-500',
    freestyle_mode: 'text-cyan-400 border-cyan-500',
    balanced_attack: 'text-green-400 border-green-500',
    punch_god: 'text-pink-400 border-pink-500',
  }
  return colorMap[strategyId] || 'text-zinc-400 border-zinc-500'
}

/**
 * Get strategy icon emoji
 */
export function getStrategyIcon(strategyId: string): string {
  const iconMap: Record<string, string> = {
    technical_assault: '📝',
    scheme_heavy: '🎭',
    street_pressure: '🔫',
    high_energy: '⚡',
    entertainment_package: '😂',
    deep_research: '🔍',
    freestyle_mode: '🎤',
    balanced_attack: '⚖️',
    punch_god: '💥',
  }
  return iconMap[strategyId] || '🎯'
}
