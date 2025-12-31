import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db/server'
import {
  scoreBattlerForLeague,
  calculateBookingFee,
  isBattlerAvailable,
  evaluateMatchup,
  buildEventCard,
  League,
  Battler,
} from '@/lib/game/league-booking'

// GET /api/dev/matchmaking - Get matchmaking debug data
export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)

  const leagueId = searchParams.get('league_id')
  const action = searchParams.get('action') || 'overview'

  // Get all leagues with booking info
  const { data: leagues } = await supabase
    .from('leagues')
    .select(`
      id, name, short_code, league_tier, budget_per_card,
      cards_per_month, max_battles_per_card, style_weights,
      regional_preference, min_prep_days, prestige_level,
      writing_weight, performance_weight
    `)
    .order('prestige_level', { ascending: false })

  // Get all battlers with booking info and badges
  const { data: battlers } = await supabase
    .from('battlers')
    .select(`
      id, stage_name, tier, region, style_tags, badges, avatar_url,
      base_booking_fee, rest_days_required, last_battle_date,
      available_from, booking_status, popularity_score, is_ai,
      rankings(rating, wins, losses, streak)
    `)
    .order('base_booking_fee', { ascending: false })

  if (action === 'overview') {
    // Return summary data
    const leagueSummary = (leagues || []).map(league => ({
      id: league.id,
      name: league.name,
      tier: league.league_tier,
      budget: league.budget_per_card,
      max_battles: league.max_battles_per_card,
      cards_per_month: league.cards_per_month,
      min_prep_days: league.min_prep_days,
      style_weights: league.style_weights,
      regional_preference: league.regional_preference,
    }))

    const battlerSummary = (battlers || []).map(b => ({
      id: b.id,
      name: b.stage_name,
      tier: b.tier,
      base_fee: b.base_booking_fee,
      calculated_fee: calculateBookingFee(b as Battler),
      region: b.region,
      styles: b.style_tags,
      badges: b.badges || [],
      avatar_url: b.avatar_url,
      status: b.booking_status,
      is_ai: b.is_ai,
      streak: b.rankings?.streak || 0,
      popularity: b.popularity_score,
    }))

    // Group battlers by tier
    const battlersByTier = {
      god: battlerSummary.filter(b => b.tier === 'god'),
      top: battlerSummary.filter(b => b.tier === 'top'),
      mid: battlerSummary.filter(b => b.tier === 'mid'),
      low: battlerSummary.filter(b => b.tier === 'low'),
    }

    return NextResponse.json({
      leagues: leagueSummary,
      battlers_by_tier: battlersByTier,
      total_battlers: battlerSummary.length,
      ai_battlers: battlerSummary.filter(b => b.is_ai).length,
      player_battlers: battlerSummary.filter(b => !b.is_ai).length,
    })
  }

  if (action === 'score_battlers' && leagueId) {
    // Score all battlers for a specific league
    const league = (leagues || []).find(l => l.id === leagueId) as League | undefined
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    const battleDate = new Date()
    battleDate.setDate(battleDate.getDate() + (league.min_prep_days || 7))

    const scoredBattlers = (battlers || [])
      .filter(b => b.is_ai)
      .map(b => {
        const score = scoreBattlerForLeague(b as Battler, league, battleDate)
        const availability = isBattlerAvailable(b as Battler, battleDate)
        return {
          ...score,
          is_available: availability.available,
          availability_reason: availability.reason,
        }
      })
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({
      league: {
        name: league.name,
        tier: league.league_tier,
        budget: league.budget_per_card,
        style_weights: league.style_weights,
      },
      battle_date: battleDate.toISOString().split('T')[0],
      scored_battlers: scoredBattlers,
    })
  }

  if (action === 'simulate_card' && leagueId) {
    // Simulate building a full card for a league
    const league = (leagues || []).find(l => l.id === leagueId) as League | undefined
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    const battleDate = new Date()
    battleDate.setDate(battleDate.getDate() + (league.min_prep_days || 7) + 7)

    // Find player battler if any
    const playerBattler = (battlers || []).find(b => !b.is_ai)

    const card = await buildEventCard(
      league,
      battleDate,
      playerBattler?.id || null,
      supabase
    )

    return NextResponse.json({
      league: {
        name: league.name,
        tier: league.league_tier,
        budget: league.budget_per_card,
      },
      scheduled_date: card.scheduled_date,
      total_budget: card.total_budget,
      positions: card.positions,
      matchups: card.matchups.map((m, i) => {
        if (!m) return { position: card.positions[i], matchup: null }
        return {
          position: card.positions[i],
          matchup: {
            battler_a: m.battler_a.stage_name,
            battler_a_tier: m.battler_a.tier,
            battler_a_fee: m.score_breakdown.battler_a_score.booking_fee,
            battler_b: m.battler_b.stage_name,
            battler_b_tier: m.battler_b.tier,
            battler_b_fee: m.score_breakdown.battler_b_score.booking_fee,
            combined_score: m.combined_score,
            combined_fee: m.combined_fee,
            is_sequel: m.is_sequel,
            sequel_info: m.is_sequel ? {
              number: m.sequel_number,
              reason: m.sequel_reason,
            } : null,
            score_breakdown: {
              battler_a: m.score_breakdown.battler_a_score,
              battler_b: m.score_breakdown.battler_b_score,
            },
          },
        }
      }),
      debug_info: card.debug_info,
    })
  }

  if (action === 'check_sequel') {
    const battlerAId = searchParams.get('battler_a')
    const battlerBId = searchParams.get('battler_b')

    if (!battlerAId || !battlerBId) {
      return NextResponse.json({
        error: 'Missing battler_a or battler_b parameter',
      }, { status: 400 })
    }

    const checkDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const { data: sequelCheck } = await supabase.rpc('is_sequel_allowed', {
      p_battler_1: battlerAId,
      p_battler_2: battlerBId,
      p_check_date: checkDate,
    })

    // Get pairing history
    const { data: pairing } = await supabase
      .from('battle_pairings')
      .select('*')
      .or(`and(battler_a_id.eq.${battlerAId},battler_b_id.eq.${battlerBId}),and(battler_a_id.eq.${battlerBId},battler_b_id.eq.${battlerAId})`)
      .single()

    return NextResponse.json({
      sequel_check: sequelCheck,
      pairing_history: pairing,
      check_date: checkDate,
    })
  }

  return NextResponse.json({
    error: 'Invalid action. Use: overview, score_battlers, simulate_card, check_sequel',
  }, { status: 400 })
}
