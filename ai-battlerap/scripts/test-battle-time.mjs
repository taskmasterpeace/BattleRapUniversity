// Verify the player-facing BATTLE TIME flow: accept an offer, click the
// dashboard button, land on results. Also confirm no DEV buttons remain.
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1400, height: 900 },
  storageState: 'scripts/.beta-stranger-state.json',
});
const page = await context.newPage();
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE:', m.text().slice(0, 200)); });

await page.goto('http://localhost:1919/dashboard', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// 1. No DEV buttons anywhere
const devButtons = await page.locator('button:has-text("(DEV)")').count();
console.log('DEV buttons on dashboard:', devButtons);

// 2. If no upcoming battle, accept an offer first
let battleTime = page.locator('button:has-text("BATTLE TIME")');
if (!(await battleTime.count())) {
  console.log('No upcoming battle — accepting an offer first');
  await page.goto('http://localhost:1919/battle/offers', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const opponents = await page.locator('h2, h3').allTextContents();
  console.log('offer page headings:', opponents.slice(0, 8).join(' | '));
  const accept = page.locator('button:has-text("ACCEPT")').first();
  if (await accept.count()) {
    await accept.click();
    await page.waitForTimeout(2500);
  }
  await page.goto('http://localhost:1919/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  battleTime = page.locator('button:has-text("BATTLE TIME")');
}

console.log('BATTLE TIME button present:', await battleTime.count());
await page.screenshot({ path: 'docs/screenshots/beta/30_dashboard_battle_time.png' });

if (await battleTime.count()) {
  await battleTime.first().click();
  await page.waitForURL('**/battle/**', { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  console.log('after BATTLE TIME, URL =', page.url());
  await page.screenshot({ path: 'docs/screenshots/beta/31_battle_time_results.png' });
}

await browser.close();
