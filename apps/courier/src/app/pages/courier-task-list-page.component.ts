import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { courierDb, CachedTask } from '../../services/offline-store.service';
import { OfflineSyncService } from '../../services/offline-sync.service';

@Component({
  selector: 'app-courier-task-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="task-list">
      <div class="task-header">
        <h1>My Tasks</h1>
        <div class="connection-status" [class.offline]="!isOnline()">
          {{ isOnline() ? 'Online' : 'Offline' }}
        </div>
      </div>

      <div class="sync-bar" *ngIf="pendingCount() > 0">
        <span>{{ pendingCount() }} pending updates</span>
        <button class="sync-btn" (click)="syncNow()" [disabled]="syncing()">
          {{ syncing() ? 'Syncing...' : 'Sync Now' }}
        </button>
      </div>

      <div class="task-filters">
        <button
          *ngFor="let filter of filters"
          [class.active]="activeFilter() === filter.value"
          (click)="setFilter(filter.value)"
        >
          {{ filter.label }}
          <span class="count" *ngIf="filter.count">{{ filter.count }}</span>
        </button>
      </div>

      <div class="task-cards">
        <a
          class="task-card"
          *ngFor="let task of filteredTasks()"
          [routerLink]="['/tasks', task.id]"
        >
          <div class="task-card-header">
            <span class="tracking-number">{{ task.trackingNumber }}</span>
            <span class="status-badge" [class]="task.status">{{ task.status }}</span>
          </div>
          <div class="task-card-body">
            <div class="customer-info">
              <strong>{{ task.customerName }}</strong>
              <span>{{ task.customerPhone }}</span>
            </div>
            <div class="address">
              {{ task.address }}
            </div>
            <div class="task-meta">
              <span class="cod" *ngIf="task.codAmount">💰 {{ task.codAmount }} EGP</span>
              <span class="fee">🚚 {{ task.deliveryFee }} EGP</span>
            </div>
          </div>
        </a>
        <div class="empty-state" *ngIf="!filteredTasks().length">
          <p>No tasks found</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-list { padding: 0.75rem; }
    .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .task-header h1 { font-size: 1.25rem; margin: 0; }
    .connection-status { font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 12px; background: #D1FAE5; color: #065F46; font-weight: 600; }
    .connection-status.offline { background: #FEE2E2; color: #991B1B; }
    .sync-bar { display: flex; justify-content: space-between; align-items: center; background: #FEF3C7; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; }
    .sync-btn { padding: 0.375rem 0.75rem; background: var(--trackora-primary); color: white; border: none; border-radius: 4px; font-size: 0.875rem; cursor: pointer; }
    .sync-btn:disabled { opacity: 0.6; }
    .task-filters { display: flex; gap: 0.5rem; margin-bottom: 1rem; overflow-x: auto; }
    .task-filters button { padding: 0.5rem 1rem; border: 1px solid var(--trackora-border); background: white; border-radius: 20px; font-size: 0.875rem; cursor: pointer; white-space: nowrap; }
    .task-filters button.active { background: var(--trackora-primary); color: white; border-color: var(--trackora-primary); }
    .task-filters button .count { margin-left: 0.25rem; font-size: 0.75rem; opacity: 0.8; }
    .task-cards { display: flex; flex-direction: column; gap: 0.75rem; }
    .task-card { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1rem; text-decoration: none; color: inherit; display: block; }
    .task-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .tracking-number { font-weight: 700; color: var(--trackora-primary); }
    .status-badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
    .PENDING { background: #FEF3C7; color: #92400E; }
    .OUT_FOR_DELIVERY { background: #E0E7FF; color: #3730A3; }
    .DELIVERED { background: #D1FAE5; color: #065F46; }
    .FAILED { background: #FEE2E2; color: #991B1B; }
    .RETURNED { background: #F3F4F6; color: #4B5563; }
    .customer-info { display: flex; flex-direction: column; margin-bottom: 0.5rem; }
    .address { font-size: 0.875rem; color: var(--trackora-text-secondary); margin-bottom: 0.5rem; }
    .task-meta { display: flex; gap: 1rem; font-size: 0.875rem; }
    .cod { color: var(--trackora-success); font-weight: 600; }
    .fee { color: var(--trackora-text-secondary); }
    .empty-state { text-align: center; padding: 2rem; color: var(--trackora-text-secondary); }
  `],
})
export class CourierTaskListPageComponent implements OnInit {
  private readonly syncService = inject(OfflineSyncService);

  readonly tasks = signal<CachedTask[]>([]);
  readonly activeFilter = signal<string>('ALL');
  readonly isOnline = signal(navigator.onLine);
  readonly pendingCount = signal(0);
  readonly syncing = signal(false);

  filters = [
    { label: 'All', value: 'ALL', count: 0 },
    { label: 'Pending', value: 'PENDING', count: 0 },
    { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY', count: 0 },
    { label: 'Delivered', value: 'DELIVERED', count: 0 },
    { label: 'Failed', value: 'FAILED', count: 0 },
  ];

  readonly filteredTasks = () => {
    const filter = this.activeFilter();
    if (filter === 'ALL') return this.tasks();
    return this.tasks().filter((t) => t.status === filter);
  };

  ngOnInit(): void {
    this.loadTasks();
    this.loadPendingCount();

    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

  private async loadTasks(): Promise<void> {
    // In production, fetch from API and cache in Dexie
    // For now, use mock data
    const mockTasks: CachedTask[] = [
      {
        id: 'task-001',
        trackingNumber: 'TRK-1001',
        customerName: 'Ahmed Mohamed',
        customerPhone: '01001234567',
        address: '123 Main St, Building A',
        governorate: 'Cairo',
        city: 'Nasr City',
        status: 'OUT_FOR_DELIVERY',
        codAmount: 150,
        deliveryFee: 25,
        assignedAt: new Date().toISOString(),
      },
      {
        id: 'task-002',
        trackingNumber: 'TRK-1002',
        customerName: 'Sara Ali',
        customerPhone: '01009876543',
        address: '45 El-Horreya St',
        governorate: 'Alexandria',
        city: 'Miami',
        status: 'PENDING',
        codAmount: 320,
        deliveryFee: 25,
        assignedAt: new Date().toISOString(),
      },
      {
        id: 'task-003',
        trackingNumber: 'TRK-1003',
        customerName: 'Omar Hassan',
        customerPhone: '01005551234',
        address: '78 Tahrir Square',
        governorate: 'Cairo',
        city: 'Downtown',
        status: 'DELIVERED',
        deliveryFee: 25,
        assignedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    await courierDb.cachedTasks.bulkPut(mockTasks);
    this.tasks.set(await courierDb.cachedTasks.toArray());
    this.updateFilterCounts();
  }

  private async loadPendingCount(): Promise<void> {
    this.pendingCount.set(await this.syncService.getPendingCount());
  }

  private updateFilterCounts(): void {
    const all = this.tasks();
    this.filters = [
      { label: 'All', value: 'ALL', count: all.length },
      { label: 'Pending', value: 'PENDING', count: all.filter((t) => t.status === 'PENDING').length },
      { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY', count: all.filter((t) => t.status === 'OUT_FOR_DELIVERY').length },
      { label: 'Delivered', value: 'DELIVERED', count: all.filter((t) => t.status === 'DELIVERED').length },
      { label: 'Failed', value: 'FAILED', count: all.filter((t) => t.status === 'FAILED').length },
    ];
  }

  setFilter(filter: string): void {
    this.activeFilter.set(filter);
  }

  async syncNow(): Promise<void> {
    this.syncing.set(true);
    await this.syncService.syncPendingUpdates();
    await this.loadPendingCount();
    this.syncing.set(false);
  }
}
