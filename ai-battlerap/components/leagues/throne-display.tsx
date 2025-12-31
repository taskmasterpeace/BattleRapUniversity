'use client';

import { useState } from 'react';
import BrutalistCard from '@/components/ui/BrutalistCard';
import { ThronePosition } from '@/lib/types/throne';
import ThroneChallengeModal from './throne-challenge-modal';

type Props = {
  leagueId: string;
  leagueName: string;
  thrones: ThronePosition[];
  playerBattlerId: string;
  playerRating: number;
};

const THRONE_CONFIG = {
  1: {
    title: 'KING/QUEEN',
    icon: '👑',
    color: 'text-yellow-500',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-500/10',
    mediaPerk: '+15% MEDIA',
    payoutPerk: '+20% PAYOUT',
  },
  2: {
    title: 'CHALLENGER',
    icon: '⚔️',
    color: 'text-zinc-300',
    borderColor: 'border-zinc-400',
    bgColor: 'bg-zinc-400/10',
    mediaPerk: '+10% MEDIA',
    payoutPerk: '+10% PAYOUT',
  },
  3: {
    title: 'GATEKEEPER',
    icon: '🛡️',
    color: 'text-orange-700',
    borderColor: 'border-orange-600',
    bgColor: 'bg-orange-600/10',
    mediaPerk: '+5% MEDIA',
    payoutPerk: 'RISING STAR BATTLES',
  },
};

export default function ThroneDisplay({
  leagueId,
  leagueName,
  thrones,
  playerBattlerId,
  playerRating,
}: Props) {
  const [selectedThrone, setSelectedThrone] = useState<ThronePosition | null>(null);

  const canChallenge = (throne: ThronePosition): boolean => {
    if (!throne.battler_id) return false;
    if (throne.battler_id === playerBattlerId) return false;

    // Must be within 100 ELO to challenge
    const ratingDiff = Math.abs(playerRating - (throne.battlerRating || 1200));
    return ratingDiff <= 100;
  };

  const getThroneForPosition = (position: 1 | 2 | 3): ThronePosition | undefined => {
    return thrones.find((t) => t.position === position);
  };

  return (
    <>
      <BrutalistCard accent="yellow" className="mb-8">
        <div className="mb-6">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-100 mb-2">
            {leagueName} THRONES
          </h2>
          <p className="text-sm text-zinc-400 uppercase tracking-wide">
            TOP 3 RANKINGS - CHALLENGE WITHIN 100 ELO
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Position 1 - King/Queen */}
          {[1, 2, 3].map((pos) => {
            const position = pos as 1 | 2 | 3;
            const throne = getThroneForPosition(position);
            const config = THRONE_CONFIG[position];
            const isPlayerOnThrone = throne?.battler_id === playerBattlerId;
            const canChallengeThisThrone = throne ? canChallenge(throne) : false;

            return (
              <div
                key={position}
                className={`border-4 ${config.borderColor} ${config.bgColor} p-4 relative`}
              >
                {/* Position Number */}
                <div className="absolute top-2 right-2 text-4xl font-black text-zinc-800">
                  #{position}
                </div>

                {/* Icon */}
                <div className="text-6xl text-center mb-3">{config.icon}</div>

                {/* Title */}
                <h3
                  className={`text-xl font-black uppercase text-center ${config.color} mb-4`}
                >
                  {config.title}
                </h3>

                {/* Current Holder */}
                {throne && throne.battler_id ? (
                  <div className="mb-4">
                    <div className="text-center mb-2">
                      <p className="text-2xl font-black uppercase text-zinc-100 tracking-tight">
                        {throne.battlerName}
                      </p>
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">
                        RATING: {throne.battlerRating || 1200}
                      </p>
                    </div>

                    {/* Defense Count */}
                    <div className="bg-zinc-900 border border-zinc-700 p-2 text-center">
                      <p className="text-xs text-zinc-400 uppercase tracking-wide">
                        DEFENSES
                      </p>
                      <p className="text-xl font-black text-orange-500">
                        {throne.defense_count}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-center">
                    <p className="text-lg font-bold uppercase text-zinc-500 tracking-wide">
                      VACANT
                    </p>
                  </div>
                )}

                {/* Perks */}
                <div className="space-y-1 mb-4">
                  <div className="bg-zinc-900/50 border border-zinc-800 px-2 py-1">
                    <p className="text-xs font-bold uppercase text-zinc-300 tracking-wide">
                      {config.mediaPerk}
                    </p>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 px-2 py-1">
                    <p className="text-xs font-bold uppercase text-zinc-300 tracking-wide">
                      {config.payoutPerk}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                {isPlayerOnThrone ? (
                  <div className="bg-green-500/20 border-2 border-green-500/50 p-2 text-center">
                    <p className="text-sm font-black uppercase text-green-400 tracking-wide">
                      YOU HOLD THIS THRONE
                    </p>
                  </div>
                ) : canChallengeThisThrone ? (
                  <button
                    onClick={() => setSelectedThrone(throne!)}
                    className="w-full bg-orange-500 hover:bg-orange-600 border-2 border-orange-700 p-2 transition-colors"
                  >
                    <p className="text-sm font-black uppercase text-zinc-950 tracking-wide">
                      CHALLENGE
                    </p>
                  </button>
                ) : throne?.battler_id ? (
                  <div className="bg-zinc-800 border-2 border-zinc-700 p-2 text-center">
                    <p className="text-xs font-bold uppercase text-zinc-500 tracking-wide">
                      {throne.battler_id === playerBattlerId
                        ? 'YOUR THRONE'
                        : 'OUT OF RANGE'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-zinc-800 border-2 border-zinc-700 p-2 text-center">
                    <p className="text-xs font-bold uppercase text-zinc-500 tracking-wide">
                      NO HOLDER
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-6 bg-zinc-900 border-2 border-zinc-800 p-4">
          <p className="text-xs font-bold uppercase text-zinc-400 tracking-wide mb-2">
            THRONE CHALLENGE RULES:
          </p>
          <ul className="text-xs text-zinc-500 space-y-1">
            <li>• Must be within 100 ELO of throne holder to challenge</li>
            <li>• Throne holder MUST accept within 48 hours or forfeit throne</li>
            <li>• Winner takes/keeps throne position</li>
            <li>• 3 defenses = "Iron Throne" badge</li>
            <li>• 5 defenses = "Dynasty" badge</li>
          </ul>
        </div>
      </BrutalistCard>

      {/* Challenge Modal */}
      {selectedThrone && (
        <ThroneChallengeModal
          isOpen={!!selectedThrone}
          onClose={() => setSelectedThrone(null)}
          throne={selectedThrone}
          leagueId={leagueId}
          leagueName={leagueName}
          playerBattlerId={playerBattlerId}
        />
      )}
    </>
  );
}
