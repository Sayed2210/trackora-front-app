import { Routes } from '@angular/router';

export const walletRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/wallet-page.component').then((m) => m.WalletPageComponent),
  },
];
