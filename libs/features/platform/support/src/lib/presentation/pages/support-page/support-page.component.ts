import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import {
  ConfirmationDialogComponent,
  DashboardStatus,
  DataTableShellComponent,
  FilterBarComponent,
  PageHeaderComponent,
  ReasonRequiredDialogComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { SupportFacade } from '../../../application/support.facade';
import { SupportTenantSummary } from '../../../domain/models/support.models';
import { IMPERSONATE_TENANT_ADMIN_PERMISSION } from '../../support-permissions';

export const supportStyles = `
  .support-page { display: grid; gap: 1rem; }
  .support-input { min-inline-size: 18rem; padding: 0.68rem; color: var(--trackora-text); background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.75rem; }
  .support-action { display: inline-flex; align-items: center; justify-content: center; padding: 0.68rem 0.95rem; color: var(--trackora-primary-contrast); background: var(--trackora-primary); border: 1px solid var(--trackora-primary); border-radius: 0.8rem; cursor: pointer; text-decoration: none; font-weight: 900; }
  .support-action:disabled { cursor: not-allowed; opacity: 0.55; }
  .support-action--ghost { color: var(--trackora-primary); background: var(--trackora-bg); border-color: var(--trackora-border); }
  .support-action--warning { color: var(--trackora-primary); background: color-mix(in srgb, var(--trackora-warning) 18%, var(--trackora-bg)); border-color: color-mix(in srgb, var(--trackora-warning) 45%, var(--trackora-border)); }
  .support-table { inline-size: 100%; min-inline-size: 74rem; border-collapse: collapse; background: var(--trackora-bg); }
  th, td { padding: 0.85rem; border-block-end: 1px solid var(--trackora-border); text-align: start; vertical-align: top; }
  th { color: var(--trackora-text-secondary); font-size: 0.78rem; text-transform: uppercase; }
  td strong, td span { display: block; }
  td strong { color: var(--trackora-primary); }
  td span { margin-block-start: 0.25rem; color: var(--trackora-text-secondary); font-size: 0.86rem; }
  .actions-inline, .pagination { display: flex; flex-wrap: wrap; align-items: center; gap: 0.65rem; }
  .pagination { justify-content: flex-end; color: var(--trackora-text-secondary); font-weight: 800; }
  .error-text, .success-text { margin: 0; padding: 0.85rem 1rem; border: 1px solid var(--trackora-border); border-radius: 0.85rem; font-weight: 800; }
  .error-text { color: var(--trackora-danger); background: color-mix(in srgb, var(--trackora-danger) 9%, var(--trackora-bg)); }
  .success-text { color: var(--trackora-success); background: color-mix(in srgb, var(--trackora-success) 9%, var(--trackora-bg)); }
  @media (max-width: 760px) { .support-input { min-inline-size: 100%; } }
`;

@Component({
  selector: 'app-support-page',
  imports: [
    CommonModule,
    ConfirmationDialogComponent,
    DataTableShellComponent,
    FilterBarComponent,
    FormsModule,
    PageHeaderComponent,
    ReasonRequiredDialogComponent,
    RouterLink,
    StatusBadgeComponent,
  ],
  providers: [SupportFacade],
  template: `
    <section class="support-page">
      <app-owner-page-header
        title="الدعم والانتحال"
        description="بحث آمن عن المستأجرين وفحص الصحة بدون عرض بيانات شحن أو بيانات عملاء خاصة."
        [breadcrumbs]="breadcrumbs"
      >
        <a
          page-actions
          class="support-action"
          routerLink="/owner/support/impersonation"
        >
          إدارة الانتحال
        </a>
      </app-owner-page-header>

      @if (facade.mutation().success) {
        <p class="success-text">{{ facade.mutation().success }}</p>
      }
      @if (facade.mutation().error) {
        <p class="error-text">{{ facade.mutation().error }}</p>
      }

      <app-owner-data-table-shell
        [loading]="facade.search().loading"
        [error]="!!facade.search().error"
        [empty]="facade.emptySearch()"
        loadingTitle="جاري البحث عن المستأجرين"
        loadingMessage="يتم تحميل ملخصات آمنة فقط."
        emptyTitle="لا توجد نتائج دعم"
        emptyMessage="ابحث بالاسم أو الرابط أو البريد أو الهاتف إن كان مدعوماً من الخادم."
        errorTitle="تعذر تحميل نتائج الدعم"
        [errorMessage]="facade.search().error || ''"
      >
        <app-owner-filter-bar
          table-filters
          [showApply]="true"
          (filterApply)="applySearch()"
          (filterReset)="resetSearch()"
        >
          <input
            filter-search
            class="support-input"
            name="query"
            [(ngModel)]="query"
            placeholder="Tenant name, slug, email, or phone"
          />
        </app-owner-filter-bar>

        <button
          table-retry
          state-action
          type="button"
          class="support-action"
          (click)="reload()"
        >
          إعادة المحاولة
        </button>

        <table table-content class="support-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Subscription</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (tenant of facade.items(); track tenant.id) {
              <tr>
                <td>
                  <strong>{{ tenant.name }}</strong
                  ><span>{{ tenant.slug || tenant.id }}</span>
                </td>
                <td>
                  <strong>{{ tenant.email || 'No email' }}</strong
                  ><span>{{ tenant.phone || 'No phone' }}</span>
                </td>
                <td>
                  <app-owner-status-badge
                    [status]="badgeStatus(tenant.status)"
                    [label]="tenant.status"
                  />
                </td>
                <td>
                  <strong>{{ tenant.planName || 'No plan' }}</strong
                  ><span>{{
                    tenant.subscriptionStatus ||
                      tenant.paymentStatus ||
                      'Not returned'
                  }}</span>
                </td>
                <td>{{ formatDate(tenant.updatedAt || tenant.createdAt) }}</td>
                <td>
                  <div class="actions-inline">
                    <a
                      class="support-action support-action--ghost"
                      [routerLink]="['/owner/support/tenants', tenant.id]"
                      >Health</a
                    >
                    @if (canImpersonate) {
                      <button
                        type="button"
                        class="support-action support-action--warning"
                        (click)="requestImpersonation(tenant)"
                      >
                        Start impersonation
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div table-pagination class="pagination">
          <button
            type="button"
            class="support-action support-action--ghost"
            [disabled]="(facade.query().page ?? 1) <= 1"
            (click)="previousPage()"
          >
            Previous
          </button>
          <span
            >Page {{ facade.search().data?.page ?? facade.query().page ?? 1 }} /
            {{ totalPages() }}</span
          >
          <button
            type="button"
            class="support-action support-action--ghost"
            [disabled]="(facade.query().page ?? 1) >= totalPages()"
            (click)="nextPage()"
          >
            Next
          </button>
        </div>
      </app-owner-data-table-shell>

      <app-owner-confirmation-dialog
        [open]="!!pendingTenant() && !reasonOpen()"
        title="تأكيد بدء الانتحال"
        message="أنت على وشك الدخول نيابة عن مسؤول شركة. سيتم تسجيل العملية في سجل التدقيق."
        confirmLabel="متابعة"
        cancelLabel="إلغاء"
        severity="warning"
        (confirmationConfirm)="reasonOpen.set(true)"
        (confirmationCancel)="pendingTenant.set(null)"
      />
      <app-owner-reason-required-dialog
        [open]="reasonOpen()"
        title="سبب بدء الانتحال"
        message="سبب الانتحال مطلوب وسيظهر في سجل التدقيق."
        reasonLabel="السبب"
        confirmLabel="بدء الانتحال"
        cancelLabel="إلغاء"
        (reasonConfirm)="startImpersonation($event)"
        (reasonCancel)="closeDialogs()"
      />
    </section>
  `,
  styles: [supportStyles],
})
export class SupportPageComponent implements OnInit {
  protected readonly facade = inject(SupportFacade);
  private readonly auth = inject(AuthService);
  protected readonly breadcrumbs = [
    { label: 'Owner', href: '/owner' },
    { label: 'Support' },
  ];
  protected readonly pendingTenant = signal<SupportTenantSummary | null>(null);
  protected readonly reasonOpen = signal(false);
  protected readonly canImpersonate = this.auth.hasPermission(
    IMPERSONATE_TENANT_ADMIN_PERMISSION,
  );
  protected query = '';

  ngOnInit(): void {
    void this.facade.searchTenants();
  }

  protected applySearch(): void {
    void this.facade.searchTenants({ query: this.query, page: 1 });
  }

  protected resetSearch(): void {
    this.query = '';
    void this.facade.searchTenants({ query: '', page: 1 });
  }

  protected reload(): void {
    void this.facade.searchTenants();
  }

  protected previousPage(): void {
    void this.facade.searchTenants({
      page: Math.max((this.facade.query().page ?? 1) - 1, 1),
    });
  }

  protected nextPage(): void {
    void this.facade.searchTenants({
      page: (this.facade.query().page ?? 1) + 1,
    });
  }

  protected totalPages(): number {
    const data = this.facade.search().data;
    if (!data) return 1;
    return Math.max(Math.ceil(data.total / Math.max(data.pageSize, 1)), 1);
  }

  protected requestImpersonation(tenant: SupportTenantSummary): void {
    if (!this.canImpersonate) return;
    this.pendingTenant.set(tenant);
  }

  protected async startImpersonation(reason: string): Promise<void> {
    const tenant = this.pendingTenant();
    if (!tenant) return;
    await this.facade.startImpersonation(tenant.id, reason);
    this.closeDialogs();
  }

  protected closeDialogs(): void {
    this.reasonOpen.set(false);
    this.pendingTenant.set(null);
  }

  protected badgeStatus(status: string): DashboardStatus {
    return status as DashboardStatus;
  }

  protected formatDate(value: string | null): string {
    if (!value) return 'Not available';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
          date,
        );
  }
}
