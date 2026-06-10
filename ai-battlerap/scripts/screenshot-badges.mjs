import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('http://localhost:1919/badges', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'docs/screenshots/badges-viewport-top.png', fullPage: false });
// Scroll a few times to capture different sections
await page.evaluate(() => window.scrollTo(0, 800));
await page.waitForTimeout(400);
await page.screenshot({ path: 'docs/screenshots/badges-viewport-1.png', fullPage: false });
await page.evaluate(() => window.scrollTo(0, 1800));
await page.waitForTimeout(400);
await page.screenshot({ path: 'docs/screenshots/badges-viewport-2.png', fullPage: false });
console.log('OK');
await browser.close();
