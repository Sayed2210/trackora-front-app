import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WalletFacade } from '../facade/wallet.facade';
import { LoadingSpinnerComponent, EgpCurrencyPipe, LocalDatePipe } from '@trackora/shared/ui';

@Component({
  selector: 'app-wallet-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, LoadingSpinnerComponent, EgpCurrencyPipe, LocalDatePipe],
  providers: [WalletFacade],
  template: `
    <div class="wallet-page">
      <h1>{{ 'wallet.title' | translate }}</h1>
      <app-loading-spinner *ngIf="facade.loading()" />
      <div class="balance-cards" *ngIf="facade.wallet() as wallet">
        <div class="balance-card available">
          <span class="label">{{ 'wallet.availableBalance' | translate }}</span>
          <span class="value">{{ wallet.availableBalance | egpCurrency }}</span>
        </div>
        <div class="balance-card pending">
          <span class="label">{{ 'wallet.pendingBalance' | translate }}</span>
          <span class="value">{{ wallet.pendingBalance | egpCurrency }}</span>
        </div>
      </div>
      <h2>{{ 'wallet.transactions' | translate }}</h2>
      <table class="transaction-table" *ngIf="facade.transactions().length">
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of facade.transactions()">
            <td>{{ t.type }}</td>
            <td [class.credit]="t.amount > 0" [class.debit]="t.amount < 0">{{ t.amount | egpCurrency }}</td>
            <td>{{ t.createdAt | localDate }}</td>
            <td>{{ t.description || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .wallet-page { padding: 1rem; }
    .balance-cards { display: flex; gap: 1rem; margin: 1rem 0; }
    .balance-card { flex: 1; background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid var(--trackora-border); }
    .balance-card .label { display: block; font-size: 0.75rem; color: var(--trackora-text-secondary); margin-bottom: 0.5rem; }
    .balance-card .value { font-size: 1.5rem; font-weight: 700; color: var(--trackora-primary); }
    .transaction-table { width: 100%; border-collapse: collapse; background: white; margin-top: 1rem; }
    .transaction-table th, .transaction-table td { padding: 0.75rem; border-bottom: 1px solid var(--trackora-border); text-align: start; }
    .credit { color: var(--trackora-success); }
    .debit { color: var(--trackora-danger); }
  `],
})
export class WalletPageComponent implements OnInit {
  readonly facade = inject(WalletFacade);

  ngOnInit(): void {
    this.facade.loadWallet();
    this.facade.loadTransactions();
  }
}
