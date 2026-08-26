'use client';

// FIRST WEEK GOALS — a new player's roadmap. Shows until they have 5 career
// battles, then retires itself. Every item links to where it happens.
import Link from 'next/link';
import Icon, { type IconName } from '@/components/ui/Icon';

type Goal = {
  icon: IconName;
  label: string;
  detail: string;
  href: string;
  done: boolean;
};

export default function FirstWeekGoals({
  totalBattles,
  wins,
  hasActiveBattle,
  hasFullPrep,
  offersCount,
  inCity,
}: {
  totalBattles: number;
  wins: number;
  hasActiveBattle: boolean;
  hasFullPrep: boolean;
  offersCount: number;
  inCity: boolean;
}) {
  if (totalBattles >= 5) return null;

  const goals: Goal[] = [
    {
      icon: 'bell',
      label: 'ACCEPT YOUR FIRST OFFER',
      detail: offersCount > 0 ? `${offersCount} waiting in your inbox` : 'Promoters are calling',
      href: '/battle/offers',
      done: hasActiveBattle || totalBattles > 0,
    },
    {
      icon: 'pen',
      label: 'PLAN A FULL PREP WEEK',
      detail: 'Every day filled = bonus battle slot',
      href: hasActiveBattle ? '/dashboard' : '/battle/offers',
      done: hasFullPrep || totalBattles > 0,
    },
    {
      icon: 'mic',
      label: 'TAKE THE STAGE',
      detail: 'Hit BATTLE TIME when you’re ready',
      href: '/dashboard',
      done: totalBattles >= 1,
    },
    {
      icon: 'trophy',
      label: 'GET YOUR FIRST W',
      detail: 'Scout them. Out-prep them. Body them.',
      href: '/dashboard',
      done: wins >= 1,
    },
    {
      icon: 'news',
      label: 'READ YOUR PRESS',
      detail: 'The blogs write about every battle',
      href: '/media',
      done: false,
    },
    {
      icon: 'pin',
      label: 'PULL UP ON YOUR CITY',
      detail: 'Meet the local scene, scope recruits',
      href: '/cities',
      done: inCity,
    },
    {
      icon: 'swords',
      label: 'RUN A DREAM MATCHUP',
      detail: 'Settle an argument, share the link',
      href: '/matchup',
      done: false,
    },
  ];

  const doneCount = goals.filter((g) => g.done).length;

  return (
    <div className="mb-8 bg-[#2d2f35] border-2 border-[#ff8c42]/40 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-display font-black uppercase tracking-tighter text-[#ff8c42] flex items-center gap-2">
          <Icon name="target" size={20} /> YOUR FIRST WEEK IN THE CIRCUIT
        </h2>
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          {doneCount}/{goals.length} DONE
        </span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {goals.map((g) => (
          <Link
            key={g.label}
            href={g.href}
            className={`flex items-start gap-3 p-3 border-2 transition-all ${
              g.done
                ? 'border-green-500/40 bg-green-500/5 opacity-70'
                : 'border-[#3a3d44] hover:border-[#ff8c42] hover:-translate-y-[1px]'
            }`}
          >
            <span className={`flex-shrink-0 ${g.done ? 'text-green-400' : 'text-[#ff8c42]'}`}>
              <Icon name={g.done ? 'check' : g.icon} size={18} />
            </span>
            <span className="min-w-0">
              <span className={`block font-display font-black uppercase tracking-wide text-xs ${g.done ? 'text-green-400 line-through' : 'text-zinc-100'}`}>
                {g.label}
              </span>
              <span className="block text-[11px] text-zinc-500 leading-snug mt-0.5">{g.detail}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
