import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  governorate: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  totalShipments: number;
  walletBalance: number;
  joinedAt: string;
}

@Component({
  selector: 'app-merchant-management-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="merchant-management">
      <div class="page-header">
        <h1>Merchant Management</h1>
      </div>

      <div class="filters-bar">
        <input type="text" placeholder="Search merchants..." class="search-input" />
        <select class="filter-select">
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
            <th>Merchant</th>
            <th>Contact</th>
            <th>Location</th>
            <th>Status</th>
            <th>Shipments</th>
            <th>Wallet</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let merchant of merchants()">
            <td>
              <div class="merchant-info">
                <span class="avatar">{{ merchant.name.charAt(0) }}</span>
                <div>
                  <div class="name">{{ merchant.name }}</div>
                  <small>{{ merchant.businessName }}</small>
                </div>
              </div>
            </td>
            <td>
              <div class="contact">
                <span>{{ merchant.email }}</span>
                <span>{{ merchant.phone }}</span>
              </div>
            </td>
            <td>{{ merchant.governorate }}</td>
            <td>
              <span class="status-badge" [class]="merchant.status">{{ merchant.status }}</span>
            </td>
            <td>{{ merchant.totalShipments }}</td>
            <td>{{ merchant.walletBalance | currency:'EGP':'symbol':'1.0-0' }}</td>
            <td>
              <div class="actions">
                <button *ngIf="merchant.status === 'pending'" class="action-btn approve" (click)="approve(merchant)">Approve</button>
                <button *ngIf="merchant.status === 'pending'" class="action-btn reject" (click)="reject(merchant)">Reject</button>
                <button class="action-btn" (click)="viewDetails(merchant)">View</button>
              </div>
            </td>
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
    .contact { display: flex; flex-direction: column; font-size: 0.875rem; }
    .status-badge { padding: 0.25rem 0.625rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .pending { background: #FEF3C7; color: #92400E; }
    .approved { background: #D1FAE5; color: #065F46; }
    .rejected { background: #FEE2E2; color: #991B1B; }
    .suspended { background: #F3F4F6; color: #4B5563; }
    .actions { display: flex; gap: 0.5rem; }
    .action-btn { padding: 0.375rem 0.75rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
    .action-btn.approve { background: #D1FAE5; color: #065F46; border-color: #065F46; }
    .action-btn.reject { background: #FEE2E2; color: #991B1B; border-color: #991B1B; }
  `],
})
export class MerchantManagementPageComponent {
  readonly merchants = signal<Merchant[]>([
    {
      id: 'm1',
      name: 'TechStore Egypt',
      email: 'info@techstore.eg',
      phone: '01001112233',
      businessName: 'TechStore Egypt LLC',
      governorate: 'Cairo',
      status: 'approved',
      totalShipments: 1240,
      walletBalance: 45200,
      joinedAt: '2023-06-01',
    },
    {
      id: 'm2',
      name: 'Fashion Hub',
      email: 'contact@fashionhub.eg',
      phone: '01002223344',
      businessName: 'Fashion Hub Co.',
      governorate: 'Alexandria',
      status: 'pending',
      totalShipments: 0,
      walletBalance: 0,
      joinedAt: '2024-05-01',
    },
    {
      id: 'm3',
      name: 'Green Grocery',
      email: 'orders@greengrcoery.eg',
      phone: '01003334455',
      businessName: 'Green Grocery Market',
      governorate: 'Giza',
      status: 'approved',
      totalShipments: 856,
      walletBalance: 12800,
      joinedAt: '2023-09-15',
    },
  ]);

  approve(merchant: Merchant): void {
    this.merchants.update((list) =>
      list.map((m) => (m.id === merchant.id ? { ...m, status: 'approved' as Merchant['status'] } : m))
    );
  }

  reject(merchant: Merchant): void {
    this.merchants.update((list) =>
      list.map((m) => (m.id === merchant.id ? { ...m, status: 'rejected' as Merchant['status'] } : m))
    );
  }

  viewDetails(merchant: Merchant): void {
    // Navigate to detail view
  }
}
