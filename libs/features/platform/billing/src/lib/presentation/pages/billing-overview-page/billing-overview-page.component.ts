import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DataTableShellComponent,
  DashboardStatus,
  ErrorStateComponent,
  LoadingStateComponent,
  MetricGridComponent,
  PageHeaderComponent,
  SectionCardComponent,
  StatCardComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { BillingFacade } from '../../../application/billing.facade';
import { BillingMetric } from '../../../domain/models/billing.models';

@Component({
  selector: 'app-billing-overview-page',
  imports: [
    CommonModule,
    DataTableShellComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    MetricGridComponent,
    PageHeaderComponent,
    RouterLink,
    SectionCardComponent,
    StatCardComponent,
    StatusBadgeComponent,
  ],
  providers: [BillingFacade],
  template: `
    <section class="billing-page">
      <app-owner-page-header
        title="ملخص الفوترة"
        description="نظرة مالية آمنة على إيرادات المنصة، المستأجرين غير المسددين، والفواتير اليدوية المتاحة من API."
        [breadcrumbs]="breadcrumbs"
      >
        <button
          page-actions
          type="button"
          class="billing-action"
          disabled
          title="Live Swagger did not expose a confirmed export endpoint in this environment."
        >
          Export summary
        </button>
        <a
          page-actions
          class="billing-action billing-action--ghost"
          routerLink="/owner/invoices"
          >الفواتير</a
        >
      </app-owner-page-header>

      @if (facade.overview().loading) {
        <app-owner-loading-state
          title="جاري تحميل ملخص الفوترة"
          message="يتم تجهيز المؤشرات المالية بدون عرض بيانات دفع حساسة."
        />
      } @else if (facade.overview().error) {
        <app-owner-error-state
          title="تعذر تحميل ملخص الفوترة"
          [message]="facade.overview().error || ''"
        >
          <button
            state-action
            type="button"
            class="billing-action"
            (click)="load()"
          >
            إعادة المحاولة
          </button>
        </app-owner-error-state>
      } @else if (overview) {
        @if (overview.contractNotes.length) {
          <app-owner-section-card
            title="ملاحظة عقد API"
            description="لم يتم تأكيد endpoint التصدير من Swagger محلياً، لذلك لم يتم تفعيل أي مسار وهمي."
          >
            @for (note of overview.contractNotes; track note) {
              <p class="contract-note">{{ note }}</p>
            }
          </app-owner-section-card>
        }

        <app-owner-metric-grid>
          @for (metric of primaryMetrics; track metric.key) {
            <app-owner-stat-card
              [title]="metric.label"
              [value]="formatMetric(metric)"
              severity="info"
            />
          }
          <app-owner-stat-card
            title="Unpaid tenants"
            [value]="overview.unpaidTenants.length"
            severity="warning"
          />
          <app-owner-stat-card
            title="Past due tenants"
            [value]="overview.pastDueTenants.length"
            severity="danger"
          />
        </app-owner-metric-grid>

        @if (overview.revenue.length) {
          <app-owner-section-card
            title="Revenue summary"
            description="القيم المعروضة كما وفرها API بدون تفاصيل دفع خاصة."
          >
            <div class="metric-list">
              @for (metric of overview.revenue; track metric.key) {
                <span
                  ><strong>{{ metric.label }}</strong
                  >{{ formatMetric(metric) }}</span
                >
              }
            </div>
          </app-owner-section-card>
        }

        @if (overview.manualInvoiceSummary.length) {
          <app-owner-section-card
            title="Manual invoice summary"
            description="ملخص الفواتير اليدوية إذا كان مدعوماً من API."
          >
            <div class="metric-list">
              @for (metric of overview.manualInvoiceSummary; track metric.key) {
                <span
                  ><strong>{{ metric.label }}</strong
                  >{{ formatMetric(metric) }}</span
                >
              }
            </div>
          </app-owner-section-card>
        }

        @if (overview.alerts.length) {
          <app-owner-section-card
            title="Billing health"
            description="تنبيهات مالية وتشغيلية من الخادم."
          >
            <div class="alerts-list">
              @for (alert of overview.alerts; track alert.id) {
                <article>
                  <app-owner-status-badge
                    [status]="badgeStatus(alert.severity)"
                    [label]="alert.severity"
                  /><strong>{{ alert.title }}</strong>
                  <p>{{ alert.message }}</p>
                </article>
              }
            </div>
          </app-owner-section-card>
        }

        <app-owner-data-table-shell
          [loading]="false"
          [error]="false"
          [empty]="overview.unpaidTenants.length === 0"
          emptyTitle="لا يوجد مستأجرون غير مسددين"
          emptyMessage="لم يرجع API أي مستأجرين غير مسددين."
        >
          <h2 table-header>Unpaid tenants</h2>
          <table table-content class="billing-table">
            <thead>
              <tr>
                <th>المستأجر</th>
                <th>الحالة</th>
                <th>المبلغ</th>
                <th>تاريخ الاستحقاق</th>
                <th>الفواتير</th>
              </tr>
            </thead>
            <tbody>
              @for (tenant of overview.unpaidTenants; track tenant.id) {
                <tr>
                  <td>
                    <strong>{{ tenant.name }}</strong
                    ><span>{{ tenant.slug || tenant.id }}</span>
                  </td>
                  <td>
                    <app-owner-status-badge
                      [status]="badgeStatus(tenant.status)"
                      [label]="tenant.status"
                    />
                  </td>
                  <td>{{ formatMoney(tenant.amountDue, tenant.currency) }}</td>
                  <td>{{ formatDate(tenant.dueDate) }}</td>
                  <td>{{ tenant.invoiceCount ?? 'غير متاح' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </app-owner-data-table-shell>

        <app-owner-data-table-shell
          [loading]="false"
          [error]="false"
          [empty]="overview.pastDueTenants.length === 0"
          emptyTitle="لا يوجد مستأجرون متأخرون"
          emptyMessage="لم يرجع API أي حالات past due."
        >
          <h2 table-header>Past-due tenants</h2>
          <table table-content class="billing-table">
            <thead>
              <tr>
                <th>المستأجر</th>
                <th>الحالة</th>
                <th>المبلغ</th>
                <th>تاريخ الاستحقاق</th>
                <th>الفواتير</th>
              </tr>
            </thead>
            <tbody>
              @for (tenant of overview.pastDueTenants; track tenant.id) {
                <tr>
                  <td>
                    <strong>{{ tenant.name }}</strong
                    ><span>{{ tenant.slug || tenant.id }}</span>
                  </td>
                  <td>
                    <app-owner-status-badge
                      [status]="badgeStatus(tenant.status)"
                      [label]="tenant.status"
                    />
                  </td>
                  <td>{{ formatMoney(tenant.amountDue, tenant.currency) }}</td>
                  <td>{{ formatDate(tenant.dueDate) }}</td>
                  <td>{{ tenant.invoiceCount ?? 'غير متاح' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </app-owner-data-table-shell>
      }
    </section>
  `,
  styles: [
    `
      .billing-page {
        display: grid;
        gap: 1rem;
      }
      .billing-action {
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
      .billing-action--ghost {
        color: var(--trackora-primary);
        background: var(--trackora-bg);
        border-color: var(--trackora-border);
      }
      .billing-action:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }
      .contract-note {
        margin: 0;
        color: var(--trackora-text-secondary);
        line-height: 1.7;
      }
      .metric-list,
      .alerts-list {
        display: grid;
        gap: 0.75rem;
      }
      .metric-list {
        grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr));
      }
      .metric-list span,
      .alerts-list article {
        padding: 0.85rem;
        background: var(--trackora-surface);
        border: 1px solid var(--trackora-border);
        border-radius: 0.9rem;
      }
      .metric-list strong,
      .metric-list span {
        display: block;
      }
      .metric-list strong {
        color: var(--trackora-text-secondary);
      }
      .alerts-list article {
        display: grid;
        gap: 0.45rem;
      }
      .alerts-list strong,
      .alerts-list p {
        margin: 0;
      }
      .alerts-list strong {
        color: var(--trackora-primary);
      }
      .alerts-list p {
        color: var(--trackora-text-secondary);
      }
      .billing-table {
        inline-size: 100%;
        min-inline-size: 48rem;
        border-collapse: collapse;
        background: var(--trackora-bg);
      }
      h2 {
        margin: 0;
        color: var(--trackora-primary);
        font-size: 1.05rem;
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
    `,
  ],
})
export class BillingOverviewPageComponent implements OnInit {
  readonly facade = inject(BillingFacade);
  readonly breadcrumbs = [{ label: 'المالك' }, { label: 'الفوترة' }];

  get overview() {
    return this.facade.overview().data;
  }
  get primaryMetrics(): BillingMetric[] {
    return this.overview?.summary.slice(0, 6) ?? [];
  }
  ngOnInit(): void {
    void this.load();
  }
  load(): void {
    void this.facade.loadOverview();
  }
  badgeStatus(status: string): DashboardStatus {
    return status.toUpperCase() as DashboardStatus;
  }
  formatMetric(metric: BillingMetric): string {
    return typeof metric.value === 'number'
      ? this.formatMoney(metric.value, metric.currency)
      : metric.value || 'غير متاح';
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
