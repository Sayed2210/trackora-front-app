import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@trackora/core/api';

@Injectable({ providedIn: 'root' })
export class MerchantDashboardRepository {
  constructor(private readonly api: ApiClient) {}

  getDashboard(id: string): Observable<any> {
    return this.api.get(`/merchant/${id}/dashboard`);
  }

  getAnalytics(id: string, days?: number): Observable<any> {
    const params = days !== undefined ? { days } : undefined;
    return this.api.get(`/merchant/${id}/analytics`, params);
  }
}
