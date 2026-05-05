import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/courier-layout.component').then((m) => m.CourierLayoutComponent),
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      {
        path: 'tasks',
        loadComponent: () =>
          import('@trackora/courier-tasks-feature').then((m) => m.CourierTasksFeatureComponent),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@trackora/auth-feature').then((m) => m.AuthFeatureComponent),
  },
];
