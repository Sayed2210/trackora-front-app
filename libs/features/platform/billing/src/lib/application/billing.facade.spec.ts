import { TestBed } from '@angular/core/testing';
import { ApiClientError } from '@trackora/core/api';
import { of, throwError } from 'rxjs';
import { PlatformBillingRepository } from '../infrastructure/platform-billing.repository';
import { BillingFacade } from './billing.facade';

describe('BillingFacade', () => {
  it('handles loading and data for overview and invoices', async () => {
    const facade = createFacade();

    await facade.loadOverview();
    await facade.loadInvoices({ tenant: 'Acme' });

    expect(facade.overview().data?.unpaidTenants[0].name).toBe('Acme');
    expect(facade.invoiceItems()[0].number).toBe('INV-1');
    expect(facade.invoiceQuery().tenant).toBe('Acme');
  });

  it('maps API errors to safe messages', async () => {
    const facade = createFacade(true);

    await facade.loadOverview();
    await facade.loadInvoices();

    expect(facade.overview().error).toContain('صلاحية');
    expect(facade.invoices().error).toContain('صلاحية');
  });
});

const createFacade = (fail = false): BillingFacade => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      BillingFacade,
      {
        provide: PlatformBillingRepository,
        useValue: {
          overview: () =>
            fail
              ? throwError(
                  () =>
                    new ApiClientError(
                      { code: 'FORBIDDEN', message: 'private' },
                      403,
                    ),
                )
              : of(overview),
          invoices: () =>
            fail
              ? throwError(
                  () =>
                    new ApiClientError(
                      { code: 'FORBIDDEN', message: 'private' },
                      403,
                    ),
                )
              : of(invoices),
        },
      },
    ],
  });
  return TestBed.inject(BillingFacade);
};

const overview = {
  summary: [],
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
