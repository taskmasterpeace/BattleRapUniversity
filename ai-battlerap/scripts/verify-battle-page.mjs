import { chromium } from 'playwright';

const BATTLE_ID = process.argv[2] || 'f06b4a33-4fba-4d57-90e9-9dd119641137';
const BASE = 'http://localhost:1919';

const browser = await chromium.launch();
const consoleErrors = [];

async function newPage(ctx) {
  const page = await ctx.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
  return page;
}

// ── Desktop ──
const desktop = await browser.newContext({ viewport: { width: 1400, height: 900 } });
let page = await newPage(desktop);

await page.goto(`${BASE}/login`);
await page.waitForLoadState('networkidle');
const devBtn = page.getByText(/dev quick login/i).first();
if (await devBtn.count()) {
  await devBtn.click();
  await page.waitForURL(/dashboard|onboarding/, { timeout: 20000 }).catch(() => {});
}
await page.waitForTimeout(1500);

await page.goto(`${BASE}/battle/${BATTLE_ID}`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2500);

// dismiss any badge unlock modals
for (let i = 0; i < 6; i++) {
  const claim = page.getByText(/CLAIM BADGE/i).first();
  if (await claim.count()) {
    await claim.click().catch(() => {});
    await page.waitForTimeout(700);
  } else break;
}

await page.screenshot({ path: 'docs/screenshots/battle_after.png', fullPage: true });
await page.screenshot({ path: 'docs/screenshots/battle_after_viewport.png' });

const pageHeight = await page.evaluate(() => document.body.scrollHeight);
console.log(`Desktop full page height: ${pageHeight}px (${(pageHeight / 900).toFixed(1)} screens at 1400x900)`);

await desktop.close();

// ── Mobile ──
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
page = await newPage(mobile);
await page.goto(`${BASE}/login`);
await page.waitForLoadState('networkidle');
const devBtn2 = page.getByText(/dev quick login/i).first();
if (await devBtn2.count()) {
  await devBtn2.click();
  await page.waitForURL(/dashboard|onboarding/, { timeout: 20000 }).catch(() => {});
}
await page.waitForTimeout(1000);
await page.goto(`${BASE}/battle/${BATTLE_ID}`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2500);
for (let i = 0; i < 6; i++) {
  const claim = page.getByText(/CLAIM BADGE/i).first();
  if (await claim.count()) {
    await claim.click().catch(() => {});
    await page.waitForTimeout(700);
  } else break;
}
await page.screenshot({ path: 'docs/screenshots/battle_after_mobile.png', fullPage: true });
await mobile.close();

await browser.close();

if (consoleErrors.length) {
  console.log('CONSOLE ERRORS:');
  for (const e of consoleErrors) console.log('  -', e.slice(0, 300));
  process.exit(1);
} else {
  console.log('Zero console errors.');
}
