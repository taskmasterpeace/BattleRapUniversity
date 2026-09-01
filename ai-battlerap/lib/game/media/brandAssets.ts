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

// ════════════════════════════════════════════════════════════════════════════
// PODCASTS — 1:1 cover art (per-show brand + per-episode).
// The podcast platform is "THE BOOTH"; its mark is a hive-cell with a mic (pairs
// with ClipHive's hex+play, but audio). Each show gets its own square cover.
// ════════════════════════════════════════════════════════════════════════════

const RED = '#E23A2E';
const GREEN = '#35C46B';
const BLUE = '#2F7DD1';

// A mic inside the hive cell — THE BOOTH mark (mics = media/hosts, allowed).
export function boothMark(size = 40, fill = GOLD): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The Booth">
    <path d="${HEX}" transform="translate(3,4)" fill="rgba(0,0,0,.5)"/>
    <path d="${HEX}" fill="${fill}" stroke="#000" stroke-width="4"/>
    <path d="M41,30 a9,9 0 0 1 18,0 v9 a9,9 0 0 1 -18,0 Z" fill="${INK}"/>
    <path d="M35,46 a15,15 0 0 0 30,0" fill="none" stroke="${INK}" stroke-width="4"/>
    <path d="M50,61 v9 M42,72 h16" fill="none" stroke="${INK}" stroke-width="4"/>
  </svg>`;
}

export function boothLockup(height = 34): string {
  const mark = boothMark(height, GOLD).replace(/^<svg /, '<svg style="flex:0 0 auto" ');
  return `<span style="display:inline-flex;align-items:center;gap:10px;line-height:1">${mark}<span style="font-family:Anton,Impact,sans-serif;font-size:${Math.round(height * 0.82)}px;letter-spacing:.01em;text-transform:uppercase;color:${BONE}">The<span style="color:${GOLD}">Booth</span></span></span>`;
}

function starPath(cx: number, cy: number, rO: number, rI: number): string {
  let p = '';
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rO : rI;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    p += (i === 0 ? 'M' : 'L') + (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1) + ' ';
  }
  return p + 'Z';
}

interface ShowBrand { color: string; accent: string; tagline: string; lines: [string, string]; mark: string }

const SHOW_BRAND: Record<string, ShowBrand> = {
  'THE BAR EXAM': {
    color: BLUE, accent: GOLD, tagline: 'grading every round', lines: ['THE BAR', 'EXAM'],
    mark: `<g transform="translate(100,74)"><rect x="-36" y="-27" width="72" height="54" rx="9" fill="${RED}" stroke="#000" stroke-width="4"/><text x="0" y="13" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="40" fill="#fff">A+</text></g>`,
  },
  'PULL UP LATE': {
    color: '#20222b', accent: GOLD, tagline: 'after the smoke clears', lines: ['PULL UP', 'LATE'],
    mark: `<g transform="translate(100,74)"><circle cx="0" cy="0" r="30" fill="${GOLD}"/><circle cx="11" cy="-8" r="25" fill="#20222b"/><circle cx="34" cy="-18" r="2.6" fill="${GOLD}"/><circle cx="27" cy="-30" r="1.8" fill="${GOLD}"/><circle cx="40" cy="-30" r="1.4" fill="${GOLD}"/></g>`,
  },
  'CHAMPION SOUND': {
    color: '#191512', accent: GOLD, tagline: 'the belt talks', lines: ['CHAMPION', 'SOUND'],
    mark: `<g transform="translate(100,74)"><rect x="-44" y="-23" width="88" height="46" rx="11" fill="${GOLD}" stroke="#000" stroke-width="4"/><path d="M-44,0 h-8 M44,0 h8" stroke="${GOLD}" stroke-width="10"/><circle cx="0" cy="0" r="18" fill="#191512" stroke="#000" stroke-width="3"/><path d="${starPath(0, 0, 11, 4.4)}" fill="${GOLD}"/></g>`,
  },
  'THE ROUND TABLE': {
    color: '#16241c', accent: GREEN, tagline: 'the panel weighs in', lines: ['THE ROUND', 'TABLE'],
    mark: `<g transform="translate(100,74)"><circle r="30" fill="none" stroke="${GREEN}" stroke-width="6"/>${[0, 1, 2, 3, 4, 5].map((i) => { const a = (i * Math.PI) / 3 - Math.PI / 2; return `<circle cx="${(38 * Math.cos(a)).toFixed(1)}" cy="${(38 * Math.sin(a)).toFixed(1)}" r="5" fill="${GREEN}"/>`; }).join('')}</g>`,
  },
  'NO HOOK RADIO': {
    color: '#241416', accent: RED, tagline: 'all bars, no chorus', lines: ['NO HOOK', 'RADIO'],
    mark: `<g transform="translate(90,76)"><circle cx="0" cy="0" r="6" fill="${RED}"/><path d="M14,-16 a22,22 0 0 1 0,32" fill="none" stroke="${RED}" stroke-width="4"/><path d="M26,-28 a40,40 0 0 1 0,56" fill="none" stroke="${RED}" stroke-width="4" opacity=".6"/></g>`,
  },
};

/** A show's 1:1 cover art. */
export function podcastShowCover(show: string, size = 200): string {
  const b = SHOW_BRAND[show] ?? SHOW_BRAND['THE BAR EXAM'];
  const gid = 'sc' + show.replace(/\W/g, '');
  return `<svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escAttr(show)} podcast cover">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b.color}"/><stop offset="1" stop-color="${INK}"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#${gid})"/>
    <rect x="0" y="0" width="200" height="200" fill="none" stroke="#000" stroke-width="6"/>
    <rect x="4" y="4" width="192" height="192" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="1.5"/>
    <g transform="translate(8,8) scale(.20)">${boothMarkInner(b.accent)}</g>
    ${b.mark}
    <text x="100" y="146" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="27" fill="${BONE}" letter-spacing=".5">${escText(b.lines[0])}</text>
    <text x="100" y="170" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="27" fill="${b.accent}" letter-spacing=".5">${escText(b.lines[1])}</text>
    <text x="100" y="189" text-anchor="middle" font-family="ui-monospace,monospace" font-size="8.5" fill="rgba(255,255,255,.55)" letter-spacing="1.2">${escText(b.tagline.toUpperCase())}</text>
  </svg>`;
}

function boothMarkInner(fill: string): string {
  return `<path d="${HEX}" fill="${fill}" stroke="#000" stroke-width="4"/><path d="M41,30 a9,9 0 0 1 18,0 v9 a9,9 0 0 1 -18,0 Z" fill="${INK}"/><path d="M35,46 a15,15 0 0 0 30,0" fill="none" stroke="${INK}" stroke-width="4"/><path d="M50,61 v9 M42,72 h16" fill="none" stroke="${INK}" stroke-width="4"/>`;
}

/** A per-episode 1:1 cover — matchup + hook, in the show's world. */
export function podcastEpisodeCover(opts: {
  show: string;
  winner: string;
  loser: string;
  story: string;
  topic: string;
  duration?: string;
}, size = 200): string {
  const look = STORY_LOOK[opts.story] ?? STORY_LOOK.standard;
  const b = SHOW_BRAND[opts.show] ?? SHOW_BRAND['THE BAR EXAM'];
  const wi = initials(opts.winner);
  const li = initials(opts.loser);
  const hook = (opts.topic || look.hook).toUpperCase();
  // Shrink the hook so long lines ("INSTANT CLASSIC") stay inside the square.
  const hookSize = hook.length <= 10 ? 30 : Math.max(17, Math.floor(300 / hook.length));
  const gid = 'ep' + opts.story;
  return `<svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escAttr(opts.winner)} vs ${escAttr(opts.loser)}">
    <defs><radialGradient id="${gid}" cx="50%" cy="42%" r="80%"><stop offset="0" stop-color="${look.color}" stop-opacity=".40"/><stop offset="62%" stop-color="${INK}"/><stop offset="100%" stop-color="#0b0b0e"/></radialGradient></defs>
    <rect width="200" height="200" fill="url(#${gid})"/>
    <rect x="0" y="0" width="200" height="200" fill="none" stroke="#000" stroke-width="6"/>
    <!-- top show strip -->
    <g transform="translate(9,9) scale(.16)">${boothMarkInner(b.accent)}</g>
    <text x="100" y="24" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="13" fill="rgba(255,255,255,.7)" letter-spacing="1">${escText(opts.show)}</text>
    <!-- matchup -->
    ${podMono(66, 78, wi, look.color)}
    ${podMono(134, 78, li, '#6b7280')}
    <text x="100" y="84" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="16" fill="${BONE}" opacity=".9">VS</text>
    <!-- hook -->
    <text x="100" y="140" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="${hookSize}" fill="${look.color}" stroke="#000" stroke-width="4.5" paint-order="stroke" letter-spacing="1">${escText(hook)}</text>
    <!-- bottom -->
    <text x="100" y="176" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="rgba(255,255,255,.6)" letter-spacing="1">${escText(short(opts.winner))} · ${escText(short(opts.loser))}</text>
    ${opts.duration ? `<g transform="translate(150,184)"><rect width="42" height="14" rx="2" fill="rgba(0,0,0,.8)"/><text x="21" y="11" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" fill="#fff">${escText(opts.duration)}</text></g>` : ''}
  </svg>`;
}

function podMono(cx: number, cy: number, txt: string, ring: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="26" fill="#1c1d22" stroke="#000" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="26" fill="none" stroke="${ring}" stroke-width="3"/><text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="21" fill="${BONE}">${escText(txt)}</text>`;
}

/** All podcast show names (matches the composer's PODCASTS). */
export const PODCAST_SHOWS = ['THE BAR EXAM', 'PULL UP LATE', 'CHAMPION SOUND', 'THE ROUND TABLE', 'NO HOOK RADIO'];
