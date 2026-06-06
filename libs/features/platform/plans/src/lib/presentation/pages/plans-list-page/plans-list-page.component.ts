import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ActionMenuComponent,
  ActionMenuItem,
  ConfirmationDialogComponent,
  DataTableShellComponent,
  FilterBarComponent,
  MetricGridComponent,
  PageHeaderComponent,
  StatCardComponent,
  StatusBadgeComponent,
} from '../../components/dashboard-ui';
import { PlansFacade } from '../../../application/plans.facade';
import { PlatformPlan } from '../../../domain/models/platform-plan.models';
import { formatLimit, formatMoney, formatYearlyMoney } from '../../components/plan-ui.helpers';

@Component({
  selector: 'app-plans-list-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ActionMenuComponent,
    ConfirmationDialogComponent,
    DataTableShellComponent,
    FilterBarComponent,
    MetricGridComponent,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent,
  ],
  providers: [PlansFacade],
  template: `
    <section class="plans-page">
      <app-owner-page-header
        title="إدارة الخطط"
        description="إنشاء ومراجعة وأرشفة خطط الاشتراك وحدودها وصلاحيات الميزات."
        [breadcrumbs]="breadcrumbs"
      >
        @if (canManage) { <a page-actions class="plans-action" routerLink="/owner/plans/create">إنشاء خطة</a> }
      </app-owner-page-header>

      <app-owner-metric-grid>
        <app-owner-stat-card title="إجمالي الخطط" [value]="facade.list().data?.total" severity="info" [loading]="facade.list().loading" />
        <app-owner-stat-card title="الخطط النشطة" [value]="activeCount()" severity="success" [loading]="facade.list().loading" />
        <app-owner-stat-card title="خطط الموقع" [value]="publicCount()" severity="info" [loading]="facade.list().loading" />
        <app-owner-stat-card title="المؤرشفة" [value]="archivedCount()" severity="warning" [loading]="facade.list().loading" />
      </app-owner-metric-grid>

      <app-owner-data-table-shell
        [loading]="facade.list().loading"
        [error]="!!facade.list().error"
        [empty]="facade.empty()"
        loadingTitle="جاري تحميل الخطط"
        emptyTitle="لا توجد خطط"
        emptyMessage="أنشئ أول خطة اشتراك للمنصة."
        errorTitle="تعذر تحميل الخطط"
        [errorMessage]="facade.list().error || ''"
      >
        <app-owner-filter-bar table-filters [showApply]="true" (filterApply)="applyFilters()" (filterReset)="resetFilters()">
          <input filter-search class="plans-input" name="search" [(ngModel)]="search" placeholder="بحث بالاسم أو الكود" />
          <select filter-controls class="plans-input" name="status" [(ngModel)]="status">
            <option value="all">كل الحالات</option>
            <option value="active">نشطة</option>
            <option value="archived">مؤرشفة</option>
          </select>
          <select filter-controls class="plans-input" name="billingCycle" [(ngModel)]="billingCycle">
            <option value="all">كل دورات الفوترة</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <select filter-controls class="plans-input" name="sort" [(ngModel)]="sort">
            <option value="name">Sort by name</option>
            <option value="code">Sort by code</option>
            <option value="price">Sort by price</option>
            <option value="billingCycle">Sort by billing cycle</option>
            <option value="createdAt">Sort by created date</option>
          </select>
        </app-owner-filter-bar>

        <button table-retry state-action type="button" class="plans-action" (click)="reload()">إعادة المحاولة</button>
        @if (canManage) { <a table-empty-action state-action class="plans-action" routerLink="/owner/plans/create">إنشاء خطة</a> }

        <div table-content class="plans-grid">
          @for (plan of facade.plans(); track plan.id) {
            <article class="plan-card">
              <header>
                <div>
                  <h2>{{ plan.name }}</h2>
                  <span>{{ plan.code || 'no-code' }}</span>
                </div>
                <app-owner-status-badge [status]="plan.archived ? 'warning' : plan.active ? 'success' : 'neutral'" [label]="plan.archived ? 'Archived' : plan.active ? 'Active' : 'Inactive'" />
              </header>
              <strong>{{ formatMoney(plan) }}</strong>
              <p>{{ plan.billingCycle }} · {{ plan.currency }} · yearly {{ formatYearlyMoney(plan) }}</p>
              <div class="plan-card__badges">
                <span [class.plan-card__badge--public]="plan.isPublic">{{ plan.isPublic ? 'Website public' : 'Website private' }}</span>
                @if (plan.isPopular) { <span class="plan-card__badge--popular">Popular</span> }
                <span>Order {{ plan.sortOrder }}</span>
              </div>
              <dl>
                <div><dt>Shipments</dt><dd>{{ formatLimit(plan.limits.monthlyShipments) }}</dd></div>
                <div><dt>Admins</dt><dd>{{ formatLimit(plan.limits.maxAdmins) }}</dd></div>
                <div><dt>Merchants</dt><dd>{{ formatLimit(plan.limits.maxMerchants) }}</dd></div>
                <div><dt>Couriers</dt><dd>{{ formatLimit(plan.limits.maxCouriers) }}</dd></div>
              </dl>
              <div class="plan-card__features">
                @for (feature of plan.entitlements.slice(0, 4); track feature) { <span>{{ feature }}</span> }
                @if (plan.entitlements.length > 4) { <span>+{{ plan.entitlements.length - 4 }}</span> }
              </div>
              <footer>
                <a [routerLink]="['/owner/plans', plan.id]">Details</a>
                @if (canManage) {
                  <a [routerLink]="['/owner/plans', plan.id, 'edit']">Edit</a>
                  <app-owner-action-menu [items]="actionItems(plan)" (selected)="handleAction(plan, $event)" />
                }
              </footer>
            </article>
          }
        </div>
      </app-owner-data-table-shell>

      <app-owner-confirmation-dialog
        [open]="!!pendingArchive()"
        title="أرشفة الخطة؟"
        [message]="archiveMessage()"
        confirmLabel="أرشفة"
        cancelLabel="إلغاء"
        severity="danger"
        (confirmationConfirm)="confirmArchive()"
        (confirmationCancel)="pendingArchive.set(null)"
      />
    </section>
  `,
  styles: [
    `
      .plans-page { display: grid; gap: 1rem; }
      .plans-action { display: inline-flex; align-items: center; justify-content: center; padding: 0.72rem 1rem; color: var(--trackora-primary-contrast); background: var(--trackora-primary); border: 1px solid var(--trackora-primary); border-radius: 0.8rem; text-decoration: none; cursor: pointer; font-weight: 900; }
      .plans-input { min-inline-size: 11rem; padding: 0.68rem; color: var(--trackora-text); background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.75rem; }
      .plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(19rem, 100%), 1fr)); gap: 1rem; padding: 1rem; }
      .plan-card { display: grid; gap: 0.85rem; padding: 1rem; background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 1rem; }
      .plan-card header, .plan-card footer { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
      h2, p, dl { margin: 0; }
      h2 { color: var(--trackora-primary); font-size: 1.2rem; }
      header span, p, dt { color: var(--trackora-text-secondary); }
      strong { color: var(--trackora-primary); font-family: var(--font-header); font-size: 1.8rem; }
      dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.55rem; }
      dl div { padding: 0.65rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.75rem; }
      dd { margin: 0.2rem 0 0; color: var(--trackora-primary); font-weight: 900; }
      .plan-card__features { display: flex; flex-wrap: wrap; gap: 0.4rem; }
      .plan-card__features span { padding: 0.32rem 0.5rem; color: var(--trackora-primary); background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 999px; font-size: 0.78rem; font-weight: 800; }
      .plan-card__badges { display: flex; flex-wrap: wrap; gap: 0.4rem; }
      .plan-card__badges span { padding: 0.32rem 0.5rem; color: var(--trackora-text-secondary); background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 999px; font-size: 0.78rem; font-weight: 800; }
      .plan-card__badges .plan-card__badge--public { color: var(--trackora-success); }
      .plan-card__badges .plan-card__badge--popular { color: var(--trackora-warning); }
      footer a { color: var(--trackora-primary); font-weight: 900; }
    `,
  ],
})
export class PlansListPageComponent implements OnInit {
  readonly facade = inject(PlansFacade);
  readonly pendingArchive = signal<PlatformPlan | null>(null);
  readonly breadcrumbs = [{ label: 'المالك' }, { label: 'الخطط' }];
  readonly canManage = true;
  search = '';
  status: 'all' | 'active' | 'archived' = 'all';
  billingCycle = 'all';
  sort: 'name' | 'code' | 'price' | 'billingCycle' | 'createdAt' = 'name';
  readonly formatLimit = formatLimit;
  readonly formatMoney = formatMoney;
  readonly formatYearlyMoney = formatYearlyMoney;

  ngOnInit(): void { void this.facade.loadList(); }
  reload(): void { void this.facade.loadList(); }
  applyFilters(): void { void this.facade.loadList({ search: this.search, status: this.status, billingCycle: this.billingCycle, sort: this.sort }); }
  resetFilters(): void { this.search = ''; this.status = 'all'; this.billingCycle = 'all'; this.sort = 'name'; void this.facade.loadList({ search: '', status: 'all', billingCycle: 'all', sort: 'name', page: 1 }); }
  activeCount(): number { return this.facade.plans().filter((plan) => plan.active && !plan.archived).length; }
  publicCount(): number { return this.facade.plans().filter((plan) => plan.isPublic && !plan.archived).length; }
  archivedCount(): number { return this.facade.plans().filter((plan) => plan.archived).length; }
  actionItems(plan: PlatformPlan): ActionMenuItem[] { return [{ label: 'Edit' }, { label: plan.archived ? 'Archived' : 'Archive', severity: 'danger', disabled: plan.archived }]; }
  handleAction(plan: PlatformPlan, item: ActionMenuItem): void { if (item.label === 'Archive') this.pendingArchive.set(plan); }
  archiveMessage(): string { return `لن يتم إخفاء أي تعارض من الخادم عند أرشفة ${this.pendingArchive()?.name ?? 'هذه الخطة'}.`; }
  async confirmArchive(): Promise<void> { const plan = this.pendingArchive(); if (!plan) return; await this.facade.archive(plan.id); this.pendingArchive.set(null); }
}
