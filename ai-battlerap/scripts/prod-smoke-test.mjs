// Production smoke test: fresh signup -> onboarding -> dashboard -> accept ->
// BATTLE TIME -> results, against the live deployment.
// Usage: node scripts/prod-smoke-test.mjs https://your-prod-url
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.argv[2];
if (!BASE) { console.error('Usage: node prod-smoke-test.mjs <url>'); process.exit(1); }

fs.mkdirSync('docs/screenshots/prod', { recursive: true });
const problems = [];
const note = (s, m) => { problems.push(`[${s}] ${m}`); console.error(`[${s}] ${m}`); };

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
page.on('pageerror', (e) => note('PAGE-ERROR', e.message));
page.on('response', (r) => { if (r.status() >= 500) note('HTTP5XX', `${r.status()} ${r.url()}`); });
const shot = (n) => page.screenshot({ path: `docs/screenshots/prod/${n}.png` });

// landing
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
await shot('01_landing');
console.log('landing title:', await page.title());

// signup
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.locator('button:has-text("CREATE ACCOUNT")').click();
const email = `prod.smoke.${Date.now()}@test.com`;
await page.locator('input[type="email"]').fill(email);
await page.locator('input[type="password"]').fill('ProdSmoke123!');
await page.locator('button:has-text("ENTER THE CIRCUIT")').click();
await page.waitForURL('**/onboarding', { timeout: 30000 }).catch(() => note('FLOW', 'signup did not reach onboarding'));
console.log('signed up:', email, '->', page.url());
await shot('02_onboarding');

// onboarding quick-start walk
for (let i = 0; i < 12 && !page.url().includes('/dashboard'); i++) {
  await page.waitForTimeout(1000);

  // If a fullscreen modal is open, capture it and try to dismiss/continue through it.
  const modal = page.locator('div.fixed.inset-0').last();
  if (await modal.isVisible().catch(() => false)) {
    await shot(`modal_step_${i}`);
    const modalText = (await modal.innerText().catch(() => '')).slice(0, 150).replace(/\n/g, ' | ');
    console.log(`modal detected at step ${i}: ${modalText}`);
    const modalBtn = modal.locator('button').last();
    if (await modalBtn.count()) {
      await modalBtn.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(800);
      continue;
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    continue;
  }

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
    await page.locator('input[placeholder="Enter your battle name"]').fill('PROD SMOKE');
    // claim a face + home city (both required, both div.cursor-pointer cards)
    const face = page.locator('div.cursor-pointer[data-face]').first();
    await face.waitFor({ timeout: 10000 }).catch(() => {});
    if (await face.count()) await face.click();
    const city = page.locator('div.cursor-pointer[data-city]').first();
    if (await city.count()) await city.click();
    await page.locator('button:has-text("NEXT")').first().click();
    continue;
  }
  if (heading.includes('LEAGUE')) {
    await page.locator('div.cursor-pointer').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("NEXT"), button:has-text("CONTINUE")').first().click();
    continue;
  }
  const btns = page.locator('button:visible');
  const n = await btns.count();
  let clicked = false;
  for (let b = 0; b < n; b++) {
    const label = ((await btns.nth(b).textContent()) || '').trim().toUpperCase();
    if (!label || label.includes('BACK') || label.includes('EDIT')) continue;
    if (/NEXT|CONTINUE|CONFIRM|CREATE|ENTER|START/.test(label) && (await btns.nth(b).isEnabled().catch(() => false))) {
      await btns.nth(b).click({ timeout: 8000 }).catch(() => {}); clicked = true; break;
    }
  }
  if (!clicked) { const c = page.locator('div.cursor-pointer').first(); if (await c.count()) await c.click(); }
}
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
if (page.url().includes('onboarding')) note('FLOW', 'battler creation did not complete');
else console.log('battler created');
await shot('03_dashboard');

// one full battle
await page.goto(`${BASE}/battle/offers`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await shot('04_offers');
const body = await page.locator('body').innerText().catch(() => '');
if (/Test_[A-Za-z]/.test(body)) note('TEST-LEAK', 'Test_ battler on prod offers');
const accept = page.locator('button:has-text("ACCEPT")').first();
if (await accept.count()) {
  await accept.click();
  await page.waitForTimeout(3000);
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const bt = page.locator('button:has-text("BATTLE TIME")').first();
  if (await bt.count()) {
    await bt.click();
    await page.waitForURL('**/battle/**', { timeout: 120000 }).catch(() => note('FLOW', 'no results page after BATTLE TIME'));
    await page.waitForTimeout(4000);
    await shot('05_battle_results');
    console.log('battle complete:', page.url());
  } else note('FLOW', 'no BATTLE TIME button on prod dashboard');
} else note('FLOW', 'no offers on prod for fresh battler');

console.log('\n===== PROD SMOKE SUMMARY =====');
if (!problems.length) console.log('✅ PRODUCTION CLEAN — stranger can sign up and battle');
else problems.forEach((p) => console.log(p));
await browser.close();
process.exit(problems.length ? 1 : 0);
