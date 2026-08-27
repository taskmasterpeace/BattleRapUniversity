/**
 * EffectChips — effect stakes as icon-led chips (LIFE_EVENTS_UI.md §3.5,
 * owner directive 2026-08-26: "little symbols so they know").
 *
 * One icon per effect FAMILY, never per key:
 *   star=reputation · dollar=money · heart=family · shield=resilience ·
 *   pen=writing · bolt=performance · eye=public knowledge ·
 *   triangle=risk/penalty · moon=quiet/rest
 */

type ChipDef = { icon: keyof typeof ICONS; label: string; suffix?: string };

const ICONS = {
  star: <path d="M12 2l2.9 6.3 6.6.8-4.9 4.6 1.3 6.6L12 17l-5.9 3.3 1.3-6.6L2.5 9.1l6.6-.8z" />,
  dollar: (
    <>
      <path d="M12 2v20" />
      <path d="M17 5.5H9.5a3 3 0 000 6h5a3 3 0 010 6H6.5" />
    </>
  ),
  heart: <path d="M12 21C7 16.5 3 13 3 8.7A4.7 4.7 0 0112 6a4.7 4.7 0 019 2.7C21 13 17 16.5 12 21z" />,
  shield: <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />,
  pen: <path d="M17 3l4 4L8 20l-5 1 1-5z" />,
  bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6z" />,
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  triangle: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v5M12 18.5v.5" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />,
} as const;

const FAMILY: Record<string, { icon: keyof typeof ICONS; label: string }> = {
  reputation: { icon: 'star', label: 'REPUTATION' },
  financial_stability: { icon: 'dollar', label: 'FINANCES' },
  cash: { icon: 'dollar', label: 'CASH' },
  family_bond: { icon: 'heart', label: 'FAMILY BOND' },
  resilience: { icon: 'shield', label: 'RESILIENCE' },
  lyricism: { icon: 'pen', label: 'LYRICISM' },
  wordplay: { icon: 'pen', label: 'WORDPLAY' },
  creativity: { icon: 'pen', label: 'CREATIVITY' },
  flow: { icon: 'pen', label: 'FLOW' },
  stage_presence: { icon: 'bolt', label: 'STAGE PRESENCE' },
  crowd_control: { icon: 'bolt', label: 'CROWD CONTROL' },
  delivery: { icon: 'bolt', label: 'DELIVERY' },
  public_knowledge: { icon: 'eye', label: 'PUBLIC EYE' },
  prep_bonus_writing: { icon: 'pen', label: 'WRITING PREP' },
  prep_bonus_performance: { icon: 'bolt', label: 'PERFORMANCE PREP' },
  prep_bonus_all: { icon: 'bolt', label: 'ALL PREP' },
  prep_penalty: { icon: 'triangle', label: 'PREP' },
  stress: { icon: 'moon', label: 'STRESS' },
};

const NEXT_BATTLE_KEYS = new Set([
  'prep_bonus_writing',
  'prep_bonus_performance',
  'prep_bonus_all',
  'prep_penalty',
]);

function chipsFor(effects: Record<string, unknown> | null | undefined): (ChipDef & { value: number })[] {
  if (!effects) return [];
  const out: (ChipDef & { value: number })[] = [];
  for (const [key, raw] of Object.entries(effects)) {
    if (typeof raw !== 'number' || raw === 0) continue;
    const fam = FAMILY[key];
    if (!fam) continue; // hidden layer (echo/controversy keys) never renders — §3.6
    out.push({
      icon: fam.icon,
      label: fam.label,
      value: raw,
      suffix: NEXT_BATTLE_KEYS.has(key) ? 'NEXT BATTLE' : undefined,
    });
  }
  return out;
}

function EffectIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-[11px] h-[11px] flex-none" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

export default function EffectChips({ effects }: { effects: Record<string, unknown> | null | undefined }) {
  const chips = chipsFor(effects);
  if (chips.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-1.5 mt-2">
      {chips.map((c, i) => {
        const up = c.value > 0;
        const mag = Math.abs(c.value);
        const num = Number.isInteger(mag) ? mag : mag.toFixed(1);
        return (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-2 py-0.5 bg-[#101114] border font-mono text-[10px] uppercase tracking-wide ${
              up
                ? 'text-green-400 border-green-500/40'
                : 'text-red-400 border-red-500/40'
            }`}
          >
            <EffectIcon name={c.icon} />
            {up ? '+' : '−'}{num} {c.label}
            {c.suffix && <span className="text-zinc-500">· {c.suffix}</span>}
          </span>
        );
      })}
    </span>
  );
}
