import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PlatformAnalyticsRepository } from '@trackora/platform-overview';
import { OverviewPageComponent } from './overview-page.component';

describe('OverviewPageComponent', () => {
  it('renders overview stat cards with API values', async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewPageComponent],
      providers: [
        { provide: PlatformAnalyticsRepository, useValue: repository() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OverviewPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('لوحة مؤشرات المنصة');
    expect(text).toContain('إجمالي المستأجرين');
    expect(text).toContain('12');
    expect(text).toContain('المستأجرون النشطون');
    expect(text).toContain('9');
    expect(text).toContain('Tenant Alpha');
    expect(text).toContain('COD drift');
  });

  it('renders empty states for empty tenants and alerts', async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewPageComponent],
      providers: [
        {
          provide: PlatformAnalyticsRepository,
          useValue: repository({ empty: true }),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OverviewPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('لا توجد بيانات مستأجرين');
    expect(text).toContain('لا توجد تنبيهات');
  });
});

interface RepositoryOptions {
  empty?: boolean;
}

const repository = (
  options: RepositoryOptions = {},
): PlatformAnalyticsRepository =>
  ({
    getOverview: () =>
      of({
        totalTenants: 12,
        activeTenants: 9,
        trialTenants: 2,
        suspendedTenants: 1,
        activeMerchants: 24,
        activeCouriers: 51,
        alerts: options.empty
          ? []
          : [
              {
                id: 'alert-1',
                title: 'COD drift',
                message: 'COD increased over the daily threshold.',
                severity: 'warning',
              },
            ],
      }),
    getUsage: () =>
      of({
        totalShipments: 800,
        fraudFlaggedShipments: 4,
        topTenantsByShipmentVolume: options.empty
          ? []
          : [
              {
                tenantId: 'tenant-alpha',
                tenantName: 'Tenant Alpha',
                shipmentCount: 220,
              },
            ],
      }),
    getRevenue: () => of({ codVolume: 100000, payoutVolume: 65000 }),
    getShipments: () => of({ totalShipments: 810, fraudFlaggedShipments: 5 }),
  }) as PlatformAnalyticsRepository;
