import { test, expect } from '@playwright/test';
import { getCredentialsForRole, hasCredentials, setupStorageState } from 'tools/e2e/auth';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.ADMIN_BASE_URL;

test.describe('@full @admin Admin RBAC', () => {
  test('expired token redirects to login', async ({ page, context }) => {
    await context.addInitScript(() => {
      sessionStorage.setItem('access_token', 'expired-malformed-token');
      localStorage.setItem('refresh_token', 'expired-refresh');
      localStorage.setItem('trackora_user', '{}');
    });

    await page.goto(`${baseURL}/dashboard`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test('admin sidebar has all navigation links', async ({ page, context }) => {
    test.skip(!hasCredentials('admin'), 'No admin credentials in .env.e2e');
    const creds = getCredentialsForRole('admin');
    await setupStorageState(context, baseURL, creds);

    await page.goto(`${baseURL}/dashboard`);
    await expect(page.locator('.sidebar-nav')).toBeVisible({ timeout: 10_000 });

    const navLinks = page.locator('.sidebar-nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('admin critical routes are accessible', async ({ page, context }) => {
    test.skip(!hasCredentials('admin'), 'No admin credentials in .env.e2e');
    const creds = getCredentialsForRole('admin');
    await setupStorageState(context, baseURL, creds);

    const routes = [
      '/dashboard',
      '/shipments',
      '/assignments',
      '/couriers',
      '/merchants',
      '/payouts',
      '/wallets',
      '/audit-logs',
      '/reports',
      '/analytics',
    ];

    for (const route of routes) {
      await page.goto(`${baseURL}${route}`);
      await expect(page.locator('.main-content')).toBeVisible({ timeout: 15_000 });
    }
  });
});
