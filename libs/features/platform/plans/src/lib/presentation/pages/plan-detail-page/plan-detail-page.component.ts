import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ConfirmationDialogComponent,
  ErrorStateComponent,
  LoadingStateComponent,
  MetricGridComponent,
  PageHeaderComponent,
  SectionCardComponent,
  StatCardComponent,
  StatusBadgeComponent,
} from '../../components/dashboard-ui';
import { PlansFacade } from '../../../application/plans.facade';
import { PlanSummaryComponent } from '../../components/plan-summary.component';

@Component({
  selector: 'app-plan-detail-page',
  imports: [
    RouterLink,
    ConfirmationDialogComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    MetricGridComponent,
    PageHeaderComponent,
    SectionCardComponent,
    StatCardComponent,
    StatusBadgeComponent,
    PlanSummaryComponent,
  ],
  providers: [PlansFacade],
  template: `
    <section class="plan-detail-page">
      <app-owner-page-header title="تفاصيل الخطة" description="ملخص السعر والحدود وصلاحيات الميزات." [breadcrumbs]="breadcrumbs">
        <a page-actions class="page-action" routerLink="/owner/plans">الخطط</a>
        @if (facade.detail().data) { <a page-actions class="page-action page-action--primary" [routerLink]="['/owner/plans', planId, 'edit']">تعديل</a> }
      </app-owner-page-header>

      @if (facade.detail().loading) {
        <app-owner-loading-state title="جاري تحميل الخطة" message="يتم تجهيز بيانات الخطة." />
      } @else if (facade.detail().error) {
        <app-owner-error-state title="تعذر تحميل الخطة" [message]="facade.detail().error || ''">
          <button state-action type="button" class="page-action page-action--primary" (click)="load()">إعادة المحاولة</button>
        </app-owner-error-state>
      } @else if (facade.detail().data; as plan) {
        <app-owner-metric-grid>
          <app-owner-stat-card title="السعر" [value]="plan.price" [subtitle]="plan.currency" severity="info" />
          <app-owner-stat-card title="دورة الفوترة" [value]="plan.billingCycle" severity="success" />
          <app-owner-stat-card title="الاشتراكات" [value]="plan.subscriptionCount" emptyLabel="غير متاح" [empty]="plan.subscriptionCount === null" severity="warning" />
        </app-owner-metric-grid>

        <app-owner-section-card [title]="plan.name" [description]="plan.code">
          <div section-actions>
            <app-owner-status-badge [status]="plan.archived ? 'warning' : plan.active ? 'success' : 'neutral'" [label]="plan.archived ? 'Archived' : plan.active ? 'Active' : 'Inactive'" />
          </div>
          <app-plan-summary [plan]="plan" />
        </app-owner-section-card>

        <app-owner-section-card title="التواريخ" description="بيانات إنشاء وتحديث الخطة إن أعادها الخادم.">
          <dl class="dates"><div><dt>Created</dt><dd>{{ plan.createdAt || 'Not returned' }}</dd></div><div><dt>Updated</dt><dd>{{ plan.updatedAt || 'Not returned' }}</dd></div></dl>
        </app-owner-section-card>

        <button type="button" class="page-action page-action--danger" (click)="confirmOpen.set(true)">أرشفة الخطة</button>
      }

      <app-owner-confirmation-dialog [open]="confirmOpen()" title="أرشفة الخطة؟" message="سيتم استدعاء DELETE /platform/plans/:id ولن نخفي أي تعارض إذا كانت الخطة مستخدمة." confirmLabel="أرشفة" cancelLabel="إلغاء" severity="danger" (confirmationConfirm)="archive()" (confirmationCancel)="confirmOpen.set(false)" />
    </section>
  `,
  styles: [` .plan-detail-page { display: grid; gap: 1rem; } .page-action { padding: 0.72rem 1rem; color: var(--trackora-primary); background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 0.8rem; text-decoration: none; cursor: pointer; font-weight: 900; } .page-action--primary { color: var(--trackora-primary-contrast); background: var(--trackora-primary); border-color: var(--trackora-primary); } .page-action--danger { width: fit-content; color: var(--trackora-primary-contrast); background: var(--trackora-danger); border-color: var(--trackora-danger); } .dates { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin: 0; } dt { color: var(--trackora-text-secondary); } dd { margin: 0.2rem 0 0; color: var(--trackora-primary); font-weight: 900; } `],
})
export class PlanDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly facade = inject(PlansFacade);
  readonly confirmOpen = signal(false);
  readonly planId = this.route.snapshot.paramMap.get('planId') ?? '';
  readonly breadcrumbs = [{ label: 'المالك' }, { label: 'الخطط', href: '/owner/plans' }, { label: this.planId }];

  ngOnInit(): void { this.load(); }
  load(): void { void this.facade.loadDetail(this.planId); }
  async archive(): Promise<void> { this.confirmOpen.set(false); if (await this.facade.archive(this.planId)) await this.router.navigate(['/owner/plans']); }
}
