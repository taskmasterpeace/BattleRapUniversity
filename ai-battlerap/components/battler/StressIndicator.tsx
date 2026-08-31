'use client';

import { getStressDisplay, getStressWarning, type StressState } from '@/lib/utils/stressDisplay';

type Props = {
  stress: number;
  daysSinceRest?: number;
  upcomingBattleDays?: number | null;
  showWarning?: boolean;
  size?: 'small' | 'normal' | 'large';
};

const stateColors = {
  calm: {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    border: 'border-green-500/20',
    cell: 'linear-gradient(180deg,#3fd67e,#1c7a3f)'
  },
  focused: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-500',
    border: 'border-yellow-500/20',
    cell: 'linear-gradient(180deg,#e8d454,#b89f1e)'
  },
  tense: {
    bg: 'bg-[#ff8c42]/10',
    text: 'text-[#ff8c42]',
    border: 'border-[#ff8c42]/20',
    cell: 'linear-gradient(180deg,#ff9d5c,#c4560f)'
  },
  overwhelmed: {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    border: 'border-red-500/20',
    cell: 'linear-gradient(180deg,#e86458,#a5281e)'
  }
};

export default function StressIndicator({
  stress,
  daysSinceRest = 0,
  upcomingBattleDays = null,
  showWarning = true,
  size = 'normal'
}: Props) {
  const display = getStressDisplay(stress);
  const warning = showWarning ? getStressWarning(stress, daysSinceRest, upcomingBattleDays) : null;
  const colors = stateColors[display.state];

  const sizeClasses = {
    small: { label: 'text-xs', value: 'text-sm' },
    normal: { label: 'text-xs', value: 'text-base' },
    large: { label: 'text-sm', value: 'text-lg' }
  };

  const sizes = sizeClasses[size];
  const filled = Math.round(Math.max(0, Math.min(100, stress)) / 10);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`${colors.text} uppercase ${sizes.label} tracking-wide font-bold`}>
          STRESS
        </span>
        <span className={`${colors.text} font-black ${sizes.value}`}>
          {display.label.toUpperCase()}
        </span>
      </div>

      {/* Stress gauge — the notched cell meter, severity-colored */}
      <div className="fs">
        <div className="fs-seg">
          {Array.from({ length: 10 }).map((_, i) => (
            <i
              key={i}
              className={i === 2 || i === 5 || i === 8 ? 'notch' : undefined}
              style={i < filled ? { background: colors.cell } : undefined}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-500 italic">
        {display.description}
      </p>

      {/* Choke penalty indicator */}
      {stress > 25 && (
        <div className={`px-3 py-1.5 ${colors.bg} ${colors.border} border-2 rounded text-xs`}>
          <span className="text-zinc-400 uppercase tracking-wide">Choke Risk: </span>
          <span className={`${colors.text} font-bold`}>{display.chokePenalty}</span>
        </div>
      )}

      {/* Warning message */}
      {warning && (
        <div className="px-3 py-2 bg-red-500/10 border-2 border-red-500/30 rounded text-xs text-red-400">
          {warning}
        </div>
      )}
    </div>
  );
}
