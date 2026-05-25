import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TenantsFacade } from './tenants.facade';
import { PlatformTenantsRepository } from '../infrastructure/platform-tenants.repository';

describe('TenantsFacade', () => {
  it('handles loading data and user-safe errors', async () => {
    const facade = createFacade();
    await facade.loadList({ page: 1, pageSize: 10 });
    expect(facade.list().data?.items[0].name).toBe('Acme');
    expect(facade.hasTenants()).toBe(true);

    const failed = createFacade(true);
    await failed.loadList({ page: 1, pageSize: 10 });
    expect(failed.list().data).toBeNull();
    expect(failed.list().error).toContain('تعذر');
  });

  it('requires a reason before status changes', async () => {
    const repository = createRepository(false);
    const facade = createFacade(false, repository);

    const result = await facade.changeStatus('t1', 'SUSPENDED', '');

    expect(result).toBeNull();
    expect(facade.mutationError()).toContain('مطلوب');
    expect(repository.changeStatus).not.toHaveBeenCalled();
  });
});

const createRepository = (fail = false) =>
  ({
    listTenants: vi.fn(() =>
      fail
        ? throwError(() => new Error('private backend error'))
        : of({ items: [{ id: 't1', name: 'Acme', slug: 'acme', email: 'owner@acme.test', status: 'ACTIVE' }], total: 1, page: 1, pageSize: 10 }),
    ),
    changeStatus: vi.fn(() => of({ id: 't1', name: 'Acme', slug: 'acme', email: 'owner@acme.test', status: 'SUSPENDED' })),
  }) as unknown as PlatformTenantsRepository;

const createFacade = (fail = false, repository = createRepository(fail)): TenantsFacade => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [TenantsFacade, { provide: PlatformTenantsRepository, useValue: repository }] });
  return TestBed.inject(TenantsFacade);
};
