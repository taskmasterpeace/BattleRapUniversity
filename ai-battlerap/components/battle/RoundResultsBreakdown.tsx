'use client';

import { BattleRound, BattleSegment } from '@/lib/models';
import {
  ContentType,
  DeliveryType,
  PerformanceType,
  getContentType,
  getDeliveryType,
  getPerformanceType,
} from '@/lib/game/contentTypes';

interface RoundResultsBreakdownProps {
  playerRound: BattleRound & {
    contentSelection?: {
      content_types: string[];
      delivery_types: string[];
      performance_types: string[];
    };
  };
  aiRound: BattleRound & {
    contentSelection?: {
      content_types: string[];
      delivery_types: string[];
      performance_types: string[];
    };
  };
  playerSegments: BattleSegment[];
  aiSegments: BattleSegment[];
  winner: 'player' | 'ai' | 'tie';
  playerName: string;
  aiName: string;
}

export function RoundResultsBreakdown({
  playerRound,
  aiRound,
  playerSegments,
  aiSegments,
  winner,
  playerName,
  aiName,
}: RoundResultsBreakdownProps) {
  const getWinnerColor = () => {
    if (winner === 'player') return 'text-green-500';
    if (winner === 'ai') return 'text-red-500';
    return 'text-yellow-500';
  };

  const getWinnerBg = () => {
    if (winner === 'player') return 'bg-green-900/30 border-green-600';
    if (winner === 'ai') return 'bg-red-900/30 border-red-600';
    return 'bg-yellow-900/30 border-yellow-600';
  };

  const getWinnerText = () => {
    if (winner === 'player') return `${playerName} WINS`;
    if (winner === 'ai') return `${aiName} WINS`;
    return 'TIE ROUND';
  };

  const getMultiplierColor = (value?: number) => {
    if (!value) return 'text-zinc-400';
    if (value >= 1.5) return 'text-green-500';
    if (value >= 1.2) return 'text-green-400';
    if (value >= 0.9) return 'text-zinc-300';
    if (value >= 0.7) return 'text-orange-400';
    return 'text-red-500';
  };

  const formatTypeName = (typeId: string): string => {
    // Try each type getter
    try {
      const contentDef = getContentType(typeId as ContentType);
      if (contentDef) return contentDef.name;
    } catch {}

    try {
      const deliveryDef = getDeliveryType(typeId as DeliveryType);
      if (deliveryDef) return deliveryDef.name;
    } catch {}

    try {
      const performanceDef = getPerformanceType(typeId as PerformanceType);
      if (performanceDef) return performanceDef.name;
    } catch {}

    return typeId.replace(/_/g, ' ');
  };

  // Segment scores live on a ~0-15 scale, NOT 0-100. Scale the bars to the round's
  // actual top score (with a little headroom) so they read as real bars instead of
  // the tiny stubs you get from dividing a 6 by 100.
  const allScores = [
    ...playerSegments.map((s) => s.segment_score),
    ...aiSegments.map((s) => s.segment_score),
  ];
  const maxScore = Math.max(...allScores, 1) * 1.05;

  // The headline moment of a segment (haymaker > choke > stumble), attributed to
  // the segment WINNER first — when both swing, the room remembers the one that
  // landed. Choke/stumble are checked on either battler.
  const segEvent = (
    pFlags: string[] = [],
    aFlags: string[] = [],
    playerWon = true
  ): { label: string; cls: string } | null => {
    const ordered: { flags: string[]; name: string }[] = playerWon
      ? [{ flags: pFlags, name: playerName }, { flags: aFlags, name: aiName }]
      : [{ flags: aFlags, name: aiName }, { flags: pFlags, name: playerName }];
    for (const { flags, name } of ordered) {
      if (flags.includes('haymaker')) return { label: `★ ${name} HAYMAKER`, cls: 'bg-yellow-300 text-black' };
    }
    for (const { flags, name } of ordered) {
      if (flags.includes('choke')) return { label: `✗ ${name} CHOKED`, cls: 'bg-red-600 text-white' };
    }
    if (pFlags.includes('stumble') || aFlags.includes('stumble')) return { label: 'STUMBLE', cls: 'bg-zinc-700 text-zinc-300' };
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Winner Banner */}
      <div className={`p-6 border-2 ${getWinnerBg()} text-center`}>
        <div className={`text-4xl font-display font-black uppercase tracking-tighter ${getWinnerColor()} mb-1`}>
          {getWinnerText()}
        </div>
        <div className="text-zinc-400 text-sm font-display font-bold uppercase tracking-wider">
          {winner === 'player' && 'You took this round'}
          {winner === 'ai' && 'Your opponent took this round'}
          {winner === 'tie' && 'Neither battler could secure the round'}
        </div>
      </div>

      {/* Segment Timeline */}
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        <h3 className="text-lg font-display font-black uppercase tracking-wider text-white mb-4">
          The Segments
        </h3>

        <div className="space-y-4">
          {playerSegments.map((playerSeg, idx) => {
            const aiSeg = aiSegments[idx];
            const aiScore = aiSeg?.segment_score ?? 0;
            // min 4% so even a low score shows a visible nub
            const playerWidth = Math.max(4, (playerSeg.segment_score / maxScore) * 100);
            const aiWidth = aiSeg ? Math.max(4, (aiScore / maxScore) * 100) : 0;
            const playerWon = playerSeg.segment_score >= aiScore;
            const event = segEvent(playerSeg.event_flags, aiSeg?.event_flags, playerWon);

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-display font-black uppercase tracking-widest text-zinc-500">
                    Segment {idx + 1}
                  </span>
                  {event && (
                    <span className={`px-2 py-0.5 text-[9px] font-display font-black uppercase tracking-widest ${event.cls}`}>
                      {event.label}
                    </span>
                  )}
                  <span className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-500 tabular-nums">
                    {playerSeg.segment_score.toFixed(1)} · {aiScore.toFixed(1)}
                  </span>
                </div>

                {/* Player bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-display font-bold uppercase tracking-wide text-zinc-400 w-20 shrink-0 truncate">
                    {playerName}
                  </span>
                  <div className="flex-1 bg-[#18191c] h-7 border border-[#3a3d44] overflow-hidden">
                    <div
                      className={`h-full transition-all ${playerWon ? 'bg-[#ff8c42]' : 'bg-[#ff8c42]/30'}`}
                      style={{ width: `${playerWidth}%` }}
                    />
                  </div>
                  <span className={`w-11 text-right text-sm font-display font-black tabular-nums ${playerWon ? 'text-[#ff8c42]' : 'text-zinc-500'}`}>
                    {playerSeg.segment_score.toFixed(1)}
                  </span>
                </div>

                {/* AI bar */}
                {aiSeg && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-display font-bold uppercase tracking-wide text-zinc-400 w-20 shrink-0 truncate">
                      {aiName}
                    </span>
                    <div className="flex-1 bg-[#18191c] h-7 border border-[#3a3d44] overflow-hidden">
                      <div
                        className={`h-full transition-all ${!playerWon ? 'bg-zinc-300' : 'bg-zinc-600'}`}
                        style={{ width: `${aiWidth}%` }}
                      />
                    </div>
                    <span className={`w-11 text-right text-sm font-display font-black tabular-nums ${!playerWon ? 'text-zinc-200' : 'text-zinc-500'}`}>
                      {aiScore.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Comparison */}
      <div className="grid grid-cols-2 gap-6">
        {/* Player Stats */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
          <h3 className="text-lg font-display font-black uppercase tracking-wider text-white mb-4">{playerName}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Average Score</span>
              <span className="text-xl font-bold text-[#ff8c42]">
                {playerRound.average_score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Peak Score</span>
              <span className="text-xl font-bold text-green-400">
                {playerRound.peak_score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Consistency</span>
              <span className="text-xl font-bold text-amber-400">
                {playerRound.consistency_score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Crowd Reaction</span>
              <span className="text-xl font-bold text-orange-400">
                {playerRound.crowd_reaction.toFixed(0)}
              </span>
            </div>
            {playerRound.choked && (
              <div className="mt-2 p-2 bg-red-900/30 border-2 border-red-700 rounded text-center">
                <span className="text-xs text-red-400 font-semibold">CHOKED</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Stats */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
          <h3 className="text-lg font-display font-black uppercase tracking-wider text-white mb-4">{aiName}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Average Score</span>
              <span className="text-xl font-bold text-[#ff8c42]">
                {aiRound.average_score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Peak Score</span>
              <span className="text-xl font-bold text-green-400">
                {aiRound.peak_score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Consistency</span>
              <span className="text-xl font-bold text-amber-400">
                {aiRound.consistency_score.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Crowd Reaction</span>
              <span className="text-xl font-bold text-orange-400">
                {aiRound.crowd_reaction.toFixed(0)}
              </span>
            </div>
            {aiRound.choked && (
              <div className="mt-2 p-2 bg-red-900/30 border-2 border-red-700 rounded text-center">
                <span className="text-xs text-red-400 font-semibold">CHOKED</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Effectiveness Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        {/* Player Content */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
          <h3 className="text-lg font-display font-black uppercase tracking-wider text-white mb-4">Your Content Effectiveness</h3>

          {playerRound.contentSelection && (
            <div className="space-y-4">
              {/* Content Types */}
              <div>
                <div className="text-xs text-zinc-400 mb-2">Content Types</div>
                <div className="flex flex-wrap gap-1">
                  {playerRound.contentSelection.content_types?.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded"
                    >
                      {formatTypeName(type)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Delivery Types */}
              <div>
                <div className="text-xs text-zinc-400 mb-2">Delivery Types</div>
                <div className="flex flex-wrap gap-1">
                  {playerRound.contentSelection.delivery_types?.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded"
                    >
                      {formatTypeName(type)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Types */}
              <div>
                <div className="text-xs text-zinc-400 mb-2">Performance Types</div>
                <div className="flex flex-wrap gap-1">
                  {playerRound.contentSelection.performance_types?.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded"
                    >
                      {formatTypeName(type)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Multipliers */}
              <div className="pt-4 border-t-2 border-[#3a3d44] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Effectiveness</span>
                  <span
                    className={`text-sm font-bold ${getMultiplierColor(
                      playerRound.effectiveness_multiplier
                    )}`}
                  >
                    {playerRound.effectiveness_multiplier?.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Crowd Preference</span>
                  <span
                    className={`text-sm font-bold ${getMultiplierColor(
                      playerRound.crowd_preference_multiplier
                    )}`}
                  >
                    {playerRound.crowd_preference_multiplier?.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Context Modifier</span>
                  <span
                    className={`text-sm font-bold ${getMultiplierColor(
                      playerRound.context_modifier
                    )}`}
                  >
                    {playerRound.context_modifier?.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-[#3a3d44]">
                  <span className="text-sm text-white font-semibold">Final Multiplier</span>
                  <span
                    className={`text-lg font-bold ${getMultiplierColor(
                      playerRound.final_multiplier
                    )}`}
                  >
                    {playerRound.final_multiplier?.toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>
          )}

          {!playerRound.contentSelection && (
            <div className="text-sm text-zinc-400 text-center py-4">
              No content data available
            </div>
          )}
        </div>

        {/* AI Content */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
          <h3 className="text-lg font-display font-black uppercase tracking-wider text-white mb-4">Opponent's Content Effectiveness</h3>

          {aiRound.contentSelection && (
            <div className="space-y-4">
              {/* Content Types */}
              <div>
                <div className="text-xs text-zinc-400 mb-2">Content Types</div>
                <div className="flex flex-wrap gap-1">
                  {aiRound.contentSelection.content_types?.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded"
                    >
                      {formatTypeName(type)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Delivery Types */}
              <div>
                <div className="text-xs text-zinc-400 mb-2">Delivery Types</div>
                <div className="flex flex-wrap gap-1">
                  {aiRound.contentSelection.delivery_types?.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded"
                    >
                      {formatTypeName(type)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Types */}
              <div>
                <div className="text-xs text-zinc-400 mb-2">Performance Types</div>
                <div className="flex flex-wrap gap-1">
                  {aiRound.contentSelection.performance_types?.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded"
                    >
                      {formatTypeName(type)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Multipliers */}
              <div className="pt-4 border-t-2 border-[#3a3d44] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Effectiveness</span>
                  <span
                    className={`text-sm font-bold ${getMultiplierColor(
                      aiRound.effectiveness_multiplier
                    )}`}
                  >
                    {aiRound.effectiveness_multiplier?.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Crowd Preference</span>
                  <span
                    className={`text-sm font-bold ${getMultiplierColor(
                      aiRound.crowd_preference_multiplier
                    )}`}
                  >
                    {aiRound.crowd_preference_multiplier?.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Context Modifier</span>
                  <span
                    className={`text-sm font-bold ${getMultiplierColor(aiRound.context_modifier)}`}
                  >
                    {aiRound.context_modifier?.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-[#3a3d44]">
                  <span className="text-sm text-white font-semibold">Final Multiplier</span>
                  <span
                    className={`text-lg font-bold ${getMultiplierColor(aiRound.final_multiplier)}`}
                  >
                    {aiRound.final_multiplier?.toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>
          )}

          {!aiRound.contentSelection && (
            <div className="text-sm text-zinc-400 text-center py-4">
              No content data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
