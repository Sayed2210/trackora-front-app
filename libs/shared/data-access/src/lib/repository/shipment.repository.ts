import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { Shipment, PaginatedResult, PaginationMeta } from '@trackora/shared/domain';
import { ShipmentResponseDto, ShipmentQueryDto, CreateShipmentDto, UpdateShipmentStatusDto } from '../dto/shipment.dto';
import { BulkUploadResultDto } from '../dto/bulk-upload.dto';
import { ShipmentMapper } from '../mapper/shipment.mapper';

@Injectable({ providedIn: 'root' })
export class ShipmentRepository {
  constructor(private readonly api: ApiClient) {}

  findAll(query: ShipmentQueryDto): Observable<PaginatedResult<Shipment>> {
    return this.api.get<any>('/shipments', this.toParams(query)).pipe(
      map((res) => {
        // Handle wrapped response: { success: true, data: [...], total: 12, ... }
        // Handle raw response: { data: [...], total: 12, ... }
        // Handle array response: [...]
        let rawData: any[];
        let page = 1;
        let limit = 10;
        let total = 0;

        if (Array.isArray(res)) {
          rawData = res;
          total = res.length;
        } else if (res && typeof res === 'object') {
          const payload = res.success === true && Array.isArray(res.data) ? res : res;
          if (Array.isArray(payload.data)) {
            rawData = payload.data;
            total = payload.total ?? payload.meta?.total ?? rawData.length;
            page = payload.page ?? payload.meta?.page ?? 1;
            limit = payload.limit ?? payload.meta?.limit ?? rawData.length;
          } else if (Array.isArray(payload)) {
            rawData = payload;
            total = payload.length;
          } else {
            rawData = [];
          }
        } else {
          rawData = [];
        }

        return {
          data: rawData.map(ShipmentMapper.toDomain),
          meta: {
            page,
            limit,
            total,
            totalItems: total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
          },
        };
      })
    );
  }

  findById(id: string): Observable<Shipment> {
    return this.api.get<ShipmentResponseDto>(`/shipments/${id}`)
      .pipe(map(ShipmentMapper.toDomain));
  }

  findByTrackingNumber(trackingNumber: string): Observable<Shipment> {
    return this.api.get<ShipmentResponseDto>(`/shipments/tracking/${trackingNumber}`)
      .pipe(map(ShipmentMapper.toDomain));
  }

  getTimeline(id: string): Observable<any> {
    return this.api.get<any>(`/shipments/${id}/timeline`);
  }

  create(dto: CreateShipmentDto): Observable<Shipment> {
    return this.api.post<ShipmentResponseDto>('/shipments', dto)
      .pipe(map(ShipmentMapper.toDomain));
  }

  updateStatus(id: string, dto: UpdateShipmentStatusDto): Observable<Shipment> {
    return this.api.patch<ShipmentResponseDto>(`/shipments/${id}/status`, dto)
      .pipe(map(ShipmentMapper.toDomain));
  }

  bulkUpload(file: File): Observable<BulkUploadResultDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<BulkUploadResultDto>('/shipments/bulk-upload', formData);
  }

  private toParams(query: ShipmentQueryDto): any {
    const params: Record<string, string> = {};
    if (query.page !== undefined) params['page'] = String(query.page);
    if (query.limit !== undefined) params['limit'] = String(query.limit);
    if (query.status) params['status'] = query.status;
    if (query.type) params['type'] = query.type;
    if (query.search) params['search'] = query.search;
    if (query.trackingNumber) params['trackingNumber'] = query.trackingNumber;
    if (query.merchantId) params['merchantId'] = query.merchantId;
    if (query.courierId) params['courierId'] = query.courierId;
    if (query.zoneId) params['zoneId'] = query.zoneId;
    if (query.from) params['from'] = query.from;
    if (query.to) params['to'] = query.to;
    return params;
  }
}
