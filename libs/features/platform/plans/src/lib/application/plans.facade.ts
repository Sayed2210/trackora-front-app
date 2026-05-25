import { computed, inject, Injectable, signal } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ApiClientError } from '@trackora/core/api';
import { firstValueFrom } from 'rxjs';
import { PlanPayload, PlansPage, PlansQuery, PlansState, PlatformPlan } from '../domain/models/platform-plan.models';
import { PlatformPlansRepository } from '../infrastructure/platform-plans.repository';

const LOAD_ERROR = 'تعذر تحميل خطط الاشتراك. حاول مرة أخرى.';
const SAVE_ERROR = 'تعذر حفظ الخطة. راجع البيانات وحاول مرة أخرى.';
const CONFLICT_ERROR = 'توجد خطة بنفس الاسم أو الكود، أو أن الخطة مرتبطة بسجلات حالية.';
const DELETE_CONFLICT_ERROR = 'لا يمكن أرشفة أو حذف هذه الخطة لأنها مستخدمة في اشتراكات حالية.';

@Injectable()
export class PlansFacade {
  private readonly repository = inject(PlatformPlansRepository);

  private readonly _list = signal<PlansState<PlansPage>>(createState());
  private readonly _detail = signal<PlansState<PlatformPlan>>(createState());
  private readonly _query = signal<PlansQuery>({ page: 1, pageSize: 20, status: 'all', billingCycle: 'all', sort: 'name' });

  readonly list = this._list.asReadonly();
  readonly detail = this._detail.asReadonly();
  readonly query = this._query.asReadonly();
  readonly plans = computed(() => this._list().data?.items ?? []);
  readonly empty = computed(() => !this._list().loading && !this._list().error && this.plans().length === 0);

  async loadList(query: Partial<PlansQuery> = {}): Promise<void> {
    this._query.update((current) => ({ ...current, ...query }));
    this._list.update((state) => ({ ...state, loading: true, error: null, success: null }));

    try {
      const data = await firstValueFrom(this.repository.list(this._query()));
      this._list.set({ data, loading: false, saving: false, deleting: false, error: null, success: null });
    } catch (error) {
      this._list.set({ ...createState(), loading: false, error: safeError(error, LOAD_ERROR) });
    }
  }

  async loadDetail(id: string): Promise<void> {
    this._detail.update((state) => ({ ...state, loading: true, error: null, success: null }));

    try {
      const data = await firstValueFrom(this.repository.get(id));
      this._detail.set({ data, loading: false, saving: false, deleting: false, error: null, success: null });
    } catch (error) {
      this._detail.set({ ...createState(), loading: false, error: safeError(error, LOAD_ERROR) });
    }
  }

  async create(payload: PlanPayload): Promise<PlatformPlan | null> {
    this._detail.update((state) => ({ ...state, saving: true, error: null, success: null }));

    try {
      const data = await firstValueFrom(this.repository.create(payload));
      this._detail.set({ data, loading: false, saving: false, deleting: false, error: null, success: 'تم إنشاء الخطة.' });
      return data;
    } catch (error) {
      this._detail.update((state) => ({ ...state, saving: false, error: safeError(error, SAVE_ERROR), success: null }));
      return null;
    }
  }

  async update(id: string, payload: PlanPayload): Promise<PlatformPlan | null> {
    this._detail.update((state) => ({ ...state, saving: true, error: null, success: null }));

    try {
      const data = await firstValueFrom(this.repository.update(id, payload));
      this._detail.set({ data, loading: false, saving: false, deleting: false, error: null, success: 'تم تحديث الخطة.' });
      return data;
    } catch (error) {
      this._detail.update((state) => ({ ...state, saving: false, error: safeError(error, SAVE_ERROR), success: null }));
      return null;
    }
  }

  async archive(id: string): Promise<boolean> {
    this._list.update((state) => ({ ...state, deleting: true, error: null, success: null }));
    this._detail.update((state) => ({ ...state, deleting: true, error: null, success: null }));

    try {
      await firstValueFrom(this.repository.delete(id));
      this._list.update((state) => ({ ...state, deleting: false, success: 'تم إرسال طلب أرشفة الخطة.' }));
      this._detail.update((state) => ({ ...state, deleting: false, success: 'تم إرسال طلب أرشفة الخطة.' }));
      await this.loadList();
      return true;
    } catch (error) {
      const message = safeError(error, LOAD_ERROR, true);
      this._list.update((state) => ({ ...state, deleting: false, error: message, success: null }));
      this._detail.update((state) => ({ ...state, deleting: false, error: message, success: null }));
      return false;
    }
  }
}

const createState = <T>(): PlansState<T> => ({
  data: null,
  loading: false,
  saving: false,
  deleting: false,
  error: null,
  success: null,
});

const safeError = (error: unknown, fallback: string, deleteAction = false): string => {
  if (error instanceof ApiClientError && error.status === 409) {
    return deleteAction ? DELETE_CONFLICT_ERROR : CONFLICT_ERROR;
  }
  if (error instanceof ApiClientError && error.status === 400) {
    return SAVE_ERROR;
  }
  return fallback;
};
