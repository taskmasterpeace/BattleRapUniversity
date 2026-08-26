import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * THE WIRE — player actions. The three MVP verbs from the spec
 * (docs/design/THE_WIRE_SOCIAL_NETWORK.md):
 *   manager_drop — post from your camp account (stance: hype|defend|humble)
 *   reply        — answer a callout/controversy (stance: fire_back|take_high_road)
 *   ignore       — deliberate silence (recorded; the scene notices patterns)
 *
 * Players never type free text (no user-generated-text law) — every drop is
 * stance-templated. Feed reactions ARE gameplay: actions move public
 * knowledge, reputation, and rivalry intensity.
 */

const STANCES: Record<string, string[]> = {
  manager_drop: ['hype', 'defend', 'humble'],
  reply: ['fire_back', 'take_high_road'],
  ignore: [],
};

const stripName = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '');

function dropBody(stance: string, name: string, oppName?: string): string {
  switch (stance) {
    case 'hype':
      return `Camp check-in: ${name} is locked in. The next one is getting handled — mark the date. 📅`;
    case 'defend':
      return `Y'all watched a different battle. Run the tape back — ${name} gave up nothing after the first. We move forward.`;
    case 'humble':
      return `Took our lumps tonight. No excuses, no complaints. ${name} is back in the lab Monday.`;
    case 'fire_back':
      return `Enjoy the moment${oppName ? `, ${oppName}` : ''}. ${name} wants the rematch — same stage, bigger stakes. Send the paperwork. 📄`;
    case 'take_high_road':
      return `Respect${oppName ? ` to ${oppName}` : ''} — they earned the night. ${name}'s story isn't done being written.`;
    default:
      return `${name}'s camp has no comment at this time.`;
  }
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { action?: string; stance?: string; post_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { action, stance, post_id: postId } = body;
  if (!action || !(action in STANCES)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
  if (STANCES[action].length > 0 && (!stance || !STANCES[action].includes(stance))) {
    return NextResponse.json({ error: 'Invalid stance for action' }, { status: 400 });
  }
  if ((action === 'reply' || action === 'ignore') && !postId) {
    return NextResponse.json({ error: 'post_id required' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .single();
  if (!battler) return NextResponse.json({ error: 'No battler found' }, { status: 404 });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // One response per post — silence included.
  if (postId) {
    const { data: prior } = await admin
      .from('wire_player_actions')
      .select('id')
      .eq('post_id', postId)
      .eq('battler_id', battler.id)
      .limit(1);
    if (prior && prior.length > 0) {
      return NextResponse.json({ error: 'Already responded to this drop' }, { status: 409 });
    }
  }

  // Original post (for replies/ignores) + its author for name context.
  type OriginalPost = {
    id: string;
    battle_id: string | null;
    account: { handle: string; display_name: string; battler_id: string | null } | null;
  };
  let original: OriginalPost | null = null;
  if (postId) {
    const { data } = await admin
      .from('wire_posts')
      .select('id, battle_id, account:social_accounts(handle, display_name, battler_id)')
      .eq('id', postId)
      .single();
    original = (data as unknown as OriginalPost) ?? null;
    if (!original) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // ---- Effects: feed reactions ARE gameplay ----
  const { data: attrs } = await admin
    .from('battler_attributes')
    .select('battler_id, personal, public_knowledge')
    .eq('battler_id', battler.id)
    .single();

  const effects: Record<string, number> = {};
  const personal = { ...((attrs?.personal as Record<string, number>) ?? {}) };
  let publicKnowledge = Number(attrs?.public_knowledge ?? 0);

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const bumpRep = (d: number) => {
    personal.reputation = clamp(Number(personal.reputation ?? 5) + d, 1, 10);
    effects.reputation = d;
  };
  const bumpPk = (d: number) => {
    publicKnowledge = clamp(publicKnowledge + d, 0, 100);
    effects.public_knowledge = d;
  };

  let rivalryDelta = 0;
  switch (stance) {
    case 'hype': bumpPk(2); break;
    case 'defend': bumpPk(1); bumpRep(0.05); break;
    case 'humble': bumpRep(0.1); break;
    case 'fire_back': bumpPk(3); rivalryDelta = 8; break;
    case 'take_high_road': bumpRep(0.15); rivalryDelta = -3; break;
    default: break; // ignore: silence has no immediate cost — the pattern is what costs you
  }

  if (attrs && action !== 'ignore') {
    const { error: attrError } = await admin
      .from('battler_attributes')
      .update({ personal, public_knowledge: publicKnowledge })
      .eq('battler_id', attrs.battler_id);
    if (attrError) {
      console.error('[wire] failed to apply attribute effects', attrError);
      // Don't record effects that didn't land.
      delete effects.reputation;
      delete effects.public_knowledge;
    }
  } else if (!attrs) {
    delete effects.reputation;
    delete effects.public_knowledge;
  }

  // Rivalry heat vs the battler behind the original post (if any).
  const rivalBattlerId = original?.account?.battler_id ?? null;
  if (rivalryDelta !== 0 && rivalBattlerId) {
    const { data: rel } = await admin
      .from('battler_relationships')
      .select('id, intensity')
      .or(
        `and(battler_a_id.eq.${battler.id},battler_b_id.eq.${rivalBattlerId}),and(battler_a_id.eq.${rivalBattlerId},battler_b_id.eq.${battler.id})`
      )
      .limit(1);
    if (rel && rel.length > 0) {
      await admin
        .from('battler_relationships')
        .update({ intensity: clamp(rel[0].intensity + rivalryDelta, 0, 100) })
        .eq('id', rel[0].id);
      effects.rivalry_intensity = rivalryDelta;
    }
  }

  // ---- The drop itself (not for 'ignore') ----
  let resultPostId: string | null = null;
  if (action !== 'ignore' && stance) {
    // The player's camp account — created lazily, speaks for the battler.
    const campHandle = `@${stripName(battler.stage_name)}Camp`;
    await admin.from('social_accounts').upsert(
      {
        handle: campHandle,
        display_name: `${battler.stage_name} Camp`,
        kind: 'manager',
        battler_id: battler.id,
        voice_profile: 'manager_camp',
        influence: clamp(Math.round(20 + publicKnowledge / 2), 0, 100),
        credibility: 60,
        posting_frequency: 1,
      },
      { onConflict: 'handle' }
    );
    const { data: campAccount } = await admin
      .from('social_accounts')
      .select('id, influence')
      .eq('handle', campHandle)
      .single();

    if (campAccount) {
      const text = dropBody(stance, battler.stage_name, original?.account?.display_name);
      const influence = campAccount.influence ?? 25;
      const props = Math.max(2, Math.round(influence * 4 + Math.random() * influence * 3));
      const { data: created } = await admin
        .from('wire_posts')
        .insert({
          account_id: campAccount.id,
          body: text,
          category: action === 'reply' ? 'defense' : 'announcement',
          feed_hint: 'for_you',
          battle_id: original?.battle_id ?? null,
          target_battler_id: rivalBattlerId,
          props,
          boosts: Math.round(props * 0.2),
          replies: Math.round(props * 0.1),
          meta_json: { player_action: action, stance },
        })
        .select('id')
        .single();
      resultPostId = created?.id ?? null;
    }
  }

  await admin.from('wire_player_actions').insert({
    post_id: postId ?? null,
    battler_id: battler.id,
    action,
    stance: stance ?? null,
    result_post_id: resultPostId,
    effects_applied: effects,
  });

  return NextResponse.json({ ok: true, effects, result_post_id: resultPostId });
}
