import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@trackora/core/api';

export interface CourierTask {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: string;
  codAmount?: number;
  deliveryFee: number;
  notes?: string;
}

export interface UpdateTaskStatusDto {
  status: string;
  otp?: string;
  collectedCash?: number;
  notes?: string;
  photoUrl?: string;
  signatureUrl?: string;
  gpsLocation?: object;
  returnReason?: string;
}

export interface CourierDepositDto {
  amount: number;
  depositedTo: string;
  notes?: string;
}

export interface SyncUpdatesDto {
  updates: Array<{
    id: string;
    shipmentId: string;
    action: string;
    payload: object;
    timestamp: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class CourierRepository {
  constructor(private readonly api: ApiClient) {}

  getTasks(): Observable<CourierTask[]> {
    return this.api.get<CourierTask[]>('/courier/tasks');
  }

  getTaskById(shipmentId: string): Observable<CourierTask> {
    return this.api.get<CourierTask>(`/courier/tasks/${shipmentId}`);
  }

  updateTaskStatus(shipmentId: string, dto: UpdateTaskStatusDto): Observable<any> {
    return this.api.patch(`/courier/tasks/${shipmentId}/status`, dto);
  }

  logDeposit(dto: CourierDepositDto): Observable<any> {
    return this.api.post('/courier/deposits', dto);
  }

  getPerformance(): Observable<any> {
    return this.api.get('/courier/performance');
  }

  syncUpdates(dto: SyncUpdatesDto): Observable<any> {
    return this.api.post('/courier/sync', dto);
  }
}
