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

/**
 * Continuous mood mix — the room IS the performance meter. Weights slide with
 * the crowd score so a player can literally read how they're doing:
 *   85+  the room explodes (hype + OOOH hands-on-head)
 *   ~70  bars landing (oooh, nods, laughs, scattered hype)
 *   ~50  engaged but split (nods, side-talk, some crossed arms)
 *   ~35  losing them (unimpressed, dismissive waves)
 *   <25  hostile (boos, waved off)
 * Arms-crossed "watch" is deliberately capped so no room reads as a wall of
 * folded arms (owner note, 2026-08-31).
 */
function moodWeights(score: number): Record<string, number> {
  const s = Math.max(0, Math.min(100, score));
  const up = (a: number, b: number) => Math.max(0, Math.min(1, (s - a) / (b - a)));
  const down = (a: number, b: number) => 1 - up(a, b);
  const bell = (a: number, m: number, b: number) => (s <= m ? up(a, m) : down(m, b));
  return {
    hype: 2.2 * up(55, 90),
    oooh: 1.9 * up(45, 85),
    laugh: 0.8 * up(40, 80),
    nod: 1.6 * bell(35, 60, 85),
    talk: 1.0 * bell(20, 45, 70),
    watch: 0.9 * bell(15, 45, 75) + 0.15,
    unimpressed: 1.4 * down(20, 55),
    dismiss: 1.2 * down(10, 45),
    boo: 2.0 * down(5, 30),
  };
}

function pickWeighted(weights: Record<string, number>, r: number): string {
  let total = 0;
  for (const w of Object.values(weights)) total += w;
  let acc = 0;
  for (const [mood, w] of Object.entries(weights)) {
    acc += w / total;
    if (r <= acc) return mood;
  }
  return 'watch';
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
  /** streamed-online framing: battle.context 'ppv' | 'on_cam' adds a live chip */
  broadcast?: 'ppv' | 'on_cam' | null;
  label?: string;
  height?: number;
  /** heads in the FRONT row (other rows derive) */
  perRow?: number;
}

export default function CrowdStrip({
  score,
  seed,
  venue = 'urban',
  broadcast = null,
  label,
  height = 150,
  perRow = 7,
}: CrowdStripProps) {
  const rand = rng(`${seed}|${Math.round(score / 5)}|${venue}`);
  const weights = moodWeights(score);
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

  /** Front row telegraphs hardest: sharpen weights so its moods read decisive. */
  const pick = (sharpen = 1): string => {
    const w =
      sharpen === 1
        ? weights
        : Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, Math.pow(v, sharpen)]));
    const mood = pickWeighted(w, rand());
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
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-1.5">{label}</p>
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
            const src = pick(row.z === 3 ? 1.6 : 1);
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
        {/* streamed-online framing — the second audience is watching */}
        {broadcast && (
          <span
            className="absolute top-1.5 right-1.5 flex items-center gap-1.5 px-2 py-1"
            style={{ zIndex: 5, background: 'rgba(8,9,12,.85)', border: '1px solid #2E2F35' }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E23A2E] animate-pulse" />
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: '#F4F4F6' }}>
              {broadcast === 'ppv' ? 'LIVE PPV' : 'ON CAM'}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
