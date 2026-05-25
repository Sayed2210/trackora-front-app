import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { PlatformSubscriptionsRepository } from './platform-subscriptions.repository';

describe('PlatformSubscriptionsRepository', () => {
  it('maps list and detail responses', () => {
    const api = {
      get: vi.fn((path: string) =>
        of(
          path === '/platform/subscriptions'
            ? { items: [{ id: 'sub-1', tenant_name: 'Acme', plan_name: 'Pro', payment_status: 'PAID' }], total: 1 }
            : { id: 'sub-2', tenant: { id: 'tenant-2', name: 'Beta' }, plan: { id: 'plan-2', name: 'Growth' }, usage: { shipments: { used: 10, limit: 100 } } },
        ),
      ),
      patch: vi.fn(),
      post: vi.fn(),
    } as unknown as ApiClient;

    TestBed.configureTestingModule({ providers: [PlatformSubscriptionsRepository, { provide: ApiClient, useValue: api }] });
    const repository = TestBed.inject(PlatformSubscriptionsRepository);

    repository.list({ search: 'acme', status: 'ACTIVE' }).subscribe((page) => {
      expect(page.items[0].tenant.name).toBe('Acme');
      expect(page.items[0].paymentStatus).toBe('PAID');
    });
    repository.get('sub-2').subscribe((subscription) => {
      expect(subscription.plan.name).toBe('Growth');
      expect(subscription.usage[0]).toEqual({ key: 'shipments', label: 'Shipments', used: 10, limit: 100 });
    });

    expect(api.get).toHaveBeenCalledWith('/platform/subscriptions', expect.objectContaining({ search: 'acme', status: 'ACTIVE' }));
    expect(api.get).toHaveBeenCalledWith('/platform/subscriptions/sub-2');
  });

  it('uses backend-supported mutation endpoints', () => {
    const api = {
      get: vi.fn(),
      patch: vi.fn(() => of({ id: 'sub-1' })),
      post: vi.fn(() => of({ id: 'sub-1' })),
    } as unknown as ApiClient;

    TestBed.configureTestingModule({ providers: [PlatformSubscriptionsRepository, { provide: ApiClient, useValue: api }] });
    const repository = TestBed.inject(PlatformSubscriptionsRepository);

    repository.update('sub-1', { status: 'ACTIVE', reason: 'safe change' }).subscribe();
    repository.changePlan('sub-1', { planId: 'plan-2', reason: 'upgrade' }).subscribe();
    repository.cancel('sub-1', { reason: 'tenant requested' }).subscribe();
    repository.renew('sub-1', { reason: 'manual renewal' }).subscribe();

    expect(api.patch).toHaveBeenCalledWith('/platform/subscriptions/sub-1', { status: 'ACTIVE', reason: 'safe change' });
    expect(api.post).toHaveBeenCalledWith('/platform/subscriptions/sub-1/change-plan', { planId: 'plan-2', reason: 'upgrade' });
    expect(api.post).toHaveBeenCalledWith('/platform/subscriptions/sub-1/cancel', { reason: 'tenant requested' });
    expect(api.post).toHaveBeenCalledWith('/platform/subscriptions/sub-1/renew', { reason: 'manual renewal' });
  });
});
