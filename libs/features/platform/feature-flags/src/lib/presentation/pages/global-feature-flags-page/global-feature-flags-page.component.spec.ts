import { TestBed } from '@angular/core/testing';
import { AuthService } from '@trackora/core/auth';
import { Permission } from '@trackora/shared/domain';
import { of } from 'rxjs';
import { PlatformFeatureFlagsRepository } from '../../../infrastructure/platform-feature-flags.repository';
import { MANAGE_FEATURE_FLAGS_PERMISSION } from '../../feature-flag-permissions';
import { GlobalFeatureFlagsPageComponent } from './global-feature-flags-page.component';

describe('GlobalFeatureFlagsPageComponent', () => {
  it('renders global flags and requires manage permission for actions', async () => {
    const fixture = await createComponent([MANAGE_FEATURE_FLAGS_PERMISSION]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('smart_dispatch');
    expect(fixture.componentInstance.canManage).toBe(true);

    const blocked = await createComponent([]);
    await blocked.whenStable();
    blocked.detectChanges();
    expect(blocked.componentInstance.canManage).toBe(false);
    expect(blocked.nativeElement.querySelector('tbody button').disabled).toBe(true);
  });

  it('opens reason dialog before mutation', async () => {
    const fixture = await createComponent([MANAGE_FEATURE_FLAGS_PERMISSION]);
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.requestToggle(fixture.componentInstance.facade.globalFlags()[0]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('سبب تغيير Feature Flag');
  });
});

const createComponent = async (permissions: Permission[]) => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [GlobalFeatureFlagsPageComponent],
    providers: [
      { provide: AuthService, useValue: { hasPermission: (permission: Permission) => permissions.includes(permission) } },
      { provide: PlatformFeatureFlagsRepository, useValue: { listGlobal: () => of(globalFlags), updateGlobal: () => of(globalFlags) } },
    ],
  });
  const fixture = TestBed.createComponent(GlobalFeatureFlagsPageComponent);
  fixture.detectChanges();
  return fixture;
};

const globalFlags = [{ key: 'smart_dispatch', name: 'Smart Dispatch', description: 'Auto assign', enabled: true }];
