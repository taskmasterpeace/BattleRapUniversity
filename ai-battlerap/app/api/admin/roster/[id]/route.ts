// PATCH /api/admin/roster/[id] — partial update of an AI battler from the
// roster editor: stage name, gender, identity (incl. coding), style tags,
// attributes, rating. Only fields present in the body are touched. Admin only.
import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/auth/roles';

const GENDERS = new Set(['male', 'female']);
const CODINGS = new Set(['street', 'craft', 'crossover', 'overseas']);
const IDENTITY_KEYS = [
  'ethnicity',
  'age_range',
  'build',
  'skin_tone',
  'hair',
  'facial_hair',
  'signature_look',
  'distinguishing',
  'coding',
] as const;

function clamp10(n: unknown): number | null {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.max(1, Math.min(10, Math.round(v * 10) / 10));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from('battlers')
    .select('id, is_ai, identity')
    .eq('id', id)
    .eq('is_ai', true)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'AI battler not found' }, { status: 404 });
  }

  const update: Record<string, unknown> = {};

  if (typeof body.stageName === 'string') {
    const name = body.stageName.trim();
    if (name.length < 2 || name.length > 40) {
      return NextResponse.json({ error: 'Stage name must be 2-40 characters' }, { status: 400 });
    }
    // Names key installs/updates elsewhere — refuse collisions outright.
    const { data: clash } = await supabase
      .from('battlers')
      .select('id')
      .eq('stage_name', name)
      .neq('id', id)
      .maybeSingle();
    if (clash) {
      return NextResponse.json({ error: `Another battler is already named "${name}"` }, { status: 409 });
    }
    update.stage_name = name;
  }

  if (body.gender !== undefined) {
    if (body.gender !== null && !GENDERS.has(body.gender)) {
      return NextResponse.json({ error: 'gender must be male, female, or null' }, { status: 400 });
    }
    update.gender = body.gender;
  }

  if (body.identity !== undefined && typeof body.identity === 'object' && body.identity !== null) {
    if (body.identity.coding && !CODINGS.has(body.identity.coding)) {
      return NextResponse.json(
        { error: 'coding must be street, craft, crossover, or overseas' },
        { status: 400 }
      );
    }
    // Merge onto the stored identity so partial edits never drop locked fields.
    const merged: Record<string, unknown> = { ...(existing.identity ?? {}) };
    for (const k of IDENTITY_KEYS) {
      if (body.identity[k] !== undefined) {
        const v = body.identity[k];
        if (v === null || v === '') delete merged[k];
        else if (typeof v === 'string') merged[k] = v.trim();
      }
    }
    // Persona facets — real-culture identity lanes (Christian, LGBTQ, ex-con,
    // veteran…) that shape angles and content. Free vocabulary, owner-curated.
    if (body.identity.facets !== undefined) {
      const facets = Array.isArray(body.identity.facets)
        ? body.identity.facets
            .filter((f: unknown) => typeof f === 'string' && f.trim().length > 0)
            .map((f: string) => f.trim())
            .slice(0, 6)
        : [];
      if (facets.length > 0) merged.facets = facets;
      else delete merged.facets;
    }
    update.identity = merged;
  }

  if (Array.isArray(body.styleTags)) {
    update.style_tags = body.styleTags
      .filter((t: unknown) => typeof t === 'string' && t.trim().length > 0)
      .map((t: string) => t.trim())
      .slice(0, 8);
  }

  if (typeof body.region === 'string') {
    update.region = body.region.trim() || null;
  }

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from('battlers').update(update).eq('id', id);
    if (error) {
      console.error('roster battler update failed:', error);
      return NextResponse.json({ error: 'Failed to update battler' }, { status: 500 });
    }
  }

  if (body.attributes && typeof body.attributes === 'object') {
    const a = body.attributes;
    const attrUpdate: Record<string, unknown> = {};
    if (a.writing) {
      attrUpdate.writing = {
        lyricism: clamp10(a.writing.lyricism) ?? 5,
        wordplay: clamp10(a.writing.wordplay) ?? 5,
        creativity: clamp10(a.writing.creativity) ?? 5,
        flow: clamp10(a.writing.flow) ?? 5,
      };
    }
    if (a.performance) {
      attrUpdate.performance = {
        stage_presence: clamp10(a.performance.stage_presence) ?? 5,
        crowd_control: clamp10(a.performance.crowd_control) ?? 5,
        delivery: clamp10(a.performance.delivery) ?? 5,
      };
    }
    if (a.personal) {
      attrUpdate.personal = {
        financial_stability: clamp10(a.personal.financial_stability) ?? 5,
        reputation: clamp10(a.personal.reputation) ?? 5,
        family_bond: clamp10(a.personal.family_bond) ?? 5,
        preparation: clamp10(a.personal.preparation) ?? 5,
      };
    }
    if (a.resilience !== undefined) {
      attrUpdate.resilience = clamp10(a.resilience) ?? 5;
    }
    if (Object.keys(attrUpdate).length > 0) {
      const { error } = await supabase
        .from('battler_attributes')
        .update(attrUpdate)
        .eq('battler_id', id);
      if (error) {
        console.error('roster attribute update failed:', error);
        return NextResponse.json({ error: 'Failed to update attributes' }, { status: 500 });
      }
    }
  }

  if (body.rating !== undefined) {
    const rating = Math.max(400, Math.min(3000, Math.round(Number(body.rating) || 1200)));
    const { error } = await supabase.from('rankings').update({ rating }).eq('battler_id', id);
    if (error) {
      console.error('roster rating update failed:', error);
      return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
    }
  }

  // Return the fresh row so the editor can reconcile.
  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name, avatar_url, gender, identity, style_tags, region')
    .eq('id', id)
    .single();

  return NextResponse.json({ battler });
}
