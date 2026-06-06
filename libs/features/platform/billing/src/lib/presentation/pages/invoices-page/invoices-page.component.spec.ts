import { TestBed } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';
import { PlatformBillingRepository } from '../../../infrastructure/platform-billing.repository';
import { InvoicesPageComponent } from './invoices-page.component';

describe('InvoicesPageComponent', () => {
  it('renders loading, empty, error, and data states', async () => {
    TestBed.configureTestingModule({
      imports: [InvoicesPageComponent],
      providers: [
        {
          provide: PlatformBillingRepository,
          useValue: { invoices: () => NEVER },
        },
      ],
    });
    const loadingFixture = TestBed.createComponent(InvoicesPageComponent);
    loadingFixture.detectChanges();
    expect(loadingFixture.nativeElement.textContent).toContain(
      'جاري تحميل الفواتير',
    );

    const dataFixture = await createComponent(() => of(invoices));
    expect(dataFixture.nativeElement.textContent).toContain('INV-1');
    expect(dataFixture.nativeElement.textContent).toContain('Acme');

    const emptyFixture = await createComponent(() =>
      of({ ...invoices, items: [], total: 0 }),
    );
    expect(emptyFixture.nativeElement.textContent).toContain('لا توجد فواتير');

    const errorFixture = await createComponent(() =>
      throwError(() => new Error('private')),
    );
    expect(errorFixture.nativeElement.textContent).toContain(
      'تعذر تحميل الفواتير',
    );
  });
});

const createComponent = async (invoicesFactory: () => unknown) => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [InvoicesPageComponent],
    providers: [
      {
        provide: PlatformBillingRepository,
        useValue: { invoices: invoicesFactory },
      },
    ],
  });
  const fixture = TestBed.createComponent(InvoicesPageComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
};

const invoices = {
  items: [
    {
      id: 'inv-1',
      number: 'INV-1',
      tenant: { id: 'tenant-1', name: 'Acme', slug: 'acme' },
      amount: { amount: 200, currency: 'EGP' },
      status: 'OPEN',
      paymentStatus: 'PENDING',
      dueDate: null,
      createdAt: null,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
};
