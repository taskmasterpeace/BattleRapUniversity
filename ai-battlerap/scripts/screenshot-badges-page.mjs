import { chromium } from '@playwright/test';

const BASE = process.env.BASE || 'http://localhost:3002';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Auto-login flow
await page.goto(`${BASE}/login`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

// Navigate to badges
await page.goto(`${BASE}/badges`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);

await page.screenshot({ path: 'test-results/badges-after-backfill.png', fullPage: true });

// Also a zoomed top section
await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: 'test-results/badges-after-backfill-top.png' });

console.log('Screenshots saved.');
await browser.close();
