import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';

/**
 * GET /api/battler/badges
 * Returns the current player's earned badges (style_tags)
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get battler
    const { data: battler, error: battlerError } = await supabase
      .from('battlers')
      .select('id, style_tags')
      .eq('user_id', user.id)
      .single();

    if (battlerError || !battler) {
      return NextResponse.json({ error: 'Battler not found' }, { status: 404 });
    }

    return NextResponse.json({
      badges: battler.style_tags || [],
      count: (battler.style_tags || []).length,
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
