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

function fmt(v: number): string {
  const r = Math.round(v * 10) / 10; // kill float-precision noise (1.9000000000000001)
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

/** Notched 10-segment gauge colored by grade (pips at 3/6/9). */
export function SegGauge({ v10, grade }: { v10: number; grade: Grade }) {
  const filled = Math.round(Math.max(0, Math.min(10, v10)));
  return (
    <div className="fs-seg">
      {Array.from({ length: 10 }).map((_, i) => (
        <i
          key={i}
          className={`${i < filled ? `on ${grade}` : ''}${i === 2 || i === 5 || i === 8 ? ' notch' : ''}`}
        />
      ))}
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

/** One dossier-style stat row: label · notched gauge · grade + pixel value. */
export default function StatGauge({ label, v10, valueText, noGrade }: StatGaugeProps) {
  const v = Math.max(0, Math.min(10, Number(v10 ?? 0)));
  const grade = gradeOf(v);
  return (
    <div className="fs flex items-center gap-3">
      <span className="w-32 shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 truncate">
        {label}
      </span>
      <div className="flex-1 min-w-0">
        <SegGauge v10={v} grade={grade} />
      </div>
      {!noGrade && (
        <span
          className="w-5 text-center shrink-0"
          style={{
            fontFamily: 'var(--font-poster)',
            fontSize: 15,
            color: GRADE_COLOR[grade],
            textShadow: '1px 1px 0 #000',
          }}
        >
          {grade}
        </span>
      )}
      <span
        className="w-12 text-right shrink-0"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: '#F4F4F6' }}
      >
        {valueText ?? `${fmt(v)}/10`}
      </span>
    </div>
  );
}
