import { chromium } from '@playwright/test';

const BATTLE_ID = process.argv[2] || 'f06b4a33-4fba-4d57-90e9-9dd119641137';
const BASE = 'http://localhost:1919';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

const failures = [];
page.on('response', (res) => {
  if (res.status() >= 400) failures.push(`${res.status()} ${res.request().method()} ${res.url()}`);
});
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(`[on ${page.url()}] ${msg.text().split('\n')[0]}`);
});

// Login
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
await page.getByRole('button', { name: /dev quick login/i }).click();
await page.waitForURL('**/dashboard', { timeout: 30000 });
await page.waitForLoadState('networkidle');

// Prep page
await page.goto(`${BASE}/battle/${BATTLE_ID}/prep`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForSelector('text=FIGHT PROJECTION', { timeout: 15000 });

// Hover the Life Events nav link to trigger dev prefetch (the old 404 source)
const lifeLink = page.locator('a[href="/life-events"]').first();
if (await lifeLink.count()) {
  await lifeLink.hover().catch(() => {});
  await page.waitForTimeout(800);
  console.log('hovered /life-events nav link');
}

// --- Rapidly assign 5 prep days, watch for SAVING blink -------------------
const plan = ['research', 'research', 'writing', 'writing', 'performance'];
let sawSaving = false;
const savingWatcher = setInterval(async () => {
  try {
    const n = await page.getByText('SAVING', { exact: false }).count();
    if (n > 0) sawSaving = true;
  } catch {}
}, 50);

const selects = page.locator('select');
const t0 = Date.now();
for (let i = 0; i < plan.length; i++) {
  await selects.nth(i).selectOption(plan[i]); // no waits between — rapid fire
}
const assignMs = Date.now() - t0;
console.log(`assigned 5 days in ${assignMs}ms`);

// Projection should already reflect the plan (instant, local math)
const writingTile = await page.locator('text=📝 WRITING').locator('..').first().textContent();
console.log('writing tile right after rapid assign:', writingTile?.replace(/\s+/g, ' ').trim());

await page.waitForTimeout(2500); // let background saves land
clearInterval(savingWatcher);
console.log('SAVING blink observed:', sawSaving);

// Projection values
const projText = await page
  .locator('div', { hasText: 'FIGHT PROJECTION' })
  .first()
  .textContent()
  .catch(() => '');
const grab = (label) => {
  const m = projText.match(new RegExp(label + '\\s*([+\\-—][\\d.%]*|[\\d.]+%|—)'));
  return m ? m[1] : '?';
};
console.log('CHOKE RISK in panel present:', /CHOKE RISK/.test(projText));

// Desktop screenshot
await page.screenshot({ path: 'docs/screenshots/prep_overhaul.png', fullPage: true });
console.log('captured prep_overhaul.png');

// --- Reload → persistence check -------------------------------------------
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('text=FIGHT PROJECTION', { timeout: 15000 });
const persisted = [];
for (let i = 0; i < plan.length; i++) {
  persisted.push(await selects.nth(i).inputValue());
}
console.log('expected:', plan.join(','));
console.log('persisted:', persisted.join(','));
console.log('persistence OK:', plan.every((v, i) => persisted[i] === v));

// /life-events page direct (was 404)
const res = await page.goto(`${BASE}/life-events`, { waitUntil: 'networkidle' });
console.log('/life-events status:', res.status());

// --- Mobile screenshot ------------------------------------------------------
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mpage = await mobile.newPage();
mpage.on('response', (r) => {
  if (r.status() >= 400) failures.push(`[mobile] ${r.status()} ${r.request().method()} ${r.url()}`);
});
mpage.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(`[mobile, on ${mpage.url()}] ${msg.text().split('\n')[0]}`);
});
await mpage.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
await mpage.getByRole('button', { name: /dev quick login/i }).click();
await mpage.waitForURL('**/dashboard', { timeout: 30000 });
await mpage.waitForLoadState('networkidle');
await mpage.goto(`${BASE}/battle/${BATTLE_ID}/prep`, { waitUntil: 'networkidle', timeout: 30000 });
await mpage.waitForSelector('text=FIGHT PROJECTION', { timeout: 15000 });
await mpage.screenshot({ path: 'docs/screenshots/prep_overhaul_mobile.png', fullPage: true });
console.log('captured prep_overhaul_mobile.png');

console.log('\n--- HTTP failures (>=400) ---');
failures.length ? failures.forEach((f) => console.log(f)) : console.log('(none)');
console.log('--- console errors ---');
consoleErrors.length ? consoleErrors.forEach((e) => console.log(e)) : console.log('(none)');

await browser.close();
