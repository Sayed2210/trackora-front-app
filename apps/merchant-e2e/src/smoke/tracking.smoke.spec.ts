import { test, expect } from '@playwright/test';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.MERCHANT_BASE_URL;

test.describe('@smoke @public Public Tracking', () => {
  test('tracking page loads without authentication', async ({ page }) => {
    await page.goto(`${baseURL}/tracking`);
    await expect(page.locator('[data-testid="track-input"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-testid="track-submit"]')).toBeVisible();
  });

  test('invalid tracking number shows error', async ({ page }) => {
    await page.goto(`${baseURL}/tracking`);
    await page.locator('[data-testid="track-input"]').fill('INVALID-TRACKING-NUMBER-99999');
    await page.locator('[data-testid="track-submit"]').click();

    await expect(page.locator('[data-testid="tracking-error"]')).toBeVisible({ timeout: 15_000 });
  });

  test('tracking page has correct document direction', async ({ page }) => {
    await page.goto(`${baseURL}/tracking`);
    await expect(page.locator('html')).toHaveAttribute('dir', /.+/);
  });
});
