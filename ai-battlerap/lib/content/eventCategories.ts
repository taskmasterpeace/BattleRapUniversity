/**
 * Category identity — LIFE_EVENTS_UI.md §1.1.
 * Rose replaces the banned purple for relationship (house law: NO purple).
 */
export const EVENT_CATEGORIES: Record<
  string,
  { label: string; edge: string; text: string; tint: string; border: string }
> = {
  career: {
    label: 'CAREER',
    edge: 'bg-[#ff8c42]',
    text: 'text-[#ff8c42]',
    tint: 'bg-[#ff8c42]/10',
    border: 'border-[#ff8c42]/40',
  },
  financial: {
    label: 'FINANCIAL',
    edge: 'bg-emerald-500',
    text: 'text-emerald-400',
    tint: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
  },
  scandal: {
    label: 'SCANDAL',
    edge: 'bg-red-500',
    text: 'text-red-400',
    tint: 'bg-red-500/10',
    border: 'border-red-500/40',
  },
  personal: {
    label: 'PERSONAL',
    edge: 'bg-sky-500',
    text: 'text-sky-400',
    tint: 'bg-sky-500/10',
    border: 'border-sky-500/40',
  },
  relationship: {
    label: 'RELATIONSHIP',
    edge: 'bg-rose-400',
    text: 'text-rose-400',
    tint: 'bg-rose-400/10',
    border: 'border-rose-400/40',
  },
};

export const SEVERITY_STYLES: Record<string, { label: string; text: string }> = {
  minor: { label: 'MINOR', text: 'text-zinc-400' },
  moderate: { label: 'MODERATE', text: 'text-yellow-500' },
  major: { label: 'MAJOR', text: 'text-[#ff8c42]' },
  critical: { label: 'CRITICAL', text: 'text-red-400' },
};

export function categoryOf(category: string | null | undefined) {
  return EVENT_CATEGORIES[category ?? 'career'] ?? EVENT_CATEGORIES.career;
}

export function severityOf(severity: string | null | undefined) {
  return SEVERITY_STYLES[severity ?? 'moderate'] ?? SEVERITY_STYLES.moderate;
}
