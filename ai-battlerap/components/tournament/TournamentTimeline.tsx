/**
 * TournamentTimeline Component
 * Visual timeline of player's journey through a tournament
 */

'use client';

import Link from 'next/link';

interface TimelineEntry {
  round: string;
  matchNumber: number;
  opponentId: string;
  opponentSeed: number | null;
  won: boolean;
  status: string;
  battleId: string | null;
  verdict: string | null;
  haymakers: number;
  averageScore: string | null;
}

interface TournamentTimelineProps {
  battles: TimelineEntry[];
  placement: string | null;
  prizeEarned: number;
  seedNumber: number | null;
}

const ROUND_LABELS: Record<string, string> = {
  first_round: 'First Round',
  quarterfinals: 'Quarterfinals',
  semifinals: 'Semifinals',
  finals: 'Finals',
};

const PLACEMENT_LABELS: Record<string, { label: string; color: string }> = {
  winner: { label: 'CHAMPION', color: 'text-yellow-400' },
  runner_up: { label: 'RUNNER-UP', color: 'text-gray-400' },
  semifinalist: { label: 'TOP 4', color: 'text-amber-600' },
  quarterfinalist: { label: 'TOP 8', color: 'text-zinc-500' },
  first_round: { label: 'FIRST ROUND', color: 'text-zinc-600' },
};

export default function TournamentTimeline({
  battles,
  placement,
  prizeEarned,
  seedNumber,
}: TournamentTimelineProps) {
  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter text-[#ff8c42]">
          Tournament Journey
        </h2>
        {seedNumber && (
          <div className="text-sm text-zinc-400">
            Seed: <span className="text-zinc-100 font-bold">#{seedNumber}</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {battles.map((battle, index) => {
          const isLast = index === battles.length - 1;

          return (
            <div key={`${battle.round}-${battle.matchNumber}`} className="relative">
              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-zinc-800" />
              )}

              {/* Battle Card */}
              <div className="flex gap-4">
                {/* Status Indicator */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-[#18191c]"
                  style={{
                    borderColor: battle.status === 'completed'
                      ? battle.won
                        ? '#22c55e'
                        : '#ef4444'
                      : '#52525b',
                  }}
                >
                  {battle.status === 'completed' ? (
                    battle.won ? (
                      <span className="text-green-500 text-sm">✓</span>
                    ) : (
                      <span className="text-red-500 text-sm">✗</span>
                    )
                  ) : (
                    <span className="text-zinc-500 text-sm">○</span>
                  )}
                </div>

                {/* Battle Info */}
                <div className="flex-1 bg-[#18191c] border-2 border-[#3a3d44] rounded p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                        {ROUND_LABELS[battle.round] || battle.round}
                      </div>
                      <div className="text-sm font-bold text-zinc-100">
                        vs Seed #{battle.opponentSeed}
                      </div>
                    </div>

                    {battle.status === 'completed' && (
                      <div className={`text-xs font-black uppercase px-2 py-1 rounded ${
                        battle.won
                          ? 'bg-green-500/20 text-green-500 border-2 border-green-500/30'
                          : 'bg-red-500/20 text-red-500 border-2 border-red-500/30'
                      }`}>
                        {battle.won ? 'WIN' : 'LOSS'}
                      </div>
                    )}

                    {battle.status !== 'completed' && (
                      <div className="text-xs font-black uppercase px-2 py-1 rounded bg-zinc-800 text-zinc-500">
                        {battle.status === 'scheduled' ? 'SCHEDULED' : 'PENDING'}
                      </div>
                    )}
                  </div>

                  {/* Battle Details */}
                  {battle.status === 'completed' && (
                    <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
                      {battle.verdict && (
                        <div>
                          <span className="text-zinc-600">
                            {battle.verdict === '3-0' ? 'BODYBAG' : 'DEBATABLE'}:
                          </span>{' '}
                          <span className="text-zinc-300">{battle.verdict}</span>
                        </div>
                      )}
                      {battle.averageScore && (
                        <div>
                          <span className="text-zinc-600">Avg Score:</span>{' '}
                          <span className="text-zinc-300">{battle.averageScore}</span>
                        </div>
                      )}
                      {battle.haymakers > 0 && (
                        <div>
                          <span className="text-zinc-600">Haymakers:</span>{' '}
                          <span className="text-[#ff8c42] font-bold">{battle.haymakers}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* View Battle Link */}
                  {battle.battleId && battle.status === 'completed' && (
                    <Link
                      href={`/battle/${battle.battleId}`}
                      className="inline-block mt-3 text-xs uppercase tracking-wide text-[#ff8c42] hover:text-[#ff9d5c] font-bold"
                    >
                      View Battle →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Result */}
      {placement && (
        <div className="mt-6 pt-6 border-t-2 border-[#3a3d44]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                Final Placement
              </div>
              <div className={`text-2xl font-black uppercase ${PLACEMENT_LABELS[placement]?.color || 'text-zinc-100'}`}>
                {PLACEMENT_LABELS[placement]?.label || placement}
              </div>
            </div>

            {prizeEarned > 0 && (
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-green-500 mb-1">
                  Prize Earned
                </div>
                <div className="text-2xl font-black text-green-500">
                  ${parseFloat(prizeEarned as any).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
