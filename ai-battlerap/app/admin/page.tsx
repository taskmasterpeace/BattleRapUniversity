// /admin — staff dashboard: headline counts + quick links to the tools.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin, createServiceClient } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/dashboard');

  const supabase = createServiceClient();

  const [
    { count: playerCount },
    { count: realBattlerCount },
    { count: pendingClaimCount },
    { count: battleCount },
    { count: claimedCount },
  ] = await Promise.all([
    supabase.from('battlers').select('*', { count: 'exact', head: true }).eq('is_ai', false),
    supabase.from('battlers').select('*', { count: 'exact', head: true }).eq('is_real', true),
    supabase.from('claim_codes').select('*', { count: 'exact', head: true }).is('claimed_by', null),
    supabase.from('battles').select('*', { count: 'exact', head: true }),
    supabase
      .from('battlers')
      .select('*', { count: 'exact', head: true })
      .eq('is_real', true)
      .not('verified_user_id', 'is', null),
  ]);

  const stats = [
    { label: 'Players', value: playerCount ?? 0, sub: 'created battlers' },
    { label: 'Real Battlers', value: realBattlerCount ?? 0, sub: `${claimedCount ?? 0} claimed` },
    { label: 'Pending Claims', value: pendingClaimCount ?? 0, sub: 'unclaimed codes' },
    { label: 'Total Battles', value: battleCount ?? 0, sub: 'all statuses' },
  ];

  const tools = [
    {
      href: '/admin/real-battlers',
      title: 'REAL BATTLERS',
      desc: 'Add licensed likenesses, manage accolades, generate claim codes.',
    },
    {
      href: '/admin/roles',
      title: 'ROLES',
      desc: 'Grant or revoke admin, verified battler, and league operator roles.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-2">
          ADMIN <span className="text-[#ff8c42]">OVERVIEW</span>
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Signed in as {admin.email}
        </p>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#18191c] border-2 border-[#3a3d44] p-5">
            <div className="font-mono text-[12px] uppercase tracking-widest text-zinc-500 mb-2">
              {s.label}
            </div>
            <div className="text-4xl font-display font-black text-[#ff8c42] leading-none">
              {s.value}
            </div>
            <div className="font-mono text-[12px] uppercase tracking-widest text-zinc-600 mt-2">
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="font-display font-black uppercase tracking-tighter text-xl text-zinc-100 mb-4">
        TOOLS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42] p-6 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_36px_-18px_rgba(255,140,66,0.6)]"
          >
            <div className="font-display font-black uppercase tracking-tighter text-lg text-zinc-100 group-hover:text-[#ff8c42] transition-colors mb-1">
              {t.title}
            </div>
            <p className="text-sm text-zinc-400">{t.desc}</p>
            <div className="font-mono text-[12px] uppercase tracking-widest text-zinc-600 mt-4 group-hover:text-[#ff8c42] transition-colors">
              Open →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
