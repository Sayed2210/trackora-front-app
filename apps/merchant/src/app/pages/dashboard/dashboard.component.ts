import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MerchantDashboardRepository } from '@trackora/shared/data-access';
import { AuthService } from '@trackora/core/auth';
import { EgpCurrencyPipe, LocalDatePipe, AnalyticsChartComponent } from '@trackora/shared/ui';
import { firstValueFrom } from 'rxjs';

interface DashboardKpi {
  label: string;
  value: string | number;
  trend?: string;
  icon: string;
  color: string;
}

interface ActivityEvent {
  id: string;
  type: 'shipment' | 'wallet' | 'delivery' | 'return';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface MerchantDashboardData {
  [key: string]: unknown;
  totalShipments?: number;
  deliveryRate?: number;
  avgCod?: number;
  avgCodAmount?: number;
  availableBalance?: number;
  pending?: number;
  failed?: number;
  shipments?: {
    total?: number;
    pending?: number;
    inTransit?: number;
    delivered?: number;
    returned?: number;
    failed?: number;
  };
  wallet?: {
    balance?: number;
    availableBalance?: number;
    pending?: number;
    pendingBalance?: number;
  };
  trends?: Record<string, string>;
  recentActivity?: Array<{
    id?: string;
    type?: string;
    title?: string;
    trackingNumber?: string;
    description?: string;
    message?: string;
    timestamp?: string;
    createdAt?: string;
    time?: string;
    amount?: number;
    status?: string;
  }>;
  activities?: Array<{
    id?: string;
    type?: string;
    title?: string;
    trackingNumber?: string;
    description?: string;
    message?: string;
    timestamp?: string;
    createdAt?: string;
    time?: string;
    amount?: number;
    status?: string;
  }>;
  statusBreakdown?: {
    delivered?: number;
    pending?: number;
    failed?: number;
    returned?: number;
  };
}

interface MerchantAnalyticsData {
  trends?: Array<{
    label?: string;
    period?: string;
    delivered?: number;
    failed?: number;
    pending?: number;
  }>;
  statusBreakdown?: {
    delivered?: number;
    pending?: number;
    failed?: number;
    returned?: number;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, EgpCurrencyPipe, LocalDatePipe, AnalyticsChartComponent],
  template: `
    <div class="dashboard">
      <h1>Merchant Dashboard</h1>
      <p class="subtitle">Welcome to Trackora Merchant Portal</p>

      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let kpi of kpis()">
          <div class="kpi-icon" [style.background]="kpi.color + '20'" [style.color]="kpi.color">
            {{ kpi.icon }}
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ kpi.value }}</span>
            <span class="kpi-label">{{ kpi.label }}</span>
            <span class="kpi-trend" *ngIf="kpi.trend">{{ kpi.trend }}</span>
          </div>
        </div>
      </div>

      <div class="analytics-section">
        <div class="chart-card">
          <h3>Shipment Trends</h3>
          <app-analytics-chart
            type="line"
            [labels]="chartLabels()"
            [datasets]="shipmentTrendDatasets()"
          />
        </div>
        <div class="chart-card">
          <h3>Status Breakdown</h3>
          <app-analytics-chart
            type="doughnut"
            [labels]="statusLabels()"
            [datasets]="statusDatasets()"
          />
        </div>
      </div>

      <div class="dashboard-sections">
        <div class="section recent-activity">
          <div class="section-header">
            <h2>Recent Activity</h2>
            <a routerLink="/shipments" class="view-all">View All Shipments →</a>
          </div>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let activity of activities()">
              <div class="activity-marker" [class]="activity.type"></div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-desc">{{ activity.description }}</div>
                <div class="activity-meta">
                  <span class="activity-time">{{ activity.timestamp | localDate }}</span>
                  <span class="activity-status" *ngIf="activity.status" [class]="activity.status">{{ activity.status }}</span>
                </div>
              </div>
            </div>
            <div class="empty-state" *ngIf="!activities().length">
              <p>No recent activity</p>
            </div>
          </div>
        </div>

        <div class="section quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <a routerLink="/shipments/create" class="action-btn primary">
              <span class="icon">📦</span>
              <span>New Shipment</span>
            </a>
            <a routerLink="/shipments/bulk-upload" class="action-btn secondary">
              <span class="icon">📁</span>
              <span>Bulk Upload</span>
            </a>
            <a routerLink="/wallet" class="action-btn secondary">
              <span class="icon">💰</span>
              <span>View Wallet</span>
            </a>
            <a routerLink="/payouts" class="action-btn secondary">
              <span class="icon">💳</span>
              <span>Request Payout</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 1rem; }
    .subtitle { color: var(--trackora-text-secondary); margin-bottom: 1.5rem; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .kpi-card { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; display: flex; align-items: flex-start; gap: 1rem; }
    .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
    .kpi-content { display: flex; flex-direction: column; }
    .kpi-value { font-size: 1.5rem; font-weight: 700; color: var(--trackora-primary); }
    .kpi-label { font-size: 0.875rem; color: var(--trackora-text-secondary); margin-top: 0.25rem; }
    .kpi-trend { font-size: 0.75rem; color: var(--trackora-success); margin-top: 0.25rem; }
    .dashboard-sections { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    @media (max-width: 768px) { .dashboard-sections { grid-template-columns: 1fr; } }
    .section { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.5rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .section-header h2 { margin: 0; font-size: 1.125rem; }
    .view-all { font-size: 0.875rem; color: var(--trackora-primary); text-decoration: none; }
    .activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .activity-item { display: flex; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; background: var(--trackora-surface); }
    .activity-marker { width: 10px; height: 10px; border-radius: 50%; margin-top: 0.5rem; flex-shrink: 0; }
    .activity-marker.shipment { background: #3B82F6; }
    .activity-marker.wallet { background: #10B981; }
    .activity-marker.delivery { background: #8B5CF6; }
    .activity-marker.return { background: #EF4444; }
    .activity-content { flex: 1; }
    .activity-title { font-weight: 600; font-size: 0.9375rem; }
    .activity-desc { font-size: 0.875rem; color: var(--trackora-text-secondary); margin-top: 0.25rem; }
    .activity-meta { display: flex; gap: 0.75rem; margin-top: 0.5rem; align-items: center; }
    .activity-time { font-size: 0.75rem; color: var(--trackora-text-secondary); }
    .activity-status { font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
    .empty-state { text-align: center; padding: 2rem; color: var(--trackora-text-secondary); }
    .action-buttons { display: flex; flex-direction: column; gap: 0.75rem; }
    .action-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 500; transition: all 0.2s; }
    .action-btn:hover { transform: translateY(-1px); }
    .action-btn.primary { background: var(--trackora-primary); color: white; }
    .action-btn.secondary { background: var(--trackora-surface); color: var(--trackora-text); border: 1px solid var(--trackora-border); }
    .action-btn .icon { font-size: 1.25rem; }
    .analytics-section { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    @media (max-width: 768px) { .analytics-section { grid-template-columns: 1fr; } }
    .chart-card { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; }
    .chart-card h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .chart-card app-analytics-chart { height: 260px; }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly dashboardRepo = inject(MerchantDashboardRepository);
  private readonly authService = inject(AuthService);

  readonly kpis = signal<DashboardKpi[]>([]);
  readonly activities = signal<ActivityEvent[]>([]);
  readonly chartLabels = signal<string[]>([]);
  readonly shipmentTrendDatasets = signal<Array<{ label: string; data: number[]; borderColor: string; backgroundColor: string }>>([]);
  readonly statusLabels = signal<string[]>([]);
  readonly statusDatasets = signal<Array<{ label: string; data: number[]; backgroundColor: string[] }>>([]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    const user = this.authService.user();
    const merchantId = user?.merchantId ?? user?.id;
    if (!merchantId) {
      this.clearDashboard();
      return;
    }

    try {
      const [dashboard, analytics] = await Promise.all([
        firstValueFrom(this.dashboardRepo.getDashboard(merchantId)),
        firstValueFrom(this.dashboardRepo.getAnalytics(merchantId, 30)),
      ]);

      this.setKpis(dashboard);
      this.setActivities(dashboard);
      this.setCharts(dashboard, analytics);
    } catch {
      this.clearDashboard();
    }
  }

  private setKpis(data: MerchantDashboardData): void {
    const avgCod = data.avgCod ?? data.avgCodAmount;
    const values: Array<{ key: string; label: string; value: string | number | undefined; icon: string; color: string }> = [
      { key: 'totalShipments', label: 'Total Shipments', value: data.totalShipments ?? data.shipments?.total, icon: '📦', color: '#3B82F6' },
      { key: 'deliveryRate', label: 'Delivery Rate', value: data.deliveryRate !== undefined ? `${data.deliveryRate}%` : undefined, icon: '✅', color: '#10B981' },
      { key: 'avgCod', label: 'Avg COD', value: avgCod !== undefined ? `${avgCod} EGP` : undefined, icon: '💰', color: '#F59E0B' },
      { key: 'availableBalance', label: 'Available Balance', value: data.availableBalance ?? data.wallet?.availableBalance ?? data.wallet?.balance, icon: '👛', color: '#8B5CF6' },
      { key: 'pending', label: 'Pending', value: data.pending ?? data.shipments?.pending, icon: '⏳', color: '#EF4444' },
      { key: 'failed', label: 'Failed', value: data.failed ?? data.shipments?.failed, icon: '⚠️', color: '#6B7280' },
    ];

    this.kpis.set(values
      .filter((kpi) => kpi.value !== undefined && kpi.value !== null)
      .map((kpi) => ({
        label: kpi.label,
        value: kpi.value as string | number,
        icon: kpi.icon,
        color: kpi.color,
        trend: data?.trends?.[kpi.key],
      })));
  }

  private setActivities(data: MerchantDashboardData): void {
    const rawActivities = data?.recentActivity ?? data?.activities ?? [];
    if (!Array.isArray(rawActivities)) {
      this.activities.set([]);
      return;
    }

    this.activities.set(
      rawActivities.map((a: NonNullable<MerchantDashboardData['recentActivity']>[number]) => ({
        id: a.id ?? crypto.randomUUID(),
        type: (a.type ?? 'shipment') as ActivityEvent['type'],
        title: a.title ?? a.trackingNumber ?? 'Activity',
        description: a.description ?? a.message ?? (a.amount ? `${a.amount} EGP` : ''),
        timestamp: a.timestamp ?? a.createdAt ?? a.time ?? new Date().toISOString(),
        status: a.status,
      }))
    );
  }

  private setCharts(dashboard: MerchantDashboardData, analytics: MerchantAnalyticsData): void {
    const trends = analytics?.trends ?? dashboard?.trends;
    if (Array.isArray(trends) && trends.length > 0) {
      this.chartLabels.set(trends.map((t: NonNullable<MerchantAnalyticsData['trends']>[number]) => t.label ?? t.period ?? ''));
      const datasets = [
        { label: 'Delivered', data: trends.map((t: NonNullable<MerchantAnalyticsData['trends']>[number]) => t.delivered ?? 0), borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)' },
        { label: 'Failed', data: trends.map((t: NonNullable<MerchantAnalyticsData['trends']>[number]) => t.failed ?? 0), borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' },
        { label: 'Pending', data: trends.map((t: NonNullable<MerchantAnalyticsData['trends']>[number]) => t.pending ?? 0), borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.2)' },
      ];
      this.shipmentTrendDatasets.set(datasets);
    }

    const statusBreakdown = dashboard?.statusBreakdown ?? analytics?.statusBreakdown ?? {
      delivered: dashboard.shipments?.delivered,
      pending: dashboard.shipments?.pending,
      failed: dashboard.shipments?.failed,
      returned: dashboard.shipments?.returned,
    };
    if (statusBreakdown) {
      const labels = ['Delivered', 'Pending', 'Failed', 'Returned'];
      const data = [
        statusBreakdown.delivered ?? 0,
        statusBreakdown.pending ?? 0,
        statusBreakdown.failed ?? 0,
        statusBreakdown.returned ?? 0,
      ];
      this.statusLabels.set(labels);
      this.statusDatasets.set([{
        label: 'Shipments',
        data,
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#9CA3AF'],
      }]);
    }
  }

  private clearDashboard(): void {
    this.kpis.set([]);
    this.activities.set([]);
    this.chartLabels.set([]);
    this.shipmentTrendDatasets.set([]);
    this.statusLabels.set([]);
    this.statusDatasets.set([]);
  }
}
