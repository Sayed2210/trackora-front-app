import Dexie, { Table } from 'dexie';

export interface CachedTask {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  governorate: string;
  city: string;
  status: string;
  codAmount?: number;
  deliveryFee: number;
  notes?: string;
  lat?: number;
  lng?: number;
  assignedAt: string;
  syncedAt?: string;
}

export interface PendingUpdate {
  id: string;
  taskId: string;
  type: 'STATUS_UPDATE' | 'COD_COLLECTED' | 'PHOTO_UPLOAD' | 'SIGNATURE_UPLOAD';
  payload: any;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export interface CashLogEntry {
  id: string;
  taskId: string;
  amount: number;
  type: 'COLLECTED' | 'DEPOSITED';
  timestamp: string;
  synced: boolean;
}

export interface OfflinePhoto {
  id: string;
  taskId: string;
  blob: Blob;
  thumbnail: string;
  type: 'DELIVERY' | 'RETURN' | 'DAMAGE';
  createdAt: string;
  synced: boolean;
}

export class CourierDatabase extends Dexie {
  cachedTasks!: Table<CachedTask>;
  pendingUpdates!: Table<PendingUpdate>;
  cashLog!: Table<CashLogEntry>;
  offlinePhotos!: Table<OfflinePhoto>;

  constructor() {
    super('TrackoraCourierDB');
    this.version(1).stores({
      cachedTasks: 'id, status, assignedAt',
      pendingUpdates: '++id, taskId, type, createdAt',
      cashLog: 'id, taskId, timestamp, synced',
      offlinePhotos: 'id, taskId, type, createdAt, synced',
    });
  }
}

export const courierDb = new CourierDatabase();
