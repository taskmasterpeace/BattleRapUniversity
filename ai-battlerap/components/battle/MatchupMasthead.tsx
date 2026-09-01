'use client';

import Link from 'next/link';
import { portraitFillStyle } from '@/lib/sprite-crops';

/**
 * Flyer System battle masthead — red corner vs blue corner with portraits that
 * FILL their frames, poster names, and a center seal (VS) or scoreline + verdict
 * stamp. One component for every battle surface: tale of the tape, replay,
 * round select/results, final results.
 * See docs/design/flyer-system/DESIGN_LANGUAGE.md
 */

/**
 * Battle surfaces use the second portrait in a battler's set (the "battle face")
 * when variants exist — primary stays the identity face. Owner's convention:
 * profile picture + three variant images for flyers/battle screens.
 */
export function battleFace(
  b?: { avatar_url?: string | null; sprite_set?: string[] | null } | null
): string | undefined {
  if (!b) return undefined;
  return (Array.isArray(b.sprite_set) ? b.sprite_set[1] : undefined) ?? b.avatar_url ?? undefined;
}

export interface MastheadFighter {
  id?: string;
  name: string;
  portrait?: string | null;
  tier?: string | null;
  isReal?: boolean;
  record?: string; // "12W – 3L · 1240 ELO"
  won?: boolean;
}

interface MatchupMastheadProps {
  a: MastheadFighter; // red corner
  b: MastheadFighter; // blue corner
  /** center: 'vs' shows the gold VS seal; a score string ("2–1") shows poster digits */
  score?: string;
  stamp?: string; // verdict label under the score ("BODYBAG")
  subLine?: string; // small line under the seal ("SIMS AT DEC 5 · 8PM")
  linkProfiles?: boolean;
}

const CORNERS = {
  red: { color: '#E23A2E', grad: 'linear-gradient(160deg, rgba(226,58,46,.28), rgba(20,16,15,.9) 70%)' },
  blue: { color: '#2F7DD1', grad: 'linear-gradient(200deg, rgba(47,125,209,.28), rgba(14,17,22,.9) 70%)' },
} as const;

function Fighter({
  f,
  corner,
  linkProfile,
}: {
  f: MastheadFighter;
  corner: 'red' | 'blue';
  linkProfile: boolean;
}) {
  const c = CORNERS[corner];
  const name = (
    <p className="nm" style={f.won === false ? { opacity: 0.8 } : undefined}>
      {f.name}
    </p>
  );
  return (
    <div className="fs-fighter">
      <div
        className="frame"
        style={{
          background: c.grad,
          borderTop: `3px solid ${c.color}`,
          borderBottom: '3px solid #000',
          boxShadow: f.won ? `0 0 24px ${c.color}55` : undefined,
        }}
      >
        {f.portrait && (
          <img src={f.portrait} alt={f.name} style={portraitFillStyle(f.portrait, { targetH: 0.98 })} />
        )}
      </div>
      {linkProfile && f.id ? (
        <Link href={`/battler/${f.id}`} className="hover:opacity-80 transition-opacity">
          {name}
        </Link>
      ) : (
        name
      )}
      {/* No "corners" in battle rap (owner law 2026-09-01) — the color marks
          keep side identity without the boxing language. */}
      <div className="tag" style={{ color: c.color, opacity: 1 }}>
        {corner === 'red' ? '◢◢◢' : '◣◣◣'}
      </div>
      <div className="flex items-center gap-2 mt-1.5 justify-center flex-wrap">
        {f.isReal && (
          <span className="px-1.5 py-0.5 bg-[#F5731A] text-black font-mono text-[10px] font-bold uppercase tracking-widest">
            ✓ VERIFIED
          </span>
        )}
        {f.tier && (
          <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">{f.tier} TIER</span>
        )}
      </div>
      {f.record && <p className="font-mono text-[13px] text-zinc-300 mt-1">{f.record}</p>}
      {f.won && (
        <span
          className="inline-block mt-2 px-3 py-1 font-display font-black text-xs uppercase tracking-wider text-black"
          style={{ background: '#E7B23C', border: '2px solid #000' }}
        >
          WINNER
        </span>
      )}
    </div>
  );
}

export default function MatchupMasthead({
  a,
  b,
  score,
  stamp,
  subLine,
  linkProfiles = true,
}: MatchupMastheadProps) {
  return (
    <div className="fs">
      <div className="fs-matchup" style={{ gap: 12 }}>
        <Fighter f={a} corner="red" linkProfile={linkProfiles} />
        <div className="text-center" style={{ zIndex: 2 }}>
          {score ? (
            <>
              <p
                style={{
                  fontFamily: 'var(--font-poster)',
                  fontSize: 'clamp(40px,7vw,64px)',
                  color: '#E7B23C',
                  textShadow: '3px 3px 0 #000',
                  lineHeight: 0.9,
                }}
              >
                {score}
              </p>
              {stamp && (
                <div
                  className="animate-stamp-in inline-block px-3 py-1 mt-2"
                  style={{ border: '3px solid #E7B23C', transform: 'rotate(-3deg)' }}
                >
                  <p className="font-display text-xs md:text-base font-black uppercase tracking-wide" style={{ color: '#E7B23C' }}>
                    {stamp}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="fs-vsseal" style={{ margin: '0 auto' }}>
              VS
            </div>
          )}
          {subLine && (
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400 mt-2">{subLine}</p>
          )}
        </div>
        <Fighter f={b} corner="blue" linkProfile={linkProfiles} />
      </div>
    </div>
  );
}
