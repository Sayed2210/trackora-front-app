import { test, expect } from '@playwright/test';
import { hasCredentials, getCredentialsForRole, setupStorageState } from 'tools/e2e/auth';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.OWNER_BASE_URL;

test.describe('@smoke @owner Owner Auth', () => {
  test('login success redirects to owner overview', async ({ page }) => {
    test.skip(!hasCredentials('owner'), 'No owner credentials in .env.e2e');

    await page.goto(`${baseURL}/login`);
    const creds = getCredentialsForRole('owner');
    await page.locator('[data-testid="login-phone"]').fill(creds.phone);
    await page.locator('[data-testid="login-password"]').fill(creds.password);
    await page.locator('[data-testid="login-submit"]').click();

    await expect(page).toHaveURL(/\/owner/, { timeout: 15_000 });
  });

  test('login failure shows error message', async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.locator('[data-testid="login-phone"]').fill('00000000000');
    await page.locator('[data-testid="login-password"]').fill('wrongpassword');
    await page.locator('[data-testid="login-submit"]').click();

    await expect(page.locator('[data-testid="login-error"]')).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated user accessing owner route redirects to login', async ({ page }) => {
    await page.goto(`${baseURL}/owner/overview`);
    await expect(page).toHaveURL(/\/login|\/owner\/forbidden/, { timeout: 10_000 });
  });
});
