/**
 * Fan Stats Widget
 * Displays fan count, trending score, and fan growth on dashboard
 */

type FanStatsProps = {
  fanData: {
    total_fans: number;
    hardcore_fans: number;
    casual_fans: number;
    trending_score: number;
    fan_growth_rate: number;
    avg_hype_multiplier: number;
  } | null;
};

export default function FanStatsWidget({ fanData }: FanStatsProps) {
  if (!fanData) {
    return (
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        <h3 className="text-lg font-black uppercase tracking-wider mb-4">FAN BASE</h3>
        <div className="text-zinc-500 text-sm uppercase tracking-wider">No fan data available</div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendingLabel = (score: number) => {
    if (score >= 80) return { label: 'VIRAL', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' };
    if (score >= 60) return { label: 'HOT', color: 'text-orange-400', bg: 'bg-[#ff8c42]/20', border: 'border-[#ff8c42]/30' };
    if (score >= 40) return { label: 'RISING', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
    return { label: 'STEADY', color: 'text-zinc-400', bg: 'bg-zinc-700/20', border: 'border-zinc-600/30' };
  };

  const trending = getTrendingLabel(fanData.trending_score);
  const hardcorePercent = ((fanData.hardcore_fans / fanData.total_fans) * 100).toFixed(0);
  const casualPercent = ((fanData.casual_fans / fanData.total_fans) * 100).toFixed(0);

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black uppercase tracking-wider">FAN BASE</h3>
        <div className={`px-3 py-1 border-2 ${trending.bg} ${trending.border} ${trending.color} text-xs font-black uppercase tracking-wider`}>
          {trending.label}
        </div>
      </div>

      {/* Total Fans */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-2">
          TOTAL FANS
        </div>
        <div className="text-5xl font-display font-black tracking-tighter text-zinc-100">
          {formatNumber(fanData.total_fans)}
        </div>
      </div>

      {/* Fan Segments */}
      <div className="space-y-4 mb-6">
        {/* Hardcore Fans */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-wide text-zinc-400 font-bold">Hardcore Fans</span>
            <span className="text-sm font-black text-green-400">{formatNumber(fanData.hardcore_fans)} ({hardcorePercent}%)</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${hardcorePercent}%` }}
            />
          </div>
          <div className="text-xs text-zinc-600 mt-1">Always watch your battles</div>
        </div>

        {/* Casual Fans */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-wide text-zinc-400 font-bold">Casual Fans</span>
            <span className="text-sm font-black text-blue-400">{formatNumber(fanData.casual_fans)} ({casualPercent}%)</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${casualPercent}%` }}
            />
          </div>
          <div className="text-xs text-zinc-600 mt-1">Watch when you're trending</div>
        </div>
      </div>

      {/* Growth Stats */}
      <div className="pt-4 border-t-2 border-[#3a3d44] space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Trending Score</span>
          <span className={`font-black text-lg ${trending.color}`}>
            {fanData.trending_score.toFixed(0)}/100
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Growth Rate</span>
          <span className={`font-black text-sm ${fanData.fan_growth_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {fanData.fan_growth_rate >= 0 ? '+' : ''}{fanData.fan_growth_rate.toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Hype Factor</span>
          <span className="font-black text-sm text-zinc-300">
            {(fanData.avg_hype_multiplier * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
