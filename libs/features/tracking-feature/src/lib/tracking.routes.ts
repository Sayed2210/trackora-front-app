import { Routes } from '@angular/router';

export const trackingRoutes: Routes = [
  {
    path: ':trackingNumber',
    loadComponent: () =>
      import('./pages/tracking-page.component').then((m) => m.TrackingPageComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/tracking-page.component').then((m) => m.TrackingPageComponent),
  },
];
