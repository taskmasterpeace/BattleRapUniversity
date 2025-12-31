/**
 * TournamentAchievements Widget
 * Displays tournament achievements with unlock status and progress
 */

'use client';

import { useState } from 'react';
import {
  TOURNAMENT_ACHIEVEMENTS,
  TournamentPlayerStats,
  checkTournamentAchievements,
  getAchievementProgress,
  sortAchievements,
} from '@/lib/game/tournamentAchievements';

interface TournamentAchievementsProps {
  stats: TournamentPlayerStats;
}

export default function TournamentAchievements({ stats }: TournamentAchievementsProps) {
  const [selectedTier, setSelectedTier] = useState<string>('all');

  // Get unlocked achievements
  const unlockedIds = checkTournamentAchievements(stats);

  // Get all achievement IDs
  const allAchievementIds = Object.keys(TOURNAMENT_ACHIEVEMENTS);

  // Filter by tier
  const filteredIds = selectedTier === 'all'
    ? allAchievementIds
    : allAchievementIds.filter(id => TOURNAMENT_ACHIEVEMENTS[id].tier === selectedTier);

  // Sort achievements
  const sortedAchievements = sortAchievements(filteredIds, unlockedIds);

  const tierCounts = {
    all: allAchievementIds.length,
    platinum: allAchievementIds.filter(id => TOURNAMENT_ACHIEVEMENTS[id].tier === 'platinum').length,
    gold: allAchievementIds.filter(id => TOURNAMENT_ACHIEVEMENTS[id].tier === 'gold').length,
    silver: allAchievementIds.filter(id => TOURNAMENT_ACHIEVEMENTS[id].tier === 'silver').length,
    bronze: allAchievementIds.filter(id => TOURNAMENT_ACHIEVEMENTS[id].tier === 'bronze').length,
  };

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter text-[#ff8c42]">
          Tournament Achievements
        </h2>
        <div className="text-sm text-zinc-400">
          <span className="text-zinc-100 font-bold">{unlockedIds.length}</span> / {allAchievementIds.length} Unlocked
        </div>
      </div>

      {/* Tier Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedTier('all')}
          className={`px-3 py-1.5 rounded text-xs font-display font-black uppercase tracking-wide transition-colors ${
            selectedTier === 'all'
              ? 'bg-[#ff8c42] text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          All ({tierCounts.all})
        </button>
        <button
          onClick={() => setSelectedTier('platinum')}
          className={`px-3 py-1.5 rounded text-xs font-display font-black uppercase tracking-wide transition-colors ${
            selectedTier === 'platinum'
              ? 'bg-cyan-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          💎 Platinum ({tierCounts.platinum})
        </button>
        <button
          onClick={() => setSelectedTier('gold')}
          className={`px-3 py-1.5 rounded text-xs font-display font-black uppercase tracking-wide transition-colors ${
            selectedTier === 'gold'
              ? 'bg-yellow-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          🥇 Gold ({tierCounts.gold})
        </button>
        <button
          onClick={() => setSelectedTier('silver')}
          className={`px-3 py-1.5 rounded text-xs font-display font-black uppercase tracking-wide transition-colors ${
            selectedTier === 'silver'
              ? 'bg-gray-400 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          🥈 Silver ({tierCounts.silver})
        </button>
        <button
          onClick={() => setSelectedTier('bronze')}
          className={`px-3 py-1.5 rounded text-xs font-display font-black uppercase tracking-wide transition-colors ${
            selectedTier === 'bronze'
              ? 'bg-orange-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          🥉 Bronze ({tierCounts.bronze})
        </button>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAchievements.map(achievement => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          const progress = getAchievementProgress(achievement.id, stats);

          return (
            <div
              key={achievement.id}
              className={`relative border-2 rounded-lg p-4 transition-all ${
                isUnlocked
                  ? 'bg-[#18191c] border-[#ff8c42]/50 hover:border-[#ff8c42]'
                  : 'bg-[#18191c]/50 border-[#3a3d44] opacity-60'
              }`}
            >
              {/* Icon */}
              <div className="text-3xl mb-2">{achievement.icon}</div>

              {/* Title */}
              <div className={`text-sm font-black uppercase tracking-tight mb-1 ${
                isUnlocked ? 'text-zinc-100' : 'text-zinc-500'
              }`}>
                {achievement.name}
              </div>

              {/* Description */}
              <div className="text-xs text-zinc-400 mb-2">
                {achievement.description}
              </div>

              {/* Tier Badge */}
              {achievement.tier && (
                <div className={`inline-block px-2 py-0.5 rounded text-xs font-display font-black uppercase mb-2 ${
                  achievement.tier === 'platinum'
                    ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/30'
                    : achievement.tier === 'gold'
                    ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/30'
                    : achievement.tier === 'silver'
                    ? 'bg-gray-400/20 text-gray-400 border-2 border-gray-400/30'
                    : 'bg-orange-600/20 text-orange-400 border-2 border-orange-600/30'
                }`}>
                  {achievement.tier}
                </div>
              )}

              {/* Badge Unlock */}
              {achievement.badge && (
                <div className="text-xs text-green-500 mb-2">
                  🎖️ Unlocks: <span className="font-bold">{achievement.badge}</span>
                </div>
              )}

              {/* Progress Bar */}
              {!isUnlocked && progress && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>Progress</span>
                    <span>{progress.current} / {progress.required}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff8c42] transition-all"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Unlocked Badge */}
              {isUnlocked && (
                <div className="absolute top-2 right-2 bg-green-500/20 text-green-500 border-2 border-green-500/30 px-2 py-1 rounded text-xs font-display font-black uppercase">
                  ✓ Unlocked
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedAchievements.length === 0 && (
        <div className="text-center text-zinc-500 py-8">
          No achievements in this tier yet.
        </div>
      )}
    </div>
  );
}
