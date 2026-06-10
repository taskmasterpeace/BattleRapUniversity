'use client';

// Client island: send an async PvP challenge to another player's battler.
// Used on the /battlers roster (PLAYERS view) and battler profile pages.
import { useState } from 'react';
import { toast } from '@/components/ui/Toast';

type ChallengeButtonProps = {
  opponentBattlerId: string;
  stageName: string;
  size?: 'sm' | 'lg';
  label?: string;
  className?: string;
};

export default function ChallengeButton({
  opponentBattlerId,
  stageName,
  size = 'sm',
  label = '⚔️ CHALLENGE',
  className = '',
}: ChallengeButtonProps) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const sendChallenge = async (e: React.MouseEvent) => {
    // Cards may be wrapped in links — keep the click on the button
    e.preventDefault();
    e.stopPropagation();
    if (state !== 'idle') return;

    setState('sending');
    try {
      const response = await fetch('/api/battles/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opponentBattlerId }),
      });
      const data = await response.json();

      if (response.ok) {
        setState('sent');
        toast(`Challenge sent to ${stageName} — waiting on their answer`, 'success');
      } else {
        setState('idle');
        toast(data.error || 'Failed to send challenge', 'error');
      }
    } catch (error) {
      console.error('Error sending challenge:', error);
      setState('idle');
      toast('Failed to send challenge', 'error');
    }
  };

  const sizeClasses =
    size === 'lg'
      ? 'px-6 py-3 text-sm'
      : 'px-3 py-2 text-xs';

  return (
    <button
      onClick={sendChallenge}
      disabled={state !== 'idle'}
      className={`${sizeClasses} w-full font-display font-black uppercase tracking-wider border-2 transition-all ${
        state === 'sent'
          ? 'bg-[#18191c] border-[#3a3d44] text-zinc-500 cursor-default'
          : 'bg-[#ff8c42] border-[#ff8c42] text-black hover:bg-[#ff9d5c] hover:border-[#ff9d5c] disabled:opacity-60'
      } ${className}`}
    >
      {state === 'sent' ? '✓ CHALLENGE SENT' : state === 'sending' ? 'SENDING...' : label}
    </button>
  );
}
