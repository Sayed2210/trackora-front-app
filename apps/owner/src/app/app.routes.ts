import { Route } from '@angular/router';
import {
  ownerAnyPermissionGuard,
  ownerPlatformAnalyticsGuard,
  ownerPermissionGuard,
  ownerPlatformRoleGuard,
  ownerSupportAccessGuard,
  VIEW_PLATFORM_ANALYTICS_PERMISSION,
} from './guards/owner-platform-analytics.guard';
import { Permission, UserRole } from '@trackora/shared/domain';
import {
  MANAGE_TENANTS_PERMISSION,
  VIEW_BILLING_PERMISSION,
} from '@trackora/platform-tenants';
import { MANAGE_FEATURE_FLAGS_PERMISSION } from '@trackora/platform-feature-flags';
import { MANAGE_SUBSCRIPTIONS_PERMISSION } from '@trackora/platform-subscriptions';
import { VIEW_BILLING_PERMISSION as PLATFORM_VIEW_BILLING_PERMISSION } from '@trackora/platform-billing';
import { VIEW_AUDIT_LOGS_PERMISSION } from '@trackora/platform-audit-logs';
import { IMPERSONATE_TENANT_ADMIN_PERMISSION } from '@trackora/platform-support';

const ownerGuards = [ownerPlatformAnalyticsGuard];
const SUBSCRIPTION_VIEW_PERMISSIONS = [
  MANAGE_SUBSCRIPTIONS_PERMISSION,
  Permission.VIEW_BILLING,
  Permission.VIEW_PLATFORM_ANALYTICS,
];

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
          import('@trackora/platform-feature-flags').then(
            (m) => m.TenantFeatureFlagsPageComponent,
          ),
      },
      {
        path: 'plans',
        canActivate: [ownerPermissionGuard(Permission.MANAGE_PLANS)],
        data: protectedPlaceholder(
          'Plans Management',
          'Plans',
          'Placeholder for subscription plan cards, limits, pricing, and entitlements.',
          { permission: Permission.MANAGE_PLANS },
        ),
        loadComponent: () =>
          import('@trackora/platform-plans').then(
            (m) => m.PlansListPageComponent,
          ),
      },
      {
        path: 'plans/create',
        canActivate: [ownerPermissionGuard(Permission.MANAGE_PLANS)],
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
        canActivate: [ownerPermissionGuard(Permission.MANAGE_PLANS)],
        data: protectedPlaceholder(
          'Plan Details',
          'Plans',
          'Placeholder for plan details, limits, and feature entitlements.',
          { permission: Permission.MANAGE_PLANS },
        ),
        loadComponent: () =>
          import('@trackora/platform-plans').then(
            (m) => m.PlanDetailPageComponent,
          ),
      },
      {
        path: 'plans/:planId/edit',
        canActivate: [ownerPermissionGuard(Permission.MANAGE_PLANS)],
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
        canActivate: [ownerAnyPermissionGuard(SUBSCRIPTION_VIEW_PERMISSIONS)],
        data: protectedPlaceholder(
          'Subscriptions Management',
          'Subscriptions',
          'Subscription table, filters, and payment status visibility.',
          {
            permissions: SUBSCRIPTION_VIEW_PERMISSIONS,
          },
        ),
        loadComponent: () =>
          import('@trackora/platform-subscriptions').then(
            (m) => m.SubscriptionsListPageComponent,
          ),
      },
      {
        path: 'subscriptions/:subscriptionId',
        canActivate: [ownerAnyPermissionGuard(SUBSCRIPTION_VIEW_PERMISSIONS)],
        data: protectedPlaceholder(
          'Subscription Details',
          'Subscriptions',
          'Subscription details and reason-required mutations.',
          {
            permissions: SUBSCRIPTION_VIEW_PERMISSIONS,
          },
        ),
        loadComponent: () =>
          import('@trackora/platform-subscriptions').then(
            (m) => m.SubscriptionDetailPageComponent,
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
        canActivate: [ownerPermissionGuard(PLATFORM_VIEW_BILLING_PERMISSION)],
        data: { permission: PLATFORM_VIEW_BILLING_PERMISSION },
        loadComponent: () =>
          import('@trackora/platform-billing').then(
            (m) => m.BillingOverviewPageComponent,
          ),
      },
      {
        path: 'invoices',
        canActivate: [ownerPermissionGuard(PLATFORM_VIEW_BILLING_PERMISSION)],
        data: { permission: PLATFORM_VIEW_BILLING_PERMISSION },
        loadComponent: () =>
          import('@trackora/platform-billing').then(
            (m) => m.InvoicesPageComponent,
          ),
      },
      {
        path: 'feature-flags',
        canActivate: [ownerPermissionGuard(MANAGE_FEATURE_FLAGS_PERMISSION)],
        data: { permission: MANAGE_FEATURE_FLAGS_PERMISSION },
        loadComponent: () =>
          import('@trackora/platform-feature-flags').then(
            (m) => m.GlobalFeatureFlagsPageComponent,
          ),
      },
      {
        path: 'audit-logs',
        canActivate: [ownerPermissionGuard(VIEW_AUDIT_LOGS_PERMISSION)],
        data: { permission: VIEW_AUDIT_LOGS_PERMISSION },
        loadComponent: () =>
          import('@trackora/platform-audit-logs').then(
            (m) => m.AuditLogsPageComponent,
          ),
      },
      {
        path: 'support',
        canActivate: [ownerSupportAccessGuard],
        data: {
          permissions: [IMPERSONATE_TENANT_ADMIN_PERMISSION],
          roles: [UserRole.PLATFORM_SUPPORT],
        },
        loadComponent: () =>
          import('@trackora/platform-support').then(
            (m) => m.SupportPageComponent,
          ),
      },
      {
        path: 'support/tenants/:tenantId',
        canActivate: [ownerSupportAccessGuard],
        data: {
          permissions: [IMPERSONATE_TENANT_ADMIN_PERMISSION],
          roles: [UserRole.PLATFORM_SUPPORT],
        },
        loadComponent: () =>
          import('@trackora/platform-support').then(
            (m) => m.TenantHealthPageComponent,
          ),
      },
      {
        path: 'support/impersonation',
        canActivate: [
          ownerPermissionGuard(IMPERSONATE_TENANT_ADMIN_PERMISSION),
        ],
        data: { permission: IMPERSONATE_TENANT_ADMIN_PERMISSION },
        loadComponent: () =>
          import('@trackora/platform-support').then(
            (m) => m.ImpersonationPageComponent,
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
