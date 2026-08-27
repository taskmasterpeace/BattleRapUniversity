// Viewer-neutral battle replay — corner A vs corner B with animated
// round-by-round score bars, haymaker/choke callouts and the verdict stamp.
// Adapted from the matchup replay patterns (animate-bar-fill / animate-stamp-in)
// but with zero "YOU" framing: this is for the crowd, not a competitor.
// Pure CSS animations → renders fine as a server component.
import Image from 'next/image';
import Link from 'next/link';

export type SpectatorSide = {
  id: string;
  name: string;
  avatarUrl: string | null;
  tier: string | null;
  isReal: boolean;
};

export type ReplayRound = {
  roundIndex: number;
  a: { avg: number; peak: number; crowd: number; choke: boolean; haymaker: boolean };
  b: { avg: number; peak: number; crowd: number; choke: boolean; haymaker: boolean };
  winner: 'a' | 'b';
};

function Corner({ side, won, align }: { side: SpectatorSide; won: boolean; align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col items-center ${align === 'left' ? 'md:items-start' : 'md:items-end'}`}>
      <div
        className={`relative w-24 h-24 md:w-36 md:h-36 ${won ? 'drop-shadow-[0_0_30px_rgba(255,140,66,0.5)]' : 'opacity-75'}`}
      >
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
      {won && (
        <span className="mt-2 px-3 py-1 bg-green-500/20 border-2 border-green-500/50 text-green-400 font-display font-black text-xs uppercase tracking-wider">
          WINNER
        </span>
      )}
    </div>
  );
}

export default function SpectatorReplay({
  a,
  b,
  rounds,
  winnerId,
  decision,
}: {
  a: SpectatorSide;
  b: SpectatorSide;
  rounds: ReplayRound[];
  winnerId: string | null;
  decision: string;
}) {
  const aWon = winnerId === a.id;
  const aRounds = rounds.filter((r) => r.winner === 'a').length;
  const bRounds = rounds.length - aRounds;
  const stampDelay = rounds.length * 1500 + 700;

  return (
    <div className="bg-[#101114] border-2 border-[#3a3d44] p-5 md:p-10">
      {/* VS header */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-8">
        <Corner side={a} won={aWon} align="left" />
        <div className="text-center">
          <p className="font-bebas text-5xl md:text-7xl text-[#ff8c42] drop-shadow-[0_0_25px_rgba(255,140,66,0.5)]">
            {aRounds}–{bRounds}
          </p>
          <div
            className="animate-stamp-in inline-block border-4 border-[#ff8c42] px-3 py-1 mt-2"
            style={{ animationDelay: `${stampDelay}ms` }}
          >
            <p className="font-display text-xs md:text-lg font-black uppercase tracking-wide text-[#ff8c42]">
              {decision}
            </p>
          </div>
        </div>
        <Corner side={b} won={!aWon && !!winnerId} align="right" />
      </div>

      {/* round-by-round */}
      <div className="mt-10 space-y-5">
        {/* legend — the solid bar is the round average, the tick is the peak (haymaker) moment */}
        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 flex items-center gap-4 -mt-3 mb-1">
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-2 bg-zinc-500/60" /> ROUND AVG</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-[2px] h-3.5 bg-white shadow-[0_0_4px_rgba(255,255,255,0.7)]" /> PEAK MOMENT</span>
        </p>
        {rounds.map((r, i) => {
          // Scale to the highest PEAK, not just the highest average, so the peak
          // ticks land on the track. The gap between a bar's end (avg) and its tick
          // (peak) is the whole point — it shows who landed a haymaker vs. who was
          // steady-but-flat, the core of the segment-based sim.
          const max = Math.max(r.a.avg, r.b.avg, r.a.peak, r.b.peak, 1) * 1.05;
          return (
            <div key={r.roundIndex} className="animate-fade-in" style={{ animationDelay: `${i * 1500}ms` }}>
              <div className="flex justify-between items-center mb-1 gap-2 flex-wrap">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  ROUND {r.roundIndex}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {(r.a.haymaker || r.b.haymaker) && (
                    <span
                      className="font-display font-black text-xs uppercase text-[#ff8c42] animate-haymaker"
                      style={{ animationDelay: `${i * 1500 + 600}ms` }}
                    >
                      💥 HAYMAKER — {r.a.haymaker ? a.name : b.name}
                    </span>
                  )}
                  {(r.a.choke || r.b.choke) && (
                    <span
                      className="font-display font-black text-xs uppercase text-red-500 animate-haymaker"
                      style={{ animationDelay: `${i * 1500 + 600}ms` }}
                    >
                      😶 CHOKE — {r.a.choke ? a.name : b.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-20 md:w-28 font-mono text-[10px] uppercase truncate text-[#ff8c42]">{a.name}</span>
                <div className="flex-1 h-4 bg-[#18191c] border border-[#3a3d44] relative">
                  <div
                    className={`h-full animate-bar-fill ${r.a.choke ? 'bg-red-500/70' : r.winner === 'a' ? 'bg-[#ff8c42]' : 'bg-[#ff8c42]/40'}`}
                    style={{
                      ['--bar-w' as string]: `${(r.a.avg / max) * 100}%`,
                      animationDelay: `${i * 1500 + 250}ms`,
                    }}
                  />
                  {r.a.peak > 0 && (
                    <span
                      className="absolute top-[-2px] bottom-[-2px] w-[2px] -ml-px bg-[#ffd0a8] shadow-[0_0_5px_rgba(255,140,66,0.9)] animate-fade-in"
                      style={{ left: `${(r.a.peak / max) * 100}%`, animationDelay: `${i * 1500 + 700}ms` }}
                      title={`Peak ${r.a.peak.toFixed(1)}`}
                    />
                  )}
                </div>
                <span className="w-10 font-mono text-xs text-zinc-300 text-right">{r.a.avg.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 md:w-28 font-mono text-[10px] uppercase truncate text-zinc-300">{b.name}</span>
                <div className="flex-1 h-4 bg-[#18191c] border border-[#3a3d44] relative">
                  <div
                    className={`h-full animate-bar-fill ${r.b.choke ? 'bg-red-500/70' : r.winner === 'b' ? 'bg-zinc-300' : 'bg-zinc-300/40'}`}
                    style={{
                      ['--bar-w' as string]: `${(r.b.avg / max) * 100}%`,
                      animationDelay: `${i * 1500 + 250}ms`,
                    }}
                  />
                  {r.b.peak > 0 && (
                    <span
                      className="absolute top-[-2px] bottom-[-2px] w-[2px] -ml-px bg-white shadow-[0_0_5px_rgba(255,255,255,0.85)] animate-fade-in"
                      style={{ left: `${(r.b.peak / max) * 100}%`, animationDelay: `${i * 1500 + 700}ms` }}
                      title={`Peak ${r.b.peak.toFixed(1)}`}
                    />
                  )}
                </div>
                <span className="w-10 font-mono text-xs text-zinc-300 text-right">{r.b.avg.toFixed(1)}</span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mt-1">
                CROWD {r.a.crowd}% / {r.b.crowd}% · PEAKS {r.a.peak.toFixed(1)} / {r.b.peak.toFixed(1)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
