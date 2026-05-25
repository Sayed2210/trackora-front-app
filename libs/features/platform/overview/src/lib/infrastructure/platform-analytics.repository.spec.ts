import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { PlatformAnalyticsRepository } from './platform-analytics.repository';

describe('PlatformAnalyticsRepository', () => {
  it('calls platform analytics endpoints and maps responses', () => {
    const api = {
      get: vi.fn((path: string) => {
        const responses: Record<string, unknown> = {
          '/platform/analytics/overview': { totalTenants: 3 },
          '/platform/analytics/usage': { totalShipments: 20 },
          '/platform/analytics/revenue': { codVolume: 1000 },
          '/platform/analytics/shipments': { fraudFlaggedShipments: 4 },
        };

        return of(responses[path]);
      }),
    } as unknown as ApiClient;
    TestBed.configureTestingModule({
      providers: [
        PlatformAnalyticsRepository,
        { provide: ApiClient, useValue: api },
      ],
    });
    const repository = TestBed.inject(PlatformAnalyticsRepository);

    repository.getOverview().subscribe((overview) => {
      expect(overview.totalTenants).toBe(3);
    });
    repository.getUsage().subscribe((usage) => {
      expect(usage.totalShipments).toBe(20);
    });
    repository.getRevenue().subscribe((revenue) => {
      expect(revenue.codVolume).toBe(1000);
    });
    repository.getShipments().subscribe((shipments) => {
      expect(shipments.fraudFlaggedShipments).toBe(4);
    });

    expect(api.get).toHaveBeenCalledWith('/platform/analytics/overview');
    expect(api.get).toHaveBeenCalledWith('/platform/analytics/usage');
    expect(api.get).toHaveBeenCalledWith('/platform/analytics/revenue');
    expect(api.get).toHaveBeenCalledWith('/platform/analytics/shipments');
  });
});
