import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ErrorStateComponent, PageHeaderComponent, SectionCardComponent } from '../../components/dashboard-ui';
import { PlansFacade } from '../../../application/plans.facade';
import { PlanPayload } from '../../../domain/models/platform-plan.models';
import { PlanFormComponent } from '../../components/plan-form.component';

@Component({
  selector: 'app-plan-create-page',
  imports: [RouterLink, ErrorStateComponent, PageHeaderComponent, SectionCardComponent, PlanFormComponent],
  providers: [PlansFacade],
  template: `
    <section class="plan-form-page">
      <app-owner-page-header title="إنشاء خطة" description="أضف خطة اشتراك جديدة بالحقول المدعومة من واجهة الخطط." [breadcrumbs]="breadcrumbs">
        <a page-actions class="page-action" routerLink="/owner/plans">العودة للخطط</a>
      </app-owner-page-header>
      @if (facade.detail().error) { <app-owner-error-state title="تعذر حفظ الخطة" [message]="facade.detail().error || ''" /> }
      <app-owner-section-card title="بيانات الخطة" description="السعر والحدود وصلاحيات الميزات الأساسية.">
        <app-plan-form submitLabel="إنشاء الخطة" [saving]="facade.detail().saving" (formSubmit)="create($event)" />
      </app-owner-section-card>
    </section>
  `,
  styles: [` .plan-form-page { display: grid; gap: 1rem; } .page-action { padding: 0.72rem 1rem; color: var(--trackora-primary); background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 0.8rem; text-decoration: none; font-weight: 900; } `],
})
export class PlanCreatePageComponent {
  private readonly router = inject(Router);
  readonly facade = inject(PlansFacade);
  readonly breadcrumbs = [{ label: 'المالك' }, { label: 'الخطط', href: '/owner/plans' }, { label: 'إنشاء' }];

  async create(payload: PlanPayload): Promise<void> {
    const plan = await this.facade.create(payload);
    if (plan) {
      await this.router.navigate(['/owner/plans', plan.id]);
    }
  }
}
