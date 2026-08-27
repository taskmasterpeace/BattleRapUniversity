'use client';

type Props = {
  currentAttributes: any;
  effects: any;
  choiceLabel: string;
};

type AttributeTier = 'Low' | 'Mid' | 'Top' | 'God';

const ATTRIBUTE_TIERS: Record<AttributeTier, { min: number; max: number; color: string; bg: string }> = {
  Low: { min: 1, max: 3, color: 'text-red-500', bg: 'bg-red-500/20' },
  Mid: { min: 4, max: 6, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  Top: { min: 7, max: 9, color: 'text-green-500', bg: 'bg-green-500/20' },
  God: { min: 10, max: 10, color: 'text-[#ff8c42]', bg: 'bg-[#ff8c42]/20' }
};

function getTier(value: number): AttributeTier {
  if (value >= 10) return 'God';
  if (value >= 7) return 'Top';
  if (value >= 4) return 'Mid';
  return 'Low';
}

export default function ImpactPreview({ currentAttributes, effects, choiceLabel }: Props) {
  if (!effects || Object.keys(effects).length === 0) {
    return null;
  }

  const formatAttributeName = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getCurrentValue = (key: string): number => {
    // Handle nested attributes
    if (key === 'reputation' || key === 'financial_stability' || key === 'family_bond') {
      return currentAttributes?.personal?.[key] || 5;
    }
    if (key === 'resilience') {
      return currentAttributes?.resilience || 5;
    }
    if (key === 'lyricism' || key === 'wordplay' || key === 'creativity' || key === 'flow') {
      return currentAttributes?.writing?.[key] || 5;
    }
    if (key === 'stage_presence' || key === 'crowd_control' || key === 'delivery') {
      return currentAttributes?.performance?.[key] || 5;
    }
    if (key === 'public_knowledge') {
      return currentAttributes?.public_knowledge || 0;
    }
    return 5;
  };

  const getProjectedValue = (key: string, change: number): number => {
    const current = getCurrentValue(key);
    const projected = current + change;

    // Public knowledge is 0-100
    if (key === 'public_knowledge') {
      return Math.max(0, Math.min(100, projected));
    }

    // Other attributes are 1-10
    return Math.max(1, Math.min(10, projected));
  };

  return (
    <div className="bg-[#2d2f35]/50 border-2 border-[#3a3d44] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          Impact Preview: {choiceLabel}
        </h3>
        <span className="text-xs text-zinc-600 uppercase tracking-wide">
          Current → Projected
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(effects).map(([key, value]: [string, any]) => {
          if (typeof value !== 'number' || value === 0) return null;

          const current = getCurrentValue(key);
          const projected = getProjectedValue(key, value);
          const change = value;
          const isPositive = change > 0;
          const isNegative = change < 0;

          // Check for tier changes
          const currentTier = key === 'public_knowledge' ? null : getTier(current);
          const projectedTier = key === 'public_knowledge' ? null : getTier(projected);
          const tierChanged = currentTier !== projectedTier && currentTier && projectedTier;

          // Warning if attribute drops below 4 or goes above 9
          const warning = projected <= 3 || (current < 10 && projected === 10);

          return (
            <div
              key={key}
              className={`p-4 border-2 ${
                warning
                  ? tierChanged
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : isNegative
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-green-500/10 border-green-500/30'
                  : 'bg-[#2d2f35] border-[#3a3d44]'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                    {formatAttributeName(key)}
                  </p>
                  {tierChanged && (
                    <p className="text-xs text-amber-400 mt-1">
                      Tier Change: {currentTier} → {projectedTier}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-zinc-400">
                    {key === 'public_knowledge' ? `${current}%` : current}
                  </span>
                  <span className={`text-sm ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isPositive ? '→' : '←'}
                  </span>
                  <span className={`text-lg font-black ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {key === 'public_knowledge' ? `${projected}%` : projected}
                  </span>
                </div>
              </div>

              {/* Visual bar showing change */}
              <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
                {key === 'public_knowledge' ? (
                  <>
                    {/* Public knowledge: 0-100 scale */}
                    <div
                      className="absolute h-full bg-zinc-600 transition-all"
                      style={{ width: `${current}%` }}
                    />
                    <div
                      className={`absolute h-full transition-all ${
                        isPositive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${projected}%`,
                        opacity: 0.7
                      }}
                    />
                  </>
                ) : (
                  <>
                    {/* Regular attributes: 1-10 scale (displayed as 10-100%) */}
                    <div
                      className="absolute h-full bg-zinc-600 transition-all"
                      style={{ width: `${(current / 10) * 100}%` }}
                    />
                    <div
                      className={`absolute h-full transition-all ${
                        isPositive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${(projected / 10) * 100}%`,
                        opacity: 0.7
                      }}
                    />
                  </>
                )}
              </div>

              {/* Change indicator */}
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs font-bold ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isPositive ? '+' : ''}{change} {key === 'public_knowledge' ? 'points' : ''}
                </span>
                {warning && (
                  <span className={`text-xs font-bold ${
                    projected <= 3 ? 'text-red-400' : 'text-[#ff8c42]'
                  }`}>
                    {projected <= 3 ? '⚠ CRITICAL LOW' : '⭐ GOD TIER REACHED'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
