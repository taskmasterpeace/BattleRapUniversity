import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/db/server"
import { ALL_BADGES } from "@/lib/all-badges"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get all player-controlled battlers with their attributes, rankings, leagues, crews, and cities
    const { data: battlers, error } = await supabase
      .from('battlers')
      .select(`
        *,
        battler_attributes(*),
        rankings(*),
        leagues:primary_league_id(id, name, prestige_level),
        crews:crew_id(id, name, tag),
        cities:city_id(id, name, state, region, scene_size)
      `)
      .eq('is_ai', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching roster:', error)
      return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 })
    }

    // Get next battle for each battler
    const battlerIds = battlers?.map(b => b.id) || []

    // Fetch earned badges for all battlers
    const { data: earnedBadges } = await supabase
      .from('badge_earned')
      .select('battler_id, badge_code, earned_at, is_active')
      .in('battler_id', battlerIds)
      .eq('is_active', true)
      .order('earned_at', { ascending: false })

    const { data: nextBattles } = await supabase
      .from('battles')
      .select(`
        id,
        battler_player_id,
        battler_ai_id,
        scheduled_at,
        status,
        opponent:battler_ai_id(id, stage_name),
        league:league_id(name)
      `)
      .in('battler_player_id', battlerIds)
      .in('status', ['offered', 'accepted', 'locked'])
      .order('scheduled_at', { ascending: true })

    // Helper to format career days
    function formatCareerDays(days: number): string {
      if (days < 7) return `${days} days`
      if (days < 90) return `${Math.floor(days / 7)} weeks`
      if (days < 365) return `${(days / 30).toFixed(1)} months`
      return `${(days / 365).toFixed(1)} years`
    }

    // Helper to get career tier
    function getCareerTier(days: number): string {
      if (days <= 90) return 'rookie'
      if (days <= 270) return 'rising'
      if (days <= 730) return 'established'
      if (days <= 1825) return 'veteran'
      return 'legend'
    }

    // Map battlers to frontend format
    const formattedBattlers = battlers?.map(battler => {
      const attrs = battler.battler_attributes?.[0] || {}
      const ranking = battler.rankings?.[0] || {}
      const league = battler.leagues
      const city = battler.cities
      const nextBattle = nextBattles?.find(b => b.battler_player_id === battler.id)

      const wins = ranking.wins || 0
      const losses = ranking.losses || 0
      const totalBattles = wins + losses

      // Career data - player's own career is always visible to them
      const careerDays = battler.career_days || 0
      const careerPublic = battler.career_public || false
      const careerTier = getCareerTier(careerDays)
      const careerDisplay = formatCareerDays(careerDays)

      return {
        id: battler.id,
        stageName: battler.stage_name,
        tier: battler.tier?.toUpperCase() + ' TIER',
        styleTags: battler.style_tags || [],
        avatarUrl: battler.avatar_url || "/rapper-pixel.jpg",
        bannerUrl: battler.banner_url || "/small-intimate-battle-rap-venue-purple-lighting.jpg",
        // City data from cities table
        city: city ? {
          name: city.name,
          state: city.state,
          region: city.region,
        } : null,
        region: city?.region || battler.region || null,
        league: league ? {
          name: league.name,
          logo_url: "/placeholder-logo.png",
        } : null,
        crew: battler.crews ? {
          id: battler.crews.id,
          name: battler.crews.name,
          tag: battler.crews.tag,
        } : null,
        attributes: {
          writing: attrs.writing || { lyricism: 5, wordplay: 5, creativity: 5, flow: 5 },
          performance: attrs.performance || { stagePresence: 5, crowdControl: 5, delivery: 5 },
          personal: attrs.personal || { financial: 5, reputation: 5, family: 5, resilience: 5 },
        },
        ranking: {
          rating: ranking.rating || 1000,
          wins,
          losses,
          streak: ranking.current_streak || 0,
        },
        stats: {
          totalBattles,
          wins,
          losses,
          winRate: totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0,
          streak: ranking.current_streak || 0,
          rating: ranking.rating || 1000,
        },
        nextBattle: nextBattle ? {
          opponent: nextBattle.opponent?.stage_name,
          date: nextBattle.scheduled_at,
          league: nextBattle.league?.name,
        } : null,
        badges: (earnedBadges || [])
          .filter(eb => eb.battler_id === battler.id)
          .map(eb => {
            const badge = ALL_BADGES.find(b => b.id === eb.badge_code)
            return badge ? {
              id: badge.id,
              name: badge.name,
              description: badge.description,
              rarity: badge.rarity,
              category: badge.category,
              icon: badge.icon,
              earnedAt: eb.earned_at,
            } : null
          })
          .filter(Boolean),
        isActive: battler.id === battlers[0]?.id, // First battler is active
        // Career tracking data
        careerDays,
        careerPublic,
        careerTier,
        careerDisplay,
      }
    }) || []

    return NextResponse.json({ battlers: formattedBattlers })
  } catch (err) {
    console.error('Roster API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
