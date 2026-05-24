import {
  mapPlatformOverview,
  mapPlatformRevenue,
  mapPlatformShipments,
  mapPlatformUsage,
} from './platform-analytics.mapper';

describe('platform analytics mapper', () => {
  it('maps API responses safely with camel and snake case fields', () => {
    expect(
      mapPlatformOverview({
        total_tenants: '12',
        activeTenants: 8,
        trial_tenants: 3,
        suspendedTenants: 1,
        active_merchants: '25',
        activeCouriers: 40,
        alerts: [
          {
            id: 'alert-1',
            title: 'High fraud signal',
            message: 'Review flagged shipments',
            severity: 'danger',
          },
        ],
      }),
    ).toEqual({
      totalTenants: 12,
      activeTenants: 8,
      trialTenants: 3,
      suspendedTenants: 1,
      activeMerchants: 25,
      activeCouriers: 40,
      alerts: [
        {
          id: 'alert-1',
          title: 'High fraud signal',
          message: 'Review flagged shipments',
          severity: 'danger',
        },
      ],
    });

    expect(
      mapPlatformUsage({
        total_shipments: '90',
        fraudFlaggedShipments: 2,
        top_tenants_by_shipment_volume: [
          { tenant_id: 'tenant-1', tenant_name: 'Tenant One', shipments: '70' },
        ],
      }),
    ).toEqual({
      totalShipments: 90,
      fraudFlaggedShipments: 2,
      topTenantsByShipmentVolume: [
        { tenantId: 'tenant-1', tenantName: 'Tenant One', shipmentCount: 70 },
      ],
    });

    expect(mapPlatformRevenue({ cod_volume: '1200', payoutVolume: 600 })).toEqual({
      codVolume: 1200,
      payoutVolume: 600,
    });

    expect(
      mapPlatformShipments({ totalShipments: '44', fraud_flagged_shipments: '5' }),
    ).toEqual({
      totalShipments: 44,
      fraudFlaggedShipments: 5,
    });
  });

  it('falls back to safe empty values for malformed responses', () => {
    expect(mapPlatformOverview(undefined)).toEqual({
      totalTenants: 0,
      activeTenants: 0,
      trialTenants: 0,
      suspendedTenants: 0,
      activeMerchants: 0,
      activeCouriers: 0,
      alerts: [],
    });

    expect(mapPlatformUsage({ topTenantsByShipmentVolume: 'bad-data' })).toEqual({
      totalShipments: 0,
      fraudFlaggedShipments: 0,
      topTenantsByShipmentVolume: [],
    });
  });
});
