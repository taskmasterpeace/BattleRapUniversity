// E2E: async PvP challenge loop between two real accounts.
//
// Account A = existing 'BETA STRANGER' (scripts/.beta-stranger-state.json)
// Account B = fresh signup (cookie-swap technique from beta-stranger-playthrough.mjs)
//
// Flow: B challenges A's battler -> A sees PLAYER CHALLENGE offer -> A accepts
// -> both set prep -> both lock in -> battle simulates -> both view results.
//
// Screenshots: docs/screenshots/pvp_offer.png, pvp_lockin.png, pvp_result.png
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = 'http://localhost:1919';
const SUPABASE_URL = 'http://127.0.0.1:54321';
const ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const OUT = 'docs/screenshots';
fs.mkdirSync(OUT, { recursive: true });

const issues = [];
function logIssue(sev, msg) {
  issues.push({ sev, msg });
  console.error(`[${sev}] ${msg}`);
}
function watch(page, tag) {
  page.on('pageerror', (e) => logIssue(`${tag}-PAGE-ERROR`, e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') logIssue(`${tag}-CONSOLE`, msg.text().slice(0, 300));
  });
  page.on('response', (resp) => {
    if (resp.status() >= 400 && !resp.url().includes('_next/static')) {
      logIssue(`${tag}-HTTP`, `${resp.status()} ${resp.url()}`);
    }
  });
}

const browser = await chromium.launch();

// ─── Account B: fresh signup + cookie swap ──────────────────────────────────
const email = `pvp.challenger.${Date.now()}@test.com`;
const password = 'PvpTest123!';
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
console.log('Account B created:', email);

const ctxB = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const pageB = await ctxB.newPage();
watch(pageB, 'B');

// Sign in via the real login form (account already exists from REST signup)
await pageB.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 60000 });
await pageB.waitForTimeout(1000);
await pageB.fill('input[type="email"]', email);
await pageB.fill('input[type="password"]', password);
await pageB.click('button[type="submit"]');
await pageB.waitForTimeout(4000);
const cookiesB = await ctxB.cookies();
if (!cookiesB.some((c) => /sb-.*-auth-token/.test(c.name))) {
  console.error('B sign-in failed — no auth cookies. URL:', pageB.url());
  process.exit(1);
}
console.log('B signed in via login form.');

// ─── B walks onboarding (deterministic quick-start path) ────────────────────
const stageNameB = `Pvp Challenger ${String(Date.now()).slice(-5)}`;
await pageB.goto(`${BASE}/onboarding`, { waitUntil: 'networkidle', timeout: 60000 });
await pageB.waitForTimeout(1000);

// Step 0: Welcome → QUICK START
await pageB.locator('button:has-text("QUICK START")').first().click();
await pageB.waitForTimeout(1000);

// Step 1: Template — pick the first template card, then CONTINUE
await pageB.locator('div[class*="cursor-pointer"]:has(h3)').first().click();
await pageB.waitForTimeout(500);
await pageB.locator('button:has-text("CONTINUE")').first().click();
await pageB.waitForTimeout(1000);

// Step 2: Identity — stage name, then NEXT
await pageB.fill('input[placeholder="Enter your battle name"]', stageNameB);
console.log(`  stage name: ${stageNameB}`);
await pageB.locator('button:has-text("NEXT")').first().click();
await pageB.waitForTimeout(1000);

// Step 3: League — pick first league card, then NEXT
await pageB.locator('div[class*="cursor-pointer"]:has(h3)').first().click();
await pageB.waitForTimeout(500);
await pageB.locator('button:has-text("NEXT")').first().click();
await pageB.waitForTimeout(1000);

// Step 4: Attributes — spend remaining points via "+" until NEXT enables
for (let i = 0; i < 40; i++) {
  const next = pageB.locator('button:has-text("NEXT")').first();
  if (await next.isEnabled().catch(() => false)) break;
  const plus = pageB.locator('button:has-text("+"):enabled').first();
  if (!(await plus.count())) break;
  await plus.click();
  await pageB.waitForTimeout(120);
}
await pageB.locator('button:has-text("NEXT")').first().click();
await pageB.waitForTimeout(1000);

// Step 5: Styles — pick two, then NEXT
await pageB.locator('button:has-text("WORDPLAY")').first().click().catch(() => {});
await pageB.locator('button:has-text("FREESTYLE")').first().click().catch(() => {});
await pageB.waitForTimeout(300);
await pageB.locator('button:has-text("NEXT")').first().click();
await pageB.waitForTimeout(1000);

// Step 6: Review → CONFIRM & CREATE
await pageB.locator('button:has-text("CONFIRM & CREATE")').first().click();
await pageB.waitForTimeout(4000);

// Success screen → ENTER THE CIRCUIT
const enterBtn = pageB.locator('button:has-text("ENTER THE CIRCUIT")');
if (await enterBtn.count()) {
  await enterBtn.first().click();
  await pageB.waitForTimeout(2000);
}

if (!pageB.url().includes('/dashboard')) {
  await pageB.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await pageB.waitForTimeout(1000);
  if (!pageB.url().includes('/dashboard')) {
    await pageB.screenshot({ path: `${OUT}/pvp_onboarding_FAIL.png` });
    logIssue('FLOW', `B never reached dashboard (at ${pageB.url()})`);
    process.exit(1);
  }
}
console.log('B onboarded and on dashboard.');

// ─── B challenges BETA STRANGER from the PLAYERS roster ────────────────────
await pageB.goto(`${BASE}/battlers?view=players`, { waitUntil: 'networkidle', timeout: 60000 });
await pageB.waitForTimeout(1000);
await pageB.screenshot({ path: `${OUT}/pvp_players_roster.png` });

const strangerCard = pageB
  .locator('div.group', { has: pageB.locator('h3', { hasText: /BETA STRANGER/i }) })
  .first();
if (!(await strangerCard.count())) {
  logIssue('FLOW', 'BETA STRANGER not found in PLAYERS roster');
  process.exit(1);
}
await strangerCard.locator('button:has-text("CHALLENGE")').click();
await pageB.waitForTimeout(2500);
console.log('B sent challenge to BETA STRANGER');
await pageB.screenshot({ path: `${OUT}/pvp_challenge_sent.png` });

// ─── A (BETA STRANGER) sees + accepts the offer ─────────────────────────────
const ctxA = await browser.newContext({
  viewport: { width: 1400, height: 900 },
  storageState: 'scripts/.beta-stranger-state.json',
});
const pageA = await ctxA.newPage();
watch(pageA, 'A');

await pageA.goto(`${BASE}/battle/offers`, { waitUntil: 'networkidle', timeout: 60000 });
await pageA.waitForTimeout(1500);
const pvpBanner = pageA.locator('text=PLAYER CHALLENGE').first();
if (!(await pvpBanner.count())) {
  logIssue('FLOW', 'A does not see PLAYER CHALLENGE badge on offers page');
  await pageA.screenshot({ path: `${OUT}/pvp_offer_FAIL.png` });
  process.exit(1);
}
await pageA.screenshot({ path: `${OUT}/pvp_offer.png` });
console.log('A sees the PLAYER CHALLENGE offer');

// The PvP offer card sorts first — accept it.
const pvpCard = pageA
  .locator('div.bg-\\[\\#2d2f35\\]', { hasText: 'PLAYER CHALLENGE' })
  .first();
await pvpCard.locator('button:has-text("ACCEPT")').first().click();
await pageA.waitForURL(/\/battle\/[0-9a-f-]+\/prep/, { timeout: 30000 });
const battleId = pageA.url().match(/\/battle\/([0-9a-f-]+)\/prep/)[1];
console.log('A accepted. Battle id:', battleId);
await pageA.waitForTimeout(1500);

// ─── A sets prep + locks in ─────────────────────────────────────────────────
async function setPrep(page, tag) {
  await page.waitForSelector('select', { timeout: 30000 });
  const selects = page.locator('select');
  const n = await selects.count();
  const focuses = ['writing', 'research', 'performance', 'rest', 'writing', 'performance'];
  for (let i = 0; i < n; i++) {
    await selects.nth(i).selectOption(focuses[i % focuses.length]);
    await page.waitForTimeout(700);
  }
  console.log(`${tag} set prep on ${n} day(s)`);
}

await setPrep(pageA, 'A');
const lockBtnA = pageA.locator('button:has-text("LOCK IN")').first();
if (!(await lockBtnA.count())) {
  logIssue('FLOW', 'A does not see LOCK IN button on prep page');
  await pageA.screenshot({ path: `${OUT}/pvp_lockin_FAIL.png` });
  process.exit(1);
}
await lockBtnA.click();
await pageA.waitForSelector('text=WAITING ON OPPONENT', { timeout: 30000 });
await pageA.screenshot({ path: `${OUT}/pvp_lockin.png` });
console.log('A locked in — waiting state shown');

// ─── B sets prep + locks in -> battle simulates ─────────────────────────────
await pageB.goto(`${BASE}/battle/${battleId}/prep`, { waitUntil: 'networkidle', timeout: 60000 });
await pageB.waitForTimeout(1500);
await setPrep(pageB, 'B');
const lockBtnB = pageB.locator('button:has-text("LOCK IN")').first();
await lockBtnB.click();
await pageB.waitForURL(new RegExp(`/battle/${battleId}$`), { timeout: 120000 });
await pageB.waitForTimeout(3000);
await pageB.screenshot({ path: `${OUT}/pvp_result.png`, fullPage: false });
console.log('B locked in second — battle simulated, B viewing results');

// ─── A can view the result too ──────────────────────────────────────────────
await pageA.goto(`${BASE}/battle/${battleId}`, { waitUntil: 'networkidle', timeout: 60000 });
await pageA.waitForTimeout(2500);
const aBody = await pageA.textContent('body');
if (/not your battle|error/i.test(aBody?.slice(0, 600) || '')) {
  logIssue('FLOW', 'A may not be able to view the PvP result page');
}
await pageA.screenshot({ path: `${OUT}/pvp_result_challenged_view.png` });
console.log('A viewed the result page');

console.log('\n=== ISSUE SUMMARY ===');
for (const i of issues) console.log(`[${i.sev}] ${i.msg}`);
console.log(`Total: ${issues.length} issues.`);

await browser.close();
process.exit(issues.length > 0 ? 2 : 0);
