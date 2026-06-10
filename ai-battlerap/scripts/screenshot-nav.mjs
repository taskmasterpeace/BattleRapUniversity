import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

// Visit login (auto-login flow on dev kicks in)
await page.goto('http://localhost:1919/login', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500); // give auto-login a moment

// Now hit each new page
const pages = ['/dashboard', '/calendar', '/cities', '/battlers', '/leagues'];
for (const path of pages) {
  await page.goto(`http://localhost:1919${path}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(800);
  const safe = path.replace(/\//g, '_') || '_root';
  await page.screenshot({ path: `docs/screenshots/nav${safe}.png`, fullPage: false });
  console.log('captured', path);
}

// Open drawer on dashboard for the menu screenshot
await page.goto('http://localhost:1919/dashboard', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const menuBtn = page.getByRole('button', { name: /open menu/i });
if (await menuBtn.count()) {
  await menuBtn.first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'docs/screenshots/nav_drawer_open.png', fullPage: false });
  console.log('captured drawer');
}

await browser.close();
