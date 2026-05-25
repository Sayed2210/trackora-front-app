import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('access_token', 'owner-e2e-token');
  });

  await page.route('**/v1/auth/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: {
        id: 'owner-e2e-user',
        name: 'Owner E2E',
        email: 'owner-e2e@example.com',
        role: 'PLATFORM_OWNER',
        roles: ['PLATFORM_OWNER'],
        permissions: ['view_platform_analytics'],
        isPlatformUser: true,
        platformContext: {},
      },
    });
  });

  await page.goto('/owner');

  await expect(
    page.getByRole('heading', { name: 'Owner Overview' }),
  ).toBeVisible();
});
