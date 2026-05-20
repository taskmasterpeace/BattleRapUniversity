// Visual smoke test: log in, ensure a battler exists, screenshot every key route.
// Run: npx playwright test e2e/visual-smoke.spec.ts --reporter=line

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const SHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

// Read .env.local for the local Supabase anon key so we can resolve a league id
// without depending on shell env. Falls back gracefully.
function readEnvLocal(): Record<string, string> {
  const envPath = path.join(__dirname, '..', '.env.local');
  try {
    const text = fs.readFileSync(envPath, 'utf8');
    const out: Record<string, string> = {};
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].replace(/^"|"$/g, '');
    }
    return out;
  } catch {
    return {};
  }
}
const ENV = readEnvLocal();
const SUPABASE_URL = ENV.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SUPABASE_ANON = ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

fs.mkdirSync(SHOT_DIR, { recursive: true });

// Visit /login first to trigger the dev auto-login that signs in
// dev@test.com / password123 and seeds a battler via the onboarding flow.
async function ensureLoggedInWithBattler(page: import('@playwright/test').Page) {
  // 1. Hit /login — auto-login useEffect will sign in and route to /dashboard
  //    or /onboarding depending on whether a battler exists.
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // Give the auto-login effect time to complete the sign-in + redirect.
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15000 }).catch(() => {});

  // 2. If we landed on onboarding, create a battler via API using the page's session cookies.
  if (page.url().includes('/onboarding')) {
    // Resolve a league id via Supabase PostgREST using the local anon key.
    let leagueId: string | null = null;
    if (SUPABASE_ANON) {
      const fallback = await page.request.get(
        `${SUPABASE_URL}/rest/v1/leagues?select=id&limit=1`,
        {
          headers: {
            apikey: SUPABASE_ANON,
            Authorization: `Bearer ${SUPABASE_ANON}`,
          },
        }
      );
      if (fallback.ok()) {
        const arr = await fallback.json();
        leagueId = arr?.[0]?.id ?? null;
      } else {
        console.log('[smoke] league lookup failed:', fallback.status());
      }
    }

    if (leagueId) {
      const createResp = await page.request.post(`${BASE}/api/battler/create`, {
        data: {
          stage_name: 'Smoke Tester',
          region: 'NYC',
          primary_league_id: leagueId,
          style_tags: ['technical'],
          allocated_attributes: {
            writing: { lyricism: 3, wordplay: 2, creativity: 2, flow: 2 },
            performance: { stage_presence: 2, crowd_control: 2, delivery: 3 },
            personal: { financial_stability: 2, reputation: 2, family_bond: 2 },
            resilience: 3,
          },
        },
      });
      if (!createResp.ok()) {
        const body = await createResp.text().catch(() => '');
        console.log('[smoke] battler create failed:', createResp.status(), body.slice(0, 200));
      } else {
        // Refresh so server components pick up the new battler.
        await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
      }
    } else {
      console.log('[smoke] could not resolve a league id for battler creation');
    }
  }
}

const routes = [
  { name: '01-home', path: '/' },
  { name: '02-login', path: '/login' },
  { name: '03-onboarding', path: '/onboarding' },
  { name: '04-dashboard', path: '/dashboard' },
  { name: '05-battle-offers', path: '/battle/offers' },
  { name: '06-media', path: '/media' },
  { name: '07-badges', path: '/badges' },
  { name: '08-leagues', path: '/leagues' },
  { name: '09-tournaments', path: '/tournaments' },
  { name: '10-finances', path: '/finances' },
  { name: '11-notifications', path: '/notifications' },
  { name: '12-relationships', path: '/relationships' },
  { name: '13-life-events-history', path: '/life-events/history' },
  { name: '14-tournaments-history', path: '/tournaments/history' },
  { name: '15-guide', path: '/guide' },
  { name: '16-settings', path: '/settings/profile' },
];

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await ensureLoggedInWithBattler(page);
});

for (const r of routes) {
  test(`screenshot ${r.name}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    const response = await page.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for either networkidle or 1.5s, whichever comes first — keeps Next dev hot
    // reload compilation from hanging us indefinitely.
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SHOT_DIR, `${r.name}.png`), fullPage: true });
    const status = response?.status() ?? 0;
    console.log(`[${r.name}] ${r.path} → HTTP ${status}, errors: ${errors.length}`);
    if (errors.length) console.log(errors.slice(0, 3).join('\n'));
    expect(status).toBeLessThan(500);
  });
}
