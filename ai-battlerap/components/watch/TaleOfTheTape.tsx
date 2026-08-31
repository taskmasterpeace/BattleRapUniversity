// Pre-fight tale of the tape — viewer-neutral attribute comparison, records,
// and the "SIMS AT" clock for an upcoming card. Server-renderable.
import Link from 'next/link';
import MatchupMasthead from '@/components/battle/MatchupMasthead';
import type { SpectatorSide } from './SpectatorReplay';

type Attrs = {
  writing: Record<string, number>;
  performance: Record<string, number>;
  resilience: number;
} | null;

type Rank = { rating: number; wins: number; losses: number; streak: number } | null;

const TAPE_ROWS: Array<{ label: string; pick: (a: Attrs) => number }> = [
  { label: 'LYRICISM', pick: (a) => a?.writing?.lyricism ?? 0 },
  { label: 'WORDPLAY', pick: (a) => a?.writing?.wordplay ?? 0 },
  { label: 'CREATIVITY', pick: (a) => a?.writing?.creativity ?? 0 },
  { label: 'FLOW', pick: (a) => a?.writing?.flow ?? 0 },
  { label: 'STAGE PRESENCE', pick: (a) => a?.performance?.stage_presence ?? 0 },
  { label: 'CROWD CONTROL', pick: (a) => a?.performance?.crowd_control ?? 0 },
  { label: 'DELIVERY', pick: (a) => a?.performance?.delivery ?? 0 },
  { label: 'RESILIENCE', pick: (a) => a?.resilience ?? 0 },
];

function recordLine(rank: Rank): string | undefined {
  if (!rank) return undefined;
  return `${rank.wins}W – ${rank.losses}L · ${rank.rating} ELO`;
}

export default function TaleOfTheTape({
  a,
  b,
  attrsA,
  attrsB,
  rankA,
  rankB,
  leagueName,
  scheduledAt,
}: {
  a: SpectatorSide;
  b: SpectatorSide;
  attrsA: Attrs;
  attrsB: Attrs;
  rankA: Rank;
  rankB: Rank;
  leagueName: string;
  scheduledAt: string;
}) {
  const simsAt = new Date(scheduledAt)
    .toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
      <div className="text-center mb-8">
        <Link
          href="/watch"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff8c42] hover:text-[#ff9d5c]"
        >
          ← TONIGHT&apos;S CARD
        </Link>
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500 mt-4">{leagueName}</p>
      </div>

      <div className="bg-[#101114] border-2 border-[#3a3d44] p-5 md:p-10">
        <MatchupMasthead
          a={{ id: a.id, name: a.name, portrait: a.avatarUrl, tier: a.tier, isReal: a.isReal, record: recordLine(rankA) }}
          b={{ id: b.id, name: b.name, portrait: b.avatarUrl, tier: b.tier, isReal: b.isReal, record: recordLine(rankB) }}
          subLine={`SIMS AT ${simsAt}`}
        />

        {/* tale of the tape */}
        <div className="mt-10">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500 mb-5">
            — TALE OF THE TAPE —
          </p>
          <div className="space-y-3">
            {TAPE_ROWS.map((row, i) => {
              const av = row.pick(attrsA);
              const bv = row.pick(attrsB);
              const aBetter = av > bv;
              const bBetter = bv > av;
              return (
                <div key={row.label} className="animate-fade-in" style={{ animationDelay: `${i * 90}ms` }}>
                  <div className="grid grid-cols-[2.5rem_1fr_auto_1fr_2.5rem] items-center gap-2">
                    <span className={`font-mono text-xs text-right ${aBetter ? 'text-[#ff6a5e] font-bold' : 'text-zinc-400'}`}>
                      {av}
                    </span>
                    <div className="h-3 bg-[#18191c] border border-[#3a3d44] flex justify-end">
                      <div
                        className={`h-full animate-bar-fill ${aBetter ? 'bg-[#E23A2E]' : 'bg-[#E23A2E]/40'}`}
                        style={{ ['--bar-w' as string]: `${(av / 10) * 100}%`, animationDelay: `${i * 90 + 150}ms` }}
                      />
                    </div>
                    <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 text-center w-24 md:w-36">
                      {row.label}
                    </span>
                    <div className="h-3 bg-[#18191c] border border-[#3a3d44]">
                      <div
                        className={`h-full animate-bar-fill ${bBetter ? 'bg-[#2F7DD1]' : 'bg-[#2F7DD1]/40'}`}
                        style={{ ['--bar-w' as string]: `${(bv / 10) * 100}%`, animationDelay: `${i * 90 + 150}ms` }}
                      />
                    </div>
                    <span className={`font-mono text-xs ${bBetter ? 'text-[#5da2e8] font-bold' : 'text-zinc-400'}`}>
                      {bv}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 mt-10">
        THE VERDICT DROPS WHEN THE CLOCK HITS —{' '}
        <Link href="/watch" className="text-[#ff8c42] hover:underline">
          BACK TO THE CARD
        </Link>
      </p>
    </div>
  );
}
