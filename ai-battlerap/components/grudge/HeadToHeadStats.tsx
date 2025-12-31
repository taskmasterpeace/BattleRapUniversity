/**
 * HeadToHeadStats Component
 *
 * Displays head-to-head battle record between two battlers
 * Shows wins, losses, and last battle info
 *
 * Props:
 * - myRecord: { wins: number; losses: number }
 * - totalBattles: number
 * - lastBattleDate: string | null
 * - lastBattleWinner: string | null (battler ID)
 * - myId: string (current battler's ID)
 * - compact: boolean (default: false) - compact view for smaller spaces
 * - className: optional additional classes
 */

import { formatDistanceToNow } from 'date-fns';

interface HeadToHeadStatsProps {
  myRecord: { wins: number; losses: number };
  totalBattles: number;
  lastBattleDate?: string | null;
  lastBattleWinner?: string | null;
  myId?: string;
  compact?: boolean;
  className?: string;
}

export function HeadToHeadStats({
  myRecord,
  totalBattles,
  lastBattleDate,
  lastBattleWinner,
  myId,
  compact = false,
  className = '',
}: HeadToHeadStatsProps) {
  const recordString = `${myRecord.wins}-${myRecord.losses}`;
  const winRate = totalBattles > 0 ? Math.round((myRecord.wins / totalBattles) * 100) : 0;

  const didIWinLast = myId && lastBattleWinner ? lastBattleWinner === myId : null;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="text-sm font-semibold text-zinc-400">H2H:</div>
        <div className="text-base font-bold text-[#ff8c42]">{recordString}</div>
        {didIWinLast !== null && (
          <div
            className={`w-2 h-2 rounded-full ${didIWinLast ? 'bg-green-500' : 'bg-red-500'}`}
            title={didIWinLast ? 'Won last battle' : 'Lost last battle'}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`bg-zinc-800 p-4 rounded border-2 border-[#3a3d44] ${className}`}>
      <div className="text-xs uppercase font-semibold text-zinc-400 mb-2">Head-to-Head Record</div>
      <div className="flex items-baseline gap-3 mb-2">
        <div className="text-3xl font-bold text-[#ff8c42]">{recordString}</div>
        <div className="text-sm text-zinc-400">({winRate}% win rate)</div>
      </div>
      <div className="flex justify-between text-sm">
        <div>
          <span className="text-green-500 font-bold">{myRecord.wins}W</span>
          <span className="text-zinc-600 mx-1">/</span>
          <span className="text-red-500 font-bold">{myRecord.losses}L</span>
        </div>
        <div className="text-zinc-500">{totalBattles} battle{totalBattles !== 1 ? 's' : ''}</div>
      </div>

      {lastBattleDate && (
        <div className="mt-3 pt-3 border-t-2 border-[#3a3d44] flex items-center justify-between">
          <span className="text-xs text-zinc-500">Last Battle:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              {formatDistanceToNow(new Date(lastBattleDate), { addSuffix: true })}
            </span>
            {didIWinLast !== null && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  didIWinLast ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {didIWinLast ? 'W' : 'L'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
