'use client';

/**
 * CrowdReactionStrip — layered per-round crowd reactions across the three
 * fan demographics (PEN HEADS / THE LADIES / THE BLOCK). One representative
 * crowd member per lane per battler, with a reaction level derived
 * deterministically from real round data (see lib/game/crowdLanes.ts for
 * the mapping documentation).
 */

import { useState } from 'react';
import {
  deriveLaneReactions,
  REACTION_DISPLAY,
  type LaneResult,
  type LeagueRaceDemographics,
} from '@/lib/game/crowdLanes';

type RoundData = {
  crowd_reaction: number;
  peak_score: number;
  choked: boolean;
};

type Props = {
  battleId: string;
  roundIndex: number;
  playerName: string;
  opponentName: string;
  playerId: string;
  opponentId: string;
  playerRound: RoundData;
  opponentRound: RoundData;
  playerStyleTags: string[];
  opponentStyleTags: string[];
  writingWeight: number;
  performanceWeight: number;
  raceDemographics?: LeagueRaceDemographics;
};

function CrowdFace({ result, mirror = false }: { result: LaneResult; mirror?: boolean }) {
  const [err, setErr] = useState(false);
  const display = REACTION_DISPLAY[result.reaction];
  return (
    <div className={`flex items-center gap-2 ${mirror ? 'flex-row-reverse' : ''}`}>
      <div
        className="relative w-12 h-12 shrink-0 bg-[#18191c] border-2 border-[#3a3d44] overflow-hidden"
        title={`${result.lane.name}: ${display.label} (${result.score}/100)`}
      >
        {err ? (
          <div className="w-full h-full flex items-center justify-center text-xl">{display.emoji}</div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.sprite}
            alt={`${result.lane.name} crowd member — ${display.label}`}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
            onError={() => setErr(true)}
          />
        )}
      </div>
      <div className={`leading-tight ${mirror ? 'text-right' : ''}`}>
        <div className="text-base">{display.emoji}</div>
        <div className={`text-[10px] font-mono uppercase tracking-widest ${display.tone}`}>
          {display.label}
        </div>
      </div>
    </div>
  );
}

export default function CrowdReactionStrip({
  battleId,
  roundIndex,
  playerName,
  opponentName,
  playerId,
  opponentId,
  playerRound,
  opponentRound,
  playerStyleTags,
  opponentStyleTags,
  writingWeight,
  performanceWeight,
  raceDemographics,
}: Props) {
  const baseInput = { battleId, roundIndex, writingWeight, performanceWeight };

  const playerLanes = deriveLaneReactions(
    {
      ...baseInput,
      battlerId: playerId,
      crowdReaction: playerRound.crowd_reaction,
      peakScore: playerRound.peak_score,
      choked: playerRound.choked,
      styleTags: playerStyleTags,
    },
    raceDemographics
  );

  const opponentLanes = deriveLaneReactions(
    {
      ...baseInput,
      battlerId: opponentId,
      crowdReaction: opponentRound.crowd_reaction,
      peakScore: opponentRound.peak_score,
      choked: opponentRound.choked,
      styleTags: opponentStyleTags,
    },
    raceDemographics
  );

  return (
    <div className="bg-[#101114] border-2 border-[#3a3d44] p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-lg font-display font-black uppercase tracking-tighter text-[#ff8c42]">
          CROWD REACTION
        </h3>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          ROUND {roundIndex} · 3 SECTIONS OF THE ROOM
        </span>
      </div>

      {/* column headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-2">
        <div className="text-xs font-display font-black uppercase tracking-wider text-zinc-300 truncate">
          {playerName}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 px-2">VS</div>
        <div className="text-xs font-display font-black uppercase tracking-wider text-zinc-300 truncate text-right">
          {opponentName}
        </div>
      </div>

      <div className="divide-y-2 divide-[#3a3d44]/50 border-t-2 border-b-2 border-[#3a3d44]/50">
        {playerLanes.map((pl, i) => (
          <div key={pl.lane.id} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-2">
            <CrowdFace result={pl} />
            <div className="text-center px-1 min-w-[88px]" title={pl.lane.blurb}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                {pl.lane.name}
              </div>
            </div>
            <div className="flex justify-end">
              <CrowdFace result={opponentLanes[i]} mirror />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
        🔥 LOVED IT · 😐 MIXED · 🧊 COLD — per demographic, from crowd score + style matchup
      </p>
    </div>
  );
}
