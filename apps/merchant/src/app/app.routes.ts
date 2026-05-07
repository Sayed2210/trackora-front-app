import { Routes } from '@angular/router';
import { authGuard } from '@trackora/core/auth';

export const appRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/merchant-layout.component').then((m) => m.MerchantLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'shipments',
        loadChildren: () =>
          import('@trackora/shipments-feature').then((m) => m.shipmentsRoutes),
      },
      {
        path: 'wallet',
        loadChildren: () =>
          import('@trackora/wallet-feature').then((m) => m.walletRoutes),
      },
      {
        path: 'payouts',
        loadComponent: () =>
          import('@trackora/payouts-feature').then((m) => m.PayoutsFeatureComponent),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@trackora/auth-feature').then((m) => m.LoginPageComponent),
  },
  {
    path: 'tracking',
    loadChildren: () =>
      import('@trackora/tracking-feature').then((m) => m.trackingRoutes),
  },
];
