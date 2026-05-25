import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  DataTableShellComponent,
  DashboardStatus,
  FilterBarComponent,
  MetricGridComponent,
  PageHeaderComponent,
  StatCardComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { SubscriptionsFacade } from '../../../application/subscriptions.facade';

@Component({
  selector: 'app-subscriptions-list-page',
  imports: [CommonModule, DataTableShellComponent, FilterBarComponent, FormsModule, MetricGridComponent, PageHeaderComponent, RouterLink, StatCardComponent, StatusBadgeComponent],
  providers: [SubscriptionsFacade],
  template: `
    <section class="subscriptions-page">
      <app-owner-page-header
        title="إدارة الاشتراكات"
        description="متابعة اشتراكات المستأجرين، حالات الدفع، التجديد، والخطط المرتبطة."
        [breadcrumbs]="breadcrumbs"
      />

      <app-owner-metric-grid>
        <app-owner-stat-card title="إجمالي الاشتراكات" [value]="facade.list().data?.total" severity="info" [loading]="facade.list().loading" />
        <app-owner-stat-card title="نشطة" [value]="countStatus('ACTIVE')" severity="success" [loading]="facade.list().loading" />
        <app-owner-stat-card title="دفع متأخر" [value]="pastDueCount()" severity="warning" [loading]="facade.list().loading" />
      </app-owner-metric-grid>

      <app-owner-data-table-shell
        [loading]="facade.list().loading"
        [error]="!!facade.list().error"
        [empty]="facade.empty()"
        loadingTitle="جاري تحميل الاشتراكات"
        loadingMessage="يتم تجهيز قائمة الاشتراكات والفلاتر."
        emptyTitle="لا توجد اشتراكات"
        emptyMessage="لا توجد نتائج مطابقة للفلاتر الحالية."
        errorTitle="تعذر تحميل الاشتراكات"
        [errorMessage]="facade.list().error || ''"
      >
        <app-owner-filter-bar table-filters [showApply]="true" (filterApply)="applyFilters()" (filterReset)="resetFilters()">
          <input filter-search class="subscriptions-input" name="search" [(ngModel)]="search" placeholder="بحث باسم أو رابط المستأجر" />
          <select filter-controls class="subscriptions-input" name="status" [(ngModel)]="status">
            <option value="all">كل الحالات</option>
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Active</option>
            <option value="PAST_DUE">Past due</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <select filter-controls class="subscriptions-input" name="paymentStatus" [(ngModel)]="paymentStatus">
            <option value="all">كل حالات الدفع</option>
            <option value="NOT_REQUIRED">Not required</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="PAST_DUE">Past due</option>
          </select>
          <input filter-controls class="subscriptions-input" name="tenantId" [(ngModel)]="tenantId" placeholder="Tenant ID" />
          <input filter-controls class="subscriptions-input" name="planId" [(ngModel)]="planId" placeholder="Plan ID" />
          <input filter-controls class="subscriptions-input" name="periodFrom" [(ngModel)]="periodFrom" type="date" aria-label="Period from" />
          <input filter-controls class="subscriptions-input" name="periodTo" [(ngModel)]="periodTo" type="date" aria-label="Period to" />
          <select filter-controls class="subscriptions-input" name="sort" [(ngModel)]="sort">
            <option value="createdAt">Sort by created</option>
            <option value="updatedAt">Sort by updated</option>
            <option value="tenantName">Sort by tenant</option>
            <option value="status">Sort by status</option>
            <option value="paymentStatus">Sort by payment</option>
            <option value="renewalDate">Sort by renewal</option>
          </select>
        </app-owner-filter-bar>

        <button table-retry state-action type="button" class="subscriptions-action" (click)="reload()">إعادة المحاولة</button>

        <table table-content class="subscriptions-table">
          <thead>
            <tr>
              <th>المستأجر</th>
              <th>الخطة</th>
              <th>الحالة</th>
              <th>الدفع</th>
              <th>التجديد / الفترة</th>
              <th>آخر تحديث</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            @for (subscription of facade.subscriptions(); track subscription.id) {
              <tr>
                <td><strong>{{ subscription.tenant.name }}</strong><span>{{ subscription.tenant.slug || subscription.tenant.id }}</span></td>
                <td><strong>{{ subscription.plan.name }}</strong><span>{{ subscription.plan.code || subscription.plan.id }}</span></td>
                <td><app-owner-status-badge [status]="badgeStatus(subscription.status)" [label]="subscription.status" /></td>
                <td><app-owner-status-badge [status]="badgeStatus(subscription.paymentStatus)" [label]="subscription.paymentStatus" /></td>
                <td><strong>{{ formatDate(subscription.renewalDate || subscription.currentPeriodEnd) }}</strong><span>{{ formatDate(subscription.currentPeriodStart) }} - {{ formatDate(subscription.currentPeriodEnd) }}</span></td>
                <td>{{ formatDate(subscription.updatedAt) }}</td>
                <td><a [routerLink]="['/owner/subscriptions', subscription.id]">Details</a></td>
              </tr>
            }
          </tbody>
        </table>

        <div table-pagination class="pagination">
          <button type="button" class="subscriptions-action subscriptions-action--ghost" [disabled]="(facade.query().page ?? 1) <= 1" (click)="previousPage()">Previous</button>
          <span>Page {{ facade.list().data?.page ?? facade.query().page ?? 1 }} / {{ totalPages() }}</span>
          <button type="button" class="subscriptions-action subscriptions-action--ghost" [disabled]="(facade.query().page ?? 1) >= totalPages()" (click)="nextPage()">Next</button>
        </div>
      </app-owner-data-table-shell>
    </section>
  `,
  styles: [`
    .subscriptions-page { display: grid; gap: 1rem; }
    .subscriptions-input { min-inline-size: 10rem; padding: 0.68rem; color: var(--trackora-text); background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.75rem; }
    .subscriptions-action { display: inline-flex; align-items: center; justify-content: center; padding: 0.7rem 1rem; color: var(--trackora-primary-contrast); background: var(--trackora-primary); border: 1px solid var(--trackora-primary); border-radius: 0.8rem; cursor: pointer; text-decoration: none; font-weight: 900; }
    .subscriptions-action:disabled { cursor: not-allowed; opacity: 0.55; }
    .subscriptions-action--ghost { color: var(--trackora-primary); background: var(--trackora-bg); border-color: var(--trackora-border); }
    .subscriptions-table { inline-size: 100%; min-inline-size: 62rem; border-collapse: collapse; background: var(--trackora-bg); }
    th, td { padding: 0.85rem; border-block-end: 1px solid var(--trackora-border); text-align: start; vertical-align: top; }
    th { color: var(--trackora-text-secondary); font-size: 0.78rem; text-transform: uppercase; }
    td { color: var(--trackora-text); }
    td strong, td span { display: block; }
    td strong { color: var(--trackora-primary); }
    td span { margin-block-start: 0.25rem; color: var(--trackora-text-secondary); font-size: 0.86rem; }
    td a { color: var(--trackora-primary); font-weight: 900; }
    .pagination { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; color: var(--trackora-text-secondary); }
    @media (max-width: 760px) { .pagination { justify-content: flex-start; } }
  `],
})
export class SubscriptionsListPageComponent implements OnInit {
  readonly facade = inject(SubscriptionsFacade);
  readonly breadcrumbs = [{ label: 'المالك' }, { label: 'الاشتراكات' }];
  search = '';
  status = 'all';
  paymentStatus = 'all';
  tenantId = '';
  planId = '';
  periodFrom = '';
  periodTo = '';
  sort: 'createdAt' | 'updatedAt' | 'tenantName' | 'status' | 'paymentStatus' | 'renewalDate' = 'createdAt';

  ngOnInit(): void { void this.facade.loadList(); }
  reload(): void { void this.facade.loadList(); }
  applyFilters(): void { void this.facade.loadList({ search: this.search, status: this.status, paymentStatus: this.paymentStatus, tenantId: this.tenantId, planId: this.planId, periodFrom: this.periodFrom, periodTo: this.periodTo, sort: this.sort, page: 1 }); }
  resetFilters(): void { this.search = ''; this.status = 'all'; this.paymentStatus = 'all'; this.tenantId = ''; this.planId = ''; this.periodFrom = ''; this.periodTo = ''; this.sort = 'createdAt'; void this.facade.loadList({ search: '', status: 'all', paymentStatus: 'all', tenantId: '', planId: '', periodFrom: '', periodTo: '', sort: 'createdAt', page: 1 }); }
  previousPage(): void { void this.facade.loadList({ page: Math.max((this.facade.query().page ?? 1) - 1, 1) }); }
  nextPage(): void { void this.facade.loadList({ page: Math.min((this.facade.query().page ?? 1) + 1, this.totalPages()) }); }
  totalPages(): number { const data = this.facade.list().data; return Math.max(Math.ceil((data?.total ?? 0) / (data?.pageSize || 20)), 1); }
  countStatus(status: string): number { return this.facade.subscriptions().filter((subscription) => subscription.status === status).length; }
  pastDueCount(): number { return this.facade.subscriptions().filter((subscription) => subscription.status === 'PAST_DUE' || subscription.paymentStatus === 'PAST_DUE' || subscription.paymentStatus === 'FAILED').length; }
  formatDate(value: string | null): string { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'غير متاح'; }
  badgeStatus(status: string): DashboardStatus { return status as DashboardStatus; }
}
