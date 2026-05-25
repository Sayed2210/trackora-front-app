import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  OverviewFacade,
  OverviewSectionKey,
  PlatformAlert,
  TopTenantByShipmentVolume,
} from '@trackora/platform-overview';
import {
  EmptyStateComponent,
  ErrorStateComponent,
  LoadingStateComponent,
  MetricGridComponent,
  PageHeaderComponent,
  SectionCardComponent,
  StatCardComponent,
  StatusBadgeComponent,
} from '../shared/dashboard-ui';

@Component({
  selector: 'app-owner-overview-page',
  imports: [
    CommonModule,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
    MetricGridComponent,
    PageHeaderComponent,
    SectionCardComponent,
    StatCardComponent,
    StatusBadgeComponent,
  ],
  providers: [OverviewFacade],
  template: `
    <section class="overview-page">
      <app-owner-page-header
        title="لوحة مؤشرات المنصة"
        description="نظرة تشغيلية موحدة على صحة المستأجرين والحركة المالية والشحنات."
        [breadcrumbs]="breadcrumbs"
      />

      @if (facade.allFailed()) {
        <app-owner-error-state
          title="تعذر تحميل لوحة المؤشرات"
          message="لم نتمكن من تحميل مؤشرات المنصة الآن. حاول مرة أخرى دون كشف تفاصيل تقنية."
        >
          <button state-action type="button" class="overview-action" (click)="retry()">
            إعادة المحاولة
          </button>
        </app-owner-error-state>
      } @else {
        @if (facade.loading() && !facade.hasAnyData()) {
          <app-owner-loading-state
            title="جاري تحميل مؤشرات المنصة"
            message="يتم تجهيز أحدث أرقام المستأجرين والشحنات والإيرادات."
          />
        }

        <app-owner-metric-grid>
          <app-owner-stat-card
            title="إجمالي المستأجرين"
            [value]="facade.overview().data?.totalTenants"
            subtitle="كل حسابات المنصة"
            severity="info"
            [loading]="facade.overview().loading"
            [empty]="!facade.overview().data"
            emptyLabel="غير متاح"
          />
          <app-owner-stat-card
            title="المستأجرون النشطون"
            [value]="facade.overview().data?.activeTenants"
            subtitle="حسابات تعمل حالياً"
            severity="success"
            [loading]="facade.overview().loading"
            [empty]="!facade.overview().data"
            emptyLabel="غير متاح"
          />
          <app-owner-stat-card
            title="مستأجرو التجربة"
            [value]="facade.overview().data?.trialTenants"
            subtitle="حسابات في الفترة التجريبية"
            severity="warning"
            [loading]="facade.overview().loading"
            [empty]="!facade.overview().data"
            emptyLabel="غير متاح"
          />
          <app-owner-stat-card
            title="المستأجرون الموقوفون"
            [value]="facade.overview().data?.suspendedTenants"
            subtitle="حسابات تحتاج مراجعة"
            severity="danger"
            [loading]="facade.overview().loading"
            [empty]="!facade.overview().data"
            emptyLabel="غير متاح"
          />
          <app-owner-stat-card
            title="إجمالي الشحنات"
            [value]="totalShipments()"
            subtitle="حجم التشغيل عبر المنصة"
            severity="info"
            [loading]="facade.usage().loading || facade.shipments().loading"
            [empty]="!facade.usage().data && !facade.shipments().data"
            emptyLabel="غير متاح"
          />
          <app-owner-stat-card
            title="التجار النشطون"
            [value]="facade.overview().data?.activeMerchants"
            subtitle="تجار لديهم نشاط حالي"
            severity="success"
            [loading]="facade.overview().loading"
            [empty]="!facade.overview().data"
            emptyLabel="غير متاح"
          />
          <app-owner-stat-card
            title="المناديب النشطون"
            [value]="facade.overview().data?.activeCouriers"
            subtitle="شبكة التوصيل الحالية"
            severity="success"
            [loading]="facade.overview().loading"
            [empty]="!facade.overview().data"
            emptyLabel="غير متاح"
          />
          <app-owner-stat-card
            title="حجم الدفع عند الاستلام"
            [value]="formatCurrency(facade.revenue().data?.codVolume)"
            subtitle="COD عبر المستأجرين"
            severity="info"
            [loading]="facade.revenue().loading"
            [empty]="!facade.revenue().data"
            emptyLabel="غير متاح"
          />
          <app-owner-stat-card
            title="حجم المدفوعات"
            [value]="formatCurrency(facade.revenue().data?.payoutVolume)"
            subtitle="Payout volume"
            severity="success"
            [loading]="facade.revenue().loading"
            [empty]="!facade.revenue().data"
            emptyLabel="غير متاح"
          />
          <app-owner-stat-card
            title="شحنات مشتبه بها"
            [value]="fraudFlaggedShipments()"
            subtitle="تحتاج متابعة تشغيلية"
            severity="danger"
            [loading]="facade.usage().loading || facade.shipments().loading"
            [empty]="!facade.usage().data && !facade.shipments().data"
            emptyLabel="غير متاح"
          />
        </app-owner-metric-grid>

        <div class="overview-page__sections">
          <app-owner-section-card
            title="أعلى المستأجرين حسب حجم الشحنات"
            description="ترتيب تشغيلي مختصر للحسابات الأعلى نشاطاً."
          >
            @if (facade.usage().loading) {
              <app-owner-loading-state title="تحميل ترتيب المستأجرين" message="يتم تجهيز الحجم التشغيلي." />
            } @else if (facade.usage().error) {
              <app-owner-error-state title="تعذر تحميل ترتيب المستأجرين" [message]="facade.usage().error || ''">
                <button state-action type="button" class="overview-action" (click)="retry('usage')">
                  إعادة المحاولة
                </button>
              </app-owner-error-state>
            } @else if (!topTenants().length) {
              <app-owner-empty-state title="لا توجد بيانات مستأجرين" message="لا توجد بيانات حجم شحنات متاحة حالياً." />
            } @else {
              <div class="tenant-list">
                @for (tenant of topTenants(); track tenant.tenantId) {
                  <div class="tenant-row">
                    <div>
                      <strong>{{ tenant.tenantName }}</strong>
                      <span>{{ tenant.tenantId }}</span>
                    </div>
                    <b>{{ tenant.shipmentCount }}</b>
                  </div>
                }
              </div>
            }
          </app-owner-section-card>

          <app-owner-section-card
            title="تنبيهات المنصة"
            description="إشارات تحتاج انتباه مالك النظام دون عرض تفاصيل حساسة."
          >
            @if (facade.overview().loading) {
              <app-owner-loading-state title="تحميل التنبيهات" message="يتم فحص أحدث إشارات المنصة." />
            } @else if (facade.overview().error) {
              <app-owner-error-state title="تعذر تحميل التنبيهات" [message]="facade.overview().error || ''">
                <button state-action type="button" class="overview-action" (click)="retry('overview')">
                  إعادة المحاولة
                </button>
              </app-owner-error-state>
            } @else if (!alerts().length) {
              <app-owner-empty-state title="لا توجد تنبيهات" message="لا توجد إشارات تشغيلية تحتاج تدخلاً الآن." />
            } @else {
              <div class="alert-list">
                @for (alert of alerts(); track alert.id) {
                  <article class="alert-item">
                    <div>
                      <strong>{{ alert.title }}</strong>
                      <p>{{ alert.message }}</p>
                    </div>
                    <app-owner-status-badge [status]="alert.severity" [label]="alertLabel(alert.severity)" />
                  </article>
                }
              </div>
            }
          </app-owner-section-card>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .overview-page {
        display: grid;
        gap: 1.25rem;
      }

      .overview-page__sections {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(20rem, 0.75fr);
        gap: 1rem;
      }

      .overview-action {
        padding-block: 0.7rem;
        padding-inline: 1rem;
        color: var(--trackora-primary-contrast);
        background: var(--trackora-primary);
        border: 1px solid var(--trackora-primary);
        border-radius: 0.75rem;
        cursor: pointer;
        font-weight: 800;
      }

      .tenant-list,
      .alert-list {
        display: grid;
        gap: 0.75rem;
      }

      .tenant-row,
      .alert-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.85rem;
        background: var(--trackora-surface);
        border: 1px solid var(--trackora-border);
        border-radius: 0.9rem;
      }

      .tenant-row strong,
      .tenant-row span {
        display: block;
      }

      .tenant-row strong,
      .alert-item strong {
        color: var(--trackora-primary);
      }

      .tenant-row span,
      .alert-item p {
        margin: 0;
        color: var(--trackora-text-secondary);
        line-height: 1.6;
      }

      .tenant-row b {
        color: var(--trackora-primary);
        font-family: var(--font-header);
        font-size: 1.15rem;
      }

      .alert-item {
        align-items: flex-start;
      }

      @media (max-width: 1024px) {
        .overview-page__sections {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class OverviewPageComponent implements OnInit {
  readonly facade = inject(OverviewFacade);
  readonly breadcrumbs = [{ label: 'المالك' }, { label: 'لوحة المؤشرات' }];

  ngOnInit(): void {
    this.facade.load();
  }

  retry(section?: OverviewSectionKey): void {
    this.facade.retry(section);
  }

  totalShipments(): number | undefined {
    return (
      this.facade.shipments().data?.totalShipments ??
      this.facade.usage().data?.totalShipments
    );
  }

  fraudFlaggedShipments(): number | undefined {
    return (
      this.facade.shipments().data?.fraudFlaggedShipments ??
      this.facade.usage().data?.fraudFlaggedShipments
    );
  }

  topTenants(): TopTenantByShipmentVolume[] {
    return this.facade.usage().data?.topTenantsByShipmentVolume ?? [];
  }

  alerts(): PlatformAlert[] {
    return this.facade.overview().data?.alerts ?? [];
  }

  formatCurrency(value: number | null | undefined): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  alertLabel(severity: PlatformAlert['severity']): string {
    const labels: Record<PlatformAlert['severity'], string> = {
      info: 'معلومة',
      warning: 'تحذير',
      danger: 'خطر',
    };

    return labels[severity];
  }
}
