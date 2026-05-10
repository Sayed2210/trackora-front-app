import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MerchantRepository } from '@trackora/shared/data-access';
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

@Component({
  selector: 'app-merchant-management-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
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
          (input)="searchQuery.set($any($event.target).value)"
        />
        <select class="filter-select" [value]="statusFilter()" (change)="statusFilter.set($any($event.target).value)">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
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
          <tr *ngFor="let merchant of filteredMerchants(); trackBy: trackByMerchantId">
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
                <button class="action-btn" (click)="viewDetails(merchant)">View</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="!filteredMerchants().length">
            <td colspan="7" class="empty-cell">No merchants found</td>
          </tr>
        </tbody>
      </table>
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
  `],
})
export class MerchantManagementPageComponent implements OnInit {
  private readonly merchantRepo = inject(MerchantRepository);

  readonly merchants = signal<Merchant[]>([]);
  readonly searchQuery = signal('');
  readonly statusFilter = signal('');

  readonly filteredMerchants = () => {
    let list = this.merchants();
    const query = this.searchQuery().toLowerCase();
    const status = this.statusFilter();

    if (query) {
      list = list.filter((m) => m.businessName.toLowerCase().includes(query));
    }
    if (status) {
      list = list.filter((m) => m.status === status);
    }
    return list;
  };

  ngOnInit(): void {
    this.loadMerchants();
  }

  private async loadMerchants(): Promise<void> {
    try {
      const data = await firstValueFrom(this.merchantRepo.findAll());
      this.merchants.set(Array.isArray(data) ? data : data?.data ?? []);
    } catch {
      this.merchants.set([]);
    }
  }

  async approve(merchant: Merchant): Promise<void> {
    try {
      await firstValueFrom(this.merchantRepo.updateKyc(merchant.id));
      this.merchants.update((list) =>
        list.map((m) => (m.id === merchant.id ? { ...m, status: 'approved' as Merchant['status'] } : m))
      );
    } catch {
      // Error handled silently; in production show a toast
    }
  }

  async reject(merchant: Merchant): Promise<void> {
    // The API does not expose a dedicated reject endpoint; update locally
    this.merchants.update((list) =>
      list.map((m) => (m.id === merchant.id ? { ...m, status: 'rejected' as Merchant['status'] } : m))
    );
  }

  viewDetails(merchant: Merchant): void {
    // Navigate to detail view
    alert(`Merchant details for ${merchant.businessName}`);
  }

  trackByMerchantId(_index: number, merchant: Merchant): string {
    return merchant.id;
  }
}
