import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Use service role to bypass RLS and get all AI battlers
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get('tier')
    const region = searchParams.get('region')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build query for AI battlers that aren't owned by anyone
    // Now includes city join for proper region support
    let query = supabase
      .from('battlers')
      .select(`
        *,
        battler_attributes(*),
        rankings(*),
        city:cities!battlers_city_id_fkey(
          id,
          name,
          state,
          region,
          scene_size,
          culture_style
        ),
        primary_league:leagues!battlers_primary_league_id_fkey(
          id,
          name,
          short_code
        )
      `)
      .eq('is_ai', true)
      .is('user_id', null)
      .is('manager_id', null)  // Only show battlers without a manager
      .limit(limit)

    // Filter by tier if provided (tier is on battlers table, not leagues)
    if (tier && tier !== 'all') {
      query = query.ilike('tier', `%${tier}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching available battlers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by region if provided (need to do this after query since region is on cities table)
    let filteredData = data || []
    if (region && region !== 'all') {
      filteredData = filteredData.filter((b: any) => b.city?.region === region)
    }

    // Transform data to match frontend expectations
    const battlers = filteredData.map((b: any) => {
      // Get attributes - handle both array and object cases
      const attrs = Array.isArray(b.battler_attributes)
        ? b.battler_attributes[0]
        : b.battler_attributes

      return {
        id: b.id,
        stageName: b.stage_name,
        tier: b.tier,
        rating: b.rankings?.rating || 1000,
        // Region comes from the city now
        region: b.city?.region || b.region || 'Unknown',
        city: b.city ? {
          id: b.city.id,
          name: b.city.name,
          state: b.city.state,
          region: b.city.region,
          sceneSize: b.city.scene_size,
          cultureStyle: b.city.culture_style
        } : null,
        league: b.primary_league ? {
          id: b.primary_league.id,
          name: b.primary_league.name,
          shortCode: b.primary_league.short_code
        } : null,
        archetype: b.archetype || 'All-Rounder',
        stats: attrs ? {
          writing: {
            lyricism: attrs.writing?.lyricism || 5,
            wordplay: attrs.writing?.wordplay || 5,
            creativity: attrs.writing?.creativity || 5,
            flow: attrs.writing?.flow || 5
          },
          performance: {
            stagePresence: attrs.performance?.stage_presence || 5,
            crowdControl: attrs.performance?.crowd_control || 5,
            delivery: attrs.performance?.delivery || 5
          },
          personal: {
            financial: attrs.personal?.financial_stability || 5,
            reputation: attrs.personal?.reputation || 5,
            family: attrs.personal?.family_bond || 5,
            resilience: attrs.resilience || 5
          }
        } : null,
        styleTags: b.style_tags || [],
        record: {
          wins: b.rankings?.wins || 0,
          losses: b.rankings?.losses || 0
        },
        portrait: {
          spriteUrl: b.sprite_url || b.avatar_url || '/sprites/characters/sprite_661.png',
          // portrait_crop is already JSONB from Supabase, no need to parse
          crop: b.portrait_crop || { scale: 1, offsetX: 0, offsetY: 0 }
        }
      }
    })

    return NextResponse.json({ battlers, total: battlers.length })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
