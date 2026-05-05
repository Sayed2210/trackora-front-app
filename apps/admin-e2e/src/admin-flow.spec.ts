import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    await expect(page.locator('text=Operations overview')).toBeVisible();
  });

  test('should display courier management', async ({ page }) => {
    await page.goto('/couriers');
    await expect(page.locator('h1')).toContainText('Courier Management');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display merchant management', async ({ page }) => {
    await page.goto('/merchants');
    await expect(page.locator('h1')).toContainText('Merchant Management');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display payout approvals', async ({ page }) => {
    await page.goto('/payouts');
    await expect(page.locator('h1')).toContainText('Payout Approvals');
    await expect(page.locator('table')).toBeVisible();
  });
});
