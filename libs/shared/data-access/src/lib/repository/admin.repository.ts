import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@trackora/core/api';

@Injectable({ providedIn: 'root' })
export class AdminRepository {
  constructor(private readonly api: ApiClient) {}

  getDashboard(): Observable<any> {
    return this.api.get('/admin/dashboard');
  }

  getFinancialSummary(): Observable<any> {
    return this.api.get('/admin/financial-summary');
  }

  generateDailyReport(date: string): Observable<any> {
    return this.api.post('/admin/reports/daily', {}, { date });
  }

  generateCourierPerformanceReport(from?: string, to?: string): Observable<any> {
    return this.api.post('/admin/reports/courier-performance', {}, { from, to });
  }

  generateMerchantDeliveryReport(from?: string, to?: string): Observable<any> {
    return this.api.post('/admin/reports/merchant-delivery', {}, { from, to });
  }

  getAuditLogs(query: { userId?: string; action?: string; entityType?: string; entityId?: string; from?: string; to?: string; page?: number; limit?: number }): Observable<any> {
    return this.api.get('/admin/audit-logs', query);
  }
}
