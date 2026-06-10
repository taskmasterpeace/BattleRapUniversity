'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/game/paymentCalculator';
import { useState } from 'react';
import { toast } from '@/components/ui/Toast';

type Tournament = {
  id: string;
  name: string;
  description: string | null;
  league_id: string;
  max_participants: number;
  tier_restriction: string;
  total_prize_pool: number;
  prize_distribution: any;
  status: string;
  registration_opens_at: string;
  registration_closes_at: string;
  tournament_starts_at: string;
  current_round: string | null;
  winner_battler_id: string | null;
  leagues: { name: string };
};

type Props = {
  battler: any;
  playerTier: string;
  tournaments: Tournament[];
  myRegistrations: any[];
  completedTournaments: Tournament[];
};

export default function TournamentsClient({
  battler,
  playerTier,
  tournaments,
  myRegistrations,
  completedTournaments,
}: Props) {
  const router = useRouter();
  const [registering, setRegistering] = useState<string | null>(null);

  const handleRegister = async (tournamentId: string) => {
    setRegistering(tournamentId);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        toast(data.error || 'Failed to register', 'error');
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast('Failed to register', 'error');
    }
    setRegistering(null);
  };

  const canRegister = (tournament: Tournament) => {
    // Check if already registered
    if (myRegistrations.some((r) => r.tournaments.id === tournament.id)) {
      return false;
    }

    // Check tier restriction
    if (tournament.tier_restriction === 'low' && playerTier !== 'low') {
      return false;
    }
    if (tournament.tier_restriction === 'mid' && playerTier !== 'mid') {
      return false;
    }
    if (tournament.tier_restriction === 'low_mid' && !['low', 'mid'].includes(playerTier)) {
      return false;
    }

    // Check registration status
    if (tournament.status !== 'registration') {
      return false;
    }

    return true;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      registration: { color: 'bg-green-500', label: 'REGISTRATION OPEN' },
      seeding: { color: 'bg-blue-500', label: 'SEEDING' },
      in_progress: { color: 'bg-[#ff8c42]', label: 'IN PROGRESS' },
      completed: { color: 'bg-zinc-600', label: 'COMPLETED' },
    };
    const badge = badges[status] || { color: 'bg-zinc-500', label: status.toUpperCase() };
    return <span className={`${badge.color} text-white px-3 py-1 text-xs font-display font-black uppercase rounded`}>{badge.label}</span>;
  };

  const getTierBadge = (restriction: string) => {
    const labels: Record<string, string> = {
      low: 'LOW TIER ONLY',
      mid: 'MID TIER ONLY',
      low_mid: 'LOW/MID TIER',
      all: 'ALL TIERS',
    };
    return labels[restriction] || restriction.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100">
      {/* Header */}
      <div className="border-b-2 border-[#3a3d44] bg-[#2d2f35]/50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-zinc-400 hover:text-zinc-100 transition"
            >
              ← BACK
            </Link>
            <h1 className="text-xl font-bold tracking-tight">TOURNAMENTS</h1>
          </div>
          <div className="text-sm text-zinc-400">
            {battler.stage_name} • <span className="text-[#ff8c42] font-display font-black uppercase">{playerTier} TIER</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* My Registrations */}
        {myRegistrations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-display font-black uppercase tracking-wider text-green-500 mb-6">
              🏆 MY TOURNAMENTS ({myRegistrations.length})
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {myRegistrations.map((reg) => (
                <div key={reg.id} className="bg-green-500/10 border-2 border-green-500/30 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black mb-2">{reg.tournaments.name}</h3>
                      <div className="flex gap-2 items-center">
                        {getStatusBadge(reg.tournaments.status)}
                        <span className="text-xs text-zinc-400">
                          Seed #{reg.seed_number || 'TBD'}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/tournaments/${reg.tournaments.id}`}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-display font-black uppercase text-sm transition"
                    >
                      VIEW BRACKET
                    </Link>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {reg.tournaments.description || 'Tournament in progress'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Tournaments */}
        <div className="mb-12">
          <h2 className="text-lg font-display font-black uppercase tracking-wider text-[#ff8c42] mb-6">
            AVAILABLE TOURNAMENTS
          </h2>
          {tournaments.length === 0 ? (
            <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-12 text-center">
              <p className="text-zinc-500">No tournaments available right now</p>
              <p className="text-xs text-zinc-600 mt-2">Check back soon for upcoming events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tournaments.map((tournament) => {
                const eligible = canRegister(tournament);
                const registered = myRegistrations.some((r) => r.tournaments.id === tournament.id);

                return (
                  <div
                    key={tournament.id}
                    className={`bg-[#2d2f35] border-2 p-6 ${
                      registered ? 'border-green-500/50' : 'border-[#3a3d44]'
                    }`}
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-black mb-2">{tournament.name}</h3>
                      <div className="flex gap-2 flex-wrap mb-3">
                        {getStatusBadge(tournament.status)}
                        <span className="bg-zinc-800 text-zinc-300 px-3 py-1 text-xs font-display font-black uppercase">
                          {tournament.leagues.name}
                        </span>
                        <span className="bg-zinc-800 text-zinc-300 px-3 py-1 text-xs font-display font-black uppercase">
                          {getTierBadge(tournament.tier_restriction)}
                        </span>
                      </div>
                      {tournament.description && (
                        <p className="text-sm text-zinc-400 mb-4">{tournament.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-zinc-500 uppercase">Prize Pool</p>
                        <p className="text-lg font-bold text-yellow-400">
                          {formatCurrency(tournament.total_prize_pool)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase">Participants</p>
                        <p className="text-lg font-bold">{tournament.max_participants} MAX</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase">Registration Closes</p>
                        <p className="text-sm font-bold">
                          {new Date(tournament.registration_closes_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase">Starts</p>
                        <p className="text-sm font-bold">
                          {new Date(tournament.tournament_starts_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {registered ? (
                      <Link
                        href={`/tournaments/${tournament.id}`}
                        className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white text-center font-display font-black uppercase transition"
                      >
                        VIEW BRACKET
                      </Link>
                    ) : eligible ? (
                      <button
                        onClick={() => handleRegister(tournament.id)}
                        disabled={registering === tournament.id}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-display font-black uppercase transition disabled:opacity-50"
                      >
                        {registering === tournament.id ? 'REGISTERING...' : 'REGISTER NOW'}
                      </button>
                    ) : (
                      <div className="w-full py-3 bg-zinc-800 text-zinc-500 text-center font-display font-black uppercase">
                        {tournament.status !== 'registration'
                          ? 'REGISTRATION CLOSED'
                          : 'TIER RESTRICTED'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Completed Tournaments */}
        {completedTournaments.length > 0 && (
          <div>
            <h2 className="text-lg font-display font-black uppercase tracking-wider text-zinc-500 mb-6">
              RECENT CHAMPIONS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTournaments.map((tournament) => (
                <div key={tournament.id} className="bg-[#2d2f35] border-2 border-[#3a3d44] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold">{tournament.name}</h3>
                      <p className="text-xs text-zinc-500">{tournament.leagues.name}</p>
                    </div>
                    {getStatusBadge(tournament.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase">Champion</p>
                      <p className="text-sm font-bold text-yellow-400">
                        {tournament.winner_battler_id ? 'Winner Crowned' : 'TBD'}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="block mt-3 text-xs text-[#ff8c42] hover:text-[#ff9d5c]"
                  >
                    View Results →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
