import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface StatBarProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number; // 1-10 scale
  maxValue?: number;
  showValue?: boolean;
  color?: 'orange' | 'blue' | 'green' | 'rose' | 'red';
}

export function StatBar({
  label,
  value,
  maxValue = 10,
  showValue = true,
  color = 'orange',
  className,
  ...props
}: StatBarProps) {
  const percentage = (value / maxValue) * 100;

  const colorStyles = {
    orange: 'bg-[#ff8c42]',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    rose: 'bg-rose-400',
    red: 'bg-red-500',
  };

  // Get tier label
  const getTier = (val: number) => {
    if (val <= 3) return 'LOW';
    if (val <= 6) return 'MID';
    if (val <= 9) return 'TOP';
    return 'GOD';
  };

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {/* Label and value */}
      <div className="flex items-center justify-between">
        <span className="text-slate-400 uppercase tracking-wide font-bold text-sm">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {showValue && (
            <>
              <span className="text-slate-50 font-bold text-sm">{value}</span>
              <span className="text-xs text-slate-500 uppercase">
                ({getTier(value)})
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stat bar */}
      <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-300',
            colorStyles[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
