import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@trackora/core/api';

export interface CourierTask {
  id?: string;
  shipmentId?: string;
  trackingNumber: string;
  customerName: string;
  customerPhone?: string;
  customerPhoneMasked?: string;
  address?: string;
  addressText?: string;
  governorate?: string;
  city?: string;
  lat?: number;
  lng?: number;
  status: string;
  codAmount?: number;
  deliveryFee?: number;
  notes?: string;
  assignedAt?: string;
  orderInRoute?: number;
  mapUrl?: string;
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

export interface CourierAdmin {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  status?: string;
  zoneCodes?: string[];
  currentTasks?: number;
  activeTasks?: number;
  maxDailyCapacity?: number;
  capacity?: number;
  rating?: number;
  createdAt?: string;
}

export interface CourierQuery {
  search?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  zoneCode?: string;
  page?: number;
  limit?: number;
}

export interface CourierPerformance {
  score?: number;
  totalDelivered?: number;
  totalFailed?: number;
  successRate?: number;
  avgDeliveryTimeMinutes?: number;
  cashHeld?: number;
  rank?: number;
  weeklyTrend?: number[];
  dailyMetrics?: Array<{
    date: string;
    delivered: number;
    failed: number;
    totalCod?: number;
    avgDeliveryTime?: number;
    avgDeliveryTimeMinutes?: number;
  }>;
  statusDistribution?: Array<{ status: string; count: number; percentage?: number }>;
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
    return this.api.get<CourierPerformance>('/courier/performance');
  }

  syncUpdates(dto: SyncUpdatesDto): Observable<any> {
    return this.api.post('/courier/sync', dto);
  }

  findAll(query?: CourierQuery): Observable<any> {
    return this.api.get('/couriers', query);
  }

  updateAvailability(id: string, isAvailable: boolean): Observable<CourierAdmin> {
    return this.api.patch<CourierAdmin>(`/couriers/${id}/availability`, { isAvailable });
  }
}
