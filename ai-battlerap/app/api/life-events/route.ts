import { createServerSupabaseClient } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { getPlayerBattler } from '@/lib/game/getPlayerBattler';

/**
 * GET /api/life-events
 * Fetch pending life events for the authenticated player's battler
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();

  // Get player's battler
  const { battler } = await getPlayerBattler();
  if (!battler) {
    return NextResponse.json({ error: 'No battler found' }, { status: 404 });
  }

  // Fetch pending life events with template details
  const { data: events, error } = await supabase
    .from('battler_life_events')
    .select(`
      *,
      template:life_event_templates!battler_life_events_template_code_fkey(*)
    `)
    .eq('battler_id', battler.id)
    .eq('status', 'pending')
    .order('triggered_at', { ascending: false });

  if (error) {
    console.error('Error fetching life events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: events || [] });
}
