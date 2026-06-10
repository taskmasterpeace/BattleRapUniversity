// POST /api/admin/real-battlers — create a real (verified-likeness) battler.
// Admin only. Creates battlers + battler_attributes + rankings atomically
// (manual rollback on partial failure, same pattern as battler/create).
import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/auth/roles';
import {
  parseRealBattlerPayload,
  buildAttributeRows,
} from '@/lib/admin/realBattlerPayload';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = parseRealBattlerPayload(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const p = parsed.payload;

  const supabase = createServiceClient();

  // Resolve city name → region text for display consistency.
  let region: string | null = null;
  if (p.hometown_city_id) {
    const { data: city } = await supabase
      .from('cities')
      .select('name')
      .eq('id', p.hometown_city_id)
      .maybeSingle();
    region = city?.name ?? null;
  }

  const { data: battler, error: battlerError } = await supabase
    .from('battlers')
    .insert({
      stage_name: p.stage_name,
      real_name: p.real_name,
      bio: p.bio,
      region,
      tier: p.tier,
      is_ai: true, // real battlers are AI-driven in the sim until claimed/managed
      is_real: true,
      likeness_status: p.likeness_status,
      hometown_city_id: p.hometown_city_id,
      current_city_id: p.hometown_city_id,
      avatar_url: p.avatar_url,
      style_tags: p.style_tags,
    })
    .select()
    .single();

  if (battlerError || !battler) {
    console.error('real-battler create failed:', battlerError);
    return NextResponse.json({ error: 'Failed to create battler' }, { status: 500 });
  }

  const { error: attrError } = await supabase
    .from('battler_attributes')
    .insert(buildAttributeRows(battler.id, p.attributes));

  if (attrError) {
    console.error('real-battler attributes failed:', attrError);
    await supabase.from('battlers').delete().eq('id', battler.id);
    return NextResponse.json({ error: 'Failed to create attributes' }, { status: 500 });
  }

  const { error: rankError } = await supabase.from('rankings').insert({
    battler_id: battler.id,
    rating: p.rating,
    wins: 0,
    losses: 0,
    streak: 0,
  });

  if (rankError) {
    console.error('real-battler ranking failed:', rankError);
    await supabase.from('battler_attributes').delete().eq('battler_id', battler.id);
    await supabase.from('battlers').delete().eq('id', battler.id);
    return NextResponse.json({ error: 'Failed to create ranking' }, { status: 500 });
  }

  return NextResponse.json({ battler });
}
