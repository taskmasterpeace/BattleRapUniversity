// GET /api/admin/roster — every AI battler with the fields the roster editor
// manages (name, gender, identity incl. coding, style tags, attrs, rating).
// Admin only.
import { NextResponse } from 'next/server';
import { requireAdmin, createServiceClient } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const supabase = createServiceClient();

  const [{ data: battlers, error }, { data: rankings }, { data: attrs }] = await Promise.all([
    supabase
      .from('battlers')
      .select('id, stage_name, avatar_url, gender, identity, style_tags, region, is_real, is_ai')
      .eq('is_ai', true)
      .order('stage_name'),
    supabase.from('rankings').select('battler_id, rating'),
    supabase.from('battler_attributes').select('battler_id, writing, performance, personal, resilience'),
  ]);

  if (error) {
    console.error('roster list failed:', error);
    return NextResponse.json({ error: 'Failed to load roster' }, { status: 500 });
  }

  const ratingBy = new Map((rankings ?? []).map((r) => [r.battler_id, r.rating]));
  const attrBy = new Map((attrs ?? []).map((a) => [a.battler_id, a]));

  return NextResponse.json({
    battlers: (battlers ?? []).map((b) => {
      const a = attrBy.get(b.id);
      return {
        id: b.id,
        stageName: b.stage_name,
        avatarUrl: b.avatar_url,
        gender: b.gender ?? null,
        identity: b.identity ?? {},
        styleTags: Array.isArray(b.style_tags) ? b.style_tags : [],
        region: b.region ?? null,
        isReal: !!b.is_real,
        rating: ratingBy.get(b.id) ?? null,
        attributes: a
          ? { writing: a.writing, performance: a.performance, personal: a.personal, resilience: a.resilience }
          : null,
      };
    }),
  });
}
