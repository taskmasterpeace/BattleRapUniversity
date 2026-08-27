/**
 * Battle Views Display Component
 * Shows view count, tier, and source breakdown for completed battles
 */

type BattleViewsProps = {
  views: {
    total_views: number;
    from_fan_base: number;
    from_league_subscribers: number;
    from_opponent_fans: number;
    from_viral_discovery: number;
    from_scandal_boost: number;
    viral_multiplier: number;
    view_tier: 'low' | 'mid' | 'top' | 'goat';
  };
  showBreakdown?: boolean;
};

const VIEW_TIER_CONFIG = {
  low: {
    label: 'LOW',
    bgColor: 'bg-zinc-700/30',
    borderColor: 'border-zinc-600',
    textColor: 'text-zinc-400',
  },
  mid: {
    label: 'MID',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
  },
  top: {
    label: 'TOP',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
  },
  goat: {
    label: 'GOAT',
    bgColor: 'bg-[#ff8c42]/20',
    borderColor: 'border-[#ff8c42]/40',
    textColor: 'text-[#ff8c42]',
  },
};

export default function BattleViewsDisplay({ views, showBreakdown = false }: BattleViewsProps) {
  const tierConfig = VIEW_TIER_CONFIG[views.view_tier];

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
      {/* Main View Count */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1">
            BATTLE VIEWS
          </div>
          <div className="text-4xl font-display font-black tracking-tighter text-zinc-100">
            {formatNumber(views.total_views)}
          </div>
        </div>

        {/* View Tier Badge */}
        <div
          className={`px-4 py-2 border-2 ${tierConfig.bgColor} ${tierConfig.borderColor} ${tierConfig.textColor} font-black text-sm uppercase tracking-wider`}
        >
          {tierConfig.label} TIER
        </div>
      </div>

      {/* Viral Indicators */}
      {views.viral_multiplier > 1.5 && (
        <div className="mb-4 p-3 bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 text-xs font-display font-black uppercase tracking-wider flex items-center gap-2">
          <span>🔥</span>
          <span>VIRAL MOMENT ({views.viral_multiplier.toFixed(1)}x multiplier)</span>
        </div>
      )}

      {/* View Source Breakdown */}
      {showBreakdown && (
        <div className="mt-6 pt-6 border-t-2 border-[#3a3d44] space-y-3">
          <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-4">
            VIEW SOURCES
          </div>

          {/* Fan Base */}
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wide text-zinc-400">Fan Base</span>
            <span className="font-bold text-zinc-300">{formatNumber(views.from_fan_base)}</span>
          </div>

          {/* League Subscribers */}
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wide text-zinc-400">League Subscribers</span>
            <span className="font-bold text-zinc-300">{formatNumber(views.from_league_subscribers)}</span>
          </div>

          {/* Opponent Fans */}
          {views.from_opponent_fans > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wide text-zinc-400">Opponent Fans</span>
              <span className="font-bold text-zinc-300">{formatNumber(views.from_opponent_fans)}</span>
            </div>
          )}

          {/* Viral Discovery */}
          {views.from_viral_discovery > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wide text-amber-400">🔥 Viral Discovery</span>
              <span className="font-bold text-amber-400">{formatNumber(views.from_viral_discovery)}</span>
            </div>
          )}

          {/* Scandal Boost */}
          {views.from_scandal_boost > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wide text-red-400">⚠️ Scandal Boost</span>
              <span className="font-bold text-red-400">{formatNumber(views.from_scandal_boost)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
