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
    { label: 'Overview', path: '/owner/overview', section: 'Platform' },
    { label: 'Tenants', path: '/owner/tenants', section: 'Operations' },
    { label: 'Plans', path: '/owner/plans', section: 'Commercial' },
    {
      label: 'Subscriptions',
      path: '/owner/subscriptions',
      section: 'Commercial',
    },
    { label: 'Usage', path: '/owner/usage', section: 'Platform' },
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
    },
    { label: 'Audit Logs', path: '/owner/audit-logs', section: 'Security' },
    {
      label: 'Support',
      path: '/owner/support',
      section: 'Support',
      permission: Permission.IMPERSONATE_TENANT_ADMIN,
      roles: [UserRole.PLATFORM_SUPPORT],
    },
    { label: 'Settings', path: '/owner/settings', section: 'Platform' },
  ];

  protected breadcrumbs = this.buildBreadcrumbs(this.router.url);
  protected readonly visibleNavItems = () =>
    this.navItems.filter(
      (item) =>
        (!item.permission && !item.roles?.length) ||
        (item.permission && this.authService.hasPermission(item.permission)) ||
        item.roles?.some((role) => this.authService.hasRole(role)),
    );

  constructor() {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';

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
