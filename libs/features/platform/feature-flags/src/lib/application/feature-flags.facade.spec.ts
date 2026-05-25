import { TestBed } from '@angular/core/testing';
import { ApiClientError } from '@trackora/core/api';
import { of, throwError } from 'rxjs';
import { PlatformFeatureFlagsRepository } from '../infrastructure/platform-feature-flags.repository';
import { FeatureFlagsFacade } from './feature-flags.facade';

describe('FeatureFlagsFacade', () => {
  it('handles loading, data, and user-safe errors', async () => {
    const facade = createFacade();
    await facade.loadGlobal();
    await facade.loadTenant('tenant-1');

    expect(facade.globalFlags()[0].key).toBe('smart_dispatch');
    expect(facade.tenantFlags()[0].effectiveValue).toBe(true);

    const failingFacade = createFacade({ failLoad: true });
    await failingFacade.loadGlobal();
    expect(failingFacade.global().error).toContain('تعذر تحميل');
  });

  it('requires reason for mutations', async () => {
    const facade = createFacade();

    expect(await facade.setGlobal('smart_dispatch', false, '')).toBe(false);
    expect(facade.global().error).toContain('سبب');
    expect(await facade.setTenantOverride('tenant-1', 'api_access', true, '')).toBe(false);
    expect(facade.tenant().error).toContain('سبب');
  });

  it('refreshes after success and maps API errors safely', async () => {
    const facade = createFacade();
    expect(await facade.setTenantOverride('tenant-1', 'api_access', null, 'restore inheritance')).toBe(true);
    expect(facade.tenant().error).toBeNull();

    const failingFacade = createFacade({ failMutation: true });
    expect(await failingFacade.setGlobal('smart_dispatch', false, 'rollback')).toBe(false);
    expect(failingFacade.global().error).toContain('تعارض');
  });
});

const globalFlags = [{ key: 'smart_dispatch', name: 'Smart Dispatch', description: 'Auto assign', enabled: true }];
const tenantFlags = [{ key: 'api_access', name: 'API Access', description: '', globalValue: true, planValue: true, overrideValue: null, effectiveValue: true }];

const createFacade = (options: { failLoad?: boolean; failMutation?: boolean } = {}): FeatureFlagsFacade => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      FeatureFlagsFacade,
      {
        provide: PlatformFeatureFlagsRepository,
        useValue: {
          listGlobal: () => (options.failLoad ? throwError(() => new Error('private')) : of(globalFlags)),
          listTenant: () => (options.failLoad ? throwError(() => new Error('private')) : of(tenantFlags)),
          updateGlobal: () => (options.failMutation ? throwError(() => new ApiClientError({ code: 'CONFLICT', message: 'private' }, 409)) : of(globalFlags)),
          updateTenant: () => (options.failMutation ? throwError(() => new ApiClientError({ code: 'CONFLICT', message: 'private' }, 409)) : of(tenantFlags)),
        },
      },
    ],
  });
  return TestBed.inject(FeatureFlagsFacade);
};
