import { test, expect } from '@playwright/test';
import { loadE2EEnv } from 'tools/e2e/config';
import { mockApiError, mockApiLoading } from 'tools/e2e/mocks';

const env = loadE2EEnv();
const baseURL = env.MERCHANT_BASE_URL;

test.describe('@full @public Tracking States', () => {
  test('initial empty state shows input only', async ({ page }) => {
    await page.goto(`${baseURL}/tracking`);
    await expect(page.locator('[data-testid="track-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="tracking-status"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="tracking-error"]')).not.toBeVisible();
  });

  test('loading state shows spinner', async ({ page }) => {
    await mockApiLoading(page, '**/v1/shipments/tracking/*', 5000);
    await page.goto(`${baseURL}/tracking`);
    await page.locator('[data-testid="track-input"]').fill('TRK-SLOW-123');
    await page.locator('[data-testid="track-submit"]').click();
    await expect(page.locator('[data-testid="loading-state"]')).toBeVisible({ timeout: 5_000 });
  });

  test('API error shows error message', async ({ page }) => {
    await mockApiError(page, '**/v1/shipments/tracking/*', 404, 'Shipment not found');
    await page.goto(`${baseURL}/tracking`);
    await page.locator('[data-testid="track-input"]').fill('TRK-NOTFOUND-999');
    await page.locator('[data-testid="track-submit"]').click();
    await expect(page.locator('[data-testid="tracking-error"]')).toBeVisible({ timeout: 10_000 });
  });

  test('valid tracking shows status and timeline', async ({ page }) => {
    const mockShipment = {
      id: 'test-1',
      trackingNumber: 'TRK-TEST-001',
      customerName: 'Test Customer',
      customerPhone: '01012345678',
      status: 'DELIVERED',
      codAmount: 250,
      address: { street: 'Test St', city: 'Cairo', governorate: 'Cairo' },
      estimatedDelivery: '2026-06-15T10:00:00Z',
    };

    const mockTimeline = [
      { id: 't1', status: 'PENDING', timestamp: '2026-06-10T08:00:00Z' },
      { id: 't2', status: 'CONFIRMED', timestamp: '2026-06-10T09:00:00Z' },
      { id: 't3', status: 'DELIVERED', timestamp: '2026-06-11T14:00:00Z' },
    ];

    await mockApiResponse(page, '**/v1/shipments/tracking/*', { success: true, data: mockShipment });
    await mockApiResponse(page, '**/v1/shipments/*/timeline', { success: true, data: mockTimeline });

    await page.goto(`${baseURL}/tracking`);
    await page.locator('[data-testid="track-input"]').fill('TRK-TEST-001');
    await page.locator('[data-testid="track-submit"]').click();

    await expect(page.locator('[data-testid="tracking-status"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-testid="tracking-timeline"]')).toBeVisible({ timeout: 5_000 });
  });
});
