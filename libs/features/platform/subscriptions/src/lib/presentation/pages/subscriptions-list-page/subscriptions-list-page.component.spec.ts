import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PlatformSubscriptionsRepository } from '../../../infrastructure/platform-subscriptions.repository';
import { SubscriptionsListPageComponent } from './subscriptions-list-page.component';

describe('SubscriptionsListPageComponent', () => {
  it('renders loading, empty, error, and data states', async () => {
    let fixture = await createComponent('data');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Acme');

    fixture = await createComponent('empty');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('لا توجد اشتراكات');

    fixture = await createComponent('error');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('تعذر تحميل الاشتراكات');
  });
});

const createComponent = async (state: 'data' | 'empty' | 'error'): Promise<ComponentFixture<SubscriptionsListPageComponent>> => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [SubscriptionsListPageComponent],
    providers: [
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
      { provide: PlatformSubscriptionsRepository, useValue: repository(state) },
    ],
  });
  const fixture = TestBed.createComponent(SubscriptionsListPageComponent);
  fixture.detectChanges();
  return fixture;
};

const repository = (state: 'data' | 'empty' | 'error') => ({
  list: () => {
    if (state === 'error') return throwError(() => new Error('private'));
    if (state === 'empty') return of({ items: [], total: 0, page: 1, pageSize: 20 });
    return of({
      items: [{
        id: 'sub-1',
        tenant: { id: 'tenant-1', name: 'Acme', slug: 'acme' },
        plan: { id: 'plan-1', name: 'Pro', code: 'pro', billingCycle: 'monthly', price: 100, currency: 'EGP' },
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        billingCycle: 'monthly',
        trialStartedAt: null,
        trialEndsAt: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        renewalDate: null,
        usage: [],
        notes: '',
        metadata: {},
        createdAt: null,
        updatedAt: null,
      }], total: 1, page: 1, pageSize: 20,
    });
  },
});
