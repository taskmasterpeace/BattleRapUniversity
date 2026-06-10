// FINAL beta verification: complete stranger journey through the real UI.
// Landing -> signup form -> onboarding -> dashboard -> 3 battles via BATTLE TIME.
// Fails loudly on: Test_ names anywhere, (DEV) buttons, console/page errors.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = 'http://localhost:1919';
const OUT = 'docs/screenshots/beta';
fs.mkdirSync(OUT, { recursive: true });

const problems = [];
const note = (sev, msg) => { problems.push(`[${sev}] ${msg}`); console.error(`[${sev}] ${msg}`); };

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();
page.on('pageerror', (e) => note('PAGE-ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') note('CONSOLE', m.text().slice(0, 200)); });
page.on('response', (r) => {
  if (r.status() >= 500) note('HTTP5XX', `${r.status()} ${r.url()}`);
});

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });

async function assertClean(label) {
  const body = await page.locator('body').innerText().catch(() => '');
  if (/Test_[A-Za-z]/.test(body)) note('TEST-LEAK', `Test_ name visible on ${label}`);
  if (body.includes('(DEV)')) note('DEV-LEAK', `(DEV) button visible on ${label}`);
  if (/ALGORITHM INSTITUTE/i.test(body)) note('NAME', `Old game name visible on ${label}`);
}

// 1. Landing
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await shot('40_landing');
await assertClean('landing');

// 2. Real signup
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.locator('button:has-text("CREATE ACCOUNT")').click();
const email = `final.e2e.${Date.now()}@test.com`;
await page.locator('input[type="email"]').fill(email);
await page.locator('input[type="password"]').fill('BetaTest123!');
await page.locator('button:has-text("ENTER THE CIRCUIT")').click();
await page.waitForURL('**/onboarding', { timeout: 15000 }).catch(() => note('FLOW', 'signup did not reach onboarding'));
console.log('signed up as', email);

// 3. Onboarding (quick start path)
for (let i = 0; i < 12 && !page.url().includes('/dashboard'); i++) {
  await page.waitForTimeout(900);
  const heading = (await page.locator('h2:visible').first().textContent().catch(() => '')) || '';
  const quick = page.locator('button:has-text("QUICK START")').first();
  if (await quick.count()) { await quick.click(); continue; }
  if (heading.includes('CHOOSE YOUR PATH')) {
    await page.locator('div.cursor-pointer').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("CONTINUE")').first().click();
    continue;
  }
  if (heading.includes('IDENTITY')) {
    await page.locator('input[placeholder="Enter your battle name"]').fill('FINAL BOSS');
    await page.locator('button:has-text("NEXT")').first().click();
    continue;
  }
  if (heading.includes('LEAGUE')) {
    await page.locator('div.cursor-pointer').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("NEXT"), button:has-text("CONTINUE")').first().click();
    continue;
  }
  // attributes / styles / review / success: click primary button
  const btns = page.locator('button:visible');
  const n = await btns.count();
  let clicked = false;
  for (let b = 0; b < n; b++) {
    const label = ((await btns.nth(b).textContent()) || '').trim().toUpperCase();
    if (!label || label.includes('BACK') || label.includes('EDIT')) continue;
    if (/NEXT|CONTINUE|CONFIRM|CREATE|ENTER|START/.test(label) && (await btns.nth(b).isEnabled().catch(() => false))) {
      await btns.nth(b).click();
      clicked = true;
      break;
    }
  }
  if (!clicked) {
    const card = page.locator('div.cursor-pointer').first();
    if (await card.count()) await card.click();
  }
}
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
if (page.url().includes('onboarding')) {
  note('FLOW', 'battler creation did not complete');
} else {
  console.log('battler created, on dashboard');
}
await shot('41_dashboard_fresh');
await assertClean('dashboard (fresh)');

// 4. Three battles through the real UI
for (let b = 1; b <= 3; b++) {
  console.log(`--- battle ${b} ---`);
  // accept an offer
  await page.goto(`${BASE}/battle/offers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await assertClean(`offers (battle ${b})`);
  const accept = page.locator('button:has-text("ACCEPT")').first();
  if (!(await accept.count())) { note('FLOW', `battle ${b}: no offers available`); break; }
  await accept.click();
  await page.waitForTimeout(2500);

  // set some prep via the prep page if we landed there
  if (page.url().includes('/prep')) {
    const focus = page.locator('button:has-text("WRITING")').first();
    if (await focus.count()) {
      // select writing focus then click first 3 day cells
      await focus.click().catch(() => {});
      const dayCells = page.locator('[class*="cursor-pointer"]');
      const dn = Math.min(await dayCells.count(), 3);
      for (let d = 0; d < dn; d++) await dayCells.nth(d).click().catch(() => {});
    }
  }

  // dashboard -> BATTLE TIME
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const bt = page.locator('button:has-text("BATTLE TIME")').first();
  if (!(await bt.count())) { note('FLOW', `battle ${b}: no BATTLE TIME button`); break; }
  await bt.click();
  await page.waitForURL('**/battle/**', { timeout: 90000 }).catch(() => note('FLOW', `battle ${b}: did not navigate to results`));
  await page.waitForTimeout(3000);
  await shot(`42_battle_${b}_results`);
  await assertClean(`battle ${b} results`);
}

// 5. Final sweep of all nav routes
for (const r of ['/dashboard', '/battlers', '/leagues', '/cities', '/calendar', '/media', '/badges', '/tournaments', '/relationships', '/finances', '/notifications', '/guide']) {
  await page.goto(`${BASE}${r}`, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => note('NAV', `${r} failed to load`));
  await page.waitForTimeout(700);
  await assertClean(r);
}
await shot('43_final_dashboard');

// 6. /dev must 404 in prod — in dev it's allowed; just note status
const devResp = await page.goto(`${BASE}/dev`, { waitUntil: 'domcontentloaded' });
console.log('/dev status (dev server, expected accessible):', devResp?.status());

console.log('\n========== FINAL E2E SUMMARY ==========');
if (problems.length === 0) console.log('✅ CLEAN RUN — no leaks, no errors, full loop playable');
else problems.forEach((p) => console.log(p));
console.log(`(${problems.length} problems)`);
await browser.close();
process.exit(problems.filter((p) => !p.startsWith('[CONSOLE]')).length > 0 ? 1 : 0);
