import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import {
  DataTableShellComponent,
  FilterBarComponent,
  PageHeaderComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { TenantsFacade } from '../../../application/tenants.facade';
import { TenantListQuery } from '../../../domain/models/tenant.models';
import { MANAGE_TENANTS_PERMISSION } from '../../tenant-permissions';
import { formatDate, tenantStatusLabel } from '../page-utils';
import { TENANT_PAGE_STYLES } from '../tenant-page.styles';

@Component({
  selector: 'lib-tenants-list-page',
  imports: [CommonModule, DataTableShellComponent, FilterBarComponent, FormsModule, PageHeaderComponent, RouterLink, StatusBadgeComponent],
  providers: [TenantsFacade],
  template: `
    <section class="tenant-page">
      <app-owner-page-header title="إدارة المستأجرين" description="بحث وتصفية ومراجعة حسابات المنصة." [breadcrumbs]="breadcrumbs">
        @if (canManage()) {
          <a page-actions class="button button--primary" routerLink="/owner/tenants/create">إنشاء مستأجر</a>
        }
      </app-owner-page-header>

      <app-owner-data-table-shell
        [loading]="facade.list().loading"
        [error]="!!facade.list().error"
        [empty]="!facade.list().data?.items?.length"
        loadingTitle="جاري تحميل المستأجرين"
        emptyTitle="لا توجد نتائج"
        errorTitle="تعذر تحميل المستأجرين"
        [errorMessage]="facade.list().error || ''"
      >
        <app-owner-filter-bar table-filters (filterReset)="resetFilters()" (filterApply)="applyFilters()" [showApply]="true">
          <input filter-search name="search" [(ngModel)]="filters.search" placeholder="بحث بالاسم أو الرابط أو البريد" />
          <div filter-controls class="filters">
            <select name="status" [(ngModel)]="filters.status"><option value="">كل الحالات</option><option value="ACTIVE">نشط</option><option value="TRIAL">تجريبي</option><option value="SUSPENDED">موقوف</option><option value="CANCELLED">ملغي</option></select>
            <input name="plan" [(ngModel)]="filters.plan" placeholder="الخطة" />
            <input type="date" name="from" [(ngModel)]="filters.createdFrom" />
            <input type="date" name="to" [(ngModel)]="filters.createdTo" />
            <select name="sortBy" [(ngModel)]="filters.sortBy"><option value="createdAt">الأحدث</option><option value="name">الاسم</option><option value="slug">الرابط</option><option value="status">الحالة</option></select>
            <select name="sortDirection" [(ngModel)]="filters.sortDirection"><option value="desc">تنازلي</option><option value="asc">تصاعدي</option></select>
          </div>
        </app-owner-filter-bar>

        <button table-retry type="button" class="button button--primary" (click)="load()">إعادة المحاولة</button>

        <table table-content class="table">
          <thead><tr><th>المستأجر</th><th>البريد</th><th>الحالة</th><th>الخطة</th><th>تاريخ الإنشاء</th><th>إجراءات</th></tr></thead>
          <tbody>
            @for (tenant of facade.list().data?.items ?? []; track tenant.id) {
              <tr>
                <td><strong>{{ tenant.name }}</strong><br /><small>{{ tenant.slug }}</small></td>
                <td>{{ tenant.email || 'غير متاح' }}</td>
                <td><app-owner-status-badge [status]="tenant.status" [label]="tenantStatusLabel(tenant.status)" /></td>
                <td>{{ tenant.planName || 'غير متاح' }}</td>
                <td>{{ formatDate(tenant.createdAt) }}</td>
                <td><a class="button" [routerLink]="['/owner/tenants', tenant.id]">عرض</a></td>
              </tr>
            }
          </tbody>
        </table>

        <div table-pagination class="pagination">
          <button type="button" (click)="previousPage()" [disabled]="filters.page <= 1">السابق</button>
          <span class="muted">صفحة {{ filters.page }} من {{ totalPages() }}</span>
          <button type="button" (click)="nextPage()" [disabled]="filters.page >= totalPages()">التالي</button>
        </div>
      </app-owner-data-table-shell>
    </section>
  `,
  styles: [TENANT_PAGE_STYLES],
})
export class TenantsListPageComponent implements OnInit {
  readonly facade = inject(TenantsFacade);
  private readonly auth = inject(AuthService);
  readonly breadcrumbs = [{ label: 'المالك', href: '/owner/overview' }, { label: 'المستأجرون' }];
  readonly canManage = signal(this.auth.hasPermission(MANAGE_TENANTS_PERMISSION));
  readonly formatDate = formatDate;
  readonly tenantStatusLabel = tenantStatusLabel;
  filters: TenantListQuery = { page: 1, pageSize: 10, sortBy: 'createdAt', sortDirection: 'desc' };

  ngOnInit(): void { this.load(); }
  load(): void { void this.facade.loadList(this.filters); }
  applyFilters(): void { this.filters.page = 1; this.load(); }
  resetFilters(): void { this.filters = { page: 1, pageSize: 10, sortBy: 'createdAt', sortDirection: 'desc' }; this.load(); }
  totalPages(): number { return Math.max(1, Math.ceil((this.facade.list().data?.total ?? 0) / this.filters.pageSize)); }
  previousPage(): void { if (this.filters.page > 1) { this.filters.page -= 1; this.load(); } }
  nextPage(): void { if (this.filters.page < this.totalPages()) { this.filters.page += 1; this.load(); } }
}
