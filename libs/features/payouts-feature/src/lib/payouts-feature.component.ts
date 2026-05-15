import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CreatePayoutDto,
  Payout,
  PayoutMethod,
  PayoutRepository,
  WalletRepository,
} from '@trackora/shared/data-access';
import { AuthService } from '@trackora/core/auth';
import { EgpCurrencyPipe, LocalDatePipe } from '@trackora/shared/ui';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-payouts-feature',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EgpCurrencyPipe, LocalDatePipe],
  template: `
    <div class="payouts-page">
      <div class="page-header">
        <h1>Payouts</h1>
        <div class="balance" *ngIf="availableBalance() !== null">
          <span>Available</span>
          <strong>{{ availableBalance()! | egpCurrency }}</strong>
        </div>
      </div>

      <div class="error" *ngIf="error()">{{ error() }}</div>

      <section class="request-panel">
        <h2>Request Payout</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            <span>Amount</span>
            <input type="number" formControlName="amount" min="500" />
          </label>
          <label>
            <span>Method</span>
            <select formControlName="method">
              <option *ngFor="let method of methods" [value]="method">{{ method }}</option>
            </select>
          </label>
          <label>
            <span>Account Name</span>
            <input formControlName="accountName" />
          </label>
          <label>
            <span>Account / Wallet Number</span>
            <input formControlName="accountNumber" />
          </label>
          <label>
            <span>Bank Name</span>
            <input formControlName="bankName" />
          </label>
          <button type="submit" [disabled]="form.invalid || submitting()">
            {{ submitting() ? 'Requesting...' : 'Request Payout' }}
          </button>
        </form>
      </section>

      <section class="history-panel">
        <h2>History</h2>
        <div class="empty" *ngIf="!loading() && payouts().length === 0">No payout requests yet</div>
        <table *ngIf="payouts().length">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Reference</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let payout of payouts()">
              <td>{{ payout.amount | egpCurrency }}</td>
              <td>{{ payout.method }}</td>
              <td><span class="status" [class]="payout.status">{{ payout.status }}</span></td>
              <td>{{ payout.referenceNumber || payout.rejectionReason || '-' }}</td>
              <td>{{ payout.createdAt | localDate }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .payouts-page { padding: 1rem; display: grid; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    h1, h2 { margin: 0; }
    .balance { background: white; border: 1px solid var(--trackora-border); border-radius: 8px; padding: 0.75rem 1rem; display: grid; gap: 0.25rem; }
    .balance span { color: var(--trackora-text-secondary); font-size: 0.75rem; }
    .balance strong { color: var(--trackora-primary); font-size: 1.25rem; }
    .request-panel, .history-panel { background: white; border: 1px solid var(--trackora-border); border-radius: 8px; padding: 1rem; }
    form { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; margin-top: 1rem; align-items: end; }
    label { display: grid; gap: 0.25rem; font-weight: 600; }
    input, select { padding: 0.625rem; border: 1px solid var(--trackora-border); border-radius: 4px; }
    button { padding: 0.7rem 1rem; border: 0; border-radius: 4px; background: var(--trackora-primary); color: white; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { background: #FEE2E2; color: #991B1B; border-radius: 4px; padding: 0.75rem; }
    .empty { color: var(--trackora-text-secondary); padding: 1rem 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.75rem; border-bottom: 1px solid var(--trackora-border); text-align: start; }
    .status { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
    .PENDING, .PROCESSING { background: #FEF3C7; color: #92400E; }
    .APPROVED, .COMPLETED { background: #D1FAE5; color: #065F46; }
    .REJECTED { background: #FEE2E2; color: #991B1B; }
  `],
})
export class PayoutsFeatureComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly payoutRepo = inject(PayoutRepository);
  private readonly walletRepo = inject(WalletRepository);

  readonly methods: PayoutMethod[] = ['INSTAPAY', 'BANK_TRANSFER', 'VODAFONE_CASH', 'ETISALAT_CASH'];
  readonly availableBalance = signal<number | null>(null);
  readonly payouts = signal<Payout[]>([]);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    amount: [500, [Validators.required, Validators.min(500)]],
    method: ['INSTAPAY' as PayoutMethod, Validators.required],
    accountName: ['', Validators.required],
    accountNumber: ['', Validators.required],
    bankName: [''],
  });

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const merchantId = this.requireMerchantId();
      const [wallet, payouts] = await Promise.all([
        firstValueFrom(this.walletRepo.getMerchantWallet(merchantId)),
        firstValueFrom(this.payoutRepo.findAll({ merchantId, page: 1, limit: 20 })),
      ]);
      this.availableBalance.set(wallet.availableBalance);
      this.payouts.set(payouts.data);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load payouts');
    } finally {
      this.loading.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;

    const amount = Number(this.form.value.amount);
    const available = this.availableBalance() ?? 0;
    if (amount > available) {
      this.error.set('Payout amount exceeds available balance');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    try {
      const dto: CreatePayoutDto = {
        amount,
        method: this.form.value.method as PayoutMethod,
        destination: {
          accountName: this.form.value.accountName || undefined,
          accountNumber: this.form.value.accountNumber || undefined,
          bankName: this.form.value.bankName || undefined,
        },
      };
      await firstValueFrom(this.payoutRepo.create(dto));
      this.form.patchValue({ amount: 500 });
      await this.load();
    } catch (err: any) {
      this.error.set(err.message || 'Failed to request payout');
    } finally {
      this.submitting.set(false);
    }
  }

  private requireMerchantId(): string {
    const merchantId = this.authService.user()?.merchantId;
    if (!merchantId) {
      throw new Error('Merchant account is missing from your profile');
    }
    return merchantId;
  }
}
