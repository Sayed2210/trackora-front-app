import { Route } from '@angular/router';
import {
  ownerPlatformAnalyticsGuard,
  ownerPermissionGuard,
  ownerPlatformRoleGuard,
  VIEW_PLATFORM_ANALYTICS_PERMISSION,
} from './guards/owner-platform-analytics.guard';
import {
  MANAGE_FEATURE_FLAGS_PERMISSION,
  MANAGE_TENANTS_PERMISSION,
  VIEW_BILLING_PERMISSION,
} from '@trackora/platform-tenants';

const placeholder = (title: string, module: string, description: string) => ({
  title,
  module,
  description,
});

const protectedPlaceholder = (
  title: string,
  module: string,
  description: string,
  access: Record<string, unknown> = {},
) => ({
  ...placeholder(title, module, description),
  ...access,
});

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'owner', pathMatch: 'full' },
  {
    path: 'owner',
    loadComponent: () =>
      import('./layout/owner-layout.component').then(
        (m) => m.OwnerLayoutComponent,
    ),
    children: [
      {
        path: '',
        canActivate: [ownerPlatformAnalyticsGuard],
        data: { permission: VIEW_PLATFORM_ANALYTICS_PERMISSION },
        loadComponent: () =>
          import('./pages/overview-page.component').then(
            (m) => m.OverviewPageComponent,
          ),
      },
      {
        path: 'overview',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Owner Overview',
          'Platform Analytics',
          'Placeholder for platform-wide operational analytics and alert widgets.',
          { permission: Permission.VIEW_PLATFORM_ANALYTICS },
        ),
        loadComponent: () =>
          import('./pages/overview-page.component').then(
            (m) => m.OverviewPageComponent,
          ),
      },
      {
        path: 'tenants',
        canActivate: [ownerPlatformRoleGuard],
        data: { role: 'platform' },
        loadComponent: () =>
          import('@trackora/platform-tenants').then(
            (m) => m.TenantsListPageComponent,
          ),
      },
      {
        path: 'tenants/create',
        canActivate: [ownerPermissionGuard(MANAGE_TENANTS_PERMISSION)],
        data: { permission: MANAGE_TENANTS_PERMISSION },
        loadComponent: () =>
          import('@trackora/platform-tenants').then(
            (m) => m.TenantCreatePageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId',
        canActivate: [ownerPlatformRoleGuard],
        data: { role: 'platform' },
        loadComponent: () =>
          import('@trackora/platform-tenants').then(
            (m) => m.TenantDetailPageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId/usage',
        canActivate: [ownerPlatformRoleGuard],
        data: { role: 'platform' },
        loadComponent: () =>
          import('@trackora/platform-tenants').then(
            (m) => m.TenantUsagePageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId/users',
        canActivate: [ownerPermissionGuard(MANAGE_TENANTS_PERMISSION)],
        data: { permission: MANAGE_TENANTS_PERMISSION },
        loadComponent: () =>
          import('@trackora/platform-tenants').then(
            (m) => m.TenantUsersPageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId/billing',
        canActivate: [ownerPermissionGuard(VIEW_BILLING_PERMISSION)],
        data: { permission: VIEW_BILLING_PERMISSION },
        loadComponent: () =>
          import('@trackora/platform-tenants').then(
            (m) => m.TenantBillingPageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId/feature-flags',
        canActivate: [ownerPermissionGuard(MANAGE_FEATURE_FLAGS_PERMISSION)],
        data: { permission: MANAGE_FEATURE_FLAGS_PERMISSION },
        loadComponent: () =>
          import('@trackora/platform-tenants').then(
            (m) => m.TenantFeatureFlagsPageComponent,
          ),
      },
      {
        path: 'plans',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Plans Management',
          'Plans',
          'Placeholder for subscription plan cards, limits, pricing, and entitlements.',
        ),
        loadComponent: () =>
          import('@trackora/platform-plans').then(
            (m) => m.PlansListPageComponent,
          ),
      },
      {
        path: 'plans/create',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Create Plan',
          'Plans',
          'Placeholder for plan creation form.',
          { permission: Permission.MANAGE_PLANS },
        ),
        loadComponent: () =>
          import('@trackora/platform-plans').then(
            (m) => m.PlanCreatePageComponent,
          ),
      },
      {
        path: 'plans/:planId',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Plan Details',
          'Plans',
          'Placeholder for plan details, limits, and feature entitlements.',
        ),
        loadComponent: () =>
          import('@trackora/platform-plans').then(
            (m) => m.PlanDetailPageComponent,
          ),
      },
      {
        path: 'plans/:planId/edit',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Edit Plan',
          'Plans',
          'Placeholder for plan edit form.',
          { permission: Permission.MANAGE_PLANS },
        ),
        loadComponent: () =>
          import('@trackora/platform-plans').then(
            (m) => m.PlanEditPageComponent,
          ),
      },
      {
        path: 'subscriptions',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Subscriptions Management',
          'Subscriptions',
          'Placeholder for subscriptions table, filters, and payment status visibility.',
          {
            permissions: [
              Permission.MANAGE_SUBSCRIPTIONS,
              Permission.VIEW_BILLING,
              Permission.VIEW_PLATFORM_ANALYTICS,
            ],
          },
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'subscriptions/:subscriptionId',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Subscription Details',
          'Subscriptions',
          'Placeholder for subscription details and future reason-required mutations.',
          {
            permissions: [
              Permission.MANAGE_SUBSCRIPTIONS,
              Permission.VIEW_BILLING,
              Permission.VIEW_PLATFORM_ANALYTICS,
            ],
          },
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'usage',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Platform Usage',
          'Usage',
          'Placeholder for platform usage and limits visibility.',
          { permission: Permission.VIEW_PLATFORM_ANALYTICS },
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'billing',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Billing Overview',
          'Billing',
          'Placeholder for finance-only billing overview.',
          { permission: Permission.VIEW_BILLING },
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'invoices',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Invoices',
          'Billing',
          'Placeholder for invoices, manual invoices, and export flows.',
          { permission: Permission.VIEW_BILLING },
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'feature-flags',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Feature Flags',
          'Feature Flags',
          'Placeholder for global flags, plan inheritance, and tenant overrides.',
          { permission: Permission.MANAGE_FEATURE_FLAGS },
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'audit-logs',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Audit Logs',
          'Audit Logs',
          'Placeholder for platform audit logs, filters, reasons, and masked values.',
          { permission: Permission.VIEW_AUDIT_LOGS },
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'support',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Support Tools',
          'Support',
          'Placeholder for tenant search, health checks, and impersonation workflows.',
          {
            permissions: [Permission.IMPERSONATE_TENANT_ADMIN],
            roles: [UserRole.PLATFORM_SUPPORT],
          },
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'settings',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Owner Settings',
          'Settings',
          'Placeholder for platform owner settings pending Swagger permission confirmation.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./pages/forbidden-page.component').then(
            (m) => m.ForbiddenPageComponent,
          ),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@trackora/auth-feature').then((m) => m.LoginPageComponent),
  },
  { path: '**', redirectTo: 'owner' },
];
