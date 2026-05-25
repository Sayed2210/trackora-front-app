import { Route } from '@angular/router';
import { Permission, UserRole } from '@trackora/shared/domain';
import { ownerPermissionGuard, platformOnlyGuard } from './auth/owner-auth.guards';

const ownerGuards = [platformOnlyGuard, ownerPermissionGuard];

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
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Tenants Management',
          'Tenants',
          'Placeholder for tenants table, search, filters, pagination, and lifecycle actions.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'tenants/create',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Create Tenant',
          'Tenants',
          'Placeholder for the tenant creation form.',
          { permission: Permission.MANAGE_TENANTS },
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Tenant Details',
          'Tenants',
          'Placeholder for tenant profile, status, and platform owner actions.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId/usage',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Tenant Usage',
          'Tenants',
          'Placeholder for tenant usage cards and limits.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId/users',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Tenant Users',
          'Tenants',
          'Placeholder for tenant users summary.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId/billing',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Tenant Billing',
          'Billing',
          'Placeholder for tenant billing summary.',
          { permission: Permission.VIEW_BILLING },
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId/feature-flags',
        canActivate: ownerGuards,
        data: protectedPlaceholder(
          'Tenant Feature Flags',
          'Feature Flags',
          'Placeholder for tenant feature flag overrides and effective flag state.',
          { permission: Permission.MANAGE_FEATURE_FLAGS },
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
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
