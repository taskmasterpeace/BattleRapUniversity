import { chromium } from '@playwright/test';
const BASE = process.env.BASE || 'http://localhost:1919';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(`${BASE}/badges`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);
// Crop to first row of badges
await page.screenshot({ path: 'test-results/badges-zoom.png', clip: { x: 60, y: 230, width: 1320, height: 420 } });
console.log('Saved test-results/badges-zoom.png');
await browser.close();
