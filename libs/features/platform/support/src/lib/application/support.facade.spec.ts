import { TestBed } from '@angular/core/testing';
import { AuthService, TokenStorageService } from '@trackora/core/auth';
import { AuthRepository } from '@trackora/shared/data-access';
import { of, throwError } from 'rxjs';
import { PlatformSupportRepository } from '../infrastructure/platform-support.repository';
import { SupportFacade } from './support.facade';

describe('SupportFacade', () => {
  it('handles tenant search loading and data state', async () => {
    const repository = { searchTenants: vi.fn(() => of(searchPage)) };
    const facade = createFacade(repository);

    await facade.searchTenants({ query: 'Acme' });

    expect(repository.searchTenants).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'Acme' }),
    );
    expect(facade.items()[0].name).toBe('Acme');
    expect(facade.emptySearch()).toBe(false);
  });

  it('requires reason before starting impersonation', async () => {
    const repository = { startImpersonation: vi.fn() };
    const facade = createFacade(repository);

    await facade.startImpersonation('t1', '   ');

    expect(repository.startImpersonation).not.toHaveBeenCalled();
    expect(facade.mutation().error).toContain('مطلوب');
  });

  it('starts and ends impersonation while refreshing auth context', async () => {
    const repository = {
      startImpersonation: vi.fn(() =>
        of({
          accessToken: 'new-token',
          impersonationContext: {
            active: true,
            tenantId: 't1',
            tenantName: 'Acme',
            userId: '',
            userName: '',
            userEmail: '',
            role: 'ADMIN',
            startedAt: null,
          },
        }),
      ),
      endImpersonation: vi.fn(() => of(undefined)),
    };
    const authRepository = { me: vi.fn(() => of(user)) };
    const tokenStorage = { setAccessToken: vi.fn(), setRefreshToken: vi.fn() };
    const facade = createFacade(repository, authRepository, tokenStorage);

    await facade.startImpersonation('t1', 'support case');
    await facade.endImpersonation();

    expect(repository.startImpersonation).toHaveBeenCalledWith(
      't1',
      'support case',
    );
    expect(repository.endImpersonation).toHaveBeenCalled();
    expect(authRepository.me).toHaveBeenCalledTimes(2);
    expect(tokenStorage.setAccessToken).toHaveBeenCalledWith('new-token');
  });

  it('maps API failures to user-safe errors', async () => {
    const facade = createFacade({
      searchTenants: () => throwError(() => new Error('private')),
    });

    await facade.searchTenants();

    expect(facade.search().error).toContain('تعذر تحميل');
  });
});

const createFacade = (
  repository: unknown,
  authRepository: unknown = { me: () => of(user) },
  tokenStorage: unknown = { setAccessToken: vi.fn(), setRefreshToken: vi.fn() },
): SupportFacade => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      SupportFacade,
      { provide: PlatformSupportRepository, useValue: repository },
      { provide: AuthRepository, useValue: authRepository },
      { provide: TokenStorageService, useValue: tokenStorage },
      {
        provide: AuthService,
        useValue: { user: () => user, setUser: vi.fn() },
      },
    ],
  });
  return TestBed.inject(SupportFacade);
};

const user = {
  id: 'u1',
  name: 'Owner',
  roles: [],
  permissions: [],
  impersonationContext: { tenantId: 't1' },
};
const searchPage = {
  items: [
    {
      id: 't1',
      name: 'Acme',
      slug: 'acme',
      email: '',
      phone: '',
      status: 'ACTIVE' as const,
      planName: '',
      subscriptionStatus: '',
      paymentStatus: '',
      createdAt: null,
      updatedAt: null,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};
