// Re-map league logo_url based on baked-in sprite labels.
// Same matching strategy as remap-badge-icons.mjs.
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

// Hand-picked synonyms for leagues without a direct sprite match.
const SYNONYMS = {
  'Small Room Circuit': 'THE BATTLEGROUND CIRCUIT', // "Circuit" overlap, no "Small Room" sprite exists
};

const raw = JSON.parse(readFileSync('scripts/league-sprite-labels.json', 'utf8'));
const labels = {};
for (const [path, label] of Object.entries(raw)) {
  if (path.startsWith('_')) continue;
  labels[path] = label;
}

const norm = s => (s || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const tokens = s => norm(s).split(' ').filter(Boolean);

function stem(word) {
  let w = word.toLowerCase();
  for (const suf of ['ing', 'ers', 'er', 'ed', 'es', 'ies', 's']) {
    if (w.length > suf.length + 2 && w.endsWith(suf)) {
      w = w.slice(0, -suf.length);
      break;
    }
  }
  return w;
}

function score(name, label) {
  if (!label) return 0;
  if (SYNONYMS[name] && norm(SYNONYMS[name]) === norm(label)) return 100;
  const n1 = norm(name);
  const n2 = norm(label);
  if (!n1 || !n2) return 0;
  if (n1 === n2) return 100;

  const t1 = new Set(tokens(n1));
  const t2 = new Set(tokens(n2));
  const rawIntersect = [...t1].filter(t => t2.has(t)).length;
  const rawUnion = new Set([...t1, ...t2]).size;
  const rawJaccard = rawUnion ? rawIntersect / rawUnion : 0;

  const s1 = new Set([...t1].map(stem));
  const s2 = new Set([...t2].map(stem));
  const stemIntersect = [...s1].filter(t => s2.has(t)).length;
  const stemUnion = new Set([...s1, ...s2]).size;
  const stemJaccard = stemUnion ? stemIntersect / stemUnion : 0;

  const hasWord = (h, n) => new RegExp(`\\b${n.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`).test(h);
  if (hasWord(n1, n2)) return Math.max(80, rawJaccard * 70);
  if (hasWord(n2, n1)) return Math.max(75, rawJaccard * 70);

  const stemPhrase = arr => [...arr].sort().map(stem).join(' ');
  if (stemPhrase(t1) === stemPhrase(t2)) return 90;

  return Math.max(rawJaccard, stemJaccard) * 70;
}

const { data: leagues } = await supabase
  .from('leagues')
  .select('id, name, short_code')
  .order('name');

console.log(`Loaded ${leagues.length} leagues and ${Object.keys(labels).length} sprite labels.\n`);

const candidates = [];
for (const l of leagues) {
  for (const [path, label] of Object.entries(labels)) {
    const s = score(l.name, label);
    if (s >= MIN_SCORE) candidates.push({ league: l, path, label, s });
  }
}
candidates.sort((a, b) => b.s - a.s);

const usedSprites = new Set();
const assigned = new Map();
for (const c of candidates) {
  if (assigned.has(c.league.id)) continue;
  if (usedSprites.has(c.path)) continue;
  assigned.set(c.league.id, c);
  usedSprites.add(c.path);
}

const leftover = Object.keys(labels).filter(p => !usedSprites.has(p)).sort();
let fallbackIdx = 0;
for (const l of leagues) {
  if (assigned.has(l.id)) continue;
  while (fallbackIdx < leftover.length && usedSprites.has(leftover[fallbackIdx])) fallbackIdx++;
  const path = leftover[fallbackIdx++];
  if (!path) break;
  assigned.set(l.id, { league: l, path, label: labels[path] || '(unlabeled)', s: 0 });
  usedSprites.add(path);
}

let updated = 0, failed = 0;
const summary = [];
for (const l of leagues) {
  const a = assigned.get(l.id);
  if (!a) {
    summary.push({ league: l.name, label: '—', score: 0, sprite: '—' });
    continue;
  }
  const { error } = await supabase
    .from('leagues')
    .update({ logo_url: a.path })
    .eq('id', l.id);
  if (error) { failed++; console.error('✗', l.name, error.message); }
  else updated++;
  summary.push({ league: l.name, label: a.label, score: a.s, sprite: a.path.split('/').pop() });
}

console.table(summary);
console.log(`\nUpdated ${updated} leagues (${failed} failed).`);
const matched = summary.filter(s => s.score >= MIN_SCORE).length;
const fallback = summary.filter(s => s.score === 0 && s.sprite !== '—').length;
console.log(`Semantic matches: ${matched}, fallbacks: ${fallback}`);
