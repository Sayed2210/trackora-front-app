import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LocalDatePipe } from '@trackora/shared/ui';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
}

@Component({
  selector: 'app-audit-logs-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, LocalDatePipe],
  template: `
    <div class="audit-logs-page">
      <div class="page-header">
        <h1>Audit Logs</h1>
      </div>

      <div class="filters-bar">
        <input
          type="text"
          placeholder="Search actor, action, or entity..."
          [value]="searchQuery()"
          (input)="searchQuery.set(($any($event.target).value)"
        />
        <select [value]="actionFilter()" (change)="actionFilter.set(($any($event.target).value)">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="APPROVE">Approve</option>
          <option value="REJECT">Reject</option>
          <option value="LOGIN">Login</option>
        </select>
        <select [value]="entityFilter()" (change)="entityFilter.set(($any($event.target).value)">
          <option value="">All Entities</option>
          <option value="SHIPMENT">Shipment</option>
          <option value="USER">User</option>
          <option value="PAYOUT">Payout</option>
          <option value="WALLET">Wallet</option>
        </select>
      </div>

      <div class="logs-table-wrapper">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of filteredLogs()">
              <td class="time-cell">{{ log.timestamp | localDate }}</td>
              <td>
                <div class="actor-name">{{ log.actor }}</div>
                <div class="actor-role">{{ log.actorRole }}</div>
              </td>
              <td>
                <span class="action-badge" [class]="log.action.toLowerCase()">{{ log.action }}</span>
              </td>
              <td>
                <div class="entity-type">{{ log.entityType }}</div>
                <div class="entity-id">{{ log.entityId }}</div>
              </td>
              <td class="details-cell">{{ log.details }}</td>
              <td class="ip-cell">{{ log.ipAddress || '-' }}</td>
            </tr>
            <tr *ngIf="!filteredLogs().length">
              <td colspan="6" class="empty-cell">No audit logs found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" *ngIf="totalPages() > 1">
        <button (click)="prevPage()" [disabled]="currentPage() === 1">Previous</button>
        <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
        <button (click)="nextPage()" [disabled]="currentPage() === totalPages()">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .audit-logs-page { padding: 1rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .filters-bar { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .filters-bar input, .filters-bar select { padding: 0.5rem; border: 1px solid var(--trackora-border); border-radius: 8px; font-size: 0.875rem; }
    .filters-bar input { min-width: 220px; }
    .logs-table-wrapper { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; overflow-x: auto; }
    .logs-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .logs-table th { text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--trackora-border); color: var(--trackora-text-secondary); font-weight: 600; white-space: nowrap; }
    .logs-table td { padding: 0.75rem; border-bottom: 1px solid var(--trackora-border); vertical-align: top; }
    .time-cell { white-space: nowrap; font-size: 0.75rem; color: var(--trackora-text-secondary); }
    .actor-name { font-weight: 600; }
    .actor-role { font-size: 0.75rem; color: var(--trackora-text-secondary); }
    .action-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .action-badge.create { background: #D1FAE5; color: #065F46; }
    .action-badge.update { background: #E0E7FF; color: #3730A3; }
    .action-badge.delete { background: #FEE2E2; color: #991B1B; }
    .action-badge.approve { background: #D1FAE5; color: #065F46; }
    .action-badge.reject { background: #FEE2E2; color: #991B1B; }
    .action-badge.login { background: #F3F4F6; color: #4B5563; }
    .entity-type { font-weight: 500; }
    .entity-id { font-size: 0.75rem; color: var(--trackora-text-secondary); }
    .details-cell { max-width: 300px; word-break: break-word; }
    .ip-cell { font-size: 0.75rem; color: var(--trackora-text-secondary); white-space: nowrap; }
    .empty-cell { text-align: center; padding: 2rem; color: var(--trackora-text-secondary); }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1rem; }
    .pagination button { padding: 0.5rem 1rem; background: white; border: 1px solid var(--trackora-border); border-radius: 6px; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class AuditLogsPageComponent implements OnInit {
  readonly logs = signal<AuditLogEntry[]>([]);
  readonly searchQuery = signal('');
  readonly actionFilter = signal('');
  readonly entityFilter = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 20;
  readonly totalPages = signal(1);

  readonly filteredLogs = () => {
    let list = this.logs();
    const query = this.searchQuery().toLowerCase();
    if (query) {
      list = list.filter(
        (l) =>
          l.actor.toLowerCase().includes(query) ||
          l.action.toLowerCase().includes(query) ||
          l.entityType.toLowerCase().includes(query) ||
          l.entityId.toLowerCase().includes(query) ||
          l.details.toLowerCase().includes(query)
      );
    }
    if (this.actionFilter()) {
      list = list.filter((l) => l.action === this.actionFilter());
    }
    if (this.entityFilter()) {
      list = list.filter((l) => l.entityType === this.entityFilter());
    }
    return list.slice((this.currentPage() - 1) * this.pageSize, this.currentPage() * this.pageSize);
  };

  ngOnInit(): void {
    this.loadMockLogs();
  }

  private loadMockLogs(): void {
    const mock: AuditLogEntry[] = [
      { id: '1', timestamp: new Date(Date.now() - 300000).toISOString(), actor: 'Admin User', actorRole: 'ADMIN', action: 'UPDATE', entityType: 'SHIPMENT', entityId: 'TRK-1001', details: 'Status changed from PENDING to OUT_FOR_DELIVERY', ipAddress: '192.168.1.10' },
      { id: '2', timestamp: new Date(Date.now() - 600000).toISOString(), actor: 'System', actorRole: 'SYSTEM', action: 'CREATE', entityType: 'SHIPMENT', entityId: 'TRK-1050', details: 'Auto-created from merchant API', ipAddress: '-' },
      { id: '3', timestamp: new Date(Date.now() - 900000).toISOString(), actor: 'Sarah Manager', actorRole: 'ADMIN', action: 'APPROVE', entityType: 'PAYOUT', entityId: 'PAY-0012', details: 'Payout approved for merchant M-001, amount: 12,500 EGP', ipAddress: '192.168.1.15' },
      { id: '4', timestamp: new Date(Date.now() - 1200000).toISOString(), actor: 'Ahmed Hassan', actorRole: 'COURIER', action: 'UPDATE', entityType: 'SHIPMENT', entityId: 'TRK-1023', details: 'Marked as DELIVERED with COD 150 EGP', ipAddress: '10.0.0.5' },
      { id: '5', timestamp: new Date(Date.now() - 1800000).toISOString(), actor: 'Mohamed Ali', actorRole: 'MERCHANT', action: 'LOGIN', entityType: 'USER', entityId: 'M-002', details: 'Successful login from Chrome / Windows', ipAddress: '197.32.10.5' },
      { id: '6', timestamp: new Date(Date.now() - 2400000).toISOString(), actor: 'Admin User', actorRole: 'ADMIN', action: 'REJECT', entityType: 'PAYOUT', entityId: 'PAY-0011', details: 'Payout rejected - insufficient balance', ipAddress: '192.168.1.10' },
      { id: '7', timestamp: new Date(Date.now() - 3600000).toISOString(), actor: 'System', actorRole: 'SYSTEM', action: 'DELETE', entityType: 'USER', entityId: 'M-099', details: 'Inactive merchant account removed after 90 days', ipAddress: '-' },
      { id: '8', timestamp: new Date(Date.now() - 7200000).toISOString(), actor: 'Khaled Ibrahim', actorRole: 'COURIER', action: 'UPDATE', entityType: 'SHIPMENT', entityId: 'TRK-1045', details: 'Marked as FAILED - customer not available', ipAddress: '10.0.0.8' },
    ];
    this.logs.set(mock);
    this.totalPages.set(Math.ceil(mock.length / this.pageSize));
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }
}
