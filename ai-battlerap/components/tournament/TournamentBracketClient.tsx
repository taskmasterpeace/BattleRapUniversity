'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/game/paymentCalculator';
import TournamentTimeline from './TournamentTimeline';

type Bracket = {
  id: string;
  round: string;
  match_number: number;
  battler_1: any;
  battler_2: any;
  winner: any | null;
  battle: any | null;
  status: string;
  seed_1: number | null;
  seed_2: number | null;
};

type Props = {
  tournament: any;
  participants: any[];
  brackets: Bracket[];
  playerParticipation: any | null;
  playerId: string;
};

export default function TournamentBracketClient({
  tournament,
  participants,
  brackets,
  playerParticipation,
  playerId,
}: Props) {
  const [activeTab, setActiveTab] = useState<'bracket' | 'mystats'>('bracket');
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (playerParticipation && activeTab === 'mystats') {
      fetchPlayerStats();
    }
  }, [activeTab, playerParticipation]);

  const fetchPlayerStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/player-stats`);
      if (res.ok) {
        const data = await res.json();
        setPlayerStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch player stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const getRoundLabel = (round: string) => {
    const labels: Record<string, string> = {
      first_round: participants.length === 16 ? 'FIRST ROUND' : 'ROUND 1',
      quarterfinals: 'QUARTERFINALS',
      semifinals: 'SEMIFINALS',
      finals: 'FINALS',
    };
    return labels[round] || round.toUpperCase();
  };

  const getRoundBrackets = (round: string) => {
    return brackets.filter((b) => b.round === round);
  };

  const getMatchStatus = (bracket: Bracket) => {
    if (bracket.status === 'completed' || bracket.status === 'walkover') {
      return {
        label: bracket.winner ? `${bracket.winner.stage_name} WINS` : 'COMPLETE',
        color: 'text-green-400',
      };
    }
    if (bracket.status === 'scheduled' || bracket.status === 'locked') {
      return {
        label: bracket.battle?.scheduled_at
          ? new Date(bracket.battle.scheduled_at).toLocaleDateString()
          : 'SCHEDULED',
        color: 'text-orange-400',
      };
    }
    return { label: 'PENDING', color: 'text-zinc-500' };
  };

  const rounds = ['first_round', 'quarterfinals', 'semifinals', 'finals'];

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/tournaments"
            className="text-zinc-400 hover:text-zinc-100 transition text-sm mb-3 inline-block"
          >
            ← BACK TO TOURNAMENTS
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black mb-2">{tournament.name}</h1>
              <div className="flex gap-3 items-center">
                <span className="bg-zinc-800 px-3 py-1 text-xs font-display font-black uppercase">
                  {tournament.leagues.name}
                </span>
                <span className="bg-[#ff8c42]/20 text-[#ff8c42] px-3 py-1 text-xs font-display font-black uppercase">
                  {tournament.status.replace('_', ' ')}
                </span>
                {tournament.current_round && (
                  <span className="text-xs text-zinc-400">
                    CURRENT: {getRoundLabel(tournament.current_round)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase">Prize Pool</p>
              <p className="text-2xl font-black text-yellow-400">
                {formatCurrency(tournament.total_prize_pool)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs (if player is participating) */}
        {playerParticipation && (
          <div className="flex gap-4 mb-8 border-b-2 border-[#3a3d44]">
            <button
              onClick={() => setActiveTab('bracket')}
              className={`px-6 py-3 font-display font-black uppercase tracking-wide text-sm transition-all ${
                activeTab === 'bracket'
                  ? 'text-[#ff8c42] border-b-2 border-[#ff8c42]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Tournament Bracket
            </button>
            <button
              onClick={() => setActiveTab('mystats')}
              className={`px-6 py-3 font-display font-black uppercase tracking-wide text-sm transition-all ${
                activeTab === 'mystats'
                  ? 'text-[#ff8c42] border-b-2 border-[#ff8c42]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              My Stats & Journey
            </button>
          </div>
        )}

        {/* My Stats Tab Content */}
        {playerParticipation && activeTab === 'mystats' && (
          <div className="space-y-6">
            {/* Player Status Summary */}
            <div className="bg-green-500/10 border-2 border-green-500/30 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-1">YOUR STATUS</p>
                  <p className="text-lg font-bold">
                    Seed #{playerParticipation.seed_number || 'TBD'}
                  </p>
                  {playerParticipation.final_placement && (
                    <p className="text-sm text-green-400 mt-1">
                      Placement: {playerParticipation.final_placement.toUpperCase()}
                    </p>
                  )}
                </div>
                {playerParticipation.prize_amount > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 uppercase">Prize Earned</p>
                    <p className="text-2xl font-black text-yellow-400">
                      {formatCurrency(playerParticipation.prize_amount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Loading/Stats Display */}
            {loadingStats ? (
              <div className="text-center text-zinc-500 py-12">Loading your tournament stats...</div>
            ) : playerStats ? (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded p-4">
                    <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                      Record
                    </div>
                    <div className="text-2xl font-black text-zinc-100">
                      {playerStats.stats.battlesWon}-{playerStats.stats.battlesLost}
                    </div>
                  </div>

                  <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded p-4">
                    <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                      Haymakers
                    </div>
                    <div className="text-2xl font-black text-[#ff8c42]">
                      {playerStats.stats.totalHaymakers}
                    </div>
                  </div>

                  <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded p-4">
                    <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                      Avg Score
                    </div>
                    <div className="text-2xl font-black text-zinc-100">
                      {playerStats.stats.overallAvgScore}
                    </div>
                  </div>

                  <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded p-4">
                    <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                      Battles
                    </div>
                    <div className="text-2xl font-black text-zinc-100">
                      {playerStats.stats.totalBattles}
                    </div>
                  </div>
                </div>

                {/* Tournament Timeline */}
                <TournamentTimeline
                  battles={playerStats.battles}
                  placement={playerStats.placement}
                  prizeEarned={playerStats.prizeEarned}
                  seedNumber={playerStats.seedNumber}
                />
              </>
            ) : null}
          </div>
        )}

        {/* Bracket Tab Content (default) */}
        {activeTab === 'bracket' && (
          <>
            {/* Player Status (shown in bracket view) */}
            {playerParticipation && (
              <div className="bg-green-500/10 border-2 border-green-500/30 p-6 mb-12">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase mb-1">YOUR STATUS</p>
                    <p className="text-lg font-bold">
                      Seed #{playerParticipation.seed_number || 'TBD'}
                    </p>
                    {playerParticipation.final_placement && (
                      <p className="text-sm text-green-400 mt-1">
                        Placement: {playerParticipation.final_placement.toUpperCase()}
                      </p>
                    )}
                  </div>
                  {playerParticipation.prize_amount > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 uppercase">Prize Earned</p>
                      <p className="text-2xl font-black text-yellow-400">
                        {formatCurrency(playerParticipation.prize_amount)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

        {/* Participants Grid (for registration/seeding phase) */}
        {tournament.status === 'registration' || tournament.status === 'seeding' ? (
          <div className="mb-12">
            <h2 className="text-lg font-display font-black uppercase tracking-wider text-[#ff8c42] mb-6">
              REGISTERED PARTICIPANTS ({participants.length}/{tournament.max_participants})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`bg-[#2d2f35] border-2 p-4 ${
                    p.battlers.id === playerId ? 'border-green-500' : 'border-[#3a3d44]'
                  }`}
                >
                  <p className="text-xs text-zinc-500 mb-1">
                    {p.seed_number ? `SEED #${p.seed_number}` : 'UNSEEDED'}
                  </p>
                  <p className="font-bold">{p.battlers.stage_name}</p>
                  <p className="text-xs text-zinc-500 uppercase mt-1">{p.battlers.tier} TIER</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Bracket View */
          <div>
            <h2 className="text-lg font-display font-black uppercase tracking-wider text-[#ff8c42] mb-8">
              TOURNAMENT BRACKET
            </h2>
            <div className="space-y-12">
              {rounds.map((round) => {
                const roundBrackets = getRoundBrackets(round);
                if (roundBrackets.length === 0) return null;

                return (
                  <div key={round}>
                    <h3 className="text-sm font-display font-black uppercase tracking-wider text-zinc-400 mb-6">
                      {getRoundLabel(round)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {roundBrackets.map((bracket) => {
                        const matchStatus = getMatchStatus(bracket);
                        const isPlayerMatch =
                          bracket.battler_1?.id === playerId || bracket.battler_2?.id === playerId;

                        return (
                          <div
                            key={bracket.id}
                            className={`bg-[#2d2f35] border-2 p-6 ${
                              isPlayerMatch ? 'border-green-500/50' : 'border-[#3a3d44]'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-4">
                              <p className="text-xs text-zinc-500 uppercase">
                                MATCH #{bracket.match_number}
                              </p>
                              <p className={`text-xs font-bold ${matchStatus.color}`}>
                                {matchStatus.label}
                              </p>
                            </div>

                            {/* Battler 1 */}
                            <div
                              className={`flex justify-between items-center p-3 mb-2 ${
                                bracket.winner?.id === bracket.battler_1?.id
                                  ? 'bg-green-500/20 border-2 border-green-500/50'
                                  : 'bg-[#18191c] border-2 border-[#3a3d44]'
                              }`}
                            >
                              <div>
                                <p className="font-bold">{bracket.battler_1?.stage_name || 'TBD'}</p>
                                {bracket.seed_1 && (
                                  <p className="text-xs text-zinc-500">SEED #{bracket.seed_1}</p>
                                )}
                              </div>
                              {bracket.winner?.id === bracket.battler_1?.id && (
                                <span className="text-green-400 text-lg">✓</span>
                              )}
                            </div>

                            <div className="text-center text-xs text-zinc-600 mb-2">VS</div>

                            {/* Battler 2 */}
                            <div
                              className={`flex justify-between items-center p-3 mb-4 ${
                                bracket.winner?.id === bracket.battler_2?.id
                                  ? 'bg-green-500/20 border-2 border-green-500/50'
                                  : 'bg-[#18191c] border-2 border-[#3a3d44]'
                              }`}
                            >
                              <div>
                                <p className="font-bold">{bracket.battler_2?.stage_name || 'TBD'}</p>
                                {bracket.seed_2 && (
                                  <p className="text-xs text-zinc-500">SEED #{bracket.seed_2}</p>
                                )}
                              </div>
                              {bracket.winner?.id === bracket.battler_2?.id && (
                                <span className="text-green-400 text-lg">✓</span>
                              )}
                            </div>

                            {/* Battle Link */}
                            {bracket.battle && (
                              <Link
                                href={`/battle/${bracket.battle.id}/${
                                  bracket.battle.status === 'completed' ? 'results' : 'prep'
                                }`}
                                className="block w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-center font-display font-black uppercase text-sm transition"
                              >
                                {bracket.battle.status === 'completed'
                                  ? 'VIEW RESULTS'
                                  : 'VIEW BATTLE'}
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

            {/* Champion */}
            {tournament.winner_battler_id && (
              <div className="bg-yellow-500/10 border-2 border-yellow-500/30 p-8 mt-12 text-center">
                <p className="text-xs text-zinc-500 uppercase mb-2">TOURNAMENT CHAMPION</p>
                <p className="text-3xl font-black text-yellow-400 mb-4">🏆</p>
                <p className="text-xl font-bold">Champion Crowned!</p>
                <p className="text-sm text-zinc-400 mt-2">
                  Prize: {formatCurrency(tournament.total_prize_pool * 0.5)}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
