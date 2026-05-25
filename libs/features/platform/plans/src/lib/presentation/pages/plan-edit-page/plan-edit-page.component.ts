import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorStateComponent, LoadingStateComponent, PageHeaderComponent, SectionCardComponent } from '../../components/dashboard-ui';
import { PlansFacade } from '../../../application/plans.facade';
import { PlanPayload } from '../../../domain/models/platform-plan.models';
import { PlanFormComponent } from '../../components/plan-form.component';

@Component({
  selector: 'app-plan-edit-page',
  imports: [RouterLink, ErrorStateComponent, LoadingStateComponent, PageHeaderComponent, SectionCardComponent, PlanFormComponent],
  providers: [PlansFacade],
  template: `
    <section class="plan-form-page">
      <app-owner-page-header title="تعديل الخطة" description="تعديل الحقول الآمنة فقط للخطط." [breadcrumbs]="breadcrumbs">
        <a page-actions class="page-action" [routerLink]="['/owner/plans', planId]">تفاصيل الخطة</a>
      </app-owner-page-header>
      @if (facade.detail().loading) { <app-owner-loading-state title="جاري تحميل الخطة" /> }
      @if (facade.detail().error) { <app-owner-error-state title="تعذر حفظ أو تحميل الخطة" [message]="facade.detail().error || ''" /> }
      @if (facade.detail().data; as plan) {
        <app-owner-section-card title="بيانات الخطة" description="يتم تطبيق نفس قواعد التحقق المستخدمة في الإنشاء.">
          <app-plan-form submitLabel="حفظ التعديلات" [plan]="plan" [saving]="facade.detail().saving" (formSubmit)="save($event)" />
        </app-owner-section-card>
      }
    </section>
  `,
  styles: [` .plan-form-page { display: grid; gap: 1rem; } .page-action { padding: 0.72rem 1rem; color: var(--trackora-primary); background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 0.8rem; text-decoration: none; font-weight: 900; } `],
})
export class PlanEditPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly facade = inject(PlansFacade);
  readonly planId = this.route.snapshot.paramMap.get('planId') ?? '';
  readonly breadcrumbs = [{ label: 'المالك' }, { label: 'الخطط', href: '/owner/plans' }, { label: this.planId }, { label: 'تعديل' }];

  ngOnInit(): void { void this.facade.loadDetail(this.planId); }
  async save(payload: PlanPayload): Promise<void> { const plan = await this.facade.update(this.planId, payload); if (plan) await this.router.navigate(['/owner/plans', plan.id]); }
}
