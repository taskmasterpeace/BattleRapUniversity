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
  // heat-colored cells in the app-wide notched meter texture
  const getCell = () => {
    if (intensity >= 86) return 'linear-gradient(180deg,#e86458,#a5281e)';
    if (intensity >= 61) return 'linear-gradient(180deg,#ff9d5c,#c4560f)';
    if (intensity >= 31) return 'linear-gradient(180deg,#e8d454,#b89f1e)';
    return 'linear-gradient(180deg,#5a5c66,#3a3c44)';
  };

  const getLabel = () => {
    if (intensity >= 86) return 'VERY HOT';
    if (intensity >= 61) return 'HOT';
    if (intensity >= 31) return 'Warm';
    return 'Cool';
  };

  const getTextSize = () => {
    if (size === 'sm') return 'text-xs';
    if (size === 'lg') return 'text-base';
    return 'text-sm';
  };

  const clamped = Math.min(100, Math.max(0, intensity));
  const filled = Math.round(clamped / 10);

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
      <div
        className="fs"
        role="progressbar"
        aria-valuenow={intensity}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Grudge intensity: ${intensity} out of 100, ${getLabel()}`}
      >
        <div className="fs-seg">
          {Array.from({ length: 10 }).map((_, i) => (
            <i
              key={i}
              className={i === 2 || i === 5 || i === 8 ? 'notch' : undefined}
              style={i < filled ? { background: getCell() } : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
