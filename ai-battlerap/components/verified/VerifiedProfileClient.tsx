'use client';

// "MY VERIFIED PROFILE" — the verified battler's own panel with editable
// bio + avatar URL (the only self-editable fields).
import { useState } from 'react';
import Link from 'next/link';

type Battler = {
  id: string;
  stage_name: string;
  real_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  tier: string;
  region: string | null;
  likeness_status: string | null;
  style_tags: string[] | null;
};

type Ranking = { rating: number; wins: number; losses: number; streak: number } | null;

type Accolade = {
  id: string;
  rank: number | null;
  title: string;
  scope: string;
  region: string | null;
  year: number | null;
};

export default function VerifiedProfileClient({
  battler,
  ranking,
  accolades,
}: {
  battler: Battler;
  ranking: Ranking;
  accolades: Accolade[];
}) {
  const [bio, setBio] = useState(battler.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(battler.avatar_url ?? '');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/verified/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, avatar_url: avatarUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to save');
        return;
      }
      setSaved(true);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const realWorld = accolades.filter((a) => a.scope === 'real_world');
  const inGame = accolades.filter((a) => a.scope === 'in_game');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#101114]">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-wrap items-center gap-6">
          <div className="w-24 h-24 bg-[#18191c] border-2 border-[#ff8c42] flex items-center justify-center overflow-hidden shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={battler.stage_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🎤</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-block px-2.5 py-1 bg-[#ff8c42]/15 border border-[#ff8c42]/40 font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff8c42] mb-2">
              ✓ Verified Battler
            </div>
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-zinc-100">
              {battler.stage_name}
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mt-1">
              {battler.region ?? 'No city'} · Tier {battler.tier} · Likeness {battler.likeness_status ?? '—'}
            </p>
          </div>
          <Link
            href={`/battler/${battler.id}`}
            className="px-5 py-2.5 border-2 border-[#3a3d44] hover:border-[#ff8c42] text-zinc-200 font-display font-black uppercase tracking-wider text-sm transition"
          >
            VIEW PUBLIC PROFILE
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 animate-fade-in-up">
        {/* Record */}
        {ranking && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Rating', value: ranking.rating },
              { label: 'Wins', value: ranking.wins },
              { label: 'Losses', value: ranking.losses },
              { label: 'Streak', value: ranking.streak },
            ].map((s) => (
              <div key={s.label} className="bg-[#18191c] border-2 border-[#3a3d44] p-4 text-center">
                <div className="text-3xl font-display font-black text-[#ff8c42]">{s.value}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bio (editable) */}
        <section className="bg-[#18191c] border-2 border-[#3a3d44] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-black uppercase tracking-tighter text-xl text-zinc-100">
              MY STORY
            </h2>
            <div className="flex items-center gap-3">
              {saved && !editing && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-green-400">✓ Saved</span>
              )}
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 border-2 border-[#3a3d44] hover:border-[#ff8c42] text-zinc-300 font-mono text-[10px] uppercase tracking-widest transition"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">
                  Bio
                </label>
                <textarea
                  rows={6}
                  maxLength={4000}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the culture who you are…"
                  className="w-full px-3 py-2.5 bg-[#0a0a0a] border-2 border-[#3a3d44] text-zinc-100 text-sm placeholder-zinc-600 focus:border-[#ff8c42] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">
                  Avatar URL
                </label>
                <input
                  maxLength={500}
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://… or /sprites/…"
                  className="w-full px-3 py-2.5 bg-[#0a0a0a] border-2 border-[#3a3d44] text-zinc-100 text-sm placeholder-zinc-600 focus:border-[#ff8c42] focus:outline-none"
                />
              </div>
              {error && (
                <div className="px-4 py-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm font-bold">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={busy}
                  className="px-6 py-2.5 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider text-sm transition disabled:opacity-40"
                >
                  {busy ? 'SAVING…' : 'SAVE'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setBio(battler.bio ?? '');
                    setAvatarUrl(battler.avatar_url ?? '');
                    setError(null);
                  }}
                  className="px-6 py-2.5 border-2 border-[#3a3d44] hover:border-zinc-500 text-zinc-300 font-display font-black uppercase tracking-wider text-sm transition"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {bio || <span className="text-zinc-600 italic">No bio yet — hit Edit and tell your story.</span>}
            </p>
          )}
        </section>

        {/* Accolades */}
        {(realWorld.length > 0 || inGame.length > 0) && (
          <section className="bg-[#18191c] border-2 border-[#3a3d44] p-6">
            <h2 className="font-display font-black uppercase tracking-tighter text-xl text-zinc-100 mb-4">
              ACCOLADES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'REAL WORLD', items: realWorld },
                { title: 'IN GAME', items: inGame },
              ]
                .filter((g) => g.items.length > 0)
                .map((group) => (
                  <div key={group.title}>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                      {group.title}
                    </div>
                    <div className="space-y-2">
                      {group.items.map((a) => (
                        <div key={a.id} className="flex items-center gap-3 bg-[#101114] border border-[#3a3d44] px-4 py-3">
                          <span className="font-display font-black text-[#ff8c42] w-9 text-center shrink-0">
                            {a.rank ? `#${a.rank}` : '★'}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-zinc-100">{a.title}</div>
                            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                              {[a.region, a.year].filter(Boolean).join(' · ') || '—'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Style tags */}
        {(battler.style_tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(battler.style_tags ?? []).map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 bg-[#18191c] border border-[#3a3d44] font-mono text-[10px] uppercase tracking-widest text-zinc-400"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
