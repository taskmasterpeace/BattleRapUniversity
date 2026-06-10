'use client';

// Client island: "TRAVEL HERE" button on a city detail page.
// Calls POST /api/travel, shows optimistic in-flight state, surfaces
// API errors (insufficient funds etc.) inline, then refreshes the
// server component so YOU ARE HERE / locals / recruit gating update.

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  cityId: string;
  cityName: string;
  cost: number;
  balance: number;
};

export default function TravelButton({ cityId, cityName, cost, balance }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'traveling' | 'arrived'>('idle');
  const [error, setError] = useState<string | null>(null);

  const canAfford = balance >= cost;

  async function handleTravel() {
    if (status !== 'idle') return;
    setError(null);
    setStatus('traveling');

    try {
      const res = await fetch('/api/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('idle');
        setError(data.error || 'Travel failed');
        return;
      }

      setStatus('arrived');
      router.refresh();
    } catch {
      setStatus('idle');
      setError('Travel failed — check your connection and try again');
    }
  }

  if (status === 'arrived') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-3 bg-[#ff8c42]/15 border-2 border-[#ff8c42] text-[#ff8c42] font-black uppercase tracking-wider text-sm">
        <span className="w-2 h-2 rounded-full bg-[#ff8c42] animate-pulse" />
        You are here
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleTravel}
        disabled={status === 'traveling' || !canAfford}
        className={`px-5 py-3 border-2 font-black uppercase tracking-wider text-sm transition-all duration-200 ${
          status === 'traveling'
            ? 'border-[#3a3d44] bg-[#18191c] text-zinc-500 cursor-wait'
            : canAfford
              ? 'border-[#ff8c42] bg-[#ff8c42] text-black hover:bg-transparent hover:text-[#ff8c42] hover:shadow-[0_10px_30px_-12px_rgba(255,140,66,0.7)]'
              : 'border-[#3a3d44] bg-[#18191c] text-zinc-600 cursor-not-allowed'
        }`}
        title={canAfford ? `Travel to ${cityName}` : `You need $${cost} — you have $${balance}`}
      >
        {status === 'traveling' ? 'EN ROUTE…' : `✈️ TRAVEL HERE — $${cost}`}
      </button>
      {!canAfford && !error && (
        <p className="text-[10px] font-mono uppercase tracking-widest text-red-400">
          Need ${cost} · You have ${balance}
        </p>
      )}
      {error && (
        <p className="text-[10px] font-mono uppercase tracking-widest text-red-400 max-w-xs">
          {error}
        </p>
      )}
    </div>
  );
}
