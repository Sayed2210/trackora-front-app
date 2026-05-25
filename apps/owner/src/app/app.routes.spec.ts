import { appRoutes } from './app.routes';
import {
  MANAGE_PLANS_PERMISSION,
  ownerPlatformAnalyticsGuard,
  ownerPlatformPermissionGuard,
  ownerPlatformRoleGuard,
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

  it('configures plans routes with platform role and manage plans permissions', () => {
    const ownerRoute = appRoutes.find((route) => route.path === 'owner');
    const plansRoute = ownerRoute?.children?.find((route) => route.path === 'plans');
    const createRoute = ownerRoute?.children?.find((route) => route.path === 'plans/create');
    const detailRoute = ownerRoute?.children?.find((route) => route.path === 'plans/:planId');
    const editRoute = ownerRoute?.children?.find((route) => route.path === 'plans/:planId/edit');

    expect(plansRoute?.canActivate).toContain(ownerPlatformRoleGuard);
    expect(detailRoute?.canActivate).toContain(ownerPlatformRoleGuard);
    expect(createRoute?.canActivate).toContain(ownerPlatformPermissionGuard);
    expect(editRoute?.canActivate).toContain(ownerPlatformPermissionGuard);
    expect(createRoute?.data?.['permission']).toBe(MANAGE_PLANS_PERMISSION);
    expect(editRoute?.data?.['permission']).toBe(MANAGE_PLANS_PERMISSION);
  });
});
