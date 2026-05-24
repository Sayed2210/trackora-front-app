import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import { Permission, UserRole } from '@trackora/shared/domain';

export const VIEW_PLATFORM_ANALYTICS_PERMISSION =
  'view_platform_analytics' as Permission;

export const ownerPlatformAnalyticsGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (!authService.hasRole(UserRole.SUPER_ADMIN)) {
    return router.createUrlTree(['/owner/forbidden']);
  }

  if (!authService.hasPermission(VIEW_PLATFORM_ANALYTICS_PERMISSION)) {
    return router.createUrlTree(['/owner/forbidden']);
  }

  return true;
};
