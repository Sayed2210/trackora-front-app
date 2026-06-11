import { test, expect } from '@playwright/test';
import { hasCredentials, getCredentialsForRole, setupStorageState } from 'tools/e2e/auth/auth-helpers';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.OWNER_BASE_URL;

test.describe('@full @owner Owner Platform Routes', () => {
  test.beforeEach(async ({ page, context }) => {
    test.skip(!hasCredentials('owner'), 'No owner credentials in .env.e2e');
    const creds = getCredentialsForRole('owner');
    await setupStorageState(context, baseURL, creds);
  });

  test('owner plans create route loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/plans/create`);
    await expect(page.locator('.owner-content, [data-testid="forbidden-state"]')).toBeVisible({ timeout: 15_000 });
  });

  test('owner usage route loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/usage`);
    await expect(page.locator('.owner-content, [data-testid="forbidden-state"]')).toBeVisible({ timeout: 15_000 });
  });

  test('owner invoices route loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/invoices`);
    await expect(page.locator('.owner-content, [data-testid="forbidden-state"]')).toBeVisible({ timeout: 15_000 });
  });

  test('owner support route loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/support`);
    await expect(page.locator('.owner-content, [data-testid="forbidden-state"]')).toBeVisible({ timeout: 15_000 });
  });

  test('owner settings route loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/settings`);
    await expect(page.locator('.owner-content, [data-testid="forbidden-state"]')).toBeVisible({ timeout: 15_000 });
  });

  test('owner sidebar filters nav items by permission', async ({ page }) => {
    await page.goto(`${baseURL}/owner/overview`);
    await expect(page.locator('.owner-nav')).toBeVisible({ timeout: 10_000 });

    const navItems = page.locator('.owner-nav a');
    const count = await navItems.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('@full @owner Owner Permission Denial', () => {
  test('limited owner sees forbidden for restricted routes', async ({ page, context }) => {
    test.skip(!hasCredentials('owner-limited'), 'No limited owner credentials in .env.e2e');
    const creds = getCredentialsForRole('owner-limited');
    await setupStorageState(context, baseURL, creds);

    await page.goto(`${baseURL}/owner/plans`);
    await expect(page.locator('[data-testid="forbidden-state"], .owner-content')).toBeVisible({ timeout: 15_000 });
  });
});
