import { appRoutes } from './app.routes';
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
});
