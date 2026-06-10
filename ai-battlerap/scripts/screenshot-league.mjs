// Click into a league from the index, then click into the throne sub-page.
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') console.error('CONSOLE ERROR:', msg.text());
});
page.on('response', (resp) => {
  if (resp.status() >= 400) {
    console.error(`HTTP ${resp.status()} ${resp.url()}`);
  }
});

await page.goto('http://localhost:1919/login', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500);

await page.goto('http://localhost:1919/leagues', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

// Click the first league card
const firstLeague = page.locator('a[href^="/leagues/"]:not([href="/leagues"])').first();
const href = await firstLeague.getAttribute('href');
console.log('clicking league', href);
await firstLeague.click();
await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(1500);
console.log('landed on', page.url());
await page.screenshot({ path: 'docs/screenshots/league_home.png', fullPage: true });

// Now click into thrones sub-page
const throneLink = page.locator('a[href*="/thrones"]').first();
if (await throneLink.count()) {
  await throneLink.click();
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
  console.log('throne page', page.url());
  await page.screenshot({ path: 'docs/screenshots/league_thrones.png', fullPage: true });
}

await browser.close();
