import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import { Permission } from '@trackora/shared/domain';
import { of } from 'rxjs';
import { PlatformSubscriptionsRepository } from '../../../infrastructure/platform-subscriptions.repository';
import { MANAGE_SUBSCRIPTIONS_PERMISSION, SubscriptionDetailPageComponent } from './subscription-detail-page.component';

describe('SubscriptionDetailPageComponent', () => {
  it('renders subscription summary', async () => {
    const fixture = await createComponent([MANAGE_SUBSCRIPTIONS_PERMISSION]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Acme');
    expect(fixture.nativeElement.textContent).toContain('Pro');
  });

  it('hides mutation actions without manage_subscriptions', async () => {
    const fixture = await createComponent([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.canManage).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('إجراءات حساسة');
  });
});

const createComponent = async (permissions: Permission[]) => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [SubscriptionDetailPageComponent],
    providers: [
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'sub-1' } } } },
      { provide: AuthService, useValue: { hasPermission: (permission: Permission) => permissions.includes(permission) } },
      { provide: PlatformSubscriptionsRepository, useValue: { get: () => of(subscription), update: () => of(subscription), changePlan: () => of(subscription), cancel: () => of(subscription), renew: () => of(subscription) } },
    ],
  });
  const fixture = TestBed.createComponent(SubscriptionDetailPageComponent);
  fixture.detectChanges();
  return fixture;
};

const subscription = {
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
  usage: [{ key: 'shipments', label: 'Shipments', used: 10, limit: 100 }],
  notes: '',
  metadata: {},
  createdAt: '2026-05-01',
  updatedAt: '2026-05-02',
};
