import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AuthService, TokenStorageService } from '@trackora/core/auth';
import { AuthRepository } from '@trackora/shared/data-access';
import { Permission } from '@trackora/shared/domain';
import { of } from 'rxjs';
import { PlatformSupportRepository } from '../../../infrastructure/platform-support.repository';
import { TenantHealthPageComponent } from './tenant-health-page.component';

describe('TenantHealthPageComponent', () => {
  it('renders safe tenant health data and impersonation confirmation', async () => {
    const fixture = await createComponent();

    expect(fixture.nativeElement.textContent).toContain('Acme');
    expect(fixture.nativeElement.textContent).toContain('تحذيرات الاستخدام');
    fixture.nativeElement
      .querySelector('button.support-action--warning')
      .click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('تأكيد بدء الانتحال');
  });
});

const createComponent = async () => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [TenantHealthPageComponent],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: { get: () => 't1' } } },
      },
      {
        provide: PlatformSupportRepository,
        useValue: { tenantHealth: () => of(health) },
      },
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
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(TenantHealthPageComponent);
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
};
const health = {
  tenant: {
    id: 't1',
    name: 'Acme',
    slug: 'acme',
    email: '',
    phone: '',
    status: 'ACTIVE' as const,
    planName: 'Pro',
    subscriptionStatus: 'ACTIVE',
    paymentStatus: 'PAID',
    createdAt: null,
    updatedAt: null,
  },
  subscriptionStatus: 'ACTIVE',
  paymentStatus: 'PAID',
  usageWarnings: [{ label: 'API', value: '80%', status: 'warning' }],
  featureFlags: [],
  recentAlerts: [],
  metadata: [],
};
