import { expect, test } from '@playwright/test';

test.describe('Merchant app smoke', () => {
  for (const route of ['/', '/login', '/tracking']) {
    test(`serves ${route}`, async ({ request }) => {
      const response = await request.get(route);

      expect(response.ok()).toBe(true);
    });
  }
});
