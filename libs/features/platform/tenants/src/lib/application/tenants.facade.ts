import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { ApiClientError } from '@trackora/core/api';
import {
  Tenant,
  TenantBillingSummary,
  TenantFeatureFlagSummary,
  TenantListQuery,
  TenantListResult,
  TenantMutationInput,
  TenantState,
  TenantStatus,
  TenantUsage,
  TenantUserSummary,
} from '../domain/models/tenant.models';
import { PlatformTenantsRepository } from '../infrastructure/platform-tenants.repository';

const USER_SAFE_ERROR = 'تعذر تنفيذ الطلب الآن. حاول مرة أخرى دون كشف تفاصيل تقنية.';
const DUPLICATE_SLUG_ERROR = 'هذا الرابط المختصر مستخدم بالفعل. اختر رابطاً آخر.';

@Injectable()
export class TenantsFacade {
  private readonly repository = inject(PlatformTenantsRepository);

  private readonly _list = signal<TenantState<TenantListResult>>(state<TenantListResult>());
  private readonly _detail = signal<TenantState<Tenant>>(state<Tenant>());
  private readonly _usage = signal<TenantState<TenantUsage>>(state<TenantUsage>());
  private readonly _users = signal<TenantState<TenantUserSummary[]>>(state<TenantUserSummary[]>());
  private readonly _billing = signal<TenantState<TenantBillingSummary>>(state<TenantBillingSummary>());
  private readonly _featureFlags = signal<TenantState<TenantFeatureFlagSummary[]>>(state<TenantFeatureFlagSummary[]>());
  private readonly _saving = signal(false);
  private readonly _mutationError = signal<string | null>(null);

  readonly list = this._list.asReadonly();
  readonly detail = this._detail.asReadonly();
  readonly usage = this._usage.asReadonly();
  readonly users = this._users.asReadonly();
  readonly billing = this._billing.asReadonly();
  readonly featureFlags = this._featureFlags.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly mutationError = this._mutationError.asReadonly();
  readonly hasTenants = computed(() => (this._list().data?.items.length ?? 0) > 0);

  async loadList(query: TenantListQuery): Promise<void> {
    await this.load(this._list, () => this.repository.listTenants(query));
  }

  async loadDetail(id: string): Promise<void> {
    await this.load(this._detail, () => this.repository.getTenant(id));
  }

  async loadUsage(id: string): Promise<void> {
    await this.load(this._usage, () => this.repository.getUsage(id));
  }

  async loadUsers(id: string): Promise<void> {
    await this.load(this._users, () => this.repository.getUsers(id));
  }

  async loadBilling(id: string): Promise<void> {
    await this.load(this._billing, () => this.repository.getBilling(id));
  }

  async loadFeatureFlags(id: string): Promise<void> {
    await this.load(this._featureFlags, () => this.repository.getFeatureFlags(id));
  }

  async createTenant(input: TenantMutationInput): Promise<Tenant | null> {
    return this.mutate(() => this.repository.createTenant(input));
  }

  async updateTenant(id: string, input: TenantMutationInput): Promise<Tenant | null> {
    const tenant = await this.mutate(() => this.repository.updateTenant(id, input));
    if (tenant) {
      this._detail.set({ data: tenant, loading: false, error: null });
    }
    return tenant;
  }

  async changeStatus(id: string, status: TenantStatus, reason: string): Promise<Tenant | null> {
    if (!reason.trim()) {
      this._mutationError.set('سبب التغيير مطلوب.');
      return null;
    }

    const tenant = await this.mutate(() => this.repository.changeStatus(id, status, reason));
    if (tenant) {
      this._detail.set({ data: tenant, loading: false, error: null });
    }
    return tenant;
  }

  clearMutationError(): void {
    this._mutationError.set(null);
  }

  private async load<T>(target: WritableSignal<TenantState<T>>, request: () => Observable<T>): Promise<void> {
    target.update((current) => ({ ...current, loading: true, error: null }));
    try {
      target.set({ data: await firstValueFrom(request()), loading: false, error: null });
    } catch {
      target.set({ data: null, loading: false, error: USER_SAFE_ERROR });
    }
  }

  private async mutate<T>(request: () => Observable<T>): Promise<T | null> {
    this._saving.set(true);
    this._mutationError.set(null);
    try {
      return await firstValueFrom(request());
    } catch (error) {
      this._mutationError.set(mapMutationError(error));
      return null;
    } finally {
      this._saving.set(false);
    }
  }
}

const state = <T>(): TenantState<T> => ({ data: null, loading: false, error: null });

const mapMutationError = (error: unknown): string => {
  if (error instanceof ApiClientError && (error.status === 409 || error.apiError?.code === 'DUPLICATE_SLUG')) {
    return DUPLICATE_SLUG_ERROR;
  }
  return USER_SAFE_ERROR;
};
