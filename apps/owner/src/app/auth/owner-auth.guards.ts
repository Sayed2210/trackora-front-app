import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService, TokenStorageService } from '@trackora/core/auth';
import { AuthRepository } from '@trackora/shared/data-access';
import {
  Permission,
  PlatformPermission,
  PLATFORM_ROLES,
  User,
  UserRole,
} from '@trackora/shared/domain';
import { catchError, Observable, of, switchMap } from 'rxjs';

type OwnerAccessData = {
  permission?: PlatformPermission | string;
  permissions?: Array<PlatformPermission | string>;
  roles?: UserRole[];
};

const forbiddenUrl = '/owner/forbidden';

export const platformOnlyGuard: CanActivateFn = () => {
  return withCurrentUser((authService, router) => {
    return (
      authService.hasAnyPlatformRole() || router.createUrlTree([forbiddenUrl])
    );
  });
};

export const ownerPermissionGuard: CanActivateFn = (route) => {
  return withCurrentUser((authService, router) => {
    if (!authService.hasAnyPlatformRole()) {
      return router.createUrlTree([forbiddenUrl]);
    }

    return (
      hasRequiredOwnerAccess(authService, route.data as OwnerAccessData) ||
      router.createUrlTree([forbiddenUrl])
    );
  });
};

export function hasRequiredOwnerAccess(
  authService: Pick<AuthService, 'hasRole' | 'hasPermission'>,
  data: OwnerAccessData,
): boolean {
  const permissions = collectPermissions(data);
  const roles = data.roles ?? [];

  if (permissions.length === 0 && roles.length === 0) {
    return true;
  }

  return (
    permissions.some((permission) => authService.hasPermission(permission)) ||
    roles.some((role) => authService.hasRole(role))
  );
}

function withCurrentUser(
  evaluate: (
    authService: AuthService,
    router: Router,
    user: User,
  ) => boolean | UrlTree,
): boolean | UrlTree | Observable<boolean | UrlTree> {
  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);
  const authRepository = inject(AuthRepository);
  const router = inject(Router);

  if (!tokenStorage.getAccessToken()) {
    return router.createUrlTree(['/login']);
  }

  const currentUser = authService.user();
  if (currentUser) {
    return evaluate(authService, router, currentUser);
  }

  return authRepository.me().pipe(
    switchMap((user) => of(evaluate(authService, router, user))),
    catchError(() => {
      authService.logout();
      return of(router.createUrlTree(['/login']));
    }),
  );
}

function collectPermissions(data: OwnerAccessData): PlatformPermission[] {
  const permission = data.permission ? [data.permission] : [];
  return [...permission, ...(data.permissions ?? [])] as PlatformPermission[];
}

export { Permission, PLATFORM_ROLES, UserRole };
