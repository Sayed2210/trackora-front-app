import { Page, Route } from '@playwright/test';

export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  body: unknown,
  options: { status?: number; delay?: number; method?: string } = {}
): Promise<void> {
  const { status = 200, delay = 0, method } = options;

  await page.route(urlPattern, async (route: Route) => {
    if (method && route.request().method() !== method.toUpperCase()) {
      await route.fallback();
      return;
    }
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

export async function mockApiError(
  page: Page,
  urlPattern: string | RegExp,
  status: number,
  message = 'Something went wrong',
  options: { delay?: number; method?: string } = {}
): Promise<void> {
  await mockApiResponse(
    page,
    urlPattern,
    { success: false, message, data: null },
    { status, ...options }
  );
}

export async function mockApiLoading(
  page: Page,
  urlPattern: string | RegExp,
  delayMs = 5000
): Promise<void> {
  await page.route(urlPattern, async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
}

export async function mockEmptyList(
  page: Page,
  urlPattern: string | RegExp
): Promise<void> {
  await mockApiResponse(page, urlPattern, {
    success: true,
    data: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
}

export async function mockPaginatedList<T>(
  page: Page,
  urlPattern: string | RegExp,
  items: T[],
  meta: { page: number; limit: number; total: number; totalPages: number }
): Promise<void> {
  await mockApiResponse(page, urlPattern, {
    success: true,
    data: items,
    meta,
  });
}

export async function unmockRoute(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.unroute(urlPattern);
}
