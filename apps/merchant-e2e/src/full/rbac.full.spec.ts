import { test, expect } from '@playwright/test';
import { hasCredentials, getCredentialsForRole, setupStorageState } from 'tools/e2e/auth';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.MERCHANT_BASE_URL;

test.describe('@full @merchant Merchant RBAC', () => {
  test('merchant cannot access admin app routes', async ({ page, context }) => {
    test.skip(!hasCredentials('merchant'), 'No merchant credentials in .env.e2e');
    const creds = getCredentialsForRole('merchant');
    await setupStorageState(context, baseURL, creds);

    const adminURL = env.ADMIN_BASE_URL;
    await page.goto(`${adminURL}/dashboard`);
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('expired token redirects to login', async ({ page, context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('access_token', 'expired-malformed-token');
      localStorage.setItem('refresh_token', 'expired-refresh');
      localStorage.setItem('trackora_user', '{}');
    });

    await page.goto(`${baseURL}/dashboard`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
