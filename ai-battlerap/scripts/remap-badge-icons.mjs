// Re-map badge icon_url based on baked-in sprite labels.
//
// Inputs:
//   - scripts/badge-sprite-labels.json: { "/sprites/badges/.../badge_NNN.png": "GRITTY", ... }
//   - badge_costs table (badge_name + badge_code)
//
// Strategy:
//   1. Normalize both badge names and sprite labels (uppercase, strip non-alphanumeric).
//   2. Score each (badge, sprite) pair:
//        - exact normalized match: 100
//        - sprite label ⊆ badge name (as full word): 80
//        - badge name ⊆ sprite label: 75
//        - token overlap (Jaccard) * 70: up to 70
//        - else: 0
//   3. Greedy assignment: for each badge in stable order, pick best unused sprite
//      with score >= MIN_SCORE. If none, fall back to a leftover sprite.
//   4. Update DB.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const MIN_SCORE = 15;

// Hand-picked synonyms for badges with no semantic stem match in the sprite library.
// Maps badge_name → exact sprite label to prefer. Validated against the sprite list.
const SYNONYMS = {
  'Off the Top': 'FREESTYLES',         // freestyle = off the top of your head
  'Disrespectful': 'DISRESPECT',       // -ful suffix
  'Comedian': 'COMEDY',                // -ian suffix
  'Redundant': 'REPETITIVE',           // semantic
  'Consistent Performer': 'INCONSISTENT', // closest topic match (no positive sprite)
  'Stiff Body Language': 'POWER STANCE',  // body/stance topic
};

// Stem function: strip common English suffixes so "rapper" and "rapping" both
// reduce to "rap"; "storyteller" and "storytelling" reduce to "storytel".
// Extended: -ful (disrespectful→disrespect), -ian (comedian→comed),
// -ous, -ic, -al, -ist for broader morphological coverage.
function stem(word) {
  let w = word.toLowerCase();
  // Order matters: longest suffixes first so "ing" beats "g", "ers" beats "s", etc.
  for (const suf of ['ation', 'ing', 'ers', 'ful', 'ian', 'ist', 'ous', 'ies', 'ic', 'al', 'er', 'ed', 'es', 's']) {
    if (w.length > suf.length + 2 && w.endsWith(suf)) {
      w = w.slice(0, -suf.length);
      break;
    }
  }
  return w;
}

const raw = JSON.parse(readFileSync('scripts/badge-sprite-labels.json', 'utf8'));
const labels = {};
for (const [path, label] of Object.entries(raw)) {
  if (path.startsWith('_')) continue; // skip meta keys like _uncertain
  labels[path] = label;
}

const norm = s => (s || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const tokens = s => norm(s).split(' ').filter(Boolean);

function score(badge, label) {
  if (!label) return 0;
  // Synonym table wins over everything else, but only when the label matches exactly.
  if (SYNONYMS[badge] && norm(SYNONYMS[badge]) === norm(label)) return 100;
  const n1 = norm(badge);
  const n2 = norm(label);
  if (!n1 || !n2) return 0;
  if (n1 === n2) return 100;

  // Raw token Jaccard
  const t1 = new Set(tokens(n1));
  const t2 = new Set(tokens(n2));
  const rawIntersect = [...t1].filter(t => t2.has(t)).length;
  const rawUnion = new Set([...t1, ...t2]).size;
  const rawJaccard = rawUnion ? rawIntersect / rawUnion : 0;

  // Stemmed token Jaccard (catches RAPPER/RAPPING, STORYTELLER/STORYTELLING)
  const s1 = new Set([...t1].map(stem));
  const s2 = new Set([...t2].map(stem));
  const stemIntersect = [...s1].filter(t => s2.has(t)).length;
  const stemUnion = new Set([...s1, ...s2]).size;
  const stemJaccard = stemUnion ? stemIntersect / stemUnion : 0;

  // Word-boundary substring boosts
  const hasWord = (haystack, needle) =>
    new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`).test(haystack);
  if (hasWord(n1, n2)) return Math.max(80, rawJaccard * 70);
  if (hasWord(n2, n1)) return Math.max(75, rawJaccard * 70);

  // Stem-based word boundary
  const stemPhrase = arr => [...arr].sort().map(stem).join(' ');
  if (stemPhrase(t1) === stemPhrase(t2)) return 90;

  // Best of raw or stemmed Jaccard
  return Math.max(rawJaccard, stemJaccard) * 70;
}

const { data: badges } = await supabase
  .from('badge_costs')
  .select('badge_code, badge_name, category')
  .order('badge_name');

console.log(`Loaded ${badges.length} badges and ${Object.keys(labels).length} sprite labels.\n`);

// Build full score matrix, then greedy assign best matches first.
const candidates = [];
for (const b of badges) {
  for (const [path, label] of Object.entries(labels)) {
    const s = score(b.badge_name, label);
    if (s >= MIN_SCORE) candidates.push({ badge: b, path, label, s });
  }
}
candidates.sort((a, b) => b.s - a.s);

const usedSprites = new Set();
const assigned = new Map();
for (const c of candidates) {
  if (assigned.has(c.badge.badge_code)) continue;
  if (usedSprites.has(c.path)) continue;
  assigned.set(c.badge.badge_code, c);
  usedSprites.add(c.path);
}

// Unassigned badges fall back to leftover sprites (in stable order).
const leftover = Object.keys(labels).filter(p => !usedSprites.has(p)).sort();
let fallbackIdx = 0;
for (const b of badges) {
  if (assigned.has(b.badge_code)) continue;
  while (fallbackIdx < leftover.length && usedSprites.has(leftover[fallbackIdx])) fallbackIdx++;
  const path = leftover[fallbackIdx++];
  if (!path) break;
  assigned.set(b.badge_code, { badge: b, path, label: labels[path] || '(unlabeled)', s: 0 });
  usedSprites.add(path);
}

// Apply updates
let updated = 0, failed = 0;
const summary = [];
for (const b of badges) {
  const a = assigned.get(b.badge_code);
  if (!a) {
    summary.push({ badge: b.badge_name, label: '—', score: 0, path: '—' });
    continue;
  }
  const { error } = await supabase
    .from('badge_costs')
    .update({ icon_url: a.path })
    .eq('badge_code', b.badge_code);
  if (error) { failed++; console.error('✗', b.badge_code, error.message); }
  else updated++;
  summary.push({ badge: b.badge_name, label: a.label, score: a.s, sprite: a.path.split('/').pop() });
}

console.table(summary);
console.log(`\nUpdated ${updated} badges (${failed} failed).`);
const matched = summary.filter(s => s.score >= MIN_SCORE).length;
const fallback = summary.filter(s => s.score === 0 && s.sprite !== '—').length;
const unmatched = summary.filter(s => s.sprite === '—').length;
console.log(`Semantic matches: ${matched}, fallbacks: ${fallback}, unmatched: ${unmatched}`);
