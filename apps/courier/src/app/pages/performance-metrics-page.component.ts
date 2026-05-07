import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { courierDb, CachedTask } from '../services/offline-store.service';

interface DailyMetric {
  date: string;
  delivered: number;
  failed: number;
  totalCod: number;
  avgDeliveryTime: number;
}

@Component({
  selector: 'app-performance-metrics-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="performance-page">
      <div class="page-header">
        <h1>Performance</h1>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ totalDelivered() }}</span>
          <span class="stat-label">Delivered</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ totalFailed() }}</span>
          <span class="stat-label">Failed</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ successRate() }}%</span>
          <span class="stat-label">Success Rate</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ totalCodCollected() | number:'1.0-0' }}</span>
          <span class="stat-label">COD Collected</span>
        </div>
      </div>

      <div class="metric-section">
        <h3>Daily Breakdown</h3>
        <div class="metric-table-wrapper">
          <table class="metric-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Delivered</th>
                <th>Failed</th>
                <th>COD</th>
                <th>Avg Time</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of dailyMetrics()">
                <td>{{ m.date }}</td>
                <td class="delivered">{{ m.delivered }}</td>
                <td class="failed">{{ m.failed }}</td>
                <td>{{ m.totalCod | number:'1.0-0' }} EGP</td>
                <td>{{ m.avgDeliveryTime }}h</td>
              </tr>
              <tr *ngIf="!dailyMetrics().length">
                <td colspan="5" class="empty-cell">No data yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="metric-section">
        <h3>Task Status Distribution</h3>
        <div class="status-bars">
          <div class="status-bar-item" *ngFor="let s of statusDistribution()">
            <div class="bar-label">
              <span>{{ s.status }}</span>
              <span>{{ s.count }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="s.percentage" [class]="s.status"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .performance-page { padding: 0.75rem; padding-bottom: 2rem; }
    .page-header { margin-bottom: 1rem; }
    .page-header h1 { font-size: 1.25rem; margin: 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
    .stat-card { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; align-items: center; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--trackora-primary); }
    .stat-label { font-size: 0.75rem; color: var(--trackora-text-secondary); margin-top: 0.25rem; }
    .metric-section { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
    .metric-section h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .metric-table-wrapper { overflow-x: auto; }
    .metric-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .metric-table th { text-align: left; padding: 0.5rem; border-bottom: 2px solid var(--trackora-border); color: var(--trackora-text-secondary); font-weight: 600; }
    .metric-table td { padding: 0.5rem; border-bottom: 1px solid var(--trackora-border); }
    .metric-table .delivered { color: #10B981; font-weight: 600; }
    .metric-table .failed { color: #EF4444; font-weight: 600; }
    .empty-cell { text-align: center; color: var(--trackora-text-secondary); padding: 1.5rem; }
    .status-bars { display: flex; flex-direction: column; gap: 0.75rem; }
    .status-bar-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .bar-label { display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 500; }
    .bar-track { height: 8px; background: var(--trackora-surface); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
    .bar-fill.PENDING { background: #F59E0B; }
    .bar-fill.OUT_FOR_DELIVERY { background: #3B82F6; }
    .bar-fill.DELIVERED { background: #10B981; }
    .bar-fill.FAILED { background: #EF4444; }
    .bar-fill.RETURNED { background: #9CA3AF; }
  `],
})
export class PerformanceMetricsPageComponent implements OnInit {
  readonly tasks = signal<CachedTask[]>([]);
  readonly totalDelivered = signal(0);
  readonly totalFailed = signal(0);
  readonly successRate = signal(0);
  readonly totalCodCollected = signal(0);
  readonly dailyMetrics = signal<DailyMetric[]>([]);
  readonly statusDistribution = signal<{ status: string; count: number; percentage: number }[]>([]);

  ngOnInit(): void {
    this.loadMetrics();
  }

  private async loadMetrics(): Promise<void> {
    const allTasks = await courierDb.cachedTasks.toArray();
    this.tasks.set(allTasks);

    const delivered = allTasks.filter((t) => t.status === 'DELIVERED');
    const failed = allTasks.filter((t) => t.status === 'FAILED');
    const withCod = allTasks.filter((t) => t.codAmount && t.status === 'DELIVERED');

    this.totalDelivered.set(delivered.length);
    this.totalFailed.set(failed.length);
    const total = delivered.length + failed.length;
    this.successRate.set(total > 0 ? Math.round((delivered.length / total) * 100) : 0);
    this.totalCodCollected.set(withCod.reduce((sum, t) => sum + (t.codAmount || 0), 0));

    // Daily breakdown
    const byDate = new Map<string, { delivered: number; failed: number; cod: number; times: number[] }>();
    for (const task of allTasks) {
      if (task.status !== 'DELIVERED' && task.status !== 'FAILED') continue;
      const date = task.assignedAt.split('T')[0];
      const entry = byDate.get(date) || { delivered: 0, failed: 0, cod: 0, times: [] };
      if (task.status === 'DELIVERED') {
        entry.delivered++;
        entry.cod += task.codAmount || 0;
        // Mock delivery time: 2-6 hours
        entry.times.push(2 + Math.random() * 4);
      } else {
        entry.failed++;
      }
      byDate.set(date, entry);
    }

    const metrics: DailyMetric[] = Array.from(byDate.entries())
      .map(([date, data]) => ({
        date,
        delivered: data.delivered,
        failed: data.failed,
        totalCod: data.cod,
        avgDeliveryTime: data.times.length ? Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length) : 0,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    this.dailyMetrics.set(metrics);

    // Status distribution
    const counts = new Map<string, number>();
    for (const task of allTasks) {
      counts.set(task.status, (counts.get(task.status) || 0) + 1);
    }
    const totalTasks = allTasks.length || 1;
    this.statusDistribution.set(
      Array.from(counts.entries()).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / totalTasks) * 100),
      }))
    );
  }
}
