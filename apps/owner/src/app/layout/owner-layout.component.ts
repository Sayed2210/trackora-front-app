import { Component, inject } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import { ActiveImpersonationBannerComponent } from '@trackora/platform-support';
import { Permission, UserRole } from '@trackora/shared/domain';
import { filter } from 'rxjs';

type OwnerNavItem = {
  label: string;
  path: string;
  section: string;
  permission?: Permission;
  permissions?: Permission[];
  roles?: UserRole[];
};

@Component({
  selector: 'app-owner-layout',
  imports: [
    ActiveImpersonationBannerComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './owner-layout.component.html',
  styleUrl: './owner-layout.component.scss',
})
export class OwnerLayoutComponent {
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  protected readonly navItems: OwnerNavItem[] = [
    {
      label: 'Overview',
      path: '/owner/overview',
      section: 'Platform',
      permission: Permission.VIEW_PLATFORM_ANALYTICS,
    },
    { label: 'Tenants', path: '/owner/tenants', section: 'Operations' },
    {
      label: 'Plans',
      path: '/owner/plans',
      section: 'Commercial',
      permission: Permission.MANAGE_PLANS,
    },
    {
      label: 'Subscriptions',
      path: '/owner/subscriptions',
      section: 'Commercial',
      permissions: [
        Permission.MANAGE_SUBSCRIPTIONS,
        Permission.VIEW_BILLING,
        Permission.VIEW_PLATFORM_ANALYTICS,
      ],
    },
    {
      label: 'Usage',
      path: '/owner/usage',
      section: 'Platform',
      permission: Permission.VIEW_PLATFORM_ANALYTICS,
    },
    {
      label: 'Billing',
      path: '/owner/billing',
      section: 'Finance',
      permission: Permission.VIEW_BILLING,
    },
    {
      label: 'Invoices',
      path: '/owner/invoices',
      section: 'Finance',
      permission: Permission.VIEW_BILLING,
    },
    {
      label: 'Feature Flags',
      path: '/owner/feature-flags',
      section: 'Controls',
      permission: Permission.MANAGE_FEATURE_FLAGS,
    },
    {
      label: 'Audit Logs',
      path: '/owner/audit-logs',
      section: 'Security',
      permission: Permission.VIEW_AUDIT_LOGS,
    },
    {
      label: 'Support',
      path: '/owner/support',
      section: 'Support',
      permission: Permission.IMPERSONATE_TENANT_ADMIN,
      roles: [UserRole.PLATFORM_SUPPORT],
    },
    {
      label: 'Settings',
      path: '/owner/settings',
      section: 'Platform',
      permission: Permission.VIEW_PLATFORM_ANALYTICS,
    },
  ];

  protected breadcrumbs = this.buildBreadcrumbs(this.router.url);
  protected readonly visibleNavItems = () =>
    this.navItems.filter(
      (item) =>
        (!item.permission && !item.permissions?.length && !item.roles?.length) ||
        (item.permission && this.authService.hasPermission(item.permission)) ||
        item.permissions?.some((permission) =>
          this.authService.hasPermission(permission),
        ) ||
        item.roles?.some((role) => this.authService.hasRole(role)),
    );

  constructor() {
    const lang = document.documentElement.lang.startsWith('en') ? 'en' : 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe((event) => {
        this.breadcrumbs = this.buildBreadcrumbs(event.urlAfterRedirects);
      });
  }

  private buildBreadcrumbs(url: string): string[] {
    const segments = url
      .split('?')[0]
      .split('/')
      .filter(Boolean)
      .map((segment) => segment.replace(/-/g, ' '));

    if (segments.length === 0) {
      return ['owner'];
    }

    return segments;
  }
}
