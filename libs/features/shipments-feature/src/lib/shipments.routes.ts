import { Routes } from '@angular/router';

export const shipmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/shipment-list-page.component').then((m) => m.ShipmentListPageComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/create-shipment-page.component').then((m) => m.CreateShipmentPageComponent),
  },
  {
    path: 'bulk-upload',
    loadComponent: () =>
      import('./pages/bulk-upload-page.component').then((m) => m.BulkUploadPageComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/shipment-detail-page.component').then((m) => m.ShipmentDetailPageComponent),
  },
];
