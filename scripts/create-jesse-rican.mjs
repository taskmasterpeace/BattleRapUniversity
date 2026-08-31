#!/usr/bin/env node
// Create Jesse Rican's battler row (dual-lane: he's also an active blogger in lib/bloggers.ts).
// Idempotent — skips if a "Jesse Rican" battler already exists.
// Run when local Supabase is up:  node scripts/create-jesse-rican.mjs

import fs from 'node:fs'

const env = fs.readFileSync('.env.local', 'utf8')
const URL_ = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim()
const KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim()
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }

const PORTRAITS = [
  '/sprites/characters/real/jesse-rican.png',
  '/sprites/characters/real/jesse-rican-2.png',
  '/sprites/characters/real/jesse-rican-3.png',
  '/sprites/characters/real/jesse-rican-4.png',
]

const existing = await (await fetch(`${URL_}/rest/v1/battlers?select=id&stage_name=ilike.Jesse%20Rican`, { headers: H })).json()
if (Array.isArray(existing) && existing.length) {
  console.log('Jesse Rican already exists:', existing[0].id, '— patching portraits only')
  const res = await fetch(`${URL_}/rest/v1/battlers?id=eq.${existing[0].id}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({ avatar_url: PORTRAITS[0], sprite_set: PORTRAITS, is_real: true, real_name: 'Jesse Rican', likeness_status: 'licensed' }),
  })
  console.log(res.ok ? 'patched ✔' : `patch failed: ${await res.text()}`)
  process.exit(0)
}

const cities = await (await fetch(`${URL_}/rest/v1/cities?select=id,name&name=ilike.New%20York*`, { headers: H })).json()
const cityId = cities?.[0]?.id ?? null
const leagues = await (await fetch(`${URL_}/rest/v1/leagues?select=id,name&name=ilike.*Small%20Room*`, { headers: H })).json()
const leagueId = leagues?.[0]?.id ?? null

const battlerRes = await fetch(`${URL_}/rest/v1/battlers`, {
  method: 'POST',
  headers: H,
  body: JSON.stringify({
    stage_name: 'Jesse Rican',
    real_name: 'Jesse Rican',
    is_ai: true,
    is_real: true,
    likeness_status: 'licensed',
    tier: 'low',
    region: 'New York',
    style_tags: ['predictions', 'culture', 'NY Made'],
    avatar_url: PORTRAITS[0],
    sprite_set: PORTRAITS,
    hometown_city_id: cityId,
    current_city_id: cityId,
    primary_league_id: leagueId,
    bio: 'The Predictions King — the only media man on the circuit who steps in the ring himself.',
  }),
})
if (!battlerRes.ok) {
  console.error('battler insert failed:', await battlerRes.text())
  process.exit(1)
}
const [battler] = await battlerRes.json()
console.log('battler created ✔', battler.id)

// default attributes (1-10 scale jsonb, per battler_attributes shape)
const attrRes = await fetch(`${URL_}/rest/v1/battler_attributes`, {
  method: 'POST',
  headers: H,
  body: JSON.stringify({
    battler_id: battler.id,
    writing: { lyricism: 5, wordplay: 5, creativity: 6, flow: 5 },
    performance: { stage_presence: 6, crowd_control: 6, delivery: 5 },
    personal: { financial_stability: 6, reputation: 7, family_bond: 6 },
    resilience: 6,
  }),
})
console.log(attrRes.ok ? 'attributes ✔' : `attributes failed (non-fatal): ${await attrRes.text()}`)

const rankRes = await fetch(`${URL_}/rest/v1/rankings`, {
  method: 'POST',
  headers: H,
  body: JSON.stringify({ battler_id: battler.id, rating: 1000, wins: 0, losses: 0, streak: 0 }),
})
console.log(rankRes.ok ? 'ranking ✔' : `ranking failed (non-fatal): ${await rankRes.text()}`)
console.log(`done — Jesse Rican is a battler AND a media personality (lib/bloggers.ts id "jesse-rican")`)
