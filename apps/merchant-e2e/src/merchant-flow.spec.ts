import { test, expect } from '@playwright/test';

test.describe('Merchant Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should navigate to dashboard after login', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Merchant Dashboard');
  });

  test('should display shipments list', async ({ page }) => {
    await page.goto('/shipments');
    await expect(page.locator('h1')).toContainText('Shipments');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should navigate to create shipment', async ({ page }) => {
    await page.goto('/shipments');
    await page.click('text=Create New Shipment');
    await expect(page.locator('h1')).toContainText('Create New Shipment');
  });

  test('should display wallet page', async ({ page }) => {
    await page.goto('/wallet');
    await expect(page.locator('h1')).toContainText('Wallet');
    await expect(page.locator('text=Available Balance')).toBeVisible();
  });

  test('should display tracking page publicly', async ({ page }) => {
    await page.goto('/tracking');
    await expect(page.locator('text=Track Your Shipment')).toBeVisible();
  });
});
