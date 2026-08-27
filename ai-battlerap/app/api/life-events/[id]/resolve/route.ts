import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { applyLifeEventEffects } from '@/lib/game/lifeEvents';
import { getPlayerBattler } from '@/lib/game/getPlayerBattler';
import { getVirtualNowISO } from '@/lib/dev/timeManipulation';

/**
 * POST /api/life-events/[id]/resolve
 * Resolve a pending life event by choosing an option
 *
 * Body: { choice: 'a' | 'b' }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Use service role for writing
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Get player's battler
  const { battler } = await getPlayerBattler();
  if (!battler) {
    return NextResponse.json({ error: 'No battler found' }, { status: 404 });
  }

  const { choice } = await request.json();

  if (!choice || (choice !== 'a' && choice !== 'b')) {
    return NextResponse.json(
      { error: 'Invalid choice. Must be "a" or "b"' },
      { status: 400 }
    );
  }

  const eventId = id;

  // Fetch the life event
  const { data: event, error: fetchError } = await supabase
    .from('battler_life_events')
    .select(`
      *,
      template:life_event_templates!battler_life_events_template_code_fkey(*)
    `)
    .eq('id', eventId)
    .eq('battler_id', battler.id)
    .eq('status', 'pending')
    .single();

  if (fetchError || !event) {
    return NextResponse.json(
      { error: 'Life event not found or already resolved' },
      { status: 404 }
    );
  }

  // Get the effects for the chosen option
  const template = event.template;
  let effects;

  if (choice === 'a') {
    effects = template.choice_a_effects;
  } else if (choice === 'b') {
    if (!template.choice_b_effects) {
      return NextResponse.json(
        { error: 'Choice B not available for this event' },
        { status: 400 }
      );
    }
    effects = template.choice_b_effects;
  }

  // Get current attributes BEFORE applying effects
  const { data: attributesBefore, error: attrsError } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', battler.id)
    .single();

  if (attrsError) {
    console.error('Error fetching attributes before:', attrsError);
  }

  // Get current ranking BEFORE applying effects
  const { data: rankingBefore, error: rankError } = await supabase
    .from('rankings')
    .select('rating')
    .eq('battler_id', battler.id)
    .single();

  if (rankError) {
    console.error('Error fetching ranking before:', rankError);
  }

  // Apply the effects
  await applyLifeEventEffects(supabase, battler.id, effects);

  // Get attributes AFTER applying effects
  const { data: attributesAfter } = await supabase
    .from('battler_attributes')
    .select('*')
    .eq('battler_id', battler.id)
    .single();

  // Mark the event as resolved (uses virtual time in dev mode)
  const { error: updateError } = await supabase
    .from('battler_life_events')
    .update({
      status: 'resolved',
      chosen_option: choice,
      resolved_at: getVirtualNowISO(),
    })
    .eq('id', eventId);

  if (updateError) {
    console.error('Error updating life event:', updateError);
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  // Supersede any stale duplicate pending events of the same template (e.g. a
  // second "Rock Bottom" left over from before insert-time dedup). Resolving the
  // shown card clears the rest of that kind — without re-applying their effects —
  // so a duplicate doesn't pop back up right after the player makes the decision.
  await supabase
    .from('battler_life_events')
    .update({ status: 'resolved', resolved_at: getVirtualNowISO() })
    .eq('battler_id', event.battler_id)
    .eq('template_code', event.template_code)
    .eq('status', 'pending')
    .neq('id', eventId);

  // The Newsroom: a resolved life event may become a story the blogs pick up.
  // Fire-and-forget — never blocks the resolve response.
  try {
    const { createLeadFromLifeEvent } = await import('@/lib/game/newsroom/leads');
    const { runNewsroomTick } = await import('@/lib/game/newsroom/engine');
    const leadId = await createLeadFromLifeEvent(supabase, eventId);
    if (leadId) await runNewsroomTick(supabase);
  } catch (newsroomError) {
    console.error('Error running newsroom after life event:', newsroomError);
  }

  // Calculate attribute changes for outcome display
  const attributeChanges: Record<string, { before: number; after: number; change: number }> = {};

  if (attributesBefore && attributesAfter && effects) {
    Object.keys(effects).forEach(key => {
      if (typeof effects[key] !== 'number') return;

      let beforeVal = 0;
      let afterVal = 0;

      // Handle nested attributes
      if (key === 'reputation' || key === 'financial_stability' || key === 'family_bond') {
        beforeVal = attributesBefore.personal?.[key] || 5;
        afterVal = attributesAfter.personal?.[key] || 5;
      } else if (key === 'resilience') {
        beforeVal = attributesBefore.resilience || 5;
        afterVal = attributesAfter.resilience || 5;
      } else if (key === 'public_knowledge') {
        beforeVal = attributesBefore.public_knowledge || 0;
        afterVal = attributesAfter.public_knowledge || 0;
      } else if (['lyricism', 'wordplay', 'creativity', 'flow'].includes(key)) {
        beforeVal = attributesBefore.writing?.[key] || 5;
        afterVal = attributesAfter.writing?.[key] || 5;
      } else if (['stage_presence', 'crowd_control', 'delivery'].includes(key)) {
        beforeVal = attributesBefore.performance?.[key] || 5;
        afterVal = attributesAfter.performance?.[key] || 5;
      }

      attributeChanges[key] = {
        before: beforeVal,
        after: afterVal,
        change: afterVal - beforeVal
      };
    });
  }

  return NextResponse.json({
    message: 'Life event resolved successfully',
    choice,
    effects,
    eventTitle: template.title,
    category: template.category || 'career',
    outcome: {
      attributeChanges,
      ratingBefore: rankingBefore?.rating || null,
      ratingAfter: rankingBefore?.rating || null, // Note: rating doesn't change from life events currently
    }
  });
}
