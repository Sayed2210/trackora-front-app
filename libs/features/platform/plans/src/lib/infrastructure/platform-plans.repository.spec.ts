import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { PlatformPlansRepository } from './platform-plans.repository';

describe('PlatformPlansRepository', () => {
  it('maps list and detail responses', () => {
    const api = {
      get: vi.fn((path: string) =>
        of(
          path === '/platform/plans'
            ? { items: [{ id: 'starter', name: 'Starter', price: '0', yearlyPrice: null, isPublic: true, isPopular: false, sortOrder: 1, feature_entitlements: ['api_access'] }], total: 1 }
            : { id: 'pro', name: 'Pro', price: 250, yearlyPrice: 2500, isPublic: true, isPopular: true, sortOrder: 2, limits: { max_admins: 3 } },
        ),
      ),
    } as unknown as ApiClient;

    TestBed.configureTestingModule({ providers: [PlatformPlansRepository, { provide: ApiClient, useValue: api }] });
    const repository = TestBed.inject(PlatformPlansRepository);

    repository.list({ search: 'starter' }).subscribe((page) => {
      expect(page.items[0].name).toBe('Starter');
      expect(page.items[0].entitlements).toEqual(['api_access']);
      expect(page.items[0].isPublic).toBe(true);
    });
    repository.get('pro').subscribe((plan) => {
      expect(plan.limits.maxAdmins).toBe(3);
      expect(plan.yearlyPrice).toBe(2500);
      expect(plan.isPopular).toBe(true);
      expect(plan.sortOrder).toBe(2);
    });

    expect(api.get).toHaveBeenCalledWith('/platform/plans', expect.objectContaining({ search: 'starter' }));
    expect(api.get).toHaveBeenCalledWith('/platform/plans/pro');
  });

  it('sends create payload with correct field names', () => {
    TestBed.resetTestingModule();
    const api = {
      post: vi.fn(() => of({ id: 'growth', name: 'Growth', price: 150 })),
    } as unknown as ApiClient;

    TestBed.configureTestingModule({ providers: [PlatformPlansRepository, { provide: ApiClient, useValue: api }] });
    const repository = TestBed.inject(PlatformPlansRepository);

    repository.create({
      name: 'Growth',
      price: 150,
      yearlyPrice: 1500,
      currency: 'egp',
      limits: { monthlyShipments: null, maxAdmins: null, maxMerchants: null, maxCouriers: null },
      entitlements: ['api_access', 'fraud_detection'],
      active: true,
      isPublic: true,
      isPopular: true,
      sortOrder: 3,
    }).subscribe();

    expect(api.post).toHaveBeenCalledWith('/platform/plans', expect.objectContaining({
      slug: 'growth',
      monthlyPrice: '150',
      yearlyPrice: '1500',
      isPublic: true,
      isPopular: true,
      sortOrder: 3,
      featureEntitlements: [
        { key: 'smart_dispatch', enabled: false },
        { key: 'fraud_detection', enabled: true },
        { key: 'cod_wallet', enabled: false },
        { key: 'bulk_upload', enabled: false },
        { key: 'whatsapp_notifications', enabled: false },
        { key: 'api_access', enabled: true },
        { key: 'public_tracking', enabled: false },
        { key: 'advanced_reports', enabled: false },
      ],
    }));
  });
});
