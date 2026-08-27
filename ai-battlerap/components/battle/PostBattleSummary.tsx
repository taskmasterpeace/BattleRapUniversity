'use client';

type AttributeChange = {
  attribute: string;
  category: 'writing' | 'performance' | 'personal';
  oldValue: number;
  newValue: number;
  change: number;
};

type ViewData = {
  total_views: number;
  view_tier: 'low' | 'mid' | 'top' | 'goat';
};

type FanGrowth = {
  fans_before: number;
  fans_after: number;
  fans_gained: number;
  trending_change: number;
};

type XPBreakdown = {
  base: number;
  winBonus: number;
  marginBonus: number;
  haymakerBonus: number;
  consistencyBonus: number;
  crowdBonus: number;
  milestoneBonus: number;
  total: number;
};

type LevelUpData = {
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  skillPointsEarned: number;
  xpEarned: number;
  xpBreakdown?: XPBreakdown;
};

type Props = {
  isVictory: boolean;
  attributeChanges: AttributeChange[];
  badgesEarned?: string[];
  stressChange: number;
  currentStress: number;
  ratingChange: number;
  viewData?: ViewData | null;
  fanGrowth?: FanGrowth | null;
  levelUpData?: LevelUpData | null;
};

export default function PostBattleSummary({
  isVictory,
  attributeChanges,
  badgesEarned = [],
  stressChange,
  currentStress,
  ratingChange,
  viewData = null,
  fanGrowth = null,
  levelUpData = null
}: Props) {
  // Attribute changes are shown to one decimal, so a real-but-tiny gain like +0.04
  // (common after a loss — progression halves the loser's gains) rounds to "+0.0"
  // and reads as a contradiction under "Improved Attributes". Only surface changes
  // that actually round to at least ±0.1.
  const SHOWN_DELTA = 0.05;
  const isGain = (c: AttributeChange) => c.change >= SHOWN_DELTA;
  const isLoss = (c: AttributeChange) => c.change <= -SHOWN_DELTA;
  const hasPositiveChanges = attributeChanges.some(isGain);
  const hasNegativeChanges = attributeChanges.some(isLoss);

  const VIEW_TIER_CONFIG = {
    low: { label: 'LOW', color: 'text-zinc-400', bgColor: 'bg-zinc-700/30' },
    mid: { label: 'MID', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
    top: { label: 'TOP', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
    goat: { label: 'GOAT', color: 'text-[#ff8c42]', bgColor: 'bg-[#ff8c42]/20' },
  };

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-8 space-y-6">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] pb-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42] mb-2">
          Post-Battle Summary
        </h2>
        <p className="text-sm text-zinc-500 uppercase tracking-wide">
          Your Performance Impact
        </p>
      </div>

      {/* Rating Change */}
      <div className={`p-4 border-2 rounded ${
        ratingChange > 0
          ? 'bg-green-500/10 border-green-500/30'
          : ratingChange < 0
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-zinc-800/50 border-[#3a3d44]'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">ELO Rating</span>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-black ${
              ratingChange > 0 ? 'text-green-500' : ratingChange < 0 ? 'text-red-500' : 'text-zinc-500'
            }`}>
              {ratingChange > 0 ? '+' : ''}{ratingChange}
            </span>
          </div>
        </div>
      </div>

      {/* XP Gained & Level-Up */}
      {levelUpData && (
        <div className="space-y-4">
          {/* Level-Up Celebration (if leveled up) */}
          {levelUpData.leveledUp && (
            <div className="p-6 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-2 border-[#ff8c42]/50 rounded-lg">
              <div className="text-center space-y-3">
                <div className="text-4xl">🎉</div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42]">
                  LEVEL UP!
                </h3>
                <div className="text-lg font-bold text-zinc-300">
                  Level {levelUpData.previousLevel} → Level {levelUpData.newLevel}
                </div>
                {levelUpData.skillPointsEarned > 0 && (
                  <div className="mt-4 p-4 bg-green-500/20 border-2 border-green-500/30 rounded">
                    <div className="text-sm uppercase tracking-wider text-green-500 font-bold mb-1">
                      Skill Points Earned
                    </div>
                    <div className="text-3xl font-black text-green-400">
                      +{levelUpData.skillPointsEarned}
                    </div>
                    <div className="text-xs text-zinc-400 mt-2">
                      Spend these in your dashboard to boost attributes!
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* XP Breakdown */}
          <div className="p-4 bg-[#ff8c42]/10 border-2 border-[#ff8c42]/30 rounded">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-[#ff8c42] font-bold">XP Earned</span>
              <span className="text-2xl font-black text-[#ff8c42]">
                +{levelUpData.xpEarned} XP
              </span>
            </div>

            {/* XP Sources Breakdown */}
            {levelUpData.xpBreakdown && (
              <div className="space-y-2 pt-3 border-t-2 border-[#ff8c42]/20">
                <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-2">
                  XP Sources
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {levelUpData.xpBreakdown.base > 0 && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Base Participation</span>
                      <span className="font-bold">+{levelUpData.xpBreakdown.base}</span>
                    </div>
                  )}
                  {levelUpData.xpBreakdown.winBonus > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Victory Bonus</span>
                      <span className="font-bold">+{levelUpData.xpBreakdown.winBonus}</span>
                    </div>
                  )}
                  {levelUpData.xpBreakdown.marginBonus > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Margin Bonus</span>
                      <span className="font-bold">+{levelUpData.xpBreakdown.marginBonus}</span>
                    </div>
                  )}
                  {levelUpData.xpBreakdown.haymakerBonus > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Haymaker Bonus</span>
                      <span className="font-bold">+{levelUpData.xpBreakdown.haymakerBonus}</span>
                    </div>
                  )}
                  {levelUpData.xpBreakdown.consistencyBonus > 0 && (
                    <div className="flex justify-between text-blue-400">
                      <span>Perfect Consistency</span>
                      <span className="font-bold">+{levelUpData.xpBreakdown.consistencyBonus}</span>
                    </div>
                  )}
                  {levelUpData.xpBreakdown.crowdBonus > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Dominant Crowd</span>
                      <span className="font-bold">+{levelUpData.xpBreakdown.crowdBonus}</span>
                    </div>
                  )}
                  {levelUpData.xpBreakdown.milestoneBonus > 0 && (
                    <div className="flex justify-between text-orange-400 col-span-2">
                      <span>🎖️ Career Milestone!</span>
                      <span className="font-bold">+{levelUpData.xpBreakdown.milestoneBonus}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Count & Fan Growth */}
      {(viewData || fanGrowth) && (
        <div className="grid grid-cols-2 gap-4">
          {/* Battle Views */}
          {viewData && (
            <div className="p-4 bg-zinc-800/50 border-2 border-[#3a3d44] rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Battle Views</span>
                <span className={`text-xs uppercase tracking-wide px-2 py-1 rounded ${VIEW_TIER_CONFIG[viewData.view_tier].bgColor} ${VIEW_TIER_CONFIG[viewData.view_tier].color} font-bold border-2 border-current/30`}>
                  {VIEW_TIER_CONFIG[viewData.view_tier].label}
                </span>
              </div>
              <div className="text-2xl font-black text-[#ff8c42]">
                {viewData.total_views.toLocaleString()}
              </div>
            </div>
          )}

          {/* Fan Growth */}
          {fanGrowth && (
            <div className={`p-4 border-2 rounded ${
              fanGrowth.fans_gained > 0
                ? 'bg-green-500/10 border-green-500/30'
                : fanGrowth.fans_gained < 0
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-zinc-800/50 border-[#3a3d44]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">New Fans</span>
                <span className={`text-sm font-bold ${
                  fanGrowth.fans_gained > 0 ? 'text-green-500' : fanGrowth.fans_gained < 0 ? 'text-red-500' : 'text-zinc-500'
                }`}>
                  {fanGrowth.fans_gained > 0 ? '+' : ''}{fanGrowth.fans_gained.toLocaleString()}
                </span>
              </div>
              <div className="text-lg font-bold text-zinc-300">
                {fanGrowth.fans_after.toLocaleString()} total fans
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attribute Changes */}
      {hasPositiveChanges && (
        <div className="space-y-3">
          <h3 className="text-sm font-display font-black uppercase tracking-wider text-green-500">
            ✓ Improved Attributes
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {attributeChanges.filter(isGain).map((change, index) => (
              <div key={index} className="p-3 bg-green-500/5 border-2 border-green-500/20 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-zinc-400 font-bold">
                    {change.attribute}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-green-500 font-bold">
                    +{change.change.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500">{change.oldValue.toFixed(1)}</span>
                  <span className="text-green-500">→</span>
                  <span className="text-sm font-bold text-green-400">{change.newValue.toFixed(1)}</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                    style={{ width: `${(change.newValue / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attribute Decreases */}
      {hasNegativeChanges && (
        <div className="space-y-3">
          <h3 className="text-sm font-display font-black uppercase tracking-wider text-red-500">
            ⚠ Decreased Attributes
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {attributeChanges.filter(isLoss).map((change, index) => (
              <div key={index} className="p-3 bg-red-500/5 border-2 border-red-500/20 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-zinc-400 font-bold">
                    {change.attribute}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-red-500 font-bold">
                    {change.change.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500">{change.oldValue.toFixed(1)}</span>
                  <span className="text-red-500">→</span>
                  <span className="text-sm font-bold text-red-400">{change.newValue.toFixed(1)}</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                    style={{ width: `${(change.newValue / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges Earned */}
      {badgesEarned.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-display font-black uppercase tracking-wider text-yellow-500">
            🏆 Badges Earned
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {badgesEarned.map((badge, index) => (
              <div key={index} className="p-3 bg-yellow-500/10 border-2 border-yellow-500/30 rounded">
                <span className="text-sm font-bold text-yellow-400 uppercase tracking-wide">
                  {badge.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stress Change */}
      <div className={`p-4 border-2 rounded ${
        stressChange > 0
          ? 'bg-red-500/10 border-red-500/30'
          : stressChange < 0
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-zinc-800/50 border-[#3a3d44]'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Stress Level</span>
          <div className="flex items-center gap-3">
            {stressChange !== 0 && (
              <span className={`text-sm font-bold ${
                stressChange > 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {stressChange > 0 ? '+' : ''}{stressChange}
              </span>
            )}
            <span className="text-xl font-black text-[#ff8c42]">{currentStress}/100</span>
          </div>
        </div>
        {currentStress >= 50 && (
          <p className="text-xs text-red-400 mt-2 italic">
            ⚠ Your stress is building. Consider taking rest days.
          </p>
        )}
      </div>

      {/* Motivational Message */}
      <div className="pt-4 border-t-2 border-[#3a3d44]">
        {isVictory ? (
          <div className="space-y-2">
            <p className="text-lg font-bold text-green-400 uppercase tracking-wide">
              🔥 Victory Secured
            </p>
            <p className="text-sm text-zinc-400 italic">
              {hasPositiveChanges
                ? 'Your skills are improving. Keep this momentum going.'
                : 'A win is a win, but there\'s still room to grow.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-bold text-red-400 uppercase tracking-wide">
              Defeat - But Not The End
            </p>
            <p className="text-sm text-zinc-400 italic">
              {hasPositiveChanges
                ? 'You lost, but you still learned something. Use this experience.'
                : 'Losses are part of the game. Analyze what went wrong and come back stronger.'}
            </p>
          </div>
        )}
      </div>

      {/* No Changes Message */}
      {!hasPositiveChanges && !hasNegativeChanges && badgesEarned.length === 0 && (
        <div className="p-4 bg-zinc-800/50 border-2 border-[#3a3d44] rounded text-center">
          <p className="text-sm text-zinc-500 italic">
            No significant attribute changes this battle.
          </p>
        </div>
      )}
    </div>
  );
}
