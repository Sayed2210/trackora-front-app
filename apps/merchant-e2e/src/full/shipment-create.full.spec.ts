import { test, expect } from '@playwright/test';
import { hasCredentials, getCredentialsForRole, setupStorageState } from 'tools/e2e/auth';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.MERCHANT_BASE_URL;

test.describe('@full @merchant Shipment Create', () => {
  test.beforeEach(async ({ page, context }) => {
    test.skip(!hasCredentials('merchant'), 'No merchant credentials in .env.e2e');
    const creds = getCredentialsForRole('merchant');
    await setupStorageState(context, baseURL, creds);
  });

  test('create form validates required fields', async ({ page }) => {
    await page.goto(`${baseURL}/shipments/create`);
    await expect(page.locator('[data-testid="shipment-create-form"]')).toBeVisible({ timeout: 10_000 });

    const submitBtn = page.locator('[data-testid="shipment-create-submit"]');
    await expect(submitBtn).toBeDisabled();
  });

  test('invalid phone shows validation error', async ({ page }) => {
    await page.goto(`${baseURL}/shipments/create`);
    await expect(page.locator('[data-testid="shipment-create-form"]')).toBeVisible({ timeout: 10_000 });

    await page.locator('input[formControlName="customerPhone"]').fill('invalid-phone');
    await page.locator('input[formControlName="customerPhone"]').blur();

    await expect(page.locator('small')).toBeVisible({ timeout: 5_000 });
  });
});
