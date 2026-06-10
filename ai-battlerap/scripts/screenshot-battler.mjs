// Verify battler drill-down works after adding QueryClientProvider.
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') console.error('CONSOLE ERROR:', msg.text());
});
page.on('response', (resp) => {
  if (resp.status() >= 400) console.error(`HTTP ${resp.status()} ${resp.url()}`);
});

await page.goto('http://localhost:1919/login', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500);

await page.goto('http://localhost:1919/battlers', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// Click the first non-Test_ battler card
const firstBattler = page.locator('a[href^="/battler/"]').first();
const href = await firstBattler.getAttribute('href');
console.log('Clicking', href);
await firstBattler.click();
await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(2000);

console.log('Landed on', page.url());
await page.screenshot({ path: 'docs/screenshots/battler_profile.png', fullPage: true });

await browser.close();
console.log('Done. Screenshot saved to docs/screenshots/battler_profile.png');
