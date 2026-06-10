// Polish audit sweep: login as dev user, screenshot every key route at
// desktop (1400x900) and mobile (390x844). Reports horizontal overflow,
// console errors, and HTTP 5xx per page.
// Usage: node scripts/polish-audit.mjs [outDir]
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = 'http://localhost:1919';
const OUT = process.argv[2] || 'docs/screenshots/polish-audit';
fs.mkdirSync(OUT, { recursive: true });

const report = [];
const browser = await chromium.launch();

async function makePage(context, label) {
  const page = await context.newPage();
  page.issues = [];
  page.on('pageerror', (e) => page.issues.push(`PAGE-ERROR: ${e.message.slice(0, 200)}`));
  page.on('console', (m) => {
    if (m.type() === 'error') page.issues.push(`CONSOLE: ${m.text().slice(0, 200)}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 500) page.issues.push(`HTTP${r.status()}: ${r.url()}`);
  });
  return page;
}

// ---- 1. Login once (desktop context), discover dynamic IDs ----
const desktop = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await makePage(desktop, 'login');

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
const quick = page.locator('button:has-text("Dev quick login")');
if (await quick.count()) {
  await quick.click();
  await page.waitForURL('**/dashboard', { timeout: 20000 }).catch(() => {});
}
console.log('logged in, url =', page.url());

async function firstHref(url, pattern) {
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(500);
  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
  return hrefs.find((h) => h && pattern.test(h)) || null;
}

const battlerHref = await firstHref('/battlers', /^\/battler\/[0-9a-f-]+/);
const leagueHref = await firstHref('/leagues', /^\/leagues\/[0-9a-f-]+/);
const cityHref = await firstHref('/cities', /^\/cities\/[0-9a-f-]+/);

// Completed battle for this user: dashboard recent battles
let completedHref = await firstHref('/dashboard', /^\/battle\/[0-9a-f-]+$/);

// Prep page: look for a prep link on dashboard
let prepHref = await firstHref('/dashboard', /^\/battle\/[0-9a-f-]+\/prep/);
if (!prepHref) {
  // try accepting an offer
  await page.goto(`${BASE}/battle/offers`, { waitUntil: 'networkidle' }).catch(() => {});
  const accept = page.locator('button:has-text("ACCEPT")').first();
  if (await accept.count()) {
    await accept.click();
    await page.waitForTimeout(2500);
    prepHref = await firstHref('/dashboard', /^\/battle\/[0-9a-f-]+\/prep/);
  }
}

// Matchup result: create one via API
let matchupHref = null;
try {
  const ids = await page.evaluate(async () => {
    const r = await fetch('/api/debug');
    return r.ok ? r.json() : null;
  });
  // pull two battler ids from /battlers page links instead (debug may not have ids)
  await page.goto(`${BASE}/battlers`, { waitUntil: 'networkidle' });
  const battlerIds = await page.$$eval('a[href^="/battler/"]', (as) =>
    [...new Set(as.map((a) => a.getAttribute('href').split('/')[2]))]
  );
  if (battlerIds.length >= 2) {
    const res = await page.evaluate(async ([a, b]) => {
      const r = await fetch('/api/matchup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battlerAId: a, battlerBId: b }),
      });
      return r.json();
    }, [battlerIds[0], battlerIds[1]]);
    if (res && res.slug) matchupHref = `/matchup/${res.slug}`;
  }
} catch (e) {
  console.error('matchup creation failed:', e.message);
}

const routes = [
  ['dashboard', '/dashboard'],
  ['offers', '/battle/offers'],
  ['prep', prepHref],
  ['battle-result', completedHref],
  ['battlers', '/battlers'],
  ['battler-profile', battlerHref],
  ['leagues', '/leagues'],
  ['league-detail', leagueHref],
  ['cities', '/cities'],
  ['city-detail', cityHref],
  ['crew', '/crew'],
  ['matchup', '/matchup'],
  ['matchup-result', matchupHref],
  ['media', '/media'],
  ['badges', '/badges'],
  ['tournaments', '/tournaments'],
  ['finances', '/finances'],
  ['notifications', '/notifications'],
  ['relationships', '/relationships'],
].filter(([, href]) => href);

console.log('routes:', JSON.stringify(Object.fromEntries(routes), null, 1));

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  storageState: await desktop.storageState(),
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});

for (const [ctxName, context, vp] of [
  ['desktop', desktop, { width: 1400, height: 900 }],
  ['mobile', mobile, { width: 390, height: 844 }],
]) {
  const p = await makePage(context, ctxName);
  for (const [name, href] of routes) {
    p.issues.length = 0;
    try {
      await p.goto(`${BASE}${href}`, { waitUntil: 'networkidle', timeout: 30000 });
      await p.waitForTimeout(900);
      const overflow = await p.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = document.documentElement.clientWidth;
        if (docW <= winW + 1) return null;
        // find widest offenders
        const bad = [];
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.right > winW + 2 && r.width > 40) {
            bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')} right=${Math.round(r.right)}`);
            if (bad.length >= 5) break;
          }
        }
        return { docW, winW, bad };
      });
      await p.screenshot({ path: `${OUT}/${name}-${ctxName}.png`, fullPage: true });
      const issues = [...p.issues];
      if (overflow) issues.push(`OVERFLOW: scrollWidth=${overflow.docW} > ${overflow.winW}; ${overflow.bad.join(' | ')}`);
      report.push({ page: name, ctx: ctxName, href, issues });
      console.log(`${name} [${ctxName}] ${issues.length ? 'ISSUES: ' + issues.join(' ;; ') : 'ok'}`);
    } catch (e) {
      report.push({ page: name, ctx: ctxName, href, issues: [`NAV-FAIL: ${e.message.slice(0, 150)}`] });
      console.log(`${name} [${ctxName}] NAV-FAIL ${e.message.slice(0, 150)}`);
    }
  }
  await p.close();
}

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log('\nDone. Report at', `${OUT}/report.json`);
await browser.close();
