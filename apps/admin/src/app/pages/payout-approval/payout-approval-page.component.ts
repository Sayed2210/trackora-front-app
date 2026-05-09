import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AdminRepository } from '@trackora/shared/data-access';
import { firstValueFrom } from 'rxjs';

interface PayoutRequest {
  id: string;
  merchantName: string;
  merchantId: string;
  amount: number;
  method: 'bank_transfer' | 'vodafone_cash' | 'instapay';
  accountInfo: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: string;
}

@Component({
  selector: 'app-payout-approval-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="payout-approval">
      <div class="page-header">
        <h1>Payout Approvals</h1>
        <div class="bulk-actions">
          <button class="p-button" (click)="approveSelected()" [disabled]="!selectedIds().size">
            Approve Selected ({{ selectedIds().size }})
          </button>
          <button class="p-button secondary" (click)="rejectSelected()" [disabled]="!selectedIds().size">
            Reject Selected
          </button>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" (change)="toggleAll($event)" /></th>
            <th>Merchant</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Account</th>
            <th>Status</th>
            <th>Requested</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let payout of payouts(); trackBy: trackByPayoutId">
            <td>
              <input
                type="checkbox"
                [checked]="selectedIds().has(payout.id)"
                (change)="toggleSelection(payout.id)"
              />
            </td>
            <td>{{ payout.merchantName }}</td>
            <td class="amount">{{ payout.amount | currency:'EGP':'symbol':'1.0-0' }}</td>
            <td>{{ payout.method }}</td>
            <td>{{ payout.accountInfo }}</td>
            <td>
              <span class="status-badge" [class]="payout.status">{{ payout.status }}</span>
            </td>
            <td>{{ payout.requestedAt | date:'short' }}</td>
            <td>
              <div class="actions">
                <button *ngIf="payout.status === 'pending'" class="action-btn approve" (click)="approve(payout)">Approve</button>
                <button *ngIf="payout.status === 'pending'" class="action-btn reject" (click)="reject(payout)">Reject</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .payout-approval { padding: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; }
    .bulk-actions { display: flex; gap: 0.75rem; }
    .p-button { padding: 0.625rem 1.25rem; background: var(--trackora-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .p-button:disabled { opacity: 0.5; cursor: not-allowed; }
    .p-button.secondary { background: var(--trackora-surface); color: var(--trackora-text); border: 1px solid var(--trackora-border); }
    .data-table { width: 100%; border-collapse: collapse; background: white; border: 1px solid var(--trackora-border); border-radius: 8px; overflow: hidden; }
    .data-table th, .data-table td { padding: 0.875rem 1rem; text-align: start; border-bottom: 1px solid var(--trackora-border); font-size: 0.875rem; }
    .data-table th { background: var(--trackora-surface); font-weight: 600; color: var(--trackora-text-secondary); }
    .amount { font-weight: 700; color: var(--trackora-primary); }
    .status-badge { padding: 0.25rem 0.625rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .pending { background: #FEF3C7; color: #92400E; }
    .approved { background: #D1FAE5; color: #065F46; }
    .rejected { background: #FEE2E2; color: #991B1B; }
    .processed { background: #DBEAFE; color: #1E40AF; }
    .actions { display: flex; gap: 0.5rem; }
    .action-btn { padding: 0.375rem 0.75rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
    .action-btn.approve { background: #D1FAE5; color: #065F46; border-color: #065F46; }
    .action-btn.reject { background: #FEE2E2; color: #991B1B; border-color: #991B1B; }
  `],
})
export class PayoutApprovalPageComponent implements OnInit {
  private readonly adminRepo = inject(AdminRepository);

  readonly payouts = signal<PayoutRequest[]>([]);
  readonly selectedIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.loadPayouts();
  }

  private async loadPayouts(): Promise<void> {
    try {
      const summary = await firstValueFrom(this.adminRepo.getFinancialSummary());
      const pendingPayouts = summary?.pendingPayouts ?? [];
      this.payouts.set(pendingPayouts as PayoutRequest[]);
    } catch {
      this.payouts.set([]);
    }
  }

  toggleSelection(id: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.set(new Set(this.payouts().map((p) => p.id)));
    } else {
      this.selectedIds.set(new Set());
    }
  }

  approve(payout: PayoutRequest): void {
    this.payouts.update((list) =>
      list.map((p) => (p.id === payout.id ? { ...p, status: 'approved' as PayoutRequest['status'] } : p))
    );
  }

  reject(payout: PayoutRequest): void {
    this.payouts.update((list) =>
      list.map((p) => (p.id === payout.id ? { ...p, status: 'rejected' as PayoutRequest['status'] } : p))
    );
  }

  approveSelected(): void {
    const ids = this.selectedIds();
    this.payouts.update((list) =>
      list.map((p) => (ids.has(p.id) ? { ...p, status: 'approved' as PayoutRequest['status'] } : p))
    );
    this.selectedIds.set(new Set());
  }

  rejectSelected(): void {
    const ids = this.selectedIds();
    this.payouts.update((list) =>
      list.map((p) => (ids.has(p.id) ? { ...p, status: 'rejected' as PayoutRequest['status'] } : p))
    );
    this.selectedIds.set(new Set());
  }

  trackByPayoutId(_index: number, payout: PayoutRequest): string {
    return payout.id;
  }
}
