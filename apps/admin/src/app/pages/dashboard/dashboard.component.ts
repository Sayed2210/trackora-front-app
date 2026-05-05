import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ShipmentRepository, WalletRepository } from '@trackora/shared/data-access';
import { ShipmentStatus } from '@trackora/shared/domain';
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
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, EgpCurrencyPipe, LocalDatePipe],
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
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly shipmentRepo = inject(ShipmentRepository);
  private readonly walletRepo = inject(WalletRepository);
  private sseInterval: any;

  readonly kpis = signal<AdminKpi[]>([]);
  readonly courierStatus = signal<CourierStatus>({ online: 0, offline: 0, onDelivery: 0, total: 0 });
  readonly alerts = signal<RealtimeAlert[]>([]);
  readonly unreadAlerts = signal(0);

  ngOnInit(): void {
    this.loadDashboardData();
    this.startSseSimulation();
  }

  ngOnDestroy(): void {
    clearInterval(this.sseInterval);
  }

  private async loadDashboardData(): Promise<void> {
    try {
      const [shipmentsResult] = await Promise.all([
        firstValueFrom(this.shipmentRepo.findAll({ page: 1, limit: 100 })),
      ]);

      const shipments = shipmentsResult.data;
      const today = new Date().toISOString().split('T')[0];
      const todayShipments = shipments.filter((s) => s.createdAt.startsWith(today));
      const todayDelivered = shipments.filter((s) => s.status === ShipmentStatus.DELIVERED && s.updatedAt.startsWith(today));
      const todayFailed = shipments.filter((s) => s.status === ShipmentStatus.FAILED && s.updatedAt.startsWith(today));
      const totalCod = shipments.filter((s) => s.codAmount).reduce((sum, s) => sum + (s.codAmount || 0), 0);

      this.kpis.set([
        { label: "Today's Shipments", value: todayShipments.length, icon: '📦', color: '#3B82F6', subtitle: '+5 vs yesterday' },
        { label: 'Delivered Today', value: todayDelivered.length, icon: '✅', color: '#10B981', subtitle: `${Math.round((todayDelivered.length / Math.max(todayShipments.length, 1)) * 100)}% success rate` },
        { label: 'Failed Today', value: todayFailed.length, icon: '⚠️', color: '#EF4444' },
        { label: 'Total COD', value: totalCod.toFixed(0) + ' EGP', icon: '💰', color: '#F59E0B' },
      ]);

      // Mock courier status
      this.courierStatus.set({
        online: 12,
        offline: 3,
        onDelivery: 8,
        total: 23,
      });
    } catch {
      this.loadFallbackData();
    }
  }

  private loadFallbackData(): void {
    this.kpis.set([
      { label: "Today's Shipments", value: 45, icon: '📦', color: '#3B82F6', subtitle: '+5 vs yesterday' },
      { label: 'Delivered Today', value: 38, icon: '✅', color: '#10B981', subtitle: '84% success rate' },
      { label: 'Failed Today', value: 4, icon: '⚠️', color: '#EF4444' },
      { label: 'Total COD', value: '8,450 EGP', icon: '💰', color: '#F59E0B' },
    ]);

    this.courierStatus.set({
      online: 12,
      offline: 3,
      onDelivery: 8,
      total: 23,
    });
  }

  private startSseSimulation(): void {
    // Simulate SSE events with periodic alerts
    this.sseInterval = setInterval(() => {
      const alertTypes: RealtimeAlert['type'][] = ['cash_risk', 'failed_spike', 'delayed_shipment', 'system'];
      const severities: RealtimeAlert['severity'][] = ['low', 'medium', 'high', 'critical'];
      const messages = [
        'High cash collection risk detected',
        'Failed delivery spike in Zone 3',
        'Shipment TRK-2045 delayed > 24h',
        'Courier Mohamed Ali went offline',
        'New merchant registration pending approval',
      ];

      if (Math.random() > 0.7) {
        const newAlert: RealtimeAlert = {
          id: crypto.randomUUID(),
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          timestamp: new Date().toISOString(),
        };
        this.alerts.update((list) => [newAlert, ...list].slice(0, 10));
        this.unreadAlerts.update((n) => n + 1);
      }
    }, 8000);

    // Initial alerts
    this.alerts.set([
      {
        id: '1',
        type: 'cash_risk',
        message: 'High cash collection risk detected',
        severity: 'high',
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: '2',
        type: 'failed_spike',
        message: 'Failed delivery spike in Zone 3',
        severity: 'critical',
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
    ]);
    this.unreadAlerts.set(2);
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
