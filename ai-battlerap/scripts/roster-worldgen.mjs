// Roster worldgen pass (2026-08-31): make the 101 real AI battlers feel like
// PEOPLE — fill gender (eyeballed from the art), assign culture CODING from
// style tags, sprinkle persona FACETS (never on is_real battlers — no invented
// facts about real people), and reshape flat 5-5-5 stat lines into archetype
// spreads that preserve each battler's overall power.
// Usage: node scripts/roster-worldgen.mjs [--emit-sql out.sql]  (local DB always)
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FEMALE_NAMES = new Set(['Lou Legend']); // eyeballed from the sprite sheets

// style tag -> coding vote
const TAG_CODING = [
  [/street|aggressive|gun|grime|raw|battle tested/i, 'street'],
  [/technical|scheme|wordplay|lyricis|pen|research/i, 'craft'],
  [/entertain|comedy|crowd favorite|showman|charisma|freestyle/i, 'crossover'],
];

const FACET_POOL = [
  ['Family Man', 18],
  ['Battle Nerd', 14],
  ['Hometown Hero', 14],
  ['Christian', 10],
  ['Veteran', 9],
  ['Ex-Con', 9],
  ['Sober', 8],
  ['Muslim', 6],
  ['LGBTQ', 5],
  ['Teacher', 4],
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v) => Math.max(1, Math.min(10, Math.round(v)));

function codingFor(tags, rand, overseasLeague) {
  if (overseasLeague) return 'overseas';
  const votes = { street: 0, craft: 0, crossover: 0 };
  for (const t of tags) for (const [re, c] of TAG_CODING) if (re.test(t)) votes[c]++;
  const best = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  // Only a STRONG tag signal (2+ votes, clear winner) earns its coding — the
  // seed vocabulary is craft-biased, so single votes go to the world mix.
  if (best[0][1] >= 2 && best[0][1] > best[1][1]) return best[0][0];
  const r = rand();
  return r < 0.45 ? 'street' : r < 0.75 ? 'craft' : 'crossover';
}

function facetsFor(rand) {
  if (rand() > 0.35) return [];
  const total = FACET_POOL.reduce((s, [, w]) => s + w, 0);
  const pick = () => {
    let r = rand() * total, acc = 0;
    for (const [f, w] of FACET_POOL) { acc += w; if (r <= acc) return f; }
    return FACET_POOL[0][0];
  };
  const out = new Set([pick()]);
  if (rand() < 0.3) out.add(pick());
  return [...out];
}

/** Reshape a flat stat line into an archetype spread around the same mean. */
function reshape(attrs, coding, rand) {
  const w = { ...attrs.writing };
  const p = { ...attrs.performance };
  const vals = [...Object.values(w), ...Object.values(p)].map(Number);
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  const jit = () => (rand() - 0.5) * 1.6;
  if (coding === 'street') {
    w.lyricism = clamp(mean + 1.5 + jit()); w.wordplay = clamp(mean + jit());
    w.creativity = clamp(mean - 1 + jit()); w.flow = clamp(mean + jit());
    p.stage_presence = clamp(mean + 1 + jit()); p.crowd_control = clamp(mean + jit());
    p.delivery = clamp(mean + 1.5 + jit());
  } else if (coding === 'craft') {
    w.lyricism = clamp(mean + 1 + jit()); w.wordplay = clamp(mean + 2 + jit());
    w.creativity = clamp(mean + 1.5 + jit()); w.flow = clamp(mean + jit());
    p.stage_presence = clamp(mean - 1.5 + jit()); p.crowd_control = clamp(mean - 1 + jit());
    p.delivery = clamp(mean + jit());
  } else {
    w.lyricism = clamp(mean + jit()); w.wordplay = clamp(mean + jit());
    w.creativity = clamp(mean + 1 + jit()); w.flow = clamp(mean + 1 + jit());
    p.stage_presence = clamp(mean + 1.5 + jit()); p.crowd_control = clamp(mean + 1.5 + jit());
    p.delivery = clamp(mean + jit());
  }
  return { writing: w, performance: p };
}

const emitSql = process.argv.includes('--emit-sql')
  ? process.argv[process.argv.indexOf('--emit-sql') + 1]
  : null;
const sql = ['DO $$', 'BEGIN'];
const esc = (s) => String(s).replace(/'/g, "''");

const recode = process.argv.includes('--recode');

const { data: battlers } = await supabase
  .from('battlers')
  .select('id, stage_name, gender, identity, style_tags, is_real, primary_league_id, battler_attributes(writing, performance)')
  .eq('is_ai', true)
  .order('stage_name');

// Overseas coding: battlers whose home league runs a non-US room.
const { data: leagues } = await supabase.from('leagues').select('id, name');
const OVERSEAS_LEAGUES = new Set(
  (leagues ?? [])
    .filter((l) => /crown city|barz supreme|global word war/i.test(l.name))
    .map((l) => l.id)
);

let genderSet = 0, codingSet = 0, facetsSet = 0, reshaped = 0;

for (const b of battlers) {
  const rand = rng(hash(b.id));
  const identity = { ...(b.identity ?? {}) };
  const update = {};

  if (!b.gender) {
    update.gender = FEMALE_NAMES.has(b.stage_name) ? 'female' : 'male';
    genderSet++;
  }
  if (!identity.coding || recode) {
    identity.coding = codingFor(b.style_tags ?? [], rand, OVERSEAS_LEAGUES.has(b.primary_league_id));
    codingSet++;
  }
  if (!b.is_real && !Array.isArray(identity.facets)) {
    const f = facetsFor(rand);
    if (f.length > 0) { identity.facets = f; facetsSet++; }
  }
  update.identity = identity;

  await supabase.from('battlers').update(update).eq('id', b.id);
  const genderVal = update.gender ?? b.gender;
  sql.push(
    `  UPDATE battlers SET ${genderVal ? `gender = '${genderVal}', ` : ''}identity = '${esc(JSON.stringify(identity))}'::jsonb WHERE stage_name = '${esc(b.stage_name)}' AND is_ai = true;`
  );

  const a = Array.isArray(b.battler_attributes) ? b.battler_attributes[0] : b.battler_attributes;
  if (a?.writing) {
    const vals = [...Object.values(a.writing), ...Object.values(a.performance ?? {})].map(Number);
    let current = { writing: a.writing, performance: a.performance };
    if (Math.max(...vals) - Math.min(...vals) <= 1) {
      current = reshape(a, identity.coding, rand);
      await supabase.from('battler_attributes').update(current).eq('battler_id', b.id);
      reshaped++;
    }
    // Emit CURRENT combat stats for every battler so the SQL mirrors local
    // state exactly (reshapes from earlier runs included).
    sql.push(
      `  UPDATE battler_attributes SET writing = '${esc(JSON.stringify(current.writing))}'::jsonb, performance = '${esc(JSON.stringify(current.performance))}'::jsonb WHERE battler_id = (SELECT id FROM battlers WHERE stage_name = '${esc(b.stage_name)}' AND is_ai = true LIMIT 1);`
    );
  }
}

sql.push('END $$;');
if (emitSql) fs.writeFileSync(emitSql, sql.join('\n'));
console.log(
  `worldgen: ${battlers.length} battlers · gender set ${genderSet} · coding set ${codingSet} · facets on ${facetsSet} · reshaped ${reshaped}${emitSql ? ` · sql -> ${emitSql}` : ''}`
);
