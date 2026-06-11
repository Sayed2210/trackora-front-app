import { test, expect } from '@playwright/test';
import { getCredentialsForRole, setupStorageState } from 'tools/e2e/auth';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.COURIER_BASE_URL;

test.describe('@smoke @courier Courier Tasks', () => {
  test.beforeEach(async ({ page, context }) => {
    test.skip(!hasCredentials('courier'), 'No courier credentials in .env.e2e');
    const creds = getCredentialsForRole('courier');
    await setupStorageState(context, baseURL, creds);
  });

  test('task list loads', async ({ page }) => {
    await page.goto(`${baseURL}/tasks`);
    await expect(page.locator('.task-list')).toBeVisible({ timeout: 15_000 });
  });

  test('connection status indicator is visible', async ({ page }) => {
    await page.goto(`${baseURL}/tasks`);
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible({ timeout: 10_000 });
  });

  test('bottom navigation is visible', async ({ page }) => {
    await page.goto(`${baseURL}/tasks`);
    await expect(page.locator('.bottom-nav')).toBeVisible();
  });
});
