'use client';

// Client island: RECRUIT button on a local AI battler card.
// Enabled only when the player is physically in this city — recruiting
// is in-person. Otherwise shows a "TRAVEL HERE TO RECRUIT" hint.

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  battlerId: string;
  stageName: string;
  cost: number;
  /** Player's current_city_id matches this city */
  playerIsHere: boolean;
  /** Already a member of the player's crew */
  inCrew: boolean;
  crewFull: boolean;
  balance: number;
};

export default function RecruitButton({
  battlerId,
  stageName,
  cost,
  playerIsHere,
  inCrew,
  crewFull,
  balance,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'recruiting' | 'recruited'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleRecruit() {
    if (status !== 'idle') return;
    setError(null);
    setStatus('recruiting');

    try {
      const res = await fetch('/api/crew/recruit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battlerId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('idle');
        setError(data.error || 'Recruit failed');
        return;
      }

      setStatus('recruited');
      router.refresh();
    } catch {
      setStatus('idle');
      setError('Recruit failed — try again');
    }
  }

  if (inCrew || status === 'recruited') {
    return (
      <div className="w-full text-center px-2 py-1.5 bg-[#ff8c42]/10 border border-[#ff8c42]/50 text-[#ff8c42] text-[10px] font-black uppercase tracking-widest">
        ✓ In your crew
      </div>
    );
  }

  // Not in this city → in-person rule hint
  if (!playerIsHere) {
    return (
      <div
        className="group/hint relative w-full"
        title={`Travel here to recruit ${stageName}`}
      >
        <div className="w-full text-center px-2 py-1.5 border border-dashed border-[#3a3d44] text-zinc-600 text-[10px] font-black uppercase tracking-widest cursor-not-allowed select-none">
          Recruit · ${cost}
        </div>
        <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-[#101114] border border-[#ff8c42]/60 text-[#ff8c42] text-[9px] font-mono uppercase tracking-widest opacity-0 group-hover/hint:opacity-100 transition-opacity z-10">
          Travel here to recruit
        </div>
      </div>
    );
  }

  const canAfford = balance >= cost;
  const disabled = status === 'recruiting' || crewFull || !canAfford;

  return (
    <div className="w-full space-y-1">
      <button
        onClick={handleRecruit}
        disabled={disabled}
        title={
          crewFull
            ? 'Your crew is full (3 max)'
            : !canAfford
              ? `Costs $${cost} — you have $${balance}`
              : `Recruit ${stageName} for $${cost}`
        }
        className={`w-full px-2 py-1.5 border text-[10px] font-black uppercase tracking-widest transition ${
          status === 'recruiting'
            ? 'border-[#3a3d44] text-zinc-500 cursor-wait'
            : disabled
              ? 'border-[#3a3d44] text-zinc-600 cursor-not-allowed'
              : 'border-[#ff8c42] text-[#ff8c42] hover:bg-[#ff8c42] hover:text-black'
        }`}
      >
        {status === 'recruiting' ? 'TALKING…' : `🤝 Recruit · $${cost}`}
      </button>
      {crewFull && (
        <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 text-center">
          Crew full (3 max)
        </p>
      )}
      {!crewFull && !canAfford && (
        <p className="text-[9px] font-mono uppercase tracking-widest text-red-400 text-center">
          Need ${cost}
        </p>
      )}
      {error && (
        <p className="text-[9px] font-mono uppercase tracking-widest text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
