'use client';

import { detectArchetype, getBadgeSynergies, getBadgeConflicts } from '@/lib/game/badgeDescriptions';

type Props = {
  badges: string[];
  showDetails?: boolean;
};

const archetypeColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  'Technical Writer': {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: '📝'
  },
  'Freestyler': {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    icon: '⚡'
  },
  'Performance Beast': {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: '🔥'
  },
  'Angle Master': {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: '🎯'
  },
  'Haymaker Artist': {
    bg: 'bg-[#ff8c42]/10',
    border: 'border-[#ff8c42]/30',
    text: 'text-orange-400',
    icon: '💥'
  },
  'Consistent Grinder': {
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    text: 'text-zinc-400',
    icon: '⚙️'
  },
  'Viral Star': {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    icon: '🌟'
  },
  'Balanced Battler': {
    bg: 'bg-zinc-600/10',
    border: 'border-zinc-600/30',
    text: 'text-zinc-300',
    icon: '⚖️'
  }
};

export default function ArchetypeDisplay({ badges, showDetails = true }: Props) {
  const archetype = detectArchetype(badges);
  const synergies = getBadgeSynergies(badges);
  const conflicts = getBadgeConflicts(badges);

  const colors = archetypeColors[archetype.archetype] || archetypeColors['Balanced Battler'];

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4`}>
      {/* Archetype Header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{colors.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-black text-lg ${colors.text} uppercase tracking-tight`}>
              {archetype.archetype}
            </h3>
            <span className="px-2 py-0.5 bg-[#2d2f35] border-2 border-[#3a3d44] text-zinc-500 text-xs uppercase tracking-wide rounded">
              Your Archetype
            </span>
          </div>
          <p className="text-sm text-zinc-400 italic">
            {archetype.description}
          </p>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Playstyle Tip */}
          <div className="mb-3 p-3 bg-[#2d2f35]/50 border-2 border-[#3a3d44] rounded">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">
              Optimal Playstyle:
            </p>
            <p className="text-sm text-zinc-300">
              {archetype.playstyle}
            </p>
          </div>

          {/* Synergies */}
          {synergies.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-green-500 uppercase tracking-wider font-bold mb-2">
                ✓ Active Synergies ({synergies.length}):
              </p>
              <div className="space-y-1">
                {synergies.map((synergy, index) => (
                  <div key={index} className="flex items-start gap-2 px-3 py-1.5 bg-green-500/5 border-2 border-green-500/20 rounded">
                    <span className="text-green-500 text-xs mt-0.5">+</span>
                    <p className="text-xs text-green-400">{synergy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div>
              <p className="text-xs text-red-500 uppercase tracking-wider font-bold mb-2">
                ⚠ Badge Conflicts ({conflicts.length}):
              </p>
              <div className="space-y-1">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="flex items-start gap-2 px-3 py-1.5 bg-red-500/5 border-2 border-red-500/20 rounded">
                    <span className="text-red-500 text-xs mt-0.5">−</span>
                    <p className="text-xs text-red-400">{conflict}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
