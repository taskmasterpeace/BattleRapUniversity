'use client';

// Animated matchup replay: VS header, round-by-round score bars with
// haymaker/choke callouts, verdict stamp, share actions, run-it-back.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

type Side = { id: string; stageName: string; avatarUrl: string | null; tier: string | null; isReal: boolean };
type Round = {
  roundIndex: number;
  a: { avg: number; peak: number; crowd: number; events: string[] };
  b: { avg: number; peak: number; crowd: number; events: string[] };
  winner: 'a' | 'b';
};
type Payload = {
  rounds: Round[];
  decision: string;
  league: { name: string; writingWeight: number; performanceWeight: number };
  battlerA: Side;
  battlerB: Side;
};

function Corner({ side, won, align }: { side: Side; won: boolean; align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col items-center ${align === 'left' ? 'md:items-start' : 'md:items-end'}`}>
      <div className={`relative w-28 h-28 md:w-36 md:h-36 ${won ? 'drop-shadow-[0_0_30px_rgba(255,140,66,0.5)]' : 'opacity-75'}`}>
        {side.avatarUrl ? (
          <Image src={side.avatarUrl} alt={side.stageName} fill sizes="144px" className="object-contain [image-rendering:pixelated]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#18191c] border-2 border-[#3a3d44] text-5xl">🎤</div>
        )}
      </div>
      <p className="font-display text-xl md:text-2xl font-black uppercase tracking-tight mt-3 text-center">
        {side.stageName}
      </p>
      <div className="flex items-center gap-2 mt-1">
        {side.isReal && (
          <span className="px-1.5 py-0.5 bg-[#ff8c42] text-black font-mono text-[8px] font-bold uppercase tracking-widest">✓ VERIFIED</span>
        )}
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{side.tier} TIER</span>
      </div>
      {won && (
        <span className="mt-2 px-3 py-1 bg-green-500/20 border-2 border-green-500/50 text-green-400 font-display font-black text-xs uppercase tracking-wider">
          WINNER
        </span>
      )}
    </div>
  );
}

export default function MatchupResult({
  slug,
  verdict,
  headline,
  winnerId,
  payload,
  battlerAId,
  battlerBId,
}: {
  slug: string;
  verdict: string;
  headline: string | null;
  winnerId: string | null;
  payload: Payload;
  battlerAId: string;
  battlerBId: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [rerunning, setRerunning] = useState(false);

  const { battlerA, battlerB, rounds, decision, league } = payload;
  const aWon = winnerId === battlerA.id;
  const aRounds = rounds.filter((r) => r.winner === 'a').length;
  const bRounds = rounds.length - aRounds;

  const share = async () => {
    const url = window.location.href;
    // Copy the link and confirm first — the reliable path that gives the
    // "LINK COPIED" feedback everywhere. Preferring navigator.share meant a
    // dismissed share sheet (or any browser that has the API) left the button
    // doing nothing, with no copied link and no confirmation.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    } catch {
      /* clipboard unavailable (older browser / insecure context) — offer the OS share sheet */
    }
    if (navigator.share) {
      await navigator.share({ title: headline ?? 'Dream Matchup', url }).catch(() => {});
    }
  };

  const runItBack = async () => {
    setRerunning(true);
    try {
      const res = await fetch('/api/matchup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battlerAId, battlerBId }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/matchup/${data.slug}`);
      else setRerunning(false);
    } catch {
      setRerunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
      {/* header */}
      <div className="text-center mb-8">
        <Link href="/matchup" className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff8c42] hover:text-[#ff9d5c]">
          ← DREAM MATCHUP SIMULATOR
        </Link>
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500 mt-4 mb-2">
          {league.name} · {Math.round(league.writingWeight * 100)}% PEN / {Math.round(league.performanceWeight * 100)}% PERFORMANCE
        </p>
      </div>

      {/* VS card */}
      <div className="bg-[#101114] border-2 border-[#3a3d44] p-6 md:p-10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-8">
          <Corner side={battlerA} won={aWon} align="left" />
          <div className="text-center">
            <p className="font-bebas text-5xl md:text-7xl text-[#ff8c42] drop-shadow-[0_0_25px_rgba(255,140,66,0.5)]">
              {aRounds}–{bRounds}
            </p>
            <div className="animate-stamp-in inline-block border-4 border-[#ff8c42] px-3 py-1 mt-2" style={{ animationDelay: '5.2s' }}>
              <p className="font-display text-sm md:text-lg font-black uppercase tracking-wide text-[#ff8c42]">{decision}</p>
            </div>
          </div>
          <Corner side={battlerB} won={!aWon && !!winnerId} align="right" />
        </div>

        {/* rounds */}
        <div className="mt-10 space-y-5">
          {/* legend — solid bar is the round average, the tick is the peak moment */}
          <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 flex items-center gap-4 -mt-3 mb-1">
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-2 bg-zinc-500/60" /> ROUND AVG</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-[2px] h-3.5 bg-white shadow-[0_0_4px_rgba(255,255,255,0.7)]" /> PEAK MOMENT</span>
          </p>
          {rounds.map((r, i) => {
            const aChoke = r.a.events.includes('choke');
            const bChoke = r.b.events.includes('choke');
            const aHay = r.a.events.includes('haymaker');
            const bHay = r.b.events.includes('haymaker');
            // Scale to the highest peak (not just avg) so the peak ticks land on the
            // track — the gap between a bar's end (avg) and its tick (peak) shows who
            // landed a haymaker vs stayed flat, matching the watch page.
            const max = Math.max(r.a.avg, r.b.avg, r.a.peak, r.b.peak, 1) * 1.05;
            return (
              <div key={r.roundIndex} className="animate-fade-in" style={{ animationDelay: `${i * 1500}ms` }}>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">ROUND {r.roundIndex}</p>
                  <div className="flex gap-3">
                    {(aHay || bHay) && (
                      <span className="font-display font-black text-xs uppercase text-[#ff8c42] animate-haymaker" style={{ animationDelay: `${i * 1500 + 600}ms` }}>
                        💥 HAYMAKER — {aHay ? battlerA.stageName : battlerB.stageName}
                      </span>
                    )}
                    {(aChoke || bChoke) && (
                      <span className="font-display font-black text-xs uppercase text-red-500 animate-haymaker" style={{ animationDelay: `${i * 1500 + 600}ms` }}>
                        😶 CHOKE — {aChoke ? battlerA.stageName : battlerB.stageName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-20 md:w-28 font-mono text-[10px] uppercase truncate text-[#ff8c42]">{battlerA.stageName}</span>
                  <div className="flex-1 h-4 bg-[#18191c] border border-[#3a3d44] relative">
                    <div
                      className={`h-full animate-bar-fill ${aChoke ? 'bg-red-500/70' : r.winner === 'a' ? 'bg-[#ff8c42]' : 'bg-[#ff8c42]/40'}`}
                      style={{ ['--bar-w' as string]: `${(r.a.avg / max) * 100}%`, animationDelay: `${i * 1500 + 250}ms` }}
                    />
                    {r.a.peak > 0 && (
                      <span
                        className="absolute top-[-2px] bottom-[-2px] w-[2px] -ml-px bg-[#ffd0a8] shadow-[0_0_5px_rgba(255,140,66,0.9)] animate-fade-in"
                        style={{ left: `${(r.a.peak / max) * 100}%`, animationDelay: `${i * 1500 + 700}ms` }}
                        title={`Peak ${r.a.peak}`}
                      />
                    )}
                  </div>
                  <span className="w-10 font-mono text-xs text-zinc-300 text-right">{r.a.avg}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 md:w-28 font-mono text-[10px] uppercase truncate text-zinc-300">{battlerB.stageName}</span>
                  <div className="flex-1 h-4 bg-[#18191c] border border-[#3a3d44] relative">
                    <div
                      className={`h-full animate-bar-fill ${bChoke ? 'bg-red-500/70' : r.winner === 'b' ? 'bg-zinc-300' : 'bg-zinc-300/40'}`}
                      style={{ ['--bar-w' as string]: `${(r.b.avg / max) * 100}%`, animationDelay: `${i * 1500 + 250}ms` }}
                    />
                    {r.b.peak > 0 && (
                      <span
                        className="absolute top-[-2px] bottom-[-2px] w-[2px] -ml-px bg-white shadow-[0_0_5px_rgba(255,255,255,0.85)] animate-fade-in"
                        style={{ left: `${(r.b.peak / max) * 100}%`, animationDelay: `${i * 1500 + 700}ms` }}
                        title={`Peak ${r.b.peak}`}
                      />
                    )}
                  </div>
                  <span className="w-10 font-mono text-xs text-zinc-300 text-right">{r.b.avg}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* headline */}
      {headline && (
        <div className="mt-8 bg-[#18191c] border-l-4 border-[#ff8c42] p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#ff8c42] mb-2">📰 THE WRITE-UP</p>
          <h2 className="font-display text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-100">
            {headline}
          </h2>
        </div>
      )}

      {/* actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={share}
          className="px-8 py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition"
        >
          {copied ? '✓ LINK COPIED' : '🔗 SHARE THE VERDICT'}
        </button>
        <button
          onClick={runItBack}
          disabled={rerunning}
          className="px-8 py-4 border-2 border-[#3a3d44] hover:border-[#ff8c42] text-zinc-200 font-display font-black uppercase tracking-wider transition disabled:opacity-40"
        >
          {rerunning ? '🔥 RUNNING…' : '↻ RUN IT BACK'}
        </button>
        <Link
          href="/matchup"
          className="px-8 py-4 border-2 border-[#3a3d44] hover:border-[#ff8c42] text-zinc-200 font-display font-black uppercase tracking-wider transition text-center"
        >
          NEW MATCHUP
        </Link>
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 mt-10">
        SIMULATED ON THE BATTLE RAP UNIVERSITY ENGINE —{' '}
        <Link href="/login" className="text-[#ff8c42] hover:underline">BUILD YOUR OWN BATTLER</Link>
      </p>
    </div>
  );
}
