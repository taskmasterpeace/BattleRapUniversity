import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { battlerId } = body

    if (!battlerId) {
      return NextResponse.json({ error: 'battlerId is required' }, { status: 400 })
    }

    // Get current user from session
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role to update battler
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Ensure user has a profile (required for manager_id FK)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          display_name: user.email?.split('@')[0] || 'Manager'
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }
    }

    // Verify battler is available (is_ai=true and user_id=null)
    const { data: battler, error: checkError } = await supabaseAdmin
      .from('battlers')
      .select('id, stage_name, is_ai, user_id')
      .eq('id', battlerId)
      .single()

    if (checkError || !battler) {
      return NextResponse.json({ error: 'Battler not found' }, { status: 404 })
    }

    if (!battler.is_ai || battler.user_id) {
      return NextResponse.json({ error: 'Battler is not available for signing' }, { status: 400 })
    }

    // Sign the battler to the user
    // manager_id triggers the manager_history tracking via database trigger
    const { error: updateError } = await supabaseAdmin
      .from('battlers')
      .update({
        is_ai: false,
        user_id: user.id,
        manager_id: user.id  // Set manager - triggers history tracking
      })
      .eq('id', battlerId)

    if (updateError) {
      console.error('Error signing battler:', updateError)
      return NextResponse.json({ error: 'Failed to sign battler' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully signed ${battler.stage_name}`,
      battlerId: battlerId
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
