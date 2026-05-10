import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MerchantRepository } from '@trackora/shared/data-access';
import { EgpCurrencyPipe, LocalDatePipe } from '@trackora/shared/ui';
import { firstValueFrom } from 'rxjs';

interface Merchant {
  id: string;
  businessName: string;
  businessType?: string;
  websiteUrl?: string;
  commissionRate?: string;
  feePerShipment?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
}

interface WalletData {
  balance?: number;
  availableBalance?: number;
  pendingBalance?: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  createdAt: string;
}

@Component({
  selector: 'app-merchant-management-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, EgpCurrencyPipe, LocalDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="merchant-management">
      <div class="page-header">
        <h1>Merchant Management</h1>
      </div>

      <div class="filters-bar">
        <input
          type="text"
          placeholder="Search merchants..."
          class="search-input"
          [value]="searchQuery()"
          (input)="onSearch($any($event.target).value)"
        />
        <select class="filter-select" [value]="kycStatus()" (change)="kycStatus.set($any($event.target).value); loadMerchants();">
          <option value="">All KYC Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="UNDER_REVIEW">Under Review</option>
        </select>
        <select class="filter-select" [value]="isActive()" (change)="isActive.set($any($event.target).value); loadMerchants();">
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Business Name</th>
            <th>Type</th>
            <th>Website</th>
            <th>Commission</th>
            <th>Fee/Shipment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let merchant of merchants(); trackBy: trackByMerchantId">
            <td>
              <div class="merchant-info">
                <span class="avatar">{{ merchant.businessName.charAt(0) }}</span>
                <div>
                  <div class="name">{{ merchant.businessName }}</div>
                </div>
              </div>
            </td>
            <td>{{ merchant.businessType || 'N/A' }}</td>
            <td>
              <a *ngIf="merchant.websiteUrl" [href]="merchant.websiteUrl" target="_blank" class="link">{{ merchant.websiteUrl }}</a>
              <span *ngIf="!merchant.websiteUrl">N/A</span>
            </td>
            <td>{{ merchant.commissionRate || 'N/A' }}</td>
            <td>{{ merchant.feePerShipment || 'N/A' }}</td>
            <td>
              <span class="status-badge" [class]="merchant.status">{{ merchant.status }}</span>
            </td>
            <td>
              <div class="actions">
                <button *ngIf="merchant.status === 'pending'" class="action-btn approve" (click)="approve(merchant)">Approve</button>
                <button *ngIf="merchant.status === 'pending'" class="action-btn reject" (click)="reject(merchant)">Reject</button>
                <button class="action-btn" (click)="openDetails(merchant)">Details</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="!merchants().length">
            <td colspan="7" class="empty-cell">No merchants found</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" *ngIf="totalPages() > 1">
        <button class="page-btn" [disabled]="page() === 1" (click)="changePage(page() - 1)">Prev</button>
        <span class="page-info">Page {{ page() }} of {{ totalPages() }}</span>
        <button class="page-btn" [disabled]="page() >= totalPages()" (click)="changePage(page() + 1)">Next</button>
      </div>
    </div>

    <!-- Detail Drawer -->
    <div class="detail-overlay" *ngIf="selectedMerchant()" (click)="closeDetails()"></div>
    <div class="detail-drawer" *ngIf="selectedMerchant()">
      <div class="drawer-header">
        <h2>{{ selectedMerchant()?.businessName }}</h2>
        <button class="close-btn" (click)="closeDetails()">&times;</button>
      </div>

      <div class="drawer-tabs">
        <button class="tab-btn" [class.active]="detailTab() === 'details'" (click)="setDetailTab('details')">Details</button>
        <button class="tab-btn" [class.active]="detailTab() === 'wallet'" (click)="setDetailTab('wallet')">Wallet</button>
        <button class="tab-btn" [class.active]="detailTab() === 'transactions'" (click)="setDetailTab('transactions')">Transactions</button>
      </div>

      <div class="drawer-content">
        <!-- Details Tab -->
        <div *ngIf="detailTab() === 'details'" class="tab-panel">
          <div class="detail-field" *ngIf="merchantDetail()">
            <label>ID</label>
            <span>{{ merchantDetail()?.id }}</span>
          </div>
          <div class="detail-field">
            <label>Business Name</label>
            <span>{{ selectedMerchant()?.businessName }}</span>
          </div>
          <div class="detail-field">
            <label>Business Type</label>
            <span>{{ selectedMerchant()?.businessType || 'N/A' }}</span>
          </div>
          <div class="detail-field">
            <label>Website</label>
            <span><a *ngIf="selectedMerchant()?.websiteUrl" [href]="selectedMerchant()?.websiteUrl" target="_blank">{{ selectedMerchant()?.websiteUrl }}</a></span>
          </div>
          <div class="detail-field">
            <label>Commission Rate</label>
            <span>{{ selectedMerchant()?.commissionRate || 'N/A' }}</span>
          </div>
          <div class="detail-field">
            <label>Fee Per Shipment</label>
            <span>{{ selectedMerchant()?.feePerShipment || 'N/A' }}</span>
          </div>
          <div class="detail-field">
            <label>Status</label>
            <span class="status-badge" [class]="selectedMerchant()?.status">{{ selectedMerchant()?.status }}</span>
          </div>
          <div class="detail-field" *ngIf="merchantDetail()">
            <label>Created At</label>
            <span>{{ merchantDetail()?.createdAt | localDate }}</span>
          </div>
        </div>

        <!-- Wallet Tab -->
        <div *ngIf="detailTab() === 'wallet'" class="tab-panel">
          <div class="wallet-summary" *ngIf="wallet()">
            <div class="wallet-card">
              <span class="wallet-value">{{ wallet()?.balance ?? 0 | egpCurrency }}</span>
              <span class="wallet-label">Balance</span>
            </div>
            <div class="wallet-card">
              <span class="wallet-value">{{ wallet()?.availableBalance ?? 0 | egpCurrency }}</span>
              <span class="wallet-label">Available</span>
            </div>
            <div class="wallet-card">
              <span class="wallet-value">{{ wallet()?.pendingBalance ?? 0 | egpCurrency }}</span>
              <span class="wallet-label">Pending</span>
            </div>
          </div>
          <div class="empty-state" *ngIf="!wallet() && !walletLoading()">
            <p>No wallet data available</p>
          </div>
          <div class="empty-state" *ngIf="walletLoading()">
            <p>Loading wallet...</p>
          </div>
        </div>

        <!-- Transactions Tab -->
        <div *ngIf="detailTab() === 'transactions'" class="tab-panel">
          <table class="data-table" *ngIf="transactions().length">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tx of transactions(); trackBy: trackByTxId">
                <td>{{ tx.type }}</td>
                <td>{{ tx.amount | egpCurrency }}</td>
                <td>{{ tx.description || '—' }}</td>
                <td>{{ tx.createdAt | localDate }}</td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="!transactions().length && !txLoading()">
            <p>No transactions found</p>
          </div>
          <div class="empty-state" *ngIf="txLoading()">
            <p>Loading transactions...</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .merchant-management { padding: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; }
    .filters-bar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
    .search-input { flex: 1; padding: 0.625rem 1rem; border: 1px solid var(--trackora-border); border-radius: 8px; font-size: 0.875rem; }
    .filter-select { padding: 0.625rem 1rem; border: 1px solid var(--trackora-border); border-radius: 8px; font-size: 0.875rem; background: white; }
    .data-table { width: 100%; border-collapse: collapse; background: white; border: 1px solid var(--trackora-border); border-radius: 8px; overflow: hidden; }
    .data-table th, .data-table td { padding: 0.875rem 1rem; text-align: start; border-bottom: 1px solid var(--trackora-border); font-size: 0.875rem; }
    .data-table th { background: var(--trackora-surface); font-weight: 600; color: var(--trackora-text-secondary); }
    .merchant-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--trackora-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; }
    .name { font-weight: 600; }
    .link { color: var(--trackora-primary); text-decoration: none; }
    .link:hover { text-decoration: underline; }
    .status-badge { padding: 0.25rem 0.625rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .pending { background: #FEF3C7; color: #92400E; }
    .approved { background: #D1FAE5; color: #065F46; }
    .rejected { background: #FEE2E2; color: #991B1B; }
    .suspended { background: #F3F4F6; color: #4B5563; }
    .actions { display: flex; gap: 0.5rem; }
    .action-btn { padding: 0.375rem 0.75rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
    .action-btn.approve { background: #D1FAE5; color: #065F46; border-color: #065F46; }
    .action-btn.reject { background: #FEE2E2; color: #991B1B; border-color: #991B1B; }
    .empty-cell { text-align: center; padding: 2rem; color: var(--trackora-text-secondary); }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
    .page-btn { padding: 0.5rem 1rem; background: white; border: 1px solid var(--trackora-border); border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-info { font-size: 0.875rem; color: var(--trackora-text-secondary); }

    .detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; }
    .detail-drawer { position: fixed; top: 0; right: 0; width: 420px; max-width: 90vw; height: 100vh; background: white; z-index: 101; display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.1); }
    .drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid var(--trackora-border); }
    .drawer-header h2 { margin: 0; font-size: 1.125rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--trackora-text-secondary); }
    .drawer-tabs { display: flex; gap: 0.25rem; padding: 0.5rem 1.25rem; border-bottom: 1px solid var(--trackora-border); }
    .tab-btn { padding: 0.5rem 1rem; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-size: 0.875rem; color: var(--trackora-text-secondary); }
    .tab-btn.active { color: var(--trackora-primary); border-bottom-color: var(--trackora-primary); font-weight: 600; }
    .drawer-content { flex: 1; overflow-y: auto; padding: 1.25rem; }
    .tab-panel { display: flex; flex-direction: column; gap: 1rem; }
    .detail-field { display: flex; flex-direction: column; gap: 0.25rem; }
    .detail-field label { font-size: 0.75rem; color: var(--trackora-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .detail-field span { font-size: 0.875rem; font-weight: 500; }

    .wallet-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem; }
    .wallet-card { background: var(--trackora-surface); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; }
    .wallet-value { font-size: 1.25rem; font-weight: 700; color: var(--trackora-primary); }
    .wallet-label { font-size: 0.75rem; color: var(--trackora-text-secondary); margin-top: 0.25rem; }
    .empty-state { text-align: center; padding: 2rem; color: var(--trackora-text-secondary); font-size: 0.875rem; }
  `],
})
export class MerchantManagementPageComponent implements OnInit {
  private readonly merchantRepo = inject(MerchantRepository);

  readonly merchants = signal<Merchant[]>([]);
  readonly searchQuery = signal('');
  readonly kycStatus = signal('');
  readonly isActive = signal('');
  readonly page = signal(1);
  readonly limit = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  readonly selectedMerchant = signal<Merchant | null>(null);
  readonly detailTab = signal<'details' | 'wallet' | 'transactions'>('details');
  readonly merchantDetail = signal<any>(null);
  readonly wallet = signal<WalletData | null>(null);
  readonly walletLoading = signal(false);
  readonly transactions = signal<Transaction[]>([]);
  readonly txLoading = signal(false);

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadMerchants();
  }

  async loadMerchants(): Promise<void> {
    try {
      const query: any = {
        page: this.page(),
        limit: this.limit(),
      };
      if (this.searchQuery()) query.search = this.searchQuery();
      if (this.kycStatus()) query.kycStatus = this.kycStatus();
      if (this.isActive() !== '') query.isActive = this.isActive() === 'true';

      const data = await firstValueFrom(this.merchantRepo.findAll(query));
      const items = Array.isArray(data) ? data : data?.data ?? [];
      const meta = Array.isArray(data) ? null : data?.meta ?? data?.pagination ?? null;

      this.merchants.set(items);
      this.totalCount.set(meta?.totalCount ?? meta?.total ?? items.length);
      this.totalPages.set(meta?.totalPages ?? meta?.lastPage ?? Math.ceil(items.length / this.limit()));
    } catch {
      this.merchants.set([]);
      this.totalCount.set(0);
      this.totalPages.set(0);
    }
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.page.set(1);
      this.loadMerchants();
    }, 300);
  }

  changePage(newPage: number): void {
    this.page.set(newPage);
    this.loadMerchants();
  }

  async approve(merchant: Merchant): Promise<void> {
    try {
      await firstValueFrom(this.merchantRepo.updateKyc(merchant.id, 'APPROVED'));
      this.merchants.update((list) =>
        list.map((m) => (m.id === merchant.id ? { ...m, status: 'approved' as Merchant['status'] } : m))
      );
    } catch {
      // In production show a toast
    }
  }

  async reject(merchant: Merchant): Promise<void> {
    try {
      await firstValueFrom(this.merchantRepo.updateKyc(merchant.id, 'REJECTED'));
      this.merchants.update((list) =>
        list.map((m) => (m.id === merchant.id ? { ...m, status: 'rejected' as Merchant['status'] } : m))
      );
    } catch {
      // In production show a toast
    }
  }

  openDetails(merchant: Merchant): void {
    this.selectedMerchant.set(merchant);
    this.detailTab.set('details');
    this.merchantDetail.set(null);
    this.wallet.set(null);
    this.transactions.set([]);
    this.loadMerchantDetail(merchant.id);
  }

  closeDetails(): void {
    this.selectedMerchant.set(null);
  }

  private async loadMerchantDetail(id: string): Promise<void> {
    try {
      const detail = await firstValueFrom(this.merchantRepo.findById(id));
      this.merchantDetail.set(detail);
    } catch {
      this.merchantDetail.set(null);
    }
  }

  private async loadWallet(id: string): Promise<void> {
    this.walletLoading.set(true);
    try {
      const data = await firstValueFrom(this.merchantRepo.getWallet(id));
      this.wallet.set(data as WalletData);
    } catch {
      this.wallet.set(null);
    } finally {
      this.walletLoading.set(false);
    }
  }

  private async loadTransactions(id: string): Promise<void> {
    this.txLoading.set(true);
    try {
      const data = await firstValueFrom(this.merchantRepo.getWalletTransactions(id, { page: '1', limit: '50' }));
      const items = Array.isArray(data) ? data : data?.data ?? [];
      this.transactions.set(items as Transaction[]);
    } catch {
      this.transactions.set([]);
    } finally {
      this.txLoading.set(false);
    }
  }

  setDetailTab(tab: 'details' | 'wallet' | 'transactions'): void {
    this.detailTab.set(tab);
    const merchant = this.selectedMerchant();
    if (!merchant) return;
    if (tab === 'wallet' && !this.wallet() && !this.walletLoading()) {
      this.loadWallet(merchant.id);
    }
    if (tab === 'transactions' && !this.transactions().length && !this.txLoading()) {
      this.loadTransactions(merchant.id);
    }
  }

  trackByMerchantId(_index: number, merchant: Merchant): string {
    return merchant.id;
  }

  trackByTxId(_index: number, tx: Transaction): string {
    return tx.id;
  }
}
