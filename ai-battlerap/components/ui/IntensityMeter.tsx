import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface IntensityMeterProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
}

export function IntensityMeter({
  value,
  label,
  showValue = true,
  className,
  ...props
}: IntensityMeterProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  // Determine gradient color based on intensity
  const getGradientClass = (intensity: number) => {
    if (intensity < 30) return 'from-yellow-500 to-orange-500';
    if (intensity < 60) return 'from-orange-500 to-orange-600';
    if (intensity < 80) return 'from-orange-600 to-red-500';
    return 'from-red-500 to-red-700';
  };

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {/* Label and value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="text-slate-400 uppercase tracking-wide font-bold">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-slate-50 font-bold">{Math.round(clampedValue)}/100</span>
          )}
        </div>
      )}

      {/* Meter bar */}
      <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 bg-gradient-to-r rounded-full transition-all duration-300',
            getGradientClass(clampedValue)
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
