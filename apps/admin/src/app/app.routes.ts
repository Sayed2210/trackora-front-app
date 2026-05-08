import { Routes } from '@angular/router';
import { authGuard } from '@trackora/core/auth';

export const appRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'shipments',
        loadChildren: () =>
          import('@trackora/shipments-feature').then((m) => m.shipmentsRoutes),
      },
      {
        path: 'assignments',
        loadComponent: () =>
          import('@trackora/assignments-feature').then((m) => m.AssignmentsFeatureComponent),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('@trackora/analytics-feature').then((m) => m.AnalyticsFeatureComponent),
      },
      {
        path: 'zones',
        loadChildren: () =>
          import('@trackora/zones-feature').then((m) => m.zonesRoutes),
      },
      {
        path: 'couriers',
        loadComponent: () =>
          import('./pages/courier-management/courier-management-page.component').then(
            (m) => m.CourierManagementPageComponent
          ),
      },
      {
        path: 'merchants',
        loadComponent: () =>
          import('./pages/merchant-management/merchant-management-page.component').then(
            (m) => m.MerchantManagementPageComponent
          ),
      },
      {
        path: 'payouts',
        loadComponent: () =>
          import('./pages/payout-approval/payout-approval-page.component').then(
            (m) => m.PayoutApprovalPageComponent
          ),
      },
      {
        path: 'wallets',
        loadComponent: () =>
          import('./pages/wallet-management/wallet-management-page.component').then(
            (m) => m.WalletManagementPageComponent
          ),
      },
      {
        path: 'audit-logs',
        loadComponent: () =>
          import('./pages/audit-logs/audit-logs-page.component').then(
            (m) => m.AuditLogsPageComponent
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports-page.component').then(
            (m) => m.ReportsPageComponent
          ),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@trackora/auth-feature').then((m) => m.LoginPageComponent),
  },
];
