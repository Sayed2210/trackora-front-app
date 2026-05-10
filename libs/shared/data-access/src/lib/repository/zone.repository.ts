import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { Zone, PaginatedResult, PaginationMeta } from '@trackora/shared/domain';
import {
  ZoneResponseDto,
  CreateZoneDto,
  UpdateZoneDto,
  ZoneQueryDto,
} from '../dto/zone.dto';
import { ZoneMapper } from '../mapper/zone.mapper';

@Injectable({ providedIn: 'root' })
export class ZoneRepository {
  constructor(private readonly api: ApiClient) {}

  findAll(query?: ZoneQueryDto): Observable<PaginatedResult<Zone>> {
    return this.api.get<any>('/zones', query).pipe(
      map((res) => {
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
          data: rawData.map(ZoneMapper.toDomain),
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

  findById(id: string): Observable<Zone> {
    return this.api
      .get<ZoneResponseDto>(`/zones/${id}`)
      .pipe(map(ZoneMapper.toDomain));
  }

  findChildren(parentId: string): Observable<Zone[]> {
    return this.api
      .get<ZoneResponseDto[]>(`/zones/${parentId}/children`)
      .pipe(map((list) => list.map(ZoneMapper.toDomain)));
  }

  create(dto: CreateZoneDto): Observable<Zone> {
    return this.api
      .post<ZoneResponseDto>('/zones', dto)
      .pipe(map(ZoneMapper.toDomain));
  }

  update(id: string, dto: UpdateZoneDto): Observable<Zone> {
    return this.api
      .patch<ZoneResponseDto>(`/zones/${id}`, dto)
      .pipe(map(ZoneMapper.toDomain));
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/zones/${id}`);
  }
}
