import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  format: 'csv' | 'pdf' | 'xlsx';
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <h1>Reports</h1>
        <p class="subtitle">Generate and export operational reports</p>
      </div>

      <div class="date-range">
        <label>From</label>
        <input type="date" [value]="fromDate()" (change)="fromDate.set(($any($event.target).value))" />
        <label>To</label>
        <input type="date" [value]="toDate()" (change)="toDate.set(($any($event.target).value))" />
      </div>

      <div class="reports-grid">
        <div class="report-card" *ngFor="let report of reports()">
          <div class="report-icon">{{ report.icon }}</div>
          <h3>{{ report.name }}</h3>
          <p>{{ report.description }}</p>
          <div class="report-actions">
            <button class="generate-btn" (click)="generateReport(report)">
              Generate {{ report.format.toUpperCase() }}
            </button>
          </div>
        </div>
      </div>

      <div class="recent-exports" *ngIf="recentExports().length > 0">
        <h3>Recent Exports</h3>
        <div class="export-item" *ngFor="let ex of recentExports()">
          <span class="export-name">{{ ex.name }}</span>
          <span class="export-format">{{ ex.format.toUpperCase() }}</span>
          <span class="export-date">{{ ex.generatedAt | date:'short' }}</span>
          <a class="download-link" [href]="ex.url" [download]="ex.fileName">Download</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page { padding: 1rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .subtitle { color: var(--trackora-text-secondary); margin: 0.25rem 0 0; }
    .date-range { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1rem; flex-wrap: wrap; }
    .date-range label { font-size: 0.875rem; color: var(--trackora-text-secondary); }
    .date-range input { padding: 0.5rem; border: 1px solid var(--trackora-border); border-radius: 8px; font-size: 0.875rem; }
    .reports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .report-card { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; }
    .report-icon { font-size: 2rem; margin-bottom: 0.75rem; }
    .report-card h3 { margin: 0 0 0.5rem; font-size: 1rem; }
    .report-card p { margin: 0 0 1rem; font-size: 0.875rem; color: var(--trackora-text-secondary); flex: 1; }
    .report-actions { margin-top: auto; }
    .generate-btn { width: 100%; padding: 0.625rem; background: var(--trackora-primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .generate-btn:hover { background: #002a52; }
    .recent-exports { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.25rem; }
    .recent-exports h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .export-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--trackora-border); font-size: 0.875rem; }
    .export-item:last-child { border-bottom: none; }
    .export-name { font-weight: 600; min-width: 180px; }
    .export-format { font-size: 0.75rem; padding: 0.125rem 0.375rem; background: var(--trackora-surface); border-radius: 4px; }
    .export-date { color: var(--trackora-text-secondary); margin-left: auto; }
    .download-link { color: var(--trackora-primary); font-weight: 600; text-decoration: none; }
    .download-link:hover { text-decoration: underline; }
  `],
})
export class ReportsPageComponent {
  readonly fromDate = signal(new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0]);
  readonly toDate = signal(new Date().toISOString().split('T')[0]);

  readonly reports = signal<ReportTemplate[]>([
    { id: 'shipments', name: 'Shipments Report', description: 'All shipments with status, COD, and delivery details for the selected period.', icon: '📦', format: 'csv' },
    { id: 'couriers', name: 'Courier Performance', description: 'Delivery success rates, average times, and COD collection per courier.', icon: '🚚', format: 'xlsx' },
    { id: 'merchants', name: 'Merchant Summary', description: 'Total shipments, revenue, and payout summary per merchant.', icon: '🏪', format: 'xlsx' },
    { id: 'financial', name: 'Financial Overview', description: 'Revenue, delivery fees, COD collected, and payouts overview.', icon: '💰', format: 'pdf' },
    { id: 'audit', name: 'Audit Trail Export', description: 'Complete audit log export for compliance and security review.', icon: '🔒', format: 'csv' },
    { id: 'zones', name: 'Zone Analysis', description: 'Delivery performance breakdown by geographic zone and governorate.', icon: '🗺️', format: 'xlsx' },
  ]);

  readonly recentExports = signal<Array<{ name: string; format: string; generatedAt: Date; url: string; fileName: string }>>([]);

  generateReport(report: ReportTemplate): void {
    // Simulate report generation and create a downloadable blob
    const csvContent = this.buildCsvContent(report.id);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const fileName = `${report.id}_${this.fromDate()}_${this.toDate()}.${report.format}`;

    this.recentExports.update((list) => [
      { name: report.name, format: report.format, generatedAt: new Date(), url, fileName },
      ...list,
    ].slice(0, 5));

    // Auto-download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }

  private buildCsvContent(reportId: string): string {
    const headers: Record<string, string> = {
      shipments: 'Tracking Number,Status,COD Amount,Delivery Fee,Customer,Date\n',
      couriers: 'Courier Name,Delivered,Failed,Success Rate,Avg Time,COD Collected\n',
      merchants: 'Merchant ID,Name,Shipments,Revenue,Pending Payout\n',
      financial: 'Category,Amount,Count,Date\n',
      audit: 'Timestamp,Actor,Action,Entity,Details\n',
      zones: 'Zone,Governorate,Shipments,Delivered,Failed,Avg Time\n',
    };
    const rows: Record<string, string> = {
      shipments: 'TRK-1001,DELIVERED,150,25,Ahmed,2026-05-01\nTRK-1002,FAILED,320,25,Sara,2026-05-02\nTRK-1003,DELIVERED,0,25,Omar,2026-05-03\n',
      couriers: 'Ahmed Hassan,45,5,90%,3.2h,8500\nMohamed Ali,38,8,83%,4.1h,7200\nKhaled Ibrahim,52,3,95%,2.8h,9800\n',
      merchants: 'M-001,ElectroStore,120,45000,12500\nM-002,FashionHub,95,32000,8700\nM-003,GroceryMart,80,28000,5400\n',
      financial: 'COD Collected,24500,185,2026-05\nDelivery Fees,4625,185,2026-05\nPayouts,31200,12,2026-05\n',
      audit: '2026-05-01T10:00:00Z,Admin,LOGIN,USER,Successful login\n2026-05-01T10:05:00Z,Admin,UPDATE,SHIPMENT,Status changed\n',
      zones: 'Nasr City,Cairo,65,58,7,3.1h\nMaadi,Cairo,42,38,4,3.5h\nHeliopolis,Cairo,38,35,3,2.9h\nDowntown,Cairo,28,25,3,4.2h\n',
    };
    return (headers[reportId] || '') + (rows[reportId] || '');
  }
}
