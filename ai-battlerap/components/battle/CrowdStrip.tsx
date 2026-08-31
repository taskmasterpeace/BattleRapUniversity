'use client';

// THE ROOM — three rows deep (owner's layout: front row / row behind /
// background row), drawn from the tagged audience family. Every member
// carries mood + demo (urban / non_urban / foreign) + gender, so different
// venues pull different crowds — an URL-coded room doesn't look like a
// KOTD-coded room. Deterministic per seed so SSR/CSR agree.
import familyRaw from '@/lib/crowd-family.json';
import { VENUE_MIX, type Venue } from '@/lib/crowd-venue';

type Member = { src: string; mood: string; demo: string; gender: string };
const FAMILY = familyRaw as Member[];

export type { Venue };
export { venueForLeague } from '@/lib/crowd-venue';

/** Pool of moods drawn per head, weighted by the crowd score. */
function poolFor(score: number): string[] {
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
  /** which crowd shows up — pass venueForLeague(league.name) */
  venue?: Venue;
  label?: string;
  height?: number;
  /** heads in the FRONT row (other rows derive) */
  perRow?: number;
}

export default function CrowdStrip({
  score,
  seed,
  venue = 'urban',
  label,
  height = 150,
  perRow = 7,
}: CrowdStripProps) {
  const rand = rng(`${seed}|${Math.round(score / 5)}|${venue}`);
  const pool = poolFor(score);
  const mix = VENUE_MIX[venue] ?? VENUE_MIX.urban;

  const pickDemo = (): string => {
    const r = rand();
    let acc = 0;
    for (const [demo, w] of Object.entries(mix)) {
      acc += w;
      if (r <= acc) return demo;
    }
    return 'urban';
  };

  const pick = (): string => {
    const mood = pool[Math.floor(rand() * pool.length)];
    const demo = pickDemo();
    let candidates = FAMILY.filter((m) => m.mood === mood && m.demo === demo);
    if (candidates.length === 0) candidates = FAMILY.filter((m) => m.mood === mood);
    if (candidates.length === 0) candidates = FAMILY;
    return candidates[Math.floor(rand() * candidates.length)].src;
  };

  // Three PACKED rows — a camera frame of a crowd, not people on a shelf.
  // Width-percent sizing guarantees shoulders OVERLAP at any container width
  // (img width > horizontal step), and the frame crops waists at the bottom
  // and the back row at the top, so bodies fill the frame edge to edge.
  const rows = [
    { count: perRow + 4, width: 12.5, bottom: 44, bright: 0.22, z: 1, offset: 0.5 },
    { count: perRow + 2, width: 14.5, bottom: 20, bright: 0.55, z: 2, offset: 0 },
    { count: perRow, width: 17, bottom: -16, bright: 1, z: 3, offset: 0.4 },
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
          return Array.from({ length: row.count + 1 }, (_, i) => {
            const src = pick();
            const flip = rand() < 0.45;
            const jitter = (rand() - 0.5) * 5; // % of height
            return (
              <img
                key={`${ri}-${i}`}
                src={src}
                alt=""
                className="absolute"
                style={{
                  width: `${row.width}%`,
                  height: 'auto',
                  left: `${((i + row.offset) * step - row.width / 2).toFixed(2)}%`,
                  bottom: `${(row.bottom + jitter).toFixed(1)}%`,
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
