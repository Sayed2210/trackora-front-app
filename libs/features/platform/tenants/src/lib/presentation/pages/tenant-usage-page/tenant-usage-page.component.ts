import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmptyStateComponent, ErrorStateComponent, LoadingStateComponent, MetricGridComponent, PageHeaderComponent, StatCardComponent } from '@trackora/owner-dashboard-ui';
import { TenantsFacade } from '../../../application/tenants.facade';
import { tenantBreadcrumbs } from '../page-utils';
import { TENANT_PAGE_STYLES } from '../tenant-page.styles';

@Component({
  selector: 'lib-tenant-usage-page',
  imports: [CommonModule, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent, MetricGridComponent, PageHeaderComponent, RouterLink, StatCardComponent],
  providers: [TenantsFacade],
  template: `<section class="tenant-page"><app-owner-page-header title="استخدام المستأجر" description="ملخص عدادات التشغيل لهذا المستأجر." [breadcrumbs]="breadcrumbs" /><a class="button" [routerLink]="['/owner/tenants', tenantId]">رجوع للتفاصيل</a>@if (facade.usage().loading) { <app-owner-loading-state title="جاري تحميل الاستخدام" /> } @else if (facade.usage().error) { <app-owner-error-state title="تعذر تحميل الاستخدام" [message]="facade.usage().error || ''"><button state-action class="primary" (click)="load()">إعادة المحاولة</button></app-owner-error-state> } @else if (!facade.usage().data) { <app-owner-empty-state title="لا توجد بيانات استخدام" /> } @else { <app-owner-metric-grid><app-owner-stat-card title="المستخدمون" [value]="facade.usage().data?.users" severity="info" /><app-owner-stat-card title="التجار" [value]="facade.usage().data?.merchants" severity="success" /><app-owner-stat-card title="المناديب" [value]="facade.usage().data?.couriers" severity="success" /><app-owner-stat-card title="الشحنات" [value]="facade.usage().data?.shipments" severity="info" /><app-owner-stat-card title="شحنات الشهر الحالي" [value]="facade.usage().data?.currentMonthShipments" severity="warning" [empty]="facade.usage().data?.currentMonthShipments === undefined" /></app-owner-metric-grid> }</section>`,
  styles: [TENANT_PAGE_STYLES],
})
export class TenantUsagePageComponent implements OnInit {
  readonly facade = inject(TenantsFacade); private readonly route = inject(ActivatedRoute); readonly breadcrumbs = tenantBreadcrumbs('الاستخدام');
  get tenantId(): string { return this.route.snapshot.paramMap.get('tenantId') ?? ''; }
  ngOnInit(): void { this.load(); }
  load(): void { void this.facade.loadUsage(this.tenantId); }
}
