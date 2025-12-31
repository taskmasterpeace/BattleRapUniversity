import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battleId } = await params
    const supabase = createServerClient()

    // Get battle with related data
    const { data: battle, error } = await supabase
      .from('battles')
      .select(`
        *,
        player:battler_player_id(
          id,
          stage_name,
          tier,
          style_tags,
          avatar_url
        ),
        opponent:battler_ai_id(
          id,
          stage_name,
          tier,
          style_tags,
          avatar_url
        ),
        league:league_id(
          id,
          name,
          short_code,
          round_length_minutes,
          prestige_level
        )
      `)
      .eq('id', battleId)
      .single()

    if (error || !battle) {
      console.error('Error fetching battle:', error)
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    // Get battle rounds
    const { data: rounds } = await supabase
      .from('battle_rounds')
      .select('*')
      .eq('battle_id', battleId)
      .order('round_index', { ascending: true })

    // Get battle segments
    const { data: segments } = await supabase
      .from('battle_segments')
      .select('*')
      .eq('battle_id', battleId)
      .order('round_index', { ascending: true })
      .order('segment_index', { ascending: true })

    // Get player and opponent rankings
    const [playerRankingRes, opponentRankingRes] = await Promise.all([
      supabase.from('rankings').select('*').eq('battler_id', battle.battler_player_id).single(),
      supabase.from('rankings').select('*').eq('battler_id', battle.battler_ai_id).single(),
    ])

    // Get player's current attributes for PostBattleSummary
    const { data: playerAttributes } = await supabase
      .from('battler_attributes')
      .select('*')
      .eq('battler_id', battle.battler_player_id)
      .single()

    // Get progression data from battle_progression table
    const { data: progression } = await supabase
      .from('battle_progression')
      .select('*')
      .eq('battle_id', battleId)
      .eq('battler_id', battle.battler_player_id)
      .single()

    // Get badges earned from this battle
    const { data: badges } = await supabase
      .from('badge_earned')
      .select(`
        badge_code,
        earned_reason,
        badge_definitions (
          badge_name,
          category,
          rarity,
          icon,
          description
        )
      `)
      .eq('battler_id', battle.battler_player_id)
      .eq('battle_id', battleId)
      .eq('is_active', true)

    // Format response to match expected frontend structure
    const playerRounds = (rounds || []).filter(r => r.battler_id === battle.battler_player_id)
    const opponentRounds = (rounds || []).filter(r => r.battler_id === battle.battler_ai_id)

    const mockBattleData = {
      battle: {
        id: battle.id,
        scheduled_at: battle.scheduled_at,
        status: battle.status,
        league: {
          name: battle.league?.name?.toUpperCase() || 'LEAGUE',
          short_code: battle.league?.short_code || 'LGE',
          logo_url: "/battle-rap-league-logo.jpg",
        },
        player_battler: {
          id: battle.player?.id,
          stage_name: battle.player?.stage_name,
          tier: (battle.player?.tier || 'mid').toLowerCase(),
          avatar_url: battle.player?.avatar_url || "/rapper-pixel.jpg",
          sprite_set: "default",
        },
        ai_battler: {
          id: battle.opponent?.id,
          stage_name: battle.opponent?.stage_name,
          tier: (battle.opponent?.tier || 'mid').toLowerCase(),
          avatar_url: battle.opponent?.avatar_url || "/rapper-portrait-pixel-art.jpg",
          sprite_set: "default",
        },
        winner_battler_id: battle.winner_battler_id,
        is_grudge_match: false,
        grudge_intensity: 0,
      },
      rounds: rounds || [],
      segments: segments || [],
      // Earnings calculation
      earnings: {
        basePay: Number(battle.player_payout) || 500,
        winBonus: battle.winner_battler_id === battle.battler_player_id ? 1000 : 0,
        performanceBonus: calculatePerformanceBonus(playerRounds),
        rivalryBonus: 0,
        total: Number(battle.player_payout) || 500,
      },
      rating_change: calculateRatingChange(playerRankingRes.data, battle.winner_battler_id === battle.battler_player_id),
      verdict: battle.verdict,
      decision_type: battle.decision_type,
      // PostBattleSummary progression data (from battle_progression table)
      progression: {
        newRating: progression?.rating_after || playerRankingRes.data?.rating || 1200,
        ratingChange: progression?.rating_change || 0,
        attributeChanges: formatAttributeChanges(progression?.attribute_changes),
        badgesEarned: (badges || []).map(b => ({
          code: b.badge_code,
          name: b.badge_definitions?.badge_name || 'Unknown Badge',
          category: b.badge_definitions?.category || 'content',
          rarity: b.badge_definitions?.rarity || 'common',
          icon: b.badge_definitions?.icon || '🎤',
          description: b.badge_definitions?.description || '',
          earnedReason: b.earned_reason || 'Battle performance',
        })),
        stressChange: progression?.stress_change || 0,
        currentStress: progression?.stress_after || playerAttributes?.personal?.stress || 50,
        viewData: {
          totalViews: progression?.total_views || 0,
          viewTier: progression?.view_tier || 'low',
        },
        fanGrowth: {
          fansBefore: progression?.fans_before || 0,
          fansAfter: progression?.fans_after || 0,
          fansGained: progression?.fans_gained || 0,
          trendingChange: progression?.trending_change || 0,
        },
        levelUpData: {
          leveledUp: false,
          previousLevel: 5,
          newLevel: 5,
          skillPointsEarned: 0,
          xpEarned: battle.winner_battler_id === battle.battler_player_id ? 450 : 150,
        },
      },
    }

    return NextResponse.json(mockBattleData)
  } catch (err) {
    console.error('Battle GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculatePerformanceBonus(playerRounds: any[]): number {
  if (!playerRounds || playerRounds.length === 0) return 0
  const avgCrowd = playerRounds.reduce((sum, r) => sum + (r.crowd_reaction || 0), 0) / playerRounds.length
  const avgPeak = playerRounds.reduce((sum, r) => sum + (r.peak_score || 0), 0) / playerRounds.length

  let bonus = 0
  if (avgCrowd > 80) bonus += 300
  else if (avgCrowd > 60) bonus += 150

  if (avgPeak > 9) bonus += 200
  else if (avgPeak > 8) bonus += 100

  return bonus
}

function calculateRatingChange(ranking: any, won: boolean): number {
  // Estimate rating change (actual is already applied)
  const baseChange = 25
  return won ? baseChange : -baseChange
}

function formatAttributeChanges(changesJson: any): any[] {
  // Parse attribute changes from battle_progression JSONB field
  if (!changesJson) return []

  const changes: any[] = []
  const attributeGroups = ['writing', 'performance', 'personal']

  for (const group of attributeGroups) {
    if (!changesJson[group]) continue

    for (const [attr, values] of Object.entries(changesJson[group])) {
      const v = values as { before: number; after: number; change: number }
      if (v.change !== 0) {
        changes.push({
          attribute: attr.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          category: group,
          oldValue: v.before,
          newValue: v.after,
          change: v.change,
        })
      }
    }
  }

  return changes
}

function calculateViewData(playerRounds: any[], prestigeLevel: number): { total_views: number; view_tier: 'low' | 'mid' | 'high' | 'viral' } {
  // Calculate views based on performance and league prestige
  const avgCrowd = playerRounds.length > 0
    ? playerRounds.reduce((sum, r) => sum + (r.crowd_reaction || 0), 0) / playerRounds.length
    : 50

  const baseViews = prestigeLevel * 5000
  const crowdMultiplier = 1 + (avgCrowd - 50) / 100 // +/- 50% based on crowd
  const totalViews = Math.floor(baseViews * crowdMultiplier * (0.8 + Math.random() * 0.4))

  let tier: 'low' | 'mid' | 'high' | 'viral' = 'low'
  if (totalViews >= 100000) tier = 'viral'
  else if (totalViews >= 50000) tier = 'high'
  else if (totalViews >= 10000) tier = 'mid'

  return { total_views: totalViews, view_tier: tier }
}

function calculateFanGrowth(won: boolean, playerRounds: any[]): any {
  const avgCrowd = playerRounds.length > 0
    ? playerRounds.reduce((sum, r) => sum + (r.crowd_reaction || 0), 0) / playerRounds.length
    : 50

  const baseFans = 250 // Simulated current fans
  const baseGain = won ? 100 : 20
  const crowdBonus = Math.floor((avgCrowd - 50) * 2)
  const fansGained = Math.max(0, baseGain + crowdBonus)

  return {
    fans_before: baseFans,
    fans_after: baseFans + fansGained,
    fans_gained: fansGained,
    trending_change: won ? Math.floor(avgCrowd / 5) : -5,
  }
}
