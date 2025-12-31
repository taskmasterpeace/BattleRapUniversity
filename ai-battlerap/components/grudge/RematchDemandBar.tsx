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
      <div className="w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`${getHeight()} bg-blue-600 transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, demand))}%` }}
          role="progressbar"
          aria-valuenow={demand}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Rematch demand: ${demand} out of 100, ${getLabel()}`}
        />
      </div>
    </div>
  );
}
