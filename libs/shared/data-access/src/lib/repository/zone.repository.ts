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
    return this.api.get<{ data: ZoneResponseDto[]; total: number; page: number; limit: number }>('/zones', query)
      .pipe(map((res) => ({
        data: res.data.map(ZoneMapper.toDomain),
        meta: {
          page: res.page,
          limit: res.limit,
          total: res.total,
          totalItems: res.total,
          totalPages: Math.ceil(res.total / res.limit),
        },
      })));
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
