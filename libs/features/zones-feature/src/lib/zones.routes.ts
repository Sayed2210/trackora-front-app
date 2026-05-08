import { Routes } from '@angular/router';

export const zonesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/zone-list-page.component').then((m) => m.ZoneListPageComponent),
  },
];
