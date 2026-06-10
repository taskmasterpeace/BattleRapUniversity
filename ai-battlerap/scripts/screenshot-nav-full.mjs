// Full visual sweep — every key route + hover/active states + drawer mid-animation.
// Use after UI/animation polish to confirm nothing regressed.
import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';

const OUT = 'docs/screenshots';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();

// Surface page errors so we notice real bugs, not just visual ones
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') console.error('CONSOLE ERROR:', msg.text());
});

// Auto-login
await page.goto('http://localhost:1919/login', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500);

const routes = ['/dashboard', '/calendar', '/cities', '/battlers', '/leagues'];
for (const path of routes) {
  await page.goto(`http://localhost:1919${path}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(800);
  const safe = path.replace(/\//g, '_');
  await page.screenshot({ path: `${OUT}/nav${safe}.png`, fullPage: false });
  console.log('captured', path);
}

// Hover battler card to confirm lift + shadow
await page.goto('http://localhost:1919/battlers', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const firstCard = page.locator('a[href^="/battler/"]').first();
if (await firstCard.count()) {
  await firstCard.hover();
  await page.waitForTimeout(400); // let transition settle
  await page.screenshot({ path: `${OUT}/nav_battlers_hover.png`, fullPage: false });
  console.log('captured battler hover');
}

// Hover city card
await page.goto('http://localhost:1919/cities', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const firstCity = page.locator('.grid > div').first();
if (await firstCity.count()) {
  await firstCity.hover();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/nav_cities_hover.png`, fullPage: false });
  console.log('captured city hover');
}

// Drawer mid-animation (capture quickly so slide is in-flight) + fully open
await page.goto('http://localhost:1919/dashboard', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const menuBtn = page.getByRole('button', { name: /open menu/i });
if (await menuBtn.count()) {
  await menuBtn.first().click();
  await page.waitForTimeout(120); // mid-slide (animation is 240ms)
  await page.screenshot({ path: `${OUT}/nav_drawer_mid.png`, fullPage: false });
  await page.waitForTimeout(400); // fully open + stagger done
  await page.screenshot({ path: `${OUT}/nav_drawer_open.png`, fullPage: false });
  console.log('captured drawer mid + open');

  // Hover a drawer tile
  const dashTile = page.locator('aside a[href="/dashboard"]');
  if (await dashTile.count()) {
    await dashTile.first().hover();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/nav_drawer_tile_hover.png`, fullPage: false });
    console.log('captured drawer tile hover');
  }
}

await browser.close();
