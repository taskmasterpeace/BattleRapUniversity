'use client';

// THE ROOM — an overlapping shoulder-to-shoulder pixel crowd whose faces ARE
// the per-round feedback (owner's vision, 2026-08-31): hype rooms scream,
// dead rooms boo, mid rooms just watch and film. Deterministic per seed so
// SSR/CSR agree and a given round always shows the same room.
import manifest from '@/lib/crowd-manifest.json';

type Reaction = keyof typeof manifest;

/** Reaction pool by crowd score — weighted names drawn per head. */
function poolFor(score: number): Reaction[] {
  if (score >= 85) return ['hype', 'hype', 'hype', 'cheer', 'cheer', 'record', 'laugh', 'stunned'];
  if (score >= 70) return ['cheer', 'cheer', 'hype', 'record', 'laugh', 'listen', 'stunned'];
  if (score >= 55) return ['cheer', 'listen', 'watch', 'talk', 'think', 'record'];
  if (score >= 40) return ['watch', 'watch', 'listen', 'think', 'talk', 'unimpressed'];
  if (score >= 25) return ['unimpressed', 'disappointed', 'cringe', 'watch', 'talk', 'think'];
  return ['boo', 'boo', 'stunned', 'cringe', 'disappointed', 'unimpressed'];
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
  /** px height of the strip (heads scale off it) */
  height?: number;
  /** heads per row */
  perRow?: number;
}

export default function CrowdStrip({ score, seed, label, height = 116, perRow = 9 }: CrowdStripProps) {
  const rand = rng(`${seed}|${Math.round(score / 5)}`);
  const pool = poolFor(score);
  const headH = Math.round(height * 0.74);

  const pick = (): string => {
    const reaction = pool[Math.floor(rand() * pool.length)];
    const files = (manifest as Record<string, string[]>)[reaction] ?? (manifest as Record<string, string[]>).watch;
    return files[Math.floor(rand() * files.length)];
  };

  const rows = [
    { y: 0, dark: 0.55, z: 1, count: perRow, offset: 0.5 }, // back row, between front shoulders
    { y: height - headH, dark: 1, z: 2, count: perRow, offset: 0 },
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
          background: 'linear-gradient(180deg, #0B0B0D 0%, #17181C 100%)',
          border: '2px solid #000',
          boxShadow: 'inset 0 -18px 24px rgba(0,0,0,.55)',
        }}
      >
        {rows.map((row, ri) => {
          const step = 100 / row.count;
          return Array.from({ length: row.count }, (_, i) => {
            const src = pick();
            const flip = rand() < 0.4;
            const jitter = Math.round((rand() - 0.5) * 8);
            return (
              <img
                key={`${ri}-${i}`}
                src={src}
                alt=""
                className="absolute"
                style={{
                  height: headH,
                  width: 'auto',
                  left: `calc(${(i + row.offset) * step}% - ${headH / 2}px)`,
                  top: row.y + jitter,
                  zIndex: row.z,
                  imageRendering: 'pixelated',
                  filter: `brightness(${row.dark})`,
                  transform: flip ? 'scaleX(-1)' : undefined,
                }}
              />
            );
          });
        })}
        {/* stage light from above */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{ height: 26, background: 'linear-gradient(180deg, rgba(245,115,26,.10), transparent)', zIndex: 3 }}
        />
      </div>
    </div>
  );
}
