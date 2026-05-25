import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@trackora/core/api';
import { of } from 'rxjs';
import { PlatformFeatureFlagsRepository } from './platform-feature-flags.repository';

describe('PlatformFeatureFlagsRepository', () => {
  it('maps global flags response and mutation endpoint', () => {
    const api = {
      get: vi.fn(() => of({ items: [{ key: 'smart_dispatch', label: 'Smart Dispatch', description: 'Auto assign', enabled: true }] })),
      patch: vi.fn(() => of({ items: [{ key: 'smart_dispatch', enabled: false }] })),
    } as unknown as ApiClient;

    TestBed.configureTestingModule({ providers: [PlatformFeatureFlagsRepository, { provide: ApiClient, useValue: api }] });
    const repository = TestBed.inject(PlatformFeatureFlagsRepository);

    repository.listGlobal().subscribe((flags) => {
      expect(flags[0]).toEqual({ key: 'smart_dispatch', name: 'Smart Dispatch', description: 'Auto assign', enabled: true });
    });
    repository.updateGlobal('smart_dispatch', false, 'risk rollback').subscribe();

    expect(api.get).toHaveBeenCalledWith('/platform/feature-flags');
    expect(api.patch).toHaveBeenCalledWith('/platform/feature-flags/smart_dispatch', { enabled: false, reason: 'risk rollback' });
  });

  it('maps tenant flags response and inherit null reset payload', () => {
    const api = {
      get: vi.fn(() => of({ data: [{ key: 'api_access', globalValue: true, planValue: false, overrideValue: null, effectiveValue: false }] })),
      patch: vi.fn(() => of({ data: [{ key: 'api_access', overrideValue: null }] })),
    } as unknown as ApiClient;

    TestBed.configureTestingModule({ providers: [PlatformFeatureFlagsRepository, { provide: ApiClient, useValue: api }] });
    const repository = TestBed.inject(PlatformFeatureFlagsRepository);

    repository.listTenant('tenant-1').subscribe((flags) => {
      expect(flags[0].globalValue).toBe(true);
      expect(flags[0].planValue).toBe(false);
      expect(flags[0].overrideValue).toBeNull();
      expect(flags[0].effectiveValue).toBe(false);
    });
    repository.updateTenant('tenant-1', 'api_access', null, 'restore inheritance').subscribe();

    expect(api.get).toHaveBeenCalledWith('/platform/tenants/tenant-1/feature-flags');
    expect(api.patch).toHaveBeenCalledWith('/platform/tenants/tenant-1/feature-flags/api_access', { override: null, reason: 'restore inheritance' });
  });
});
