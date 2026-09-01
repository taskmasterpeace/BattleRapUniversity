'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import type {
  Reputation,
  RepLabel,
  RecognitionEntry,
  SignatureWin,
  RecognitionLevel,
} from '@/lib/game/reputation';

/**
 * ReputationPanel — "respect made concrete."
 *
 * Renders the three things a fan actually reads a battler by (owner steer
 * 2026-09-01): the LABELS that stuck, the RECOGNITION MAP (who knows you where),
 * and the SIGNATURE WINS on your resume. No abstract points bar anywhere.
 *
 * Palette matches the career page (#2d2f35 cards, #ff8c42 accent, hard borders).
 */

// Tone = the color a label carries. `rgb` feeds the glass tint + pip fills.
const TONE: Record<RepLabel['tone'], { rgb: string; text: string; tag: string }> = {
  gas: { rgb: '231,178,60', text: 'text-[#E7B23C]', tag: 'GAS' },
  shade: { rgb: '226,58,46', text: 'text-[#ff6a5e]', tag: 'SHADE' },
  neutral: { rgb: '161,161,170', text: 'text-zinc-200', tag: 'STYLE' },
};

// Frosted-glass card: translucent top sheen + inset highlight, riding the hard
// black border and offset shadow the owner loves.
function glass(rgb: string, tintAlpha = 0.1, offset = 3): CSSProperties {
  return {
    background: `linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 46%, rgba(${rgb},0.05)), rgba(${rgb},${tintAlpha})`,
    boxShadow: `${offset}px ${offset}px 0 rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.18)`,
  };
}

const LEVEL_COLOR: Record<RecognitionLevel, string> = {
  respected: '#E7B23C',
  known: '#35C46B',
  buzzing: '#ff8c42',
  heard: '#a1a1aa',
  unknown: '#52525b',
};

const LEVEL_WORD: Record<RecognitionLevel, string> = {
  respected: 'A STAPLE',
  known: 'KNOWN',
  buzzing: 'BUZZING',
  heard: 'HEARD OF',
  unknown: 'UNKNOWN',
};

// 5 named tiers → how many pips light up.
const LEVEL_RANK: Record<RecognitionLevel, number> = {
  unknown: 1,
  heard: 2,
  buzzing: 3,
  known: 4,
  respected: 5,
};

export function ReputationPanel({ reputation }: { reputation: Reputation }) {
  const { summary, labels, recognition, signatureWins, meta } = reputation;

  return (
    <div className="lg:col-span-3 bg-[#2d2f35] border-2 border-[#3a3d44] p-6">
      {/* Header + the one-line word on you */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-[#ff8c42]">
          The Word On You
        </h2>
        <span className="font-mono text-[12px] uppercase tracking-widest text-zinc-500">
          Reputation · what the culture says
        </span>
      </div>
      <p className="text-zinc-300 font-bold uppercase tracking-wide text-sm mb-5">{summary}</p>

      {/* LABELS — the chips that stick */}
      {labels.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-col gap-2">
            {labels.map((l) => (
              <LabelChip key={l.key} label={l} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECOGNITION MAP */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm font-display font-black uppercase tracking-wider text-zinc-200">
              Recognition Map
            </h3>
            <span className="font-mono text-[12px] uppercase tracking-wide text-zinc-500">
              who knows your name
            </span>
          </div>
          {recognition.length === 0 ? (
            <p className="text-zinc-500 text-sm uppercase tracking-wide py-4">
              A stranger everywhere — no scene claims you yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {recognition.map((r) => (
                <RecognitionRow key={r.cityId ?? r.city} entry={r} />
              ))}
            </div>
          )}
        </div>

        {/* SIGNATURE WINS — names on the resume */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm font-display font-black uppercase tracking-wider text-zinc-200">
              Names On Your Resume
            </h3>
            <span className="font-mono text-[12px] uppercase tracking-wide text-zinc-500">
              wins that carry weight
            </span>
          </div>
          {signatureWins.length === 0 ? (
            <p className="text-zinc-500 text-sm uppercase tracking-wide py-4">
              No signature win yet — go take a name people respect.
            </p>
          ) : (
            <div className="space-y-2">
              {signatureWins.map((w) => (
                <SignatureRow key={w.opponentId} win={w} />
              ))}
            </div>
          )}
          {meta.chokes > 0 && (
            <p className="mt-3 font-mono text-[12px] uppercase tracking-wide text-[#ff6a5e]/80">
              ⚠ {meta.chokes} choke{meta.chokes > 1 ? 's' : ''} on tape — the room remembers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LabelChip({ label }: { label: RepLabel }) {
  const tone = TONE[label.tone];
  return (
    <div
      className="relative border-2 border-black px-3.5 py-2.5 backdrop-blur-[3px]"
      style={glass(tone.rgb)}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`font-display font-black uppercase tracking-tight ${tone.text}`}>
          {label.label}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-400 border border-white/15 bg-black/20 px-1.5 py-px">
          {tone.tag}
        </span>
      </div>
      <p className="text-zinc-200 text-sm leading-snug mt-1">{label.reason}</p>
      {label.effect && (
        <p className="font-mono text-[12px] uppercase tracking-wide text-zinc-400/80 mt-1.5">
          → {label.effect}
        </p>
      )}
    </div>
  );
}

function RecognitionRow({ entry }: { entry: RecognitionEntry }) {
  const color = LEVEL_COLOR[entry.level];
  const rank = LEVEL_RANK[entry.level];
  const place = `${entry.city}${entry.state ? `, ${entry.state}` : ''}`;
  return (
    <div
      className="flex items-center justify-between gap-3 border-2 border-black px-3 py-2"
      style={glass('255,255,255', 0.03, 2)}
    >
      <div className="min-w-0">
        <div className="font-display font-black uppercase tracking-tight text-zinc-100 text-sm truncate">
          {place}
          {entry.home && (
            <span className="ml-2 font-mono text-[11px] tracking-widest text-[#ff8c42] align-middle">
              HOME
            </span>
          )}
        </div>
        {/* Tier pips — a rank, not a fill bar */}
        <div className="flex gap-1 mt-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-1.5 w-5 border border-black"
              style={{ background: i < rank ? color : 'rgba(255,255,255,0.06)' }}
            />
          ))}
        </div>
      </div>
      <span
        className="font-mono text-[12px] uppercase tracking-widest shrink-0 border px-2 py-1 self-center"
        style={{ color, borderColor: `${color}66`, background: `${color}14` }}
      >
        {LEVEL_WORD[entry.level]}
      </span>
    </div>
  );
}

function SignatureRow({ win }: { win: SignatureWin }) {
  return (
    <Link
      href={`/battler/${win.opponentId}`}
      className="flex items-center justify-between gap-3 border-2 border-black hover:border-[#ff8c42] px-3 py-2.5 transition-colors group"
      style={glass('255,255,255', 0.03, 2)}
    >
      <div className="min-w-0">
        <div className="font-display font-black uppercase tracking-tight text-zinc-100 group-hover:text-[#ff8c42] transition-colors truncate">
          {win.opponentName}
        </div>
        <div className="font-mono text-[12px] uppercase tracking-wide text-zinc-500">
          {win.tier ? `${win.tier} tier · ` : ''}{Math.round(win.weight)} rating
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {win.bodied && (
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#E7B23C] border border-[#E7B23C]/50 px-1.5 py-0.5">
            BODY
          </span>
        )}
        <span className="font-display font-black text-[#35C46B]">{win.score}</span>
      </div>
    </Link>
  );
}
