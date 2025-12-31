/**
 * IntensityBadge Component
 *
 * Small badge displaying intensity level with color coding
 * Useful for compact displays like tables and cards
 *
 * Props:
 * - intensity: 0-100 score
 * - size: 'sm' | 'md' (default: 'md')
 * - className: optional additional classes
 */

interface IntensityBadgeProps {
  intensity: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function IntensityBadge({ intensity, size = 'md', className = '' }: IntensityBadgeProps) {
  const getColor = () => {
    if (intensity >= 86) return 'bg-red-600 text-white';
    if (intensity >= 61) return 'bg-orange-600 text-white';
    if (intensity >= 31) return 'bg-yellow-600 text-zinc-900';
    return 'bg-zinc-600 text-zinc-100';
  };

  const getLabel = () => {
    if (intensity >= 86) return 'VERY HOT';
    if (intensity >= 61) return 'HOT';
    if (intensity >= 31) return 'Warm';
    return 'Cool';
  };

  const getSizeClasses = () => {
    if (size === 'sm') return 'text-xs px-2 py-0.5';
    return 'text-sm px-3 py-1';
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${getSizeClasses()} ${getColor()} rounded-full font-display font-black uppercase ${className}`}
      role="status"
      aria-label={`Grudge intensity: ${intensity} out of 100, ${getLabel()}`}
    >
      <span className="w-2 h-2 bg-current rounded-full animate-pulse" aria-hidden="true" />
      {getLabel()}
      <span className="font-mono">{intensity}</span>
    </span>
  );
}
