import { test, expect } from '@playwright/test';
import { hasCredentials, getCredentialsForRole, setupStorageState } from 'tools/e2e/auth';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.OWNER_BASE_URL;

test.describe('@smoke @owner Owner Routes', () => {
  test.beforeEach(async ({ page, context }) => {
    test.skip(!hasCredentials('owner'), 'No owner credentials in .env.e2e');
    const creds = getCredentialsForRole('owner');
    await setupStorageState(context, baseURL, creds);
  });

  test('owner overview loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/overview`);
    await expect(page.locator('.owner-content')).toBeVisible({ timeout: 15_000 });
  });

  test('owner sidebar navigation is visible', async ({ page }) => {
    await page.goto(`${baseURL}/owner/overview`);
    await expect(page.locator('.owner-nav')).toBeVisible({ timeout: 10_000 });
  });

  test('owner tenants route loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/tenants`);
    await expect(page.locator('.owner-content')).toBeVisible({ timeout: 15_000 });
  });

  test('owner plans route loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/plans`);
    await expect(page.locator('.owner-content')).toBeVisible({ timeout: 15_000 });
  });

  test('owner subscriptions route loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/subscriptions`);
    await expect(page.locator('.owner-content')).toBeVisible({ timeout: 15_000 });
  });

  test('owner billing route loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/billing`);
    await expect(page.locator('.owner-content, [data-testid="forbidden-state"]')).toBeVisible({ timeout: 15_000 });
  });

  test('owner feature flags route loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/feature-flags`);
    await expect(page.locator('.owner-content, [data-testid="forbidden-state"]')).toBeVisible({ timeout: 15_000 });
  });

  test('owner audit logs route loads', async ({ page }) => {
    await page.goto(`${baseURL}/owner/audit-logs`);
    await expect(page.locator('.owner-content, [data-testid="forbidden-state"]')).toBeVisible({ timeout: 15_000 });
  });

  test('owner forbidden page is accessible', async ({ page }) => {
    await page.goto(`${baseURL}/owner/forbidden`);
    await expect(page.locator('[data-testid="forbidden-state"]')).toBeVisible({ timeout: 10_000 });
  });
});
