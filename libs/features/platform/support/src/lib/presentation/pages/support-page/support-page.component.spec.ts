import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AuthService, TokenStorageService } from '@trackora/core/auth';
import { AuthRepository } from '@trackora/shared/data-access';
import { Permission } from '@trackora/shared/domain';
import { of, throwError } from 'rxjs';
import { PlatformSupportRepository } from '../../../infrastructure/platform-support.repository';
import { SupportPageComponent } from './support-page.component';

describe('SupportPageComponent', () => {
  it('renders search data and opens confirmation before reason', async () => {
    const fixture = await createComponent({
      searchTenants: () => of(searchPage),
    });

    expect(fixture.nativeElement.textContent).toContain('Acme');
    fixture.nativeElement
      .querySelector('button.support-action--warning')
      .click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('تأكيد بدء الانتحال');
    fixture.nativeElement.querySelector('.dialog__button--primary').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('سبب بدء الانتحال');
  });

  it('renders empty and error states', async () => {
    const emptyFixture = await createComponent({
      searchTenants: () => of({ ...searchPage, items: [], total: 0 }),
    });
    expect(emptyFixture.nativeElement.textContent).toContain(
      'لا توجد نتائج دعم',
    );

    const errorFixture = await createComponent({
      searchTenants: () => throwError(() => new Error('private')),
    });
    expect(errorFixture.nativeElement.textContent).toContain(
      'تعذر تحميل نتائج الدعم',
    );
  });
});

const createComponent = async (repository: unknown) => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [SupportPageComponent],
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
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(SupportPageComponent);
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
const searchPage = {
  items: [
    {
      id: 't1',
      name: 'Acme',
      slug: 'acme',
      email: 'ops@test.com',
      phone: '',
      status: 'ACTIVE' as const,
      planName: 'Pro',
      subscriptionStatus: 'ACTIVE',
      paymentStatus: 'PAID',
      createdAt: null,
      updatedAt: null,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};
