import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ApiClientError } from '@trackora/core/api';
import { firstValueFrom, Observable } from 'rxjs';
import { FeatureFlagsState, GlobalFeatureFlag, TenantFeatureFlag } from '../domain/models/feature-flag.models';
import { PlatformFeatureFlagsRepository } from '../infrastructure/platform-feature-flags.repository';

const LOAD_ERROR = 'تعذر تحميل Feature Flags. حاول مرة أخرى.';
const SAVE_ERROR = 'تعذر حفظ تغيير Feature Flag. حاول مرة أخرى.';
const REASON_ERROR = 'سبب التغيير مطلوب قبل تنفيذ هذا الإجراء.';
const VALIDATION_ERROR = 'رفض الخادم الطلب. راجع القيمة والسبب ثم حاول مرة أخرى.';
const NOT_FOUND_ERROR = 'Feature Flag أو المستأجر المطلوب غير متاح.';
const CONFLICT_ERROR = 'تعذر تنفيذ التغيير بسبب تعارض في الحالة الحالية.';

@Injectable()
export class FeatureFlagsFacade {
  private readonly repository = inject(PlatformFeatureFlagsRepository);

  private readonly _global = signal<FeatureFlagsState<GlobalFeatureFlag[]>>(state());
  private readonly _tenant = signal<FeatureFlagsState<TenantFeatureFlag[]>>(state());

  readonly global = this._global.asReadonly();
  readonly tenant = this._tenant.asReadonly();
  readonly globalFlags = computed(() => this._global().data ?? []);
  readonly tenantFlags = computed(() => this._tenant().data ?? []);
  readonly globalEmpty = computed(() => !this._global().loading && !this._global().error && this.globalFlags().length === 0);
  readonly tenantEmpty = computed(() => !this._tenant().loading && !this._tenant().error && this.tenantFlags().length === 0);

  async loadGlobal(): Promise<void> {
    await this.load(this._global, () => this.repository.listGlobal());
  }

  async loadTenant(tenantId: string): Promise<void> {
    await this.load(this._tenant, () => this.repository.listTenant(tenantId));
  }

  async setGlobal(key: string, enabled: boolean, reason: string): Promise<boolean> {
    if (!reason.trim()) {
      this.setError(this._global, REASON_ERROR);
      return false;
    }

    return this.mutate(this._global, () => this.repository.updateGlobal(key, enabled, reason.trim()), async () => {
      await this.loadGlobal();
    });
  }

  async setTenantOverride(tenantId: string, key: string, override: boolean | null, reason: string): Promise<boolean> {
    if (!reason.trim()) {
      this.setError(this._tenant, REASON_ERROR);
      return false;
    }

    return this.mutate(this._tenant, () => this.repository.updateTenant(tenantId, key, override, reason.trim()), async () => {
      await this.loadTenant(tenantId);
    });
  }

  private async load<T>(target: WritableSignal<FeatureFlagsState<T>>, request: () => Observable<T>): Promise<void> {
    target.update((current) => ({ ...current, loading: true, error: null, success: null }));
    try {
      target.set({ data: await firstValueFrom(request()), loading: false, saving: false, error: null, success: null });
    } catch (error) {
      target.set({ ...state<T>(), error: safeError(error, LOAD_ERROR) });
    }
  }

  private async mutate<T>(
    target: WritableSignal<FeatureFlagsState<T>>,
    request: () => Observable<T>,
    refresh: () => Promise<void>,
  ): Promise<boolean> {
    target.update((current) => ({ ...current, saving: true, error: null, success: null }));
    try {
      await firstValueFrom(request());
      target.update((current) => ({ ...current, saving: false, error: null, success: 'تم حفظ التغيير وتحديث البيانات.' }));
      await refresh();
      return true;
    } catch (error) {
      target.update((current) => ({ ...current, saving: false, error: safeError(error, SAVE_ERROR), success: null }));
      return false;
    }
  }

  private setError<T>(target: WritableSignal<FeatureFlagsState<T>>, error: string): void {
    target.update((current) => ({ ...current, saving: false, error, success: null }));
  }
}

const state = <T>(): FeatureFlagsState<T> => ({ data: null, loading: false, saving: false, error: null, success: null });

const safeError = (error: unknown, fallback: string): string => {
  if (error instanceof ApiClientError) {
    if (error.status === 400) return VALIDATION_ERROR;
    if (error.status === 404) return NOT_FOUND_ERROR;
    if (error.status === 409) return CONFLICT_ERROR;
  }
  return fallback;
};
