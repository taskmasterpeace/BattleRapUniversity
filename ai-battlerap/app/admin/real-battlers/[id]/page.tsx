// /admin/real-battlers/[id] — edit a real battler: profile fields, accolades,
// and claim-code generation.
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { requireAdmin, createServiceClient } from '@/lib/auth/roles';
import RealBattlerEditor from '@/components/admin/RealBattlerEditor';

export const dynamic = 'force-dynamic';

export default async function RealBattlerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');

  const { id } = await params;
  const supabase = createServiceClient();

  const [{ data: battler }, { data: attributes }, { data: ranking }, { data: accolades }, { data: codes }, { data: cities }] =
    await Promise.all([
      supabase
        .from('battlers')
        .select(
          'id, stage_name, real_name, bio, tier, likeness_status, avatar_url, style_tags, hometown_city_id, verified_user_id, region'
        )
        .eq('id', id)
        .eq('is_real', true)
        .maybeSingle(),
      supabase.from('battler_attributes').select('writing, performance, resilience').eq('battler_id', id).maybeSingle(),
      supabase.from('rankings').select('rating, wins, losses').eq('battler_id', id).maybeSingle(),
      supabase
        .from('battler_accolades')
        .select('id, rank, title, scope, region, year, source')
        .eq('battler_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('claim_codes')
        .select('id, code, created_at, claimed_by, claimed_at')
        .eq('battler_id', id)
        .order('created_at', { ascending: false }),
      supabase.from('cities').select('id, name, state').order('name'),
    ]);

  if (!battler) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in-up space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/admin/real-battlers"
            className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-[#ff8c42] transition-colors"
          >
            ← Real Battlers
          </Link>
          <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-zinc-100 mt-2">
            EDIT <span className="text-[#ff8c42]">{battler.stage_name}</span>
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mt-1">
            {ranking ? `${ranking.rating} rating · ${ranking.wins}W-${ranking.losses}L` : 'No ranking row'} ·{' '}
            {battler.verified_user_id ? 'CLAIMED' : 'UNCLAIMED'}
          </p>
        </div>
      </div>

      <RealBattlerEditor
        battler={battler}
        attributes={attributes}
        rating={ranking?.rating ?? 1200}
        accolades={accolades ?? []}
        claimCodes={codes ?? []}
        cities={cities ?? []}
      />
    </div>
  );
}
