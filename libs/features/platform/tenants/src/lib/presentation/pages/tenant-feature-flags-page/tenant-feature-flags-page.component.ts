import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataTableShellComponent, PageHeaderComponent, StatusBadgeComponent } from '@trackora/owner-dashboard-ui';
import { TenantsFacade } from '../../../application/tenants.facade';
import { tenantBreadcrumbs } from '../page-utils';
import { TENANT_PAGE_STYLES } from '../tenant-page.styles';

@Component({
  selector: 'lib-tenant-feature-flags-page',
  imports: [CommonModule, DataTableShellComponent, PageHeaderComponent, RouterLink, StatusBadgeComponent],
  providers: [TenantsFacade],
  template: `<section class="tenant-page"><app-owner-page-header title="ملخص Feature Flags" description="عرض ملخص فقط دون تنفيذ override mutation workflow في Phase 5." [breadcrumbs]="breadcrumbs" /><a class="button" [routerLink]="['/owner/tenants', tenantId]">رجوع للتفاصيل</a><app-owner-data-table-shell [loading]="facade.featureFlags().loading" [error]="!!facade.featureFlags().error" [empty]="!(facade.featureFlags().data?.length)" [errorMessage]="facade.featureFlags().error || ''"><button table-retry class="primary" (click)="load()">إعادة المحاولة</button><table table-content class="table"><thead><tr><th>المفتاح</th><th>الاسم</th><th>الحالة</th><th>المصدر</th></tr></thead><tbody>@for (flag of facade.featureFlags().data ?? []; track flag.key) { <tr><td>{{ flag.key }}</td><td>{{ flag.name }}</td><td><app-owner-status-badge [status]="flag.enabled ? 'success' : 'neutral'" [label]="flag.enabled ? 'مفعل' : 'غير مفعل'" /></td><td>{{ flag.source || 'غير متاح' }}</td></tr> }</tbody></table></app-owner-data-table-shell></section>`,
  styles: [TENANT_PAGE_STYLES],
})
export class TenantFeatureFlagsPageComponent implements OnInit {
  readonly facade = inject(TenantsFacade); private readonly route = inject(ActivatedRoute); readonly breadcrumbs = tenantBreadcrumbs('Feature flags');
  get tenantId(): string { return this.route.snapshot.paramMap.get('tenantId') ?? ''; }
  ngOnInit(): void { this.load(); }
  load(): void { void this.facade.loadFeatureFlags(this.tenantId); }
}
