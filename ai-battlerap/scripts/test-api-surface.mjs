#!/usr/bin/env node
/**
 * API surface test: probe every public-facing API route for sane HTTP status.
 *
 * We sign in as the dev user so auth-gated routes work. We don't deeply
 * validate payloads — just want to detect routes that throw, 500, or hang.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const SUPABASE_URL = 'http://127.0.0.1:54321';
const INTERNAL_SECRET = 'local-dev-secret-123';

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
const ANON_KEY = ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = ENV.SUPABASE_SERVICE_ROLE_KEY;

const service = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getDevSession() {
  const u = createClient(SUPABASE_URL, ANON_KEY);
  const { data } = await u.auth.signInWithPassword({
    email: 'dev@test.com',
    password: 'password123',
  });
  return data;
}

const results = [];
function record(method, url, status, ok, note = '') {
  results.push({ method, url, status, ok, note });
  const tag = ok ? '✓' : '✗';
  console.log(`${tag} ${method.padEnd(5)} ${url.padEnd(60)} ${status} ${note}`);
}

async function hit(method, url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${BASE}${url}`, { method, signal: ctrl.signal, ...opts });
    return res;
  } catch (e) {
    return { status: 0, _err: e.message };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const session = await getDevSession();
  const accessToken = session?.session?.access_token;
  const authHeader = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  const internalHeader = { Authorization: `Bearer ${INTERNAL_SECRET}` };

  // Pull a battle and battler id for parameterized routes
  const { data: battle } = await service
    .from('battles')
    .select('id, battler_player_id, battler_ai_id')
    .eq('status', 'completed')
    .limit(1)
    .single();
  const { data: anyBattler } = await service.from('battlers').select('id').limit(1).single();
  const { data: anyLeague } = await service.from('leagues').select('id').limit(1).single();
  const { data: anyArticle } = await service.from('news_articles').select('slug').limit(1).single();
  const { data: anyTournament } = await service.from('tournaments').select('id').limit(1).maybeSingle?.() ?? { data: null };

  console.log('\n=== Public unauthenticated GETs ===');
  for (const url of ['/api/debug', '/api/badges']) {
    const r = await hit('GET', url);
    record('GET', url, r.status, r.status > 0 && r.status < 500);
  }

  console.log('\n=== Authenticated GETs (Bearer dev user) ===');
  const authedGets = [
    '/api/battler/me',
    '/api/battles/offers',
    '/api/battler/badges',
    '/api/battler/relationships',
    '/api/news',
    '/api/notifications',
    '/api/finances',
    '/api/roster',
    '/api/tournaments',
    '/api/tournaments/history',
    '/api/life-events',
    '/api/dev/time/status',
  ];
  for (const url of authedGets) {
    const r = await hit('GET', url, { headers: authHeader });
    record('GET', url, r.status, r.status > 0 && r.status < 500);
  }

  console.log('\n=== Parameterized GETs ===');
  const paramGets = [];
  if (battle?.id) paramGets.push(`/api/battles/${battle.id}`);
  if (battle?.id) paramGets.push(`/api/battles/${battle.id}/prep`);
  if (anyBattler?.id) paramGets.push(`/api/battler/${anyBattler.id}/career`);
  if (anyLeague?.id) paramGets.push(`/api/leagues/${anyLeague.id}/thrones`);
  if (anyArticle?.slug) paramGets.push(`/api/news/${anyArticle.slug}`);
  paramGets.push('/api/thrones/challenges');
  for (const url of paramGets) {
    const r = await hit('GET', url, { headers: authHeader });
    record('GET', url, r.status, r.status > 0 && r.status < 500);
  }

  console.log('\n=== Internal POSTs (service-secret) ===');
  const internalPosts = [
    '/api/internal/generate-battle-offers',
    '/api/internal/trigger-ai-promotion',
  ];
  for (const url of internalPosts) {
    const r = await hit('POST', url, {
      headers: { ...internalHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    record('POST', url, r.status, r.status > 0 && r.status < 500);
  }

  console.log('\n=== Dev-time controls ===');
  const devTimeRoutes = ['/api/dev/time/status'];
  for (const url of devTimeRoutes) {
    const r = await hit('GET', url, { headers: authHeader });
    record('GET', url, r.status, r.status > 0 && r.status < 500);
  }

  console.log('\n=== Summary ===');
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);
  if (failed > 0) {
    console.log('\nFailures:');
    for (const r of results.filter(r => !r.ok)) {
      console.log(`  ${r.method} ${r.url} -> ${r.status}`);
    }
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
