import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@trackora/core/api';
import { of } from 'rxjs';
import { PlatformSupportRepository } from './platform-support.repository';

describe('PlatformSupportRepository', () => {
  it('maps tenant search response and sends supported query params', () => {
    const api = {
      get: vi.fn(() => of({ data: [{ id: 't1', name: 'Acme' }], total: 1 })),
    } as unknown as ApiClient;
    const repository = createRepository(api);

    repository
      .searchTenants({ query: 'Acme', page: 2, pageSize: 20 })
      .subscribe((page) => {
        expect(page.items[0].name).toBe('Acme');
        expect(page.total).toBe(1);
      });

    expect(api.get).toHaveBeenCalledWith('/platform/support/tenants/search', {
      q: 'Acme',
      query: 'Acme',
      page: 2,
      pageSize: 20,
    });
  });

  it('maps tenant health and calls impersonation endpoints', () => {
    const api = {
      get: vi.fn(() => of({ tenant: { id: 't1', name: 'Acme' } })),
      post: vi.fn(() => of({ impersonationContext: { tenantId: 't1' } })),
    } as unknown as ApiClient;
    const repository = createRepository(api);

    repository
      .tenantHealth('t1')
      .subscribe((health) => expect(health.tenant.name).toBe('Acme'));
    repository.startImpersonation('t1', 'support case').subscribe((result) => {
      expect(result.impersonationContext?.tenantId).toBe('t1');
    });
    repository.endImpersonation().subscribe();

    expect(api.get).toHaveBeenCalledWith('/platform/support/tenants/t1/health');
    expect(api.post).toHaveBeenCalledWith('/platform/tenants/t1/impersonate', {
      reason: 'support case',
    });
    expect(api.post).toHaveBeenCalledWith('/platform/impersonation/end', {});
  });
});

const createRepository = (api: ApiClient): PlatformSupportRepository => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      PlatformSupportRepository,
      { provide: ApiClient, useValue: api },
    ],
  });
  return TestBed.inject(PlatformSupportRepository);
};
