/**
 * TournamentStats Component
 * Displays overall tournament statistics for a player
 */

'use client';

interface TournamentStatsProps {
  stats: {
    totalTournaments: number;
    championships: number;
    runnerUps: number;
    top4Finishes: number;
    totalPrizeEarned: string;
    winRate: string;
    totalBattlesWon: number;
    totalBattlesLost: number;
  };
}

export default function TournamentStats({ stats }: TournamentStatsProps) {
  const totalBattles = stats.totalBattlesWon + stats.totalBattlesLost;
  const finalsAppearances = stats.championships + stats.runnerUps;

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
      <h2 className="text-xl font-black uppercase tracking-tighter text-[#ff8c42] mb-6">
        Tournament Career Stats
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Tournaments */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] rounded p-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
            Tournaments
          </div>
          <div className="text-3xl font-black text-zinc-100">
            {stats.totalTournaments}
          </div>
        </div>

        {/* Championships */}
        <div className="bg-[#18191c] border-2 border-[#ff8c42]/30 rounded p-4">
          <div className="text-xs uppercase tracking-wide text-orange-400 mb-1">
            🏆 Championships
          </div>
          <div className="text-3xl font-black text-[#ff8c42]">
            {stats.championships}
          </div>
        </div>

        {/* Finals Appearances */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] rounded p-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
            Finals
          </div>
          <div className="text-3xl font-black text-zinc-100">
            {finalsAppearances}
          </div>
          <div className="text-xs text-zinc-600 mt-1">
            {stats.runnerUps} runner-up{stats.runnerUps !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Prize Money */}
        <div className="bg-[#18191c] border-2 border-green-500/30 rounded p-4">
          <div className="text-xs uppercase tracking-wide text-green-400 mb-1">
            💰 Prize Money
          </div>
          <div className="text-2xl font-black text-green-500">
            ${parseFloat(stats.totalPrizeEarned).toLocaleString()}
          </div>
        </div>

        {/* Tournament Win Rate */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] rounded p-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
            Win Rate
          </div>
          <div className="text-3xl font-black text-zinc-100">
            {stats.winRate}%
          </div>
          <div className="text-xs text-zinc-600 mt-1">
            {stats.totalBattlesWon}-{stats.totalBattlesLost} in tournaments
          </div>
        </div>

        {/* Top 4 Finishes */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] rounded p-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
            Top 4 Finishes
          </div>
          <div className="text-3xl font-black text-zinc-100">
            {stats.top4Finishes}
          </div>
        </div>

        {/* Total Battles */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] rounded p-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
            Tournament Battles
          </div>
          <div className="text-3xl font-black text-zinc-100">
            {totalBattles}
          </div>
        </div>

        {/* Average Prize per Tournament */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] rounded p-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
            Avg Prize
          </div>
          <div className="text-2xl font-black text-zinc-100">
            ${stats.totalTournaments > 0
              ? (parseFloat(stats.totalPrizeEarned) / stats.totalTournaments).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })
              : '0'}
          </div>
        </div>
      </div>

      {/* Championship Rate */}
      {stats.totalTournaments > 0 && (
        <div className="mt-6 pt-6 border-t-2 border-[#3a3d44]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400 uppercase tracking-wide">
              Championship Rate
            </span>
            <span className="text-zinc-100 font-bold">
              {((stats.championships / stats.totalTournaments) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
              style={{
                width: `${(stats.championships / stats.totalTournaments) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
