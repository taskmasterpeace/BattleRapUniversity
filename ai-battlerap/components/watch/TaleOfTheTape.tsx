// Pre-fight tale of the tape — viewer-neutral attribute comparison, records,
// and the "SIMS AT" clock for an upcoming card. Server-renderable.
import Image from 'next/image';
import Link from 'next/link';
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

function Fighter({ side, rank, align }: { side: SpectatorSide; rank: Rank; align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col items-center ${align === 'left' ? 'md:items-start' : 'md:items-end'}`}>
      <div className="relative w-24 h-24 md:w-36 md:h-36">
        {side.avatarUrl ? (
          <Image
            src={side.avatarUrl}
            alt={side.name}
            fill
            sizes="144px"
            className="object-contain [image-rendering:pixelated]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#18191c] border-2 border-[#3a3d44] text-5xl">
            🎤
          </div>
        )}
      </div>
      <Link
        href={`/battler/${side.id}`}
        className="font-display text-lg md:text-2xl font-black uppercase tracking-tight mt-3 text-center hover:text-[#ff8c42] transition-colors"
      >
        {side.name}
      </Link>
      <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
        {side.isReal && (
          <span className="px-1.5 py-0.5 bg-[#ff8c42] text-black font-mono text-[8px] font-bold uppercase tracking-widest">
            ✓ VERIFIED
          </span>
        )}
        {side.tier && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{side.tier} TIER</span>
        )}
      </div>
      {rank && (
        <p className="font-mono text-xs text-zinc-300 mt-2">
          <span className="text-green-400">{rank.wins}W</span>
          <span className="text-zinc-600"> – </span>
          <span className="text-red-400">{rank.losses}L</span>
          <span className="text-zinc-600"> · </span>
          <span className="text-zinc-400">{rank.rating} ELO</span>
        </p>
      )}
    </div>
  );
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
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-8">
          <Fighter side={a} rank={rankA} align="left" />
          <div className="text-center">
            <p className="font-bebas text-5xl md:text-7xl text-[#ff8c42] drop-shadow-[0_0_25px_rgba(255,140,66,0.5)]">
              VS
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-[#ff8c42] text-black font-display font-black text-[10px] md:text-xs uppercase tracking-wider">
              SIMS AT {simsAt}
            </span>
          </div>
          <Fighter side={b} rank={rankB} align="right" />
        </div>

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
                    <span className={`font-mono text-xs text-right ${aBetter ? 'text-[#ff8c42] font-bold' : 'text-zinc-400'}`}>
                      {av}
                    </span>
                    <div className="h-3 bg-[#18191c] border border-[#3a3d44] flex justify-end">
                      <div
                        className={`h-full animate-bar-fill ${aBetter ? 'bg-[#ff8c42]' : 'bg-[#ff8c42]/40'}`}
                        style={{ ['--bar-w' as string]: `${(av / 10) * 100}%`, animationDelay: `${i * 90 + 150}ms` }}
                      />
                    </div>
                    <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 text-center w-24 md:w-36">
                      {row.label}
                    </span>
                    <div className="h-3 bg-[#18191c] border border-[#3a3d44]">
                      <div
                        className={`h-full animate-bar-fill ${bBetter ? 'bg-blue-400' : 'bg-blue-400/40'}`}
                        style={{ ['--bar-w' as string]: `${(bv / 10) * 100}%`, animationDelay: `${i * 90 + 150}ms` }}
                      />
                    </div>
                    <span className={`font-mono text-xs ${bBetter ? 'text-blue-400 font-bold' : 'text-zinc-400'}`}>
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
