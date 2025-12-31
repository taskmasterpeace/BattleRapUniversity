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
    bar: 'from-green-500 to-emerald-500'
  },
  focused: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-500',
    border: 'border-yellow-500/20',
    bar: 'from-yellow-500 to-amber-500'
  },
  tense: {
    bg: 'bg-[#ff8c42]/10',
    text: 'text-[#ff8c42]',
    border: 'border-[#ff8c42]/20',
    bar: 'from-orange-500 to-red-500'
  },
  overwhelmed: {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    border: 'border-red-500/20',
    bar: 'from-red-500 to-rose-600'
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
    small: {
      label: 'text-xs',
      value: 'text-sm',
      bar: 'h-1'
    },
    normal: {
      label: 'text-xs',
      value: 'text-base',
      bar: 'h-1.5'
    },
    large: {
      label: 'text-sm',
      value: 'text-lg',
      bar: 'h-2'
    }
  };

  const sizes = sizeClasses[size];

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

      {/* Stress bar */}
      <div className="h-1.5 bg-zinc-800 rounded-sm overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors.bar} transition-all duration-500`}
          style={{ width: `${stress}%` }}
        />
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
