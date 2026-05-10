import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AdminRepository } from '@trackora/shared/data-access';
import { LocalDatePipe } from '@trackora/shared/ui';
import { firstValueFrom } from 'rxjs';

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
  imports: [CommonModule, TranslateModule, LocalDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
          (input)="searchQuery.set(($any($event.target).value))"
        />
        <select [value]="actionFilter()" (change)="actionFilter.set(($any($event.target).value))">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="APPROVE">Approve</option>
          <option value="REJECT">Reject</option>
          <option value="LOGIN">Login</option>
        </select>
        <select [value]="entityFilter()" (change)="entityFilter.set(($any($event.target).value))">
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
            <tr *ngFor="let log of filteredLogs(); trackBy: trackByLogId">
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
  private readonly adminRepo = inject(AdminRepository);

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
    this.loadLogs();
  }

  private async loadLogs(): Promise<void> {
    try {
      const response = await firstValueFrom(this.adminRepo.getAuditLogs({ page: 1, limit: 100 }));
      const auditLogs = response?.data ?? response ?? [];
      this.logs.set(auditLogs as AuditLogEntry[]);
      this.totalPages.set(Math.ceil(auditLogs.length / this.pageSize));
    } catch {
      this.logs.set([]);
      this.totalPages.set(1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }

  trackByLogId(_index: number, log: AuditLogEntry): string {
    return log.id;
  }
}
