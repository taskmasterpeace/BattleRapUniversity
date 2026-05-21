import { chromium } from 'playwright';

const BASE = 'http://localhost:3001';

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Dashboard
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-results/avatar-dashboard.png', fullPage: true });
  console.log('saved dashboard');

  // Offers
  await page.goto(`${BASE}/battle/offers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-results/avatar-offers.png', fullPage: true });
  console.log('saved offers');

  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
