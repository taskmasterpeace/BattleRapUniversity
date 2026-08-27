'use client';

/**
 * Fight Projection — live panel on the prep page showing the projected impact
 * of the current prep plan. Updates instantly from local state (no fetch).
 *
 * Every number is computed by lib/game/prepProjection.ts, which mirrors the
 * REAL simulation formulas and reads the REAL constants from
 * lib/game/config.ts — nothing here is invented.
 */

import Icon, { type IconName } from '@/components/ui/Icon';
import {
  projectPrep,
  projectionReadline,
  type PrepCounts,
} from '@/lib/game/prepProjection';

type Props = {
  counts: PrepCounts;
  totalPrepDays: number;
  roundLengthMinutes: number;
  preparation: number;
  resilience: number;
  familyBond: number;
};

const fmtBoost = (n: number) => (n > 0 ? `+${n.toFixed(2)}` : '—');
const fmtPct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;

export default function FightProjection({
  counts,
  totalPrepDays,
  roundLengthMinutes,
  preparation,
  resilience,
  familyBond,
}: Props) {
  const projection = projectPrep(counts, {
    preparation,
    resilience,
    familyBond,
    roundLengthMinutes,
  });

  const chokeDelta = projection.chokePerBattle - projection.baselineChokePerBattle;
  const readline = projectionReadline(counts, projection, totalPrepDays);
  const fullWeek = projection.totalDaysAssigned >= totalPrepDays;

  return (
    <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-6 md:p-8 mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
        <h3 className="font-display font-black text-lg uppercase tracking-wider text-zinc-300">
          FIGHT PROJECTION
        </h3>
        <span className="text-[10px] text-zinc-500 font-display font-black uppercase tracking-wider">
          {projection.totalDaysAssigned}/{totalPrepDays} DAYS ASSIGNED • LIVE
        </span>
      </div>
      <p className="text-xs text-zinc-600 font-display font-bold uppercase tracking-wide mb-6">
        Base numbers from your attributes — badge effects stack on top
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* WRITING */}
        <ProjectionTile
          icon="pen"
          label="WRITING"
          value={fmtBoost(projection.writingBoost)}
          active={projection.writingBoost > 0}
          activeClass="text-[#ff8c42]"
          sub={
            counts.writing > 0
              ? `${counts.writing} DAY${counts.writing === 1 ? '' : 'S'} → LYRICISM • WORDPLAY • CREATIVITY`
              : 'NO WRITING DAYS'
          }
        />

        {/* PERFORMANCE */}
        <ProjectionTile
          icon="stage"
          label="PERFORMANCE"
          value={fmtBoost(projection.performanceBoost)}
          active={projection.performanceBoost > 0}
          activeClass="text-red-400"
          sub={
            counts.performance > 0
              ? `${counts.performance} DAY${counts.performance === 1 ? '' : 'S'} → PRESENCE • CROWD • DELIVERY`
              : 'NO PERFORMANCE DAYS'
          }
        />

        {/* RESEARCH / ANGLES */}
        <ProjectionTile
          icon="search"
          label="ANGLE BONUS"
          value={
            projection.researchCreativityBoost > 0
              ? `+${projection.researchCreativityBoost.toFixed(2)}`
              : '—'
          }
          active={counts.research > 0}
          activeClass="text-amber-400"
          sub={
            counts.research > 0
              ? `CREATIVITY +${projection.researchCreativityBoost.toFixed(2)} • LYRICISM +${projection.researchLyricismBoost.toFixed(2)}`
              : 'NO RESEARCH DAYS'
          }
          pill={
            projection.peakChanceUnlocked
              ? {
                  text: `HAYMAKER ${fmtPct(projection.peakChancePerSegment, 0)}/SEG — DOUBLED`,
                  className: 'bg-amber-500/15 text-amber-300 border-amber-500/50',
                }
              : {
                  text: `HAYMAKER ${fmtPct(projection.peakChancePerSegment, 1)}/SEG — HALVED, NO RESEARCH`,
                  className: 'bg-[#18191c] text-zinc-500 border-[#3a3d44]',
                }
          }
        />

        {/* CHOKE RISK */}
        <ProjectionTile
          icon={chokeDelta < -0.0005 ? 'shield' : 'warning'}
          label="CHOKE RISK"
          value={fmtPct(projection.chokePerBattle)}
          active
          activeClass={
            chokeDelta < -0.0005
              ? 'text-green-400'
              : projection.chokePerBattle > projection.baselineChokePerBattle + 0.0005
                ? 'text-red-400'
                : 'text-zinc-300'
          }
          sub={
            chokeDelta < -0.0005
              ? `▼ DOWN FROM ${fmtPct(projection.baselineChokePerBattle)} — WRITING + REST PAYING OFF`
              : `BASELINE ${fmtPct(projection.baselineChokePerBattle)} — WRITING & REST DAYS LOWER THIS`
          }
        />

        {/* RESILIENCE (rest) */}
        <ProjectionTile
          icon="rest"
          label="RESILIENCE"
          value={fmtBoost(projection.resilienceBoost)}
          active={projection.resilienceBoost > 0}
          activeClass="text-zinc-300"
          sub={
            counts.rest > 0
              ? `${counts.rest} REST DAY${counts.rest === 1 ? '' : 'S'} → STEADIER UNDER PRESSURE`
              : 'NO REST DAYS'
          }
        />

        {/* LIFE */}
        <ProjectionTile
          icon="home"
          label="LIFE"
          value={fmtBoost(projection.lifeBoost)}
          active={projection.lifeBoost > 0}
          activeClass="text-green-400"
          sub={
            counts.life > 0
              ? `${counts.life} DAY${counts.life === 1 ? '' : 'S'} → FAMILY BOND • STABILITY`
              : 'NO LIFE DAYS'
          }
        />

        {/* SCOUTING INTEL */}
        <ProjectionTile
          icon="eye"
          label="INTEL TIER"
          value={`${Math.min(3, counts.research)}/3`}
          active={counts.research > 0}
          activeClass="text-amber-400"
          sub={
            counts.research >= 3
              ? 'FULL WEAKNESS REPORT UNLOCKED'
              : 'NEXT RESEARCH DAY DIGS DEEPER'
          }
        />

        {/* PREP EFFICIENCY */}
        <ProjectionTile
          icon="chart"
          label="PREP POWER"
          value={`+${(preparation * 5).toFixed(0)}%`}
          active
          activeClass="text-[#ff8c42]"
          sub={`PREPARATION ${preparation.toFixed(1)} MAKES EVERY DAY HIT HARDER`}
        />
      </div>

      {/* One-line read */}
      <div
        className={`mt-6 px-4 py-3 border-2 font-display font-black uppercase tracking-wider text-sm text-center ${
          fullWeek && projection.totalDaysAssigned > 0
            ? 'bg-[#ff8c42]/10 border-[#ff8c42]/40 text-[#ff8c42]'
            : 'bg-[#18191c] border-[#3a3d44] text-zinc-400'
        }`}
      >
        {readline}
      </div>
    </div>
  );
}

function ProjectionTile({
  icon,
  label,
  value,
  sub,
  active,
  activeClass,
  pill,
}: {
  icon: IconName;
  label: string;
  value: string;
  sub: string;
  active: boolean;
  activeClass: string;
  pill?: { text: string; className: string };
}) {
  return (
    <div
      className={`border-2 p-4 transition-colors ${
        active ? 'bg-[#18191c] border-[#3a3d44]' : 'bg-[#101114] border-[#3a3d44]/60'
      }`}
    >
      <p className="text-[10px] text-zinc-500 font-display font-black uppercase tracking-wider mb-1">
        <Icon name={icon} size={12} className="mr-1 -mt-0.5" /> {label}
      </p>
      <p
        className={`text-2xl font-display font-black tabular-nums ${
          active ? activeClass : 'text-zinc-600'
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] text-zinc-600 font-display font-bold uppercase tracking-wide mt-1 leading-relaxed">
        {sub}
      </p>
      {pill && (
        <span
          className={`inline-block mt-2 px-2 py-0.5 border text-[10px] font-display font-black uppercase tracking-wide ${pill.className}`}
        >
          {pill.text}
        </span>
      )}
    </div>
  );
}
