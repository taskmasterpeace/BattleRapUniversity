import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

/**
 * Result type for auth operations
 */
export type AuthResult<T = void> =
  | { success: true; userId: string; data?: T }
  | { success: false; error: string; status: number }

/**
 * Get authenticated user ID from session
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user.id
  } catch (err) {
    console.error('Error getting authenticated user:', err)
    return null
  }
}

/**
 * Verify that a battle belongs to the authenticated user
 */
export async function verifyBattleOwnership(
  battleId: string,
  userId: string
): Promise<AuthResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Get battle and check if battler_player_id belongs to this user
  const { data: battle, error } = await supabase
    .from('battles')
    .select(`
      id,
      battler_player:battler_player_id (
        id,
        user_id
      )
    `)
    .eq('id', battleId)
    .single()

  if (error || !battle) {
    return {
      success: false,
      error: 'Battle not found',
      status: 404
    }
  }

  const playerUserId = (battle.battler_player as any)?.user_id

  if (playerUserId !== userId) {
    return {
      success: false,
      error: 'Unauthorized - battle does not belong to you',
      status: 403
    }
  }

  return {
    success: true,
    userId
  }
}

/**
 * Verify segment ownership via battler_id
 */
export async function verifySegmentOwnership(
  segmentId: string,
  battleId: string,
  userId: string
): Promise<AuthResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: segment, error } = await supabase
    .from('prep_segments')
    .select(`
      id,
      battle_id,
      battler:battler_id (
        id,
        user_id
      )
    `)
    .eq('id', segmentId)
    .eq('battle_id', battleId)
    .single()

  if (error || !segment) {
    return {
      success: false,
      error: 'Segment not found',
      status: 404
    }
  }

  const battlerUserId = (segment.battler as any)?.user_id

  if (battlerUserId !== userId) {
    return {
      success: false,
      error: 'Unauthorized - segment does not belong to you',
      status: 403
    }
  }

  return {
    success: true,
    userId
  }
}

/**
 * Verify counter ownership via battler_id
 */
export async function verifyCounterOwnership(
  counterId: string,
  battleId: string,
  userId: string
): Promise<AuthResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: counter, error } = await supabase
    .from('prep_counters')
    .select(`
      id,
      battle_id,
      battler:battler_id (
        id,
        user_id
      )
    `)
    .eq('id', counterId)
    .eq('battle_id', battleId)
    .single()

  if (error || !counter) {
    return {
      success: false,
      error: 'Counter not found',
      status: 404
    }
  }

  const battlerUserId = (counter.battler as any)?.user_id

  if (battlerUserId !== userId) {
    return {
      success: false,
      error: 'Unauthorized - counter does not belong to you',
      status: 403
    }
  }

  return {
    success: true,
    userId
  }
}

/**
 * Helper that gets user ID and verifies battle ownership in one call
 */
export async function requireBattleOwnership(battleId: string) {
  const userId = await getAuthenticatedUserId()

  if (!userId) {
    return {
      success: false as const,
      error: 'Unauthorized - please log in',
      status: 401
    }
  }

  return await verifyBattleOwnership(battleId, userId)
}

/**
 * Helper that gets user ID and verifies segment ownership in one call
 */
export async function requireSegmentOwnership(segmentId: string, battleId: string) {
  const userId = await getAuthenticatedUserId()

  if (!userId) {
    return {
      success: false as const,
      error: 'Unauthorized - please log in',
      status: 401
    }
  }

  return await verifySegmentOwnership(segmentId, battleId, userId)
}

/**
 * Helper that gets user ID and verifies counter ownership in one call
 */
export async function requireCounterOwnership(counterId: string, battleId: string) {
  const userId = await getAuthenticatedUserId()

  if (!userId) {
    return {
      success: false as const,
      error: 'Unauthorized - please log in',
      status: 401
    }
  }

  return await verifyCounterOwnership(counterId, battleId, userId)
}
