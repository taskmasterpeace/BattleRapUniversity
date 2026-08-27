/**
 * Event art resolution — LIFE_EVENTS_UI.md §1.2 / §5.1.
 *
 * Resolution order: template-specific art → critical variant → category art.
 * Never emoji, never a broken image (callers render nothing when null).
 *
 * Files live in public/sprites/events/ (generated 2026-08-26, commit adf1c86;
 * 640×256 headers displayed 2× with image-rendering: pixelated per
 * docs/CANVAS_SIZES.md EVENT_ART). The DB-backed event_art_registry arrives
 * with Life Events v2 step 2 — until then this static map IS the registry.
 */

export type EventArt = {
  header: string;
  thumb: string | null;
  /** CSS object-position focal point for the mobile crop */
  focal: string;
};

/** Template codes that shipped with their own art (launch set §1.2.1). */
const TEMPLATE_ART = new Set([
  'CHOKE_EVENT',
  'CLOSE_VICTORY',
  'NARROW_LOSS',
  'DOMINANT_VICTORY',
  'BODYBAG_HYPE',
  'RIVAL_CALLOUT',
  'MEDIA_INTERVIEW',
  'FINANCIAL_CRISIS',
  'CHOKE_IN_BIG_BATTLE',
  'CAREER_CRISIS',
  'FAMILY_WEDDING',
  'BAD_LOSS',
]);

const CATEGORIES = new Set(['career', 'financial', 'scandal', 'personal', 'relationship']);

/** Off-center focal subjects (matches the committed manifest.json). */
const FOCAL: Record<string, string> = {
  CHOKE_EVENT: '50% 40%',
  DOMINANT_VICTORY: '45% 35%',
  NARROW_LOSS: '40% 50%',
  RIVAL_CALLOUT: '45% 50%',
};

export function getEventArt(
  templateCode: string | null | undefined,
  category: string | null | undefined,
  severity: string | null | undefined
): EventArt | null {
  const base = '/sprites/events';

  if (templateCode && TEMPLATE_ART.has(templateCode)) {
    return {
      header: `${base}/templates/${templateCode}-header.png`,
      thumb: `${base}/templates/${templateCode}-thumb.png`,
      focal: FOCAL[templateCode] ?? '50% 50%',
    };
  }

  const cat = category && CATEGORIES.has(category) ? category : 'career';
  const critical = severity === 'critical';
  return {
    header: `${base}/${cat}-header${critical ? '-critical' : ''}.png`,
    thumb: `${base}/${cat}-thumb.png`,
    focal: '50% 50%',
  };
}

/** Empty-state art for the quiet inbox. */
export const QUIET_ART = '/sprites/events/quiet.png';
