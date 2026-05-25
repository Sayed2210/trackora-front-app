import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { PlatformTenantsRepository } from './platform-tenants.repository';

describe('PlatformTenantsRepository', () => {
  it('maps tenant list responses and sends safe query params', () => {
    const api = {
      get: vi.fn(() =>
        of({
          items: [{ id: 't1', name: 'Acme', slug: 'acme', ownerEmail: 'owner@acme.test', status: 'ACTIVE' }],
          total: 1,
          page: 2,
          pageSize: 10,
        }),
      ),
    } as unknown as ApiClient;
    TestBed.configureTestingModule({ providers: [PlatformTenantsRepository, { provide: ApiClient, useValue: api }] });

    TestBed.inject(PlatformTenantsRepository)
      .listTenants({ page: 2, pageSize: 10, search: 'acme', status: '', sortBy: 'createdAt', sortDirection: 'desc' })
      .subscribe((result) => {
        expect(result.items[0].email).toBe('owner@acme.test');
        expect(result.items[0].status).toBe('ACTIVE');
        expect(result.total).toBe(1);
      });

    expect(api.get).toHaveBeenCalledWith('/platform/tenants', {
      page: 2,
      pageSize: 10,
      search: 'acme',
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });
  });
});
