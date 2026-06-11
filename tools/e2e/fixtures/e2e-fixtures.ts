import { test as base, expect, Page, BrowserContext } from '@playwright/test';
import { setupStorageState, getCredentialsForRole, hasCredentials, getBaseUrlForApp } from '../auth/auth-helpers';

export type Role = 'admin' | 'merchant' | 'courier' | 'owner' | 'owner-limited' | 'unauthenticated';
export type AppName = 'admin' | 'merchant' | 'courier' | 'owner';

interface E2EFixtures {
  authenticatedPage: Page;
  role: Role;
  app: AppName;
}

export const test = base.extend<E2EFixtures>({
  role: ['unauthenticated', { option: true }],
  app: ['merchant', { option: true }],
  authenticatedPage: async ({ page, context, role, app }, use) => {
    if (role === 'unauthenticated') {
      await use(page);
      return;
    }

    if (!hasCredentials(role)) {
      test.skip(true, `No credentials configured for role: ${role}. Set E2E_${role.toUpperCase().replace('-', '_')}_PHONE and E2E_${role.toUpperCase().replace('-', '_')}_PASSWORD in .env.e2e`);
      return;
    }

    const baseUrl = getBaseUrlForApp(app);
    const credentials = getCredentialsForRole(role);
    await setupStorageState(context, baseUrl, credentials);
    await use(page);
  },
});

export { expect };
