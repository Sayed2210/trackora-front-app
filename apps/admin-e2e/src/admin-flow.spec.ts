import { expect, test } from '@playwright/test';

test.describe('Admin app smoke', () => {
  for (const route of ['/', '/couriers', '/merchants']) {
    test(`serves ${route}`, async ({ request }) => {
      const response = await request.get(route);

      expect(response.ok()).toBe(true);
    });
  }
});
