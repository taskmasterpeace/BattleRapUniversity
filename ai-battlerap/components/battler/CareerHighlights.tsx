'use client';
import Icon from '@/components/ui/Icon';

type RoundSummary = {
  peak_score: number;
  average_score: number;
  crowd_reaction: number;
  consistency_score: number;
  choked: boolean;
};

type Props = {
  rounds: RoundSummary[] | null | undefined;
  ranking: { wins?: number; losses?: number; streak?: number } | null | undefined;
};

// Poster plate — the one stat-card look (Flyer System)
const Stat = ({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent?: string;
  hint?: string;
}) => {
  const edge = accent?.includes('ff8c42')
    ? '#F5731A'
    : accent?.includes('green')
      ? '#35C46B'
      : accent?.includes('red')
        ? '#E23A2E'
        : '#3E404A';
  return (
    <div
      className="bg-[#101114] border-2 border-black p-4 shadow-[3px_3px_0_rgba(0,0,0,.4)]"
      style={{ borderTop: `3px solid ${edge}` }}
    >
      <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-500 mb-2">
        {label}
      </div>
      <div
        className={`leading-none ${accent || 'text-zinc-100'}`}
        style={{ fontFamily: 'var(--font-poster)', fontSize: 24, textShadow: '2px 2px 0 #000' }}
      >
        {value}
      </div>
      {hint && (
        <div className="font-mono text-[8px] text-zinc-600 mt-2 uppercase tracking-[0.2em]">{hint}</div>
      )}
    </div>
  );
};

export default function CareerHighlights({ rounds, ranking }: Props) {
  const safe = rounds || [];
  const hasData = safe.length > 0;

  const maxPeak = hasData ? Math.max(...safe.map((r) => r.peak_score)) : 0;
  const bestCrowd = hasData ? Math.max(...safe.map((r) => r.crowd_reaction)) : 0;
  const avgScore =
    hasData ? safe.reduce((s, r) => s + r.average_score, 0) / safe.length : 0;
  const totalChokes = safe.filter((r) => r.choked).length;
  const bestConsistency =
    hasData ? Math.max(...safe.map((r) => r.consistency_score)) : 0;
  const totalRounds = safe.length;
  const haymakers = safe.filter((r) => r.peak_score >= 8.5).length;
  const streak = ranking?.streak || 0;
  const wins = ranking?.wins || 0;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42] mb-4">
        <Icon name="chart" size={20} className="mr-2 -mt-1 inline-block" />CAREER HIGHLIGHTS
      </h2>

      <div className="fs bg-[#17181C] border-2 border-black p-6 shadow-[4px_4px_0_rgba(0,0,0,.45)]">
        {!hasData ? (
          <div className="text-center py-6">
            <div className="flex justify-center mb-3 text-zinc-600"><Icon name="chart" size={40} /></div>
            <p className="text-zinc-400 font-display font-black uppercase tracking-wider text-sm mb-2">
              NO BATTLES COMPLETED YET
            </p>
            <p className="text-zinc-500 text-xs">
              Career highlights unlock after your first battle
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat
              label="HIGHEST PEAK"
              value={maxPeak.toFixed(1)}
              accent={maxPeak >= 8.5 ? 'text-[#ff8c42]' : undefined}
              hint={maxPeak >= 8.5 ? 'HAYMAKER' : 'BEST MOMENT'}
            />
            <Stat
              label="BEST CROWD"
              value={`${bestCrowd.toFixed(0)}%`}
              accent={bestCrowd >= 80 ? 'text-green-400' : undefined}
              hint={bestCrowd >= 80 ? 'ROOM SHOOK' : 'TOP REACTION'}
            />
            <Stat
              label="HAYMAKERS"
              value={String(haymakers)}
              accent={haymakers > 0 ? 'text-[#ff8c42]' : undefined}
              hint="ROUNDS ≥ 8.5 PEAK"
            />
            <Stat
              label="CAREER AVG"
              value={avgScore.toFixed(2)}
              hint="ROUND AVERAGE"
            />
            <Stat
              label="BEST CONSISTENCY"
              value={bestConsistency.toFixed(1)}
              hint="OUT OF 10"
            />
            <Stat
              label="CHOKES"
              value={String(totalChokes)}
              accent={totalChokes > 0 ? 'text-red-400' : 'text-green-400'}
              hint={totalChokes > 0 ? 'BLEMISHES' : 'STAYED LOCKED'}
            />
            <Stat
              label="TOTAL ROUNDS"
              value={String(totalRounds)}
              hint="LIFETIME"
            />
            <Stat
              label="CURRENT STREAK"
              value={
                streak > 0
                  ? `W${streak}`
                  : streak < 0
                  ? `L${Math.abs(streak)}`
                  : '—'
              }
              accent={
                streak > 0
                  ? 'text-green-400'
                  : streak < 0
                  ? 'text-red-400'
                  : undefined
              }
              hint={streak > 0 ? 'ON FIRE' : streak < 0 ? 'COLD' : 'NEUTRAL'}
            />
          </div>
        )}
      </div>
    </div>
  );
}
