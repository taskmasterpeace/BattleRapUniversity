'use client';

type BadgeProgressItem = {
  badgeCode: string;
  badgeName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercent: number;
};

type BadgeProgressProps = {
  progressItems: BadgeProgressItem[];
  showAll?: boolean;
  maxItems?: number;
};

function formatBadgeName(badgeCode: string): string {
  return badgeCode.replace(/[_\\\/]/g, ' ');
}

export default function BadgeProgress({
  progressItems,
  showAll = false,
  maxItems = 5,
}: BadgeProgressProps) {
  if (!progressItems || progressItems.length === 0) {
    return null;
  }

  const itemsToShow = showAll ? progressItems : progressItems.slice(0, maxItems);

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-black uppercase tracking-wider text-[#ff8c42]">
          Badge Progress
        </h3>
        <span className="text-xs text-zinc-500 uppercase tracking-wide">
          {itemsToShow.length} Tracked
        </span>
      </div>

      <div className="space-y-4">
        {itemsToShow.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-300 uppercase tracking-wide">
                {item.badgeName}
              </span>
              <span className="text-xs text-zinc-500">
                {item.currentValue.toFixed(item.currentValue % 1 === 0 ? 0 : 1)} / {item.targetValue} {item.unit}
              </span>
            </div>

            {/* Progress Gauge */}
            <div className="fs">
              <div className="fs-seg">
                {Array.from({ length: 10 }).map((_, i) => (
                  <i
                    key={i}
                    className={i === 2 || i === 5 || i === 8 ? 'notch' : undefined}
                    style={
                      i < Math.round(Math.min(100, item.progressPercent) / 10)
                        ? { background: 'linear-gradient(180deg,#ff9d5c,#c4560f)' }
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>

            {/* Progress Percentage */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600">
                {item.progressPercent >= 100 ? 'Ready to unlock!' : `${Math.round(item.progressPercent)}% complete`}
              </span>
              {item.progressPercent >= 100 && (
                <span className="text-green-500 font-bold animate-pulse">✓ COMPLETE</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!showAll && progressItems.length > maxItems && (
        <div className="pt-4 border-t-2 border-[#3a3d44]">
          <p className="text-xs text-zinc-500 text-center">
            +{progressItems.length - maxItems} more badges in progress
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Example usage with sample data generator
 */
export function generateSampleBadgeProgress(
  battlerStats: {
    battles: number;
    wins: number;
    wordplay: number;
    lyricism: number;
  }
): BadgeProgressItem[] {
  const progress: BadgeProgressItem[] = [];

  // Respected Veteran progress (50 battles needed)
  if (battlerStats.battles < 50) {
    progress.push({
      badgeCode: 'Respected Veteran',
      badgeName: formatBadgeName('Respected Veteran'),
      currentValue: battlerStats.battles,
      targetValue: 50,
      unit: 'battles',
      progressPercent: (battlerStats.battles / 50) * 100,
    });
  }

  // Battle Technician progress (100 battles needed)
  if (battlerStats.battles < 100) {
    progress.push({
      badgeCode: 'Battle Technician',
      badgeName: formatBadgeName('Battle Technician'),
      currentValue: battlerStats.battles,
      targetValue: 100,
      unit: 'battles',
      progressPercent: (battlerStats.battles / 100) * 100,
    });
  }

  // Wordplay Wizard progress (8.0 wordplay needed)
  if (battlerStats.wordplay < 8.0) {
    progress.push({
      badgeCode: 'Wordplay Wizard',
      badgeName: formatBadgeName('Wordplay Wizard'),
      currentValue: battlerStats.wordplay,
      targetValue: 8.0,
      unit: 'wordplay',
      progressPercent: (battlerStats.wordplay / 8.0) * 100,
    });
  }

  // Pen Game Elite progress (9.0 lyricism + wordplay needed)
  const avgWriting = (battlerStats.wordplay + battlerStats.lyricism) / 2;
  if (avgWriting < 9.0) {
    progress.push({
      badgeCode: 'Pen Game Elite',
      badgeName: formatBadgeName('Pen Game Elite'),
      currentValue: avgWriting,
      targetValue: 9.0,
      unit: 'avg writing',
      progressPercent: (avgWriting / 9.0) * 100,
    });
  }

  return progress;
}
