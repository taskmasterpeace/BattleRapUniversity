import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface CityData {
  name: string
  state: string
  region: string
  population: number
  coordinates: [number, number]
  time_zone: string
  city_tier: "major" | "regional" | "underground"
}

type OriginType = "text_forums" | "app_camera" | "crew"

interface CreateBattlerRequest {
  stage_name: string
  city?: CityData | null
  origin_type?: OriginType | null
  primary_league_id: string
  style_tags: string[]
  allocated_attributes: {
    writing: {
      lyricism: number
      wordplay: number
      creativity: number
      flow: number
    }
    performance: {
      stage_presence: number
      crowd_control: number
      delivery: number
    }
    personal: {
      financial_stability: number
      reputation: number
      family_bond: number
    }
    resilience: number
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateBattlerRequest = await request.json()

    // Get authenticated user from session
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized - please log in" }, { status: 401 })
    }

    // Use service role client for database operations (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Validation
    if (!body.stage_name || body.stage_name.length < 2 || body.stage_name.length > 50) {
      return NextResponse.json({ error: "Stage name must be between 2-50 characters" }, { status: 400 })
    }

    if (!body.primary_league_id) {
      return NextResponse.json({ error: "Primary league is required" }, { status: 400 })
    }

    if (!body.style_tags || body.style_tags.length < 1 || body.style_tags.length > 3) {
      return NextResponse.json({ error: "Must select 1-3 style tags" }, { status: 400 })
    }

    // Check if user already has a battler
    const { data: existingBattler } = await supabaseAdmin
      .from('battlers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_ai', false)
      .single()

    if (existingBattler) {
      return NextResponse.json({ error: "You already have a battler. Go to Roster to manage them." }, { status: 400 })
    }

    // Validate attributes total to 36 (11 * 1 min + 25 distributable)
    const attrs = body.allocated_attributes
    const total =
      attrs.writing.lyricism +
      attrs.writing.wordplay +
      attrs.writing.creativity +
      attrs.writing.flow +
      attrs.performance.stage_presence +
      attrs.performance.crowd_control +
      attrs.performance.delivery +
      attrs.personal.financial_stability +
      attrs.personal.reputation +
      attrs.personal.family_bond +
      attrs.resilience

    if (total !== 36) {
      return NextResponse.json({ error: `Attributes must total 36 points (currently ${total})` }, { status: 400 })
    }

    // Check each attribute is within 1-8
    const allValues = [
      attrs.writing.lyricism,
      attrs.writing.wordplay,
      attrs.writing.creativity,
      attrs.writing.flow,
      attrs.performance.stage_presence,
      attrs.performance.crowd_control,
      attrs.performance.delivery,
      attrs.personal.financial_stability,
      attrs.personal.reputation,
      attrs.personal.family_bond,
      attrs.resilience,
    ]

    for (const val of allValues) {
      if (val < 1 || val > 8) {
        return NextResponse.json({ error: "Each attribute must be between 1-8" }, { status: 400 })
      }
    }

    // Apply origin bonuses/penalties to attributes
    const finalAttributes = {
      writing: { ...attrs.writing },
      performance: { ...attrs.performance },
      personal: { ...attrs.personal },
      resilience: attrs.resilience
    }

    if (body.origin_type) {
      switch (body.origin_type) {
        case "text_forums":
          finalAttributes.writing.lyricism = Math.min(10, finalAttributes.writing.lyricism + 2)
          finalAttributes.writing.wordplay = Math.min(10, finalAttributes.writing.wordplay + 1)
          finalAttributes.writing.creativity = Math.min(10, finalAttributes.writing.creativity + 1)
          finalAttributes.performance.stage_presence = Math.max(1, finalAttributes.performance.stage_presence - 1)
          finalAttributes.performance.delivery = Math.max(1, finalAttributes.performance.delivery - 1)
          break
        case "app_camera":
          finalAttributes.performance.stage_presence = Math.min(10, finalAttributes.performance.stage_presence + 2)
          finalAttributes.performance.delivery = Math.min(10, finalAttributes.performance.delivery + 1)
          finalAttributes.performance.crowd_control = Math.min(10, finalAttributes.performance.crowd_control + 1)
          finalAttributes.writing.lyricism = Math.max(1, finalAttributes.writing.lyricism - 1)
          finalAttributes.writing.wordplay = Math.max(1, finalAttributes.writing.wordplay - 1)
          break
        case "crew":
          finalAttributes.personal.reputation = Math.min(10, finalAttributes.personal.reputation + 1)
          finalAttributes.resilience = Math.min(10, finalAttributes.resilience + 1)
          finalAttributes.personal.financial_stability = Math.max(1, finalAttributes.personal.financial_stability - 1)
          break
      }
    }

    // Look up city_id if city data provided
    let cityId: string | null = null
    if (body.city?.name) {
      const { data: cityData } = await supabaseAdmin
        .from('cities')
        .select('id')
        .eq('name', body.city.name)
        .single()

      if (cityData) {
        cityId = cityData.id
      }
    }

    // Create the battler in database
    const { data: newBattler, error: battlerError } = await supabaseAdmin
      .from('battlers')
      .insert({
        user_id: user.id,
        stage_name: body.stage_name,
        region: body.city?.region || null,
        city_id: cityId,
        primary_league_id: body.primary_league_id,
        style_tags: body.style_tags,
        tier: 'low',
        is_ai: false,
        origin_type: body.origin_type || null,
        origin_completed: false,
        career_days: 0,
        career_public: false,
      })
      .select()
      .single()

    if (battlerError || !newBattler) {
      console.error('Error creating battler:', battlerError)
      return NextResponse.json({ error: "Failed to create battler" }, { status: 500 })
    }

    // Create battler attributes
    const { error: attrError } = await supabaseAdmin
      .from('battler_attributes')
      .insert({
        battler_id: newBattler.id,
        writing: {
          lyricism: finalAttributes.writing.lyricism,
          wordplay: finalAttributes.writing.wordplay,
          creativity: finalAttributes.writing.creativity,
          flow: finalAttributes.writing.flow,
        },
        performance: {
          stagePresence: finalAttributes.performance.stage_presence,
          crowdControl: finalAttributes.performance.crowd_control,
          delivery: finalAttributes.performance.delivery,
        },
        personal: {
          financial: finalAttributes.personal.financial_stability,
          reputation: finalAttributes.personal.reputation,
          family: finalAttributes.personal.family_bond,
          resilience: finalAttributes.resilience,
        },
        resilience: finalAttributes.resilience,
        public_knowledge: 0,
        xp: {},
      })

    if (attrError) {
      console.error('Error creating attributes:', attrError)
      // Clean up battler if attributes failed
      await supabaseAdmin.from('battlers').delete().eq('id', newBattler.id)
      return NextResponse.json({ error: "Failed to create battler attributes" }, { status: 500 })
    }

    // Create ranking record
    const { error: rankingError } = await supabaseAdmin
      .from('rankings')
      .insert({
        battler_id: newBattler.id,
        rating: 1200,
        wins: 0,
        losses: 0,
        streak: 0,
      })

    if (rankingError) {
      console.error('Error creating ranking:', rankingError)
      // Clean up
      await supabaseAdmin.from('battler_attributes').delete().eq('battler_id', newBattler.id)
      await supabaseAdmin.from('battlers').delete().eq('id', newBattler.id)
      return NextResponse.json({ error: "Failed to create battler ranking" }, { status: 500 })
    }

    // Return success with created data
    return NextResponse.json({
      battler: {
        id: newBattler.id,
        stage_name: newBattler.stage_name,
        city: body.city || null,
        region: newBattler.region,
        origin_type: newBattler.origin_type,
        primary_league_id: newBattler.primary_league_id,
        style_tags: newBattler.style_tags,
        tier: newBattler.tier,
        created_at: newBattler.created_at,
      },
      attributes: finalAttributes,
      ranking: {
        rating: 1200,
        wins: 0,
        losses: 0,
        streak: 0,
      },
    })
  } catch (error) {
    console.error('Battler creation error:', error)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
