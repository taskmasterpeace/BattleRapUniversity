'use client';

import { useEffect, useState } from 'react';
import BrutalistCard from '@/components/ui/BrutalistCard';
import { ThroneChallenge } from '@/lib/types/throne';

type Props = {
  playerBattlerId: string;
};

export default function ThroneChallengesWidget({ playerBattlerId }: Props) {
  const [loading, setLoading] = useState(true);
  const [incomingChallenges, setIncomingChallenges] = useState<ThroneChallenge[]>([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState<ThroneChallenge[]>([]);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/thrones/challenges');
      const data = await response.json();

      if (response.ok) {
        setIncomingChallenges(data.incomingChallenges || []);
        setOutgoingChallenges(data.outgoingChallenges || []);
      }
    } catch (error) {
      console.error('Error fetching throne challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalChallenges = incomingChallenges.length + outgoingChallenges.length;

  if (loading) {
    return (
      <BrutalistCard accent="yellow" className="animate-pulse">
        <div className="h-24 bg-zinc-800 rounded" />
      </BrutalistCard>
    );
  }

  if (totalChallenges === 0) {
    return null; // Don't show widget if no challenges
  }

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const hoursLeft = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (hoursLeft <= 0) {
      return { text: 'EXPIRED', color: 'text-red-500' };
    } else if (hoursLeft <= 12) {
      return { text: `${hoursLeft}H LEFT`, color: 'text-red-400' };
    } else if (hoursLeft <= 24) {
      return { text: `${hoursLeft}H LEFT`, color: 'text-orange-400' };
    } else {
      return { text: `${hoursLeft}H LEFT`, color: 'text-zinc-400' };
    }
  };

  const getThroneIcon = (position: 1 | 2 | 3) => {
    if (position === 1) return '👑';
    if (position === 2) return '⚔️';
    return '🛡️';
  };

  const getThroneTitle = (position: 1 | 2 | 3) => {
    if (position === 1) return 'KING/QUEEN';
    if (position === 2) return 'CHALLENGER';
    return 'GATEKEEPER';
  };

  return (
    <BrutalistCard accent="yellow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-zinc-100">
            THRONE CHALLENGES
          </h3>
          <p className="text-xs text-zinc-500 uppercase tracking-wide">
            {totalChallenges} ACTIVE CHALLENGE{totalChallenges !== 1 ? 'S' : ''}
          </p>
        </div>
        <div className="text-3xl">👑</div>
      </div>

      <div className="space-y-3">
        {/* Incoming Challenges (User is throne holder - must respond) */}
        {incomingChallenges.map((challenge) => {
          const deadline = getDeadlineStatus(challenge.deadline);
          return (
            <div
              key={challenge.id}
              className="bg-red-500/20 border-2 border-red-500/50 p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{getThroneIcon(challenge.target_position)}</div>
                  <div>
                    <p className="text-sm font-black uppercase text-red-400 tracking-wide">
                      INCOMING CHALLENGE
                    </p>
                    <p className="text-xs text-zinc-400 uppercase tracking-wide">
                      {getThroneTitle(challenge.target_position)} - {challenge.leagueName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black uppercase ${deadline.color} tracking-wide`}>
                    {deadline.text}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-300">
                  <span className="font-bold text-orange-400">{challenge.challengerName}</span>{' '}
                  wants your throne
                </p>
                <button className="bg-orange-500 hover:bg-orange-600 border-2 border-orange-700 px-3 py-1 transition-colors">
                  <p className="text-xs font-black uppercase text-zinc-950 tracking-wide">
                    RESPOND
                  </p>
                </button>
              </div>
            </div>
          );
        })}

        {/* Outgoing Challenges (User is challenger - waiting for response) */}
        {outgoingChallenges.map((challenge) => {
          const deadline = getDeadlineStatus(challenge.deadline);
          return (
            <div
              key={challenge.id}
              className="bg-orange-500/20 border-2 border-orange-500/50 p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{getThroneIcon(challenge.target_position)}</div>
                  <div>
                    <p className="text-sm font-black uppercase text-orange-400 tracking-wide">
                      CHALLENGE ISSUED
                    </p>
                    <p className="text-xs text-zinc-400 uppercase tracking-wide">
                      {getThroneTitle(challenge.target_position)} - {challenge.leagueName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black uppercase ${deadline.color} tracking-wide`}>
                    {deadline.text}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-zinc-300">
                  Waiting for{' '}
                  <span className="font-bold text-orange-400">{challenge.holderName}</span> to
                  respond
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </BrutalistCard>
  );
}
