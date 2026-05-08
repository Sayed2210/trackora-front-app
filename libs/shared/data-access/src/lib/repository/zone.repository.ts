import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { Zone } from '@trackora/shared/domain';
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

  findAll(query?: ZoneQueryDto): Observable<Zone[]> {
    return this.api.get<ZoneResponseDto[]>('/zones', query).pipe(
      map((list) => list.map(ZoneMapper.toDomain)),
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
