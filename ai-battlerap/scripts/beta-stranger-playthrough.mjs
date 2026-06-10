// Beta readiness audit: simulate a brand-new stranger's first session.
// 1. Sign up a fresh account via Supabase auth REST (bypasses the dev auto-login).
// 2. Discover the app's auth cookie format from the dev auto-login, then swap in
//    the fresh user's session so SSR sees the new user.
// 3. Walk onboarding -> dashboard -> offers -> battle loop, screenshotting everything.
// No app code is modified. Screenshots land in docs/screenshots/beta/.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = 'http://localhost:1919';
const SUPABASE_URL = 'http://127.0.0.1:54321';
const ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const OUT = 'docs/screenshots/beta';
fs.mkdirSync(OUT, { recursive: true });

const issues = [];
function logIssue(sev, msg) {
  issues.push({ sev, msg });
  console.error(`[${sev}] ${msg}`);
}

// --- 1. Create fresh user ---
const email = `beta.stranger.${Date.now()}@test.com`;
const password = 'BetaTest123!';
const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
  method: 'POST',
  headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const session = await signupRes.json();
if (!session.access_token) {
  console.error('Signup failed:', JSON.stringify(session));
  process.exit(1);
}
console.log('Fresh user created:', email);

// --- 2. Browser setup ---
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

page.on('pageerror', (e) => logIssue('PAGE-ERROR', e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') logIssue('CONSOLE', msg.text().slice(0, 300));
});
page.on('response', (resp) => {
  if (resp.status() >= 400 && !resp.url().includes('_next/static')) {
    logIssue('HTTP', `${resp.status()} ${resp.url()}`);
  }
});

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`  shot: ${name}`);
}

// --- 3. Discover cookie format via dev auto-login, then swap session ---
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);
const devCookies = await context.cookies();
const authCookies = devCookies.filter((c) => /sb-.*-auth-token/.test(c.name));
if (authCookies.length === 0) {
  console.error('No supabase auth cookies found after auto-login. Cookies:',
    devCookies.map((c) => c.name).join(', '));
  process.exit(1);
}
console.log('Auth cookies discovered:', authCookies.map((c) => `${c.name} (${c.value.slice(0, 20)}...)`).join(', '));

// Build fresh-user cookie value in the same format as the existing one.
const sessionJson = JSON.stringify(session);
const isBase64 = authCookies[0].value.startsWith('base64-');
const encoded = isBase64
  ? 'base64-' + Buffer.from(sessionJson).toString('base64url')
  : encodeURIComponent(sessionJson);

// Clear old auth cookies, set new ones (chunk if the original was chunked).
const baseName = authCookies[0].name.replace(/\.\d+$/, '');
await context.clearCookies();
const CHUNK = 3180;
if (encoded.length > CHUNK) {
  for (let i = 0; i * CHUNK < encoded.length; i++) {
    await context.addCookies([{
      name: `${baseName}.${i}`,
      value: encoded.slice(i * CHUNK, (i + 1) * CHUNK),
      url: BASE,
    }]);
  }
} else {
  await context.addCookies([{ name: baseName, value: encoded, url: BASE }]);
}
console.log('Session swapped to fresh user.');

// --- 4. Landing page as stranger (no cookie needed, but check it) ---
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await shot('01_landing');
console.log('Landing URL:', page.url());

// --- 5. Go to dashboard -> expect redirect to onboarding ---
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
console.log('After /dashboard ->', page.url());
await shot('02_after_dashboard_redirect');

if (!page.url().includes('onboarding')) {
  logIssue('FLOW', `Fresh user at /dashboard landed on ${page.url()} instead of /onboarding`);
}

// --- 6. Walk onboarding adaptively ---
await page.goto(`${BASE}/onboarding`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

for (let i = 0; i < 14; i++) {
  await shot(`03_onboarding_${String(i).padStart(2, '0')}`);

  // Dump visible buttons for the log
  const buttons = await page.locator('button:visible').allTextContents();
  console.log(`  step ${i} buttons:`, buttons.map((b) => b.trim().slice(0, 40)).filter(Boolean).join(' | '));

  // Fill any empty visible text input with a stage name
  const input = page.locator('input[type="text"]:visible').first();
  if (await input.count()) {
    const val = await input.inputValue();
    if (!val) {
      await input.fill('Beta Stranger');
      console.log('  filled text input with "Beta Stranger"');
    }
  }

  // Click priority: QUICK START > CONTINUE/NEXT > CREATE/CONFIRM > first card-like option then NEXT
  const clickOrder = [
    'button:has-text("QUICK START")',
    'button:has-text("CONTINUE")',
    'button:has-text("NEXT")',
    'button:has-text("CREATE")',
    'button:has-text("CONFIRM")',
    'button:has-text("GET STARTED")',
    'button:has-text("BEGIN")',
    'button:has-text("ENTER")',
    'button:has-text("GO TO DASHBOARD")',
    'button:has-text("START")',
  ];
  let clicked = false;
  for (const sel of clickOrder) {
    const btn = page.locator(sel).first();
    if ((await btn.count()) && (await btn.isEnabled().catch(() => false))) {
      const label = (await btn.textContent())?.trim();
      await btn.click();
      console.log(`  clicked: "${label}"`);
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    // Try selecting the first selectable card (league/style/template options)
    const card = page.locator('[class*="cursor-pointer"]:visible, button:visible').first();
    if (await card.count()) {
      await card.click().catch(() => {});
      console.log('  clicked first selectable element as fallback');
    } else {
      console.log('  nothing clickable found, stopping onboarding walk');
      break;
    }
  }
  await page.waitForTimeout(1200);
  if (page.url().includes('/dashboard')) {
    console.log('  reached dashboard!');
    break;
  }
}

await shot('04_onboarding_final_state');
console.log('Final URL after onboarding walk:', page.url());

// --- 7. Dashboard as (hopefully) created battler ---
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await shot('05_dashboard');
console.log('Dashboard URL:', page.url());

// --- 8. Visit every nav destination as fresh user ---
const routes = ['/battle/offers', '/battlers', '/leagues', '/cities', '/calendar', '/media', '/badges'];
for (const r of routes) {
  await page.goto(`${BASE}${r}`, { waitUntil: 'networkidle', timeout: 20000 }).catch((e) => {
    logIssue('NAV', `${r} failed to load: ${e.message.slice(0, 100)}`);
  });
  await page.waitForTimeout(900);
  await shot(`06_route_${r.replace(/\//g, '_')}`);
}

// --- Save auth state for follow-up scripts ---
await context.storageState({ path: 'scripts/.beta-stranger-state.json' });

console.log('\n=== ISSUE SUMMARY ===');
for (const i of issues) console.log(`[${i.sev}] ${i.msg}`);
console.log(`Total: ${issues.length} issues. Screenshots in ${OUT}/`);

await browser.close();
