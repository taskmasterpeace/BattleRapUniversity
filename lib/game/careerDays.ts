/**
 * Career Days System - The "Battle Rap Secret"
 *
 * Tracks career experience as days/weeks/years. This information is HIDDEN
 * by default - creating authentic battle rap moments like:
 * - "You been in this game 2 years and you supposed to beat me?"
 * - "This dude only 9 weeks old trying to battle legends"
 * - Rookies getting exposed or veterans earning respect
 */

import { SupabaseClient } from '@supabase/supabase-js'

// Career Tiers based on days
export type CareerTier = 'rookie' | 'rising' | 'established' | 'veteran' | 'legend'

// How career was revealed
export type RevealMethod = 'media' | 'opponent' | 'storyline' | 'self' | 'call_out' | 'tournament'

// Source of career day increment
export type CareerDaySource =
  | 'battle_completed'
  | 'prep_day'
  | 'life_event'
  | 'storyline_chapter'
  | 'tournament_match'
  | 'training'
  | 'rest_day'
  | 'travel'
  | 'media_appearance'
  | 'time_skip'

// Career tier thresholds (in days)
export const CAREER_TIER_THRESHOLDS = {
  rookie: { min: 0, max: 90, label: 'Rookie', description: 'First 3 months' },
  rising: { min: 91, max: 270, label: 'Rising', description: '3-9 months' },
  established: { min: 271, max: 730, label: 'Established', description: '9 months - 2 years' },
  veteran: { min: 731, max: 1825, label: 'Veteran', description: '2-5 years' },
  legend: { min: 1826, max: Infinity, label: 'Legend', description: '5+ years' },
} as const

// Days added per action type
export const CAREER_DAY_INCREMENTS = {
  battle_completed: 7,      // A battle takes ~1 week including event day
  prep_day: 1,              // Each prep day
  life_event: 1,            // Life event occurred
  storyline_chapter: 2,     // Storyline events take time
  tournament_match: 5,      // Tournament battles are intense
  training: 1,              // Training session
  rest_day: 1,              // Recovery
  travel: 2,                // Travel to event
  media_appearance: 1,      // Interview, podcast
  time_skip: 0,             // Variable - passed in
} as const

export interface CareerDisplayInfo {
  displayText: string       // "3 weeks", "1.5 years", or "???"
  isHidden: boolean         // Whether career is still secret
  tier: CareerTier | 'unknown'
  exactDays: number | null  // Only if visible
  years: number | null
  weeks: number | null
}

export interface CareerRevealResult {
  careerDays: number
  careerTier: CareerTier
  careerYears: number
  careerWeeks: number
  alreadyPublic: boolean
}

/**
 * Get career tier from days (client-side calculation)
 */
export function getCareerTier(careerDays: number): CareerTier {
  if (careerDays <= 90) return 'rookie'
  if (careerDays <= 270) return 'rising'
  if (careerDays <= 730) return 'established'
  if (careerDays <= 1825) return 'veteran'
  return 'legend'
}

/**
 * Format career days for display
 */
export function formatCareerDays(days: number): string {
  if (days < 7) return `${days} days`
  if (days < 90) return `${Math.floor(days / 7)} weeks`
  if (days < 365) return `${(days / 30).toFixed(1)} months`
  return `${(days / 365).toFixed(1)} years`
}

/**
 * Get career display info for a battler
 * Returns "???" if career is hidden and viewer isn't the owner
 */
export async function getCareerDisplayInfo(
  supabase: SupabaseClient,
  battlerId: string,
  viewerIsOwner: boolean = false
): Promise<CareerDisplayInfo> {
  const { data, error } = await supabase
    .rpc('get_career_display', {
      p_battler_id: battlerId,
      p_viewer_is_owner: viewerIsOwner
    })

  if (error || !data || data.length === 0) {
    return {
      displayText: '???',
      isHidden: true,
      tier: 'unknown',
      exactDays: null,
      years: null,
      weeks: null
    }
  }

  const result = data[0]
  return {
    displayText: result.display_text || '???',
    isHidden: result.is_hidden,
    tier: result.tier as CareerTier | 'unknown',
    exactDays: result.exact_days,
    years: result.years,
    weeks: result.weeks
  }
}

/**
 * Increment career days for a battler
 */
export async function incrementCareerDays(
  supabase: SupabaseClient,
  battlerId: string,
  source: CareerDaySource,
  options: {
    days?: number            // Override default days for source
    relatedBattleId?: string
    description?: string
  } = {}
): Promise<number> {
  const daysToAdd = options.days ?? CAREER_DAY_INCREMENTS[source]

  const { data, error } = await supabase
    .rpc('increment_career_days', {
      p_battler_id: battlerId,
      p_days: daysToAdd,
      p_source: source,
      p_related_battle_id: options.relatedBattleId ?? null,
      p_description: options.description ?? null
    })

  if (error) {
    console.error('Failed to increment career days:', error)
    throw error
  }

  return data as number
}

/**
 * Reveal a battler's career, making it public
 */
export async function revealCareer(
  supabase: SupabaseClient,
  battlerId: string,
  method: RevealMethod,
  revealedBy?: string
): Promise<CareerRevealResult> {
  // First check if already public
  const { data: battler } = await supabase
    .from('battlers')
    .select('career_public, career_days')
    .eq('id', battlerId)
    .single()

  if (battler?.career_public) {
    return {
      careerDays: battler.career_days || 0,
      careerTier: getCareerTier(battler.career_days || 0),
      careerYears: (battler.career_days || 0) / 365,
      careerWeeks: Math.floor((battler.career_days || 0) / 7),
      alreadyPublic: true
    }
  }

  const { data, error } = await supabase
    .rpc('reveal_career', {
      p_battler_id: battlerId,
      p_reveal_method: method,
      p_revealed_by: revealedBy ?? null
    })

  if (error) {
    console.error('Failed to reveal career:', error)
    throw error
  }

  const result = data[0]
  return {
    careerDays: result.career_days,
    careerTier: result.career_tier as CareerTier,
    careerYears: result.career_years,
    careerWeeks: result.career_weeks,
    alreadyPublic: false
  }
}

/**
 * Get career history for a battler (for timeline display)
 */
export async function getCareerHistory(
  supabase: SupabaseClient,
  battlerId: string,
  limit: number = 50
): Promise<{
  id: string
  source: CareerDaySource
  daysAdded: number
  description: string | null
  createdAt: string
  careerDaysAfter: number
}[]> {
  const { data, error } = await supabase
    .from('career_day_history')
    .select('*')
    .eq('battler_id', battlerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to get career history:', error)
    return []
  }

  return data.map(row => ({
    id: row.id,
    source: row.source as CareerDaySource,
    daysAdded: row.days_added,
    description: row.description,
    createdAt: row.created_at,
    careerDaysAfter: row.career_days_after
  }))
}

/**
 * Calculate matchmaking tier (prevents rookie vs legend)
 */
export function getMatchmakingTier(careerDays: number, rating: number): string {
  const careerTier = getCareerTier(careerDays)

  let ratingTier: string
  if (rating < 1200) ratingTier = 'low'
  else if (rating < 1500) ratingTier = 'mid'
  else if (rating < 1800) ratingTier = 'high'
  else ratingTier = 'elite'

  return `${careerTier}_${ratingTier}`
}

/**
 * Check if two battlers are in compatible matchmaking tiers
 */
export function areMatchmakingCompatible(
  battler1: { careerDays: number; rating: number },
  battler2: { careerDays: number; rating: number }
): { compatible: boolean; reason?: string } {
  const tier1 = getCareerTier(battler1.careerDays)
  const tier2 = getCareerTier(battler2.careerDays)

  // Define tier distance (how far apart tiers are)
  const tierOrder: CareerTier[] = ['rookie', 'rising', 'established', 'veteran', 'legend']
  const tier1Index = tierOrder.indexOf(tier1)
  const tier2Index = tierOrder.indexOf(tier2)
  const tierGap = Math.abs(tier1Index - tier2Index)

  // Rating difference
  const ratingGap = Math.abs(battler1.rating - battler2.rating)

  // Rules:
  // 1. Rookies can only fight rookies or rising (tier gap <= 1)
  // 2. Legends can fight anyone (they're too good to gatekeep)
  // 3. Otherwise, tier gap <= 2 is acceptable
  // 4. Large rating gaps (>400) override tier restrictions

  if (tier1 === 'rookie' || tier2 === 'rookie') {
    if (tierGap > 1) {
      return {
        compatible: false,
        reason: 'Rookies can only battle rookies or rising stars'
      }
    }
  }

  if (tier1 !== 'legend' && tier2 !== 'legend' && tierGap > 2) {
    // Unless rating gap is huge (they clearly belong at different levels)
    if (ratingGap < 400) {
      return {
        compatible: false,
        reason: `Career gap too large (${tier1} vs ${tier2})`
      }
    }
  }

  return { compatible: true }
}

/**
 * Generate call-out flavor text based on career comparison
 */
export function generateCareerCallOutText(
  callerCareerDays: number,
  targetCareerDays: number,
  callerName: string,
  targetName: string
): string | null {
  const callerTier = getCareerTier(callerCareerDays)
  const targetTier = getCareerTier(targetCareerDays)

  // Only generate text if there's a significant gap
  const tierOrder: CareerTier[] = ['rookie', 'rising', 'established', 'veteran', 'legend']
  const callerIndex = tierOrder.indexOf(callerTier)
  const targetIndex = tierOrder.indexOf(targetTier)
  const gap = targetIndex - callerIndex

  if (gap >= 2) {
    // Caller is punching up
    const targetYears = (targetCareerDays / 365).toFixed(1)
    return `${callerName} calling out ${targetName} who has ${targetYears} years in the game? Bold move.`
  } else if (gap <= -2) {
    // Caller is punching down
    const callerYears = (callerCareerDays / 365).toFixed(1)
    const targetWeeks = Math.floor(targetCareerDays / 7)
    return `${callerName} with ${callerYears} years going after ${targetName} who's only ${targetWeeks} weeks in? Looking for easy work.`
  }

  return null // No significant gap
}

/**
 * Check if career should be auto-revealed (e.g., tournament entry)
 */
export function shouldAutoReveal(
  careerDays: number,
  context: 'tournament' | 'major_league' | 'title_shot' | 'media_spotlight'
): boolean {
  switch (context) {
    case 'tournament':
      // Tournaments require public career for bracket seeding
      return true
    case 'major_league':
      // Major leagues (URL, RBE) require established careers
      return careerDays >= 270 // Established+
    case 'title_shot':
      // Title shots make your career public (you're in the spotlight)
      return true
    case 'media_spotlight':
      // Being featured in major media reveals career
      return true
    default:
      return false
  }
}
