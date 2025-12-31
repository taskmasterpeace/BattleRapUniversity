'use client';

import Link from 'next/link';

type Bracket = {
  id: string;
  round: 'first_round' | 'quarterfinals' | 'semifinals' | 'finals';
  match_number: number;
  battler_1_id: string;
  battler_2_id: string;
  seed_1: number;
  seed_2: number;
  winner_battler_id?: string;
  battle_id?: string;
  status: 'pending' | 'scheduled' | 'locked' | 'completed' | 'walkover';
  battler_1_name: string;
  battler_2_name: string;
};

type Props = {
  brackets: Bracket[];
  tournamentStatus: string;
};

const ROUND_LABELS = {
  first_round: 'FIRST ROUND',
  quarterfinals: 'QUARTERFINALS',
  semifinals: 'SEMIFINALS',
  finals: 'FINALS',
};

export default function TournamentBracket({ brackets, tournamentStatus }: Props) {
  if (!brackets || brackets.length === 0) {
    return (
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-12 text-center">
        <p className="text-zinc-500 uppercase tracking-wide">
          Bracket not yet generated
        </p>
      </div>
    );
  }

  // Group brackets by round
  const bracketsByRound: Record<string, Bracket[]> = {
    first_round: [],
    quarterfinals: [],
    semifinals: [],
    finals: [],
  };

  brackets.forEach((bracket) => {
    bracketsByRound[bracket.round].push(bracket);
  });

  // Sort each round by match number
  Object.keys(bracketsByRound).forEach((round) => {
    bracketsByRound[round].sort((a, b) => a.match_number - b.match_number);
  });

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-8">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] pb-4 mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#ff8c42]">
          Tournament Bracket
        </h2>
      </div>

      {/* Bracket Display - Horizontal Layout */}
      <div className="overflow-x-auto">
        <div className="flex gap-8 min-w-max">
          {/* First Round */}
          {bracketsByRound.first_round.length > 0 && (
            <RoundColumn
              title={ROUND_LABELS.first_round}
              brackets={bracketsByRound.first_round}
            />
          )}

          {/* Quarterfinals */}
          {bracketsByRound.quarterfinals.length > 0 && (
            <RoundColumn
              title={ROUND_LABELS.quarterfinals}
              brackets={bracketsByRound.quarterfinals}
            />
          )}

          {/* Semifinals */}
          {bracketsByRound.semifinals.length > 0 && (
            <RoundColumn
              title={ROUND_LABELS.semifinals}
              brackets={bracketsByRound.semifinals}
            />
          )}

          {/* Finals */}
          {bracketsByRound.finals.length > 0 && (
            <RoundColumn
              title={ROUND_LABELS.finals}
              brackets={bracketsByRound.finals}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RoundColumn({ title, brackets }: { title: string; brackets: Bracket[] }) {
  return (
    <div className="flex flex-col min-w-[300px]">
      {/* Round Title */}
      <div className="mb-4">
        <h3 className="text-xs font-display font-black uppercase tracking-wider text-zinc-400">
          {title}
        </h3>
      </div>

      {/* Matches */}
      <div className="flex-1 flex flex-col justify-around gap-4">
        {brackets.map((bracket) => (
          <MatchupCard key={bracket.id} bracket={bracket} />
        ))}
      </div>
    </div>
  );
}

function MatchupCard({ bracket }: { bracket: Bracket }) {
  const isCompleted = bracket.status === 'completed';
  const isLocked = bracket.status === 'locked';
  const isScheduled = bracket.status === 'scheduled';
  const isPending = bracket.status === 'pending';

  return (
    <div className="bg-zinc-800/50 border-2 border-[#3a3d44] rounded-lg overflow-hidden">
      {/* Match Number */}
      <div className="bg-zinc-800 px-3 py-2 border-b-2 border-[#3a3d44]">
        <span className="text-xs uppercase tracking-wide text-zinc-500 font-bold">
          Match #{bracket.match_number}
        </span>
      </div>

      {/* Battler 1 */}
      <div
        className={`p-3 flex items-center justify-between border-b-2 border-[#3a3d44] ${
          isCompleted && bracket.winner_battler_id === bracket.battler_1_id
            ? 'bg-green-500/10'
            : ''
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Seed */}
          <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
            <span className="text-xs font-bold text-zinc-300">{bracket.seed_1}</span>
          </div>

          {/* Name */}
          <span
            className={`text-sm font-display font-black uppercase tracking-wide ${
              isCompleted && bracket.winner_battler_id === bracket.battler_1_id
                ? 'text-green-500'
                : 'text-zinc-300'
            }`}
          >
            {bracket.battler_1_name}
          </span>
        </div>

        {/* Winner Check */}
        {isCompleted && bracket.winner_battler_id === bracket.battler_1_id && (
          <span className="text-green-500">✓</span>
        )}
      </div>

      {/* Battler 2 */}
      <div
        className={`p-3 flex items-center justify-between ${
          isCompleted && bracket.winner_battler_id === bracket.battler_2_id
            ? 'bg-green-500/10'
            : ''
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Seed */}
          <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
            <span className="text-xs font-bold text-zinc-300">{bracket.seed_2}</span>
          </div>

          {/* Name */}
          <span
            className={`text-sm font-display font-black uppercase tracking-wide ${
              isCompleted && bracket.winner_battler_id === bracket.battler_2_id
                ? 'text-green-500'
                : 'text-zinc-300'
            }`}
          >
            {bracket.battler_2_name}
          </span>
        </div>

        {/* Winner Check */}
        {isCompleted && bracket.winner_battler_id === bracket.battler_2_id && (
          <span className="text-green-500">✓</span>
        )}
      </div>

      {/* Status/Action */}
      <div className="px-3 py-2 bg-zinc-800 border-t-2 border-[#3a3d44]">
        {isCompleted && bracket.battle_id && (
          <Link
            href={`/battle/${bracket.battle_id}`}
            className="text-xs uppercase tracking-wide text-[#ff8c42] hover:text-[#ff9d5c] font-bold"
          >
            VIEW BATTLE →
          </Link>
        )}
        {isLocked && (
          <span className="text-xs uppercase tracking-wide text-blue-400 font-bold">
            ⏱ LOCKED
          </span>
        )}
        {isScheduled && (
          <span className="text-xs uppercase tracking-wide text-yellow-400 font-bold">
            📅 SCHEDULED
          </span>
        )}
        {isPending && (
          <span className="text-xs uppercase tracking-wide text-zinc-500 font-bold">
            PENDING
          </span>
        )}
      </div>
    </div>
  );
}
