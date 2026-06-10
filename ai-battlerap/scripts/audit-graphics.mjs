// Graphics audit: every image URL referenced in the database must resolve to a
// real file in public/. Reports broken references grouped by table.
import fs from 'node:fs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY (local key: npm run supabase:status)');
  process.exit(1);
}

async function rows(table, cols) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}&limit=2000`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) return { error: `${res.status} ${await res.text()}` };
  return { data: await res.json() };
}

function checkUrl(url) {
  if (!url) return true; // null is fine (fallback UI handles it)
  if (url.startsWith('http')) return 'external';
  const localPath = `public${decodeURIComponent(url)}`;
  return fs.existsSync(localPath);
}

const checks = [
  { table: 'battlers', cols: 'stage_name,avatar_url', field: 'avatar_url' },
  { table: 'leagues', cols: 'name,logo_url', field: 'logo_url' },
  { table: 'cities', cols: 'name,skyline_url', field: 'skyline_url' },
  { table: 'cities', cols: 'name,background_url', field: 'background_url' },
  { table: 'badges', cols: 'name,icon_url', field: 'icon_url' },
];

let totalBroken = 0;
for (const c of checks) {
  const { data, error } = await rows(c.table, c.cols);
  if (error) {
    console.log(`${c.table}.${c.field}: SKIP (${error.slice(0, 80)})`);
    continue;
  }
  const broken = [];
  let nulls = 0, ok = 0, external = 0;
  for (const r of data) {
    const url = r[c.field];
    if (!url) { nulls++; continue; }
    const result = checkUrl(url);
    if (result === 'external') external++;
    else if (result) ok++;
    else broken.push({ name: r.stage_name || r.name, url });
  }
  console.log(`${c.table}.${c.field}: ${ok} ok, ${nulls} null, ${external} external, ${broken.length} BROKEN`);
  for (const b of broken.slice(0, 10)) console.log(`   ✗ ${b.name}: ${b.url}`);
  if (broken.length > 10) console.log(`   ... +${broken.length - 10} more`);
  totalBroken += broken.length;
}

// Also check league venue images used by onboarding (getLeagueVisuals)
console.log(`\nTotal broken references: ${totalBroken}`);
