import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import {
  PlatformOverviewSummary,
  PlatformRevenueSummary,
  PlatformShipmentsSummary,
  PlatformUsageSummary,
} from '../domain/models/platform-overview.models';
import {
  PlatformAnalyticsOverviewDto,
  PlatformAnalyticsRevenueDto,
  PlatformAnalyticsShipmentsDto,
  PlatformAnalyticsUsageDto,
} from './dtos/platform-analytics.dtos';
import {
  mapPlatformOverview,
  mapPlatformRevenue,
  mapPlatformShipments,
  mapPlatformUsage,
} from './mappers/platform-analytics.mapper';

@Injectable({ providedIn: 'root' })
export class PlatformAnalyticsRepository {
  private readonly api = inject(ApiClient);

  getOverview(): Observable<PlatformOverviewSummary> {
    return this.api
      .get<PlatformAnalyticsOverviewDto>('/platform/analytics/overview')
      .pipe(map(mapPlatformOverview));
  }

  getUsage(): Observable<PlatformUsageSummary> {
    return this.api
      .get<PlatformAnalyticsUsageDto>('/platform/analytics/usage')
      .pipe(map(mapPlatformUsage));
  }

  getRevenue(): Observable<PlatformRevenueSummary> {
    return this.api
      .get<PlatformAnalyticsRevenueDto>('/platform/analytics/revenue')
      .pipe(map(mapPlatformRevenue));
  }

  getShipments(): Observable<PlatformShipmentsSummary> {
    return this.api
      .get<PlatformAnalyticsShipmentsDto>('/platform/analytics/shipments')
      .pipe(map(mapPlatformShipments));
  }
}
