import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import { Permission, UserRole } from '@trackora/shared/domain';

export const VIEW_PLATFORM_ANALYTICS_PERMISSION =
  'view_platform_analytics' as Permission;
export const MANAGE_PLANS_PERMISSION = 'manage_plans' as Permission;

export const PLATFORM_OWNER_ROLES = [
  'PLATFORM_OWNER',
  'PLATFORM_ADMIN',
  'PLATFORM_SUPPORT',
  'PLATFORM_FINANCE',
] as unknown as UserRole[];

export const ownerPlatformAnalyticsGuard: CanActivateFn = () =>
  checkPlatformPermission(VIEW_PLATFORM_ANALYTICS_PERMISSION);

export const ownerPlatformRoleGuard: CanActivateFn = () =>
  checkPlatformPermission();

export const ownerPlatformPermissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
) => checkPlatformPermission(route.data['permission'] as Permission | undefined);

const checkPlatformPermission = (permission?: Permission) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (!authService.hasAnyRole(PLATFORM_OWNER_ROLES)) {
    return router.createUrlTree(['/owner/forbidden']);
  }

  if (permission && !authService.hasPermission(permission)) {
    return router.createUrlTree(['/owner/forbidden']);
  }

  return true;
};
