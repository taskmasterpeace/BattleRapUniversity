/**
 * Fan Stats Widget — the FAN BASE plate.
 * Flyer System poster plate; the hardcore/casual mix renders as ONE split
 * cell gauge (green = hardcore, blue = casual) in the app-wide meter texture.
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

const HARDCORE_CELL = 'linear-gradient(180deg,#3fd67e,#1c7a3f)';
const CASUAL_CELL = 'linear-gradient(180deg,#5b9fe3,#2F7DD1)';

export default function FanStatsWidget({ fanData }: FanStatsProps) {
  if (!fanData) {
    return (
      <div className="fs bg-[#17181C] border-2 border-black p-6 shadow-[4px_4px_0_rgba(0,0,0,.45)]">
        <h3 className="text-lg font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-3">FAN BASE</h3>
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
    if (score >= 80) return { label: 'VIRAL', color: '#E7B23C' };
    if (score >= 60) return { label: 'HOT', color: '#F5731A' };
    if (score >= 40) return { label: 'RISING', color: '#2F7DD1' };
    return { label: 'STEADY', color: '#9CA3AF' };
  };

  const trending = getTrendingLabel(fanData.trending_score);
  const total = Math.max(1, fanData.total_fans);
  const hardcorePercent = Math.round((fanData.hardcore_fans / total) * 100);
  const casualPercent = Math.round((fanData.casual_fans / total) * 100);
  const hardcoreCells = Math.round(hardcorePercent / 10);

  return (
    <div
      className="fs bg-[#17181C] border-2 border-black p-6 shadow-[4px_4px_0_rgba(0,0,0,.45)]"
      style={{ borderTop: '3px solid #F5731A' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-display font-black uppercase tracking-tighter text-[#ff8c42]">FAN BASE</h3>
        <span
          className="px-2.5 py-1 border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,.4)]"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 10,
            color: '#0F0F12',
            background: trending.color,
          }}
        >
          {trending.label}
        </span>
      </div>

      {/* Total Fans */}
      <div className="mb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-1.5">
          TOTAL FANS
        </div>
        <div
          className="leading-none text-zinc-100"
          style={{ fontFamily: 'var(--font-poster)', fontSize: 44, textShadow: '3px 3px 0 #000' }}
        >
          {formatNumber(fanData.total_fans)}
        </div>
      </div>

      {/* Fan mix — one split cell gauge */}
      <div className="mb-2">
        <div className="fs-seg">
          {Array.from({ length: 10 }).map((_, i) => (
            <i
              key={i}
              className={i === 2 || i === 5 || i === 8 ? 'notch' : undefined}
              style={{ background: i < hardcoreCells ? HARDCORE_CELL : CASUAL_CELL }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between gap-3 mb-5">
        <span className="font-mono text-[11px] uppercase tracking-wide">
          <span className="text-green-400 font-bold">■ HARDCORE</span>{' '}
          <span className="text-zinc-400">{formatNumber(fanData.hardcore_fans)} · {hardcorePercent}%</span>
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wide text-right">
          <span className="text-[#5b9fe3] font-bold">■ CASUAL</span>{' '}
          <span className="text-zinc-400">{formatNumber(fanData.casual_fans)} · {casualPercent}%</span>
        </span>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 -mt-3 mb-5">
        HARDCORE ALWAYS PULL UP · CASUALS WATCH WHEN YOU'RE TRENDING
      </p>

      {/* Growth stats */}
      <div className="pt-4 border-t-2 border-black space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Trending Score</span>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: trending.color }}>
            {fanData.trending_score.toFixed(0)}/100
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Growth Rate</span>
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 12,
              color: fanData.fan_growth_rate >= 0 ? '#35C46B' : '#E23A2E',
            }}
          >
            {fanData.fan_growth_rate >= 0 ? '+' : ''}{fanData.fan_growth_rate.toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Hype Factor</span>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 12, color: '#F4F4F6' }}>
            {(fanData.avg_hype_multiplier * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
