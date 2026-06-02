import { of, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PlansListPageComponent } from './plans-list-page.component';
import { PlatformPlansRepository } from '../../../infrastructure/platform-plans.repository';

describe('PlansListPageComponent', () => {
  it('renders loading, empty, error, and data states through the facade', async () => {
    const fixture = await createFixture([]);
    expect(fixture.componentInstance.facade.list().loading).toBe(false);
    await fixture.componentInstance.facade.loadList();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('لا توجد خطط');

    TestBed.resetTestingModule();
    const errorFixture = await createFixture([], true);
    await errorFixture.componentInstance.facade.loadList();
    errorFixture.detectChanges();
    expect(errorFixture.nativeElement.textContent).toContain('تعذر تحميل');

    TestBed.resetTestingModule();
    const dataFixture = await createFixture([{ ...plan, name: 'Enterprise' }]);
    await dataFixture.componentInstance.facade.loadList();
    dataFixture.detectChanges();
    expect(dataFixture.nativeElement.textContent).toContain('Enterprise');
    expect(dataFixture.nativeElement.textContent).toContain('Website public');
    expect(dataFixture.nativeElement.textContent).toContain('Popular');
  });

  it('requires confirmation before archive', async () => {
    const fixture = await createFixture([plan]);
    fixture.componentInstance.handleAction(plan, { label: 'Archive', severity: 'danger' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('أرشفة الخطة؟');
  });
});

const plan = {
  id: 'starter',
  name: 'Starter',
  code: 'starter',
  description: '',
  price: 0,
  yearlyPrice: null,
  currency: 'EGP',
  billingCycle: 'monthly',
  limits: { monthlyShipments: 100, maxAdmins: 1, maxMerchants: 1, maxCouriers: 1 },
  entitlements: [],
  active: true,
  isPublic: true,
  isPopular: true,
  sortOrder: 1,
  archived: false,
  subscriptionCount: null,
  createdAt: null,
  updatedAt: null,
};

const createFixture = async (items: typeof plan[], fail = false) => {
  await TestBed.configureTestingModule({
    imports: [PlansListPageComponent],
    providers: [
      provideRouter([]),
      {
        provide: PlatformPlansRepository,
        useValue: {
          list: () => (fail ? throwError(() => new Error('private')) : of({ items, total: items.length, page: 1, pageSize: 20 })),
          delete: () => of(undefined),
        },
      },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(PlansListPageComponent);
  fixture.detectChanges();
  return fixture;
};
