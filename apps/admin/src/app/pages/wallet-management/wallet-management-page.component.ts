import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AdminRepository } from '@trackora/shared/data-access';
import { EgpCurrencyPipe } from '@trackora/shared/ui';
import { firstValueFrom } from 'rxjs';

interface FinancialSummary {
  dailyCodCollected: number;
  pendingSettlements: number;
  totalCourierCashHeld: number;
  expectedVsActualCash: {
    expected: number;
    actual: number;
    variance: number;
  };
}

@Component({
  selector: 'app-wallet-management-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, EgpCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wallet-management-page">
      <div class="page-header">
        <h1>Wallet Management</h1>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <span class="summary-value">{{ summary()?.totalCourierCashHeld ?? 0 | egpCurrency }}</span>
          <span class="summary-label">Total Courier Cash Held</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ summary()?.expectedVsActualCash?.expected ?? 0 | egpCurrency }}</span>
          <span class="summary-label">Expected Cash</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ summary()?.expectedVsActualCash?.actual ?? 0 | egpCurrency }}</span>
          <span class="summary-label">Actual Cash</span>
        </div>
        <div class="summary-card" [class.negative]="(summary()?.expectedVsActualCash?.variance ?? 0) > 0">
          <span class="summary-value">{{ summary()?.expectedVsActualCash?.variance ?? 0 | egpCurrency }}</span>
          <span class="summary-label">Cash Variance</span>
        </div>
      </div>

      <div class="info-banner">
        <p>
          <strong>Wallets vs Payouts:</strong> This page tracks courier cash holdings and cash reconciliation.
          <strong>Payout Approvals</strong> tracks merchant settlements and daily COD collection.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .wallet-management-page { padding: 1rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .summary-card { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; }
    .summary-card.negative .summary-value { color: #EF4444; }
    .summary-value { font-size: 1.5rem; font-weight: 700; color: var(--trackora-primary); }
    .summary-label { font-size: 0.875rem; color: var(--trackora-text-secondary); margin-top: 0.25rem; }
    .info-banner { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 1rem; color: #166534; font-size: 0.875rem; }
    .info-banner p { margin: 0; }
  `],
})
export class WalletManagementPageComponent implements OnInit {
  private readonly adminRepo = inject(AdminRepository);

  readonly summary = signal<FinancialSummary | null>(null);

  ngOnInit(): void {
    this.loadSummary();
  }

  private async loadSummary(): Promise<void> {
    try {
      const data = await firstValueFrom(this.adminRepo.getFinancialSummary());
      this.summary.set(data as FinancialSummary);
    } catch {
      this.summary.set(null);
    }
  }
}
