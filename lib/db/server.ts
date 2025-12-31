import { createClient } from '@supabase/supabase-js'

// Server client with service role - bypasses RLS
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Helper to get or create dev user
export async function getDevUser() {
  const supabase = createServerClient()

  // Check if dev user exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', 'dev-user-001')
    .single()

  if (existingProfile) {
    return existingProfile
  }

  // Create dev user profile
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      id: 'dev-user-001',
      email: 'dev@battlerap.university',
      display_name: 'Dev Player'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating dev user:', error)
    return null
  }

  return newProfile
}

// Helper to get active battler for dev user
export async function getDevBattler() {
  const supabase = createServerClient()

  const { data: battler } = await supabase
    .from('battlers')
    .select(`
      *,
      battler_attributes(*),
      rankings(*)
    `)
    .eq('owner_id', 'dev-user-001')
    .eq('is_player_controlled', true)
    .single()

  return battler
}
