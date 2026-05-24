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
        canActivate: [ownerPlatformAnalyticsGuard],
        data: { permission: VIEW_PLATFORM_ANALYTICS_PERMISSION },
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
        data: placeholder(
          'Plans Management',
          'Plans',
          'Placeholder for subscription plan cards, limits, pricing, and entitlements.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'plans/create',
        data: placeholder(
          'Create Plan',
          'Plans',
          'Placeholder for plan creation form.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'plans/:planId',
        data: placeholder(
          'Plan Details',
          'Plans',
          'Placeholder for plan details, limits, and feature entitlements.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'plans/:planId/edit',
        data: placeholder(
          'Edit Plan',
          'Plans',
          'Placeholder for plan edit form.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'subscriptions',
        data: placeholder(
          'Subscriptions Management',
          'Subscriptions',
          'Placeholder for subscriptions table, filters, and payment status visibility.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'subscriptions/:subscriptionId',
        data: placeholder(
          'Subscription Details',
          'Subscriptions',
          'Placeholder for subscription details and future reason-required mutations.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'usage',
        data: placeholder(
          'Platform Usage',
          'Usage',
          'Placeholder for platform usage and limits visibility.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'billing',
        data: placeholder(
          'Billing Overview',
          'Billing',
          'Placeholder for finance-only billing overview.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'invoices',
        data: placeholder(
          'Invoices',
          'Billing',
          'Placeholder for invoices, manual invoices, and export flows.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'feature-flags',
        data: placeholder(
          'Feature Flags',
          'Feature Flags',
          'Placeholder for global flags, plan inheritance, and tenant overrides.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'audit-logs',
        data: placeholder(
          'Audit Logs',
          'Audit Logs',
          'Placeholder for platform audit logs, filters, reasons, and masked values.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'support',
        data: placeholder(
          'Support Tools',
          'Support',
          'Placeholder for tenant search, health checks, and impersonation workflows.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'settings',
        data: placeholder(
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
  { path: '**', redirectTo: 'owner' },
];
