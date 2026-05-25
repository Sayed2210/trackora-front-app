import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiClientError } from '@trackora/core/api';
import { firstValueFrom } from 'rxjs';
import {
  ChangePlanPayload,
  PlatformSubscription,
  RenewSubscriptionPayload,
  SubscriptionUpdatePayload,
  SubscriptionsPage,
  SubscriptionsQuery,
  SubscriptionsState,
} from '../domain/models/subscription.models';
import { PlatformSubscriptionsRepository } from '../infrastructure/platform-subscriptions.repository';

const LOAD_ERROR = 'تعذر تحميل الاشتراكات. حاول مرة أخرى.';
const SAVE_ERROR = 'تعذر حفظ التعديل. راجع البيانات وحاول مرة أخرى.';
const REASON_ERROR = 'اكتب سبباً واضحاً قبل تنفيذ هذا الإجراء.';
const CONFLICT_ERROR = 'تعذر تنفيذ الإجراء بسبب تعارض في حالة الاشتراك الحالية.';
const NOT_FOUND_ERROR = 'الاشتراك أو الخطة المطلوبة غير متاحة.';
const VALIDATION_ERROR = 'رفض الخادم البيانات المرسلة. راجع الحقول المطلوبة.';

@Injectable()
export class SubscriptionsFacade {
  private readonly repository = inject(PlatformSubscriptionsRepository);

  private readonly _list = signal<SubscriptionsState<SubscriptionsPage>>(createState());
  private readonly _detail = signal<SubscriptionsState<PlatformSubscription>>(createState());
  private readonly _query = signal<SubscriptionsQuery>({ page: 1, pageSize: 20, status: 'all', paymentStatus: 'all', sort: 'createdAt' });

  readonly list = this._list.asReadonly();
  readonly detail = this._detail.asReadonly();
  readonly query = this._query.asReadonly();
  readonly subscriptions = computed(() => this._list().data?.items ?? []);
  readonly empty = computed(() => !this._list().loading && !this._list().error && this.subscriptions().length === 0);
  readonly saving = computed(() => this._detail().saving);

  async loadList(query: Partial<SubscriptionsQuery> = {}): Promise<void> {
    this._query.update((current) => ({ ...current, ...query }));
    this._list.update((state) => ({ ...state, loading: true, error: null, success: null }));

    try {
      const data = await firstValueFrom(this.repository.list(this._query()));
      this._list.set({ data, loading: false, saving: false, error: null, success: null });
    } catch (error) {
      this._list.set({ ...createState(), loading: false, error: safeError(error, LOAD_ERROR) });
    }
  }

  async loadDetail(id: string): Promise<void> {
    this._detail.update((state) => ({ ...state, loading: true, error: null, success: null }));

    try {
      const data = await firstValueFrom(this.repository.get(id));
      this._detail.set({ data, loading: false, saving: false, error: null, success: null });
    } catch (error) {
      this._detail.set({ ...createState(), loading: false, error: safeError(error, LOAD_ERROR) });
    }
  }

  async update(id: string, payload: SubscriptionUpdatePayload): Promise<PlatformSubscription | null> {
    return this.mutate(() => this.repository.update(id, payload), 'تم تحديث الاشتراك.');
  }

  async changePlan(id: string, payload: ChangePlanPayload): Promise<PlatformSubscription | null> {
    if (!payload.reason.trim()) {
      this.setMutationError(REASON_ERROR);
      return null;
    }
    if (!payload.planId.trim()) {
      this.setMutationError('اختر الخطة الجديدة قبل المتابعة.');
      return null;
    }
    return this.mutate(() => this.repository.changePlan(id, payload), 'تم تغيير خطة الاشتراك.');
  }

  async cancel(id: string, reason: string): Promise<PlatformSubscription | null> {
    if (!reason.trim()) {
      this.setMutationError(REASON_ERROR);
      return null;
    }
    return this.mutate(() => this.repository.cancel(id, { reason }), 'تم إلغاء الاشتراك.');
  }

  async renew(id: string, payload: RenewSubscriptionPayload): Promise<PlatformSubscription | null> {
    if (!payload.reason.trim()) {
      this.setMutationError(REASON_ERROR);
      return null;
    }
    return this.mutate(() => this.repository.renew(id, payload), 'تم تجديد الاشتراك.');
  }

  private async mutate(request: () => ReturnType<PlatformSubscriptionsRepository['get']>, success: string): Promise<PlatformSubscription | null> {
    this._detail.update((state) => ({ ...state, saving: true, error: null, success: null }));

    try {
      const data = await firstValueFrom(request());
      this._detail.set({ data, loading: false, saving: false, error: null, success });
      return data;
    } catch (error) {
      this._detail.update((state) => ({ ...state, saving: false, error: safeError(error, SAVE_ERROR), success: null }));
      return null;
    }
  }

  private setMutationError(error: string): void {
    this._detail.update((state) => ({ ...state, saving: false, error, success: null }));
  }
}

const createState = <T>(): SubscriptionsState<T> => ({
  data: null,
  loading: false,
  saving: false,
  error: null,
  success: null,
});

const safeError = (error: unknown, fallback: string): string => {
  if (error instanceof ApiClientError) {
    if (error.status === 400) return VALIDATION_ERROR;
    if (error.status === 404) return NOT_FOUND_ERROR;
    if (error.status === 409) return CONFLICT_ERROR;
  }
  return fallback;
};
