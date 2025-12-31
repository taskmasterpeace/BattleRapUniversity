'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TournamentStats from '@/components/tournament/TournamentStats';
import TournamentAchievements from '@/components/tournament/TournamentAchievements';
import { TournamentPlayerStats } from '@/lib/game/tournamentAchievements';

interface Tournament {
  id: string;
  name: string;
  league: string;
  league_id: string;
  status: string;
  seed_number: number | null;
  final_placement: string | null;
  eliminated_in_round: string | null;
  prize_amount: number;
  battles_won: number;
  battles_lost: number;
  total_prize_pool: number;
  registered_at: string;
  tournament_starts_at: string;
  is_winner: boolean;
  is_runner_up: boolean;
}

interface HistoryData {
  tournaments: Tournament[];
  stats: {
    totalTournaments: number;
    championships: number;
    runnerUps: number;
    top4Finishes: number;
    totalPrizeEarned: string;
    winRate: string;
    totalBattlesWon: number;
    totalBattlesLost: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

const PLACEMENT_LABELS: Record<string, { label: string; colorClass: string }> = {
  winner: { label: '🏆 CHAMPION', colorClass: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
  runner_up: { label: '🥈 RUNNER-UP', colorClass: 'text-gray-400 border-gray-400/30 bg-gray-400/10' },
  semifinalist: { label: '🥉 TOP 4', colorClass: 'text-amber-600 border-amber-600/30 bg-amber-600/10' },
  quarterfinalist: { label: 'TOP 8', colorClass: 'text-zinc-500 border-[#3a3d44] bg-zinc-800/50' },
  first_round: { label: 'FIRST ROUND', colorClass: 'text-zinc-600 border-[#3a3d44] bg-[#2d2f35]/50' },
};

export default function TournamentHistoryClient() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'active' | 'upcoming'>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [statusFilter, page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/history?status=${statusFilter}&page=${page}&limit=10`);
      if (!res.ok) throw new Error('Failed to fetch tournament history');
      const data = await res.json();
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#18191c] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-zinc-500 py-20">Loading tournament history...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#18191c] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500 py-20">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Convert stats to achievement stats format
  const achievementStats: TournamentPlayerStats = {
    totalTournaments: data.stats.totalTournaments,
    championships: data.stats.championships,
    runnerUps: data.stats.runnerUps,
    top4Finishes: data.stats.top4Finishes,
    consecutiveWins: 0, // Would need to calculate from tournament history
    totalPrizeEarned: parseFloat(data.stats.totalPrizeEarned),
    tournamentWinRate: parseFloat(data.stats.winRate),
    perfectRuns: 0, // Would need to calculate
    comebackWins: 0, // Would need to calculate
    cinderellaRuns: 0, // Would need to calculate
    biggestUpset: 0, // Would need to calculate
    lowestSeedWin: 0, // Would need to calculate
    undefeatedTournaments: 0, // Would need to calculate
  };

  return (
    <div className="min-h-screen bg-[#18191c] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-100">
            Tournament History
          </h1>
          <Link
            href="/tournaments"
            className="px-4 py-2 bg-[#ff8c42] hover:bg-[#ff9d5c] text-white font-display font-black uppercase tracking-wide rounded text-sm transition-colors"
          >
            View Active Tournaments
          </Link>
        </div>

        {/* Stats Summary */}
        <TournamentStats stats={data.stats} />

        {/* Status Tabs */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => { setStatusFilter('all'); setPage(1); }}
              className={`px-4 py-2 rounded font-display font-black uppercase tracking-wide text-sm transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[#ff8c42] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setStatusFilter('completed'); setPage(1); }}
              className={`px-4 py-2 rounded font-display font-black uppercase tracking-wide text-sm transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-[#ff8c42] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => { setStatusFilter('active'); setPage(1); }}
              className={`px-4 py-2 rounded font-display font-black uppercase tracking-wide text-sm transition-colors ${
                statusFilter === 'active'
                  ? 'bg-[#ff8c42] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => { setStatusFilter('upcoming'); setPage(1); }}
              className={`px-4 py-2 rounded font-display font-black uppercase tracking-wide text-sm transition-colors ${
                statusFilter === 'upcoming'
                  ? 'bg-[#ff8c42] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Upcoming
            </button>
          </div>

          {/* Tournament List */}
          {loading ? (
            <div className="text-center text-zinc-500 py-8">Loading...</div>
          ) : data.tournaments.length === 0 ? (
            <div className="text-center text-zinc-500 py-8">
              No tournaments found in this category.
            </div>
          ) : (
            <div className="space-y-4">
              {data.tournaments.map(tournament => {
                const placement = PLACEMENT_LABELS[tournament.final_placement || ''] || {
                  label: tournament.final_placement || 'Participating',
                  colorClass: 'text-zinc-400 border-[#3a3d44] bg-zinc-800/50',
                };

                return (
                  <div
                    key={tournament.id}
                    className="bg-[#18191c] border-2 border-[#3a3d44] rounded-lg p-5 hover:border-orange-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Tournament Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black text-zinc-100">
                            {tournament.name}
                          </h3>
                          {tournament.status === 'completed' && tournament.final_placement && (
                            <div className={`px-3 py-1 rounded border-2 text-xs font-black uppercase ${placement.colorClass}`}>
                              {placement.label}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                          <div>
                            <span className="text-zinc-600">League:</span>{' '}
                            <span className="text-zinc-300">{tournament.league}</span>
                          </div>
                          {tournament.seed_number && (
                            <div>
                              <span className="text-zinc-600">Seed:</span>{' '}
                              <span className="text-zinc-300">#{tournament.seed_number}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-zinc-600">Record:</span>{' '}
                            <span className="text-zinc-300">
                              {tournament.battles_won}-{tournament.battles_lost}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          {tournament.prize_amount > 0 && (
                            <div className="text-green-500">
                              💰 Prize: <span className="font-bold">${parseFloat(tournament.prize_amount as any).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="text-zinc-500">
                            Started: {new Date(tournament.tournament_starts_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={`/tournaments/${tournament.id}`}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-display font-black uppercase tracking-wide rounded text-sm transition-colors"
                      >
                        View Bracket
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data.pagination.total > data.pagination.limit && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-[#3a3d44]">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-100 font-display font-black uppercase tracking-wide rounded text-sm transition-colors"
              >
                ← Previous
              </button>

              <div className="text-sm text-zinc-400">
                Page {page} of {Math.ceil(data.pagination.total / data.pagination.limit)}
              </div>

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!data.pagination.hasMore}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-100 font-display font-black uppercase tracking-wide rounded text-sm transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Achievements */}
        <TournamentAchievements stats={achievementStats} />
      </div>
    </div>
  );
}
