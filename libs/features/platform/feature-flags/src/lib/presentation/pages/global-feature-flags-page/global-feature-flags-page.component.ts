import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '@trackora/core/auth';
import {
  DataTableShellComponent,
  PageHeaderComponent,
  ReasonRequiredDialogComponent,
  SectionCardComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { FeatureFlagsFacade } from '../../../application/feature-flags.facade';
import { GlobalFeatureFlag } from '../../../domain/models/feature-flag.models';
import { MANAGE_FEATURE_FLAGS_PERMISSION } from '../../feature-flag-permissions';

@Component({
  selector: 'app-global-feature-flags-page',
  imports: [CommonModule, DataTableShellComponent, PageHeaderComponent, ReasonRequiredDialogComponent, SectionCardComponent, StatusBadgeComponent],
  providers: [FeatureFlagsFacade],
  template: `
    <section class="feature-flags-page">
      <app-owner-page-header
        title="Feature Flags"
        description="إدارة Feature Flags العامة على مستوى المنصة. أي تغيير يتطلب سبباً ويظهر في مسار التدقيق الخلفي."
        [breadcrumbs]="breadcrumbs"
      />

      <app-owner-section-card title="تحذير تدقيق" description="سيتم إرسال السبب مع كل enable أو disable. لا تحفظ أي تغيير دون توثيق سبب تشغيلي واضح.">
        <p class="warning-text">تغيير Global Flag قد يؤثر على كل المستأجرين ما لم توجد overrides على مستوى Tenant.</p>
      </app-owner-section-card>

      @if (facade.global().success) { <p class="success-text">{{ facade.global().success }}</p> }
      @if (facade.global().error && facade.global().data) { <p class="error-text">{{ facade.global().error }}</p> }

      <app-owner-data-table-shell
        [loading]="facade.global().loading"
        [error]="!!facade.global().error && !facade.global().data"
        [empty]="facade.globalEmpty()"
        loadingTitle="جاري تحميل Feature Flags"
        emptyTitle="لا توجد Feature Flags"
        emptyMessage="لم يرجع الخادم أي Flags عامة."
        errorTitle="تعذر تحميل Feature Flags"
        [errorMessage]="facade.global().error || ''"
      >
        <button table-retry type="button" class="page-action page-action--primary" (click)="load()">إعادة المحاولة</button>
        <table table-content class="flags-table">
          <thead>
            <tr><th>Key</th><th>الاسم</th><th>الوصف</th><th>الحالة</th><th>الإجراء</th></tr>
          </thead>
          <tbody>
            @for (flag of facade.globalFlags(); track flag.key) {
              <tr>
                <td><code>{{ flag.key }}</code></td>
                <td>{{ flag.name }}</td>
                <td>{{ flag.description || 'لا يوجد وصف من الخادم' }}</td>
                <td><app-owner-status-badge [status]="flag.enabled ? 'success' : 'neutral'" [label]="flag.enabled ? 'Enabled' : 'Disabled'" /></td>
                <td>
                  <button type="button" class="page-action" [disabled]="!canManage || facade.global().saving" (click)="requestToggle(flag)">
                    {{ flag.enabled ? 'Disable' : 'Enable' }}
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </app-owner-data-table-shell>

      <app-owner-reason-required-dialog
        [open]="!!pendingFlag()"
        title="سبب تغيير Feature Flag"
        message="تحذير: سيتم حفظ التغيير كحدث حساس. اكتب سبباً واضحاً قبل المتابعة."
        confirmLabel="حفظ التغيير"
        cancelLabel="إلغاء"
        (reasonConfirm)="submitReason($event)"
        (reasonCancel)="pendingFlag.set(null)"
      />
    </section>
  `,
  styles: [`
    .feature-flags-page { display: grid; gap: 1rem; }
    .flags-table { inline-size: 100%; border-collapse: collapse; min-inline-size: 58rem; }
    th, td { padding: 0.85rem; border-block-end: 1px solid var(--trackora-border); text-align: start; vertical-align: top; }
    th { color: var(--trackora-text-secondary); background: var(--trackora-surface); font-size: 0.8rem; text-transform: uppercase; }
    code { color: var(--trackora-primary); font-weight: 900; }
    .page-action { display: inline-flex; align-items: center; justify-content: center; padding: 0.65rem 0.9rem; color: var(--trackora-primary); background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 0.75rem; cursor: pointer; font-weight: 900; }
    .page-action--primary { color: var(--trackora-primary-contrast); background: var(--trackora-primary); border-color: var(--trackora-primary); }
    .page-action:disabled { cursor: not-allowed; opacity: 0.55; }
    .warning-text, .error-text, .success-text { margin: 0; padding: 0.85rem 1rem; border: 1px solid var(--trackora-border); border-radius: 0.85rem; font-weight: 800; }
    .warning-text { color: var(--trackora-warning); background: color-mix(in srgb, var(--trackora-warning) 10%, var(--trackora-bg)); }
    .error-text { color: var(--trackora-danger); background: color-mix(in srgb, var(--trackora-danger) 9%, var(--trackora-bg)); }
    .success-text { color: var(--trackora-success); background: color-mix(in srgb, var(--trackora-success) 9%, var(--trackora-bg)); }
  `],
})
export class GlobalFeatureFlagsPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  readonly facade = inject(FeatureFlagsFacade);
  readonly breadcrumbs = [{ label: 'المالك' }, { label: 'Feature Flags' }];
  readonly pendingFlag = signal<GlobalFeatureFlag | null>(null);
  readonly canManage = this.auth.hasPermission(MANAGE_FEATURE_FLAGS_PERMISSION);

  ngOnInit(): void { void this.load(); }
  async load(): Promise<void> { await this.facade.loadGlobal(); }
  requestToggle(flag: GlobalFeatureFlag): void { if (this.canManage) this.pendingFlag.set(flag); }
  async submitReason(reason: string): Promise<void> {
    const flag = this.pendingFlag();
    if (!flag) return;
    const saved = await this.facade.setGlobal(flag.key, !flag.enabled, reason);
    if (saved) this.pendingFlag.set(null);
  }
}
