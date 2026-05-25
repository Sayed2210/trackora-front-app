import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@trackora/core/api';
import { map, Observable } from 'rxjs';
import { GlobalFeatureFlag, TenantFeatureFlag } from '../domain/models/feature-flag.models';
import {
  FeatureFlagsResponseDto,
  GlobalFeatureFlagDto,
  GlobalFeatureFlagPatchDto,
  TenantFeatureFlagDto,
  TenantFeatureFlagPatchDto,
} from './dtos/feature-flag.dtos';
import { mapGlobalFeatureFlags, mapTenantFeatureFlags } from './mappers/feature-flag.mapper';

@Injectable({ providedIn: 'root' })
export class PlatformFeatureFlagsRepository {
  private readonly api = inject(ApiClient);

  listGlobal(): Observable<GlobalFeatureFlag[]> {
    return this.api
      .get<FeatureFlagsResponseDto<GlobalFeatureFlagDto> | GlobalFeatureFlagDto[]>('/platform/feature-flags')
      .pipe(map(mapGlobalFeatureFlags));
  }

  updateGlobal(key: string, enabled: boolean, reason: string): Observable<GlobalFeatureFlag[]> {
    return this.api
      .patch<FeatureFlagsResponseDto<GlobalFeatureFlagDto> | GlobalFeatureFlagDto[]>(
        `/platform/feature-flags/${key}`,
        { enabled, reason } satisfies GlobalFeatureFlagPatchDto,
      )
      .pipe(map(mapGlobalFeatureFlags));
  }

  listTenant(tenantId: string): Observable<TenantFeatureFlag[]> {
    return this.api
      .get<FeatureFlagsResponseDto<TenantFeatureFlagDto> | TenantFeatureFlagDto[]>(
        `/platform/tenants/${tenantId}/feature-flags`,
      )
      .pipe(map(mapTenantFeatureFlags));
  }

  updateTenant(tenantId: string, key: string, override: boolean | null, reason: string): Observable<TenantFeatureFlag[]> {
    return this.api
      .patch<FeatureFlagsResponseDto<TenantFeatureFlagDto> | TenantFeatureFlagDto[]>(
        `/platform/tenants/${tenantId}/feature-flags/${key}`,
        { override, reason } satisfies TenantFeatureFlagPatchDto,
      )
      .pipe(map(mapTenantFeatureFlags));
  }
}
