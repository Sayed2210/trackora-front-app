import { expect, test } from '@playwright/test';

test('serves merchant app', async ({ request }) => {
  const response = await request.get('/');

  expect(response.ok()).toBe(true);
});
