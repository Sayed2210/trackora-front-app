import { expect, Page } from '@playwright/test';

export async function expectDocumentDirection(
  page: Page,
  direction: 'rtl' | 'ltr'
): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('dir', direction);
}

export async function expectDocumentLanguage(
  page: Page,
  lang: string
): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
}

export async function expectLoadingState(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="loading-state"]')).toBeVisible();
}

export async function expectEmptyState(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
}

export async function expectErrorState(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
}

export async function expectForbiddenState(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="forbidden-state"]')).toBeVisible();
}

export async function expectRetryButton(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
}

export async function expectRedirectToLogin(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/login/);
}

export async function expectNoAuthStorage(page: Page): Promise<void> {
  const token = await page.evaluate(() => sessionStorage.getItem('access_token'));
  expect(token).toBeNull();
}
