// /admin/real-battlers — list every real (verified-likeness) battler + create form.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin, createServiceClient } from '@/lib/auth/roles';
import AddRealBattlerForm from '@/components/admin/AddRealBattlerForm';

export const dynamic = 'force-dynamic';

const LIKENESS_STYLES: Record<string, string> = {
  licensed: 'bg-green-500/15 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  unofficial: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

export default async function RealBattlersPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');

  const supabase = createServiceClient();

  const [{ data: battlers }, { data: cities }, { data: rankings }] = await Promise.all([
    supabase
      .from('battlers')
      .select('id, stage_name, real_name, tier, likeness_status, verified_user_id, avatar_url, region, created_at')
      .eq('is_real', true)
      .order('created_at', { ascending: false }),
    supabase.from('cities').select('id, name, state').order('name'),
    supabase.from('rankings').select('battler_id, rating'),
  ]);

  const ratingByBattler = new Map((rankings ?? []).map((r) => [r.battler_id, r.rating]));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-2">
          REAL <span className="text-[#ff8c42]">BATTLERS</span>
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Licensed likenesses living in the game — {(battlers ?? []).length} on the roster
        </p>
      </div>

      <AddRealBattlerForm cities={cities ?? []} />

      <div className="space-y-3">
        {(battlers ?? []).length === 0 && (
          <div className="bg-[#18191c] border-2 border-[#3a3d44] p-10 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              No real battlers yet — add the first one above.
            </p>
          </div>
        )}

        {(battlers ?? []).map((b) => (
          <Link
            key={b.id}
            href={`/admin/real-battlers/${b.id}`}
            className="group flex items-center gap-5 bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42] p-4 transition-all duration-200"
          >
            <div className="w-14 h-14 bg-[#0a0a0a] border-2 border-[#3a3d44] flex items-center justify-center overflow-hidden shrink-0">
              {b.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.avatar_url} alt={b.stage_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-zinc-600 text-xl">🎤</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display font-black uppercase tracking-tighter text-lg text-zinc-100 group-hover:text-[#ff8c42] transition-colors truncate">
                {b.stage_name}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {b.region ?? 'No city'} · Tier {b.tier} · {ratingByBattler.get(b.id) ?? '—'} rating
              </div>
            </div>
            <span
              className={`px-2 py-1 border font-mono text-[10px] uppercase tracking-widest ${
                LIKENESS_STYLES[b.likeness_status ?? 'unofficial'] ?? LIKENESS_STYLES.unofficial
              }`}
            >
              {b.likeness_status ?? 'unofficial'}
            </span>
            <span
              className={`px-2 py-1 border font-mono text-[10px] uppercase tracking-widest ${
                b.verified_user_id
                  ? 'bg-[#ff8c42]/15 text-[#ff8c42] border-[#ff8c42]/40'
                  : 'bg-zinc-500/10 text-zinc-500 border-zinc-600/30'
              }`}
            >
              {b.verified_user_id ? 'Claimed' : 'Unclaimed'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
