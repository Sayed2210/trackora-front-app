import { test, expect } from '@playwright/test';
import { getCredentialsForRole, hasCredentials, setupStorageState } from 'tools/e2e/auth';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.ADMIN_BASE_URL;

test.describe('@smoke @admin Admin Dashboard', () => {
  test.beforeEach(async ({ page, context }) => {
    test.skip(!hasCredentials('admin'), 'No admin credentials in .env.e2e');
    const creds = getCredentialsForRole('admin');
    await setupStorageState(context, baseURL, creds);
  });

  test('dashboard loads with KPI cards', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard`);
    await expect(page.locator('.admin-dashboard')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.kpi-grid')).toBeVisible({ timeout: 10_000 });
  });

  test('dispatch board loads', async ({ page }) => {
    await page.goto(`${baseURL}/assignments`);
    await expect(page.locator('.dispatch-board')).toBeVisible({ timeout: 15_000 });
  });

  test('critical admin routes serve', async ({ request }) => {
    for (const route of ['/dashboard', '/shipments', '/assignments', '/couriers', '/merchants']) {
      const response = await request.get(route);
      expect(response.ok()).toBe(true);
    }
  });
});
