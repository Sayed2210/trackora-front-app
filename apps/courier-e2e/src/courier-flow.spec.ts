import { expect, test } from '@playwright/test';

test.describe('Courier app smoke', () => {
  for (const route of ['/', '/tasks', '/cash-deposit']) {
    test(`serves ${route}`, async ({ request }) => {
      const response = await request.get(route);

      expect(response.ok()).toBe(true);
    });
  }
});
