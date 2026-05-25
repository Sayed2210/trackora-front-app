import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@trackora/core/api';
import { map, Observable } from 'rxjs';
import {
  BillingOverview,
  InvoicesPage,
  InvoicesQuery,
} from '../domain/models/billing.models';
import {
  BillingListDto,
  BillingOverviewDto,
  PlatformInvoiceDto,
} from './dtos/billing.dtos';
import { mapBillingOverview, mapInvoicesPage } from './mappers/billing.mapper';

@Injectable({ providedIn: 'root' })
export class PlatformBillingRepository {
  private readonly api = inject(ApiClient);

  // Contract notes: live Swagger was unavailable; this follows the owner billing contract area.
  overview(): Observable<BillingOverview> {
    return this.api
      .get<BillingOverviewDto>('/platform/billing/overview')
      .pipe(map(mapBillingOverview));
  }

  invoices(query: InvoicesQuery = {}): Observable<InvoicesPage> {
    return this.api
      .get<
        BillingListDto<PlatformInvoiceDto> | PlatformInvoiceDto[]
      >('/platform/invoices', toParams(query))
      .pipe(map(mapInvoicesPage));
  }
}

const toParams = (query: InvoicesQuery): Record<string, string | number> => {
  const params: Record<string, string | number> = {};
  const assign = (key: string, value: string | number | undefined) => {
    if (typeof value === 'number' || value?.toString().trim())
      params[key] = typeof value === 'string' ? value.trim() : value;
  };

  assign('tenantId', query.tenantId);
  assign('tenant', query.tenant);
  assign(
    'status',
    query.status && query.status !== 'all' ? query.status : undefined,
  );
  assign(
    'paymentStatus',
    query.paymentStatus && query.paymentStatus !== 'all'
      ? query.paymentStatus
      : undefined,
  );
  assign('dateFrom', query.dateFrom);
  assign('dateTo', query.dateTo);
  assign('page', query.page);
  assign('pageSize', query.pageSize);
  return params;
};
