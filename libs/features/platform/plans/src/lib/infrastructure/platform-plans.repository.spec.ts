import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ApiClient } from '@trackora/core/api';
import { PlatformPlansRepository } from './platform-plans.repository';

describe('PlatformPlansRepository', () => {
  it('maps list and detail responses', () => {
    const api = {
      get: vi.fn((path: string) =>
        of(
          path === '/platform/plans'
            ? { items: [{ id: 'starter', name: 'Starter', price: '0', feature_entitlements: ['api_access'] }], total: 1 }
            : { id: 'pro', name: 'Pro', price: 250, limits: { max_admins: 3 } },
        ),
      ),
    } as unknown as ApiClient;

    TestBed.configureTestingModule({ providers: [PlatformPlansRepository, { provide: ApiClient, useValue: api }] });
    const repository = TestBed.inject(PlatformPlansRepository);

    repository.list({ search: 'starter' }).subscribe((page) => {
      expect(page.items[0].name).toBe('Starter');
      expect(page.items[0].entitlements).toEqual(['api_access']);
    });
    repository.get('pro').subscribe((plan) => {
      expect(plan.limits.maxAdmins).toBe(3);
    });

    expect(api.get).toHaveBeenCalledWith('/platform/plans', expect.objectContaining({ search: 'starter' }));
    expect(api.get).toHaveBeenCalledWith('/platform/plans/pro');
  });
});
