import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService, TokenStorageService } from '@trackora/core/auth';
import { AuthRepository } from '@trackora/shared/data-access';
import { Permission, UserRole } from '@trackora/shared/domain';
import {
  hasRequiredOwnerAccess,
  ownerPermissionGuard,
  platformOnlyGuard,
} from './owner-auth.guards';

describe('owner auth guards', () => {
  const forbiddenTree = { redirectTo: '/owner/forbidden' };
  const loginTree = { redirectTo: '/login' };

  function configureAuth(auth: Partial<AuthService>): void {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        {
          provide: TokenStorageService,
          useValue: { getAccessToken: () => 'token' },
        },
        { provide: AuthRepository, useValue: { me: vi.fn() } },
        {
          provide: Router,
          useValue: {
            createUrlTree: (commands: string[]) => {
              const path = commands.join('');
              return path === '/login' ? loginTree : forbiddenTree;
            },
          },
        },
      ],
    });
  }

  const emptyRoute = {} as ActivatedRouteSnapshot;
  const emptyState = {} as RouterStateSnapshot;

  it('allows a platform role to pass the platform-only guard', () => {
    configureAuth({
      user: () => ({
        id: '1',
        name: 'Owner',
        roles: [UserRole.PLATFORM_OWNER],
        permissions: [],
      }),
      hasAnyPlatformRole: () => true,
    } as Partial<AuthService>);

    const result = TestBed.runInInjectionContext(() =>
      platformOnlyGuard(emptyRoute, emptyState),
    );

    expect(result).toBe(true);
  });

  it('blocks an authenticated non-platform role', () => {
    configureAuth({
      user: () => ({
        id: '1',
        name: 'Merchant',
        roles: [UserRole.MERCHANT],
        permissions: [],
      }),
      hasAnyPlatformRole: () => false,
    } as Partial<AuthService>);

    const result = TestBed.runInInjectionContext(() =>
      platformOnlyGuard(emptyRoute, emptyState),
    );

    expect(result).toBe(forbiddenTree);
  });

  it('blocks a platform user missing the route permission', () => {
    configureAuth({
      user: () => ({
        id: '1',
        name: 'Finance',
        roles: [UserRole.PLATFORM_FINANCE],
        permissions: [],
      }),
      hasAnyPlatformRole: () => true,
      hasPermission: () => false,
      hasRole: () => false,
    } as Partial<AuthService>);

    const result = TestBed.runInInjectionContext(() =>
      ownerPermissionGuard(
        {
          data: { permission: Permission.VIEW_BILLING },
        } as unknown as ActivatedRouteSnapshot,
        emptyState,
      ),
    );

    expect(result).toBe(forbiddenTree);
  });

  it('allows any matching route permission', () => {
    const auth = {
      hasPermission: (permission: Permission) =>
        permission === Permission.VIEW_BILLING,
      hasRole: () => false,
    } as Pick<AuthService, 'hasPermission' | 'hasRole'>;

    expect(
      hasRequiredOwnerAccess(auth, {
        permissions: [Permission.MANAGE_SUBSCRIPTIONS, Permission.VIEW_BILLING],
      }),
    ).toBe(true);
  });

  it('allows the support page by platform support role', () => {
    const auth = {
      hasPermission: () => false,
      hasRole: (role: UserRole) => role === UserRole.PLATFORM_SUPPORT,
    } as Pick<AuthService, 'hasPermission' | 'hasRole'>;

    expect(
      hasRequiredOwnerAccess(auth, {
        permissions: [Permission.IMPERSONATE_TENANT_ADMIN],
        roles: [UserRole.PLATFORM_SUPPORT],
      }),
    ).toBe(true);
  });

  it('supports permission helper checks used by route and UI authorization', () => {
    const auth = {
      hasPermission: (permission: Permission) =>
        permission === Permission.VIEW_BILLING,
      hasRole: (role: UserRole) => role === UserRole.PLATFORM_FINANCE,
    } as Pick<AuthService, 'hasPermission' | 'hasRole'>;

    expect(auth.hasRole(UserRole.PLATFORM_FINANCE)).toBe(true);
    expect(auth.hasPermission(Permission.VIEW_BILLING)).toBe(true);
    expect(
      hasRequiredOwnerAccess(auth, {
        permissions: [Permission.MANAGE_TENANTS, Permission.VIEW_BILLING],
      }),
    ).toBe(true);
  });
});
