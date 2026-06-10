// Verify the World Events layer: /media feed full of varied world coverage
// plus one world-event article detail page. Reports console/page errors.
import { chromium } from '@playwright/test';

const ARTICLE_SLUG = process.argv[2] ?? 'tru-foe-got-his-pen-back-the-quietest-biggest-story-in-the-culture-10mjde';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

let errorCount = 0;
page.on('pageerror', (e) => {
  errorCount++;
  console.error('PAGE ERROR:', e.message);
});
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    errorCount++;
    console.error('CONSOLE ERROR:', msg.text());
  }
});
page.on('response', (resp) => {
  if (resp.status() >= 400) console.error(`HTTP ${resp.status()} ${resp.url()}`);
});

await page.goto('http://localhost:1919/login', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
const quickLogin = page.getByText('Dev Quick Login', { exact: false });
if (await quickLogin.count()) {
  await quickLogin.first().click();
  await page.waitForTimeout(3500);
}
console.log('After login:', page.url());

// Media feed
await page.goto('http://localhost:1919/media', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'docs/screenshots/world_events_feed.png', fullPage: true });
console.log('Saved docs/screenshots/world_events_feed.png');

// Culture filter check
await page.getByRole('button', { name: 'Culture' }).click();
await page.waitForTimeout(1500);
const cultureCount = await page.locator('a[href^="/media/"]').count();
console.log('Culture-filter articles visible:', cultureCount);

// Article detail
await page.goto(`http://localhost:1919/media/${ARTICLE_SLUG}`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'docs/screenshots/world_event_article.png', fullPage: true });
console.log('Saved docs/screenshots/world_event_article.png');

await browser.close();
console.log(`Done. Console/page errors: ${errorCount}`);
