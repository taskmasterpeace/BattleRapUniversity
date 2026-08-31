'use client';

// THE ROOM — three rows deep, exactly as the owner drew it up (2026-08-31):
// a front row, a row behind them, and a dark row in the background. Faces come
// from the chunky house crowd family (public/sprites/crowd/{hype,watch,
// unimpressed,boo}) generated to match the owner's reference: overlapping
// shoulders, arms up, screaming — or dead silent, depending on the score.
// Deterministic per seed so SSR/CSR agree and a round always shows its room.
import family from '@/lib/crowd-family.json';

type Mood = keyof typeof family;

/** Pool of moods drawn per head, weighted by the crowd score. */
function poolFor(score: number): Mood[] {
  if (score >= 70) return ['hype', 'hype', 'hype', 'hype', 'watch'];
  if (score >= 45) return ['watch', 'watch', 'hype', 'watch', 'unimpressed'];
  if (score >= 25) return ['unimpressed', 'watch', 'unimpressed', 'watch', 'boo'];
  return ['boo', 'boo', 'unimpressed', 'boo', 'watch'];
}

/** Tiny deterministic PRNG (mulberry32 over an FNV-1a seed hash). */
function rng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface CrowdStripProps {
  /** crowd reaction 0-100 — decides what the room is doing */
  score: number;
  /** stable seed (battleId + round) so the same room shows every visit */
  seed: string;
  label?: string;
  /** px height of the strip */
  height?: number;
  /** heads in the FRONT row (other rows derive) */
  perRow?: number;
}

export default function CrowdStrip({ score, seed, label, height = 150, perRow = 7 }: CrowdStripProps) {
  const rand = rng(`${seed}|${Math.round(score / 5)}`);
  const pool = poolFor(score);

  const pick = (): string => {
    const mood = pool[Math.floor(rand() * pool.length)];
    const files = (family as Record<string, string[]>)[mood] ?? (family as Record<string, string[]>).watch;
    return files[Math.floor(rand() * files.length)];
  };

  // Three rows: background (dark, small, dense) → middle (dimmed) → front (full).
  const rows = [
    { headH: Math.round(height * 0.5), y: 0, bright: 0.22, z: 1, count: perRow + 3, offset: 0.25 },
    { headH: Math.round(height * 0.58), y: Math.round(height * 0.16), bright: 0.55, z: 2, count: perRow + 1, offset: 0.5 },
    { headH: Math.round(height * 0.68), y: Math.round(height * 0.32), bright: 1, z: 3, count: perRow, offset: 0 },
  ];

  return (
    <div className="fs">
      {label && (
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1.5">{label}</p>
      )}
      <div
        className="relative overflow-hidden"
        style={{
          height,
          background: 'linear-gradient(180deg, #08090C 0%, #14161B 100%)',
          border: '2px solid #000',
          boxShadow: 'inset 0 -22px 28px rgba(0,0,0,.6), 3px 3px 0 rgba(0,0,0,.4)',
        }}
      >
        {rows.map((row, ri) => {
          const step = 100 / row.count;
          return Array.from({ length: row.count }, (_, i) => {
            const src = pick();
            const flip = rand() < 0.45;
            const jitter = Math.round((rand() - 0.5) * 10);
            return (
              <img
                key={`${ri}-${i}`}
                src={src}
                alt=""
                className="absolute"
                style={{
                  height: row.headH,
                  width: 'auto',
                  left: `calc(${(i + row.offset) * step}% - ${Math.round(row.headH * 0.44)}px)`,
                  top: row.y + jitter,
                  zIndex: row.z,
                  imageRendering: 'pixelated',
                  filter: `brightness(${row.bright})`,
                  transform: flip ? 'scaleX(-1)' : undefined,
                }}
              />
            );
          });
        })}
        {/* stage light from above */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{ height: 30, background: 'linear-gradient(180deg, rgba(245,115,26,.12), transparent)', zIndex: 4 }}
        />
      </div>
    </div>
  );
}
