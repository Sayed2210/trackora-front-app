import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import {
  ConfirmationDialogComponent,
  PageHeaderComponent,
  ReasonRequiredDialogComponent,
  SectionCardComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { TenantsFacade } from '../../../application/tenants.facade';
import { TenantStatus } from '../../../domain/models/tenant.models';
import { MANAGE_TENANTS_PERMISSION, SUSPEND_TENANTS_PERMISSION } from '../../tenant-permissions';
import { formatDate, slugPattern, tenantBreadcrumbs, tenantStatusLabel } from '../page-utils';
import { TENANT_PAGE_STYLES } from '../tenant-page.styles';

@Component({
  selector: 'lib-tenant-detail-page',
  imports: [CommonModule, ConfirmationDialogComponent, FormsModule, PageHeaderComponent, ReasonRequiredDialogComponent, RouterLink, SectionCardComponent, StatusBadgeComponent],
  providers: [TenantsFacade],
  template: `
    <section class="tenant-page">
      <app-owner-page-header title="تفاصيل المستأجر" description="ملف المستأجر وحالته وروابط الملخصات المرتبطة." [breadcrumbs]="breadcrumbs" />
      @if (facade.detail().loading) { <app-owner-section-card title="جاري التحميل" description="يتم تحميل بيانات المستأجر." /> }
      @else if (facade.detail().error) { <app-owner-section-card title="تعذر التحميل" [description]="facade.detail().error || ''"><button class="primary" (click)="load()">إعادة المحاولة</button></app-owner-section-card> }
      @else if (facade.detail().data; as tenant) {
        <nav class="tabs">
          <a [routerLink]="['/owner/tenants', tenant.id]">الملف</a><a [routerLink]="['/owner/tenants', tenant.id, 'usage']">الاستخدام</a><a [routerLink]="['/owner/tenants', tenant.id, 'users']">المستخدمون</a><a [routerLink]="['/owner/tenants', tenant.id, 'billing']">الفوترة</a><a [routerLink]="['/owner/tenants', tenant.id, 'feature-flags']">Feature flags</a>
        </nav>
        <app-owner-section-card title="ملخص المستأجر" description="بيانات آمنة للعرض على مالك النظام.">
          <div section-actions class="tenant-actions">
            @if (canManage) { <button type="button" (click)="requestStatus('ACTIVE')">تفعيل</button><button type="button" class="danger" (click)="requestStatus('SUSPENDED')" [disabled]="!canSuspend">إيقاف</button><button type="button" class="danger" (click)="requestStatus('CANCELLED')">إلغاء</button> }
          </div>
          <div class="summary-grid">
            <div class="summary-item"><span>الاسم</span><strong>{{ tenant.name }}</strong></div>
            <div class="summary-item"><span>الرابط</span><strong>{{ tenant.slug }}</strong></div>
            <div class="summary-item"><span>البريد</span><strong>{{ tenant.email || 'غير متاح' }}</strong></div>
            <div class="summary-item"><span>الحالة</span><app-owner-status-badge [status]="tenant.status" [label]="tenantStatusLabel(tenant.status)" /></div>
            <div class="summary-item"><span>الخطة</span><strong>{{ tenant.planName || 'غير متاح' }}</strong></div>
            <div class="summary-item"><span>الاشتراك</span><strong>{{ tenant.subscriptionStatus || 'غير متاح' }}</strong></div>
            <div class="summary-item"><span>أنشئ في</span><strong>{{ formatDate(tenant.createdAt) }}</strong></div>
            <div class="summary-item"><span>آخر تحديث</span><strong>{{ formatDate(tenant.updatedAt) }}</strong></div>
          </div>
        </app-owner-section-card>

        @if (canManage) {
          <app-owner-section-card title="تعديل آمن" description="تعديل الحقول العامة فقط دون سلوك تدميري.">
            <form class="card-form" #form="ngForm" (ngSubmit)="save(form)">
              <div class="form-grid"><label>الاسم<input required name="name" [(ngModel)]="edit.name" /></label><label>الرابط<input required name="slug" [(ngModel)]="edit.slug" [pattern]="slugPattern.source" /></label><label>البريد<input required type="email" name="email" [(ngModel)]="edit.email" /></label><label>معرف الخطة<input name="planId" [(ngModel)]="edit.planId" /></label></div>
              @if (form.submitted && form.invalid) { <p class="error-text">راجع الحقول المطلوبة وصيغة الرابط.</p> }
              @if (facade.mutationError()) { <p class="error-text">{{ facade.mutationError() }}</p> }
              <div class="tenant-actions"><button class="primary" type="submit" [disabled]="facade.saving()">حفظ التعديل</button></div>
            </form>
          </app-owner-section-card>
        }
      }
      <app-owner-confirmation-dialog [open]="!!pendingStatus" title="تأكيد تغيير الحالة" message="هذا إجراء حساس وسيطلب سبباً تشغيلياً قبل التنفيذ." confirmLabel="متابعة" severity="warning" (confirmationConfirm)="confirmStatus()" (confirmationCancel)="pendingStatus = null" />
      <app-owner-reason-required-dialog [open]="reasonOpen" title="سبب تغيير حالة المستأجر" message="اكتب سبباً واضحاً لتوثيق هذا الإجراء." (reasonConfirm)="submitStatus($event)" (reasonCancel)="reasonOpen = false" />
    </section>
  `,
  styles: [TENANT_PAGE_STYLES],
})
export class TenantDetailPageComponent implements OnInit {
  readonly facade = inject(TenantsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  readonly breadcrumbs = tenantBreadcrumbs('التفاصيل');
  readonly formatDate = formatDate;
  readonly tenantStatusLabel = tenantStatusLabel;
  readonly slugPattern = slugPattern;
  readonly canManage = this.auth.hasPermission(MANAGE_TENANTS_PERMISSION);
  readonly canSuspend = this.auth.hasPermission(SUSPEND_TENANTS_PERMISSION) || this.canManage;
  edit = { name: '', slug: '', email: '', planId: '' };
  pendingStatus: TenantStatus | null = null;
  reasonOpen = false;

  ngOnInit(): void { this.load(); }
  get tenantId(): string { return this.route.snapshot.paramMap.get('tenantId') ?? ''; }
  async load(): Promise<void> { await this.facade.loadDetail(this.tenantId); const tenant = this.facade.detail().data; if (tenant) { this.edit = { name: tenant.name, slug: tenant.slug, email: tenant.email, planId: '' }; } }
  async save(form: NgForm): Promise<void> { if (form.invalid) { return; } await this.facade.updateTenant(this.tenantId, this.edit); }
  requestStatus(status: TenantStatus): void { if (status === 'SUSPENDED' && !this.canSuspend) { return; } this.pendingStatus = status; }
  confirmStatus(): void { this.reasonOpen = true; }
  async submitStatus(reason: string): Promise<void> { if (!this.pendingStatus) { return; } await this.facade.changeStatus(this.tenantId, this.pendingStatus, reason); this.reasonOpen = false; this.pendingStatus = null; }
}
