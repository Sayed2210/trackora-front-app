import { expect, test } from '@playwright/test';

test('serves courier app', async ({ request }) => {
  const response = await request.get('/');

  expect(response.ok()).toBe(true);
});
