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
  selector: 'app-payout-approval-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, EgpCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="payout-approval">
      <div class="page-header">
        <h1>Payout Approvals</h1>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <span class="summary-value">{{ summary()?.dailyCodCollected ?? 0 | egpCurrency }}</span>
          <span class="summary-label">Daily COD Collected</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ summary()?.pendingSettlements ?? 0 | egpCurrency }}</span>
          <span class="summary-label">Pending Settlements</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ summary()?.totalCourierCashHeld ?? 0 | egpCurrency }}</span>
          <span class="summary-label">Total Courier Cash Held</span>
        </div>
      </div>

      <div class="variance-panel">
        <h3>Cash Reconciliation</h3>
        <div class="variance-grid">
          <div class="variance-item">
            <span class="variance-label">Expected Cash</span>
            <span class="variance-value">{{ summary()?.expectedVsActualCash?.expected ?? 0 | egpCurrency }}</span>
          </div>
          <div class="variance-item">
            <span class="variance-label">Actual Cash</span>
            <span class="variance-value">{{ summary()?.expectedVsActualCash?.actual ?? 0 | egpCurrency }}</span>
          </div>
          <div class="variance-item" [class.negative]="(summary()?.expectedVsActualCash?.variance ?? 0) > 0">
            <span class="variance-label">Variance</span>
            <span class="variance-value">{{ summary()?.expectedVsActualCash?.variance ?? 0 | egpCurrency }}</span>
          </div>
        </div>
      </div>

      <div class="info-banner">
        <p>
          <strong>Payouts vs Wallets:</strong> This page shows settlement and COD collection summaries.
          <strong>Wallet Management</strong> focuses on courier cash held and cash reconciliation variance.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .payout-approval { padding: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .summary-card { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; }
    .summary-value { font-size: 1.5rem; font-weight: 700; color: var(--trackora-primary); }
    .summary-label { font-size: 0.875rem; color: var(--trackora-text-secondary); margin-top: 0.25rem; }
    .variance-panel { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; }
    .variance-panel h3 { margin: 0 0 1rem; font-size: 1rem; }
    .variance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .variance-item { display: flex; flex-direction: column; padding: 0.75rem; background: var(--trackora-surface); border-radius: 8px; }
    .variance-label { font-size: 0.875rem; color: var(--trackora-text-secondary); }
    .variance-value { font-size: 1.25rem; font-weight: 700; color: var(--trackora-primary); margin-top: 0.25rem; }
    .variance-item.negative .variance-value { color: #EF4444; }
    .info-banner { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 1rem; color: #1E40AF; font-size: 0.875rem; }
    .info-banner p { margin: 0; }
  `],
})
export class PayoutApprovalPageComponent implements OnInit {
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
