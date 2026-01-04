/**
 * League Booking System
 * Handles matchmaking, card building, and battle offer generation
 *
 * Financial Stability Effects:
 * - Financial Stability < 4: Cannot access premier tier leagues (can't afford travel)
 * - Financial Stability <= 3: May be forced to accept suboptimal matchups ("money tight")
 *
 * Reputation Effects:
 * - High reputation gets better matchup offers (sorted by reputation-adjusted quality)
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { SIMULATION_CONFIG as CONFIG } from './config'

// =============================================================================
// TYPES
// =============================================================================

export interface League {
  id: string
  name: string
  short_code: string
  league_tier: 'virtual' | 'underground' | 'regional' | 'national' | 'premier'
  budget_per_card: number
  cards_per_month: number
  max_battles_per_card: number
  style_weights: Record<string, number>
  regional_preference: string | null
  min_prep_days: number
  writing_weight: number
  performance_weight: number
}

export interface Battler {
  id: string
  stage_name: string
  tier: 'low' | 'mid' | 'top' | 'god'
  region: string | null
  style_tags: string[]
  base_booking_fee: number
  rest_days_required: number
  last_battle_date: string | null
  available_from: string | null
  booking_status: string
  popularity_score: number
  is_ai: boolean
  rankings?: {
    rating: number
    wins: number
    losses: number
    streak: number
  }
}

export interface MatchScore {
  battler_id: string
  stage_name: string
  tier_match: number      // 0-25
  style_fit: number       // 0-25
  regional_bonus: number  // 0-15
  momentum: number        // 0-15
  rivalry_potential: number // 0-10
  availability: number    // 0-10
  total: number           // 0-100
  booking_fee: number
  breakdown: string[]     // Human-readable explanations
}

export interface MatchupResult {
  battler_a: Battler
  battler_b: Battler
  combined_score: number
  is_sequel: boolean
  sequel_number?: number
  sequel_reason?: string
  combined_fee: number
  within_budget: boolean
  score_breakdown: {
    battler_a_score: MatchScore
    battler_b_score: MatchScore
  }
}

export interface CardPosition {
  position: 'main_event' | 'co_main' | 'featured' | 'undercard' | 'opener'
  order: number
  budget_percentage: number
  allocated_budget: number
}

export interface EventCard {
  league: League
  scheduled_date: string
  total_budget: number
  positions: CardPosition[]
  matchups: (MatchupResult | null)[]
  debug_info: {
    candidates_considered: number
    matchups_evaluated: number
    budget_remaining: number
  }
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Budget allocation by card position
const POSITION_BUDGET_ALLOCATION: Record<string, number> = {
  main_event: 0.40,
  co_main: 0.25,
  featured: 0.15,
  undercard: 0.10,
  opener: 0.10,
}

// Tier compatibility scores (how well battler tier fits league tier)
const TIER_COMPATIBILITY: Record<string, Record<string, number>> = {
  virtual: { low: 25, mid: 20, top: 10, god: 5 },
  underground: { low: 25, mid: 22, top: 15, god: 8 },
  regional: { low: 20, mid: 25, top: 20, god: 12 },
  national: { low: 10, mid: 20, top: 25, god: 22 },
  premier: { low: 5, mid: 12, top: 22, god: 25 },
}

// Style category mappings
const STYLE_CATEGORIES: Record<string, string[]> = {
  aggressive: ['Aggressive Battler', 'Gun Bar Specialist', 'Believable Persona', 'Street'],
  technical: ['Technical Writer', 'Pen Game Elite', 'Scheme Specialist', 'Multisyllabic Master'],
  comedy: ['Comedy King\\Queen', 'Crowd Favorite', 'Charismatic Charmer'],
  performance: ['Stage Domination', 'Crowd Control', 'Delivery Beast', 'Energy Machine'],
  lyrical: ['Wordplay Wizard', 'Punchline King\\Queen', 'Metaphor Master', 'Storyteller'],
  street: ['Believable Persona', 'Gun Bar Specialist', 'Aggressive Battler'],
}

// =============================================================================
// BOOKING FEE CALCULATION
// =============================================================================

export function calculateBookingFee(battler: Battler): number {
  let fee = battler.base_booking_fee

  // Win streak bonus (up to 30%)
  const streak = battler.rankings?.streak || 0
  if (streak > 0) {
    const streakBonus = Math.min(streak * 0.10, 0.30)
    fee *= (1 + streakBonus)
  }

  // Popularity modifier (up to 25%)
  const popularityBonus = (battler.popularity_score - 50) / 200 // -25% to +25%
  fee *= (1 + popularityBonus)

  // Losing streak penalty (up to 20% discount)
  if (streak < 0) {
    const penalty = Math.min(Math.abs(streak) * 0.05, 0.20)
    fee *= (1 - penalty)
  }

  return Math.round(fee)
}

// =============================================================================
// AVAILABILITY CHECKING
// =============================================================================

export function isBattlerAvailable(
  battler: Battler,
  battleDate: Date,
  excludeBattlerIds: string[] = []
): { available: boolean; reason?: string } {
  // Check if excluded
  if (excludeBattlerIds.includes(battler.id)) {
    return { available: false, reason: 'Already on this card' }
  }

  // Check booking status
  if (battler.booking_status !== 'available') {
    return { available: false, reason: `Status: ${battler.booking_status}` }
  }

  // Check rest period
  if (battler.last_battle_date) {
    const lastBattle = new Date(battler.last_battle_date)
    const restEnd = new Date(lastBattle)
    restEnd.setDate(restEnd.getDate() + battler.rest_days_required)

    if (battleDate < restEnd) {
      const daysUntilAvailable = Math.ceil((restEnd.getTime() - battleDate.getTime()) / (1000 * 60 * 60 * 24))
      return { available: false, reason: `Resting (${daysUntilAvailable} days remaining)` }
    }
  }

  // Check available_from date
  if (battler.available_from) {
    const availableFrom = new Date(battler.available_from)
    if (battleDate < availableFrom) {
      return { available: false, reason: 'Not available until ' + battler.available_from }
    }
  }

  return { available: true }
}

// =============================================================================
// MATCH SCORING
// =============================================================================

export function scoreBattlerForLeague(
  battler: Battler,
  league: League,
  battleDate: Date
): MatchScore {
  const breakdown: string[] = []

  // 1. Tier Match (0-25)
  const tierMatch = TIER_COMPATIBILITY[league.league_tier]?.[battler.tier] || 15
  breakdown.push(`Tier ${battler.tier} in ${league.league_tier} league: ${tierMatch}/25`)

  // 2. Style Fit (0-25)
  let styleFit = 12 // Base score
  const styleWeights = league.style_weights || {}

  for (const tag of battler.style_tags) {
    for (const [category, styles] of Object.entries(STYLE_CATEGORIES)) {
      if (styles.some(s => tag.toLowerCase().includes(s.toLowerCase()))) {
        const weight = styleWeights[category] || 1.0
        styleFit += (weight - 1.0) * 5 // Each 0.1 weight = 0.5 points
      }
    }
  }
  styleFit = Math.min(Math.max(styleFit, 0), 25)
  breakdown.push(`Style fit for ${league.name}: ${styleFit.toFixed(1)}/25`)

  // 3. Regional Bonus (0-15)
  let regionalBonus = 8 // Neutral
  if (league.regional_preference && battler.region) {
    if (battler.region.toLowerCase().includes(league.regional_preference.toLowerCase())) {
      regionalBonus = 15
      breakdown.push(`Home region bonus: +7 (${battler.region})`)
    } else {
      regionalBonus = 5
      breakdown.push(`Out of region: ${battler.region} vs preferred ${league.regional_preference}`)
    }
  }

  // 4. Momentum (0-15)
  let momentum = 7 // Neutral
  const streak = battler.rankings?.streak || 0
  if (streak > 0) {
    momentum = Math.min(7 + streak * 2, 15)
    breakdown.push(`Win streak +${streak}: momentum ${momentum}/15`)
  } else if (streak < 0) {
    momentum = Math.max(7 + streak * 1.5, 0)
    breakdown.push(`Loss streak ${streak}: momentum ${momentum}/15`)
  }

  // 5. Rivalry Potential (0-10) - placeholder, would check battle_pairings
  const rivalryPotential = 5 // Default, will be enhanced when we check pairings
  breakdown.push(`Rivalry potential: ${rivalryPotential}/10`)

  // 6. Availability (0-10)
  let availability = 10
  if (battler.last_battle_date) {
    const daysSinceBattle = Math.floor(
      (battleDate.getTime() - new Date(battler.last_battle_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceBattle < battler.rest_days_required + 7) {
      availability = 5 // Recent battle, slightly lower
      breakdown.push(`Recent battle ${daysSinceBattle} days ago: availability ${availability}/10`)
    }
  }

  const total = tierMatch + styleFit + regionalBonus + momentum + rivalryPotential + availability
  const bookingFee = calculateBookingFee(battler)

  return {
    battler_id: battler.id,
    stage_name: battler.stage_name,
    tier_match: tierMatch,
    style_fit: styleFit,
    regional_bonus: regionalBonus,
    momentum,
    rivalry_potential: rivalryPotential,
    availability,
    total,
    booking_fee: bookingFee,
    breakdown,
  }
}

// =============================================================================
// MATCHUP EVALUATION
// =============================================================================

export async function evaluateMatchup(
  battlerA: Battler,
  battlerB: Battler,
  league: League,
  battleDate: Date,
  supabase: SupabaseClient
): Promise<MatchupResult> {
  const scoreA = scoreBattlerForLeague(battlerA, league, battleDate)
  const scoreB = scoreBattlerForLeague(battlerB, league, battleDate)

  // Check sequel status
  let isSequel = false
  let sequelNumber: number | undefined
  let sequelReason: string | undefined

  const { data: sequelCheck } = await supabase.rpc('is_sequel_allowed', {
    p_battler_1: battlerA.id,
    p_battler_2: battlerB.id,
    p_check_date: battleDate.toISOString().split('T')[0],
  })

  if (sequelCheck) {
    isSequel = sequelCheck.is_sequel || false
    sequelNumber = sequelCheck.sequel_number
    sequelReason = sequelCheck.reason
  }

  const combinedFee = scoreA.booking_fee + scoreB.booking_fee

  // Combined score factors in both battler scores plus matchup quality
  // Similar tiers = better matchup
  const tierDiff = Math.abs(
    ['low', 'mid', 'top', 'god'].indexOf(battlerA.tier) -
    ['low', 'mid', 'top', 'god'].indexOf(battlerB.tier)
  )
  const tierMatchBonus = (3 - tierDiff) * 5 // 0-15 bonus for close tiers

  const combinedScore = (scoreA.total + scoreB.total) / 2 + tierMatchBonus

  return {
    battler_a: battlerA,
    battler_b: battlerB,
    combined_score: combinedScore,
    is_sequel: isSequel,
    sequel_number: sequelNumber,
    sequel_reason: sequelReason,
    combined_fee: combinedFee,
    within_budget: true, // Will be set by caller
    score_breakdown: {
      battler_a_score: scoreA,
      battler_b_score: scoreB,
    },
  }
}

// =============================================================================
// CARD BUILDING
// =============================================================================

export function getCardPositions(maxBattles: number, totalBudget: number): CardPosition[] {
  const positions: CardPosition[] = []

  if (maxBattles >= 1) {
    positions.push({
      position: 'main_event',
      order: 1,
      budget_percentage: 0.40,
      allocated_budget: Math.round(totalBudget * 0.40),
    })
  }

  if (maxBattles >= 2) {
    positions.push({
      position: 'co_main',
      order: 2,
      budget_percentage: 0.25,
      allocated_budget: Math.round(totalBudget * 0.25),
    })
  }

  if (maxBattles >= 3) {
    positions.push({
      position: 'featured',
      order: 3,
      budget_percentage: 0.15,
      allocated_budget: Math.round(totalBudget * 0.15),
    })
  }

  // Remaining battles split the undercard budget
  const remainingBattles = maxBattles - 3
  if (remainingBattles > 0) {
    const undercardBudget = totalBudget * 0.20
    const perBattle = Math.round(undercardBudget / remainingBattles)

    for (let i = 0; i < remainingBattles; i++) {
      positions.push({
        position: i === remainingBattles - 1 ? 'opener' : 'undercard',
        order: 4 + i,
        budget_percentage: 0.20 / remainingBattles,
        allocated_budget: perBattle,
      })
    }
  }

  return positions
}

export async function buildEventCard(
  league: League,
  scheduledDate: Date,
  playerBattlerId: string | null,
  supabase: SupabaseClient
): Promise<EventCard> {
  const positions = getCardPositions(league.max_battles_per_card, league.budget_per_card)
  const matchups: (MatchupResult | null)[] = []
  const usedBattlerIds: string[] = []

  let candidatesConsidered = 0
  let matchupsEvaluated = 0
  let budgetRemaining = league.budget_per_card

  // Get all available AI battlers
  const { data: allBattlers } = await supabase
    .from('battlers')
    .select(`
      *,
      rankings (rating, wins, losses, streak)
    `)
    .eq('is_ai', true)
    .eq('booking_status', 'available')

  const availableBattlers = (allBattlers || []) as Battler[]
  candidatesConsidered = availableBattlers.length

  // Get player battler if specified
  let playerBattler: Battler | null = null
  if (playerBattlerId) {
    const { data } = await supabase
      .from('battlers')
      .select(`*, rankings (rating, wins, losses, streak)`)
      .eq('id', playerBattlerId)
      .single()
    playerBattler = data as Battler | null
  }

  // For each position, find the best matchup
  for (const position of positions) {
    const budget = position.allocated_budget

    // Filter battlers within budget
    const affordableBattlers = availableBattlers.filter(b => {
      const fee = calculateBookingFee(b)
      const isAvailable = isBattlerAvailable(b, scheduledDate, usedBattlerIds).available
      return fee <= budget / 2 && isAvailable && !usedBattlerIds.includes(b.id)
    })

    // If player should be on card and this is a good position for their tier
    const includePlayer = playerBattler &&
      !usedBattlerIds.includes(playerBattler.id) &&
      position.order <= 3 && // Player gets featured or higher
      isBattlerAvailable(playerBattler, scheduledDate, usedBattlerIds).available

    // Score all candidates
    const scoredCandidates = affordableBattlers.map(b =>
      scoreBattlerForLeague(b, league, scheduledDate)
    ).sort((a, b) => b.total - a.total)

    // Find best matchup
    let bestMatchup: MatchupResult | null = null
    let bestScore = -1

    // If including player, find best opponent for them
    if (includePlayer && playerBattler) {
      for (const candidate of scoredCandidates.slice(0, 10)) {
        const opponent = affordableBattlers.find(b => b.id === candidate.battler_id)
        if (!opponent) continue

        const matchup = await evaluateMatchup(
          playerBattler,
          opponent,
          league,
          scheduledDate,
          supabase
        )
        matchupsEvaluated++

        if (!matchup.is_sequel || matchup.sequel_number) {
          const combinedFee = matchup.combined_fee
          if (combinedFee <= budget && matchup.combined_score > bestScore) {
            bestMatchup = { ...matchup, within_budget: true }
            bestScore = matchup.combined_score
          }
        }
      }
    } else {
      // Find best AI vs AI matchup
      for (let i = 0; i < Math.min(scoredCandidates.length, 8); i++) {
        for (let j = i + 1; j < Math.min(scoredCandidates.length, 8); j++) {
          const battlerA = affordableBattlers.find(b => b.id === scoredCandidates[i].battler_id)
          const battlerB = affordableBattlers.find(b => b.id === scoredCandidates[j].battler_id)
          if (!battlerA || !battlerB) continue

          const matchup = await evaluateMatchup(battlerA, battlerB, league, scheduledDate, supabase)
          matchupsEvaluated++

          if (!matchup.is_sequel || matchup.sequel_number) {
            const combinedFee = matchup.combined_fee
            if (combinedFee <= budget && matchup.combined_score > bestScore) {
              bestMatchup = { ...matchup, within_budget: true }
              bestScore = matchup.combined_score
            }
          }
        }
      }
    }

    if (bestMatchup) {
      matchups.push(bestMatchup)
      usedBattlerIds.push(bestMatchup.battler_a.id, bestMatchup.battler_b.id)
      budgetRemaining -= bestMatchup.combined_fee
    } else {
      matchups.push(null)
    }
  }

  return {
    league,
    scheduled_date: scheduledDate.toISOString().split('T')[0],
    total_budget: league.budget_per_card,
    positions,
    matchups,
    debug_info: {
      candidates_considered: candidatesConsidered,
      matchups_evaluated: matchupsEvaluated,
      budget_remaining: budgetRemaining,
    },
  }
}

// =============================================================================
// BATTLE OFFER GENERATION
// =============================================================================

export async function generateBattleOffersForPlayer(
  playerBattlerId: string,
  count: number,
  supabase: SupabaseClient
): Promise<{ success: boolean; offers: any[]; debug: any }> {
  const offers: any[] = []
  const debug: any = { leagues_checked: [], errors: [], financial_status: 'stable' }

  // Get player battler with attributes
  const { data: player, error: playerError } = await supabase
    .from('battlers')
    .select(`*, rankings (rating, wins, losses, streak), battler_attributes(*)`)
    .eq('id', playerBattlerId)
    .single()

  if (playerError || !player) {
    return { success: false, offers: [], debug: { error: 'Player not found' } }
  }

  // Get personal stats for filtering
  const attrs = (player as any).battler_attributes || {}
  const financialStability = attrs.personal?.financial_stability || 5
  const reputation = attrs.personal?.reputation || 5

  // Set financial status for debug/UI
  if (financialStability <= CONFIG.FINANCIAL_DESPERATE_THRESHOLD) {
    debug.financial_status = 'desperate' // Can't be picky, needs money
  } else if (financialStability < CONFIG.FINANCIAL_LOW_THRESHOLD) {
    debug.financial_status = 'tight' // Limited options
  }

  // Get leagues that could book this player
  const { data: leagues } = await supabase
    .from('leagues')
    .select('*')
    .order('budget_per_card', { ascending: false })

  if (!leagues || leagues.length === 0) {
    return { success: false, offers: [], debug: { error: 'No leagues found' } }
  }

  // Try each league until we have enough offers
  for (const league of leagues) {
    if (offers.length >= count) break

    debug.leagues_checked.push(league.name)

    // FINANCIAL STABILITY FILTER: Can't access premier leagues if financial_stability < 4
    if (league.league_tier === 'premier' && financialStability < CONFIG.FINANCIAL_PREMIER_THRESHOLD) {
      debug.errors.push(`${league.name}: Can't afford travel (Financial Stability ${financialStability} < ${CONFIG.FINANCIAL_PREMIER_THRESHOLD})`)
      continue
    }

    // Check if player tier fits league
    const tierScore = TIER_COMPATIBILITY[league.league_tier]?.[player.tier] || 0
    if (tierScore < 10) {
      debug.errors.push(`${league.name}: Tier mismatch (${player.tier} in ${league.league_tier})`)
      continue
    }

    // Check if league can afford player
    const playerFee = calculateBookingFee(player as Battler)
    if (playerFee > league.budget_per_card * 0.5) {
      debug.errors.push(`${league.name}: Can't afford player ($${playerFee} > $${league.budget_per_card * 0.5})`)
      continue
    }

    // Find suitable opponent
    const { data: opponents } = await supabase
      .from('battlers')
      .select(`*, rankings (rating, wins, losses, streak)`)
      .eq('is_ai', true)
      .eq('booking_status', 'available')
      .neq('id', playerBattlerId)

    if (!opponents || opponents.length === 0) continue

    // Score and sort opponents
    const battleDate = new Date()
    battleDate.setDate(battleDate.getDate() + league.min_prep_days + 3)

    const scoredOpponents = opponents.map(opp => ({
      opponent: opp as Battler,
      score: scoreBattlerForLeague(opp as Battler, league as League, battleDate),
    })).filter(o => {
      const fee = calculateBookingFee(o.opponent)
      return fee + playerFee <= league.budget_per_card * 0.65 // Leave room for other battles
    }).sort((a, b) => b.score.total - a.score.total)

    // Pick best available opponent
    for (const { opponent, score } of scoredOpponents.slice(0, 5)) {
      // Check sequel eligibility
      const { data: sequelCheck } = await supabase.rpc('is_sequel_allowed', {
        p_battler_1: playerBattlerId,
        p_battler_2: opponent.id,
        p_check_date: battleDate.toISOString().split('T')[0],
      })

      if (sequelCheck && !sequelCheck.allowed) {
        continue // Skip this opponent, can't rematch yet
      }

      // Create battle offer
      const lockPrepDate = new Date(battleDate)
      lockPrepDate.setDate(lockPrepDate.getDate() - 1)

      const { data: battle, error: battleError } = await supabase
        .from('battles')
        .insert({
          league_id: league.id,
          battler_player_id: playerBattlerId,
          battler_ai_id: opponent.id,
          scheduled_at: battleDate.toISOString(),
          lock_prep_at: lockPrepDate.toISOString(),
          status: 'offered',
          player_payout: playerFee,
          opponent_payout: calculateBookingFee(opponent),
        })
        .select()
        .single()

      if (battleError) {
        debug.errors.push(`Failed to create battle: ${battleError.message}`)
        continue
      }

      // Apply reputation bonus to offer quality
      // High reputation = +10% per point above 5, better matchups
      const reputationBonus = reputation > 5
        ? (reputation - 5) * CONFIG.REPUTATION_OFFER_QUALITY_BONUS
        : 0
      const adjustedScore = score.total * (1 + reputationBonus)

      offers.push({
        battle,
        league,
        opponent,
        player_fee: playerFee,
        opponent_fee: calculateBookingFee(opponent),
        matchup_score: score.total,
        adjusted_score: adjustedScore,
        reputation_bonus: reputationBonus,
        is_sequel: sequelCheck?.is_sequel || false,
        sequel_info: sequelCheck,
        financial_status: debug.financial_status,
      })

      break // Move to next league
    }
  }

  // Sort offers by adjusted score (reputation-boosted quality)
  offers.sort((a, b) => b.adjusted_score - a.adjusted_score)

  return { success: offers.length > 0, offers, debug }
}
