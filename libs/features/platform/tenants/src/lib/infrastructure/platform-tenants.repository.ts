import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import {
  Tenant,
  TenantBillingSummary,
  TenantFeatureFlagSummary,
  TenantListQuery,
  TenantListResult,
  TenantMutationInput,
  TenantStatus,
  TenantUsage,
  TenantUserSummary,
} from '../domain/models/tenant.models';
import {
  TenantBillingDto,
  TenantDto,
  TenantFeatureFlagDto,
  TenantListResponseDto,
  TenantMutationDto,
  TenantUsageDto,
  TenantUserDto,
} from './dtos/tenant.dtos';
import {
  mapTenant,
  mapTenantBilling,
  mapTenantFeatureFlags,
  mapTenantList,
  mapTenantUsage,
  mapTenantUsers,
} from './mappers/tenant.mapper';

@Injectable({ providedIn: 'root' })
export class PlatformTenantsRepository {
  private readonly api = inject(ApiClient);

  listTenants(query: TenantListQuery): Observable<TenantListResult> {
    return this.api
      .get<TenantListResponseDto | TenantDto[]>('/platform/tenants', cleanQuery(query))
      .pipe(map(mapTenantList));
  }

  createTenant(input: TenantMutationInput): Observable<Tenant> {
    return this.api
      .post<TenantDto>('/platform/tenants', toMutationDto(input))
      .pipe(map(mapTenant));
  }

  getTenant(id: string): Observable<Tenant> {
    return this.api.get<TenantDto>(`/platform/tenants/${id}`).pipe(map(mapTenant));
  }

  updateTenant(id: string, input: TenantMutationInput): Observable<Tenant> {
    return this.api
      .patch<TenantDto>(`/platform/tenants/${id}`, toMutationDto(input))
      .pipe(map(mapTenant));
  }

  changeStatus(id: string, status: TenantStatus, reason: string): Observable<Tenant> {
    return this.api
      .patch<TenantDto>(`/platform/tenants/${id}/status`, { status, reason })
      .pipe(map(mapTenant));
  }

  getUsage(id: string): Observable<TenantUsage> {
    return this.api
      .get<TenantUsageDto>(`/platform/tenants/${id}/usage`)
      .pipe(map(mapTenantUsage));
  }

  getUsers(id: string): Observable<TenantUserSummary[]> {
    return this.api
      .get<TenantUserDto[] | { items?: TenantUserDto[]; data?: TenantUserDto[] }>(`/platform/tenants/${id}/users`)
      .pipe(map(mapTenantUsers));
  }

  getBilling(id: string): Observable<TenantBillingSummary> {
    return this.api
      .get<TenantBillingDto>(`/platform/tenants/${id}/billing`)
      .pipe(map(mapTenantBilling));
  }

  getFeatureFlags(id: string): Observable<TenantFeatureFlagSummary[]> {
    return this.api
      .get<TenantFeatureFlagDto[] | { items?: TenantFeatureFlagDto[]; data?: TenantFeatureFlagDto[] }>(
        `/platform/tenants/${id}/feature-flags`,
      )
      .pipe(map(mapTenantFeatureFlags));
  }
}

const toMutationDto = (input: TenantMutationInput): TenantMutationDto => ({
  name: input.name.trim(),
  slug: input.slug.trim(),
  email: input.email.trim(),
  ...(input.planId?.trim() ? { planId: input.planId.trim() } : {}),
});

const cleanQuery = (query: TenantListQuery): Record<string, string | number> =>
  Object.entries(query).reduce<Record<string, string | number>>((params, [key, value]) => {
    if (value !== undefined && value !== '') {
      params[key] = value;
    }
    return params;
  }, {});
