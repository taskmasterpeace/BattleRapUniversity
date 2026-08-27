import { createServerSupabaseClient } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { getPlayerBattler } from '@/lib/game/getPlayerBattler';

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

  // Never surface the same pending decision twice. Insert-time dedup now blocks
  // new stacking, but rows created before it (and the "sticky, one card per event"
  // design intent) mean the same template can still sit in the queue more than
  // once. Collapse to the newest pending event per template_code (already ordered
  // newest-first) so the player sees one Rock Bottom, not a stack of identical cards.
  const seen = new Set<string>();
  const deduped = (events || []).filter((e: any) => {
    if (seen.has(e.template_code)) return false;
    seen.add(e.template_code);
    return true;
  });

  return NextResponse.json({ events: deduped });
}
