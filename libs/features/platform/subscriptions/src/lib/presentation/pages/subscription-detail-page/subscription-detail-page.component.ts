import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import { Permission } from '@trackora/shared/domain';
import {
  ConfirmationDialogComponent,
  DashboardStatus,
  ErrorStateComponent,
  LoadingStateComponent,
  MetricGridComponent,
  PageHeaderComponent,
  ReasonRequiredDialogComponent,
  SectionCardComponent,
  StatCardComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { SubscriptionsFacade } from '../../../application/subscriptions.facade';
import { RenewSubscriptionPayload, SubscriptionUpdatePayload } from '../../../domain/models/subscription.models';

type PendingAction = 'change-plan' | 'cancel' | 'renew' | null;

export const MANAGE_SUBSCRIPTIONS_PERMISSION = 'manage_subscriptions' as Permission;

@Component({
  selector: 'app-subscription-detail-page',
  imports: [CommonModule, ConfirmationDialogComponent, ErrorStateComponent, FormsModule, LoadingStateComponent, MetricGridComponent, PageHeaderComponent, ReasonRequiredDialogComponent, RouterLink, SectionCardComponent, StatCardComponent, StatusBadgeComponent],
  providers: [SubscriptionsFacade],
  template: `
    <section class="subscription-detail-page">
      <app-owner-page-header title="تفاصيل الاشتراك" description="ملخص الاشتراك وحركات تغيير الخطة أو الإلغاء أو التجديد." [breadcrumbs]="breadcrumbs">
        <a page-actions class="page-action" routerLink="/owner/subscriptions">الاشتراكات</a>
      </app-owner-page-header>

      @if (facade.detail().loading) {
        <app-owner-loading-state title="جاري تحميل الاشتراك" message="يتم تجهيز بيانات الاشتراك." />
      } @else if (facade.detail().error && !facade.detail().data) {
        <app-owner-error-state title="تعذر تحميل الاشتراك" [message]="facade.detail().error || ''">
          <button state-action type="button" class="page-action page-action--primary" (click)="load()">إعادة المحاولة</button>
        </app-owner-error-state>
      } @else if (facade.detail().data; as subscription) {
        @if (facade.detail().success) { <p class="success-text">{{ facade.detail().success }}</p> }
        @if (facade.detail().error) { <p class="error-text">{{ facade.detail().error }}</p> }

        <app-owner-metric-grid>
          <app-owner-stat-card title="الحالة" [value]="subscription.status" severity="success" />
          <app-owner-stat-card title="حالة الدفع" [value]="subscription.paymentStatus" severity="info" />
          <app-owner-stat-card title="موعد التجديد" [value]="formatDate(subscription.renewalDate || subscription.currentPeriodEnd)" severity="warning" />
        </app-owner-metric-grid>

        <app-owner-section-card [title]="subscription.id" description="بيانات الاشتراك الأساسية التي أعادها الخادم.">
          <div section-actions class="actions-inline">
            <app-owner-status-badge [status]="badgeStatus(subscription.status)" [label]="subscription.status" />
            <app-owner-status-badge [status]="badgeStatus(subscription.paymentStatus)" [label]="subscription.paymentStatus" />
          </div>
          <dl class="summary-grid">
            <div><dt>Tenant</dt><dd>{{ subscription.tenant.name }} <span>{{ subscription.tenant.slug || subscription.tenant.id }}</span></dd></div>
            <div><dt>Plan</dt><dd>{{ subscription.plan.name }} <span>{{ subscription.plan.code || subscription.plan.id }}</span></dd></div>
            <div><dt>Billing cycle</dt><dd>{{ subscription.billingCycle || subscription.plan.billingCycle || 'Not returned' }}</dd></div>
            <div><dt>Trial</dt><dd>{{ formatDate(subscription.trialStartedAt) }} - {{ formatDate(subscription.trialEndsAt) }}</dd></div>
            <div><dt>Current period</dt><dd>{{ formatDate(subscription.currentPeriodStart) }} - {{ formatDate(subscription.currentPeriodEnd) }}</dd></div>
            <div><dt>Created / Updated</dt><dd>{{ formatDate(subscription.createdAt) }} - {{ formatDate(subscription.updatedAt) }}</dd></div>
          </dl>
        </app-owner-section-card>

        <app-owner-section-card title="الاستخدام مقابل الحدود" description="يعرض فقط ما يرجعه الخادم من حدود الخطة والاستخدام.">
          @if (subscription.usage.length) {
            <div class="usage-grid">
              @for (usage of subscription.usage; track usage.key) {
                <div><span>{{ usage.label }}</span><strong>{{ formatUsage(usage.used, usage.limit) }}</strong></div>
              }
            </div>
          } @else {
            <p class="muted">لم يرجع الخادم بيانات استخدام لهذا الاشتراك.</p>
          }
        </app-owner-section-card>

        @if (canManage) {
          <app-owner-section-card title="تعديل آمن" description="حقول مدعومة فقط: الحالة، الدفع، تواريخ الفترة والتجربة، والملاحظات.">
            <form class="card-form" #form="ngForm" (ngSubmit)="save(form)">
              <div class="form-grid">
                <label>Status<input name="status" [(ngModel)]="edit.status" /></label>
                <label>Payment status<input name="paymentStatus" [(ngModel)]="edit.paymentStatus" /></label>
                <label>Trial start<input type="date" name="trialStartedAt" [(ngModel)]="edit.trialStartedAt" /></label>
                <label>Trial end<input type="date" name="trialEndsAt" [(ngModel)]="edit.trialEndsAt" /></label>
                <label>Period start<input type="date" name="currentPeriodStart" [(ngModel)]="edit.currentPeriodStart" /></label>
                <label>Period end<input type="date" name="currentPeriodEnd" [(ngModel)]="edit.currentPeriodEnd" /></label>
                <label>Renewal date<input type="date" name="renewalDate" [(ngModel)]="edit.renewalDate" /></label>
                <label class="wide">Notes<textarea name="notes" rows="4" [(ngModel)]="edit.notes"></textarea></label>
                <label class="wide">Reason<input name="reason" [(ngModel)]="edit.reason" placeholder="Required if backend enforces audit reason" /></label>
              </div>
              <div class="actions-inline"><button class="page-action page-action--primary" type="submit" [disabled]="facade.saving()">حفظ</button></div>
            </form>
          </app-owner-section-card>

          <app-owner-section-card title="إجراءات حساسة" description="كل إجراء يتطلب سبباً وتأكيداً قبل استدعاء الخادم.">
            <div class="form-grid">
              <label>Target plan ID<input name="targetPlanId" [(ngModel)]="targetPlanId" placeholder="Plan ID" /></label>
              <label>Renewal period start<input type="date" name="renewStart" [(ngModel)]="renew.currentPeriodStart" /></label>
              <label>Renewal period end<input type="date" name="renewEnd" [(ngModel)]="renew.currentPeriodEnd" /></label>
              <label>Renewal date<input type="date" name="renewDate" [(ngModel)]="renew.renewalDate" /></label>
            </div>
            <div class="actions-inline">
              <button type="button" class="page-action page-action--primary" (click)="requestAction('change-plan')">تغيير الخطة</button>
              <button type="button" class="page-action page-action--primary" (click)="requestAction('renew')">تجديد</button>
              <button type="button" class="page-action page-action--danger" (click)="requestAction('cancel')">إلغاء الاشتراك</button>
            </div>
          </app-owner-section-card>
        }
      }

      <app-owner-confirmation-dialog [open]="!!pendingAction() && !reasonOpen()" [title]="confirmTitle()" [message]="confirmMessage()" confirmLabel="متابعة" cancelLabel="إلغاء" severity="warning" (confirmationConfirm)="reasonOpen.set(true)" (confirmationCancel)="pendingAction.set(null)" />
      <app-owner-reason-required-dialog [open]="reasonOpen()" [title]="reasonTitle()" message="اكتب سبباً واضحاً لتوثيق هذا الإجراء الحساس." (reasonConfirm)="submitReason($event)" (reasonCancel)="closeReason()" />
    </section>
  `,
  styles: [`
    .subscription-detail-page { display: grid; gap: 1rem; }
    .page-action { display: inline-flex; align-items: center; justify-content: center; padding: 0.72rem 1rem; color: var(--trackora-primary); background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 0.8rem; cursor: pointer; text-decoration: none; font-weight: 900; }
    .page-action--primary { color: var(--trackora-primary-contrast); background: var(--trackora-primary); border-color: var(--trackora-primary); }
    .page-action--danger { color: var(--trackora-primary-contrast); background: var(--trackora-danger); border-color: var(--trackora-danger); }
    .summary-grid, .usage-grid, .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
    .summary-grid { margin: 0; }
    .summary-grid div, .usage-grid div { padding: 0.8rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.8rem; }
    dt, .usage-grid span, .muted { color: var(--trackora-text-secondary); }
    dd { margin: 0.25rem 0 0; color: var(--trackora-primary); font-weight: 900; }
    dd span { display: block; margin-block-start: 0.2rem; color: var(--trackora-text-secondary); font-weight: 700; }
    .usage-grid strong { display: block; margin-block-start: 0.3rem; color: var(--trackora-primary); }
    .card-form, label { display: grid; gap: 0.45rem; }
    label { color: var(--trackora-primary); font-weight: 800; }
    input, textarea { padding: 0.7rem; color: var(--trackora-text); background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.75rem; }
    textarea { resize: vertical; }
    .wide { grid-column: 1 / -1; }
    .actions-inline { display: flex; flex-wrap: wrap; gap: 0.65rem; align-items: center; }
    .error-text, .success-text { margin: 0; padding: 0.85rem 1rem; border: 1px solid var(--trackora-border); border-radius: 0.85rem; font-weight: 800; }
    .error-text { color: var(--trackora-danger); background: color-mix(in srgb, var(--trackora-danger) 9%, var(--trackora-bg)); }
    .success-text { color: var(--trackora-success); background: color-mix(in srgb, var(--trackora-success) 9%, var(--trackora-bg)); }
    @media (max-width: 760px) { .summary-grid, .usage-grid, .form-grid { grid-template-columns: 1fr; } }
  `],
})
export class SubscriptionDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  readonly facade = inject(SubscriptionsFacade);
  readonly subscriptionId = this.route.snapshot.paramMap.get('subscriptionId') ?? '';
  readonly breadcrumbs = [{ label: 'المالك' }, { label: 'الاشتراكات', href: '/owner/subscriptions' }, { label: this.subscriptionId }];
  readonly canManage = this.auth.hasPermission(MANAGE_SUBSCRIPTIONS_PERMISSION);
  readonly pendingAction = signal<PendingAction>(null);
  readonly reasonOpen = signal(false);
  targetPlanId = '';
  edit: SubscriptionUpdatePayload = {};
  renew: RenewSubscriptionPayload = { reason: '' };

  ngOnInit(): void { this.load(); }

  async load(): Promise<void> {
    await this.facade.loadDetail(this.subscriptionId);
    const subscription = this.facade.detail().data;
    if (subscription) {
      this.edit = {
        status: subscription.status,
        paymentStatus: subscription.paymentStatus,
        trialStartedAt: dateInput(subscription.trialStartedAt),
        trialEndsAt: dateInput(subscription.trialEndsAt),
        currentPeriodStart: dateInput(subscription.currentPeriodStart),
        currentPeriodEnd: dateInput(subscription.currentPeriodEnd),
        renewalDate: dateInput(subscription.renewalDate),
        notes: subscription.notes,
      };
    }
  }

  async save(form: NgForm): Promise<void> {
    if (form.invalid || !this.canManage) return;
    await this.facade.update(this.subscriptionId, this.edit);
  }

  requestAction(action: PendingAction): void {
    if (!this.canManage) return;
    this.pendingAction.set(action);
  }

  async submitReason(reason: string): Promise<void> {
    const action = this.pendingAction();
    if (!action) return;
    if (action === 'change-plan') await this.facade.changePlan(this.subscriptionId, { planId: this.targetPlanId, reason });
    if (action === 'cancel') await this.facade.cancel(this.subscriptionId, reason);
    if (action === 'renew') await this.facade.renew(this.subscriptionId, { ...this.renew, reason });
    this.closeReason();
  }

  closeReason(): void { this.reasonOpen.set(false); this.pendingAction.set(null); }
  confirmTitle(): string { return this.pendingAction() === 'cancel' ? 'تأكيد إلغاء الاشتراك' : this.pendingAction() === 'renew' ? 'تأكيد تجديد الاشتراك' : 'تأكيد تغيير الخطة'; }
  confirmMessage(): string { return 'سيتم طلب سبب قبل استدعاء الخادم، ولن يتم حذف الاشتراك محلياً.'; }
  reasonTitle(): string { return this.pendingAction() === 'cancel' ? 'سبب إلغاء الاشتراك' : this.pendingAction() === 'renew' ? 'سبب تجديد الاشتراك' : 'سبب تغيير الخطة'; }
  badgeStatus(status: string): DashboardStatus { return status as DashboardStatus; }
  formatDate(value: string | null): string { return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'غير متاح'; }
  formatUsage(used: number | null, limit: number | null): string { return `${used ?? 0} / ${limit ?? 'unlimited'}`; }
}

const dateInput = (value: string | null): string => value?.slice(0, 10) ?? '';
