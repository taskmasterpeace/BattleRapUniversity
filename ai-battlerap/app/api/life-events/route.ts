import { createServerSupabaseClient } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { prepareLifeEvents } from '@/lib/content/lifeEventContext';

/**
 * GET /api/life-events
 * Fetch pending life events for the authenticated player's battler
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();

  // Get player's battler. No battler isn't an error worth a console 404 on
  // every page that mounts the widget — there are simply no events yet.
  const { battler } = await getPlayerBattler();
  if (!battler) {
    return NextResponse.json({ events: [] });
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

  // Dedup exact-duplicate events and attach opponent/league so the widget can
  // tell two different 3-0 losses apart (see prepareLifeEvents).
  const enriched = await prepareLifeEvents(supabase, events || []);

  return NextResponse.json({ events: enriched });
}
