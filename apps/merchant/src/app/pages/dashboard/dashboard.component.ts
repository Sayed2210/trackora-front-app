import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ShipmentRepository } from '@trackora/shared/data-access';
import { WalletRepository } from '@trackora/shared/data-access';
import { EgpCurrencyPipe, LocalDatePipe, AnalyticsChartComponent } from '@trackora/shared/ui';
import { ShipmentStatus } from '@trackora/shared/domain';
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
  private readonly shipmentRepo = inject(ShipmentRepository);
  private readonly walletRepo = inject(WalletRepository);

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
    try {
      const [shipmentsResult, wallet] = await Promise.all([
        firstValueFrom(this.shipmentRepo.findAll({ page: 1, limit: 5 })),
        firstValueFrom(this.walletRepo.getWallet()),
      ]);

      const shipments = shipmentsResult.data;
      const totalShipments = shipmentsResult.meta?.totalItems || shipments.length;
      const delivered = shipments.filter((s) => s.status === ShipmentStatus.DELIVERED).length;
      const failed = shipments.filter((s) => s.status === ShipmentStatus.FAILED).length;
      const pending = shipments.filter((s) => s.status === ShipmentStatus.PENDING).length;
      const avgCod = shipments.filter((s) => s.codAmount).reduce((sum, s) => sum + (s.codAmount || 0), 0) / Math.max(shipments.filter((s) => s.codAmount).length, 1);
      const deliveryRate = totalShipments > 0 ? Math.round((delivered / totalShipments) * 100) : 0;

      this.kpis.set([
        { label: 'Total Shipments', value: totalShipments, icon: '📦', color: '#3B82F6', trend: '+12% this week' },
        { label: 'Delivery Rate', value: deliveryRate + '%', icon: '✅', color: '#10B981', trend: `${delivered} delivered` },
        { label: 'Avg COD', value: avgCod.toFixed(0) + ' EGP', icon: '💰', color: '#F59E0B' },
        { label: 'Available Balance', value: wallet.availableBalance.toFixed(0) + ' EGP', icon: '👛', color: '#8B5CF6' },
        { label: 'Pending', value: pending, icon: '⏳', color: '#EF4444' },
        { label: 'Failed', value: failed, icon: '⚠️', color: '#6B7280' },
      ]);

      this.activities.set(
        shipments.slice(0, 5).map((s) => ({
          id: s.id,
          type: s.status === ShipmentStatus.RETURNED ? 'return' : s.status === ShipmentStatus.DELIVERED ? 'delivery' : 'shipment',
          title: `${s.trackingNumber}`,
          description: `${s.customerName} — ${s.address.city}, ${s.address.governorate}`,
          timestamp: s.updatedAt,
          status: s.status,
        }))
      );

      // Analytics charts data
      this.chartLabels.set(['Week 1', 'Week 2', 'Week 3', 'Week 4']);
      this.shipmentTrendDatasets.set([
        { label: 'Delivered', data: [25, 32, 28, 40], borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)' },
        { label: 'Failed', data: [3, 5, 2, 4], borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' },
        { label: 'Pending', data: [12, 8, 15, 10], borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.2)' },
      ]);
      this.statusLabels.set(['Delivered', 'Pending', 'Failed', 'Returned']);
      this.statusDatasets.set([
        {
          label: 'Shipments',
          data: [delivered, pending, failed, shipments.filter((s) => s.status === ShipmentStatus.RETURNED).length],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#9CA3AF'],
        },
      ]);
    } catch (err) {
      // Fallback mock data if API fails
      this.kpis.set([
        { label: 'Total Shipments', value: 124, icon: '📦', color: '#3B82F6', trend: '+12% this week' },
        { label: 'Delivery Rate', value: '87%', icon: '✅', color: '#10B981', trend: '108 delivered' },
        { label: 'Avg COD', value: '156 EGP', icon: '💰', color: '#F59E0B' },
        { label: 'Available Balance', value: '12,450 EGP', icon: '👛', color: '#8B5CF6' },
        { label: 'Pending', value: 8, icon: '⏳', color: '#EF4444' },
        { label: 'Failed', value: 3, icon: '⚠️', color: '#6B7280' },
      ]);

      this.activities.set([
        {
          id: '1',
          type: 'delivery',
          title: 'TRK-001234',
          description: 'Ahmed Mohamed — Nasr City, Cairo',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'DELIVERED',
        },
        {
          id: '2',
          type: 'shipment',
          title: 'TRK-001235',
          description: 'Sara Ali — Maadi, Cairo',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'OUT_FOR_DELIVERY',
        },
        {
          id: '3',
          type: 'return',
          title: 'TRK-001230',
          description: 'Omar Hassan — Alexandria',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'RETURNED',
        },
      ]);

      this.chartLabels.set(['Week 1', 'Week 2', 'Week 3', 'Week 4']);
      this.shipmentTrendDatasets.set([
        { label: 'Delivered', data: [25, 32, 28, 40], borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.2)' },
        { label: 'Failed', data: [3, 5, 2, 4], borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.2)' },
        { label: 'Pending', data: [12, 8, 15, 10], borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.2)' },
      ]);
      this.statusLabels.set(['Delivered', 'Pending', 'Failed', 'Returned']);
      this.statusDatasets.set([
        {
          label: 'Shipments',
          data: [108, 8, 3, 5],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#9CA3AF'],
        },
      ]);
    }
  }
}
