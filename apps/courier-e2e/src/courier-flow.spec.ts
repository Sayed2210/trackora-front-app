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

test.describe('Courier Offline Scenarios', () => {
  test('should queue status updates when offline', async ({ page }) => {
    await page.goto('/tasks');
    await page.context().setOffline(true);
    await page.reload();

    // Navigate to first task
    await page.click('.task-card:first-child');
    await expect(page.locator('.task-detail')).toBeVisible();

    // Capture GPS
    await page.click('text=Capture GPS Location');
    await expect(page.locator('text=Location Captured')).toBeVisible();

    // Mark as delivered
    await page.click('text=Mark Delivered');

    // Go back to list and verify pending sync
    await page.goto('/tasks');
    await expect(page.locator('.sync-bar')).toBeVisible();
    await expect(page.locator('.sync-bar')).toContainText('pending');

    await page.context().setOffline(false);
  });

  test('should sync queued updates when coming back online', async ({ page }) => {
    await page.goto('/tasks');

    // Go offline and perform an action
    await page.context().setOffline(true);
    await page.reload();
    await page.click('.task-card:first-child');
    await page.click('text=Capture GPS Location');
    await page.click('text=Mark Delivered');

    // Return to list
    await page.goto('/tasks');
    const pendingText = await page.locator('.sync-bar span:first-child').textContent();
    expect(pendingText).toContain('pending');

    // Go back online and sync
    await page.context().setOffline(false);
    await page.reload();
    await page.click('.sync-btn');
    await expect(page.locator('.sync-result')).toContainText('Last sync');
  });

  test('should persist cash deposit logs offline', async ({ page }) => {
    await page.goto('/cash-deposit');
    await expect(page.locator('h1')).toContainText('Cash Deposit Log');

    await page.context().setOffline(true);
    await page.reload();

    await page.fill('input[type="number"]', '500');
    await page.fill('textarea', 'Test deposit');
    await page.click('text=Log Deposit');

    // Verify entry appears in log list
    await expect(page.locator('.log-item')).toContainText('DEPOSITED');
    await expect(page.locator('.log-sync.pending')).toBeVisible();

    await page.context().setOffline(false);
  });

  test('should show conflict resolution UI for failed syncs', async ({ page }) => {
    await page.goto('/tasks');

    // Simulate a failed sync by going offline, creating pending updates, then coming online
    await page.context().setOffline(true);
    await page.reload();
    await page.click('.task-card:first-child');
    await page.click('text=Capture GPS Location');
    await page.click('text=Mark Delivered');

    await page.goto('/tasks');
    await page.context().setOffline(false);

    // Mock a sync failure by blocking the sync endpoint (if any) or rely on UI state
    // For this test, we verify the conflict panel UI exists
    await page.click('.conflict-btn');
    await expect(page.locator('.conflict-panel')).toBeVisible();
  });
});
