'use client';

/**
 * THE NEWSROOM — the desk. See the whole press machine at once: who's holding
 * what, what's about to drop, what just dropped, and the stories that died on
 * the vine because a blogger sat on them too long.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Developing = {
  id: string; sitReason: string; publishAfter: string; blogger: string; handle: string;
  influence: number; subcategory: string | null; category: string | null; heat: number;
  hint: string; subject: string | null; other: string | null;
};
type Dropped = { id: string; body: string; createdAt: string; blogger: string; beat: string | null; subcategory: string | null; sitReason: string | null };
type Cold = { id: string; subcategory: string | null; hint: string; subject: string | null };
type Blogger = { handle: string; name: string; influence: number; credibility: number; frequency: number; holdingCount: number };

const SIT: Record<string, { label: string; tone: string; border: string }> = {
  breaking: { label: 'BREAKING', tone: 'text-red-400', border: 'border-red-500/50' },
  developing: { label: 'DEVELOPING', tone: 'text-[#ff8c42]', border: 'border-[#ff8c42]/50' },
  building_it: { label: 'WORKING IT', tone: 'text-yellow-500', border: 'border-yellow-500/40' },
  backburner: { label: 'SITTING ON IT', tone: 'text-zinc-500', border: 'border-[#3a3d44]' },
};

const CAT_TONE: Record<string, string> = {
  career: 'text-[#ff8c42]', financial: 'text-emerald-400', scandal: 'text-red-400',
  personal: 'text-sky-400', relationship: 'text-rose-400', battle: 'text-[#ff8c42]',
};

function dropsIn(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'ANY MINUTE';
  const h = ms / 3_600_000;
  if (h < 1) return `${Math.round(ms / 60000)}M`;
  if (h < 24) return `${Math.round(h)}H`;
  return `${Math.round(h / 24)}D`;
}
function ago(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const h = ms / 3_600_000;
  if (h < 1) return `${Math.max(1, Math.round(ms / 60000))}m ago`;
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
const beatWord = (s: string | null) => (s ?? 'story').replace(/_/g, ' ');

export default function NewsroomPage() {
  const [developing, setDeveloping] = useState<Developing[]>([]);
  const [dropped, setDropped] = useState<Dropped[]>([]);
  const [cold, setCold] = useState<Cold[]>([]);
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/newsroom');
      if (!res.ok) return;
      const d = await res.json();
      setDeveloping(d.developing ?? []);
      setDropped(d.dropped ?? []);
      setCold(d.cold ?? []);
      setBloggers(d.bloggers ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const advance = async (ticks: number) => {
    setAdvancing(true);
    setNote(null);
    try {
      const res = await fetch(`/api/internal/run-newsroom?ticks=${ticks}`, {
        method: 'POST',
        headers: { Authorization: 'Bearer local-dev-secret-123' },
      });
      const d = await res.json();
      setNote(d.message ?? 'Advanced.');
      await load();
    } catch {
      setNote('Could not advance the scene.');
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      <div className="border-b-2 border-[#3a3d44] bg-[#101114]">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <Link href="/wire" className="text-[#ff8c42] hover:text-[#ff9d5c] text-sm font-display font-black uppercase tracking-wider min-h-[44px] inline-flex items-center transition">
            ← THE WIRE
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-3">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter">📰 THE NEWSROOM</h1>
              <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                THE BLOGS DECIDE WHAT THE CULTURE TALKS ABOUT
              </p>
            </div>
            {/* Dev: advance the scene so held stories drop. */}
            <div className="flex items-center gap-2">
              <button onClick={() => advance(1)} disabled={advancing}
                className="px-3 py-2 bg-[#2d2f35] border-2 border-[#3a3d44] hover:border-[#ff8c42]/50 text-xs font-display font-black uppercase tracking-wider disabled:opacity-50 transition">
                {advancing ? '…' : 'ADVANCE 12H'}
              </button>
              <button onClick={() => advance(14)} disabled={advancing}
                className="px-3 py-2 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black border-2 border-[#ff8c42] text-xs font-display font-black uppercase tracking-wider disabled:opacity-50 transition">
                {advancing ? '…' : 'RUN A WEEK'}
              </button>
            </div>
          </div>
          {note && <p className="text-[11px] font-mono text-[#ff8c42] mt-2">{note}</p>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-10">
        {loading ? (
          <p className="text-zinc-600 font-mono uppercase tracking-widest text-sm">LOADING THE DESK…</p>
        ) : (
          <>
            {/* The desk — bloggers */}
            <section>
              <h2 className="text-xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-3">The Desk</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {bloggers.map((b) => (
                  <div key={b.handle} className="bg-[#101114] border-2 border-[#3a3d44] p-3">
                    <div className="font-display font-black text-sm uppercase tracking-tight text-zinc-100 truncate">{b.handle}</div>
                    <div className="flex items-center gap-2 mt-1.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                      <span>INF <b className="text-[#ff8c42]">{b.influence}</b></span>
                      <span>{b.frequency >= 0.85 ? '2×/WK' : b.frequency >= 0.7 ? '~WKLY' : 'SLOW'}</span>
                    </div>
                    <div className="mt-1.5 text-[10px] font-mono uppercase tracking-wide">
                      {b.holdingCount > 0
                        ? <span className="text-[#ff8c42]">ON {b.holdingCount} {b.holdingCount === 1 ? 'STORY' : 'STORIES'}</span>
                        : <span className="text-zinc-600">QUIET</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Developing */}
            <section>
              <h2 className="text-xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-1">Developing</h2>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3">STORIES THE BLOGS ARE SITTING ON</p>
              {developing.length === 0 ? (
                <p className="text-zinc-600 font-mono uppercase tracking-widest text-sm py-8 text-center bg-[#101114] border-2 border-[#3a3d44]">
                  SLOW NEWS DAY — NOTHING DEVELOPING
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {developing.map((d) => {
                    const sit = SIT[d.sitReason] ?? SIT.developing;
                    return (
                      <div key={d.id} className={`bg-[#101114] border-2 ${sit.border} p-4`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${sit.tone}`}>{sit.label}</span>
                          <span className="text-[10px] font-mono text-zinc-600 uppercase">DROPS ~{dropsIn(d.publishAfter)}</span>
                        </div>
                        <p className="font-display font-black text-lg uppercase tracking-tight leading-none text-zinc-100">
                          {d.subject}{d.other ? <span className="text-zinc-500"> vs {d.other}</span> : null}
                        </p>
                        <p className="text-sm text-zinc-400 leading-snug mt-1.5">{d.hint}</p>
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t-2 border-[#3a3d44]">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
                            {d.handle} <span className="text-zinc-600">on the</span> <span className={CAT_TONE[d.category ?? 'career']}>{beatWord(d.subcategory)}</span>
                          </span>
                          <span className="text-[9px] font-mono text-zinc-700 uppercase">HEAT {Math.round(d.heat)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Just dropped */}
            {dropped.length > 0 && (
              <section>
                <h2 className="text-xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-1">Just Dropped</h2>
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3">STORIES THAT MADE THE TIMELINE</p>
                <div className="space-y-2">
                  {dropped.map((p) => (
                    <div key={p.id} className="bg-[#101114] border-2 border-[#3a3d44] p-3.5 flex items-start gap-3">
                      <span className="w-1 self-stretch bg-[#ff8c42]/50 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-black text-sm uppercase tracking-tight text-[#ff8c42]">{p.blogger}</span>
                          <span className="text-[9px] font-mono text-zinc-600 uppercase">{beatWord(p.subcategory)} · {ago(p.createdAt)}</span>
                        </div>
                        <p className="text-sm text-zinc-300 leading-snug">{p.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Went cold */}
            {cold.length > 0 && (
              <section>
                <h2 className="text-xl font-display font-black uppercase tracking-tighter text-zinc-500 mb-1">Went Cold</h2>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-3">STORIES THAT DIED ON THE VINE — SAT ON TOO LONG, OR NOBODY BIT</p>
                <div className="space-y-1.5">
                  {cold.map((c) => (
                    <div key={c.id} className="bg-[#101114]/60 border-2 border-[#2d2f35] p-3 flex items-center justify-between gap-3">
                      <p className="text-sm text-zinc-600 leading-snug line-through decoration-zinc-700">
                        {c.subject ? <span className="text-zinc-500">{c.subject}: </span> : null}{c.hint}
                      </p>
                      <span className="text-[9px] font-mono text-zinc-700 uppercase shrink-0">{beatWord(c.subcategory)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
