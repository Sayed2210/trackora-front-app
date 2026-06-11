import { test, expect } from '@playwright/test';
import { loadE2EEnv } from 'tools/e2e/config';

const env = loadE2EEnv();
const baseURL = env.MERCHANT_BASE_URL;

test.describe('@smoke @i18n Localization', () => {
  test('login page has language switcher', async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await expect(page.locator('[data-testid="language-switcher"]')).toBeVisible({ timeout: 10_000 });
  });

  test('language switcher toggles direction', async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await expect(page.locator('[data-testid="language-switcher"]')).toBeVisible();

    const container = page.locator('.login-container');
    await expect(container).toHaveAttribute('dir', /.+/);

    const initialDir = await container.getAttribute('dir');

    await page.locator('[data-testid="language-switcher"]').click();
    await page.waitForTimeout(500);

    await expect(container).not.toHaveAttribute('dir', initialDir || '');
  });

  test('tracking page has valid document attributes', async ({ page }) => {
    await page.goto(`${baseURL}/tracking`);
    await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
    await expect(page.locator('html')).toHaveAttribute('dir', /.+/);
  });
});
