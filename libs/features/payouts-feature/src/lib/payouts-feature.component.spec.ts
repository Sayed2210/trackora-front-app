import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '@trackora/core/auth';
import { PayoutRepository, WalletRepository } from '@trackora/shared/data-access';
import { PayoutsFeatureComponent } from './payouts-feature.component';

describe('PayoutsFeatureComponent', () => {
  let fixture: ComponentFixture<PayoutsFeatureComponent>;
  let component: PayoutsFeatureComponent;
  let payoutRepo: { findAll: jest.Mock; create: jest.Mock };

  beforeEach(async () => {
    payoutRepo = {
      findAll: jest.fn().mockReturnValue(of({ data: [], total: 0, page: 1, limit: 20 })),
      create: jest.fn().mockReturnValue(of({ id: 'payout-1' })),
    };

    await TestBed.configureTestingModule({
      imports: [PayoutsFeatureComponent],
      providers: [
        { provide: AuthService, useValue: { user: jest.fn(() => ({ merchantId: 'merchant-1' })) } },
        {
          provide: WalletRepository,
          useValue: {
            getMerchantWallet: jest.fn().mockReturnValue(of({
              id: 'wallet-1',
              merchantId: 'merchant-1',
              availableBalance: 1200,
              pendingBalance: 0,
              totalCredited: 1200,
              totalDebited: 0,
              currency: 'EGP',
              updatedAt: '2026-05-15T00:00:00.000Z',
            })),
          },
        },
        { provide: PayoutRepository, useValue: payoutRepo },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PayoutsFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads wallet balance and merchant payout history', () => {
    expect(component.availableBalance()).toBe(1200);
    expect(payoutRepo.findAll).toHaveBeenCalledWith({ merchantId: 'merchant-1', page: 1, limit: 20 });
  });

  it('submits a valid payout request', async () => {
    component.form.setValue({
      amount: 600,
      method: 'INSTAPAY',
      accountName: 'Ahmed',
      accountNumber: '01000000000',
      bankName: '',
    });

    await component.submit();

    expect(payoutRepo.create).toHaveBeenCalledWith({
      amount: 600,
      method: 'INSTAPAY',
      destination: {
        accountName: 'Ahmed',
        accountNumber: '01000000000',
        bankName: undefined,
      },
    });
  });

  it('blocks payout requests above available balance', async () => {
    component.form.patchValue({ amount: 1500, accountName: 'Ahmed', accountNumber: '01000000000' });

    await component.submit();

    expect(payoutRepo.create).not.toHaveBeenCalled();
    expect(component.error()).toBe('Payout amount exceeds available balance');
  });
});
