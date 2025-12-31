'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ThronePosition } from '@/lib/types/throne';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  throne: ThronePosition;
  leagueId: string;
  leagueName: string;
  playerBattlerId: string;
};

const THRONE_TITLES = {
  1: 'KING/QUEEN',
  2: 'CHALLENGER',
  3: 'GATEKEEPER',
};

export default function ThroneChallengeModal({
  isOpen,
  onClose,
  throne,
  leagueId,
  leagueName,
  playerBattlerId,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChallenge = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/thrones/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leagueId,
          targetPosition: throne.position,
          throneHolderBattlerId: throne.battler_id,
          challengerBattlerId: playerBattlerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to issue throne challenge');
      }

      // Success - close modal and refresh
      alert('Throne challenge issued! The throne holder has 48 hours to accept or forfeit.');
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const throneTitle = THRONE_TITLES[throne.position as 1 | 2 | 3];
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 48);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="THRONE CHALLENGE"
      size="md"
      className="bg-zinc-900 border-orange-500"
    >
      <div className="space-y-6">
        {/* Target Info */}
        <div className="bg-zinc-950 border-2 border-zinc-800 p-4">
          <div className="mb-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
              CHALLENGING FOR
            </p>
            <p className="text-2xl font-black uppercase text-orange-500 tracking-tight">
              {throneTitle} - POSITION #{throne.position}
            </p>
          </div>

          <div className="mb-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">LEAGUE</p>
            <p className="text-lg font-bold uppercase text-zinc-100 tracking-wide">
              {leagueName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                CURRENT HOLDER
              </p>
              <p className="text-lg font-black uppercase text-zinc-100 tracking-tight">
                {throne.battlerName}
              </p>
              <p className="text-xs text-zinc-400 uppercase tracking-wide">
                RATING: {throne.battlerRating || 1200}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">DEFENSES</p>
              <p className="text-3xl font-black text-orange-500">{throne.defense_count}</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-500/20 border-2 border-red-500/50 p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <p className="text-sm font-black uppercase text-red-400 mb-2 tracking-wide">
                48-HOUR DEADLINE
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">
                The throne holder MUST accept your challenge within 48 hours or forfeit their
                throne position. Once accepted, the battle will be scheduled.
              </p>
            </div>
          </div>
        </div>

        {/* Stakes */}
        <div className="bg-zinc-950 border-2 border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
            STAKES & PAYOUT
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold uppercase text-zinc-300 tracking-wide">
                Winner Takes Throne:
              </p>
              <p className="text-sm font-black uppercase text-orange-500 tracking-wide">YES</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold uppercase text-zinc-300 tracking-wide">
                Media Coverage:
              </p>
              <p className="text-sm font-black uppercase text-orange-500 tracking-wide">
                {throne.position === 1 ? '+15%' : throne.position === 2 ? '+10%' : '+5%'}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold uppercase text-zinc-300 tracking-wide">
                Battle Payout:
              </p>
              <p className="text-sm font-black uppercase text-orange-500 tracking-wide">
                {throne.position === 1 ? '+20%' : throne.position === 2 ? '+10%' : 'STANDARD'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 p-3">
            <p className="text-sm font-bold uppercase text-red-400 tracking-wide">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 p-3 transition-colors disabled:opacity-50"
          >
            <p className="text-sm font-black uppercase text-zinc-300 tracking-wide">CANCEL</p>
          </button>
          <button
            onClick={handleChallenge}
            disabled={isSubmitting}
            className="flex-1 bg-orange-500 hover:bg-orange-600 border-2 border-orange-700 p-3 transition-colors disabled:opacity-50"
          >
            <p className="text-sm font-black uppercase text-zinc-950 tracking-wide">
              {isSubmitting ? 'ISSUING...' : 'ISSUE CHALLENGE'}
            </p>
          </button>
        </div>

        {/* Info */}
        <div className="bg-zinc-950 border border-zinc-800 p-3">
          <p className="text-xs text-zinc-500 leading-relaxed">
            By issuing this challenge, you are formally calling out{' '}
            <span className="text-zinc-300 font-bold">{throne.battlerName}</span> for their{' '}
            <span className="text-orange-400 font-bold">{throneTitle}</span> position. They will
            be notified and must respond before{' '}
            <span className="text-zinc-300 font-bold">
              {deadline.toLocaleDateString()} at {deadline.toLocaleTimeString()}
            </span>
            .
          </p>
        </div>
      </div>
    </Modal>
  );
}
