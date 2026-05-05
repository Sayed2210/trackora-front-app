import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
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
        loadComponent: () =>
          import('@trackora/shipments-feature').then((m) => m.ShipmentsFeatureComponent),
      },
      {
        path: 'wallet',
        loadComponent: () =>
          import('@trackora/wallet-feature').then((m) => m.WalletFeatureComponent),
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
      import('@trackora/auth-feature').then((m) => m.AuthFeatureComponent),
  },
];
