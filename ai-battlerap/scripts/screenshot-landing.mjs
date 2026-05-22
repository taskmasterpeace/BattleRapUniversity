import { chromium } from '@playwright/test';

const BASE = process.env.BASE || 'http://localhost:1919';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);

await page.screenshot({ path: 'test-results/landing-redesign.png', fullPage: true });
console.log('Saved test-results/landing-redesign.png');

await browser.close();
