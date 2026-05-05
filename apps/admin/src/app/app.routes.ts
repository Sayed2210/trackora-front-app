import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
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
        loadComponent: () =>
          import('@trackora/shipments-feature').then((m) => m.ShipmentsFeatureComponent),
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
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@trackora/auth-feature').then((m) => m.AuthFeatureComponent),
  },
];
