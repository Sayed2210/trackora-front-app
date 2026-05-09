import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AdminRepository } from '@trackora/shared/data-access';
import { EgpCurrencyPipe, LocalDatePipe } from '@trackora/shared/ui';
import { firstValueFrom } from 'rxjs';

interface MerchantWallet {
  merchantId: string;
  merchantName: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  lastPayoutDate?: string;
}

@Component({
  selector: 'app-wallet-management-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, EgpCurrencyPipe, LocalDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wallet-management-page">
      <div class="page-header">
        <h1>Wallet Management</h1>
      </div>

      <div class="summary-cards">
        <div class="summary-card">
          <span class="summary-value">{{ totalAvailable() | egpCurrency }}</span>
          <span class="summary-label">Total Available</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ totalPending() | egpCurrency }}</span>
          <span class="summary-label">Total Pending</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ merchantCount() }}</span>
          <span class="summary-label">Merchants</span>
        </div>
      </div>

      <div class="wallet-table-wrapper">
        <div class="table-filters">
          <input
            type="text"
            placeholder="Search merchant..."
            [value]="searchQuery()"
            (input)="searchQuery.set(($any($event.target).value))"
          />
        </div>
        <table class="wallet-table">
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Available</th>
              <th>Pending</th>
              <th>Total Earned</th>
              <th>Last Payout</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let w of filteredWallets(); trackBy: trackByWalletId">
              <td>
                <div class="merchant-name">{{ w.merchantName }}</div>
                <div class="merchant-id">{{ w.merchantId }}</div>
              </td>
              <td class="balance available">{{ w.availableBalance | egpCurrency }}</td>
              <td class="balance pending">{{ w.pendingBalance | egpCurrency }}</td>
              <td class="balance earned">{{ w.totalEarned | egpCurrency }}</td>
              <td>{{ w.lastPayoutDate ? (w.lastPayoutDate | localDate) : 'Never' }}</td>
              <td>
                <button class="action-btn" (click)="viewDetails(w)">View</button>
              </td>
            </tr>
            <tr *ngIf="!filteredWallets().length">
              <td colspan="6" class="empty-cell">No merchants found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .wallet-management-page { padding: 1rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .summary-card { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; }
    .summary-value { font-size: 1.5rem; font-weight: 700; color: var(--trackora-primary); }
    .summary-label { font-size: 0.875rem; color: var(--trackora-text-secondary); margin-top: 0.25rem; }
    .wallet-table-wrapper { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; }
    .table-filters { margin-bottom: 1rem; }
    .table-filters input { width: 100%; max-width: 300px; padding: 0.5rem; border: 1px solid var(--trackora-border); border-radius: 8px; font-size: 0.875rem; }
    .wallet-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .wallet-table th { text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--trackora-border); color: var(--trackora-text-secondary); font-weight: 600; }
    .wallet-table td { padding: 0.75rem; border-bottom: 1px solid var(--trackora-border); vertical-align: middle; }
    .merchant-name { font-weight: 600; }
    .merchant-id { font-size: 0.75rem; color: var(--trackora-text-secondary); }
    .balance { font-weight: 600; }
    .balance.available { color: #10B981; }
    .balance.pending { color: #F59E0B; }
    .balance.earned { color: var(--trackora-primary); }
    .action-btn { padding: 0.375rem 0.75rem; background: var(--trackora-primary); color: white; border: none; border-radius: 6px; font-size: 0.75rem; cursor: pointer; }
    .empty-cell { text-align: center; padding: 2rem; color: var(--trackora-text-secondary); }
  `],
})
export class WalletManagementPageComponent implements OnInit {
  private readonly adminRepo = inject(AdminRepository);

  readonly wallets = signal<MerchantWallet[]>([]);
  readonly searchQuery = signal('');
  readonly totalAvailable = signal(0);
  readonly totalPending = signal(0);
  readonly merchantCount = signal(0);

  readonly filteredWallets = () => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.wallets();
    return this.wallets().filter(
      (w) =>
        w.merchantName.toLowerCase().includes(query) ||
        w.merchantId.toLowerCase().includes(query)
    );
  };

  ngOnInit(): void {
    this.loadWallets();
  }

  private async loadWallets(): Promise<void> {
    try {
      const summary = await firstValueFrom(this.adminRepo.getFinancialSummary());
      const merchantWallets = summary?.merchantWallets ?? [];
      this.wallets.set(merchantWallets as MerchantWallet[]);
      this.totalAvailable.set(merchantWallets.reduce((sum: number, w: MerchantWallet) => sum + (w.availableBalance || 0), 0));
      this.totalPending.set(merchantWallets.reduce((sum: number, w: MerchantWallet) => sum + (w.pendingBalance || 0), 0));
      this.merchantCount.set(merchantWallets.length);
    } catch {
      this.wallets.set([]);
      this.totalAvailable.set(0);
      this.totalPending.set(0);
      this.merchantCount.set(0);
    }
  }

  viewDetails(wallet: MerchantWallet): void {
    // In a real app, navigate to merchant wallet detail
    alert(`Wallet details for ${wallet.merchantName}`);
  }

  trackByWalletId(_index: number, wallet: MerchantWallet): string {
    return wallet.merchantId;
  }
}
