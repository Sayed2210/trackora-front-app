import { APIRequestContext, BrowserContext, Page, request } from '@playwright/test';
import { loadE2EEnv } from '../config/env-loader';

export interface AuthCredentials {
  phone: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
  merchantId?: string;
  courierId?: string;
  isPlatformUser?: boolean;
}

export interface StorageStateData {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'Strict' | 'Lax' | 'None';
  }>;
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
}

const env = loadE2EEnv();

export async function loginViaApi(
  credentials: AuthCredentials,
  apiBaseUrl?: string
): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  const baseUrl = apiBaseUrl || env.API_BASE_URL;
  const context = await request.newContext({ baseURL: baseUrl });

  try {
    const response = await context.post(`${baseUrl.replace(/\/$/, '')}/auth/login`, {
      data: { phone: credentials.phone, password: credentials.password },
    });

    if (!response.ok()) {
      throw new Error(
        `Login failed: ${response.status()} ${response.statusText()}`
      );
    }

    const body = await response.json();
    const data = body.data || body;

    const user = data.user || {};
    const roles: string[] = user.roles || (user.role ? [user.role] : []);

    return {
      tokens: {
        accessToken: data.accessToken || data.access_token,
        refreshToken: data.refreshToken || data.refresh_token,
      },
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        roles,
        permissions: user.permissions || [],
        tenantId: user.tenantId,
        merchantId: user.merchantId,
        courierId: user.courierId,
        isPlatformUser: user.isPlatformUser,
      },
    };
  } finally {
    await context.dispose();
  }
}

export async function createStorageState(
  context: BrowserContext,
  baseUrl: string,
  credentials: AuthCredentials
): Promise<StorageStateData> {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/login`);

  await page.locator('[data-testid="login-phone"]').fill(credentials.phone);
  await page.locator('[data-testid="login-password"]').fill(credentials.password);
  await page.locator('[data-testid="login-submit"]').click();

  await page.waitForURL('**/dashboard**', { timeout: 15_000 }).catch(() => {
    // some apps redirect to / or other routes
  });

  const storageState = await context.storageState();
  await page.close();

  return storageState as StorageStateData;
}

export async function setupStorageState(
  context: BrowserContext,
  baseUrl: string,
  credentials: AuthCredentials
): Promise<void> {
  const { tokens, user } = await loginViaApi(credentials);
  const origin = new URL(baseUrl).origin;

  await context.addInitScript(
    ({ accessToken, refreshToken, userData, origin }) => {
      sessionStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('trackora_user', JSON.stringify(userData));
    },
    {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userData: user,
      origin,
    }
  );
}

export function getCredentialsForRole(role: 'admin' | 'merchant' | 'courier' | 'owner' | 'owner-limited'): AuthCredentials {
  switch (role) {
    case 'admin':
      return { phone: env.ADMIN_PHONE, password: env.ADMIN_PASSWORD };
    case 'merchant':
      return { phone: env.MERCHANT_PHONE, password: env.MERCHANT_PASSWORD };
    case 'courier':
      return { phone: env.COURIER_PHONE, password: env.COURIER_PASSWORD };
    case 'owner':
      return { phone: env.OWNER_PHONE, password: env.OWNER_PASSWORD };
    case 'owner-limited':
      return { phone: env.OWNER_LIMITED_PHONE, password: env.OWNER_LIMITED_PASSWORD };
  }
}

export function getBaseUrlForApp(app: 'admin' | 'merchant' | 'courier' | 'owner'): string {
  switch (app) {
    case 'admin':
      return env.ADMIN_BASE_URL;
    case 'merchant':
      return env.MERCHANT_BASE_URL;
    case 'courier':
      return env.COURIER_BASE_URL;
    case 'owner':
      return env.OWNER_BASE_URL;
  }
}

export function hasCredentials(role: 'admin' | 'merchant' | 'courier' | 'owner' | 'owner-limited'): boolean {
  const creds = getCredentialsForRole(role);
  return !!(creds.phone && creds.password);
}
