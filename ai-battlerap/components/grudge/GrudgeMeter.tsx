/**
 * GrudgeMeter Component
 *
 * Displays rivalry intensity as a visual progress bar with color coding:
 * - 0-30: Cool (zinc-600)
 * - 31-60: Warm (yellow-600)
 * - 61-85: HOT (orange-600)
 * - 86-100: VERY HOT (red-600)
 *
 * Props:
 * - intensity: 0-100 score
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - showLabel: boolean (default: true)
 * - className: optional additional classes
 */

interface GrudgeMeterProps {
  intensity: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function GrudgeMeter({ intensity, size = 'md', showLabel = true, className = '' }: GrudgeMeterProps) {
  const getColor = () => {
    if (intensity >= 86) return 'bg-red-600';
    if (intensity >= 61) return 'bg-orange-600';
    if (intensity >= 31) return 'bg-yellow-600';
    return 'bg-zinc-600';
  };

  const getLabel = () => {
    if (intensity >= 86) return 'VERY HOT';
    if (intensity >= 61) return 'HOT';
    if (intensity >= 31) return 'Warm';
    return 'Cool';
  };

  const getHeight = () => {
    if (size === 'sm') return 'h-2';
    if (size === 'lg') return 'h-6';
    return 'h-4';
  };

  const getTextSize = () => {
    if (size === 'sm') return 'text-xs';
    if (size === 'lg') return 'text-base';
    return 'text-sm';
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className={`${getTextSize()} text-zinc-400`}>Intensity</span>
          <span className={`${getTextSize()} font-bold text-[#ff8c42]`}>
            {intensity}/100 {getLabel()}
          </span>
        </div>
      )}
      <div className="w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`${getHeight()} ${getColor()} transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, intensity))}%` }}
          role="progressbar"
          aria-valuenow={intensity}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Grudge intensity: ${intensity} out of 100, ${getLabel()}`}
        />
      </div>
    </div>
  );
}
