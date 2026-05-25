import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AuthService, TokenStorageService } from '@trackora/core/auth';
import { AuthRepository } from '@trackora/shared/data-access';
import { Permission } from '@trackora/shared/domain';
import { of } from 'rxjs';
import { PlatformSupportRepository } from '../../../infrastructure/platform-support.repository';
import { ImpersonationPageComponent } from './impersonation-page.component';

describe('ImpersonationPageComponent', () => {
  it('renders current context and ends after confirmation', async () => {
    const repository = { endImpersonation: vi.fn(() => of(undefined)) };
    const fixture = await createComponent(repository);

    expect(fixture.nativeElement.textContent).toContain('قواعد الأمان');
    expect(fixture.nativeElement.textContent).toContain('Acme');
    fixture.nativeElement
      .querySelector('button.support-action--warning')
      .click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.dialog__button--primary').click();
    await fixture.whenStable();

    expect(repository.endImpersonation).toHaveBeenCalled();
  });
});

const createComponent = async (repository: unknown) => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [ImpersonationPageComponent],
    providers: [
      { provide: PlatformSupportRepository, useValue: repository },
      { provide: ActivatedRoute, useValue: { snapshot: {} } },
      { provide: AuthRepository, useValue: { me: () => of(user) } },
      {
        provide: TokenStorageService,
        useValue: { setAccessToken: vi.fn(), setRefreshToken: vi.fn() },
      },
      {
        provide: AuthService,
        useValue: {
          user: () => user,
          hasPermission: (permission: Permission) =>
            permission === Permission.IMPERSONATE_TENANT_ADMIN,
          setUser: vi.fn(),
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(ImpersonationPageComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
};

const user = {
  id: 'u1',
  name: 'Owner',
  roles: [],
  permissions: [Permission.IMPERSONATE_TENANT_ADMIN],
  impersonationContext: {
    tenantId: 't1',
    tenantName: 'Acme',
    userName: 'Tenant Admin',
    role: 'ADMIN',
  },
};
