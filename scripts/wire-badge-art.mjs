#!/usr/bin/env node
// Badge medallion audit + wiring.
//
// The 120 medallions in ai-battlerap/public/sprites/badges/ were generated from three
// 40-badge contact sheets with names BAKED INTO THE ART but no code mapping. The
// number->label table below was recovered by reading the sheets (raw images/badges/*),
// and validated against the two known anchors: badge_046 = REBUTTAL KING and
// badge_054 = WELL RESEARCHED (row-major numbering confirmed).
//
// This script:
//   1. copies all 120 pngs flat into public/sprites/badges/badge_NNN.png
//   2. matches every ALL_BADGES entry to a medallion (exact name -> curated alias)
//   3. writes lib/badge-art.ts (single source of truth) + the audit report
//
// Run: node scripts/wire-badge-art.mjs

import fs from 'node:fs'
import path from 'node:path'

// ---- recovered number -> label table (read off the three sheets) ----
const SHEET_LABELS = (
  'ANGLES,PERSONALS,DISRESPECT,COMEDY,JOKES,SARCASM,SELF-DEPRECATING,DRY HUMOR,' +
  'SLAPSTICK,CONCEPT BATTLES,GRITTY,STREET TALK,BRAGGADOCIOUS,OG BARS,METAPHORS,SIMILES,' +
  'WORDPLAY,WITTY WORDPLAY,SCHEMES,VIOLENT IMAGERY,MULTISYLLABIC RHYMES,INTRICATE SCHEMES,SPORTS REFERENCES,POP CULTURE REFERENCES,' +
  'HISTORICAL REFERENCES,LOCATIONAL REFERENCES,POLITICAL COMMENTARY,SOCIAL COMMENTARY,STORYTELLING,MOTIVATIONAL,PUNCHLINES,NAME FLIPS,' +
  'SLOGAN,CONTROVERSIAL,SHOCK VALUE,FREESTYLES,REBUTTALS,PUNCHLINE KING,SCHEME SPECIALIST,METAPHOR MASTER,' +
  'WORDPLAY WIZARD,FREESTYLE GENIUS,CREATIVITY BEAST,CONSISTENT WRITER,ANGLE MASTER,REBUTTAL KING,GREAT SETUPS,DOUBLE ENTENDRE EXPERT,' +
  'UNPREDICTABLE,PEN GAME ELITE,QUOTABLE MACHINE,HARD-HITTING HAYMAKERS,MULTISYLLABIC MASTER,WELL RESEARCHED,WELL-TIMED HUMOR,AGGRESSIVE,' +
  'MENACING,SPEED RAPPING,SLOW FLOW,SMOOTH FLOW,EXPLOSIVE,PASSIONATE,NONCHALANT,DEADPAN,' +
  'RAPID-FIRE,MELODIC,IMPASSIONED,COLD,EMPATHETIC,POWER STANCE,FLUID MOVEMENT,STAGE DOMINATION,' +
  'CROWD INTERACTION,DYNAMIC RANGE,CHARISMATIC,CROWD FAVORITE,SHOW STEALER,BIG STAGE PERFORMER,CLUTCH PERFORMER,RESPECTED VETERAN,' +
  'RECYCLER,BITER,ONE-TRICK PONY,SHOCK VALUE ABUSER,LAZY WRITER,PREDICTABLE,REACH GOD,FILLER ABUSER,' +
  'OUTDATED,REPETITIVE,WEAK SETUPS,GIMMICK ABUSER,SHALLOW RESEARCH,CHOKER,ONE-HIT WONDER,OVERHYPED,' +
  'INCONSISTENT,CROWD KILLER,TIME WASTER,MUMBLER,MONOTONE,AWKWARD PRESENCE,ENERGY DRAINER,OFF-BEAT,' +
  'SORE LOSER,CANCELLER,DRAMA STARTER,EXCUSE MAKER,UNRELIABLE,GHOST WRITER,SCAMMER,FAKE TOUGH GUY,' +
  'CLOUT CHASER,SELLOUT,EGO ISSUES,KNOWN CHOKER,CORNY PUNCHLINES,INAUTHENTIC,TREND FOLLOWER,POOR NETWORKING'
).split(',')

// ---- curated aliases: ALL_BADGES id -> medallion number (semantic matches; reuse allowed) ----
const CURATED = {
  // writing
  master_wordsmith: 41, technical_writer: 22, angle_assassin: 1, storyteller: 29,
  bar_god: 50, multi_syllabic: 53, haymaker_specialist: 52, wordsmith: 17,
  clever_writer: 18, quotable: 51, layered_writer: 48, pocket_checker: 3,
  flip_master: 32, structure_savant: 19, versatile_writer: 49,
  // performance
  showman: 75, energy_master: 61, vocal_presence: 74, ring_general: 72,
  aggressive_performer: 56, crowd_reader: 69, composed: 63, animated: 67,
  intimidator: 57, mic_control: 70, stage_veteran: 80, crowd_hyper: 73,
  tempo_master: 58, physical_performer: 71, voice_modulator: 66,
  crowd_silencer: 68, moment_maker: 77,
  // reputation
  street_legend: 14, main_stage_ready: 78, hype_machine: 13, fan_favorite: 76,
  consistent_performer: 44, headline_maker: 34,
  // content_style
  aggressive_style: 56, lyrical_purist: 17, entertainer: 9, personals_specialist: 2,
  freestyle_artist: 36, gun_bar_specialist: 20, comedy_battler: 4, sports_bars: 23,
  pop_culture: 24, battle_rapper: 14, poet: 15, conscious_battler: 28,
  actor: 10, street_battler: 12,
  // special_ability
  ring_rust: 89, controversial_loss: 105, exposed: 112, slumping: 97,
  beef_distracted: 107, burned_out: 103, photographic_memory: 25, quick_writer: 65,
  team_player: 69, last_minute_larry: 99, preparation_monster: 54,
  battle_technician: 22, time_management_expert: 55, consummate_professional: 80,
  consistent_grinder: 44, self_aware: 7, overconfident: 115, bars_on_lock: 51,
  gunslinger: 20,
}

const norm = (s) => s.toUpperCase().replace(/KING\/QUEEN/g, 'KING').replace(/[^A-Z0-9]+/g, ' ').trim()
const byLabel = {}
SHEET_LABELS.forEach((l, i) => (byLabel[norm(l)] = i + 1))

// load ALL_BADGES without ts tooling: naive parse of ids + names from the source
const src = fs.readFileSync('lib/all-badges.ts', 'utf8')
const entries = [...src.matchAll(/id:\s*"([^"]+)",\s*\n\s*name:\s*"([^"]+)",[\s\S]*?rarity:\s*"([^"]+)",\s*\n\s*category:\s*"([^"]+)"/g)]
  .map((m) => ({ id: m[1], name: m[2], rarity: m[3], category: m[4] }))
if (entries.length < 100) {
  console.error('parse problem: only found', entries.length, 'badges in lib/all-badges.ts')
  process.exit(1)
}

// 1) copy medallions flat into the live tree
const SRC_DIRS = [
  'ai-battlerap/public/sprites/badges/image_1764193680087', // 001-040
  'ai-battlerap/public/sprites/badges/image_1764193677602', // 041-080
  'ai-battlerap/public/sprites/badges/image_1764193675435', // 081-120
]
fs.mkdirSync('public/sprites/badges', { recursive: true })
let copied = 0
for (const d of SRC_DIRS) {
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.png')) continue
    fs.copyFileSync(path.join(d, f), path.join('public/sprites/badges', f))
    copied++
  }
}

// 2) match
const map = {}
const gaps = []
const rows = []
for (const b of entries) {
  let num = byLabel[norm(b.name)]
  let how = 'exact'
  if (!num && CURATED[b.id]) {
    num = CURATED[b.id]
    how = 'curated'
  }
  if (num) {
    map[b.id] = num
    rows.push({ ...b, num, how, label: SHEET_LABELS[num - 1] })
  } else {
    gaps.push(b)
  }
}

// 3) emit lib/badge-art.ts
const pad = (n) => String(n).padStart(3, '0')
const mapLines = rows
  .map((r) => `  ${JSON.stringify(r.id)}: "/sprites/badges/badge_${pad(r.num)}.png", // ${r.name}${r.how === 'curated' ? ` (art: ${r.label})` : ''}`)
  .join('\n')
const nameLines = rows.map((r) => `  ${JSON.stringify(r.name.toUpperCase())}: "/sprites/badges/badge_${pad(r.num)}.png",`).join('\n')
const gapLines = gaps.map((g) => `  ${JSON.stringify(g.id)}, // ${g.name} (${g.category}/${g.rarity})`).join('\n')
fs.writeFileSync(
  'lib/badge-art.ts',
  `// AUTO-GENERATED by scripts/wire-badge-art.mjs — single source of truth for badge medallion art.
// Numbering recovered from the three generation contact sheets (raw images/badges/*);
// validated anchors: badge_046 = REBUTTAL KING, badge_054 = WELL RESEARCHED.
// Regenerate: node scripts/wire-badge-art.mjs

/** badge id -> medallion sprite path */
export const BADGE_ART: Record<string, string> = {
${mapLines}
}

/** UPPERCASE badge display-name -> medallion sprite path (style tags & legacy name lookups) */
export const BADGE_ART_BY_NAME: Record<string, string> = {
${nameLines}
}

/** badges with no medallion art yet — render emoji/initial fallback, queue for generation */
export const BADGE_ART_GAPS: string[] = [
${gapLines}
]

/** Resolve art for a badge by id or display name. */
export function badgeArt(idOrName?: string | null): string | undefined {
  if (!idOrName) return undefined
  return BADGE_ART[idOrName] ?? BADGE_ART_BY_NAME[idOrName.toUpperCase().trim()]
}
`,
)

// 4) audit report
const catCount = {}
gaps.forEach((g) => (catCount[g.category] = (catCount[g.category] ?? 0) + 1))
const report = `# Badge Medallion Art — Audit & Mapping
*Generated by scripts/wire-badge-art.mjs on 2026-08-31.*

## Headline
- **${entries.length} badges** in \`lib/all-badges.ts\` · **120 medallions** recovered from \`ai-battlerap/public/sprites/badges/\` (3 sheets × 40, names baked into the art, no code mapping existed).
- Numbering recovered visually from the contact sheets and **validated** on both known anchors (046 REBUTTAL KING, 054 WELL RESEARCHED).
- **${rows.length} badges mapped** (${rows.filter((r) => r.how === 'exact').length} exact-name, ${rows.filter((r) => r.how === 'curated').length} curated semantic) · **${gaps.length} true gaps** (no matching concept in the art set).
- All 120 medallions copied flat to \`public/sprites/badges/badge_001..120.png\`; source of truth: \`lib/badge-art.ts\` (\`badgeArt(idOrName)\`).

## Gaps by category
${Object.entries(catCount).map(([c, n]) => `- **${c}**: ${n}`).join('\n')}

## Gap list (queue for generation — style ref badge_046, 112px, house circle/shield style)
| id | name | category | rarity |
|---|---|---|---|
${gaps.map((g) => `| ${g.id} | ${g.name} | ${g.category} | ${g.rarity} |`).join('\n')}

## Full mapping
| badge id | badge name | medallion | art label | match |
|---|---|---|---|---|
${rows.map((r) => `| ${r.id} | ${r.name} | badge_${pad(r.num)} | ${r.label} | ${r.how} |`).join('\n')}

## Spare medallions (art with no badge yet — free inventory for future badges)
${SHEET_LABELS.map((l, i) => ({ l, n: i + 1 }))
  .filter(({ n }) => !rows.some((r) => r.num === n))
  .map(({ l, n }) => `- badge_${pad(n)} ${l}`)
  .join('\n')}
`
fs.writeFileSync('docs/design/flyer-system/BADGE_ART_AUDIT.md', report)

console.log(`copied ${copied} medallions -> public/sprites/badges/`)
console.log(`mapped ${rows.length}/${entries.length} (exact ${rows.filter((r) => r.how === 'exact').length}, curated ${rows.filter((r) => r.how === 'curated').length}), gaps ${gaps.length}`)
console.log('wrote lib/badge-art.ts + docs/design/flyer-system/BADGE_ART_AUDIT.md')
