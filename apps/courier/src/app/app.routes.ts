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
          import('./pages/courier-task-list-page.component').then((m) => m.CourierTaskListPageComponent),
      },
      {
        path: 'tasks/:id',
        loadComponent: () =>
          import('./pages/courier-task-detail-page.component').then((m) => m.CourierTaskDetailPageComponent),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@trackora/auth-feature').then((m) => m.LoginPageComponent),
  },
];
