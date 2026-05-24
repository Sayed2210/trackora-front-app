export type PlatformAnalyticsRecord = Record<string, unknown>;

export interface PlatformAnalyticsOverviewDto extends PlatformAnalyticsRecord {
  totalTenants?: unknown;
  activeTenants?: unknown;
  trialTenants?: unknown;
  suspendedTenants?: unknown;
  activeMerchants?: unknown;
  activeCouriers?: unknown;
  alerts?: unknown;
}

export interface PlatformAnalyticsUsageDto extends PlatformAnalyticsRecord {
  totalShipments?: unknown;
  fraudFlaggedShipments?: unknown;
  topTenantsByShipmentVolume?: unknown;
}

export interface PlatformAnalyticsRevenueDto extends PlatformAnalyticsRecord {
  codVolume?: unknown;
  payoutVolume?: unknown;
}

export interface PlatformAnalyticsShipmentsDto extends PlatformAnalyticsRecord {
  totalShipments?: unknown;
  fraudFlaggedShipments?: unknown;
}
