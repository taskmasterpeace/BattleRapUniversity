'use client';

/**
 * CareerStatsPanel - Enhanced career statistics display
 * Shows total battles, win rate, streak, and attribute progression chart
 */

import { useMemo } from 'react';
import Icon from '@/components/ui/Icon';

type Props = {
  ranking: {
    wins: number;
    losses: number;
    streak: number;
    rating: number;
  } | null;
  attributes: {
    writing: {
      lyricism: number;
      wordplay: number;
      creativity: number;
      flow: number;
    };
    performance: {
      stage_presence: number;
      crowd_control: number;
      delivery: number;
    };
    resilience: number;
  } | null;
};

export default function CareerStatsPanel({ ranking, attributes }: Props) {
  const totalBattles = (ranking?.wins || 0) + (ranking?.losses || 0);
  const winRate = totalBattles > 0 ? Math.round(((ranking?.wins || 0) / totalBattles) * 100) : 0;
  const streak = ranking?.streak || 0;

  // Calculate attribute averages for progression visualization
  const attributeAverages = useMemo(() => {
    if (!attributes) return null;

    return {
      writing:
        (attributes.writing.lyricism +
          attributes.writing.wordplay +
          attributes.writing.creativity +
          attributes.writing.flow) /
        4,
      performance:
        (attributes.performance.stage_presence +
          attributes.performance.crowd_control +
          attributes.performance.delivery) /
        3,
      resilience: attributes.resilience,
    };
  }, [attributes]);

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#18191c] border-b-2 border-[#3a3d44] px-6 py-4">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
          <Icon name="chart" size={18} className="mr-2 -mt-1 inline-block" />CAREER STATISTICS
        </h3>
      </div>

      {/* Main Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Total Battles */}
          <div>
            <div className="text-4xl font-black text-white mb-1">{totalBattles}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Battles</div>
          </div>

          {/* Win Rate */}
          <div>
            <div className="text-4xl font-black text-[#ff8c42] mb-1">{winRate}%</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Win Rate</div>
          </div>

          {/* Current Streak */}
          <div>
            <div
              className="text-4xl font-black mb-1"
              style={{
                color: streak > 0 ? '#22c55e' : streak < 0 ? '#ef4444' : '#a1a1aa',
              }}
            >
              {streak > 0 ? 'W' : streak < 0 ? 'L' : ''}
              {Math.abs(streak)}
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Current Streak</div>
          </div>

          {/* Record */}
          <div>
            <div className="text-4xl font-black text-blue-500 mb-1">
              {ranking?.wins || 0}W-{ranking?.losses || 0}L
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Record</div>
          </div>
        </div>

        {/* Attribute Progression Chart */}
        {attributeAverages && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-4 font-bold">
              Attribute Progression
            </h4>
            <div className="space-y-4">
              {/* Writing */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-400 uppercase tracking-wide">
                    Writing
                  </span>
                  <span className="font-bold text-[#ff8c42]">
                    {attributeAverages.writing.toFixed(1)}/10
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                    style={{ width: `${(attributeAverages.writing / 10) * 100}%` }}
                  />
                </div>
                <div className="flex gap-3 mt-1">
                  <AttributeMicroBar label="LYR" value={attributes?.writing.lyricism || 0} />
                  <AttributeMicroBar label="WRD" value={attributes?.writing.wordplay || 0} />
                  <AttributeMicroBar label="CRV" value={attributes?.writing.creativity || 0} />
                  <AttributeMicroBar label="FLW" value={attributes?.writing.flow || 0} />
                </div>
              </div>

              {/* Performance */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-400 uppercase tracking-wide">
                    Performance
                  </span>
                  <span className="font-bold text-[#ff8c42]">
                    {attributeAverages.performance.toFixed(1)}/10
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${(attributeAverages.performance / 10) * 100}%` }}
                  />
                </div>
                <div className="flex gap-3 mt-1">
                  <AttributeMicroBar label="STG" value={attributes?.performance.stage_presence || 0} />
                  <AttributeMicroBar label="CWD" value={attributes?.performance.crowd_control || 0} />
                  <AttributeMicroBar label="DEL" value={attributes?.performance.delivery || 0} />
                </div>
              </div>

              {/* Resilience */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-400 uppercase tracking-wide">
                    Resilience
                  </span>
                  <span className="font-bold text-[#ff8c42]">
                    {attributeAverages.resilience.toFixed(1)}/10
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${(attributeAverages.resilience / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milestones */}
        <div className="mt-6 pt-6 border-t-2 border-[#3a3d44]">
          <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-bold">
            Career Milestones
          </h4>
          <div className="space-y-2">
            {/* 10 Battles */}
            {totalBattles >= 10 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-zinc-400">First 10 Battles</span>
              </div>
            )}

            {/* 50 Battles */}
            {totalBattles >= 50 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-zinc-400">Veteran (50 Battles)</span>
              </div>
            )}

            {/* 100 Battles */}
            {totalBattles >= 100 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-zinc-400">Century Club (100 Battles)</span>
              </div>
            )}

            {/* 70% Win Rate */}
            {totalBattles >= 20 && winRate >= 70 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-zinc-400">Elite Win Rate (70%+)</span>
              </div>
            )}

            {/* 5 Win Streak */}
            {streak >= 5 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-zinc-400">Hot Streak (5 Wins)</span>
              </div>
            )}

            {/* No milestones yet */}
            {totalBattles < 10 && (
              <div className="text-sm text-zinc-600 italic">
                Complete {10 - totalBattles} more {totalBattles < 9 ? 'battles' : 'battle'} to
                unlock your first milestone
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Micro attribute bar for detailed breakdown
 */
function AttributeMicroBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1">
      <div className="text-xs text-zinc-600 uppercase mb-0.5">{label}</div>
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-zinc-600"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}
