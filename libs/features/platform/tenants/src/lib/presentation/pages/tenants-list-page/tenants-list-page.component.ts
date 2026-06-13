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
          <span class="muted">صفحة {{ filters.page }} من {{ facade.list().data?.totalPages ?? 1 }}</span>
          <button type="button" (click)="nextPage()" [disabled]="filters.page >= (facade.list().data?.totalPages ?? 1)">التالي</button>
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
  filters: TenantListQuery = { page: 1, limit: 20 };

  ngOnInit(): void { this.load(); }
  load(): void { void this.facade.loadList(this.filters); }
  applyFilters(): void { this.filters.page = 1; this.load(); }
  resetFilters(): void { this.filters = { page: 1, limit: 20 }; this.load(); }
  previousPage(): void { if (this.filters.page > 1) { this.filters.page -= 1; this.load(); } }
  nextPage(): void { if (this.filters.page < (this.facade.list().data?.totalPages ?? 1)) { this.filters.page += 1; this.load(); } }
}
