// Verify daily battle slots UI (dashboard) + scouting report (prep page).
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:1919';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const page = await context.newPage();

const errors = [];
page.on('pageerror', (e) => { errors.push(e.message); console.error('PAGE ERROR:', e.message); });
page.on('console', (msg) => {
  if (msg.type() === 'error') { errors.push(msg.text()); console.error('CONSOLE ERROR:', msg.text()); }
});
page.on('response', (resp) => {
  if (resp.status() >= 400 && resp.status() !== 429) console.error(`HTTP ${resp.status()} ${resp.url()}`);
});

// 1. Dev quick login
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
await page.getByText('⚡ Dev quick login').click();
await page.waitForURL(/dashboard|onboarding/, { timeout: 30000 });
console.log('Logged in →', page.url());
await page.waitForTimeout(1500);

// 2. Ensure there is an accepted battle (BATTLE TIME button on dashboard)
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

let hasNextBattle = await page.getByText('BATTLE TIME — TAKE THE STAGE').count();
if (!hasNextBattle) {
  hasNextBattle = await page.getByText('NO SLOTS LEFT TODAY').count();
}
if (!hasNextBattle) {
  console.log('No active battle — accepting an offer...');
  await page.goto(`${BASE}/battle/offers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const acceptBtn = page.getByRole('button', { name: 'ACCEPT', exact: true }).first();
  if (await acceptBtn.count()) {
    await acceptBtn.click();
    await page.waitForTimeout(2500);
  } else {
    console.log('No offers to accept!');
  }
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
}

// 3. Screenshot the slots UI (next battle card region)
const slotsLabel = page.getByText("TODAY'S SLOTS").first();
if (await slotsLabel.count()) {
  console.log('Slots indicator found.');
  const slotsText = await page.getByText(/OF \d+ BATTLES? LEFT/).first().textContent();
  console.log('Slots text:', slotsText);
} else {
  console.log('WARNING: slots indicator NOT found');
}
const battleCard = page.locator('xpath=//p[contains(., "TODAY’S SLOTS") or contains(., "TODAY\'S SLOTS")]/ancestor::div[contains(@class, "p-6")][1]').first();
if (await battleCard.count()) {
  await battleCard.screenshot({ path: 'docs/screenshots/slots_ui.png' });
} else {
  await page.screenshot({ path: 'docs/screenshots/slots_ui.png', fullPage: false });
}
console.log('Saved docs/screenshots/slots_ui.png');

// 4. Go to prep page of the next battle
const prepLink = page.locator('a[href*="/prep"]').first();
if (!(await prepLink.count())) {
  console.log('No prep link found — aborting scouting check');
  await browser.close();
  process.exit(1);
}
const prepHref = await prepLink.getAttribute('href');
console.log('Opening prep page:', prepHref);
await page.goto(`${BASE}${prepHref}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Scouting card present?
const scoutHeader = page.getByText('SCOUTING REPORT').first();
console.log('Scouting card present:', (await scoutHeader.count()) > 0);

// 5. Assign research to days 1-3 to unlock tier 3, watching live refresh
const selects = page.locator('select');
const selectCount = await selects.count();
console.log('Prep day selects:', selectCount);
for (let i = 0; i < Math.min(3, selectCount); i++) {
  await selects.nth(i).selectOption('research');
  await page.waitForTimeout(1800);
  const intel = await page.getByText(/RESEARCH DAYS? BANKED/).first().textContent().catch(() => null);
  console.log(`After research day ${i + 1}:`, intel);
}
await page.waitForTimeout(1200);

// Log unlocked intel content
const scoutCard = page.locator('xpath=//h3[contains(., "SCOUTING REPORT")]/ancestor::div[contains(@class, "border-2")][1]').first();
const reportText = await scoutCard.innerText().catch(() => 'n/a');
console.log('--- SCOUTING REPORT CONTENT ---');
console.log(reportText.slice(0, 2000));

// 6. Screenshot the scouting card
if (await scoutCard.count()) {
  await scoutCard.scrollIntoViewIfNeeded();
  await scoutCard.screenshot({ path: 'docs/screenshots/scouting_ui.png' });
} else {
  await page.screenshot({ path: 'docs/screenshots/scouting_ui.png', fullPage: true });
}
console.log('Saved docs/screenshots/scouting_ui.png');

console.log('Console/page errors:', errors.length ? errors : 'none');
await browser.close();
