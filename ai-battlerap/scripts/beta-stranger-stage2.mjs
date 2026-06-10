// Stage 2: resume the fresh-stranger session and complete onboarding with
// targeted selectors, then play through the battle loop (offers -> accept ->
// prep -> simulate -> results). Read-only audit: uses only what the UI offers,
// plus the internal cron endpoints to stand in for the scheduler.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = 'http://localhost:1919';
const OUT = 'docs/screenshots/beta';
fs.mkdirSync(OUT, { recursive: true });

const issues = [];
const logIssue = (sev, msg) => { issues.push(`[${sev}] ${msg}`); console.error(`[${sev}] ${msg}`); };

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1400, height: 900 },
  storageState: 'scripts/.beta-stranger-state.json',
});
const page = await context.newPage();
page.on('pageerror', (e) => logIssue('PAGE-ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') logIssue('CONSOLE', m.text().slice(0, 250)); });
page.on('response', (r) => {
  if (r.status() >= 400 && !r.url().includes('_next/static')) logIssue('HTTP', `${r.status()} ${r.url()}`);
});

const shot = async (name) => { await page.screenshot({ path: `${OUT}/${name}.png` }); console.log(`  shot: ${name}`); };

// ---------- complete onboarding ----------
await page.goto(`${BASE}/onboarding`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

for (let i = 0; i < 12 && !page.url().includes('/dashboard'); i++) {
  await page.waitForTimeout(800);
  const heading = await page.locator('h2:visible').first().textContent().catch(() => '');
  console.log(`onboarding loop ${i}: heading="${heading?.trim()}"`);

  // Welcome screen
  const quick = page.locator('button:has-text("QUICK START")').first();
  if (await quick.count()) { await quick.click(); await shot(`10_ob_${i}_welcome`); continue; }

  // Template step: click the first template card, then CONTINUE
  if (heading?.includes('CHOOSE YOUR PATH')) {
    await page.locator('div.cursor-pointer').first().click();
    await page.waitForTimeout(300);
    await shot(`10_ob_${i}_template_selected`);
    await page.locator('button:has-text("CONTINUE")').first().click();
    continue;
  }

  // Identity step
  if (heading?.includes('IDENTITY')) {
    await page.locator('input[placeholder="Enter your battle name"]').fill('BETA STRANGER');
    await page.locator('input[placeholder*="NYC"]').fill('MKE').catch(() => {});
    await shot(`10_ob_${i}_identity`);
    await page.locator('button:has-text("NEXT")').first().click();
    continue;
  }

  // League step: click first league card then proceed
  if (heading?.includes('LEAGUE')) {
    await page.locator('div.cursor-pointer, div[class*="cursor-pointer"]').first().click();
    await page.waitForTimeout(300);
    await shot(`10_ob_${i}_league`);
    const next = page.locator('button:has-text("NEXT"), button:has-text("CONTINUE")').first();
    await next.click();
    continue;
  }

  // Styles step: select up to 3 style cards then continue
  if (heading?.toUpperCase().includes('STYLE')) {
    const cards = page.locator('div.cursor-pointer, button[class*="border"]');
    const n = Math.min(await cards.count(), 3);
    for (let c = 0; c < n; c++) await cards.nth(c).click().catch(() => {});
    await shot(`10_ob_${i}_styles`);
    const next = page.locator('button:has-text("NEXT"), button:has-text("CONTINUE")').first();
    if (await next.isEnabled().catch(() => false)) { await next.click(); continue; }
  }

  // Review / attributes / success: click the enabled primary button that isn't BACK
  await shot(`10_ob_${i}_generic`);
  const candidates = page.locator('button:visible');
  const count = await candidates.count();
  let clicked = false;
  for (let b = 0; b < count; b++) {
    const btn = candidates.nth(b);
    const label = ((await btn.textContent()) || '').trim().toUpperCase();
    if (!label || label.includes('BACK') || label.includes('EDIT')) continue;
    if (/NEXT|CONTINUE|CONFIRM|CREATE|FINISH|START|ENTER|DASHBOARD|LET'S GO|GO/.test(label)) {
      if (await btn.isEnabled().catch(() => false)) {
        console.log(`  clicking "${label}"`);
        await btn.click();
        clicked = true;
        break;
      }
    }
  }
  if (!clicked) {
    // try selecting a card then re-loop
    const card = page.locator('div.cursor-pointer').first();
    if (await card.count()) { await card.click(); console.log('  selected a card'); }
    else { console.log('  STUCK — nothing to click'); await shot(`10_ob_${i}_STUCK`); break; }
  }
  await page.waitForTimeout(1000);
}

console.log('after onboarding, URL =', page.url());
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await shot('11_dashboard_new_battler');
if (page.url().includes('onboarding')) {
  logIssue('FLOW', 'Battler creation did not complete — still redirected to onboarding');
  console.log(JSON.stringify(issues, null, 1));
  await browser.close();
  process.exit(1);
}

// ---------- battle loop x3 ----------
for (let battleNum = 1; battleNum <= 3; battleNum++) {
  console.log(`\n=== BATTLE ${battleNum} ===`);

  // generate offers (stand-in for the cron scheduler)
  const gen = await fetch(`${BASE}/api/internal/generate-battle-offers`, {
    method: 'POST', headers: { Authorization: 'Bearer local-dev-secret-123' },
  });
  console.log('generate-offers:', gen.status, (await gen.text()).slice(0, 200));

  await page.goto(`${BASE}/battle/offers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(`12_b${battleNum}_offers`);

  const accept = page.locator('button:has-text("ACCEPT")').first();
  if (!(await accept.count())) {
    logIssue('FLOW', `Battle ${battleNum}: no ACCEPT button on offers page`);
    break;
  }
  await accept.click();
  await page.waitForTimeout(2500);
  console.log('after accept, URL =', page.url());
  await shot(`12_b${battleNum}_after_accept`);

  // find the battle id from URL or dashboard
  let battleId = page.url().match(/battle\/([0-9a-f-]{36})/)?.[1];
  if (!battleId) {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const prepLink = page.locator('a[href*="/prep"]').first();
    if (await prepLink.count()) {
      const href = await prepLink.getAttribute('href');
      battleId = href?.match(/battle\/([0-9a-f-]{36})/)?.[1];
    }
  }
  console.log('battleId =', battleId);
  if (!battleId) { logIssue('FLOW', `Battle ${battleNum}: could not determine battle id after accept`); break; }

  // prep page
  await page.goto(`${BASE}/battle/${battleId}/prep`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await shot(`12_b${battleNum}_prep`);

  // pick a focus for the first few prep days if the UI offers them
  const focusButtons = page.locator('button:has-text("WRITING"), button:has-text("RESEARCH"), button:has-text("PERFORMANCE")');
  const fb = await focusButtons.count();
  console.log(`prep focus buttons visible: ${fb}`);
  for (let d = 0; d < Math.min(fb, 3); d++) {
    await focusButtons.nth(d % fb).click().catch(() => {});
    await page.waitForTimeout(400);
  }
  await shot(`12_b${battleNum}_prep_filled`);

  // simulate (stand-in for scheduled_at cron)
  const sim = await fetch(`${BASE}/api/internal/run-due-battles?battle_id=${battleId}`, {
    method: 'POST', headers: { Authorization: 'Bearer local-dev-secret-123' },
  });
  console.log('simulate:', sim.status, (await sim.text()).slice(0, 300));

  // results
  await page.goto(`${BASE}/battle/${battleId}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await shot(`12_b${battleNum}_results`);
}

// final dashboard + media check after 3 battles
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await shot('13_dashboard_after_battles');
await page.goto(`${BASE}/media`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await shot('14_media_after_battles');

console.log('\n=== ISSUE SUMMARY ===');
issues.forEach((i) => console.log(i));
console.log(`Total: ${issues.length}`);
await browser.close();
