import { Injectable } from '@angular/core';
import { courierDb, PendingUpdate } from './offline-store.service';

@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  private syncInProgress = false;

  async queueUpdate(taskId: string, type: PendingUpdate['type'], payload: any): Promise<void> {
    await courierDb.pendingUpdates.add({
      id: crypto.randomUUID(),
      taskId,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });
  }

  async syncPendingUpdates(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) return { success: 0, failed: 0 };
    this.syncInProgress = true;

    let success = 0;
    let failed = 0;

    try {
      const pending = await courierDb.pendingUpdates.toArray();

      for (const update of pending) {
        try {
          await this.sendUpdate(update);
          await courierDb.pendingUpdates.delete(update.id);
          success++;
        } catch (err: any) {
          await courierDb.pendingUpdates.update(update.id, {
            retryCount: update.retryCount + 1,
            lastError: err.message || 'Sync failed',
          });
          failed++;
        }
      }
    } finally {
      this.syncInProgress = false;
    }

    return { success, failed };
  }

  private async sendUpdate(update: PendingUpdate): Promise<void> {
    // In production, this calls the real API
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (update.retryCount >= 3) {
      throw new Error('Max retries exceeded');
    }
  }

  async getPendingCount(): Promise<number> {
    return await courierDb.pendingUpdates.count();
  }

  async clearSyncedData(): Promise<void> {
    await courierDb.offlinePhotos.where('synced').equals(1).delete();
    await courierDb.cashLog.where('synced').equals(1).delete();
  }
}
