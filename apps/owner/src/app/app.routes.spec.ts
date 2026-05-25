import { appRoutes } from './app.routes';
import {
  MANAGE_TENANTS_PERMISSION,
  VIEW_BILLING_PERMISSION,
} from '@trackora/platform-tenants';
import { MANAGE_FEATURE_FLAGS_PERMISSION } from '@trackora/platform-feature-flags';
import {
  MANAGE_SUBSCRIPTIONS_PERMISSION,
} from '@trackora/platform-subscriptions';
import {
  ownerPlatformAnalyticsGuard,
  VIEW_PLATFORM_ANALYTICS_PERMISSION,
} from './guards/owner-platform-analytics.guard';

describe('owner routes', () => {
  it('protects /owner and /owner/overview with platform analytics permission', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const ownerIndexRoute = ownerRoute?.children?.find((route) => route.path === '');
    const overviewRoute = ownerRoute?.children?.find(
      (route) => route.path === 'overview',
    );

    expect(ownerIndexRoute?.canActivate).toContain(ownerPlatformAnalyticsGuard);
    expect(ownerIndexRoute?.data?.['permission']).toBe(
      VIEW_PLATFORM_ANALYTICS_PERMISSION,
    );
    expect(overviewRoute?.canActivate).toContain(ownerPlatformAnalyticsGuard);
    expect(overviewRoute?.data?.['permission']).toBe(
      VIEW_PLATFORM_ANALYTICS_PERMISSION,
    );
  });

  it('configures tenant management route permissions', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const children = ownerRoute?.children ?? [];

    expect(children.find((route) => route.path === 'tenants/create')?.data?.['permission']).toBe(MANAGE_TENANTS_PERMISSION);
    expect(children.find((route) => route.path === 'tenants/:tenantId/users')?.data?.['permission']).toBe(MANAGE_TENANTS_PERMISSION);
    expect(children.find((route) => route.path === 'tenants/:tenantId/billing')?.data?.['permission']).toBe(VIEW_BILLING_PERMISSION);
    expect(children.find((route) => route.path === 'tenants/:tenantId/feature-flags')?.data?.['permission']).toBe(MANAGE_FEATURE_FLAGS_PERMISSION);
  });

  it('configures feature flags route permissions', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const children = ownerRoute?.children ?? [];

    expect(children.find((route) => route.path === 'feature-flags')?.data?.['permission']).toBe(MANAGE_FEATURE_FLAGS_PERMISSION);
    expect(children.find((route) => route.path === 'tenants/:tenantId/feature-flags')?.data?.['permission']).toBe(MANAGE_FEATURE_FLAGS_PERMISSION);
  });

  it('configures subscription management route permissions', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const children = ownerRoute?.children ?? [];
    const listRoute = children.find((route) => route.path === 'subscriptions');
    const detailRoute = children.find((route) => route.path === 'subscriptions/:subscriptionId');

    expect(listRoute?.data?.['permissions']).toEqual([
      MANAGE_SUBSCRIPTIONS_PERMISSION,
      VIEW_BILLING_PERMISSION,
      VIEW_PLATFORM_ANALYTICS_PERMISSION,
    ]);
    expect(detailRoute?.data?.['permissions']).toEqual(listRoute?.data?.['permissions']);
  });
});
