import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataTableShellComponent, PageHeaderComponent, StatusBadgeComponent } from '@trackora/owner-dashboard-ui';
import { TenantsFacade } from '../../../application/tenants.facade';
import { formatDate, tenantBreadcrumbs } from '../page-utils';
import { TENANT_PAGE_STYLES } from '../tenant-page.styles';

@Component({
  selector: 'lib-tenant-users-page',
  imports: [CommonModule, DataTableShellComponent, PageHeaderComponent, RouterLink, StatusBadgeComponent],
  providers: [TenantsFacade],
  template: `<section class="tenant-page"><app-owner-page-header title="مستخدمو المستأجر" description="ملخص آمن دون كلمات مرور أو رموز أو بيانات خاصة." [breadcrumbs]="breadcrumbs" /><a class="button" [routerLink]="['/owner/tenants', tenantId]">رجوع للتفاصيل</a><app-owner-data-table-shell [loading]="facade.users().loading" [error]="!!facade.users().error" [empty]="!(facade.users().data?.length)" [errorMessage]="facade.users().error || ''"><button table-retry class="primary" (click)="load()">إعادة المحاولة</button><table table-content class="table"><thead><tr><th>المستخدم</th><th>البريد</th><th>الدور</th><th>الحالة</th><th>تاريخ الإنشاء</th></tr></thead><tbody>@for (user of facade.users().data ?? []; track user.id) { <tr><td>{{ user.name }}</td><td>{{ user.email || 'غير متاح' }}</td><td>{{ user.role || 'غير متاح' }}</td><td><app-owner-status-badge [status]="user.status === 'ACTIVE' ? 'ACTIVE' : 'neutral'" [label]="user.status || 'غير متاح'" /></td><td>{{ formatDate(user.createdAt) }}</td></tr> }</tbody></table></app-owner-data-table-shell></section>`,
  styles: [TENANT_PAGE_STYLES],
})
export class TenantUsersPageComponent implements OnInit {
  readonly facade = inject(TenantsFacade); private readonly route = inject(ActivatedRoute); readonly breadcrumbs = tenantBreadcrumbs('المستخدمون'); readonly formatDate = formatDate;
  get tenantId(): string { return this.route.snapshot.paramMap.get('tenantId') ?? ''; }
  ngOnInit(): void { this.load(); }
  load(): void { void this.facade.loadUsers(this.tenantId); }
}
