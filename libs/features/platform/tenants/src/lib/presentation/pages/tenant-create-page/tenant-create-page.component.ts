import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PageHeaderComponent, SectionCardComponent } from '@trackora/owner-dashboard-ui';
import { TenantsFacade } from '../../../application/tenants.facade';
import { slugPattern, tenantBreadcrumbs } from '../page-utils';
import { TENANT_PAGE_STYLES } from '../tenant-page.styles';

@Component({
  selector: 'lib-tenant-create-page',
  imports: [CommonModule, FormsModule, PageHeaderComponent, RouterLink, SectionCardComponent],
  providers: [TenantsFacade],
  template: `
    <section class="tenant-page">
      <app-owner-page-header title="إنشاء مستأجر" description="إنشاء حساب منصة جديد باستخدام الحقول المدعومة فقط." [breadcrumbs]="breadcrumbs" />
      <app-owner-section-card title="بيانات المستأجر" description="الاسم والرابط والبريد مطلوبة. معرف الخطة اختياري إذا كان مدعوماً من API.">
        <form class="card-form" #form="ngForm" (ngSubmit)="submit(form)">
          <div class="form-grid">
            <label>الاسم<input required name="name" [(ngModel)]="model.name" /></label>
            <label>الرابط المختصر<input required name="slug" [(ngModel)]="model.slug" [pattern]="slugPattern.source" placeholder="tenant-slug" /></label>
            <label>البريد<input required type="email" name="email" [(ngModel)]="model.email" /></label>
            <label>معرف الخطة<input name="planId" [(ngModel)]="model.planId" /></label>
          </div>
          @if (form.submitted && form.invalid) { <p class="error-text">راجع الحقول المطلوبة وصيغة الرابط المختصر.</p> }
          @if (facade.mutationError()) { <p class="error-text">{{ facade.mutationError() }}</p> }
          <div class="tenant-actions"><a class="button" routerLink="/owner/tenants">إلغاء</a><button class="primary" type="submit" [disabled]="facade.saving()">حفظ</button></div>
        </form>
      </app-owner-section-card>
    </section>
  `,
  styles: [TENANT_PAGE_STYLES],
})
export class TenantCreatePageComponent {
  readonly facade = inject(TenantsFacade);
  private readonly router = inject(Router);
  readonly breadcrumbs = tenantBreadcrumbs('إنشاء');
  readonly slugPattern = slugPattern;
  model = { name: '', slug: '', email: '', planId: '' };

  async submit(form: NgForm): Promise<void> {
    if (form.invalid) { return; }
    const tenant = await this.facade.createTenant(this.model);
    if (tenant) { await this.router.navigate(['/owner/tenants', tenant.id]); }
  }
}
