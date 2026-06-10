// Dream Matchup picker — public. Pick any two battlers (real or AI), choose
// the ground, run the actual simulation engine, get a shareable verdict.
import { createClient } from '@supabase/supabase-js';
import MatchupPicker from '@/components/matchup/MatchupPicker';

export const metadata = {
  title: 'Dream Matchup Simulator | Battle Rap University',
  description:
    'Pick any two battlers, run the simulation, settle the argument. Powered by the Battle Rap University engine.',
};

export const dynamic = 'force-dynamic';

export default async function MatchupPage() {
  // Public page — service role for read-only roster + league lists.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [{ data: battlers }, { data: leagues }] = await Promise.all([
    supabase
      .from('battlers')
      .select('id, stage_name, avatar_url, tier, is_real, region')
      .not('stage_name', 'like', 'Test_%')
      .order('is_real', { ascending: false })
      .order('stage_name'),
    supabase
      .from('leagues')
      .select('id, name, short_code, writing_weight, performance_weight')
      .order('name'),
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="border-b-2 border-[#3a3d44] bg-[#0e0f12]">
        <div className="max-w-5xl mx-auto px-6 py-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#ff8c42] mb-3">
            ─── SETTLE THE ARGUMENT ───
          </p>
          <h1 className="font-bebas text-5xl md:text-7xl uppercase text-white leading-none">
            DREAM <span className="text-[#ff8c42]">MATCHUP</span>
          </h1>
          <p className="text-zinc-400 mt-3 max-w-xl mx-auto text-sm md:text-base">
            Pick two battlers. Pick the room. Our engine runs the battle —
            rounds, haymakers, chokes and all — and gives you a link to argue over.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        <MatchupPicker battlers={battlers ?? []} leagues={leagues ?? []} />
      </div>
    </div>
  );
}
