import { test, expect } from '@playwright/test';
import { hasCredentials, getCredentialsForRole, setupStorageState } from 'tools/e2e/auth';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.MERCHANT_BASE_URL;

test.describe('@smoke @merchant Merchant Auth', () => {
  test('login success redirects to dashboard', async ({ page }) => {
    test.skip(!hasCredentials('merchant'), 'No merchant credentials in .env.e2e');

    await page.goto(`${baseURL}/login`);
    const creds = getCredentialsForRole('merchant');
    await page.locator('[data-testid="login-phone"]').fill(creds.phone);
    await page.locator('[data-testid="login-password"]').fill(creds.password);
    await page.locator('[data-testid="login-submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('login failure shows error message', async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.locator('[data-testid="login-phone"]').fill('00000000000');
    await page.locator('[data-testid="login-password"]').fill('wrongpassword');
    await page.locator('[data-testid="login-submit"]').click();

    await expect(page.locator('[data-testid="login-error"]')).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard`);
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('logout clears session and redirects to login', async ({ page, context }) => {
    test.skip(!hasCredentials('merchant'), 'No merchant credentials in .env.e2e');

    const creds = getCredentialsForRole('merchant');
    await setupStorageState(context, baseURL, creds);
    await page.goto(`${baseURL}/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    await page.locator('[data-testid="logout-button"]').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
