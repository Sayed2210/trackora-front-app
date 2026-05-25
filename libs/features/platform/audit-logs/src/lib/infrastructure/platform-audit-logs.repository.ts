import { inject, Injectable } from '@angular/core';
import { ApiClient } from '@trackora/core/api';
import { map, Observable } from 'rxjs';
import {
  AuditLogsPage,
  AuditLogsQuery,
} from '../domain/models/audit-log.models';
import { AuditLogDto, AuditLogsListDto } from './dtos/audit-log.dtos';
import { mapAuditLogsPage } from './mappers/audit-log.mapper';

@Injectable({ providedIn: 'root' })
export class PlatformAuditLogsRepository {
  private readonly api = inject(ApiClient);

  list(query: AuditLogsQuery = {}): Observable<AuditLogsPage> {
    return this.api
      .get<
        AuditLogsListDto<AuditLogDto> | AuditLogDto[]
      >('/platform/audit-logs', toParams(query))
      .pipe(map(mapAuditLogsPage));
  }
}

const toParams = (query: AuditLogsQuery): Record<string, string | number> => {
  const params: Record<string, string | number> = {};
  const assign = (key: string, value: string | number | undefined) => {
    if (typeof value === 'number' || value?.toString().trim()) {
      params[key] = typeof value === 'string' ? value.trim() : value;
    }
  };

  assign('actor', query.actor);
  assign('tenant', query.tenant);
  assign('action', query.action);
  assign('resourceType', query.resourceType);
  assign('resourceId', query.resourceId);
  assign('dateFrom', query.dateFrom);
  assign('dateTo', query.dateTo);
  assign('sortBy', query.sortBy);
  assign('sortDirection', query.sortDirection);
  assign('page', query.page);
  assign('pageSize', query.pageSize);
  return params;
};
