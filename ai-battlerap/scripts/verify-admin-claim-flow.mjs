// Verification script: admin tools + verified-battler claim flow.
// Drives http://localhost:1919 with Playwright and saves screenshots.
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE = 'http://localhost:1919';
const SHOTS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'screenshots');
const STAGE_NAME = 'QA Test MC';
const FRESH_EMAIL = `qa-claim-${Date.now()}@test.com`;
const FRESH_PASSWORD = 'qa-password-123';

function log(msg) {
  console.log(`[verify] ${msg}`);
}

const browser = await chromium.launch();

try {
  // ── ADMIN SESSION ──────────────────────────────────────────────────────────
  const adminCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const admin = await adminCtx.newPage();

  log('admin: dev quick login');
  await admin.goto(`${BASE}/login`);
  await admin.getByRole('button', { name: /dev quick login/i }).click();
  await admin.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });

  log('admin: /admin dashboard');
  await admin.goto(`${BASE}/admin`);
  await admin.waitForSelector('text=ADMIN', { timeout: 30000 });
  await admin.getByText('Pending Claims').waitFor();
  await admin.screenshot({ path: path.join(SHOTS, 'admin_dashboard.png'), fullPage: true });

  log('admin: create real battler');
  await admin.goto(`${BASE}/admin/real-battlers`);
  await admin.getByRole('button', { name: /ADD REAL BATTLER/i }).click();
  await admin.getByPlaceholder('Tru Foe').fill(STAGE_NAME);
  await admin.getByPlaceholder('Withheld unless licensed').fill('Quality Assurance');
  await admin.getByPlaceholder(/Their story/).fill('A test battler created by the QA flow. Should be deleted automatically.');
  const selects = admin.locator('form select');
  await selects.nth(0).selectOption({ label: 'Chicago, IL' }); // hometown
  await selects.nth(1).selectOption('top'); // tier
  await selects.nth(2).selectOption('pending'); // likeness
  await admin.getByPlaceholder('Aggressive, Wordplay, Battle Tested').fill('QA, Test');
  await admin.locator('input[type="number"]').fill('1500'); // rating
  await admin.getByRole('button', { name: 'CREATE REAL BATTLER' }).click();
  await admin.waitForURL(/\/admin\/real-battlers\/[0-9a-f-]+/, { timeout: 30000 });
  const battlerId = admin.url().split('/').pop();
  log(`admin: created battler ${battlerId}`);

  log('admin: add accolade');
  await admin.getByPlaceholder('War Dog Champion').fill('QA Test Accolade — Most Bugs Caught');
  await admin.getByPlaceholder('US').fill('US');
  await admin.getByPlaceholder('2022').fill('2026');
  await admin.getByPlaceholder('URL, VerseTracker…').fill('QA Suite');
  await admin.getByRole('button', { name: /ADD ACCOLADE/ }).click();
  await admin.getByText('QA Test Accolade — Most Bugs Caught').waitFor({ timeout: 15000 });

  log('admin: generate claim code');
  await admin.getByRole('button', { name: /GENERATE CLAIM CODE/ }).click();
  const codeEl = admin.locator('span.text-2xl', { hasText: /^BRU-/ });
  await codeEl.waitFor({ timeout: 15000 });
  const claimCode = (await codeEl.textContent()).trim();
  log(`admin: claim code ${claimCode}`);
  await admin.screenshot({ path: path.join(SHOTS, 'admin_real_battler_editor.png'), fullPage: true });

  // ── FRESH USER SESSION ─────────────────────────────────────────────────────
  const userCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const user = await userCtx.newPage();

  log(`user: signup as ${FRESH_EMAIL}`);
  await user.goto(`${BASE}/login`);
  await user.getByRole('button', { name: 'CREATE ACCOUNT' }).click();
  await user.getByPlaceholder('you@example.com').fill(FRESH_EMAIL);
  await user.getByPlaceholder('At least 8 characters').fill(FRESH_PASSWORD);
  await user.getByRole('button', { name: /ENTER THE CIRCUIT/ }).click();
  await user.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });

  log('user: claim the code');
  await user.goto(`${BASE}/claim`);
  await user.getByText('CLAIM YOUR').waitFor();
  await user.getByPlaceholder('BRU-XXXX-XXXX').fill(claimCode);
  await user.getByRole('button', { name: /CLAIM PROFILE/ }).click();
  await user.getByText("YOU'RE").waitFor({ timeout: 15000 });
  await user.getByText(`Welcome to the university,`).waitFor();
  await user.screenshot({ path: path.join(SHOTS, 'claim_success.png'), fullPage: true });

  log('user: /verified panel + bio edit');
  await user.goto(`${BASE}/verified`);
  await user.getByText('Verified Battler').first().waitFor({ timeout: 15000 });
  await user.getByText(STAGE_NAME).first().waitFor();
  await user.getByRole('button', { name: 'Edit' }).click();
  await user.getByPlaceholder(/Tell the culture/).fill('Updated bio written by the verified battler themself. QA flow complete.');
  await user.getByRole('button', { name: 'SAVE', exact: true }).click();
  await user.getByText('✓ Saved').waitFor({ timeout: 15000 });
  await user.getByText('Updated bio written by the verified battler').waitFor();
  await user.screenshot({ path: path.join(SHOTS, 'verified_panel.png'), fullPage: true });

  log('user: non-admin should be redirected from /admin');
  await user.goto(`${BASE}/admin`);
  // requireAdmin → /dashboard, which itself chains to /onboarding when the
  // fresh user has no battler yet. Either way they never see /admin.
  await user.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });
  if (user.url().includes('/admin')) throw new Error('non-admin saw /admin!');
  log(`user: redirected to ${user.url()} ✓`);

  // ── INVALID CODE ERROR STATE ───────────────────────────────────────────────
  log('user: invalid + already-claimed code error states');
  await user.goto(`${BASE}/claim`);
  await user.getByPlaceholder('BRU-XXXX-XXXX').fill('BRU-FAKE-CODE');
  await user.getByRole('button', { name: /CLAIM PROFILE/ }).click();
  await user.getByText('That code is not valid').waitFor({ timeout: 15000 });
  await user.getByPlaceholder('BRU-XXXX-XXXX').fill(claimCode);
  await user.getByRole('button', { name: /CLAIM PROFILE/ }).click();
  await user.getByText('already been used').waitFor({ timeout: 15000 });
  log('error states render correctly ✓');

  console.log(`\nRESULT: PASS battler_id=${battlerId} fresh_user=${FRESH_EMAIL}`);
} finally {
  await browser.close();
}
