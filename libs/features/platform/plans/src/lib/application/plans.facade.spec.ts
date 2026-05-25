import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ApiClientError } from '@trackora/core/api';
import { PlansFacade } from './plans.facade';
import { PlatformPlansRepository } from '../infrastructure/platform-plans.repository';

describe('PlansFacade', () => {
  it('loads plans into signal state', async () => {
    const facade = createFacade();
    await facade.loadList();
    expect(facade.plans()[0].name).toBe('Starter');
    expect(facade.empty()).toBe(false);
  });

  it('stores user-safe load errors', async () => {
    const facade = createFacade({ failList: true });
    await facade.loadList();
    expect(facade.list().error).toContain('تعذر تحميل');
  });

  it('renders a safe 409 archive conflict', async () => {
    const facade = createFacade({ conflictDelete: true });
    const archived = await facade.archive('starter');
    expect(archived).toBe(false);
    expect(facade.list().error).toContain('اشتراكات حالية');
  });
});

const plan = {
  id: 'starter',
  name: 'Starter',
  code: 'starter',
  description: '',
  price: 0,
  currency: 'EGP',
  billingCycle: 'monthly',
  limits: { monthlyShipments: 100, maxAdmins: 1, maxMerchants: 1, maxCouriers: 1 },
  entitlements: [],
  active: true,
  archived: false,
  subscriptionCount: null,
  createdAt: null,
  updatedAt: null,
};

const createFacade = (options: { failList?: boolean; conflictDelete?: boolean } = {}): PlansFacade => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      PlansFacade,
      {
        provide: PlatformPlansRepository,
        useValue: {
          list: () => (options.failList ? throwError(() => new Error('private')) : of({ items: [plan], total: 1, page: 1, pageSize: 20 })),
          delete: () =>
            options.conflictDelete
              ? throwError(() => new ApiClientError({ code: 'CONFLICT', message: 'referenced' }, 409))
              : of(undefined),
        },
      },
    ],
  });
  return TestBed.inject(PlansFacade);
};
