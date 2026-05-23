import { Route } from '@angular/router';

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
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        data: placeholder(
          'Owner Overview',
          'Platform Analytics',
          'Placeholder for platform-wide operational analytics and alert widgets.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'tenants',
        data: placeholder(
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
        data: placeholder(
          'Create Tenant',
          'Tenants',
          'Placeholder for the tenant creation form.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId',
        data: placeholder(
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
        data: placeholder(
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
        data: placeholder(
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
        data: placeholder(
          'Tenant Billing',
          'Billing',
          'Placeholder for tenant billing summary.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
          ),
      },
      {
        path: 'tenants/:tenantId/feature-flags',
        data: placeholder(
          'Tenant Feature Flags',
          'Feature Flags',
          'Placeholder for tenant feature flag overrides and effective flag state.',
        ),
        loadComponent: () =>
          import('./pages/placeholder-page.component').then(
            (m) => m.PlaceholderPageComponent,
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
