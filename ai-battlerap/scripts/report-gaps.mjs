// Report which badges/leagues/cities still have unmapped or low-confidence sprites,
// and surface any sprite labels not yet used so we can hand-pick matches.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { config } from 'dotenv';

config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const badgeLabels = JSON.parse(readFileSync('scripts/badge-sprite-labels.json', 'utf8'));
const leagueLabels = JSON.parse(readFileSync('scripts/league-sprite-labels.json', 'utf8'));

// Strip meta keys
const badgeMap = Object.fromEntries(Object.entries(badgeLabels).filter(([k]) => !k.startsWith('_')));
const leagueMap = Object.fromEntries(Object.entries(leagueLabels).filter(([k]) => !k.startsWith('_')));

const { data: badges } = await supabase
  .from('badge_costs')
  .select('badge_code, badge_name, icon_url')
  .order('badge_name');

const usedBadgeSprites = new Set(badges.map(b => b.icon_url).filter(Boolean));
const freeBadgeSprites = Object.entries(badgeMap).filter(([p]) => !usedBadgeSprites.has(p));

console.log(`\n=== BADGE SPRITES NOT USED (${freeBadgeSprites.length}) ===`);
for (const [path, label] of freeBadgeSprites.sort((a, b) => a[1].localeCompare(b[1]))) {
  console.log(`  ${label.padEnd(30)} ${path.split('/').pop()}`);
}

console.log(`\n=== BADGES ASSIGNED A FALLBACK SPRITE ===`);
// A fallback is any badge whose current sprite label has no token overlap with the badge name
const norm = s => (s || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
function stem(w) {
  w = w.toLowerCase();
  for (const suf of ['ing', 'ers', 'er', 'ed', 'es', 'ies', 's']) {
    if (w.length > suf.length + 2 && w.endsWith(suf)) return w.slice(0, -suf.length);
  }
  return w;
}
function hasOverlap(name, label) {
  const t1 = new Set(norm(name).split(' ').filter(Boolean).map(stem));
  const t2 = new Set(norm(label).split(' ').filter(Boolean).map(stem));
  return [...t1].some(t => t2.has(t));
}

let fallbackCount = 0;
for (const b of badges) {
  if (!b.icon_url) { console.log(`  ${b.badge_name}: <no sprite>`); continue; }
  const label = badgeMap[b.icon_url] || '(unknown)';
  if (!hasOverlap(b.badge_name, label)) {
    console.log(`  ${b.badge_name.padEnd(30)} → ${label}`);
    fallbackCount++;
  }
}
console.log(`(${fallbackCount} fallbacks)`);

// Same for leagues
const { data: leagues } = await supabase
  .from('leagues')
  .select('name, short_code, logo_url')
  .order('name');

const usedLeagueSprites = new Set(leagues.map(l => l.logo_url).filter(Boolean));
const freeLeagueSprites = Object.entries(leagueMap).filter(([p]) => !usedLeagueSprites.has(p));

console.log(`\n=== LEAGUE SPRITES NOT USED (${freeLeagueSprites.length} — first 30) ===`);
for (const [path, label] of freeLeagueSprites.slice(0, 30)) {
  console.log(`  ${label.padEnd(40)} ${path.split('/').pop()}`);
}

console.log(`\n=== LEAGUES ASSIGNED A FALLBACK SPRITE ===`);
for (const l of leagues) {
  if (!l.logo_url) { console.log(`  ${l.name}: <no sprite>`); continue; }
  const label = leagueMap[l.logo_url] || '(unknown)';
  if (!hasOverlap(l.name, label)) {
    console.log(`  ${l.name.padEnd(30)} → ${label}`);
  }
}

// Cities
const { data: cities } = await supabase
  .from('cities')
  .select('name, slug, background_url, skyline_url')
  .order('name');
console.log(`\n=== CITIES WITHOUT SPRITES ===`);
for (const c of cities) {
  if (!c.background_url || !c.skyline_url) {
    console.log(`  ${c.name} (${c.slug}): bg=${c.background_url ? 'Y' : 'N'} sky=${c.skyline_url ? 'Y' : 'N'}`);
  }
}
