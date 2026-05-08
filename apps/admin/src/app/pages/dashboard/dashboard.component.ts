import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AdminRepository } from '@trackora/shared/data-access';
import { EgpCurrencyPipe, LocalDatePipe } from '@trackora/shared/ui';
import { firstValueFrom } from 'rxjs';

interface AdminKpi {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

interface CourierStatus {
  online: number;
  offline: number;
  onDelivery: number;
  total: number;
}

interface RealtimeAlert {
  id: string;
  type: 'cash_risk' | 'failed_spike' | 'delayed_shipment' | 'system';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, LocalDatePipe],
  template: `
    <div class="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p class="subtitle">Operations overview and real-time monitoring</p>

      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let kpi of kpis()">
          <div class="kpi-icon" [style.background]="kpi.color + '20'" [style.color]="kpi.color">
            {{ kpi.icon }}
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ kpi.value }}</span>
            <span class="kpi-label">{{ kpi.label }}</span>
            <span class="kpi-subtitle" *ngIf="kpi.subtitle">{{ kpi.subtitle }}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-panels">
        <div class="panel courier-status">
          <h3>Courier Status</h3>
          <div class="status-grid">
            <div class="status-item online">
              <span class="status-dot"></span>
              <span class="status-label">Online</span>
              <span class="status-value">{{ courierStatus().online }}</span>
            </div>
            <div class="status-item on-delivery">
              <span class="status-dot"></span>
              <span class="status-label">On Delivery</span>
              <span class="status-value">{{ courierStatus().onDelivery }}</span>
            </div>
            <div class="status-item offline">
              <span class="status-dot"></span>
              <span class="status-label">Offline</span>
              <span class="status-value">{{ courierStatus().offline }}</span>
            </div>
            <div class="status-item total">
              <span class="status-label">Total</span>
              <span class="status-value">{{ courierStatus().total }}</span>
            </div>
          </div>
        </div>

        <div class="panel alerts-panel">
          <div class="panel-header">
            <h3>Real-time Alerts</h3>
            <span class="alert-badge" *ngIf="unreadAlerts() > 0">{{ unreadAlerts() }}</span>
          </div>
          <div class="alerts-list">
            <div class="alert-item" *ngFor="let alert of alerts()" [class]="alert.severity">
              <div class="alert-icon">{{ getAlertIcon(alert.type) }}</div>
              <div class="alert-content">
                <span class="alert-message">{{ alert.message }}</span>
                <span class="alert-time">{{ alert.timestamp | localDate }}</span>
              </div>
            </div>
            <div class="empty-state" *ngIf="!alerts().length">
              <p>No active alerts</p>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-links">
        <h3>Quick Actions</h3>
        <div class="link-grid">
          <a routerLink="/shipments" class="quick-link">
            <span class="icon">📦</span>
            <span>Manage Shipments</span>
          </a>
          <a routerLink="/assignments" class="quick-link">
            <span class="icon">🚚</span>
            <span>Dispatch Board</span>
          </a>
          <a routerLink="/couriers" class="quick-link">
            <span class="icon">👤</span>
            <span>Courier Management</span>
          </a>
          <a routerLink="/merchants" class="quick-link">
            <span class="icon">🏪</span>
            <span>Merchant Management</span>
          </a>
          <a routerLink="/payouts" class="quick-link">
            <span class="icon">💳</span>
            <span>Payout Approvals</span>
          </a>
          <a routerLink="/analytics" class="quick-link">
            <span class="icon">📊</span>
            <span>Analytics</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard { padding: 1rem; }
    .subtitle { color: var(--trackora-text-secondary); margin-bottom: 1.5rem; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .kpi-card { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; display: flex; align-items: flex-start; gap: 1rem; }
    .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
    .kpi-content { display: flex; flex-direction: column; }
    .kpi-value { font-size: 1.5rem; font-weight: 700; color: var(--trackora-primary); }
    .kpi-label { font-size: 0.875rem; color: var(--trackora-text-secondary); margin-top: 0.25rem; }
    .kpi-subtitle { font-size: 0.75rem; color: var(--trackora-success); margin-top: 0.25rem; }
    .dashboard-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    @media (max-width: 768px) { .dashboard-panels { grid-template-columns: 1fr; } }
    .panel { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; }
    .panel h3 { margin: 0 0 1rem; font-size: 1rem; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .panel-header h3 { margin: 0; }
    .alert-badge { background: #EF4444; color: white; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 10px; font-weight: 600; }
    .status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .status-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: var(--trackora-surface); border-radius: 8px; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .online .status-dot { background: #10B981; }
    .on-delivery .status-dot { background: #3B82F6; }
    .offline .status-dot { background: #9CA3AF; }
    .status-label { font-size: 0.875rem; color: var(--trackora-text-secondary); }
    .status-value { margin-left: auto; font-weight: 700; font-size: 1.125rem; }
    .alerts-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 300px; overflow-y: auto; }
    .alert-item { display: flex; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; background: var(--trackora-surface); align-items: flex-start; }
    .alert-item.critical { border-left: 3px solid #EF4444; }
    .alert-item.high { border-left: 3px solid #F59E0B; }
    .alert-item.medium { border-left: 3px solid #3B82F6; }
    .alert-item.low { border-left: 3px solid #9CA3AF; }
    .alert-icon { font-size: 1.25rem; }
    .alert-content { flex: 1; display: flex; flex-direction: column; }
    .alert-message { font-size: 0.875rem; font-weight: 500; }
    .alert-time { font-size: 0.75rem; color: var(--trackora-text-secondary); margin-top: 0.25rem; }
    .empty-state { text-align: center; padding: 1.5rem; color: var(--trackora-text-secondary); font-size: 0.875rem; }
    .quick-links { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; }
    .quick-links h3 { margin: 0 0 1rem; font-size: 1rem; }
    .link-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; }
    .quick-link { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; background: var(--trackora-surface); border-radius: 8px; text-decoration: none; color: var(--trackora-text); font-size: 0.875rem; font-weight: 500; transition: all 0.2s; }
    .quick-link:hover { background: var(--trackora-primary); color: white; transform: translateY(-2px); }
    .quick-link .icon { font-size: 1.5rem; }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly adminRepo = inject(AdminRepository);

  readonly kpis = signal<AdminKpi[]>([]);
  readonly courierStatus = signal<CourierStatus>({ online: 0, offline: 0, onDelivery: 0, total: 0 });
  readonly alerts = signal<RealtimeAlert[]>([]);
  readonly unreadAlerts = signal(0);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    try {
      const dashboard = await firstValueFrom(this.adminRepo.getDashboard());

      this.setKpis(dashboard);
      this.setCourierStatus(dashboard);
      this.setAlerts(dashboard);
    } catch {
      this.clearDashboard();
    }
  }

  private setKpis(data: any): void {
    const kpiConfig: Record<string, { label: string; icon: string; color: string }> = {
      todayShipments: { label: "Today's Shipments", icon: '📦', color: '#3B82F6' },
      deliveredToday: { label: 'Delivered Today', icon: '✅', color: '#10B981' },
      failedToday: { label: 'Failed Today', icon: '⚠️', color: '#EF4444' },
      totalCod: { label: 'Total COD', icon: '💰', color: '#F59E0B' },
    };

    const builtKpis: AdminKpi[] = [];

    for (const [key, config] of Object.entries(kpiConfig)) {
      const raw = data?.[key];
      if (raw === undefined || raw === null) continue;

      const value = key === 'totalCod' ? `${raw} EGP` : raw;
      const subtitle = data?.subtitles?.[key];

      builtKpis.push({
        label: config.label,
        value,
        icon: config.icon,
        color: config.color,
        subtitle,
      });
    }

    this.kpis.set(builtKpis);
  }

  private setCourierStatus(data: any): void {
    const status = data?.courierStatus ?? data?.couriers;
    if (!status) {
      this.courierStatus.set({ online: 0, offline: 0, onDelivery: 0, total: 0 });
      return;
    }

    this.courierStatus.set({
      online: status.online ?? 0,
      offline: status.offline ?? 0,
      onDelivery: status.onDelivery ?? 0,
      total: status.total ?? (status.online ?? 0) + (status.offline ?? 0) + (status.onDelivery ?? 0),
    });
  }

  private setAlerts(data: any): void {
    const rawAlerts = data?.alerts ?? data?.notifications ?? [];
    if (!Array.isArray(rawAlerts)) {
      this.alerts.set([]);
      this.unreadAlerts.set(0);
      return;
    }

    const mapped: RealtimeAlert[] = rawAlerts.map((a: any) => ({
      id: a.id ?? crypto.randomUUID(),
      type: a.type ?? 'system',
      message: a.message ?? a.title ?? '',
      severity: a.severity ?? 'medium',
      timestamp: a.timestamp ?? a.createdAt ?? new Date().toISOString(),
    }));

    this.alerts.set(mapped.slice(0, 10));
    this.unreadAlerts.set(mapped.filter((a) => !a.read).length);
  }

  private clearDashboard(): void {
    this.kpis.set([]);
    this.courierStatus.set({ online: 0, offline: 0, onDelivery: 0, total: 0 });
    this.alerts.set([]);
    this.unreadAlerts.set(0);
  }

  getAlertIcon(type: string): string {
    const icons: Record<string, string> = {
      cash_risk: '💰',
      failed_spike: '⚠️',
      delayed_shipment: '📦',
      system: '🔔',
    };
    return icons[type] || '🔔';
  }
}
