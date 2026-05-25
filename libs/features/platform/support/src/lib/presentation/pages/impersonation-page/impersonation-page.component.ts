import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import {
  ConfirmationDialogComponent,
  PageHeaderComponent,
  SectionCardComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { SupportFacade } from '../../../application/support.facade';
import { IMPERSONATE_TENANT_ADMIN_PERMISSION } from '../../support-permissions';
import { supportStyles } from '../support-page/support-page.component';

@Component({
  selector: 'app-impersonation-page',
  imports: [
    CommonModule,
    ConfirmationDialogComponent,
    PageHeaderComponent,
    RouterLink,
    SectionCardComponent,
    StatusBadgeComponent,
  ],
  providers: [SupportFacade],
  template: `
    <section class="support-page">
      <app-owner-page-header
        title="إدارة الانتحال"
        description="مراجعة حالة الانتحال النشطة وإنهاؤها فقط. بدء الانتحال يتم من نتائج الدعم أو صفحة صحة المستأجر."
        [breadcrumbs]="breadcrumbs"
      >
        <a
          page-actions
          class="support-action support-action--ghost"
          routerLink="/owner/support"
          >الدعم</a
        >
      </app-owner-page-header>

      @if (facade.mutation().success) {
        <p class="success-text">{{ facade.mutation().success }}</p>
      }
      @if (facade.mutation().error) {
        <p class="error-text">{{ facade.mutation().error }}</p>
      }

      <app-owner-section-card
        title="قواعد الأمان"
        description="لا توجد اختصارات خطرة أو بدء صامت للانتحال."
      >
        <ul class="rules-list">
          <li>
            بدء الانتحال يتطلب صلاحية impersonate_tenant_admin وسبباً وتأكيداً.
          </li>
          <li>كل عملية انتحال يجب أن تسجل في سجل التدقيق.</li>
          <li>الانتحال لا يمنح صلاحيات منصة إضافية إذا لم يمنحها الخادم.</li>
          <li>لا يمكن إخفاء الشريط النشط إلا بإنهاء الانتحال.</li>
        </ul>
      </app-owner-section-card>

      <app-owner-section-card
        title="الحالة الحالية"
        description="سياق الانتحال كما يرجع من /auth/me."
      >
        <div section-actions class="actions-inline">
          @if (facade.impersonationContext()) {
            <app-owner-status-badge
              status="warning"
              label="Active impersonation"
            />
            <button
              type="button"
              class="support-action support-action--warning"
              [disabled]="facade.mutation().loading"
              (click)="confirmEnd = true"
            >
              End impersonation
            </button>
          }
        </div>
        @if (facade.impersonationContext(); as context) {
          <dl class="context-grid">
            <div>
              <dt>Tenant</dt>
              <dd>
                {{ context.tenantName || context.tenantId || 'Not returned' }}
              </dd>
            </div>
            <div>
              <dt>Impersonated user</dt>
              <dd>
                {{
                  context.userName ||
                    context.userEmail ||
                    context.userId ||
                    'Not returned'
                }}
              </dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{{ context.role || 'Not returned' }}</dd>
            </div>
            <div>
              <dt>Started</dt>
              <dd>{{ formatDate(context.startedAt) }}</dd>
            </div>
          </dl>
        } @else {
          <p class="muted">لا يوجد سياق انتحال نشط حالياً.</p>
          @if (canImpersonate) {
            <a class="support-action" routerLink="/owner/support"
              >ابحث عن مستأجر لبدء الانتحال</a
            >
          }
        }
      </app-owner-section-card>

      <app-owner-confirmation-dialog
        [open]="confirmEnd"
        title="إنهاء الانتحال؟"
        message="سيتم استدعاء /platform/impersonation/end ثم تحديث /auth/me لإزالة سياق الانتحال."
        confirmLabel="إنهاء الانتحال"
        cancelLabel="إلغاء"
        severity="warning"
        (confirmationConfirm)="endImpersonation()"
        (confirmationCancel)="confirmEnd = false"
      />
    </section>
  `,
  styles: [
    supportStyles +
      `
      .rules-list { display: grid; gap: 0.55rem; margin: 0; padding-inline-start: 1.2rem; color: var(--trackora-text-secondary); line-height: 1.8; }
      .context-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin: 0; }
      .context-grid div { padding: 0.85rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.85rem; }
      dt, .muted { color: var(--trackora-text-secondary); }
      dd { margin: 0.25rem 0 0; color: var(--trackora-primary); font-weight: 900; }
      @media (max-width: 760px) { .context-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class ImpersonationPageComponent {
  protected readonly facade = inject(SupportFacade);
  private readonly auth = inject(AuthService);
  protected readonly canImpersonate = this.auth.hasPermission(
    IMPERSONATE_TENANT_ADMIN_PERMISSION,
  );
  protected readonly breadcrumbs = [
    { label: 'Owner', href: '/owner' },
    { label: 'Support', href: '/owner/support' },
    { label: 'Impersonation' },
  ];
  protected confirmEnd = false;

  protected async endImpersonation(): Promise<void> {
    await this.facade.endImpersonation();
    this.confirmEnd = false;
  }

  protected formatDate(value: string | null): string {
    if (!value) return 'Not available';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);
  }
}
