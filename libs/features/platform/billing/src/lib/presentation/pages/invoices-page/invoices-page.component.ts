import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DashboardStatus,
  DataTableShellComponent,
  FilterBarComponent,
  MetricGridComponent,
  PageHeaderComponent,
  StatCardComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { BillingFacade } from '../../../application/billing.facade';

@Component({
  selector: 'app-invoices-page',
  imports: [
    CommonModule,
    DataTableShellComponent,
    FilterBarComponent,
    FormsModule,
    MetricGridComponent,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent,
  ],
  providers: [BillingFacade],
  template: `
    <section class="invoices-page">
      <app-owner-page-header
        title="الفواتير"
        description="عرض فواتير المنصة والفواتير اليدوية المتاحة من API مع فلاتر مالية آمنة."
        [breadcrumbs]="breadcrumbs"
      />

      <app-owner-metric-grid>
        <app-owner-stat-card
          title="إجمالي الفواتير"
          [value]="facade.invoices().data?.total"
          severity="info"
          [loading]="facade.invoices().loading"
        />
        <app-owner-stat-card
          title="Paid"
          [value]="countPayment('PAID')"
          severity="success"
          [loading]="facade.invoices().loading"
        />
        <app-owner-stat-card
          title="Past due / failed"
          [value]="riskCount()"
          severity="warning"
          [loading]="facade.invoices().loading"
        />
      </app-owner-metric-grid>

      <app-owner-data-table-shell
        [loading]="facade.invoices().loading"
        [error]="!!facade.invoices().error"
        [empty]="facade.invoicesEmpty()"
        loadingTitle="جاري تحميل الفواتير"
        loadingMessage="يتم تجهيز قائمة الفواتير حسب الفلاتر الحالية."
        emptyTitle="لا توجد فواتير"
        emptyMessage="لا توجد نتائج مطابقة للفلاتر الحالية."
        errorTitle="تعذر تحميل الفواتير"
        [errorMessage]="facade.invoices().error || ''"
      >
        <app-owner-filter-bar
          table-filters
          [showApply]="true"
          (filterApply)="applyFilters()"
          (filterReset)="resetFilters()"
        >
          <input
            filter-search
            class="invoice-input"
            name="tenant"
            [(ngModel)]="tenant"
            placeholder="Tenant name or id"
          />
          <select
            filter-controls
            class="invoice-input"
            name="status"
            [(ngModel)]="status"
          >
            <option value="all">كل الحالات</option>
            <option value="DRAFT">Draft</option>
            <option value="OPEN">Open</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="VOID">Void</option>
            <option value="UNCOLLECTIBLE">Uncollectible</option>
          </select>
          <select
            filter-controls
            class="invoice-input"
            name="paymentStatus"
            [(ngModel)]="paymentStatus"
          >
            <option value="all">كل حالات الدفع</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="PAST_DUE">Past due</option>
            <option value="NOT_REQUIRED">Not required</option>
          </select>
          <input
            filter-controls
            class="invoice-input"
            name="dateFrom"
            [(ngModel)]="dateFrom"
            type="date"
            aria-label="Date from"
          />
          <input
            filter-controls
            class="invoice-input"
            name="dateTo"
            [(ngModel)]="dateTo"
            type="date"
            aria-label="Date to"
          />
        </app-owner-filter-bar>

        <button
          table-retry
          state-action
          type="button"
          class="invoice-action"
          (click)="reload()"
        >
          إعادة المحاولة
        </button>

        <table table-content class="invoices-table">
          <thead>
            <tr>
              <th>الفاتورة</th>
              <th>المستأجر</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>الدفع</th>
              <th>الاستحقاق</th>
              <th>الإنشاء</th>
            </tr>
          </thead>
          <tbody>
            @for (invoice of facade.invoiceItems(); track invoice.id) {
              <tr>
                <td>
                  <strong>{{ invoice.number }}</strong
                  ><span>{{ invoice.id }}</span>
                </td>
                <td>
                  <strong>{{ invoice.tenant.name }}</strong
                  ><span>{{ invoice.tenant.slug || invoice.tenant.id }}</span>
                </td>
                <td>
                  {{
                    formatMoney(invoice.amount.amount, invoice.amount.currency)
                  }}
                </td>
                <td>
                  <app-owner-status-badge
                    [status]="badgeStatus(invoice.status)"
                    [label]="invoice.status"
                  />
                </td>
                <td>
                  <app-owner-status-badge
                    [status]="badgeStatus(invoice.paymentStatus)"
                    [label]="invoice.paymentStatus"
                  />
                </td>
                <td>{{ formatDate(invoice.dueDate) }}</td>
                <td>{{ formatDate(invoice.createdAt) }}</td>
              </tr>
            }
          </tbody>
        </table>

        <div table-pagination class="pagination">
          <button
            type="button"
            class="invoice-action invoice-action--ghost"
            [disabled]="(facade.invoiceQuery().page ?? 1) <= 1"
            (click)="previousPage()"
          >
            Previous
          </button>
          <span
            >Page
            {{
              facade.invoices().data?.page ?? facade.invoiceQuery().page ?? 1
            }}
            / {{ totalPages() }}</span
          >
          <button
            type="button"
            class="invoice-action invoice-action--ghost"
            [disabled]="(facade.invoiceQuery().page ?? 1) >= totalPages()"
            (click)="nextPage()"
          >
            Next
          </button>
        </div>
      </app-owner-data-table-shell>
    </section>
  `,
  styles: [
    `
      .invoices-page {
        display: grid;
        gap: 1rem;
      }
      .invoice-input {
        min-inline-size: 10rem;
        padding: 0.68rem;
        color: var(--trackora-text);
        background: var(--trackora-surface);
        border: 1px solid var(--trackora-border);
        border-radius: 0.75rem;
      }
      .invoice-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.7rem 1rem;
        color: var(--trackora-primary-contrast);
        background: var(--trackora-primary);
        border: 1px solid var(--trackora-primary);
        border-radius: 0.8rem;
        cursor: pointer;
        text-decoration: none;
        font-weight: 900;
      }
      .invoice-action:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }
      .invoice-action--ghost {
        color: var(--trackora-primary);
        background: var(--trackora-bg);
        border-color: var(--trackora-border);
      }
      .invoices-table {
        inline-size: 100%;
        min-inline-size: 64rem;
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
      .pagination {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        color: var(--trackora-text-secondary);
      }
      @media (max-width: 760px) {
        .pagination {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class InvoicesPageComponent implements OnInit {
  readonly facade = inject(BillingFacade);
  readonly breadcrumbs = [{ label: 'المالك' }, { label: 'الفواتير' }];
  tenant = '';
  status = 'all';
  paymentStatus = 'all';
  dateFrom = '';
  dateTo = '';

  ngOnInit(): void {
    void this.facade.loadInvoices();
  }
  reload(): void {
    void this.facade.loadInvoices();
  }
  applyFilters(): void {
    void this.facade.loadInvoices({
      tenant: this.tenant,
      status: this.status,
      paymentStatus: this.paymentStatus,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      page: 1,
    });
  }
  resetFilters(): void {
    this.tenant = '';
    this.status = 'all';
    this.paymentStatus = 'all';
    this.dateFrom = '';
    this.dateTo = '';
    void this.facade.loadInvoices({
      tenant: '',
      status: 'all',
      paymentStatus: 'all',
      dateFrom: '',
      dateTo: '',
      page: 1,
    });
  }
  previousPage(): void {
    void this.facade.loadInvoices({
      page: Math.max((this.facade.invoiceQuery().page ?? 1) - 1, 1),
    });
  }
  nextPage(): void {
    void this.facade.loadInvoices({
      page: Math.min(
        (this.facade.invoiceQuery().page ?? 1) + 1,
        this.totalPages(),
      ),
    });
  }
  totalPages(): number {
    const data = this.facade.invoices().data;
    return Math.max(Math.ceil((data?.total ?? 0) / (data?.pageSize || 20)), 1);
  }
  countPayment(status: string): number {
    return this.facade
      .invoiceItems()
      .filter((invoice) => invoice.paymentStatus === status).length;
  }
  riskCount(): number {
    return this.facade
      .invoiceItems()
      .filter(
        (invoice) =>
          invoice.status === 'OVERDUE' ||
          invoice.paymentStatus === 'PAST_DUE' ||
          invoice.paymentStatus === 'FAILED',
      ).length;
  }
  badgeStatus(status: string): DashboardStatus {
    return status.toUpperCase() as DashboardStatus;
  }
  formatMoney(amount: number | null, currency = 'EGP'): string {
    return amount === null
      ? 'غير متاح'
      : new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: currency || 'EGP',
        }).format(amount);
  }
  formatDate(value: string | null): string {
    return value
      ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
          new Date(value),
        )
      : 'غير متاح';
  }
}
