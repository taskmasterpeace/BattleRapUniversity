// Verify the new real signup UI: create account through the form, expect onboarding.
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE:', m.text().slice(0, 200)); });

await page.goto('http://localhost:1919/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: 'docs/screenshots/beta/20_login_signin.png' });

await page.locator('button:has-text("CREATE ACCOUNT")').click();
await page.waitForTimeout(300);
const email = `ui.signup.${Date.now()}@test.com`;
await page.locator('input[type="email"]').fill(email);
await page.locator('input[type="password"]').fill('BetaTest123!');
await page.screenshot({ path: 'docs/screenshots/beta/21_login_signup_filled.png' });
await page.locator('button:has-text("ENTER THE CIRCUIT")').click();
await page.waitForTimeout(4000);
console.log('after signup, URL =', page.url());
await page.screenshot({ path: 'docs/screenshots/beta/22_after_signup.png' });

// Also test sign-in with the same account (sign out first via cookie clear)
await context.clearCookies();
await page.goto('http://localhost:1919/login', { waitUntil: 'networkidle' });
await page.locator('input[type="email"]').fill(email);
await page.locator('input[type="password"]').fill('BetaTest123!');
await page.locator('button:has-text("SIGN IN")').last().click();
await page.waitForTimeout(4000);
console.log('after signin, URL =', page.url());
await page.screenshot({ path: 'docs/screenshots/beta/23_after_signin.png' });

// Wrong password should show friendly error
await context.clearCookies();
await page.goto('http://localhost:1919/login', { waitUntil: 'networkidle' });
await page.locator('input[type="email"]').fill(email);
await page.locator('input[type="password"]').fill('WrongPass99!');
await page.locator('button:has-text("SIGN IN")').last().click();
await page.waitForTimeout(2500);
const errText = await page.locator('.text-red-400').textContent().catch(() => null);
console.log('wrong-password error shown:', errText);
await page.screenshot({ path: 'docs/screenshots/beta/24_wrong_password.png' });

await browser.close();
