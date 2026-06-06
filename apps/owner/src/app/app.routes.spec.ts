import { appRoutes } from './app.routes';
import {
  MANAGE_TENANTS_PERMISSION,
  VIEW_BILLING_PERMISSION,
} from '@trackora/platform-tenants';
import { MANAGE_FEATURE_FLAGS_PERMISSION } from '@trackora/platform-feature-flags';
import { MANAGE_SUBSCRIPTIONS_PERMISSION } from '@trackora/platform-subscriptions';
import { VIEW_BILLING_PERMISSION as PLATFORM_VIEW_BILLING_PERMISSION } from '@trackora/platform-billing';
import { VIEW_AUDIT_LOGS_PERMISSION } from '@trackora/platform-audit-logs';
import { IMPERSONATE_TENANT_ADMIN_PERMISSION } from '@trackora/platform-support';
import {
  ownerPlatformAnalyticsGuard,
  VIEW_PLATFORM_ANALYTICS_PERMISSION,
} from './guards/owner-platform-analytics.guard';

describe('owner routes', () => {
  it('protects /owner and /owner/overview with platform analytics permission', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const ownerIndexRoute = ownerRoute?.children?.find(
      (route) => route.path === '',
    );
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

    expect(
      children.find((route) => route.path === 'tenants/create')?.data?.[
        'permission'
      ],
    ).toBe(MANAGE_TENANTS_PERMISSION);
    expect(
      children.find((route) => route.path === 'tenants/:tenantId/users')
        ?.data?.['permission'],
    ).toBe(MANAGE_TENANTS_PERMISSION);
    expect(
      children.find((route) => route.path === 'tenants/:tenantId/billing')
        ?.data?.['permission'],
    ).toBe(VIEW_BILLING_PERMISSION);
    expect(
      children.find((route) => route.path === 'tenants/:tenantId/feature-flags')
        ?.data?.['permission'],
    ).toBe(MANAGE_FEATURE_FLAGS_PERMISSION);
  });

  it('configures feature flags route permissions', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const children = ownerRoute?.children ?? [];

    expect(
      children.find((route) => route.path === 'feature-flags')?.data?.[
        'permission'
      ],
    ).toBe(MANAGE_FEATURE_FLAGS_PERMISSION);
    expect(
      children.find((route) => route.path === 'tenants/:tenantId/feature-flags')
        ?.data?.['permission'],
    ).toBe(MANAGE_FEATURE_FLAGS_PERMISSION);
  });

  it('configures subscription management route permissions', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const children = ownerRoute?.children ?? [];
    const listRoute = children.find((route) => route.path === 'subscriptions');
    const detailRoute = children.find(
      (route) => route.path === 'subscriptions/:subscriptionId',
    );

    expect(listRoute?.data?.['permissions']).toEqual([
      MANAGE_SUBSCRIPTIONS_PERMISSION,
      VIEW_BILLING_PERMISSION,
      VIEW_PLATFORM_ANALYTICS_PERMISSION,
    ]);
    expect(detailRoute?.data?.['permissions']).toEqual(
      listRoute?.data?.['permissions'],
    );
  });

  it('requires manage_plans for plan routes', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const children = ownerRoute?.children ?? [];

    for (const path of [
      'plans',
      'plans/create',
      'plans/:planId',
      'plans/:planId/edit',
    ]) {
      expect(children.find((route) => route.path === path)?.data?.['permission']).toBe(
        'manage_plans',
      );
    }
  });

  it('requires view_billing for billing routes', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const children = ownerRoute?.children ?? [];

    expect(
      children.find((route) => route.path === 'billing')?.data?.['permission'],
    ).toBe(PLATFORM_VIEW_BILLING_PERMISSION);
    expect(
      children.find((route) => route.path === 'invoices')?.data?.['permission'],
    ).toBe(PLATFORM_VIEW_BILLING_PERMISSION);
  });

  it('requires view_audit_logs for audit logs route', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const children = ownerRoute?.children ?? [];

    expect(
      children.find((route) => route.path === 'audit-logs')?.data?.[
        'permission'
      ],
    ).toBe(VIEW_AUDIT_LOGS_PERMISSION);
  });

  it('configures support and impersonation route permissions', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const children = ownerRoute?.children ?? [];

    expect(
      children.find((route) => route.path === 'support')?.data?.['permissions'],
    ).toEqual([IMPERSONATE_TENANT_ADMIN_PERMISSION]);
    expect(
      children.find((route) => route.path === 'support/tenants/:tenantId')
        ?.data?.['permissions'],
    ).toEqual([IMPERSONATE_TENANT_ADMIN_PERMISSION]);
    expect(
      children.find((route) => route.path === 'support/impersonation')?.data?.[
        'permission'
      ],
    ).toBe(IMPERSONATE_TENANT_ADMIN_PERMISSION);
  });
});
