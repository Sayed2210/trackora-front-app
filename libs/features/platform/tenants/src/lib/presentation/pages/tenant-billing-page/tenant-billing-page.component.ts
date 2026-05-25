import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmptyStateComponent, ErrorStateComponent, LoadingStateComponent, PageHeaderComponent, SectionCardComponent, StatusBadgeComponent } from '@trackora/owner-dashboard-ui';
import { TenantsFacade } from '../../../application/tenants.facade';
import { formatDate, tenantBreadcrumbs } from '../page-utils';
import { TENANT_PAGE_STYLES } from '../tenant-page.styles';

@Component({
  selector: 'lib-tenant-billing-page',
  imports: [CommonModule, EmptyStateComponent, ErrorStateComponent, LoadingStateComponent, PageHeaderComponent, RouterLink, SectionCardComponent, StatusBadgeComponent],
  providers: [TenantsFacade],
  template: `<section class="tenant-page"><app-owner-page-header title="ملخص فوترة المستأجر" description="عرض ملخص فقط ضمن Phase 5 دون تنفيذ وحدة فوترة كاملة." [breadcrumbs]="breadcrumbs" /><a class="button" [routerLink]="['/owner/tenants', tenantId]">رجوع للتفاصيل</a>@if (facade.billing().loading) { <app-owner-loading-state title="جاري تحميل الفوترة" /> } @else if (facade.billing().error) { <app-owner-error-state title="تعذر تحميل الفوترة" [message]="facade.billing().error || ''"><button state-action class="primary" (click)="load()">إعادة المحاولة</button></app-owner-error-state> } @else if (!facade.billing().data) { <app-owner-empty-state title="لا يوجد ملخص فوترة" /> } @else { <app-owner-section-card title="ملخص الفوترة" description="بيانات عرض فقط."><div class="summary-grid"><div class="summary-item"><span>الخطة</span><strong>{{ facade.billing().data?.planName || 'غير متاح' }}</strong></div><div class="summary-item"><span>حالة الاشتراك</span><app-owner-status-badge [status]="'neutral'" [label]="facade.billing().data?.subscriptionStatus || 'غير متاح'" /></div><div class="summary-item"><span>بريد الفوترة</span><strong>{{ facade.billing().data?.billingEmail || 'غير متاح' }}</strong></div><div class="summary-item"><span>بداية الفترة</span><strong>{{ formatDate(facade.billing().data?.currentPeriodStart) }}</strong></div><div class="summary-item"><span>نهاية الفترة</span><strong>{{ formatDate(facade.billing().data?.currentPeriodEnd) }}</strong></div><div class="summary-item"><span>المبلغ المستحق</span><strong>{{ facade.billing().data?.amountDue ?? 'غير متاح' }} {{ facade.billing().data?.currency || '' }}</strong></div></div></app-owner-section-card> }</section>`,
  styles: [TENANT_PAGE_STYLES],
})
export class TenantBillingPageComponent implements OnInit {
  readonly facade = inject(TenantsFacade); private readonly route = inject(ActivatedRoute); readonly breadcrumbs = tenantBreadcrumbs('الفوترة'); readonly formatDate = formatDate;
  get tenantId(): string { return this.route.snapshot.paramMap.get('tenantId') ?? ''; }
  ngOnInit(): void { this.load(); }
  load(): void { void this.facade.loadBilling(this.tenantId); }
}
