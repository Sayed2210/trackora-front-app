import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import { Permission } from '@trackora/shared/domain';
import { of } from 'rxjs';
import { PlatformFeatureFlagsRepository } from '../../../infrastructure/platform-feature-flags.repository';
import { MANAGE_FEATURE_FLAGS_PERMISSION } from '../../feature-flag-permissions';
import { TenantFeatureFlagsPageComponent } from './tenant-feature-flags-page.component';

describe('TenantFeatureFlagsPageComponent', () => {
  it('renders inherited, override, and effective values', async () => {
    const fixture = await createComponent([MANAGE_FEATURE_FLAGS_PERMISSION]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('api_access');
    expect(fixture.nativeElement.textContent).toContain('Inherit');
    expect(fixture.nativeElement.textContent).toContain('Enabled');
  });

  it('uses confirmation before reason for sensitive overrides', async () => {
    const fixture = await createComponent([MANAGE_FEATURE_FLAGS_PERMISSION]);
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.request(fixture.componentInstance.facade.tenantFlags()[0], false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('تأكيد Tenant Override');
  });

  it('submits inherit/null reset after reason', async () => {
    const updateTenant = vi.fn(() => of(tenantFlags));
    const fixture = await createComponent([MANAGE_FEATURE_FLAGS_PERMISSION], updateTenant);
    await fixture.whenStable();
    fixture.componentInstance.request(fixture.componentInstance.facade.tenantFlags()[0], null);
    await fixture.componentInstance.submitReason('restore inheritance');

    expect(updateTenant).toHaveBeenCalledWith('tenant-1', 'api_access', null, 'restore inheritance');
  });
});

const createComponent = async (permissions: Permission[], updateTenant = vi.fn(() => of(tenantFlags))) => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [TenantFeatureFlagsPageComponent],
    providers: [
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'tenant-1' } } } },
      { provide: AuthService, useValue: { hasPermission: (permission: Permission) => permissions.includes(permission) } },
      { provide: PlatformFeatureFlagsRepository, useValue: { listTenant: () => of(tenantFlags), updateTenant } },
    ],
  });
  const fixture = TestBed.createComponent(TenantFeatureFlagsPageComponent);
  fixture.detectChanges();
  return fixture;
};

const tenantFlags = [{ key: 'api_access', name: 'API Access', description: '', globalValue: true, planValue: true, overrideValue: null, effectiveValue: true }];
