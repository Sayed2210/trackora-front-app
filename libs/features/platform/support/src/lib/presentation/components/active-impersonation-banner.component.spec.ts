import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AuthService, TokenStorageService } from '@trackora/core/auth';
import { AuthRepository } from '@trackora/shared/data-access';
import { of } from 'rxjs';
import { PlatformSupportRepository } from '../../infrastructure/platform-support.repository';
import { ActiveImpersonationBannerComponent } from './active-impersonation-banner.component';

describe('ActiveImpersonationBannerComponent', () => {
  it('renders active impersonation context and ends impersonation', async () => {
    const repository = { endImpersonation: vi.fn(() => of(undefined)) };
    const fixture = await createComponent(repository);

    expect(fixture.nativeElement.textContent).toContain('Acme');
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();

    expect(repository.endImpersonation).toHaveBeenCalled();
  });
});

const createComponent = async (repository: unknown) => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [ActiveImpersonationBannerComponent],
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
        useValue: { user: () => user, setUser: vi.fn() },
      },
    ],
  });
  const fixture = TestBed.createComponent(ActiveImpersonationBannerComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
};

const user = {
  id: 'u1',
  name: 'Owner',
  roles: [],
  permissions: [],
  impersonationContext: {
    tenantId: 't1',
    tenantName: 'Acme',
    userName: 'Tenant Admin',
    role: 'ADMIN',
  },
};
