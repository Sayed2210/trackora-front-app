import {
  PlatformAlert,
  PlatformOverviewSummary,
  PlatformRevenueSummary,
  PlatformShipmentsSummary,
  PlatformUsageSummary,
  TopTenantByShipmentVolume,
} from '../../domain/models/platform-overview.models';
import {
  PlatformAnalyticsOverviewDto,
  PlatformAnalyticsRecord,
  PlatformAnalyticsRevenueDto,
  PlatformAnalyticsShipmentsDto,
  PlatformAnalyticsUsageDto,
} from '../dtos/platform-analytics.dtos';

export const mapPlatformOverview = (
  dto: PlatformAnalyticsOverviewDto | null | undefined,
): PlatformOverviewSummary => {
  const source = asRecord(dto);

  return {
    totalTenants: readNumber(source, ['totalTenants', 'total_tenants']),
    activeTenants: readNumber(source, ['activeTenants', 'active_tenants']),
    trialTenants: readNumber(source, ['trialTenants', 'trial_tenants']),
    suspendedTenants: readNumber(source, [
      'suspendedTenants',
      'suspended_tenants',
    ]),
    activeMerchants: readNumber(source, ['activeMerchants', 'active_merchants']),
    activeCouriers: readNumber(source, ['activeCouriers', 'active_couriers']),
    alerts: readAlerts(source['alerts']),
  };
};

export const mapPlatformUsage = (
  dto: PlatformAnalyticsUsageDto | null | undefined,
): PlatformUsageSummary => {
  const source = asRecord(dto);

  return {
    totalShipments: readNumber(source, ['totalShipments', 'total_shipments']),
    fraudFlaggedShipments: readNumber(source, [
      'fraudFlaggedShipments',
      'fraud_flagged_shipments',
    ]),
    topTenantsByShipmentVolume: readTopTenants(
      source['topTenantsByShipmentVolume'] ?? source['top_tenants_by_shipment_volume'],
    ),
  };
};

export const mapPlatformRevenue = (
  dto: PlatformAnalyticsRevenueDto | null | undefined,
): PlatformRevenueSummary => {
  const source = asRecord(dto);

  return {
    codVolume: readNumber(source, ['codVolume', 'cod_volume']),
    payoutVolume: readNumber(source, ['payoutVolume', 'payout_volume']),
  };
};

export const mapPlatformShipments = (
  dto: PlatformAnalyticsShipmentsDto | null | undefined,
): PlatformShipmentsSummary => {
  const source = asRecord(dto);

  return {
    totalShipments: readNumber(source, ['totalShipments', 'total_shipments']),
    fraudFlaggedShipments: readNumber(source, [
      'fraudFlaggedShipments',
      'fraud_flagged_shipments',
    ]),
  };
};

const readTopTenants = (value: unknown): TopTenantByShipmentVolume[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const source = asRecord(item);

    return {
      tenantId: readString(source, ['tenantId', 'tenant_id', 'id'], `tenant-${index}`),
      tenantName: readString(source, ['tenantName', 'tenant_name', 'name'], 'Unknown tenant'),
      shipmentCount: readNumber(source, [
        'shipmentCount',
        'shipment_count',
        'shipments',
      ]),
    };
  });
};

const readAlerts = (value: unknown): PlatformAlert[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const source = asRecord(item);
    const severity = readString(source, ['severity', 'level'], 'info').toLowerCase();

    return {
      id: readString(source, ['id'], `alert-${index}`),
      title: readString(source, ['title', 'name'], 'Platform alert'),
      message: readString(source, ['message', 'description'], 'Review this platform signal.'),
      severity: severity === 'danger' || severity === 'warning' ? severity : 'info',
    };
  });
};

const readNumber = (source: PlatformAnalyticsRecord, keys: string[]): number => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
};

const readString = (
  source: PlatformAnalyticsRecord,
  keys: string[],
  fallback: string,
): string => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return fallback;
};

const asRecord = (value: unknown): PlatformAnalyticsRecord => {
  if (value && typeof value === 'object') {
    return value as PlatformAnalyticsRecord;
  }

  return {};
};
