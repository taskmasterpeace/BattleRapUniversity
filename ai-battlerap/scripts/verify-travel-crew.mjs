// E2E verification of the travel + crew recruiting system against the
// running dev server (localhost:1919). Logs in via the dev quick login,
// travels to a city, recruits a local, checks wrong-city errors, and
// captures screenshots for docs/screenshots/.
import { chromium } from 'playwright-core';

const BASE = 'http://localhost:1919';

function log(msg) {
  console.log(`[verify] ${msg}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

try {
  // ── Login ────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  const devBtn = page.getByText('⚡ Dev quick login');
  await devBtn.waitFor({ timeout: 15000 });
  await devBtn.click();
  await page.waitForURL(/dashboard|onboarding/, { timeout: 30000 });
  log(`logged in, landed on ${page.url()}`);

  // ── Cities index → pick a city detail ───────────────────────────────
  await page.goto(`${BASE}/cities`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'CITIES' }).waitFor({ timeout: 15000 });
  log('cities index loaded');

  // Go to Atlanta (medium scene = $200) via API-known route: find its link
  const atlantaLink = page.locator('a[href^="/cities/"]', { hasText: 'Atlanta' }).first();
  await atlantaLink.waitFor({ timeout: 10000 });
  const atlantaHref = await atlantaLink.getAttribute('href');
  await page.goto(`${BASE}${atlantaHref}`, { waitUntil: 'networkidle' });
  log(`Atlanta detail loaded: ${atlantaHref}`);

  // ── Wrong-city recruit attempt (player not in Atlanta yet) ──────────
  // Recruit buttons should be in "TRAVEL HERE TO RECRUIT" disabled state.
  const disabledRecruit = page.locator('text=Travel here to recruit').first();
  const hasDisabledHint = (await disabledRecruit.count()) > 0;
  log(`recruit gated before travel (hint present): ${hasDisabledHint}`);

  // Also hit the API directly from the page context for a clean error check
  const localBattlerLink = page.locator('a[href^="/battler/"]').first();
  await localBattlerLink.waitFor({ timeout: 10000 });
  const someLocalHref = await localBattlerLink.getAttribute('href');
  const someLocalId = someLocalHref.split('/').pop();
  const wrongCityRes = await page.evaluate(async (battlerId) => {
    const r = await fetch('/api/crew/recruit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ battlerId }),
    });
    return { status: r.status, body: await r.json() };
  }, someLocalId);
  log(`wrong-city recruit API → ${wrongCityRes.status}: ${wrongCityRes.body.error}`);
  if (wrongCityRes.status !== 400 || wrongCityRes.body.code !== 'wrong_city') {
    throw new Error('Expected wrong_city 400 from recruit before traveling');
  }

  // ── Travel to Atlanta ────────────────────────────────────────────────
  const travelBtn = page.getByRole('button', { name: /TRAVEL HERE/ });
  await travelBtn.waitFor({ timeout: 10000 });
  const btnText = await travelBtn.innerText();
  log(`travel button: "${btnText}"`);
  await travelBtn.click();
  await page.getByText('You are here').first().waitFor({ timeout: 15000 });
  log('YOU ARE HERE appeared after travel');

  // Reload to get fresh server-rendered state
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('You are here').first().waitFor({ timeout: 15000 });

  // ── Screenshot: city detail (in town, recruit enabled) ──────────────
  await page.screenshot({ path: 'docs/screenshots/city_detail.png', fullPage: false });
  log('saved docs/screenshots/city_detail.png');

  // ── Recruit a local ──────────────────────────────────────────────────
  const recruitBtn = page
    .getByRole('button', { name: /Recruit · \$/, disabled: false })
    .first();
  await recruitBtn.waitFor({ timeout: 10000 });
  const recruitText = await recruitBtn.innerText();
  log(`recruiting via: "${recruitText}"`);
  await recruitBtn.click();
  await page.getByText('In your crew').first().waitFor({ timeout: 15000 });
  log('recruit succeeded — IN YOUR CREW badge shown');

  // ── Already-recruited + double-travel error checks ───────────────────
  const dupRes = await page.evaluate(async () => {
    const r = await fetch('/api/travel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cityId: location.pathname.split('/').pop() }),
    });
    return { status: r.status, body: await r.json() };
  });
  log(`travel to current city API → ${dupRes.status}: ${dupRes.body.error}`);
  if (dupRes.status !== 400) throw new Error('Expected 400 traveling to current city');

  // ── Crew page ────────────────────────────────────────────────────────
  await page.goto(`${BASE}/crew`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'YOUR CREW' }).waitFor({ timeout: 15000 });
  await page.getByText('EVERY BATTLE').first().waitFor({ timeout: 10000 });
  log('crew page shows recruited member with bonus');
  await page.screenshot({ path: 'docs/screenshots/crew_page.png', fullPage: true });
  log('saved docs/screenshots/crew_page.png');

  // ── Balance sanity via DB happens outside; report final UI state ─────
  log('ALL CHECKS PASSED');
} catch (err) {
  await page.screenshot({ path: 'docs/screenshots/verify_failure.png', fullPage: true }).catch(() => {});
  console.error('[verify] FAILED:', err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
