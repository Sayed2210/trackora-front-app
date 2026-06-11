import { Component, inject, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CourierRepository, CourierTask } from '@trackora/shared/data-access';
import { courierDb, CachedTask } from '../services/offline-store.service';
import { OfflineSyncService } from '../services/offline-sync.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-courier-task-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="task-list">
      <div class="task-header">
        <h1>My Tasks</h1>
        <div class="connection-status" [class.offline]="!isOnline()" data-testid="offline-indicator">
          {{ isOnline() ? 'Online' : 'Offline' }}
        </div>
      </div>

      <div class="sync-bar" *ngIf="pendingCount() > 0 || lastSyncResult()">
        <div class="sync-info">
          <span *ngIf="pendingCount() > 0" data-testid="pending-sync-count">{{ pendingCount() }} pending updates</span>
          <span *ngIf="lastSyncResult() as result" class="sync-result">
            Last sync: {{ result.success }} success, {{ result.failed }} failed
          </span>
        </div>
        <div class="sync-actions">
          <button class="conflict-btn" *ngIf="conflictItems().length > 0" (click)="toggleConflicts()">
            {{ conflictItems().length }} conflicts
          </button>
          <button class="sync-btn" (click)="syncNow()" [disabled]="syncing()" data-testid="sync-now">
            {{ syncing() ? 'Syncing...' : 'Sync Now' }}
          </button>
        </div>
      </div>

      <div class="conflict-panel" *ngIf="showConflicts()">
        <h4>Sync Conflicts</h4>
        <div class="conflict-item" *ngFor="let item of conflictItems(); trackBy: trackByConflictId">
          <div class="conflict-header">
            <span class="conflict-type">{{ item.type }}</span>
            <span class="conflict-retry">Retry {{ item.retryCount }}/3</span>
          </div>
          <div class="conflict-error" *ngIf="item.lastError">{{ item.lastError }}</div>
          <div class="conflict-actions">
            <button class="retry-btn" (click)="retryItem(item.id)">Retry</button>
            <button class="discard-btn" (click)="discardItem(item.id)">Discard</button>
          </div>
        </div>
      </div>

      <div class="task-filters">
        <button
          *ngFor="let filter of filters; trackBy: trackByFilterValue"
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
          *ngFor="let task of filteredTasks(); trackBy: trackByTaskId"
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
        <div class="empty-state" *ngIf="!filteredTasks().length" data-testid="empty-state">
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
    .sync-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .sync-result { font-size: 0.75rem; color: var(--trackora-text-secondary); }
    .sync-actions { display: flex; gap: 0.5rem; align-items: center; }
    .sync-btn { padding: 0.375rem 0.75rem; background: var(--trackora-primary); color: white; border: none; border-radius: 4px; font-size: 0.875rem; cursor: pointer; }
    .sync-btn:disabled { opacity: 0.6; }
    .conflict-btn { padding: 0.375rem 0.75rem; background: #EF4444; color: white; border: none; border-radius: 4px; font-size: 0.875rem; cursor: pointer; }
    .conflict-panel { background: #FFF; border: 1px solid #FCA5A5; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
    .conflict-panel h4 { margin: 0 0 0.75rem; font-size: 0.875rem; color: #991B1B; }
    .conflict-item { border: 1px solid var(--trackora-border); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; }
    .conflict-header { display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 600; }
    .conflict-retry { font-size: 0.75rem; color: var(--trackora-text-secondary); }
    .conflict-error { font-size: 0.75rem; color: #EF4444; margin: 0.25rem 0; }
    .conflict-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .retry-btn { padding: 0.25rem 0.5rem; background: var(--trackora-primary); color: white; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
    .discard-btn { padding: 0.25rem 0.5rem; background: white; color: var(--trackora-text-secondary); border: 1px solid var(--trackora-border); border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
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
export class CourierTaskListPageComponent implements OnInit, OnDestroy {
  private readonly syncService = inject(OfflineSyncService);
  private readonly courierRepo = inject(CourierRepository);

  readonly tasks = signal<CachedTask[]>([]);
  readonly activeFilter = signal<string>('ALL');
  readonly isOnline = signal(navigator.onLine);
  readonly pendingCount = signal(0);
  readonly syncing = signal(false);
  readonly lastSyncResult = signal<{ success: number; failed: number } | null>(null);
  readonly showConflicts = signal(false);
  readonly conflictItems = signal<Array<{ id: string; taskId: string; type: string; lastError?: string; retryCount: number }>>([]);

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

  private onlineHandler = () => this.isOnline.set(true);
  private offlineHandler = () => this.isOnline.set(false);

  ngOnInit(): void {
    this.loadTasks();
    this.loadPendingCount();
    this.loadConflicts();

    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }

  trackByTaskId(_index: number, task: CachedTask): string {
    return task.id;
  }

  trackByConflictId(_index: number, item: { id: string }): string {
    return item.id;
  }

  trackByFilterValue(_index: number, filter: { value: string }): string {
    return filter.value;
  }

  private async loadTasks(): Promise<void> {
    try {
      const apiTasks = await firstValueFrom(this.courierRepo.getTasks());
      const cachedTasks = apiTasks.map((task) => this.toCachedTask(task));
      await courierDb.cachedTasks.bulkPut(cachedTasks);
      this.tasks.set(cachedTasks);
    } catch {
      this.tasks.set(await courierDb.cachedTasks.toArray());
    }
    this.updateFilterCounts();
  }

  private toCachedTask(task: CourierTask): CachedTask {
    const addressParts = [task.addressText ?? task.address, task.city, task.governorate].filter(Boolean);
    return {
      id: task.shipmentId ?? task.id ?? task.trackingNumber,
      trackingNumber: task.trackingNumber,
      customerName: task.customerName,
      customerPhone: task.customerPhone ?? task.customerPhoneMasked ?? '',
      address: task.addressText ?? task.address ?? addressParts.join(', '),
      governorate: task.governorate ?? '',
      city: task.city ?? '',
      status: task.status,
      codAmount: task.codAmount,
      deliveryFee: task.deliveryFee ?? 0,
      notes: task.notes,
      lat: task.lat,
      lng: task.lng,
      assignedAt: task.assignedAt ?? new Date().toISOString(),
      syncedAt: new Date().toISOString(),
    };
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
    const result = await this.syncService.syncPendingUpdates();
    this.lastSyncResult.set(result);
    await this.loadPendingCount();
    await this.loadConflicts();
    this.syncing.set(false);
  }

  toggleConflicts(): void {
    this.showConflicts.update((v) => !v);
  }

  private async loadConflicts(): Promise<void> {
    const pending = await courierDb.pendingUpdates.toArray();
    const conflicts = pending
      .filter((p) => (p.retryCount || 0) > 0)
      .map((p) => ({
        id: p.id,
        taskId: p.taskId,
        type: p.type,
        lastError: p.lastError,
        retryCount: p.retryCount || 0,
      }));
    this.conflictItems.set(conflicts);
  }

  async retryItem(id: string): Promise<void> {
    await courierDb.pendingUpdates.update(id, { retryCount: 0, lastError: undefined });
    await this.loadConflicts();
    await this.loadPendingCount();
  }

  async discardItem(id: string): Promise<void> {
    await courierDb.pendingUpdates.delete(id);
    await this.loadConflicts();
    await this.loadPendingCount();
  }
}
