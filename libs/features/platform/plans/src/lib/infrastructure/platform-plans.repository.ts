import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import { PlanPayload, PlansPage, PlansQuery, PlatformPlan } from '../domain/models/platform-plan.models';
import { PlatformPlanDto, PlatformPlansListDto } from './dtos/platform-plans.dtos';
import { mapCreatePlanPayload, mapPlatformPlan, mapPlatformPlansPage, mapUpdatePlanPayload } from './mappers/platform-plans.mapper';

@Injectable({ providedIn: 'root' })
export class PlatformPlansRepository {
  private readonly api = inject(ApiClient);

  list(query: PlansQuery = {}): Observable<PlansPage> {
    return this.api
      .get<PlatformPlansListDto | PlatformPlanDto[]>('/platform/plans', toParams(query))
      .pipe(map(mapPlatformPlansPage));
  }

  get(id: string): Observable<PlatformPlan> {
    return this.api.get<PlatformPlanDto>(`/platform/plans/${id}`).pipe(map(mapPlatformPlan));
  }

  create(payload: PlanPayload): Observable<PlatformPlan> {
    return this.api
      .post<PlatformPlanDto>('/platform/plans', mapCreatePlanPayload(payload))
      .pipe(map(mapPlatformPlan));
  }

  update(id: string, payload: PlanPayload): Observable<PlatformPlan> {
    return this.api
      .patch<PlatformPlanDto>(`/platform/plans/${id}`, mapUpdatePlanPayload(payload))
      .pipe(map(mapPlatformPlan));
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/platform/plans/${id}`);
  }
}

const toParams = (query: PlansQuery): Record<string, string | number | boolean> => {
  const params: Record<string, string | number | boolean> = {};
  if (query.search?.trim()) {
    params['search'] = query.search.trim();
  }
  if (query.isActive !== undefined) {
    params['isActive'] = query.isActive;
  }
  if (query.archived !== undefined) {
    params['archived'] = query.archived;
  }
  if (query.sortBy) {
    params['sortBy'] = query.sortBy;
  }
  if (query.sortDirection) {
    params['sortDirection'] = query.sortDirection;
  }
  if (query.page) {
    params['page'] = query.page;
  }
  if (query.limit) {
    params['limit'] = query.limit;
  }
  return params;
};
