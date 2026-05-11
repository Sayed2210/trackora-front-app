import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CourierRepository } from '@trackora/shared/data-access';
import { courierDb, PendingUpdate } from './offline-store.service';

@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  private readonly courierRepo = inject(CourierRepository);
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
    if (update.retryCount >= 3) {
      throw new Error('Max retries exceeded');
    }

    switch (update.type) {
      case 'STATUS_UPDATE':
        await firstValueFrom(
          this.courierRepo.updateTaskStatus(update.taskId, update.payload)
        );
        break;
      case 'PHOTO_UPLOAD':
        // In production, upload photo to storage first, then send URL
        await firstValueFrom(
          this.courierRepo.updateTaskStatus(update.taskId, {
            status: update.payload.status,
            photoUrl: update.payload.photoUrl,
            notes: update.payload.notes,
          })
        );
        break;
      case 'CASH_DEPOSIT':
        await firstValueFrom(
          this.courierRepo.logDeposit({
            amount: update.payload.amount,
            depositedTo: update.payload.depositedTo,
            notes: update.payload.notes,
          })
        );
        break;
      case 'SIGNATURE_UPLOAD':
        // In production, upload signature to storage first, then send URL
        await firstValueFrom(
          this.courierRepo.updateTaskStatus(update.taskId, {
            status: update.payload.status,
            signatureUrl: update.payload.signatureUrl,
            notes: update.payload.notes,
          })
        );
        break;
      default:
        throw new Error(`Unknown update type: ${update.type}`);
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
