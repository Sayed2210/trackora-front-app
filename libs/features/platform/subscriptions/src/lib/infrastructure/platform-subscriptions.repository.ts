import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiClient } from '@trackora/core/api';
import {
  CancelSubscriptionPayload,
  ChangePlanPayload,
  PlatformSubscription,
  RenewSubscriptionPayload,
  SubscriptionUpdatePayload,
  SubscriptionsPage,
  SubscriptionsQuery,
} from '../domain/models/subscription.models';
import { PlatformSubscriptionDto, PlatformSubscriptionsListDto } from './dtos/subscription.dtos';
import {
  mapCancelPayload,
  mapChangePlanPayload,
  mapPlatformSubscription,
  mapPlatformSubscriptionsPage,
  mapRenewPayload,
  mapSubscriptionUpdatePayload,
} from './mappers/subscription.mapper';

@Injectable({ providedIn: 'root' })
export class PlatformSubscriptionsRepository {
  private readonly api = inject(ApiClient);

  list(query: SubscriptionsQuery = {}): Observable<SubscriptionsPage> {
    return this.api
      .get<PlatformSubscriptionsListDto | PlatformSubscriptionDto[]>('/platform/subscriptions', toParams(query))
      .pipe(map(mapPlatformSubscriptionsPage));
  }

  get(id: string): Observable<PlatformSubscription> {
    return this.api.get<PlatformSubscriptionDto>(`/platform/subscriptions/${id}`).pipe(map(mapPlatformSubscription));
  }

  update(id: string, payload: SubscriptionUpdatePayload): Observable<PlatformSubscription> {
    return this.api
      .patch<PlatformSubscriptionDto>(`/platform/subscriptions/${id}`, mapSubscriptionUpdatePayload(payload))
      .pipe(map(mapPlatformSubscription));
  }

  changePlan(id: string, payload: ChangePlanPayload): Observable<PlatformSubscription> {
    return this.api
      .post<PlatformSubscriptionDto>(`/platform/subscriptions/${id}/change-plan`, mapChangePlanPayload(payload))
      .pipe(map(mapPlatformSubscription));
  }

  cancel(id: string, payload: CancelSubscriptionPayload): Observable<PlatformSubscription> {
    return this.api
      .post<PlatformSubscriptionDto>(`/platform/subscriptions/${id}/cancel`, mapCancelPayload(payload))
      .pipe(map(mapPlatformSubscription));
  }

  renew(id: string, payload: RenewSubscriptionPayload): Observable<PlatformSubscription> {
    return this.api
      .post<PlatformSubscriptionDto>(`/platform/subscriptions/${id}/renew`, mapRenewPayload(payload))
      .pipe(map(mapPlatformSubscription));
  }
}

const toParams = (query: SubscriptionsQuery): Record<string, string | number> => {
  const params: Record<string, string | number> = {};
  const assign = (key: string, value: string | number | undefined) => {
    if (typeof value === 'number' || value?.toString().trim()) {
      params[key] = typeof value === 'string' ? value.trim() : value;
    }
  };

  assign('search', query.search);
  assign('status', query.status && query.status !== 'all' ? query.status : undefined);
  assign('paymentStatus', query.paymentStatus && query.paymentStatus !== 'all' ? query.paymentStatus : undefined);
  assign('tenantId', query.tenantId);
  assign('planId', query.planId);
  assign('periodFrom', query.periodFrom);
  assign('periodTo', query.periodTo);
  assign('sort', query.sort);
  assign('page', query.page);
  assign('pageSize', query.pageSize);
  return params;
};
