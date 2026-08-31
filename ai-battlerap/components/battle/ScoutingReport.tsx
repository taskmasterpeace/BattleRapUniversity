'use client';

/**
 * Scouting Report — shown on the prep page. Research prep days unlock tiered
 * intel about the opponent (served by /api/battles/[id]/scouting).
 *
 * Locked tiers render as redacted rows; unlocked tiers render real stats.
 * Re-fetches whenever `refreshKey` changes (the prep page bumps it after
 * every prep save so assigning a research day reveals intel live).
 */

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';

type RecentBattle = {
  id: string;
  vs: string;
  won: boolean;
  verdict: string | null;
  date: string;
};

type ScoutedBadge = {
  code: string;
  name: string;
  negative: boolean;
  description: string | null;
};

type ScoutingData = {
  researchDays: number;
  tier: number;
  opponent: { id: string; stage_name: string } | null;
  teaser?: string;
  tier1: {
    record: { wins: number; losses: number; rating: number; streak: number };
    tier: string;
    styleTags: string[];
  } | null;
  tier2: {
    recentBattles: RecentBattle[];
    avgCrowdReaction: number | null;
    roundsScouted: number;
  } | null;
  tier3: {
    chokeRate: number | null;
    chokedRounds: number;
    totalRounds: number;
    avgPeak: number | null;
    avgConsistency: number | null;
    profileLabel: string | null;
    badges: ScoutedBadge[];
    insights: string[];
  } | null;
};

type Props = {
  battleId: string;
  refreshKey?: number;
};

export default function ScoutingReport({ battleId, refreshKey = 0 }: Props) {
  const [data, setData] = useState<ScoutingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchScouting = async () => {
      try {
        const response = await fetch(`/api/battles/${battleId}/scouting`);
        if (response.ok) {
          const json = await response.json();
          if (!cancelled) setData(json);
        }
      } catch (error) {
        console.error('Error fetching scouting report:', error);
      }
      if (!cancelled) setLoading(false);
    };
    fetchScouting();
    return () => {
      cancelled = true;
    };
  }, [battleId, refreshKey]);

  if (loading && !data) {
    return (
      <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 md:p-8 mb-6 md:mb-8">
        <h3 className="font-display font-black text-lg uppercase tracking-wider text-zinc-400">
          SCOUTING REPORT
        </h3>
        <p className="mt-4 text-xs text-zinc-600 font-display font-black uppercase tracking-wider animate-pulse">
          PULLING TAPE...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const tier = data.tier;

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 md:p-8 mb-6 md:mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <h3 className="font-display font-black text-lg uppercase tracking-wider text-zinc-300">
          SCOUTING REPORT
          {data.opponent && (
            <span className="text-zinc-500"> — {data.opponent.stage_name}</span>
          )}
        </h3>
        {/* Intel level pips */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-zinc-500 font-display font-black uppercase tracking-wider">
            INTEL LEVEL
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((lv) => (
              <div
                key={lv}
                className={`w-6 h-2 border ${
                  tier >= lv
                    ? 'bg-amber-400 border-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                    : 'bg-[#18191c] border-[#3a3d44]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-amber-400/80 font-display font-black uppercase tracking-wider mb-6">
        {data.researchDays} RESEARCH DAY{data.researchDays === 1 ? '' : 'S'} BANKED
        {tier < 3 && ' • EACH RESEARCH DAY DIGS UP MORE'}
      </p>

      {/* Tier 0 teaser */}
      {tier === 0 && data.teaser && (
        <div className="mb-5 px-4 py-3 bg-[#18191c] border-2 border-[#3a3d44] text-sm text-zinc-400 font-display font-bold uppercase tracking-wide">
          {data.teaser}
        </div>
      )}

      <div className="space-y-5">
        {/* ───────────────────────── TIER 1 — THE BASICS */}
        <TierSection title="TIER 1 — THE BASICS" unlocked={tier >= 1} daysNeeded={1 - data.researchDays}>
          {data.tier1 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <IntelStat
                label="RECORD"
                value={`${data.tier1.record.wins}W - ${data.tier1.record.losses}L`}
              />
              <IntelStat label="ELO RATING" value={`${data.tier1.record.rating}`} />
              <IntelStat label="TIER" value={data.tier1.tier.toUpperCase()} />
              <div className="bg-[#18191c] border-2 border-[#3a3d44] p-3 col-span-2 sm:col-span-1">
                <p className="text-[12px] text-zinc-500 font-display font-black uppercase tracking-wider mb-1">
                  STYLE
                </p>
                <div className="flex flex-wrap gap-1">
                  {data.tier1.styleTags.length > 0 ? (
                    data.tier1.styleTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-[#ff8c42]/15 text-[#ff8c42] border border-[#ff8c42]/40 text-[12px] font-display font-black uppercase tracking-wide"
                      >
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-600 font-display font-bold uppercase">NONE</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </TierSection>

        {/* ───────────────────────── TIER 2 — RECENT TAPE */}
        <TierSection title="TIER 2 — RECENT TAPE" unlocked={tier >= 2} daysNeeded={2 - data.researchDays}>
          {data.tier2 && (
            <div className="space-y-3">
              {data.tier2.recentBattles.length > 0 ? (
                <div className="space-y-2">
                  {data.tier2.recentBattles.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between bg-[#18191c] border-2 border-[#3a3d44] px-3 py-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`px-2 py-0.5 text-[12px] font-display font-black uppercase tracking-wider border ${
                            b.won
                              ? 'bg-green-500/20 text-green-400 border-green-500/50'
                              : 'bg-red-500/20 text-red-400 border-red-500/50'
                          }`}
                        >
                          {b.won ? 'W' : 'L'}
                        </span>
                        <span className="text-sm text-zinc-200 font-display font-bold uppercase tracking-wide truncate">
                          VS {b.vs}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {b.verdict && (
                          <span className="text-xs text-zinc-500 font-display font-black uppercase">
                            {b.verdict}
                          </span>
                        )}
                        <span className="text-[12px] text-zinc-600 font-display font-bold uppercase">
                          {new Date(b.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-600 font-display font-black uppercase tracking-wider">
                  NO COMPLETED BATTLES ON TAPE — THIS IS THEIR DEBUT
                </p>
              )}
              {data.tier2.avgCrowdReaction !== null && (
                <div className="flex items-center justify-between bg-[#18191c] border-2 border-[#3a3d44] px-3 py-2">
                  <span className="text-[12px] text-zinc-500 font-display font-black uppercase tracking-wider">
                    AVG CROWD REACTION ({data.tier2.roundsScouted} ROUNDS)
                  </span>
                  <span className="text-lg font-display font-black text-[#ff8c42]">
                    {data.tier2.avgCrowdReaction}%
                  </span>
                </div>
              )}
            </div>
          )}
        </TierSection>

        {/* ───────────────────────── TIER 3 — WEAKNESS REPORT */}
        <TierSection title="TIER 3 — WEAKNESS REPORT" unlocked={tier >= 3} daysNeeded={3 - data.researchDays}>
          {data.tier3 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <IntelStat
                  label="CHOKE RATE"
                  value={data.tier3.chokeRate !== null ? `${data.tier3.chokeRate}%` : 'NO TAPE'}
                  accent={
                    data.tier3.chokeRate !== null && data.tier3.chokeRate >= 15
                      ? 'text-red-400'
                      : undefined
                  }
                  sub={
                    data.tier3.totalRounds > 0
                      ? `${data.tier3.chokedRounds}/${data.tier3.totalRounds} ROUNDS`
                      : undefined
                  }
                />
                <IntelStat
                  label="AVG PEAK"
                  value={data.tier3.avgPeak !== null ? data.tier3.avgPeak.toFixed(1) : '—'}
                />
                <IntelStat
                  label="CONSISTENCY"
                  value={
                    data.tier3.avgConsistency !== null
                      ? data.tier3.avgConsistency.toFixed(1)
                      : '—'
                  }
                />
              </div>

              {data.tier3.profileLabel && (
                <div className="px-3 py-2 bg-amber-500/10 border-2 border-amber-500/40 text-amber-300 text-sm font-display font-black uppercase tracking-wider text-center">
                  READ: {data.tier3.profileLabel}
                </div>
              )}

              {data.tier3.badges.length > 0 && (
                <div>
                  <p className="text-[12px] text-zinc-500 font-display font-black uppercase tracking-wider mb-2">
                    KNOWN BADGES
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.tier3.badges.map((badge) => (
                      <span
                        key={badge.code}
                        title={badge.description ?? undefined}
                        className={`px-2 py-1 text-[12px] font-display font-black uppercase tracking-wide border ${
                          badge.negative
                            ? 'bg-red-500/15 text-red-400 border-red-500/50'
                            : 'bg-[#3a3d44]/60 text-zinc-300 border-[#3a3d44]'
                        }`}
                      >
                        {badge.negative && <Icon name="warning" size={11} className="mr-1 text-red-400" />}
                        {badge.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.tier3.insights.length > 0 && (
                <div className="bg-[#18191c] border-2 border-[#3a3d44] p-4 space-y-2">
                  <p className="text-[12px] text-zinc-500 font-display font-black uppercase tracking-wider">
                    HOW TO BEAT HIM
                  </p>
                  {data.tier3.insights.map((line, i) => (
                    <p
                      key={i}
                      className="text-xs text-zinc-300 font-display font-bold uppercase tracking-wide leading-relaxed"
                    >
                      <span className="text-[#ff8c42]">▸ </span>
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </TierSection>
      </div>
    </div>
  );
}

/** Section wrapper: unlocked renders children, locked renders redacted rows. */
function TierSection({
  title,
  unlocked,
  daysNeeded,
  children,
}: {
  title: string;
  unlocked: boolean;
  daysNeeded: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`border-2 p-4 ${unlocked ? 'border-[#3a3d44] bg-[#26282d]' : 'border-[#3a3d44]/60 bg-[#18191c]'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4
          className={`text-xs font-display font-black uppercase tracking-wider ${
            unlocked ? 'text-amber-300' : 'text-zinc-600'
          }`}
        >
          {title}
        </h4>
        {!unlocked && (
          <span className="text-[12px] text-[#ff8c42] font-display font-black uppercase tracking-wider">
            {Math.max(1, daysNeeded)} MORE RESEARCH DAY{Math.max(1, daysNeeded) === 1 ? '' : 'S'}
          </span>
        )}
      </div>
      {unlocked ? (
        children
      ) : (
        <div className="space-y-2 select-none" aria-hidden="true">
          <div className="text-zinc-700 text-sm tracking-widest overflow-hidden whitespace-nowrap">
            ▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
          </div>
          <div className="text-zinc-700 text-sm tracking-widest overflow-hidden whitespace-nowrap">
            ▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓ ▓▓▓▓▓▓▓▓
          </div>
        </div>
      )}
    </div>
  );
}

function IntelStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-[#18191c] border-2 border-[#3a3d44] p-3">
      <p className="text-[12px] text-zinc-500 font-display font-black uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-lg font-display font-black ${accent ?? 'text-zinc-100'}`}>{value}</p>
      {sub && (
        <p className="text-[12px] text-zinc-600 font-display font-bold uppercase tracking-wide mt-0.5">
          {sub}
        </p>
      )}
    </div>
  );
}
