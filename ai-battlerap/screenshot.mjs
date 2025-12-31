import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const pages = [
    { url: 'http://localhost:3000', name: 'home' },
    { url: 'http://localhost:3000/dashboard', name: 'dashboard' },
    { url: 'http://localhost:3000/badges', name: 'badges' },
    { url: 'http://localhost:3000/battle/offers', name: 'battle-offers' },
    { url: 'http://localhost:3000/finances', name: 'finances' },
  ];

  for (const { url, name } of pages) {
    try {
      console.log(`Capturing ${name}...`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.screenshot({ path: `screenshot-${name}.png`, fullPage: true });
      console.log(`✓ Saved screenshot-${name}.png`);
    } catch (error) {
      console.error(`✗ Failed to capture ${name}: ${error.message}`);
    }
  }

  await browser.close();
  console.log('\nAll screenshots saved!');
}

captureScreenshots();
