import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DashboardStatus,
  DataTableShellComponent,
  FilterBarComponent,
  PageHeaderComponent,
  SidePanelComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { AuditLogsFacade } from '../../../application/audit-logs.facade';
import { AuditLog } from '../../../domain/models/audit-log.models';
import { formatMaskedJson } from '../../../infrastructure/mappers/audit-log.mapper';

@Component({
  selector: 'app-audit-logs-page',
  imports: [
    CommonModule,
    DataTableShellComponent,
    FilterBarComponent,
    FormsModule,
    PageHeaderComponent,
    SidePanelComponent,
    StatusBadgeComponent,
  ],
  providers: [AuditLogsFacade],
  template: `
    <section class="audit-page">
      <app-owner-page-header
        title="سجلات التدقيق"
        description="تتبع آمن لأحداث المنصة مع إخفاء القيم الحساسة وعدم توفير أي إجراءات تعديل أو حذف."
        [breadcrumbs]="breadcrumbs"
      />

      <app-owner-data-table-shell
        [loading]="facade.logs().loading"
        [error]="!!facade.logs().error"
        [empty]="facade.empty()"
        loadingTitle="جاري تحميل سجلات التدقيق"
        loadingMessage="يتم تجهيز الأحداث حسب الفلاتر الحالية."
        emptyTitle="لا توجد سجلات تدقيق"
        emptyMessage="لا توجد نتائج مطابقة للفلاتر الحالية."
        errorTitle="تعذر تحميل سجلات التدقيق"
        [errorMessage]="facade.logs().error || ''"
      >
        <app-owner-filter-bar
          table-filters
          [showApply]="true"
          (filterApply)="applyFilters()"
          (filterReset)="resetFilters()"
        >
          <input
            filter-search
            class="audit-input"
            name="actor"
            [(ngModel)]="actor"
            placeholder="Actor name, email, or id"
          />
          <input
            filter-controls
            class="audit-input"
            name="tenant"
            [(ngModel)]="tenant"
            placeholder="Tenant name or id"
          />
          <input
            filter-controls
            class="audit-input"
            name="action"
            [(ngModel)]="action"
            placeholder="Action"
          />
          <input
            filter-controls
            class="audit-input"
            name="resourceType"
            [(ngModel)]="resourceType"
            placeholder="Resource type"
          />
          <input
            filter-controls
            class="audit-input"
            name="resourceId"
            [(ngModel)]="resourceId"
            placeholder="Resource id"
          />
          <input
            filter-controls
            class="audit-input"
            name="dateFrom"
            [(ngModel)]="dateFrom"
            type="date"
            aria-label="Date from"
          />
          <input
            filter-controls
            class="audit-input"
            name="dateTo"
            [(ngModel)]="dateTo"
            type="date"
            aria-label="Date to"
          />
          <select
            filter-controls
            class="audit-input"
            name="sortBy"
            [(ngModel)]="sortBy"
          >
            <option value="timestamp">Timestamp</option>
            <option value="action">Action</option>
            <option value="resourceType">Resource type</option>
            <option value="actor">Actor</option>
            <option value="tenant">Tenant</option>
          </select>
          <select
            filter-controls
            class="audit-input"
            name="sortDirection"
            [(ngModel)]="sortDirection"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </app-owner-filter-bar>

        <button
          table-retry
          state-action
          type="button"
          class="audit-action"
          (click)="reload()"
        >
          إعادة المحاولة
        </button>

        <table table-content class="audit-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Actor</th>
              <th>Tenant</th>
              <th>Resource</th>
              <th>Reason</th>
              <th>Time</th>
              <th>Status</th>
              <th>Values</th>
            </tr>
          </thead>
          <tbody>
            @for (log of facade.items(); track log.id || $index) {
              <tr>
                <td>
                  <strong>{{ log.action }}</strong>
                </td>
                <td>
                  <strong>{{ log.actor.name }}</strong>
                  <span>{{
                    log.actor.email || log.actor.id || 'No actor email'
                  }}</span>
                  <span>{{ log.actor.role }}</span>
                </td>
                <td>
                  <strong>{{ log.tenant?.name || 'Platform' }}</strong>
                  <span>{{
                    log.tenant?.slug || log.tenant?.id || 'No tenant'
                  }}</span>
                </td>
                <td>
                  <strong>{{ log.resourceType }}</strong>
                  <span>{{ log.resourceId || 'No resource id' }}</span>
                </td>
                <td class="reason">{{ log.reason || 'No reason provided' }}</td>
                <td>{{ formatDate(log.timestamp) }}</td>
                <td>
                  <app-owner-status-badge
                    [status]="badgeStatus(log)"
                    [label]="log.status || log.severity"
                  />
                </td>
                <td>
                  <details class="value-preview">
                    <summary>Preview</summary>
                    <pre>{{ previewValues(log) }}</pre>
                  </details>
                  <button
                    type="button"
                    class="audit-action audit-action--ghost"
                    (click)="facade.select(log)"
                  >
                    Details
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div table-pagination class="pagination">
          <button
            type="button"
            class="audit-action audit-action--ghost"
            [disabled]="(facade.query().page ?? 1) <= 1"
            (click)="previousPage()"
          >
            Previous
          </button>
          <span
            >Page {{ facade.logs().data?.page ?? facade.query().page ?? 1 }} /
            {{ totalPages() }}</span
          >
          <button
            type="button"
            class="audit-action audit-action--ghost"
            [disabled]="(facade.query().page ?? 1) >= totalPages()"
            (click)="nextPage()"
          >
            Next
          </button>
        </div>
      </app-owner-data-table-shell>

      <app-owner-side-panel
        [open]="!!facade.selected()"
        title="Audit log details"
        description="Full safe details with sensitive values masked."
        closeLabel="Close"
        (closed)="facade.closeDetails()"
      >
        @if (facade.selected(); as selected) {
          <dl class="details-grid">
            <dt>Action</dt>
            <dd>{{ selected.action }}</dd>
            <dt>Actor</dt>
            <dd>
              {{ selected.actor.name }} -
              {{ selected.actor.email || selected.actor.id || 'Unknown' }}
            </dd>
            <dt>Role</dt>
            <dd>{{ selected.actor.role }}</dd>
            <dt>Tenant</dt>
            <dd>{{ selected.tenant?.name || 'Platform' }}</dd>
            <dt>Resource</dt>
            <dd>
              {{ selected.resourceType }} / {{ selected.resourceId || 'N/A' }}
            </dd>
            <dt>Reason</dt>
            <dd>{{ selected.reason || 'No reason provided' }}</dd>
            <dt>Timestamp</dt>
            <dd>{{ formatDate(selected.timestamp) }}</dd>
            <dt>IP address</dt>
            <dd>{{ selected.ipAddress || 'Not available' }}</dd>
            <dt>User agent</dt>
            <dd>{{ selected.userAgent || 'Not available' }}</dd>
          </dl>
          <section class="json-section">
            <h3>Old value</h3>
            <pre>{{ formatJson(selected.oldValue) }}</pre>
          </section>
          <section class="json-section">
            <h3>New value</h3>
            <pre>{{ formatJson(selected.newValue) }}</pre>
          </section>
        }
      </app-owner-side-panel>
    </section>
  `,
  styles: [
    `
      .audit-page {
        display: grid;
        gap: 1rem;
      }
      .audit-input {
        min-inline-size: 10rem;
        padding: 0.68rem;
        color: var(--trackora-text);
        background: var(--trackora-surface);
        border: 1px solid var(--trackora-border);
        border-radius: 0.75rem;
      }
      .audit-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.65rem 0.9rem;
        color: var(--trackora-primary-contrast);
        background: var(--trackora-primary);
        border: 1px solid var(--trackora-primary);
        border-radius: 0.8rem;
        cursor: pointer;
        text-decoration: none;
        font-weight: 900;
      }
      .audit-action:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }
      .audit-action--ghost {
        color: var(--trackora-primary);
        background: var(--trackora-bg);
        border-color: var(--trackora-border);
      }
      .audit-table {
        inline-size: 100%;
        min-inline-size: 78rem;
        border-collapse: collapse;
        background: var(--trackora-bg);
      }
      th,
      td {
        padding: 0.85rem;
        border-block-end: 1px solid var(--trackora-border);
        text-align: start;
        vertical-align: top;
      }
      th {
        color: var(--trackora-text-secondary);
        font-size: 0.78rem;
        text-transform: uppercase;
      }
      td strong,
      td span {
        display: block;
      }
      td strong {
        color: var(--trackora-primary);
      }
      td span {
        margin-block-start: 0.25rem;
        color: var(--trackora-text-secondary);
        font-size: 0.86rem;
      }
      .reason {
        max-inline-size: 18rem;
        color: var(--trackora-text-secondary);
        line-height: 1.6;
      }
      .value-preview {
        margin-block-end: 0.6rem;
      }
      .value-preview summary {
        color: var(--trackora-primary);
        cursor: pointer;
        font-weight: 800;
      }
      pre {
        max-inline-size: 30rem;
        max-block-size: 18rem;
        overflow: auto;
        padding: 0.75rem;
        color: var(--trackora-text);
        background: var(--trackora-surface);
        border: 1px solid var(--trackora-border);
        border-radius: 0.75rem;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .pagination {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        color: var(--trackora-text-secondary);
        font-weight: 800;
      }
      .details-grid {
        display: grid;
        grid-template-columns: minmax(7rem, auto) 1fr;
        gap: 0.7rem 1rem;
        margin: 0;
      }
      dt {
        color: var(--trackora-text-secondary);
        font-weight: 800;
      }
      dd {
        margin: 0;
        color: var(--trackora-text);
        overflow-wrap: anywhere;
      }
      .json-section {
        margin-block-start: 1rem;
      }
      .json-section h3 {
        margin: 0 0 0.5rem;
        color: var(--trackora-primary);
        font-size: 1rem;
      }
      @media (max-width: 980px) {
        .pagination {
          justify-content: flex-start;
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class AuditLogsPageComponent implements OnInit {
  protected readonly facade = inject(AuditLogsFacade);
  protected readonly breadcrumbs = [
    { label: 'Owner', href: '/owner' },
    { label: 'Audit Logs' },
  ];

  protected actor = '';
  protected tenant = '';
  protected action = '';
  protected resourceType = '';
  protected resourceId = '';
  protected dateFrom = '';
  protected dateTo = '';
  protected sortBy:
    | 'timestamp'
    | 'action'
    | 'resourceType'
    | 'actor'
    | 'tenant' = 'timestamp';
  protected sortDirection: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {
    void this.facade.load();
  }

  protected applyFilters(): void {
    void this.facade.load({ ...this.filters(), page: 1 });
  }

  protected resetFilters(): void {
    this.actor = '';
    this.tenant = '';
    this.action = '';
    this.resourceType = '';
    this.resourceId = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.sortBy = 'timestamp';
    this.sortDirection = 'desc';
    void this.facade.load({ ...this.filters(), page: 1 });
  }

  protected reload(): void {
    void this.facade.load();
  }

  protected previousPage(): void {
    void this.facade.load({
      page: Math.max((this.facade.query().page ?? 1) - 1, 1),
    });
  }

  protected nextPage(): void {
    void this.facade.load({ page: (this.facade.query().page ?? 1) + 1 });
  }

  protected totalPages(): number {
    const data = this.facade.logs().data;
    if (!data) return 1;
    return Math.max(Math.ceil(data.total / Math.max(data.pageSize, 1)), 1);
  }

  protected formatDate(value: string | null): string {
    if (!value) return 'Not available';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);
  }

  protected badgeStatus(log: AuditLog): DashboardStatus {
    if (log.status) return log.status as DashboardStatus;
    return log.severity;
  }

  protected previewValues(log: AuditLog): string {
    return `Old: ${this.compact(log.oldValue)}\nNew: ${this.compact(log.newValue)}`;
  }

  protected formatJson(value: unknown): string {
    return formatMaskedJson(value);
  }

  private compact(value: unknown): string {
    const formatted = formatMaskedJson(value).replace(/\s+/g, ' ').trim();
    return formatted.length > 180 ? `${formatted.slice(0, 180)}...` : formatted;
  }

  private filters() {
    return {
      actor: this.actor,
      tenant: this.tenant,
      action: this.action,
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
    };
  }
}
