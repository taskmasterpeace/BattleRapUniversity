/**
 * RematchDemandBar Component
 *
 * Displays fan/community demand for a rematch between two battlers
 * Uses blue color scheme to distinguish from intensity (orange/red)
 *
 * Props:
 * - demand: 0-100 score
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - showLabel: boolean (default: true)
 * - className: optional additional classes
 */

interface RematchDemandBarProps {
  demand: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function RematchDemandBar({ demand, size = 'md', showLabel = true, className = '' }: RematchDemandBarProps) {
  const getTextSize = () => {
    if (size === 'sm') return 'text-xs';
    if (size === 'lg') return 'text-base';
    return 'text-sm';
  };

  const getLabel = () => {
    if (demand >= 80) return 'CRITICAL';
    if (demand >= 60) return 'High';
    if (demand >= 30) return 'Moderate';
    return 'Low';
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className={`${getTextSize()} text-zinc-400`}>Rematch Demand</span>
          <span className={`${getTextSize()} font-bold text-blue-500`}>
            {demand}/100 {getLabel()}
          </span>
        </div>
      )}
      <div
        className="fs"
        role="progressbar"
        aria-valuenow={demand}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Rematch demand: ${demand} out of 100, ${getLabel()}`}
      >
        <div className="fs-seg">
          {Array.from({ length: 10 }).map((_, i) => (
            <i
              key={i}
              className={i === 2 || i === 5 || i === 8 ? 'notch' : undefined}
              style={
                i < Math.round(Math.min(100, Math.max(0, demand)) / 10)
                  ? { background: 'linear-gradient(180deg,#5b9fe3,#2F7DD1)' }
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
