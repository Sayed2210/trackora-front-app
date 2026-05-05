import { test, expect } from '@playwright/test';

test.describe('Courier Flow', () => {
  test('should display courier task list', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page.locator('h1')).toContainText('My Tasks');
    await expect(page.locator('.task-cards')).toBeVisible();
  });

  test('should navigate to task detail', async ({ page }) => {
    await page.goto('/tasks');
    await page.click('.task-card:first-child');
    await expect(page.locator('.task-detail')).toBeVisible();
  });

  test('should display offline banner when offline', async ({ page }) => {
    await page.goto('/tasks');
    // Simulate offline by setting navigator.onLine = false via CDP
    await page.context().setOffline(true);
    await page.reload();
    await expect(page.locator('.connection-status.offline')).toBeVisible();
    await page.context().setOffline(false);
  });
});
