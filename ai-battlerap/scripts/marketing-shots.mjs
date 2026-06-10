// Capture polished marketing screenshots of real game UI for the landing page.
// Saves directly into public/landing/ so they deploy.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = 'http://localhost:1919';
fs.mkdirSync('public/landing', { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2, // retina-sharp shots
  storageState: 'scripts/.beta-stranger-state.json',
});
const page = await context.newPage();

async function shoot(url, out, { wait = 2000, clip } = {}) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `public/landing/${out}`, clip });
  console.log('saved', out);
}

// Battle results VS screen — the money shot (top of page)
await shoot('/battle/ccb756dd-eaa8-40ad-b328-6454b25635b3', 'shot-battle.png', {
  wait: 3500,
  clip: { x: 0, y: 60, width: 1440, height: 840 },
});

// Dashboard with career stats
await shoot('/dashboard', 'shot-dashboard.png', {
  wait: 2500,
  clip: { x: 0, y: 60, width: 1440, height: 840 },
});

// League home (standings + battles)
const leagues = await page.evaluate(async () => {
  const r = await fetch('/api/debug');
  return null;
}).catch(() => null);
await page.goto(`${BASE}/leagues`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const firstLeague = await page.locator('a[href^="/leagues/"]:not([href="/leagues"])').first().getAttribute('href');
await shoot(firstLeague, 'shot-league.png', { wait: 2500, clip: { x: 0, y: 60, width: 1440, height: 840 } });

// Badges collection
await shoot('/badges', 'shot-badges.png', { wait: 2500, clip: { x: 0, y: 60, width: 1440, height: 840 } });

await browser.close();
console.log('done');
