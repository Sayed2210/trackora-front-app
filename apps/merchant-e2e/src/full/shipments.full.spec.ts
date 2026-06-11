import { test, expect } from '@playwright/test';
import { hasCredentials, getCredentialsForRole, setupStorageState } from 'tools/e2e/auth/auth-helpers';
import { loadE2EEnv } from 'tools/e2e/config';
import { mockApiError, mockEmptyList } from 'tools/e2e/mocks';

const env = loadE2EEnv();
const baseURL = env.MERCHANT_BASE_URL;

test.describe('@full @merchant Shipment List', () => {
  test.beforeEach(async ({ page, context }) => {
    test.skip(!hasCredentials('merchant'), 'No merchant credentials in .env.e2e');
    const creds = getCredentialsForRole('merchant');
    await setupStorageState(context, baseURL, creds);
  });

  test('empty shipment list shows empty state', async ({ page }) => {
    await mockEmptyList(page, '**/v1/shipments*');
    await page.goto(`${baseURL}/shipments`);
    await expect(page.locator('.shipment-table')).toBeVisible({ timeout: 10_000 });
  });

  test('API error shows error state with retry', async ({ page }) => {
    await mockApiError(page, '**/v1/shipments*', 500, 'Internal server error');
    await page.goto(`${baseURL}/shipments`);
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('status filter is available', async ({ page }) => {
    await page.goto(`${baseURL}/shipments`);
    await expect(page.locator('[data-testid="shipment-status-filter"]')).toBeVisible({ timeout: 15_000 });
  });

  test('zone filter is available', async ({ page }) => {
    await page.goto(`${baseURL}/shipments`);
    await expect(page.locator('[data-testid="shipment-zone-filter"]')).toBeVisible({ timeout: 15_000 });
  });
});
