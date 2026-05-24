export interface PlatformOverviewSummary {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  activeMerchants: number;
  activeCouriers: number;
  alerts: PlatformAlert[];
}

export interface PlatformUsageSummary {
  totalShipments: number;
  fraudFlaggedShipments: number;
  topTenantsByShipmentVolume: TopTenantByShipmentVolume[];
}

export interface PlatformRevenueSummary {
  codVolume: number;
  payoutVolume: number;
}

export interface PlatformShipmentsSummary {
  totalShipments: number;
  fraudFlaggedShipments: number;
}

export interface TopTenantByShipmentVolume {
  tenantId: string;
  tenantName: string;
  shipmentCount: number;
}

export interface PlatformAlert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface OverviewDashboardData {
  overview: PlatformOverviewSummary | null;
  usage: PlatformUsageSummary | null;
  revenue: PlatformRevenueSummary | null;
  shipments: PlatformShipmentsSummary | null;
}

export type OverviewSectionKey = keyof OverviewDashboardData;

export interface OverviewSectionState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const emptyOverviewDashboardData = (): OverviewDashboardData => ({
  overview: null,
  usage: null,
  revenue: null,
  shipments: null,
});
