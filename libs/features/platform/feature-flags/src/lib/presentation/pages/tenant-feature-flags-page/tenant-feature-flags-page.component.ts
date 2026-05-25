import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import {
  ConfirmationDialogComponent,
  DataTableShellComponent,
  PageHeaderComponent,
  ReasonRequiredDialogComponent,
  SectionCardComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { FeatureFlagsFacade } from '../../../application/feature-flags.facade';
import { TenantFeatureFlag, TenantFeatureFlagOverride } from '../../../domain/models/feature-flag.models';
import { MANAGE_FEATURE_FLAGS_PERMISSION } from '../../feature-flag-permissions';

type TenantAction = { flag: TenantFeatureFlag; override: TenantFeatureFlagOverride } | null;

@Component({
  selector: 'app-tenant-feature-flags-page',
  imports: [CommonModule, ConfirmationDialogComponent, DataTableShellComponent, PageHeaderComponent, ReasonRequiredDialogComponent, RouterLink, SectionCardComponent, StatusBadgeComponent],
  providers: [FeatureFlagsFacade],
  template: `
    <section class="feature-flags-page">
      <app-owner-page-header
        title="Tenant Feature Flags"
        description="إدارة Overrides الخاصة بالمستأجر مع دعم inherit/null semantics."
        [breadcrumbs]="breadcrumbs"
      >
        <a page-actions class="page-action" [routerLink]="['/owner/tenants', tenantId]">رجوع للتفاصيل</a>
      </app-owner-page-header>

      <app-owner-section-card title="تحذير حساس" description="Tenant override يمكن أن يتجاوز سلوك الخطة أو السلوك العام للمنصة.">
        <p class="warning-text">استخدم Force Enabled أو Force Disabled فقط عند وجود سبب تشغيلي موثق. Reset to inherit يعيد القيمة إلى null.</p>
      </app-owner-section-card>

      @if (facade.tenant().success) { <p class="success-text">{{ facade.tenant().success }}</p> }
      @if (facade.tenant().error && facade.tenant().data) { <p class="error-text">{{ facade.tenant().error }}</p> }

      <app-owner-data-table-shell
        [loading]="facade.tenant().loading"
        [error]="!!facade.tenant().error && !facade.tenant().data"
        [empty]="facade.tenantEmpty()"
        loadingTitle="جاري تحميل Tenant Feature Flags"
        emptyTitle="لا توجد Feature Flags"
        emptyMessage="لم يرجع الخادم أي Flags لهذا المستأجر."
        errorTitle="تعذر تحميل Tenant Feature Flags"
        [errorMessage]="facade.tenant().error || ''"
      >
        <button table-retry type="button" class="page-action page-action--primary" (click)="load()">إعادة المحاولة</button>
        <table table-content class="flags-table">
          <thead>
            <tr><th>Key</th><th>الاسم</th><th>Global</th><th>Plan</th><th>Override</th><th>Effective</th><th>الإجراء</th></tr>
          </thead>
          <tbody>
            @for (flag of facade.tenantFlags(); track flag.key) {
              <tr>
                <td><code>{{ flag.key }}</code><small>{{ flag.description || 'لا يوجد وصف' }}</small></td>
                <td>{{ flag.name }}</td>
                <td><app-owner-status-badge [status]="flag.globalValue ? 'success' : 'neutral'" [label]="labelBool(flag.globalValue)" /></td>
                <td><app-owner-status-badge [status]="statusNullable(flag.planValue)" [label]="labelNullable(flag.planValue)" /></td>
                <td><app-owner-status-badge [status]="statusOverride(flag.overrideValue)" [label]="labelOverride(flag.overrideValue)" /></td>
                <td><app-owner-status-badge [status]="flag.effectiveValue ? 'success' : 'neutral'" [label]="labelBool(flag.effectiveValue)" /></td>
                <td>
                  <div class="actions-inline">
                    <button type="button" class="page-action" [disabled]="!canManage || facade.tenant().saving" (click)="request(flag, true)">Force enabled</button>
                    <button type="button" class="page-action" [disabled]="!canManage || facade.tenant().saving" (click)="request(flag, false)">Force disabled</button>
                    <button type="button" class="page-action" [disabled]="!canManage || facade.tenant().saving" (click)="request(flag, null)">Inherit</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </app-owner-data-table-shell>

      <app-owner-confirmation-dialog
        [open]="!!pendingAction() && !reasonOpen()"
        title="تأكيد Tenant Override"
        [message]="confirmationMessage()"
        confirmLabel="متابعة"
        cancelLabel="إلغاء"
        severity="warning"
        (confirmationConfirm)="reasonOpen.set(true)"
        (confirmationCancel)="closeDialogs()"
      />
      <app-owner-reason-required-dialog
        [open]="reasonOpen()"
        title="سبب تغيير Tenant Feature Flag"
        message="اكتب سبباً واضحاً. سيتم إرسال null عند اختيار inherit."
        confirmLabel="حفظ التغيير"
        cancelLabel="إلغاء"
        (reasonConfirm)="submitReason($event)"
        (reasonCancel)="closeDialogs()"
      />
    </section>
  `,
  styles: [`
    .feature-flags-page { display: grid; gap: 1rem; }
    .flags-table { inline-size: 100%; border-collapse: collapse; min-inline-size: 72rem; }
    th, td { padding: 0.85rem; border-block-end: 1px solid var(--trackora-border); text-align: start; vertical-align: top; }
    th { color: var(--trackora-text-secondary); background: var(--trackora-surface); font-size: 0.8rem; text-transform: uppercase; }
    code, small { display: block; }
    code { color: var(--trackora-primary); font-weight: 900; }
    small { margin-block-start: 0.3rem; color: var(--trackora-text-secondary); line-height: 1.5; }
    .actions-inline { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .page-action { display: inline-flex; align-items: center; justify-content: center; padding: 0.65rem 0.9rem; color: var(--trackora-primary); background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 0.75rem; cursor: pointer; text-decoration: none; font-weight: 900; }
    .page-action--primary { color: var(--trackora-primary-contrast); background: var(--trackora-primary); border-color: var(--trackora-primary); }
    .page-action:disabled { cursor: not-allowed; opacity: 0.55; }
    .warning-text, .error-text, .success-text { margin: 0; padding: 0.85rem 1rem; border: 1px solid var(--trackora-border); border-radius: 0.85rem; font-weight: 800; }
    .warning-text { color: var(--trackora-warning); background: color-mix(in srgb, var(--trackora-warning) 10%, var(--trackora-bg)); }
    .error-text { color: var(--trackora-danger); background: color-mix(in srgb, var(--trackora-danger) 9%, var(--trackora-bg)); }
    .success-text { color: var(--trackora-success); background: color-mix(in srgb, var(--trackora-success) 9%, var(--trackora-bg)); }
  `],
})
export class TenantFeatureFlagsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  readonly facade = inject(FeatureFlagsFacade);
  readonly tenantId = this.route.snapshot.paramMap.get('tenantId') ?? '';
  readonly breadcrumbs = [{ label: 'المالك' }, { label: 'Tenants', href: '/owner/tenants' }, { label: this.tenantId }, { label: 'Feature Flags' }];
  readonly canManage = this.auth.hasPermission(MANAGE_FEATURE_FLAGS_PERMISSION);
  readonly pendingAction = signal<TenantAction>(null);
  readonly reasonOpen = signal(false);

  ngOnInit(): void { void this.load(); }
  async load(): Promise<void> { await this.facade.loadTenant(this.tenantId); }
  request(flag: TenantFeatureFlag, override: TenantFeatureFlagOverride): void { if (this.canManage) this.pendingAction.set({ flag, override }); }
  async submitReason(reason: string): Promise<void> {
    const action = this.pendingAction();
    if (!action) return;
    const saved = await this.facade.setTenantOverride(this.tenantId, action.flag.key, action.override, reason);
    if (saved) this.closeDialogs();
  }
  closeDialogs(): void { this.pendingAction.set(null); this.reasonOpen.set(false); }
  confirmationMessage(): string {
    const action = this.pendingAction();
    if (!action) return '';
    return action.override === null
      ? 'سيتم reset override إلى inherit/null واستعادة قيمة الخطة أو Global.'
      : 'هذا override يمكن أن يتجاوز الخطة أو Global behavior لهذا المستأجر.';
  }
  labelBool(value: boolean): string { return value ? 'Enabled' : 'Disabled'; }
  labelNullable(value: boolean | null): string { return value === null ? 'Not returned' : this.labelBool(value); }
  labelOverride(value: TenantFeatureFlagOverride): string { return value === null ? 'Inherit' : value ? 'Force enabled' : 'Force disabled'; }
  statusNullable(value: boolean | null): 'success' | 'neutral' { return value ? 'success' : 'neutral'; }
  statusOverride(value: TenantFeatureFlagOverride): 'success' | 'warning' | 'neutral' { return value === null ? 'neutral' : value ? 'success' : 'warning'; }
}
