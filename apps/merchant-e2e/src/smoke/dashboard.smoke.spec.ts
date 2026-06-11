import { test, expect } from '@playwright/test';
import { hasCredentials, getCredentialsForRole, setupStorageState } from 'tools/e2e/auth';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.MERCHANT_BASE_URL;

test.describe('@smoke @merchant Merchant Dashboard', () => {
  test.beforeEach(async ({ page, context }) => {
    test.skip(!hasCredentials('merchant'), 'No merchant credentials in .env.e2e');
    const creds = getCredentialsForRole('merchant');
    await setupStorageState(context, baseURL, creds);
  });

  test('dashboard loads with KPI cards', async ({ page }) => {
    await page.goto(`${baseURL}/dashboard`);
    await expect(page.locator('.dashboard')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.kpi-grid')).toBeVisible({ timeout: 10_000 });
  });

  test('shipment list loads', async ({ page }) => {
    await page.goto(`${baseURL}/shipments`);
    await expect(page.locator('[data-testid="shipment-list"], [data-testid="empty-state"], [data-testid="error-state"]')).toBeVisible({ timeout: 15_000 });
  });

  test('shipment create form loads', async ({ page }) => {
    await page.goto(`${baseURL}/shipments/create`);
    await expect(page.locator('[data-testid="shipment-create-form"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-testid="shipment-create-submit"]')).toBeVisible();
  });
});
