'use client';

// Client island: dismiss a crew member (with inline confirm — no refund).

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  memberId: string;
  stageName: string;
};

export default function DismissCrewButton({ memberId, stageName }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDismiss() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/crew/${memberId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setBusy(false);
        setError(data.error || 'Failed to dismiss');
        return;
      }
      router.refresh();
    } catch {
      setBusy(false);
      setError('Failed to dismiss — try again');
    }
  }

  if (confirming) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-red-400">
          Cut {stageName} loose? No refund.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            disabled={busy}
            className="flex-1 px-3 py-1.5 border border-red-500/60 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition disabled:opacity-50"
          >
            {busy ? 'DISMISSING…' : 'Yes, dismiss'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={busy}
            className="flex-1 px-3 py-1.5 border border-[#3a3d44] text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-zinc-200 transition"
          >
            Keep
          </button>
        </div>
        {error && (
          <p className="text-[10px] font-mono uppercase tracking-widest text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full px-3 py-1.5 border border-[#3a3d44] text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:border-red-500/60 hover:text-red-400 transition"
    >
      Dismiss
    </button>
  );
}
