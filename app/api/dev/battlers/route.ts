import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET() {
  try {
    // Get all battlers with full data
    const { data, error } = await supabase
      .from('battlers')
      .select(`
        id,
        stage_name,
        tier,
        region,
        avatar_url,
        sprite_url,
        sprite_set,
        portrait_crop,
        style_tags,
        user_id,
        is_ai,
        city:cities!battlers_city_id_fkey(
          id,
          name,
          state,
          region
        ),
        battler_attributes(
          writing,
          performance,
          personal,
          resilience
        ),
        rankings(rating, wins, losses)
      `)
      .order('stage_name')

    if (error) {
      console.error('Error fetching battlers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log raw data for first battler to debug portrait_crop
    if (data && data.length > 0) {
      console.log('[DEV BATTLERS GET] Sample raw battler data:', JSON.stringify({
        id: data[0].id,
        stage_name: data[0].stage_name,
        portrait_crop: data[0].portrait_crop,
        sprite_url: data[0].sprite_url,
      }, null, 2))
    }

    // Transform data to match frontend types
    const battlers = (data || []).map((b: any) => {
      const attrs = b.battler_attributes || {}
      const writing = attrs.writing || {}
      const performance = attrs.performance || {}
      const personal = attrs.personal || {}

      // Priority: sprite_url > sprite_set[0] > avatar_url > default
      const spriteUrl = b.sprite_url
        || (b.sprite_set?.length > 0 ? b.sprite_set[0] : null)
        || b.avatar_url
        || '/sprites/characters/sprite_569.png'

      return {
        id: b.id,
        stageName: b.stage_name,
        tier: b.tier || 'low',
        elo: b.rankings?.rating || 1000,
        region: b.city?.region || b.region || 'Unknown',
        city: b.city ? {
          name: b.city.name,
          state: b.city.state,
          region: b.city.region,
        } : null,
        league: 'URL', // Default
        archetype: 'Unknown',
        stats: {
          writing: {
            lyricism: writing.lyricism || 5,
            wordplay: writing.wordplay || 5,
            creativity: writing.creativity || 5,
            flow: writing.flow || 5,
          },
          performance: {
            stagePresence: performance.stage_presence || 5,
            crowdControl: performance.crowd_control || 5,
            delivery: performance.delivery || 5,
          },
          personal: {
            financial: personal.financial_stability || 5,
            reputation: personal.reputation || 5,
            family: personal.family_bond || 5,
            resilience: attrs.resilience || 5,
          },
        },
        styles: b.style_tags || [],
        record: {
          wins: b.rankings?.wins || 0,
          losses: b.rankings?.losses || 0,
        },
        badges: [],
        portrait: {
          spriteUrl,
          crop: b.portrait_crop || { scale: 1, offsetX: 0, offsetY: 0 },
        },
        isPlayer: !b.is_ai,
      }
    })

    return NextResponse.json({ battlers })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH endpoint to update battler
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { battlerId, portraitCrop, spriteUrl } = body

    console.log('[DEV BATTLERS PATCH] Request body:', JSON.stringify(body, null, 2))

    if (!battlerId) {
      return NextResponse.json({ error: 'battlerId is required' }, { status: 400 })
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {}

    if (portraitCrop !== undefined) {
      updateData.portrait_crop = portraitCrop
    }

    if (spriteUrl !== undefined) {
      updateData.sprite_url = spriteUrl
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    console.log('[DEV BATTLERS PATCH] Updating battler', battlerId, 'with:', JSON.stringify(updateData, null, 2))

    // Update the battler
    const { data: updateResult, error } = await supabase
      .from('battlers')
      .update(updateData)
      .eq('id', battlerId)
      .select('id, stage_name, portrait_crop')

    console.log('[DEV BATTLERS PATCH] Update result:', updateResult, 'Error:', error)

    if (error) {
      console.error('Error updating battler:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Battler updated',
      battlerId,
      updated: updateData,
      dbResult: updateResult,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
