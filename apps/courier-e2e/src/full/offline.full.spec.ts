import { test, expect } from '@playwright/test';
import { getCredentialsForRole, setupStorageState } from 'tools/e2e/auth';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.COURIER_BASE_URL;

test.describe('@full @courier Courier Offline', () => {
  test.beforeEach(async ({ page, context }) => {
    test.skip(!hasCredentials('courier'), 'No courier credentials in .env.e2e');
    const creds = getCredentialsForRole('courier');
    await setupStorageState(context, baseURL, creds);
  });

  test('offline indicator shows offline when network is disabled', async ({ page, context }) => {
    await page.goto(`${baseURL}/tasks`);
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible({ timeout: 10_000 });

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('[data-testid="offline-indicator"]')).toContainText('Offline', { timeout: 10_000 });

    await context.setOffline(false);
  });

  test('cash deposit route loads', async ({ page }) => {
    await page.goto(`${baseURL}/cash-deposit`);
    await expect(page.locator('.main-content')).toBeVisible({ timeout: 15_000 });
  });

  test('performance route loads', async ({ page }) => {
    await page.goto(`${baseURL}/performance`);
    await expect(page.locator('.main-content')).toBeVisible({ timeout: 15_000 });
  });
});
