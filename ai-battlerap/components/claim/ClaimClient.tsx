'use client';

// "CLAIM YOUR LEGACY" — verified battler code redemption UI.
import { useState } from 'react';
import Link from 'next/link';

type ClaimedBattler = {
  id: string;
  stage_name: string;
  real_name: string | null;
  avatar_url: string | null;
};

export default function ClaimClient() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<ClaimedBattler | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong — try again.');
        return;
      }
      setClaimed(data.battler);
    } finally {
      setBusy(false);
    }
  };

  if (claimed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center animate-fade-in-up">
          <div className="bg-[#18191c] border-2 border-[#ff8c42] p-10 shadow-[0_20px_60px_-20px_rgba(255,140,66,0.5)]">
            {claimed.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={claimed.avatar_url}
                alt={claimed.stage_name}
                className="w-24 h-24 object-cover mx-auto mb-6 border-2 border-[#3a3d44]"
              />
            )}
            <div className="inline-block px-3 py-1 bg-[#ff8c42]/15 border border-[#ff8c42]/40 font-mono text-[12px] uppercase tracking-[0.3em] text-[#ff8c42] mb-4">
              ✓ Verified Battler
            </div>
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-3">
              YOU&apos;RE <span className="text-[#ff8c42]">VERIFIED</span>
            </h1>
            <p className="text-zinc-300 mb-8">
              Welcome to the university, <span className="font-bold text-zinc-100">{claimed.stage_name}</span>.
              This profile is yours now — your record, your accolades, your story.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/verified"
                className="px-6 py-3 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition"
              >
                MY VERIFIED PROFILE
              </Link>
              <Link
                href={`/battler/${claimed.id}`}
                className="px-6 py-3 border-2 border-[#3a3d44] hover:border-[#ff8c42] text-zinc-200 font-display font-black uppercase tracking-wider transition"
              >
                PUBLIC PROFILE
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-lg w-full animate-fade-in-up">
        <div className="text-center mb-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.4em] text-[#ff8c42] mb-3">
            Verified Battler Program
          </p>
          <h1 className="text-5xl font-display font-black uppercase tracking-tighter text-zinc-100">
            CLAIM YOUR <span className="text-[#ff8c42]">LEGACY</span>
          </h1>
        </div>

        <div className="bg-[#18191c] border-2 border-[#3a3d44] p-8">
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            Real battlers live in Battle Rap University as <span className="text-zinc-200 font-bold">verified profiles</span> —
            your real accolades, your style, your likeness, simulated in the circuit. If you&apos;re the
            battler, the profile belongs to you. Enter the one-time claim code we sent you to take
            control: edit your bio, rep your record, and wear the verified badge.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[12px] uppercase tracking-widest text-zinc-500 mb-2">
                Claim Code
              </label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="BRU-XXXX-XXXX"
                autoComplete="off"
                spellCheck={false}
                className="w-full px-4 py-3.5 bg-[#0a0a0a] border-2 border-[#3a3d44] text-zinc-100 font-mono text-lg tracking-[0.2em] placeholder-zinc-700 focus:border-[#ff8c42] focus:outline-none uppercase"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || code.trim().length === 0}
              className="w-full py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-display font-black uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? 'VERIFYING…' : '🎤 CLAIM PROFILE'}
            </button>
          </form>

          <p className="font-mono text-[12px] uppercase tracking-widest text-zinc-600 mt-6 text-center">
            No code? Codes are issued directly by BRU staff to the battler.
          </p>
        </div>
      </div>
    </div>
  );
}
