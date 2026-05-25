import { TestBed } from '@angular/core/testing';
import { ApiClient } from '@trackora/core/api';
import { of } from 'rxjs';
import { PlatformBillingRepository } from './platform-billing.repository';

describe('PlatformBillingRepository', () => {
  it('maps overview response', () => {
    const api = {
      get: vi.fn(() =>
        of({
          summary: { totalRevenue: { amount: 1200, currency: 'EGP' } },
          unpaidTenants: [
            {
              tenantId: 'tenant-1',
              tenantName: 'Acme',
              amountDue: 200,
              currency: 'EGP',
            },
          ],
          pastDueTenants: [
            { id: 'tenant-2', name: 'Late Co', status: 'PAST_DUE' },
          ],
        }),
      ),
    } as unknown as ApiClient;

    TestBed.configureTestingModule({
      providers: [
        PlatformBillingRepository,
        { provide: ApiClient, useValue: api },
      ],
    });
    const repository = TestBed.inject(PlatformBillingRepository);

    repository.overview().subscribe((overview) => {
      expect(overview.summary[0].key).toBe('totalRevenue');
      expect(overview.unpaidTenants[0].name).toBe('Acme');
      expect(overview.pastDueTenants[0].status).toBe('PAST_DUE');
    });

    expect(api.get).toHaveBeenCalledWith('/platform/billing/overview');
  });

  it('maps invoices list response with filters', () => {
    const api = {
      get: vi.fn(() =>
        of({
          data: [
            {
              id: 'inv-1',
              tenantName: 'Acme',
              total: 500,
              currency: 'EGP',
              status: 'OPEN',
            },
          ],
          meta: { total: 1, page: 1, limit: 20 },
        }),
      ),
    } as unknown as ApiClient;

    TestBed.configureTestingModule({
      providers: [
        PlatformBillingRepository,
        { provide: ApiClient, useValue: api },
      ],
    });
    const repository = TestBed.inject(PlatformBillingRepository);

    repository
      .invoices({
        tenant: 'Acme',
        status: 'OPEN',
        paymentStatus: 'all',
        dateFrom: '2026-01-01',
      })
      .subscribe((page) => {
        expect(page.items[0].tenant.name).toBe('Acme');
        expect(page.items[0].amount.amount).toBe(500);
        expect(page.total).toBe(1);
      });

    expect(api.get).toHaveBeenCalledWith('/platform/invoices', {
      tenant: 'Acme',
      status: 'OPEN',
      dateFrom: '2026-01-01',
    });
  });
});
