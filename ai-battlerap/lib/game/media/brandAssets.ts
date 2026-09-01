/**
 * ClipHive brand + video thumbnails — pure SVG builders.
 *
 * ClipHive is the game's OWN video platform (a fake YouTube for the battle-rap
 * world) — never YouTube's marks. Our style: charcoal + orange/gold, hard edges,
 * offset shadows (the flyer language). The mark is a HIVE cell (hexagon) with a
 * play clip inside — clips + hive.
 *
 * Everything returns an SVG STRING so it's reusable in React (inline) and in the
 * playtest mocks. Self-contained, no external assets, no purple.
 */

// ── palette ─────────────────────────────────────────────────────────────────
const INK = '#141418';
const ORANGE = '#ff8c42';
const GOLD = '#E7B23C';
const BONE = '#F5F3EE';

/** Story → thumbnail accent + hook word. */
export const STORY_LOOK: Record<string, { color: string; hook: string }> = {
  upset: { color: '#ff8c42', hook: 'UPSET?!' },
  dominant: { color: '#E7B23C', hook: 'BODIED' },
  choke: { color: '#E23A2E', hook: 'HE CHOKED' },
  classic: { color: '#35C46B', hook: 'CLASSIC' },
  robbery: { color: '#E23A2E', hook: 'ROBBED?!' },
  standard: { color: '#2F7DD1', hook: 'THE RECAP' },
};

const HEX = 'M50,7 L87,28.5 L87,71.5 L50,93 L13,71.5 L13,28.5 Z';
const PLAY = 'M40,32 L40,68 L72,50 Z';

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** The ClipHive hive-cell + play mark. Square. */
export function clipHiveMark(size = 40, fill = ORANGE): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ClipHive">
    <path d="${HEX}" transform="translate(3,4)" fill="rgba(0,0,0,.5)"/>
    <path d="${HEX}" fill="${fill}" stroke="#000" stroke-width="4"/>
    <path d="${HEX}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.5" transform="scale(.86) translate(8,8)"/>
    <path d="${PLAY}" fill="${INK}" stroke="#000" stroke-width="1"/>
  </svg>`;
}

/** Full ClipHive lockup: mark + wordmark. */
export function clipHiveLockup(height = 34): string {
  const mark = clipHiveMark(height, ORANGE)
    .replace(/^<svg /, '<svg style="flex:0 0 auto" ');
  return `<span style="display:inline-flex;align-items:center;gap:10px;line-height:1">
    ${mark}
    <span style="font-family:Anton,Impact,sans-serif;font-size:${Math.round(height * 0.82)}px;letter-spacing:.01em;text-transform:uppercase;color:${BONE}">Clip<span style="color:${ORANGE}">Hive</span></span>
  </span>`;
}

/**
 * A drama-forward 16:9 video thumbnail — matchup monograms, a big hook word,
 * duration badge, ClipHive watermark. (Real portraits slot into the monograms
 * later; this is the authored placeholder.)
 */
export function videoThumbnailSVG(opts: {
  winner: string;
  loser: string;
  story: string;
  duration: string;
  hook?: string;
}): string {
  const look = STORY_LOOK[opts.story] ?? STORY_LOOK.standard;
  const color = look.color;
  const hook = (opts.hook ?? look.hook).toUpperCase();
  const wi = initials(opts.winner);
  const li = initials(opts.loser);

  return `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${escAttr(opts.winner)} vs ${escAttr(opts.loser)}">
    <defs>
      <radialGradient id="g" cx="50%" cy="38%" r="75%">
        <stop offset="0%" stop-color="${color}" stop-opacity=".38"/>
        <stop offset="60%" stop-color="${INK}" stop-opacity="1"/>
        <stop offset="100%" stop-color="#0b0b0e" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="320" height="180" fill="url(#g)"/>
    <rect width="320" height="180" fill="none" stroke="#000" stroke-width="4"/>
    <!-- accent slash -->
    <path d="M0,150 L320,120 L320,132 L0,162 Z" fill="${color}" opacity=".9"/>
    <!-- monograms -->
    ${monogram(78, 66, wi, color)}
    ${monogram(242, 66, li, '#6b7280')}
    <text x="160" y="72" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="20" fill="${BONE}" opacity=".9">VS</text>
    <text x="78" y="116" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="13" fill="${BONE}" letter-spacing=".5">${escText(short(opts.winner))}</text>
    <text x="242" y="116" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="13" fill="#9aa0aa" letter-spacing=".5">${escText(short(opts.loser))}</text>
    <!-- hook -->
    <text x="160" y="150" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="34" fill="${color}" stroke="#000" stroke-width="5" paint-order="stroke" letter-spacing="1">${escText(hook)}</text>
    <!-- duration -->
    <g transform="translate(268,158)"><rect x="0" y="0" width="44" height="16" rx="2" fill="rgba(0,0,0,.82)"/><text x="22" y="12" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" fill="#fff">${escText(opts.duration)}</text></g>
    <!-- ClipHive watermark -->
    <g transform="translate(8,8)"><path d="${HEX}" transform="scale(.16)" fill="${ORANGE}" stroke="#000" stroke-width="6"/><path d="${PLAY}" transform="scale(.16)" fill="${INK}"/></g>
  </svg>`;
}

function monogram(cx: number, cy: number, txt: string, ring: string): string {
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="30" fill="#1c1d22" stroke="#000" stroke-width="4"/>
    <circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="${ring}" stroke-width="3"/>
    <text x="${cx}" y="${cy + 8}" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="24" fill="${BONE}">${escText(txt)}</text>
  </g>`;
}

function short(name: string): string {
  return name.length > 14 ? name.slice(0, 13) + '…' : name;
}
function escText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s: string): string {
  return escText(s).replace(/"/g, '&quot;');
}

/** Data-URI wrapper for use as an <img src>. */
export function svgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
