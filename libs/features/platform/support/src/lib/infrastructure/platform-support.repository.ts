import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@trackora/core/api';
import { map, Observable } from 'rxjs';
import {
  StartImpersonationResult,
  SupportTenantSearchPage,
  SupportTenantSearchQuery,
  TenantHealth,
} from '../domain/models/support.models';
import {
  ImpersonationResponseDto,
  SupportTenantDto,
  SupportTenantSearchDto,
  TenantHealthDto,
} from './dtos/support.dtos';
import {
  mapStartImpersonationResult,
  mapTenantHealth,
  mapTenantSearchPage,
} from './mappers/support.mapper';

@Injectable({ providedIn: 'root' })
export class PlatformSupportRepository {
  private readonly api = inject(ApiClient);

  searchTenants(
    query: SupportTenantSearchQuery = {},
  ): Observable<SupportTenantSearchPage> {
    return this.api
      .get<
        SupportTenantSearchDto<SupportTenantDto> | SupportTenantDto[]
      >('/platform/support/tenants/search', toParams(query))
      .pipe(map(mapTenantSearchPage));
  }

  tenantHealth(tenantId: string): Observable<TenantHealth> {
    return this.api
      .get<TenantHealthDto>(
        `/platform/support/tenants/${encodeURIComponent(tenantId)}/health`,
      )
      .pipe(map(mapTenantHealth));
  }

  startImpersonation(
    tenantId: string,
    reason: string,
  ): Observable<StartImpersonationResult> {
    return this.api
      .post<ImpersonationResponseDto>(
        `/platform/tenants/${encodeURIComponent(tenantId)}/impersonate`,
        {
          reason,
        },
      )
      .pipe(map(mapStartImpersonationResult));
  }

  endImpersonation(): Observable<void> {
    return this.api.post<void>('/platform/impersonation/end', {});
  }
}

const toParams = (
  query: SupportTenantSearchQuery,
): Record<string, string | number> => {
  const params: Record<string, string | number> = {};
  const term = query.query?.trim();
  if (term) params['q'] = term;
  if (term) params['query'] = term;
  if (query.page) params['page'] = query.page;
  if (query.pageSize) params['pageSize'] = query.pageSize;
  return params;
};
