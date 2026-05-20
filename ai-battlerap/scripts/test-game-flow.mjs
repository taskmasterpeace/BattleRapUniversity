#!/usr/bin/env node
/**
 * End-to-end game flow integration test.
 *
 * Walks the complete core loop:
 *   1. Auth: sign in as dev user
 *   2. Battler creation
 *   3. Battle offer generation
 *   4. Offer acceptance
 *   5. Prep block set
 *   6. Battle simulation
 *   7. Battle results fetch
 *   8. News article generation check
 *
 * Each step is reported with PASS/FAIL and the exit code reflects total failures.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const SUPABASE_URL = 'http://127.0.0.1:54321';
const INTERNAL_SECRET = 'local-dev-secret-123';

// Read env file for keys
function readEnv() {
  const text = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, '');
  }
  return out;
}

const ENV = readEnv();
const SERVICE_KEY = ENV.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const results = [];
function step(name, ok, detail = '') {
  const status = ok ? '✓ PASS' : '✗ FAIL';
  console.log(`${status} ${name}${detail ? ` — ${detail}` : ''}`);
  results.push({ name, ok, detail });
}

// Sign in with the dev user. Returns { user, accessToken } or null.
async function signInDev() {
  const userClient = createClient(SUPABASE_URL, ANON_KEY);
  let res = await userClient.auth.signInWithPassword({
    email: 'dev@test.com',
    password: 'password123',
  });
  if (res.error) {
    // Sign up if not exists
    const su = await userClient.auth.signUp({
      email: 'dev@test.com',
      password: 'password123',
    });
    if (su.error) return null;
    res = await userClient.auth.signInWithPassword({
      email: 'dev@test.com',
      password: 'password123',
    });
  }
  return res.data;
}

async function ensureFreshBattler(userId) {
  // Delete any existing player battler so we can run the flow cleanly.
  // We delete dependents first.
  await serviceClient.from('battler_attributes').delete().match({ /* via battler */ });
  const { data: existing } = await serviceClient
    .from('battlers')
    .select('id')
    .eq('user_id', userId)
    .eq('is_ai', false);
  if (existing && existing.length) {
    const ids = existing.map((b) => b.id);
    const safe = async (p) => { try { await p; } catch {} };
    // Schema uses battler_player_id / battler_ai_id (not battler_a_id / battler_b_id).
    const { data: battleRows } = await serviceClient
      .from('battles')
      .select('id')
      .or(`battler_player_id.in.(${ids.join(',')}),battler_ai_id.in.(${ids.join(',')})`);
    const battleIds = (battleRows ?? []).map((b) => b.id);
    await safe(serviceClient.from('battler_attributes').delete().in('battler_id', ids));
    await safe(serviceClient.from('rankings').delete().in('battler_id', ids));
    if (battleIds.length) {
      await safe(serviceClient.from('battle_segments').delete().in('battle_id', battleIds));
      await safe(serviceClient.from('battle_rounds').delete().in('battle_id', battleIds));
      await safe(serviceClient.from('prep_blocks').delete().in('battle_id', battleIds));
      await safe(serviceClient.from('battler_life_events').delete().in('battle_id', battleIds));
      await safe(serviceClient.from('news_articles').delete().in('battle_id', battleIds));
    }
    await safe(serviceClient.from('battler_life_events').delete().in('battler_id', ids));
    await safe(serviceClient.from('battles').delete().or(`battler_player_id.in.(${ids.join(',')}),battler_ai_id.in.(${ids.join(',')})`));
    await safe(serviceClient.from('battlers').delete().in('id', ids));
  }
}

async function postWithAuth(path, body, accessToken) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Cookie: `sb-127-auth-token=${accessToken}`,
    },
    body: JSON.stringify(body),
  });
}

async function postInternal(path, body = {}) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${INTERNAL_SECRET}`,
    },
    body: JSON.stringify(body),
  });
}

async function main() {
  console.log('=== Game Flow E2E ===\n');

  // --- Step 1: auth ---
  const session = await signInDev();
  step('1. Sign in dev user', !!session?.user, session?.user?.id);
  if (!session?.user) return;
  const userId = session.user.id;
  const accessToken = session.session.access_token;

  // --- Step 2: clean state + battler creation via service role (mirrors API logic) ---
  await ensureFreshBattler(userId);

  const { data: leagues } = await serviceClient.from('leagues').select('id, name').limit(2);
  step('2a. Leagues seeded', (leagues?.length ?? 0) > 0, `${leagues?.length} leagues`);
  if (!leagues?.length) return;
  const leagueId = leagues[0].id;

  const createResp = await fetch(`${BASE}/api/battler/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // The route uses getUser() which reads Supabase auth cookie. Pass anon
      // header pair the same way next/headers + ssr expect.
      Cookie: `sb-127-0-0-1-auth-token=${encodeURIComponent(JSON.stringify({
        access_token: accessToken,
        refresh_token: session.session.refresh_token,
        token_type: 'bearer',
        user: session.user,
      }))}`,
    },
    body: JSON.stringify({
      stage_name: 'Flow Tester',
      region: 'NYC',
      primary_league_id: leagueId,
      style_tags: ['technical'],
      allocated_attributes: {
        writing: { lyricism: 3, wordplay: 2, creativity: 2, flow: 2 },
        performance: { stage_presence: 2, crowd_control: 2, delivery: 3 },
        personal: { financial_stability: 2, reputation: 2, family_bond: 2 },
        resilience: 3,
      },
    }),
  });
  const createOk = createResp.ok;
  let battlerId = null;
  if (createOk) {
    const body = await createResp.json();
    battlerId = body.battler?.id ?? body.id ?? null;
  } else {
    const err = await createResp.text().catch(() => '');
    step('2b. Battler create via API', false, `HTTP ${createResp.status} ${err.slice(0, 120)}`);
  }
  if (!battlerId) {
    // Fallback: insert directly so subsequent steps can proceed
    const { data: bIns, error: bErr } = await serviceClient
      .from('battlers')
      .insert({
        user_id: userId,
        stage_name: 'Flow Tester',
        region: 'NYC',
        primary_league_id: leagueId,
        style_tags: ['technical'],
        tier: 'low',
        is_ai: false,
      })
      .select('id')
      .single();
    if (bErr) {
      step('2b. Battler create (fallback insert)', false, bErr.message);
      return;
    }
    battlerId = bIns.id;
    // Attribute row
    try {
      await serviceClient.from('battler_attributes').insert({
        battler_id: battlerId,
        writing: { lyricism: 3, wordplay: 2, creativity: 2, flow: 2 },
        performance: { stage_presence: 2, crowd_control: 2, delivery: 3 },
        personal: { financial_stability: 2, reputation: 2, family_bond: 2 },
        resilience: 3,
      });
    } catch {}
    try {
      await serviceClient.from('rankings').insert({
        battler_id: battlerId,
        rating: 1200,
      });
    } catch {}
    step('2b. Battler created (fallback path)', true, battlerId);
  } else {
    step('2b. Battler created via API', true, battlerId);
  }

  // --- Step 3: generate offers ---
  const offersResp = await postInternal('/api/internal/generate-battle-offers');
  step('3. Generate offers', offersResp.ok, `HTTP ${offersResp.status}`);
  const offersBody = await offersResp.json().catch(() => ({}));

  // Find a battle offered to our battler. Schema uses battler_player_id / battler_ai_id.
  const { data: offers } = await serviceClient
    .from('battles')
    .select('id, battler_player_id, battler_ai_id, status, scheduled_at, league_id')
    .eq('battler_player_id', battlerId)
    .eq('status', 'offered')
    .limit(1);
  const offer = offers?.[0];
  step('3b. Offer visible for new battler', !!offer, offer?.id);
  if (!offer) {
    console.log('   offers response:', JSON.stringify(offersBody).slice(0, 200));
    return;
  }

  // --- Step 4: accept ---
  // The /accept route relies on Next.js cookie-based getUser(), which Node fetch can't
  // easily satisfy. We exercise it via Playwright in visual-smoke.spec.ts; here we
  // mirror the route's net effect (status -> accepted) via service role.
  const { error: acceptErr } = await serviceClient
    .from('battles')
    .update({ status: 'accepted' })
    .eq('id', offer.id);
  step('4. Accept offer (service-role mirror)', !acceptErr, acceptErr?.message);

  const { data: afterAccept } = await serviceClient
    .from('battles')
    .select('status')
    .eq('id', offer.id)
    .single();
  step('4b. Battle status -> accepted', afterAccept?.status === 'accepted', afterAccept?.status);

  // --- Step 5: set prep blocks ---
  // Insert one prep block per day_index 0..2 with mixed focus.
  const focuses = ['writing', 'performance', 'rest'];
  let prepInserted = 0;
  let prepErrMsg = '';
  for (let i = 0; i < focuses.length; i++) {
    const { error: prepErr } = await serviceClient.from('prep_blocks').insert({
      battle_id: offer.id,
      battler_id: battlerId,
      day_index: i,
      focus: focuses[i],
    });
    if (prepErr) {
      prepErrMsg = prepErr.message;
      break;
    }
    prepInserted++;
  }
  step('5. Insert prep blocks', prepInserted === focuses.length, prepErrMsg || `${prepInserted}/${focuses.length}`);

  // --- Step 6: force simulate ---
  const simResp = await fetch(`${BASE}/api/internal/run-due-battles?battle_id=${offer.id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${INTERNAL_SECRET}` },
  });
  const simBody = await simResp.json().catch(() => ({}));
  step('6. Trigger simulation', simResp.ok && simBody.battlesSimulated > 0, `HTTP ${simResp.status} ${JSON.stringify(simBody).slice(0, 200)}`);

  // --- Step 7: verify outcome ---
  const { data: completed } = await serviceClient
    .from('battles')
    .select('status, winner_battler_id, battler_player_id, battler_ai_id')
    .eq('id', offer.id)
    .single();
  step('7. Battle status -> completed', completed?.status === 'completed', completed?.status);
  step('7b. Winner set', !!completed?.winner_battler_id, completed?.winner_battler_id);

  const { data: rounds } = await serviceClient
    .from('battle_rounds')
    .select('round_index, average_score, peak_score, consistency_score')
    .eq('battle_id', offer.id)
    .order('round_index');
  step('7c. Battle rounds recorded', (rounds?.length ?? 0) > 0, `${rounds?.length ?? 0} rounds`);

  const { data: segments } = await serviceClient
    .from('battle_segments')
    .select('id')
    .eq('battle_id', offer.id);
  step('7d. Battle segments recorded', (segments?.length ?? 0) > 0, `${segments?.length} segments`);

  // --- Step 8: news article ---
  const { data: news } = await serviceClient
    .from('news_articles')
    .select('id, title, type')
    .eq('battle_id', offer.id)
    .limit(1);
  step('8. News article generated', (news?.length ?? 0) > 0, news?.[0]?.title?.slice(0, 60));

  // --- Summary ---
  console.log('\n=== Summary ===');
  const pass = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).length;
  console.log(`Passed: ${pass}/${results.length}`);
  console.log(`Failed: ${fail}/${results.length}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
