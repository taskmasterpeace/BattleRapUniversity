'use client';

import Link from 'next/link';

type Props = {
  league: any;
  rating: number;
};

const prestigeLabel = (level: number | null | undefined) => {
  if (!level) return 'UNRANKED';
  if (level <= 3) return 'UNDERGROUND';
  if (level <= 5) return 'REGIONAL';
  if (level <= 7) return 'NATIONAL';
  return 'PREMIER';
};

const prestigeColor = (level: number | null | undefined) => {
  if (!level || level <= 3) return 'text-zinc-300 border-zinc-500/50 bg-zinc-700/30';
  if (level <= 5) return 'text-blue-400 border-blue-500/50 bg-blue-700/20';
  if (level <= 7) return 'text-purple-400 border-purple-500/50 bg-purple-700/20';
  return 'text-yellow-300 border-yellow-500/60 bg-yellow-700/20';
};

const StatBar = ({ label, value, max = 1 }: { label: string; value: number; max?: number }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs font-display font-black uppercase tracking-wider text-zinc-400 mb-1">
        <span>{label}</span>
        <span className="text-[#ff8c42]">{Math.round(pct)}%</span>
      </div>
      <div className="w-full bg-[#18191c] border-2 border-[#3a3d44] h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ff8c42] to-[#ffb366]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default function LeagueOverview({ league, rating }: Props) {
  if (!league) return null;

  const writing = Number(league.writing_weight ?? 0.5);
  const performance = Number(league.performance_weight ?? 0.5);
  const crowd = Number(league.base_crowd_factor ?? 0);
  const prestige = league.prestige_level;
  const roundMins = league.round_length_minutes ?? 2;
  const payout = league.base_payout ?? 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42]">
          🏟️ YOUR LEAGUE
        </h2>
        <Link
          href="/leagues"
          className="text-xs font-display font-black uppercase tracking-wider text-zinc-400 hover:text-[#ff8c42] transition-colors"
        >
          ALL LEAGUES →
        </Link>
      </div>

      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b-2 border-[#3a3d44]">
          <div>
            <h3 className="text-3xl font-display font-black uppercase tracking-tighter text-zinc-100 mb-2">
              {league.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 border-2 font-display font-black uppercase tracking-wider text-xs ${prestigeColor(prestige)}`}
              >
                {prestigeLabel(prestige)}
              </span>
              {league.short_code && (
                <span className="px-3 py-1 bg-[#3a3d44] border-2 border-[#3a3d44] text-zinc-300 font-mono text-xs uppercase tracking-wider">
                  {league.short_code}
                </span>
              )}
              <span className="px-3 py-1 bg-[#3a3d44] border-2 border-[#3a3d44] text-zinc-300 font-display font-black uppercase tracking-wider text-xs">
                {roundMins}-MIN ROUNDS
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-zinc-500 font-display font-black uppercase tracking-wider mb-1">
              YOUR STANDING
            </div>
            <div className="text-4xl font-display font-black text-[#ff8c42] leading-none">
              {rating}
            </div>
            <div className="text-xs text-zinc-500 font-display font-black uppercase tracking-wider mt-1">
              ELO
            </div>
          </div>
        </div>

        {/* Description */}
        {league.description && (
          <p className="text-zinc-400 text-sm mb-6 italic leading-relaxed">
            {league.description}
          </p>
        )}

        {/* Weights & traits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-xs font-display font-black uppercase tracking-wider text-zinc-400">
              JUDGING WEIGHTS
            </h4>
            <StatBar label="WRITING" value={writing} />
            <StatBar label="PERFORMANCE" value={performance} />
            <StatBar label="CROWD FACTOR" value={crowd} />
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-display font-black uppercase tracking-wider text-zinc-400 mb-3">
              LEAGUE DETAILS
            </h4>
            <div className="flex justify-between items-center pb-2 border-b border-[#3a3d44]">
              <span className="text-xs uppercase tracking-wider text-zinc-500">Base Payout</span>
              <span className="text-[#ff8c42] font-display font-black text-lg">
                ${payout.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#3a3d44]">
              <span className="text-xs uppercase tracking-wider text-zinc-500">Prestige</span>
              <span className="text-zinc-200 font-display font-black">
                {prestige ? `${prestige}/10` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#3a3d44]">
              <span className="text-xs uppercase tracking-wider text-zinc-500">Style</span>
              <span className="text-zinc-200 font-display font-black uppercase text-sm">
                {league.personality_style || 'BALANCED'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider text-zinc-500">Booking Pace</span>
              <span className="text-zinc-200 font-display font-black">
                {league.booking_pace_days ?? 14}d
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
