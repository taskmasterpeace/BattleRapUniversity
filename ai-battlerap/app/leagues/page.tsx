import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/db/server';

type League = {
  id: string;
  name: string;
  short_code: string;
  round_length_minutes: number;
  base_crowd_factor: number;
  writing_weight: number;
  performance_weight: number;
  booking_pace_days: number;
  description: string | null;
  prestige_level: number | null;
  base_payout: number | null;
  logo_url: string | null;
  city_id: string | null;
};

// The ladder: where a league sits in the culture's hierarchy. Physical leagues
// are grouped by prestige; virtual (no city) leagues are the online rung below.
const TIERS = [
  { min: 8, label: 'THE MAIN STAGES', sub: 'National and premier — where legacies are cemented' },
  { min: 5, label: 'THE REGIONAL CIRCUIT', sub: 'Real rooms, real stakes — the proving grounds' },
  { min: 0, label: 'THE UNDERGROUND', sub: 'Where unknowns make names' },
];

export default async function LeaguesIndexPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const supabase = await createServerSupabaseClient();

  const { data: leagues, error } = await supabase
    .from('leagues')
    .select(
      'id, name, short_code, round_length_minutes, base_crowd_factor, writing_weight, performance_weight, booking_pace_days, description, prestige_level, base_payout, logo_url, city_id'
    )
    .order('prestige_level', { ascending: false })
    .order('name');

  if (error) {
    console.error('[leagues] fetch error:', error);
  }

  const list: League[] = leagues ?? [];
  const physical = list.filter((l) => l.city_id);
  const online = list.filter((l) => !l.city_id);
  const grouped = [
    ...TIERS.map((tier, i) => ({
      ...tier,
      leagues: physical.filter((l) => {
        const p = l.prestige_level ?? 0;
        const upper = i === 0 ? Infinity : TIERS[i - 1].min;
        return p >= tier.min && p < upper;
      }),
    })),
    {
      min: -1,
      label: 'ONLINE / THE FORUMS',
      sub: 'Text and app battles — where every unknown starts',
      leagues: online,
    },
  ].filter((g) => g.leagues.length > 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 animate-fade-in-up">
      <div className="border-b-2 border-[#3a3d44] bg-[#18191c]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/dashboard"
            className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm uppercase tracking-wider font-bold mb-4 inline-block"
          >
            ← DASHBOARD
          </Link>
          <h1 className="text-4xl font-display font-black tracking-tighter mb-2 text-zinc-100">
            LEAGUES
          </h1>
          <p className="text-zinc-400 text-sm uppercase tracking-wide">
            {list.length} active leagues — climb from underground rooms to global main stages
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {list.length === 0 ? (
          <div className="bg-[#18191c] border-2 border-[#3a3d44] p-10 text-center">
            <p className="text-zinc-400 uppercase tracking-wider font-bold">
              No leagues seeded yet. Run <code className="text-[#ff8c42]">npm run supabase:reset</code>.
            </p>
          </div>
        ) : (
          grouped.map((tier) => (
            <section key={tier.label}>
              <div className="mb-5 flex items-baseline gap-4">
                <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42]">
                  {tier.label}
                </h2>
                <span className="text-xs text-zinc-500 font-display font-bold uppercase tracking-wider">
                  {tier.sub}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tier.leagues.map((l) => (
                  <Link
                    key={l.id}
                    href={`/leagues/${l.id}`}
                    className="group bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42] hover:-translate-y-[2px] hover:shadow-[0_14px_36px_-18px_rgba(255,140,66,0.6)] p-6 transition-all duration-200 block"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      {l.logo_url && (
                        <Image
                          src={l.logo_url}
                          alt={`${l.name} logo`}
                          width={56}
                          height={56}
                          className="border-2 border-[#3a3d44] bg-[#101114] [image-rendering:pixelated] flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-mono uppercase tracking-wider text-[#ff8c42]">
                            {l.short_code}
                          </span>
                          <span className="text-xs text-zinc-500 uppercase whitespace-nowrap">
                            {l.round_length_minutes}-min rounds
                          </span>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-zinc-100 group-hover:text-[#ff8c42] transition-colors">
                          {l.name}
                        </h3>
                      </div>
                    </div>
                    {l.description && (
                      <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                        {l.description}
                      </p>
                    )}
                    <div className="grid grid-cols-4 gap-3 text-xs uppercase tracking-wide">
                      <div className="min-w-0">
                        <div className="text-zinc-500 truncate">Writing</div>
                        <div className="text-zinc-200 font-bold">
                          {Math.round(Number(l.writing_weight) * 100)}%
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-zinc-500 truncate">Perform</div>
                        <div className="text-zinc-200 font-bold">
                          {Math.round(Number(l.performance_weight) * 100)}%
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-zinc-500 truncate">Crowd</div>
                        <div className="text-zinc-200 font-bold">
                          {Math.round(Number(l.base_crowd_factor) * 100)}%
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-zinc-500 truncate">Purse</div>
                        <div className="text-[#ff8c42] font-bold">
                          {l.base_payout ? `$${Number(l.base_payout).toLocaleString()}` : '—'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
