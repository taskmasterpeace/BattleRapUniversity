import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import type { Battler, BattlerStats } from "@/lib/types"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: battlerId } = await params
    const supabase = createServerClient()

    // Get battler with attributes and ranking
    const { data: battler, error: battlerError } = await supabase
      .from('battlers')
      .select(`
        id,
        stage_name,
        tier,
        region,
        style_tags,
        avatar_url,
        sprite_url,
        primary_league_id,
        is_ai,
        league:primary_league_id(
          id,
          name,
          short_code
        )
      `)
      .eq('id', battlerId)
      .single()

    if (battlerError || !battler) {
      return NextResponse.json({ error: 'Battler not found' }, { status: 404 })
    }

    // Get attributes
    const { data: attributes } = await supabase
      .from('battler_attributes')
      .select('*')
      .eq('battler_id', battlerId)
      .single()

    // Get ranking
    const { data: ranking } = await supabase
      .from('rankings')
      .select('rating, wins, losses, streak')
      .eq('battler_id', battlerId)
      .single()

    // Get earned badges
    const { data: earnedBadges } = await supabase
      .from('badge_earned')
      .select('badge_code, earned_at, category, rarity')
      .eq('battler_id', battlerId)
      .eq('is_active', true)

    // Get manager history
    const { data: managerHistory } = await supabase
      .from('manager_history')
      .select(`
        id,
        started_at,
        ended_at,
        end_reason,
        tenure_wins,
        tenure_losses,
        manager:manager_id(id)
      `)
      .eq('battler_id', battlerId)
      .order('started_at', { ascending: false })

    // Get active grudges
    const { data: grudges } = await supabase
      .from('manager_grudges')
      .select('ex_manager_id, intensity, reason')
      .eq('battler_id', battlerId)
      .is('faded_at', null)

    // Build stats object from attributes
    const writing = attributes?.writing as Record<string, number> | null
    const performance = attributes?.performance as Record<string, number> | null
    const personal = attributes?.personal as Record<string, number> | null

    const stats: BattlerStats = {
      writing: {
        lyricism: writing?.lyricism ?? 5,
        wordplay: writing?.wordplay ?? 5,
        creativity: writing?.creativity ?? 5,
        flow: writing?.flow ?? 5,
      },
      performance: {
        stagePresence: performance?.stage_presence ?? 5,
        crowdControl: performance?.crowd_control ?? 5,
        delivery: performance?.delivery ?? 5,
      },
      personal: {
        financial: personal?.financial_stability ?? 5,
        reputation: personal?.reputation ?? 5,
        family: personal?.family_bond ?? 5,
        resilience: attributes?.resilience ?? 5,
      },
    }

    // Map tier from database to display format
    const tierMap: Record<string, string> = {
      'low': 'LOW TIER',
      'mid': 'MID TIER',
      'top': 'TOP TIER',
      'god': 'GOD TIER',
    }

    const response = {
      id: battler.id,
      stageName: battler.stage_name,
      elo: ranking?.rating ?? 1000,
      region: battler.region || 'Unknown',
      tier: tierMap[battler.tier] || battler.tier?.toUpperCase() + ' TIER' || 'MID TIER',
      league: (battler.league as any)?.name?.toUpperCase() || 'SMALL ROOM CIRCUIT',
      archetype: determineArchetype(stats),
      stats,
      styles: (battler.style_tags as string[]) || [],
      record: {
        wins: ranking?.wins ?? 0,
        losses: ranking?.losses ?? 0,
      },
      streak: ranking?.streak ?? 0,
      stress: attributes?.stress ?? 50,
      badges: earnedBadges?.map(b => b.badge_code) || [],
      badgesDetailed: earnedBadges?.map(b => ({
        code: b.badge_code,
        earnedAt: b.earned_at,
        category: b.category,
        rarity: b.rarity,
      })) || [],
      styleTags: (battler.style_tags as string[]) || [],
      portrait: {
        spriteUrl: battler.sprite_url || battler.avatar_url || '/sprites/characters/sprite_661.png',
        crop: { scale: 1, offsetX: 0, offsetY: 0 },
      },
      // Manager tracking
      managerHistory: managerHistory?.map(h => ({
        id: h.id,
        startedAt: h.started_at,
        endedAt: h.ended_at,
        endReason: h.end_reason,
        tenureWins: h.tenure_wins,
        tenureLosses: h.tenure_losses,
      })) || [],
      grudges: grudges?.map(g => ({
        exManagerId: g.ex_manager_id,
        intensity: g.intensity,
        reason: g.reason,
      })) || [],
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Battler route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function determineArchetype(stats: BattlerStats): string {
  const writingAvg = (stats.writing.lyricism + stats.writing.wordplay + stats.writing.creativity + stats.writing.flow) / 4
  const perfAvg = (stats.performance.stagePresence + stats.performance.crowdControl + stats.performance.delivery) / 3

  if (writingAvg >= 7 && perfAvg < 6) return 'Technical Writer'
  if (perfAvg >= 7 && writingAvg < 6) return 'Stage Performer'
  if (stats.writing.wordplay >= 8) return 'Punchline Specialist'
  if (stats.writing.creativity >= 8) return 'Creative Genius'
  if (stats.performance.crowdControl >= 8) return 'Crowd Controller'
  if (stats.personal.resilience >= 8) return 'Clutch Performer'
  return 'All-Rounder'
}
