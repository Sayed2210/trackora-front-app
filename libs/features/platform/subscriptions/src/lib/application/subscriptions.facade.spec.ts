import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ApiClientError } from '@trackora/core/api';
import { PlatformSubscription } from '../domain/models/subscription.models';
import { PlatformSubscriptionsRepository } from '../infrastructure/platform-subscriptions.repository';
import { SubscriptionsFacade } from './subscriptions.facade';

describe('SubscriptionsFacade', () => {
  it('handles loading and data state', async () => {
    const facade = createFacade();
    await facade.loadList();
    await facade.loadDetail('sub-1');

    expect(facade.subscriptions()[0].tenant.name).toBe('Acme');
    expect(facade.detail().data?.id).toBe('sub-1');
    expect(facade.empty()).toBe(false);
  });

  it('stores user-safe errors', async () => {
    const facade = createFacade({ failList: true });
    await facade.loadList();
    expect(facade.list().error).toContain('تعذر تحميل');
  });

  it('requires reason for change plan, cancel, and renew', async () => {
    const facade = createFacade();

    expect(await facade.changePlan('sub-1', { planId: 'plan-2', reason: '' })).toBeNull();
    expect(facade.detail().error).toContain('سبب');
    expect(await facade.cancel('sub-1', '')).toBeNull();
    expect(facade.detail().error).toContain('سبب');
    expect(await facade.renew('sub-1', { reason: '' })).toBeNull();
    expect(facade.detail().error).toContain('سبب');
  });

  it('maps mutation conflicts safely', async () => {
    const facade = createFacade({ conflictMutation: true });
    const result = await facade.cancel('sub-1', 'cancel request');
    expect(result).toBeNull();
    expect(facade.detail().error).toContain('تعارض');
  });
});

const subscription: PlatformSubscription = {
  id: 'sub-1',
  tenant: { id: 'tenant-1', name: 'Acme', slug: 'acme' },
  plan: { id: 'plan-1', name: 'Pro', code: 'pro', billingCycle: 'monthly', price: 100, currency: 'EGP' },
  status: 'ACTIVE',
  paymentStatus: 'PAID',
  billingCycle: 'monthly',
  trialStartedAt: null,
  trialEndsAt: null,
  currentPeriodStart: '2026-05-01',
  currentPeriodEnd: '2026-06-01',
  renewalDate: '2026-06-01',
  usage: [],
  notes: '',
  metadata: {},
  createdAt: null,
  updatedAt: null,
};

const createFacade = (options: { failList?: boolean; conflictMutation?: boolean } = {}): SubscriptionsFacade => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      SubscriptionsFacade,
      {
        provide: PlatformSubscriptionsRepository,
        useValue: {
          list: () => (options.failList ? throwError(() => new Error('private')) : of({ items: [subscription], total: 1, page: 1, pageSize: 20 })),
          get: () => of(subscription),
          update: () => of(subscription),
          changePlan: () => (options.conflictMutation ? throwError(() => new ApiClientError({ code: 'CONFLICT', message: 'private' }, 409)) : of(subscription)),
          cancel: () => (options.conflictMutation ? throwError(() => new ApiClientError({ code: 'CONFLICT', message: 'private' }, 409)) : of(subscription)),
          renew: () => (options.conflictMutation ? throwError(() => new ApiClientError({ code: 'CONFLICT', message: 'private' }, 409)) : of(subscription)),
        },
      },
    ],
  });
  return TestBed.inject(SubscriptionsFacade);
};
