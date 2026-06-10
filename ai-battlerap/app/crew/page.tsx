// YOUR CREW — up to 3 recruited specialists. Each member adds one extra
// prep day per battle matching their specialty. Recruiting happens in
// person, in the streets — visit a city and sign local talent.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/db/server';
import DismissCrewButton from '@/components/crew/DismissCrewButton';
import {
  MAX_CREW_SIZE,
  SPECIALTY_BONUS_LABEL,
  type CrewSpecialty,
} from '@/lib/game/crew';

type CrewRow = {
  id: string;
  specialty: CrewSpecialty;
  recruit_cost: number;
  recruited_at: string;
  recruited_in_city_id: string | null;
  member: {
    id: string;
    stage_name: string;
    tier: string | null;
    is_real: boolean;
    avatar_url: string | null;
  } | null;
};

const TIER_COLOR: Record<string, string> = {
  low: 'text-zinc-400 border-zinc-600',
  mid: 'text-blue-300 border-blue-500/50',
  top: 'text-purple-300 border-purple-500/50',
  god: 'text-[#ff8c42] border-[#ff8c42]',
};

const SPECIALTY_ICON: Record<CrewSpecialty, string> = {
  research: '🔍',
  writing: '✍️',
  performance: '🎤',
};

export default async function CrewPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const supabase = await createServerSupabaseClient();

  const { data: battler } = await supabase
    .from('battlers')
    .select('id, stage_name')
    .eq('user_id', user.id)
    .eq('is_ai', false)
    .maybeSingle();

  if (!battler) redirect('/onboarding');

  const [{ data: crewRows }, { data: cities }] = await Promise.all([
    supabase
      .from('crew_members')
      .select(
        'id, specialty, recruit_cost, recruited_at, recruited_in_city_id, member:battlers!crew_members_member_battler_id_fkey(id, stage_name, tier, is_real, avatar_url)'
      )
      .eq('owner_battler_id', battler.id)
      .order('recruited_at'),
    supabase.from('cities').select('id, name'),
  ]);

  const cityNames = new Map<string, string>(
    ((cities ?? []) as { id: string; name: string }[]).map((c) => [c.id, c.name])
  );

  const crew = ((crewRows ?? []) as unknown as CrewRow[]).filter((c) => c.member);
  const emptySlots = Math.max(0, MAX_CREW_SIZE - crew.length);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 animate-fade-in-up">
      <div className="border-b-2 border-[#3a3d44] bg-[#18191c]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-display font-black tracking-tighter mb-2">YOUR CREW</h1>
          <p className="text-zinc-400 text-sm uppercase tracking-wide">
            {crew.length}/{MAX_CREW_SIZE} slots filled — every member adds one extra prep day to
            every battle
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filled slots */}
          {crew.map((c) => {
            const m = c.member!;
            const tierClass =
              TIER_COLOR[(m.tier || '').toLowerCase()] || 'text-zinc-400 border-zinc-600';
            const recruitedIn = c.recruited_in_city_id
              ? cityNames.get(c.recruited_in_city_id)
              : null;
            return (
              <div
                key={c.id}
                className="bg-[#18191c] border-2 border-[#3a3d44] overflow-hidden flex flex-col"
              >
                <Link href={`/battler/${m.id}`} className="group block">
                  <div
                    className="aspect-[16/10] bg-[#2d2f35] bg-cover bg-center relative transition-transform duration-300 group-hover:scale-[1.02]"
                    style={m.avatar_url ? { backgroundImage: `url(${m.avatar_url})` } : undefined}
                  >
                    {!m.avatar_url && (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 text-4xl">
                        ?
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18191c] to-transparent" />
                    {m.is_real && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#ff8c42] text-black text-[9px] font-black uppercase tracking-widest">
                        ✓ Verified
                      </span>
                    )}
                    <div className="absolute bottom-2 left-3 right-3">
                      <h2 className="text-xl font-black uppercase tracking-tight drop-shadow-lg group-hover:text-[#ff8c42] transition">
                        {m.stage_name}
                      </h2>
                    </div>
                  </div>
                </Link>

                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
                    <span className={`px-2 py-0.5 border ${tierClass}`}>{m.tier || 'unranked'}</span>
                    <span className="font-mono text-zinc-500">
                      {SPECIALTY_ICON[c.specialty]} {c.specialty}
                    </span>
                  </div>

                  {/* The bonus — the reason they're on the payroll */}
                  <div className="px-3 py-2 bg-[#ff8c42]/10 border border-[#ff8c42]/40 text-[#ff8c42] text-[10px] font-black uppercase tracking-widest text-center">
                    {SPECIALTY_BONUS_LABEL[c.specialty]}
                  </div>

                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                    Signed{recruitedIn ? ` in ${recruitedIn}` : ''} · ${c.recruit_cost}
                  </p>

                  <div className="mt-auto pt-1">
                    <DismissCrewButton memberId={c.id} stageName={m.stage_name} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <Link
              key={`empty-${i}`}
              href="/cities"
              className="group border-2 border-dashed border-[#3a3d44] hover:border-[#ff8c42] bg-[#101114] transition-all duration-200 flex flex-col items-center justify-center text-center p-8 min-h-[20rem]"
            >
              <div className="w-14 h-14 mb-4 flex items-center justify-center border-2 border-dashed border-[#3a3d44] group-hover:border-[#ff8c42] text-zinc-600 group-hover:text-[#ff8c42] text-2xl transition">
                +
              </div>
              <h3 className="font-black uppercase tracking-wider text-sm text-zinc-300 group-hover:text-[#ff8c42] transition mb-2">
                Recruit in the streets
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 max-w-[14rem] leading-relaxed">
                Visit a city and recruit local talent — you have to be in town to sign them
              </p>
              <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#ff8c42] opacity-0 group-hover:opacity-100 transition">
                Browse cities →
              </span>
            </Link>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-10 bg-[#18191c] border-2 border-[#3a3d44] p-6">
          <h3 className="font-display font-black uppercase tracking-tighter text-lg mb-3">
            HOW CREW WORKS
          </h3>
          <ul className="space-y-2 text-xs uppercase tracking-wide text-zinc-400">
            <li>
              <span className="text-[#ff8c42] font-bold">In person only</span> — you must be in a
              battler&apos;s city to recruit them
            </li>
            <li>
              <span className="text-[#ff8c42] font-bold">Specialists</span> — each member
              contributes their best skill: research, writing, or performance
            </li>
            <li>
              <span className="text-[#ff8c42] font-bold">Every battle</span> — each member
              automatically adds one prep day of their specialty
            </li>
            <li>
              <span className="text-[#ff8c42] font-bold">No refunds</span> — dismissing a member
              frees the slot but the money is gone
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
