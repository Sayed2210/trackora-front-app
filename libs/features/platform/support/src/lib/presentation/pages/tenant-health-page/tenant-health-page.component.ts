import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@trackora/core/auth';
import {
  ConfirmationDialogComponent,
  DashboardStatus,
  ErrorStateComponent,
  LoadingStateComponent,
  PageHeaderComponent,
  ReasonRequiredDialogComponent,
  SectionCardComponent,
  StatusBadgeComponent,
} from '@trackora/owner-dashboard-ui';
import { SupportFacade } from '../../../application/support.facade';
import { IMPERSONATE_TENANT_ADMIN_PERMISSION } from '../../support-permissions';
import { supportStyles } from '../support-page/support-page.component';

@Component({
  selector: 'app-tenant-health-page',
  imports: [
    CommonModule,
    ConfirmationDialogComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    ReasonRequiredDialogComponent,
    RouterLink,
    SectionCardComponent,
    StatusBadgeComponent,
  ],
  providers: [SupportFacade],
  template: `
    <section class="support-page">
      <app-owner-page-header
        title="فحص صحة المستأجر"
        description="ملخص دعم آمن للحالة والاشتراك والتحذيرات دون كشف بيانات شحن أو بيانات عملاء خاصة."
        [breadcrumbs]="breadcrumbs"
      >
        <a
          page-actions
          class="support-action support-action--ghost"
          routerLink="/owner/support"
          >الدعم</a
        >
        <a
          page-actions
          class="support-action support-action--ghost"
          routerLink="/owner/support/impersonation"
          >إدارة الانتحال</a
        >
      </app-owner-page-header>

      @if (facade.health().loading) {
        <app-owner-loading-state
          title="جاري تحميل فحص الصحة"
          message="يتم تجهيز بيانات دعم آمنة فقط."
        />
      } @else if (facade.health().error && !facade.health().data) {
        <app-owner-error-state
          title="تعذر تحميل فحص الصحة"
          [message]="facade.health().error || ''"
        >
          <button
            state-action
            class="support-action"
            type="button"
            (click)="load()"
          >
            إعادة المحاولة
          </button>
        </app-owner-error-state>
      } @else if (facade.health().data; as health) {
        @if (facade.mutation().success) {
          <p class="success-text">{{ facade.mutation().success }}</p>
        }
        @if (facade.mutation().error) {
          <p class="error-text">{{ facade.mutation().error }}</p>
        }

        <app-owner-section-card
          [title]="health.tenant.name"
          description="ملخص المستأجر الآمن للدعم."
        >
          <div section-actions class="actions-inline">
            <app-owner-status-badge
              [status]="badgeStatus(health.tenant.status)"
              [label]="health.tenant.status"
            />
            @if (canImpersonate) {
              <button
                type="button"
                class="support-action support-action--warning"
                (click)="requestImpersonation()"
              >
                Start impersonation
              </button>
            }
          </div>
          <dl class="health-grid">
            <div>
              <dt>Tenant</dt>
              <dd>
                {{ health.tenant.name
                }}<span>{{ health.tenant.slug || health.tenant.id }}</span>
              </dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>
                {{ health.tenant.email || 'No email'
                }}<span>{{ health.tenant.phone || 'No phone' }}</span>
              </dd>
            </div>
            <div>
              <dt>Subscription</dt>
              <dd>
                {{ health.subscriptionStatus
                }}<span>{{ health.paymentStatus }}</span>
              </dd>
            </div>
            <div>
              <dt>Plan</dt>
              <dd>
                {{ health.tenant.planName || 'Not returned'
                }}<span>{{ formatDate(health.tenant.updatedAt) }}</span>
              </dd>
            </div>
          </dl>
        </app-owner-section-card>

        <app-owner-section-card
          title="تحذيرات الاستخدام"
          description="تحذيرات مجمعة فقط دون تفاصيل شحن أو طلبات عملاء."
        >
          <div class="health-list">
            @for (item of health.usageWarnings; track item.label) {
              <article>
                <strong>{{ item.label }}</strong
                ><span>{{ item.value }}</span
                ><app-owner-status-badge
                  [status]="badgeStatus(item.status)"
                  [label]="item.status"
                />
              </article>
            } @empty {
              <p class="muted">لا توجد تحذيرات استخدام مرجعة.</p>
            }
          </div>
        </app-owner-section-card>

        <app-owner-section-card
          title="ملخص خصائص الميزات"
          description="حالة مجمعة للخصائص فقط."
        >
          <div class="health-list">
            @for (item of health.featureFlags; track item.label) {
              <article>
                <strong>{{ item.label }}</strong
                ><span>{{ item.value }}</span
                ><app-owner-status-badge
                  [status]="badgeStatus(item.status)"
                  [label]="item.status"
                />
              </article>
            } @empty {
              <p class="muted">لم يرجع الخادم ملخص خصائص.</p>
            }
          </div>
        </app-owner-section-card>

        <app-owner-section-card
          title="الأخطاء والتنبيهات الحديثة"
          description="تنبيهات دعم عامة فقط."
        >
          <div class="health-list">
            @for (alert of health.recentAlerts; track alert.id) {
              <article>
                <strong>{{ alert.message }}</strong
                ><span>{{ formatDate(alert.createdAt) }}</span
                ><app-owner-status-badge
                  [status]="badgeStatus(alert.severity)"
                  [label]="alert.severity"
                />
              </article>
            } @empty {
              <p class="muted">لا توجد تنبيهات مرجعة.</p>
            }
          </div>
        </app-owner-section-card>

        <app-owner-section-card
          title="بيانات دعم آمنة"
          description="حقول metadata عامة لا تعرض بيانات عملاء خاصة."
        >
          <div class="health-list">
            @for (item of health.metadata; track item.label) {
              <article>
                <strong>{{ item.label }}</strong
                ><span>{{ item.value }}</span
                ><app-owner-status-badge
                  [status]="badgeStatus(item.status)"
                  [label]="item.status"
                />
              </article>
            } @empty {
              <p class="muted">لا توجد metadata دعم مرجعة.</p>
            }
          </div>
        </app-owner-section-card>
      }

      <app-owner-confirmation-dialog
        [open]="confirmOpen() && !reasonOpen()"
        title="تأكيد بدء الانتحال"
        message="أنت على وشك الدخول نيابة عن مسؤول شركة. سيتم تسجيل العملية في سجل التدقيق."
        confirmLabel="متابعة"
        cancelLabel="إلغاء"
        severity="warning"
        (confirmationConfirm)="reasonOpen.set(true)"
        (confirmationCancel)="confirmOpen.set(false)"
      />
      <app-owner-reason-required-dialog
        [open]="reasonOpen()"
        title="سبب بدء الانتحال"
        message="سبب الانتحال مطلوب وسيظهر في سجل التدقيق."
        reasonLabel="السبب"
        confirmLabel="بدء الانتحال"
        cancelLabel="إلغاء"
        (reasonConfirm)="startImpersonation($event)"
        (reasonCancel)="closeDialogs()"
      />
    </section>
  `,
  styles: [
    supportStyles +
      `
      .health-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin: 0; }
      .health-grid div, .health-list article { padding: 0.85rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.85rem; }
      dt, .muted, .health-list span { color: var(--trackora-text-secondary); }
      dd { margin: 0.25rem 0 0; color: var(--trackora-primary); font-weight: 900; }
      dd span, .health-list span { display: block; margin-block-start: 0.25rem; font-weight: 700; }
      .health-list { display: grid; gap: 0.65rem; }
      .health-list article { display: grid; gap: 0.45rem; }
      @media (max-width: 760px) { .health-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class TenantHealthPageComponent implements OnInit {
  protected readonly facade = inject(SupportFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  protected readonly confirmOpen = signal(false);
  protected readonly reasonOpen = signal(false);
  protected readonly canImpersonate = this.auth.hasPermission(
    IMPERSONATE_TENANT_ADMIN_PERMISSION,
  );
  protected readonly breadcrumbs = [
    { label: 'Owner', href: '/owner' },
    { label: 'Support', href: '/owner/support' },
    { label: 'Tenant Health' },
  ];

  ngOnInit(): void {
    this.load();
  }

  protected get tenantId(): string {
    return this.route.snapshot.paramMap.get('tenantId') ?? '';
  }

  protected load(): void {
    void this.facade.loadHealth(this.tenantId);
  }

  protected requestImpersonation(): void {
    if (!this.canImpersonate) return;
    this.confirmOpen.set(true);
  }

  protected async startImpersonation(reason: string): Promise<void> {
    await this.facade.startImpersonation(this.tenantId, reason);
    this.closeDialogs();
  }

  protected closeDialogs(): void {
    this.reasonOpen.set(false);
    this.confirmOpen.set(false);
  }

  protected badgeStatus(status: string): DashboardStatus {
    return status as DashboardStatus;
  }

  protected formatDate(value: string | null): string {
    if (!value) return 'Not available';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
          date,
        );
  }
}
