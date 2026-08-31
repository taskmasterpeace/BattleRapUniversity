'use client';

// TONIGHT'S CARD hub — fight-card layout for the living world.
// Upcoming VS cards + JUST HAPPENED verdict strip, league filter on top.
import { useMemo, useState } from 'react';
import Icon from '@/components/ui/Icon';
import Image from 'next/image';
import Link from 'next/link';
import { BattleFlyer } from '@/components/battle/BattleFlyer';

export type CardSide = {
  id: string;
  name: string;
  avatarUrl: string | null;
  tier: string | null;
  isReal: boolean;
};

export type UpcomingCard = {
  id: string;
  leagueId: string;
  leagueName: string;
  scheduledAt: string;
  timeLabel: string;
  isWorld: boolean;
  a: CardSide;
  b: CardSide;
};

export type CompletedCard = {
  id: string;
  leagueId: string;
  leagueName: string;
  verdict: string | null;
  agoLabel: string;
  winnerId: string | null;
  a: CardSide;
  b: CardSide;
};

function Avatar({ side, size }: { side: CardSide; size: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {side.avatarUrl ? (
        <Image
          src={side.avatarUrl}
          alt={side.name}
          fill
          sizes={`${size}px`}
          className="object-contain [image-rendering:pixelated]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#18191c] border-2 border-[#3a3d44] text-2xl">
          🎤
        </div>
      )}
    </div>
  );
}

function FighterBlock({ side, align }: { side: CardSide; align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 min-w-0 ${align === 'left' ? 'sm:items-start' : 'sm:items-end'}`}>
      <Avatar side={side} size={72} />
      <Link
        href={`/battler/${side.id}`}
        className={`font-display font-black uppercase tracking-tight text-sm md:text-base leading-tight hover:text-[#ff8c42] transition-colors max-w-full truncate text-center ${align === 'left' ? 'sm:text-left' : 'sm:text-right'}`}
      >
        {side.name}
      </Link>
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {side.isReal && (
          <span className="px-1.5 py-0.5 bg-[#ff8c42] text-black font-mono text-[8px] font-bold uppercase tracking-widest">
            ✓ VERIFIED
          </span>
        )}
        {side.tier && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{side.tier} TIER</span>
        )}
      </div>
    </div>
  );
}

function timeChipStyle(label: string) {
  if (label === 'TONIGHT' || label === 'DOORS OPEN' || label === 'STARTING SOON') {
    return 'bg-[#ff8c42] text-black';
  }
  if (label === 'TOMORROW') return 'bg-[#18191c] border border-[#ff8c42]/60 text-[#ff8c42]';
  return 'bg-[#18191c] border border-[#3a3d44] text-zinc-400';
}

function verdictChip(verdict: string | null) {
  if (verdict === '3-0') {
    return (
      <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/60 text-red-400 font-display font-black text-[10px] uppercase tracking-wider whitespace-nowrap">
        3-0 BODYBAG
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 bg-[#ff8c42]/15 border border-[#ff8c42]/50 text-[#ff8c42] font-display font-black text-[10px] uppercase tracking-wider whitespace-nowrap">
      2-1 DEBATABLE
    </span>
  );
}

export default function WatchHub({
  upcoming,
  completed,
  leagues,
}: {
  upcoming: UpcomingCard[];
  completed: CompletedCard[];
  leagues: { id: string; name: string }[];
}) {
  const [filter, setFilter] = useState<string>('all');

  const shownUpcoming = useMemo(
    () => (filter === 'all' ? upcoming : upcoming.filter((c) => c.leagueId === filter)),
    [filter, upcoming]
  );
  const shownCompleted = useMemo(
    () => (filter === 'all' ? completed : completed.filter((c) => c.leagueId === filter)),
    [filter, completed]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      {/* ── Header ── */}
      <header className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#ff8c42] mb-2">
          LIVE FROM THE UNIVERCITY
        </p>
        <h1 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
          TONIGHT&apos;S CARD
        </h1>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mt-3">
          — THE WORLD DON&apos;T STOP —
        </p>
      </header>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-2 mb-10">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-display font-black text-xs uppercase tracking-wider border-2 transition-colors ${
            filter === 'all'
              ? 'bg-[#ff8c42] border-[#ff8c42] text-black'
              : 'bg-[#101114] border-[#3a3d44] text-zinc-300 hover:border-[#ff8c42]'
          }`}
        >
          ALL
        </button>
        <select
          value={filter === 'all' ? '' : filter}
          onChange={(e) => setFilter(e.target.value || 'all')}
          className="px-3 py-2 bg-[#101114] border-2 border-[#3a3d44] text-zinc-300 font-mono text-xs uppercase tracking-wider focus:border-[#ff8c42] focus:outline-none"
          aria-label="Filter by league"
        >
          <option value="">SELECT LEAGUE…</option>
          {leagues.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* ── UPCOMING ── */}
      <section className="mb-14">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-xl md:text-2xl font-black uppercase tracking-tight">
            UPCOMING <span className="text-[#ff8c42]">/ NEXT 48H</span>
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            {shownUpcoming.length} BOOKED
          </span>
        </div>

        {shownUpcoming.length === 0 ? (
          <div className="bg-[#101114] border-2 border-[#3a3d44] p-10 text-center">
            <p className="font-display font-black uppercase text-zinc-500">NO CARDS ON THE BOOKS</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 mt-2">
              THE MATCHMAKERS ARE WORKING — CHECK BACK SOON
            </p>
          </div>
        ) : (
          <>
            {/* Headliner — the top booked bout gets the full event-poster flyer */}
            {(() => {
              const head = shownUpcoming[0];
              const under = shownUpcoming.slice(1, 4);
              return (
                <Link href={`/watch/${head.id}`} className="block mb-6 hover:opacity-95 transition-opacity">
                  <BattleFlyer
                    eventTitle={head.timeLabel === 'TONIGHT' ? "TONIGHT'S HEADLINER" : 'THE HEADLINER'}
                    leagueLine={`${head.leagueName.toUpperCase()} · ${head.timeLabel}`}
                    a={{ name: head.a.name, portrait: head.a.avatarUrl ?? undefined }}
                    b={{ name: head.b.name, portrait: head.b.avatarUrl ?? undefined }}
                    undercard={under.map((u) => ({
                      a: u.a.name,
                      b: u.b.name,
                      aPortrait: u.a.avatarUrl ?? undefined,
                      bPortrait: u.b.avatarUrl ?? undefined,
                    }))}
                    footerLine="▸ TALE OF THE TAPE"
                  />
                </Link>
              );
            })()}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shownUpcoming.slice(1).map((card) => (
              <div key={card.id} className="bg-[#101114] border-2 border-[#3a3d44] hover:border-[#ff8c42]/60 transition-colors">
                <div className="flex items-center justify-between px-4 pt-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500 truncate">
                    {card.leagueName}
                  </span>
                  <span className={`px-2 py-0.5 font-display font-black text-[10px] uppercase tracking-wider ${timeChipStyle(card.timeLabel)}`}>
                    {card.timeLabel}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-4">
                  <FighterBlock side={card.a} align="left" />
                  <span className="font-bebas text-3xl md:text-4xl text-[#ff8c42] px-1">VS</span>
                  <FighterBlock side={card.b} align="right" />
                </div>
                <div className="border-t-2 border-[#3a3d44]">
                  <Link
                    href={`/watch/${card.id}`}
                    className="block w-full text-center py-2.5 font-display font-black text-xs uppercase tracking-[0.25em] text-[#ff8c42] hover:bg-[#ff8c42] hover:text-black transition-colors"
                  >
                    ▸ TALE OF THE TAPE
                  </Link>
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </section>

      {/* ── JUST HAPPENED ── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-xl md:text-2xl font-black uppercase tracking-tight">
            JUST HAPPENED <span className="text-[#ff8c42]">/ FRESH VERDICTS</span>
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            {shownCompleted.length} RESULTS
          </span>
        </div>

        {shownCompleted.length === 0 ? (
          <div className="bg-[#101114] border-2 border-[#3a3d44] p-10 text-center">
            <p className="font-display font-black uppercase text-zinc-500">NOTHING IN THE BOOKS YET</p>
          </div>
        ) : (
          <div className="space-y-2">
            {shownCompleted.map((card) => {
              const aWon = card.winnerId === card.a.id;
              return (
                <Link
                  key={card.id}
                  href={`/watch/${card.id}`}
                  className="flex items-center gap-3 bg-[#101114] border-2 border-[#3a3d44] hover:border-[#ff8c42]/60 px-3 md:px-4 py-3 transition-colors"
                >
                  <Avatar side={card.a} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-black uppercase text-xs md:text-sm leading-tight truncate">
                      <span className={aWon ? 'text-[#ff8c42]' : 'text-zinc-300'}>{card.a.name}</span>
                      {card.a.isReal && <span className="ml-1 text-[8px] align-middle text-[#ff8c42]">✓</span>}
                      <span className="text-zinc-600 mx-1.5">DEF{aWon ? '.' : "'D BY"}</span>
                      <span className={!aWon ? 'text-[#ff8c42]' : 'text-zinc-300'}>{card.b.name}</span>
                      {card.b.isReal && <span className="ml-1 text-[8px] align-middle text-[#ff8c42]">✓</span>}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mt-0.5 truncate">
                      {card.leagueName} · {card.agoLabel}
                    </p>
                  </div>
                  {verdictChip(card.verdict)}
                  <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                    WATCH ▸
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 mt-14">
        EVERY BATTLE SIMULATED ON THE BATTLE RAP UNIVERSITY ENGINE —{' '}
        <Link href="/login" className="text-[#ff8c42] hover:underline">
          STEP IN THE RING YOURSELF
        </Link>
      </p>
    </div>
  );
}
