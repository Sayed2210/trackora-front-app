import { expect, test } from '@playwright/test';

test('serves owner app', async ({ request }) => {
  const response = await request.get('/owner');

  expect(response.ok()).toBe(true);
});
