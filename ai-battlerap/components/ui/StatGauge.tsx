'use client';

// THE meter. One gauge for the whole app — the dossier's graded, notched
// segment gauge (the Tru Foe / Jesse Rican look). Any screen showing a stat
// uses this; the thin orange line meters are retired (owner, 2026-08-31:
// "we got 3 meters... use the one I like").
// Requires an `.fs` ancestor (or wraps itself) for fonts + .fs-seg CSS.

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export function gradeOf(v10: number): Grade {
  if (v10 >= 8.5) return 'S';
  if (v10 >= 7.5) return 'A';
  if (v10 >= 6.5) return 'B';
  if (v10 >= 5) return 'C';
  return 'D';
}

const GRADE_COLOR: Record<Grade, string> = {
  S: '#E7B23C',
  A: '#35C46B',
  B: '#2F7DD1',
  C: '#EAC54F',
  D: '#E23A2E',
};

// TIERS — the game's own attribute ladder (owner 2026-09-01: "we need a WORD
// for it — is your delivery TOP tier or MID tier?"). The 10-cell gauge is four
// readable regions: LOW 1-3, MID 4-6, TOP 7-9, GOD 10. Cells fill in their
// region's color, so you SEE the bar climb from red into green/gold, and the
// word names where you landed.
export type Tier = 'low' | 'mid' | 'top' | 'god';

export const TIER_META: Record<Tier, { label: string; color: string; cell: string; faint: string }> = {
  low: { label: 'LOW', color: '#E23A2E', cell: 'linear-gradient(180deg,#e86458,#a5281e)', faint: 'rgba(226,58,46,0.10)' },
  mid: { label: 'MID', color: '#F5731A', cell: 'linear-gradient(180deg,#ff9d5c,#c4560f)', faint: 'rgba(245,115,26,0.10)' },
  top: { label: 'TOP', color: '#35C46B', cell: 'linear-gradient(180deg,#3fd67e,#1c7a3f)', faint: 'rgba(53,196,107,0.10)' },
  god: { label: 'GOD', color: '#E7B23C', cell: 'linear-gradient(180deg,#f0c964,#b8901e)', faint: 'rgba(231,178,60,0.13)' },
};

/** Which tier a given cell index (0-9) belongs to. */
export function tierForCell(i: number): Tier {
  return i < 3 ? 'low' : i < 6 ? 'mid' : i < 9 ? 'top' : 'god';
}

/** The tier a value lands in (by the highest cell it fills), or null at 0. */
export function tierOf(v10: number): Tier | null {
  const filled = Math.round(Math.max(0, Math.min(10, v10)));
  if (filled <= 0) return null;
  return tierForCell(filled - 1);
}

function fmt(v: number): string {
  const r = Math.round(v * 10) / 10; // kill float-precision noise (1.9000000000000001)
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

/**
 * Notched 10-segment gauge colored by TIER REGION (pips at 3/6/9 divide the
 * LOW/MID/TOP/GOD zones). Filled cells take their region's full color; empty
 * cells keep a faint region tint so the four zones read even on a low stat.
 * `grade` is accepted for backward compat but no longer drives the color.
 */
export function SegGauge({ v10 }: { v10: number; grade?: Grade }) {
  const filled = Math.round(Math.max(0, Math.min(10, v10)));
  return (
    <div className="fs-seg">
      {Array.from({ length: 10 }).map((_, i) => {
        const meta = TIER_META[tierForCell(i)];
        return (
          <i
            key={i}
            className={i === 2 || i === 5 || i === 8 ? 'notch' : undefined}
            style={{ background: i < filled ? meta.cell : meta.faint }}
          />
        );
      })}
    </div>
  );
}

/**
 * Two-sided share gauge in the same cell texture — e.g. crowd perception
 * (your share of the room vs theirs). Left cells = side A, rest = side B.
 */
export function SplitGauge({
  pctA,
  aCell = 'linear-gradient(180deg,#ff9d5c,#c4560f)',
  bCell = 'linear-gradient(180deg,#e86458,#a5281e)',
}: {
  pctA: number;
  aCell?: string;
  bCell?: string;
}) {
  const cellsA = Math.round(Math.max(0, Math.min(100, pctA)) / 10);
  return (
    <div className="fs">
      <div className="fs-seg">
        {Array.from({ length: 10 }).map((_, i) => (
          <i
            key={i}
            className={i === 2 || i === 5 || i === 8 ? 'notch' : undefined}
            style={{ background: i < cellsA ? aCell : bCell }}
          />
        ))}
      </div>
    </div>
  );
}

interface StatGaugeProps {
  label: string;
  /** value on the 0-10 scale (pass pct/10 for percentages) */
  v10?: number | null;
  /** right-side value text override (defaults to "N/10"); e.g. "68%" */
  valueText?: string;
  /** hide the grade letter (e.g. for league weights where grades make no sense) */
  noGrade?: boolean;
}

/** One dossier-style stat row: label · region gauge · TIER word + value. */
export default function StatGauge({ label, v10, valueText, noGrade }: StatGaugeProps) {
  const v = Math.max(0, Math.min(10, Number(v10 ?? 0)));
  const grade = gradeOf(v);
  const tier = tierOf(v);
  return (
    <div className="fs flex items-center gap-3">
      <span className="w-32 shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 truncate">
        {label}
      </span>
      <div className="flex-1 min-w-0">
        <SegGauge v10={v} grade={grade} />
      </div>
      {!noGrade && (
        <span
          className="w-11 text-center shrink-0 font-mono font-bold uppercase"
          style={{
            fontSize: 11,
            letterSpacing: '0.06em',
            color: tier ? TIER_META[tier].color : '#5E606A',
          }}
        >
          {tier ? TIER_META[tier].label : '—'}
        </span>
      )}
      <span
        className="w-12 text-right shrink-0"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#F4F4F6' }}
      >
        {valueText ?? `${fmt(v)}/10`}
      </span>
    </div>
  );
}
