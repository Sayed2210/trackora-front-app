import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OverviewFacade } from './overview.facade';
import { PlatformAnalyticsRepository } from '../infrastructure/platform-analytics.repository';

describe('OverviewFacade', () => {
  it('loads independent analytics sections into signal state', async () => {
    const facade = createFacade();

    await Promise.all([
      facade.loadOverview(),
      facade.loadUsage(),
      facade.loadRevenue(),
      facade.loadShipments(),
    ]);

    expect(facade.overview().data?.totalTenants).toBe(10);
    expect(facade.usage().data?.totalShipments).toBe(99);
    expect(facade.revenue().data?.codVolume).toBe(5000);
    expect(facade.shipments().data?.fraudFlaggedShipments).toBe(6);
    expect(facade.hasAnyData()).toBe(true);
    expect(facade.allFailed()).toBe(false);
  });

  it('stores user-safe section errors without throwing', async () => {
    const facade = createFacade({ failOverview: true });

    await facade.loadOverview();

    expect(facade.overview().data).toBeNull();
    expect(facade.overview().error).toContain('تعذر تحميل');
  });

  it('detects page-level failure when every endpoint fails', async () => {
    const facade = createFacade({
      failOverview: true,
      failUsage: true,
      failRevenue: true,
      failShipments: true,
    });

    await Promise.all([
      facade.loadOverview(),
      facade.loadUsage(),
      facade.loadRevenue(),
      facade.loadShipments(),
    ]);

    expect(facade.allFailed()).toBe(true);
  });
});

interface RepositoryOptions {
  failOverview?: boolean;
  failUsage?: boolean;
  failRevenue?: boolean;
  failShipments?: boolean;
}

const createRepository = (options: RepositoryOptions = {}): PlatformAnalyticsRepository =>
  ({
    getOverview: () =>
      options.failOverview
        ? throwError(() => new Error('private backend error'))
        : of({
            totalTenants: 10,
            activeTenants: 8,
            trialTenants: 1,
            suspendedTenants: 1,
            activeMerchants: 30,
            activeCouriers: 40,
            alerts: [],
          }),
    getUsage: () =>
      options.failUsage
        ? throwError(() => new Error('private backend error'))
        : of({
            totalShipments: 99,
            fraudFlaggedShipments: 5,
            topTenantsByShipmentVolume: [],
          }),
    getRevenue: () =>
      options.failRevenue
        ? throwError(() => new Error('private backend error'))
        : of({ codVolume: 5000, payoutVolume: 3200 }),
    getShipments: () =>
      options.failShipments
        ? throwError(() => new Error('private backend error'))
        : of({ totalShipments: 101, fraudFlaggedShipments: 6 }),
  }) as PlatformAnalyticsRepository;

const createFacade = (options: RepositoryOptions = {}): OverviewFacade => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      OverviewFacade,
      { provide: PlatformAnalyticsRepository, useValue: createRepository(options) },
    ],
  });

  return TestBed.inject(OverviewFacade);
};
