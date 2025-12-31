'use client';

type Props = {
  ranking: {
    wins: number;
    losses: number;
    current_win_streak: number;
    current_loss_streak: number;
    longest_win_streak: number;
  };
  totalBattles: number;
};

export default function CareerStatsWidget({ ranking, totalBattles }: Props) {
  const winRate =
    totalBattles > 0 ? ((ranking.wins / totalBattles) * 100).toFixed(1) : '0.0';

  const currentStreak =
    ranking.current_win_streak > 0
      ? `${ranking.current_win_streak}W`
      : ranking.current_loss_streak > 0
      ? `${ranking.current_loss_streak}L`
      : '-';

  const streakColor =
    ranking.current_win_streak > 0
      ? 'text-green-500'
      : ranking.current_loss_streak > 0
      ? 'text-red-500'
      : 'text-zinc-500';

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-4 md:p-6 mb-6">
      <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4 font-bold">
        Career Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Battles */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] p-3 rounded">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1 font-bold">
            Total Battles
          </div>
          <div className="text-2xl font-black text-[#ff8c42]">{totalBattles}</div>
        </div>

        {/* Win Rate */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] p-3 rounded">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1 font-bold">
            Win Rate
          </div>
          <div className="text-2xl font-black text-[#ff8c42]">{winRate}%</div>
        </div>

        {/* Record */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] p-3 rounded">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1 font-bold">
            Record
          </div>
          <div className="text-2xl font-black text-zinc-100">
            <span className="text-green-500">{ranking.wins}</span>
            <span className="text-zinc-600 mx-1">-</span>
            <span className="text-red-500">{ranking.losses}</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-[#18191c] border-2 border-[#3a3d44] p-3 rounded">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1 font-bold">
            Current Streak
          </div>
          <div className={`text-2xl font-black ${streakColor}`}>
            {currentStreak}
          </div>
        </div>
      </div>

      {/* Longest Win Streak */}
      {ranking.longest_win_streak > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-[#3a3d44]">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1 font-bold">
            Longest Win Streak
          </div>
          <div className="text-xl font-black text-green-500">
            {ranking.longest_win_streak} battles
          </div>
        </div>
      )}
    </div>
  );
}
