import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { Shipment, PaginatedResult, PaginationMeta } from '@trackora/shared/domain';
import { ShipmentResponseDto, ShipmentQueryDto, CreateShipmentDto, UpdateShipmentStatusDto } from '../dto/shipment.dto';
import { ShipmentMapper } from '../mapper/shipment.mapper';

@Injectable({ providedIn: 'root' })
export class ShipmentRepository {
  constructor(private readonly api: ApiClient) {}

  findAll(query: ShipmentQueryDto): Observable<PaginatedResult<Shipment>> {
    return this.api.get<{ data: ShipmentResponseDto[]; meta: PaginationMeta }>('/shipments', this.toParams(query))
      .pipe(map((res) => ({
        data: res.data.map(ShipmentMapper.toDomain),
        meta: res.meta,
      })));
  }

  findById(id: string): Observable<Shipment> {
    return this.api.get<ShipmentResponseDto>(`/shipments/${id}`)
      .pipe(map(ShipmentMapper.toDomain));
  }

  create(dto: CreateShipmentDto): Observable<Shipment> {
    return this.api.post<ShipmentResponseDto>('/shipments', dto)
      .pipe(map(ShipmentMapper.toDomain));
  }

  updateStatus(id: string, dto: UpdateShipmentStatusDto): Observable<Shipment> {
    return this.api.patch<ShipmentResponseDto>(`/shipments/${id}/status`, dto)
      .pipe(map(ShipmentMapper.toDomain));
  }

  private toParams(query: ShipmentQueryDto): any {
    const params: Record<string, string> = {};
    if (query.page !== undefined) params['page'] = String(query.page);
    if (query.limit !== undefined) params['limit'] = String(query.limit);
    if (query.status) params['status'] = query.status;
    if (query.type) params['type'] = query.type;
    if (query.search) params['search'] = query.search;
    if (query.fromDate) params['fromDate'] = query.fromDate;
    if (query.toDate) params['toDate'] = query.toDate;
    return params;
  }
}
