'use client';

/**
 * TaleOfTheTape — head-to-head attribute comparison.
 *
 * Shows ONLY the league-relevant attribute group by default (writing-weighted
 * league → writing stats; performance-weighted league → performance stats).
 * Everything else lives behind the FULL SHEET expandable.
 */

import { useState } from 'react';

type AttrGroup = {
  writing: { lyricism: number; wordplay: number; creativity: number; flow: number };
  performance: { stage_presence: number; crowd_control: number; delivery: number };
  personal: {
    resilience: number;
    preparation: number;
    financial_stability: number;
    family_bond: number;
    reputation: number;
  };
};

type Props = {
  playerName: string;
  opponentName: string;
  playerAttributes: AttrGroup;
  opponentAttributes: AttrGroup;
  writingWeight: number;
  performanceWeight: number;
};

type StatRow = { label: string; player: number; opponent: number };

/** drop rows where neither battler has the stat tracked (both 0/undefined) */
function tracked(rows: StatRow[]): StatRow[] {
  return rows.filter((r) => (r.player ?? 0) > 0 || (r.opponent ?? 0) > 0);
}

function buildRows(
  category: 'writing' | 'performance' | 'personal',
  player: AttrGroup,
  opponent: AttrGroup
): StatRow[] {
  if (category === 'writing') {
    return [
      { label: 'LYRICISM', player: player.writing.lyricism, opponent: opponent.writing.lyricism },
      { label: 'WORDPLAY', player: player.writing.wordplay, opponent: opponent.writing.wordplay },
      { label: 'CREATIVITY', player: player.writing.creativity, opponent: opponent.writing.creativity },
      { label: 'FLOW', player: player.writing.flow, opponent: opponent.writing.flow },
    ];
  }
  if (category === 'performance') {
    return [
      { label: 'STAGE PRESENCE', player: player.performance.stage_presence, opponent: opponent.performance.stage_presence },
      { label: 'CROWD CONTROL', player: player.performance.crowd_control, opponent: opponent.performance.crowd_control },
      { label: 'DELIVERY', player: player.performance.delivery, opponent: opponent.performance.delivery },
    ];
  }
  return [
    { label: 'RESILIENCE', player: player.personal.resilience, opponent: opponent.personal.resilience },
    { label: 'PREPARATION', player: player.personal.preparation, opponent: opponent.personal.preparation },
    { label: 'REPUTATION', player: player.personal.reputation, opponent: opponent.personal.reputation },
  ];
}

function MirrorRow({ row }: { row: StatRow }) {
  const playerWins = row.player > row.opponent;
  const oppWins = row.opponent > row.player;
  return (
    <div className="py-1.5">
      <div className="grid grid-cols-[2.5rem_1fr_auto_1fr_2.5rem] items-center gap-2">
        <span
          className={`text-sm font-display font-black tabular-nums ${
            playerWins ? 'text-[#ff8c42]' : 'text-zinc-400'
          }`}
        >
          {row.player.toFixed(1)}
        </span>
        {/* player bar grows right→left */}
        <div className="h-2 bg-[#18191c] border border-[#3a3d44] flex justify-end">
          <div
            className={`h-full ${playerWins ? 'bg-[#ff8c42]' : 'bg-zinc-600'}`}
            style={{ width: `${Math.min(100, (row.player / 10) * 100)}%` }}
          />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-center min-w-[92px]">
          {row.label}
        </span>
        {/* opponent bar grows left→right */}
        <div className="h-2 bg-[#18191c] border border-[#3a3d44]">
          <div
            className={`h-full ${oppWins ? 'bg-red-400' : 'bg-zinc-600'}`}
            style={{ width: `${Math.min(100, (row.opponent / 10) * 100)}%` }}
          />
        </div>
        <span
          className={`text-sm font-display font-black tabular-nums text-right ${
            oppWins ? 'text-red-400' : 'text-zinc-400'
          }`}
        >
          {row.opponent.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

export default function TaleOfTheTape({
  playerName,
  opponentName,
  playerAttributes,
  opponentAttributes,
  writingWeight,
  performanceWeight,
}: Props) {
  const [fullSheet, setFullSheet] = useState(false);

  const writingLeague = writingWeight >= performanceWeight;
  const primary: 'writing' | 'performance' = writingLeague ? 'writing' : 'performance';
  const secondary: 'writing' | 'performance' = writingLeague ? 'performance' : 'writing';

  const primaryRows = tracked(buildRows(primary, playerAttributes, opponentAttributes));
  const secondaryRows = tracked(buildRows(secondary, playerAttributes, opponentAttributes));
  const personalRows = tracked(buildRows('personal', playerAttributes, opponentAttributes));

  const weightLabel = (cat: 'writing' | 'performance') =>
    cat === 'writing'
      ? `WRITING · ${(writingWeight * 100).toFixed(0)}% OF SCORING`
      : `PERFORMANCE · ${(performanceWeight * 100).toFixed(0)}% OF SCORING`;

  return (
    <div className="bg-[#101114] border-2 border-[#3a3d44] p-4">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-lg font-display font-black uppercase tracking-tighter text-[#ff8c42]">
          TALE OF THE TAPE
        </h3>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          {writingLeague ? 'PEN LEAGUE' : 'STAGE LEAGUE'}
        </span>
      </div>

      {/* names */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-2">
        <div className="text-xs font-display font-black uppercase tracking-wider text-zinc-300 truncate">
          {playerName}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">VS</div>
        <div className="text-xs font-display font-black uppercase tracking-wider text-zinc-300 truncate text-right">
          {opponentName}
        </div>
      </div>

      {/* league-relevant attributes (always visible) */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-[#ff8c42]/80 border-b border-[#3a3d44] pb-1 mb-1">
        {weightLabel(primary)}
      </div>
      <div className="divide-y divide-[#3a3d44]/40">
        {primaryRows.map((row) => (
          <MirrorRow key={row.label} row={row} />
        ))}
      </div>

      {/* full sheet behind expandable */}
      {fullSheet && (
        <>
          <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500 border-b border-[#3a3d44] pb-1 mb-1">
            {weightLabel(secondary)}
          </div>
          <div className="divide-y divide-[#3a3d44]/40">
            {secondaryRows.map((row) => (
              <MirrorRow key={row.label} row={row} />
            ))}
          </div>

          <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500 border-b border-[#3a3d44] pb-1 mb-1">
            INTANGIBLES
          </div>
          <div className="divide-y divide-[#3a3d44]/40">
            {personalRows.map((row) => (
              <MirrorRow key={row.label} row={row} />
            ))}
          </div>
        </>
      )}

      <button
        onClick={() => setFullSheet(!fullSheet)}
        className="mt-3 w-full py-2 border-2 border-[#3a3d44] text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-[#ff8c42] hover:border-[#ff8c42]/50 transition-colors"
      >
        {fullSheet ? 'RELEVANT ONLY ▲' : 'FULL SHEET ▼'}
      </button>
    </div>
  );
}
