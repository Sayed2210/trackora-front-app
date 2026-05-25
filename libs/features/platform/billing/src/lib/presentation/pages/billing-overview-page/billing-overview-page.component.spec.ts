import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PlatformBillingRepository } from '../../../infrastructure/platform-billing.repository';
import { BillingOverviewPageComponent } from './billing-overview-page.component';

describe('BillingOverviewPageComponent', () => {
  it('renders summary cards, tenants, and disabled export action', async () => {
    TestBed.configureTestingModule({
      imports: [BillingOverviewPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: PlatformBillingRepository,
          useValue: { overview: () => of(overview) },
        },
      ],
    });
    const fixture = TestBed.createComponent(BillingOverviewPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Total Revenue');
    expect(fixture.nativeElement.textContent).toContain('Acme');
    expect(
      fixture.nativeElement.querySelector('button[disabled]')?.textContent,
    ).toContain('Export summary');
  });
});

const overview = {
  summary: [
    {
      key: 'totalRevenue',
      label: 'Total Revenue',
      value: 1000,
      currency: 'EGP',
    },
  ],
  revenue: [],
  unpaidTenants: [
    {
      id: 'tenant-1',
      name: 'Acme',
      slug: 'acme',
      status: 'UNPAID',
      amountDue: 200,
      currency: 'EGP',
      dueDate: null,
      invoiceCount: 1,
    },
  ],
  pastDueTenants: [],
  manualInvoiceSummary: [],
  alerts: [],
  exportSupported: false,
  contractNotes: [],
};
