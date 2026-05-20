import Link from 'next/link';
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
};

export default async function LeaguesIndexPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const supabase = await createServerSupabaseClient();

  const { data: leagues, error } = await supabase
    .from('leagues')
    .select(
      'id, name, short_code, round_length_minutes, base_crowd_factor, writing_weight, performance_weight, booking_pace_days, description'
    )
    .order('name');

  if (error) {
    console.error('[leagues] fetch error:', error);
  }

  const list: League[] = leagues ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
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
            {list.length} active leagues — from underground rooms to global main stages
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {list.length === 0 ? (
          <div className="bg-[#18191c] border-2 border-[#3a3d44] p-10 text-center">
            <p className="text-zinc-400 uppercase tracking-wider font-bold">
              No leagues seeded yet. Run <code className="text-[#ff8c42]">npm run supabase:reset</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((l) => (
              <Link
                key={l.id}
                href={`/leagues/${l.id}/thrones`}
                className="group bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42] p-6 transition-colors block"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#ff8c42]">
                    {l.short_code}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase">
                    {l.round_length_minutes}-min rounds
                  </span>
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight mb-3 text-zinc-100 group-hover:text-[#ff8c42] transition-colors">
                  {l.name}
                </h2>
                {l.description && (
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                    {l.description}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 text-xs uppercase tracking-wide">
                  <div>
                    <div className="text-zinc-500">Writing</div>
                    <div className="text-zinc-200 font-bold">
                      {Math.round(Number(l.writing_weight) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500">Performance</div>
                    <div className="text-zinc-200 font-bold">
                      {Math.round(Number(l.performance_weight) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500">Crowd</div>
                    <div className="text-zinc-200 font-bold">
                      {Math.round(Number(l.base_crowd_factor) * 100)}%
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
