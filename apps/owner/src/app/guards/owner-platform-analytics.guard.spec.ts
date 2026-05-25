import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import { Permission, UserRole } from '@trackora/shared/domain';
import {
  ownerAnyPermissionGuard,
  ownerPlatformAnalyticsGuard,
  PLATFORM_OWNER_ROLES,
  VIEW_PLATFORM_ANALYTICS_PERMISSION,
} from './owner-platform-analytics.guard';

describe('ownerPlatformAnalyticsGuard', () => {
  it('allows platform roles with view platform analytics permission', () => {
    for (const role of PLATFORM_OWNER_ROLES) {
      const result = runGuard({
        authenticated: true,
        roles: [role],
        permissions: [VIEW_PLATFORM_ANALYTICS_PERMISSION],
      });

      expect(result).toBe(true);
    }
  });

  it('rejects legacy super admin without a platform role', () => {
    const result = runGuard({
      authenticated: true,
      roles: ['SUPER_ADMIN' as UserRole],
      permissions: [VIEW_PLATFORM_ANALYTICS_PERMISSION],
    });

    expect(result).toEqual('/owner/forbidden');
  });

  it('rejects platform roles without view platform analytics permission', () => {
    const result = runGuard({
      authenticated: true,
      roles: ['PLATFORM_OWNER' as UserRole],
      permissions: [],
    });

    expect(result).toEqual('/owner/forbidden');
  });

  it('allows platform roles with any one requested permission', () => {
    const result = runAnyPermissionGuard({
      authenticated: true,
      roles: ['PLATFORM_FINANCE' as UserRole],
      permissions: ['view_billing' as Permission],
    });

    expect(result).toBe(true);
  });
});

interface GuardUserState {
  authenticated: boolean;
  roles: UserRole[];
  permissions: Permission[];
}

const runGuard = (state: GuardUserState): boolean | string => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: AuthService,
        useValue: {
          isAuthenticated: () => state.authenticated,
          hasAnyRole: (roles: UserRole[]) =>
            roles.some((role) => state.roles.includes(role)),
          hasPermission: (permission: Permission) =>
            state.permissions.includes(permission),
        },
      },
      {
        provide: Router,
        useValue: {
          createUrlTree: (commands: string[]) => commands.join('/'),
        },
      },
    ],
  });

  const result = TestBed.runInInjectionContext(() =>
    ownerPlatformAnalyticsGuard({} as never, {} as never),
  );

  return result instanceof UrlTree ? result.toString() : result;
};

const runAnyPermissionGuard = (state: GuardUserState): boolean | string => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: AuthService,
        useValue: {
          isAuthenticated: () => state.authenticated,
          hasAnyRole: (roles: UserRole[]) =>
            roles.some((role) => state.roles.includes(role)),
          hasPermission: (permission: Permission) =>
            state.permissions.includes(permission),
        },
      },
      {
        provide: Router,
        useValue: {
          createUrlTree: (commands: string[]) => commands.join('/'),
        },
      },
    ],
  });

  const result = TestBed.runInInjectionContext(() =>
    ownerAnyPermissionGuard([
      'manage_subscriptions' as Permission,
      'view_billing' as Permission,
    ])({} as never, {} as never),
  );

  return result instanceof UrlTree ? result.toString() : result;
};
