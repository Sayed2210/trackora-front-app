import { test, expect } from '@playwright/test';
import { loadE2EEnv } from 'tools/e2e/config';
import { getCredentialsForRole, hasCredentials, setupStorageState } from 'tools/e2e/auth';
import { mockEmptyList } from 'tools/e2e/mocks';

const env = loadE2EEnv();
const baseURL = env.ADMIN_BASE_URL;

test.describe('@full @admin Dispatch Board', () => {
  test.beforeEach(async ({ page, context }) => {
    test.skip(!hasCredentials('admin'), 'No admin credentials in .env.e2e');
    const creds = getCredentialsForRole('admin');
    await setupStorageState(context, baseURL, creds);
  });

  test('dispatch board shows header stats', async ({ page }) => {
    await page.goto(`${baseURL}/assignments`);
    await expect(page.locator('.board-header')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.header-stats')).toBeVisible();
  });

  test('dispatch board shows zone filter', async ({ page }) => {
    await page.goto(`${baseURL}/assignments`);
    await expect(page.locator('.panel-filters select').first()).toBeVisible({ timeout: 15_000 });
  });

  test('empty dispatch shows empty states', async ({ page }) => {
    await mockEmptyList(page, '**/v1/shipments*');
    await mockEmptyList(page, '**/v1/couriers*');
    await page.goto(`${baseURL}/assignments`);
    await expect(page.locator('.empty-state').first()).toBeVisible({ timeout: 10_000 });
  });
});
