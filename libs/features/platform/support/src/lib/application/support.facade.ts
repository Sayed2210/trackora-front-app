import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiClientError } from '@trackora/core/api';
import { AuthService, TokenStorageService } from '@trackora/core/auth';
import { AuthRepository } from '@trackora/shared/data-access';
import { firstValueFrom } from 'rxjs';
import {
  ImpersonationContextView,
  SupportState,
  SupportTenantSearchPage,
  SupportTenantSearchQuery,
  TenantHealth,
} from '../domain/models/support.models';
import { PlatformSupportRepository } from '../infrastructure/platform-support.repository';
import { mapImpersonationContext } from '../infrastructure/mappers/support.mapper';

const LOAD_ERROR = 'تعذر تحميل بيانات الدعم. حاول مرة أخرى.';
const FORBIDDEN_ERROR = 'لا تملك صلاحية استخدام أدوات الدعم أو الانتحال.';
const VALIDATION_ERROR =
  'رفض الخادم القيم الحالية. راجع السبب أو البحث ثم حاول مرة أخرى.';
const START_SUCCESS = 'تم بدء الانتحال بعد التوثيق في سجل التدقيق.';
const END_SUCCESS = 'تم إنهاء الانتحال وتحديث جلسة المستخدم.';

@Injectable()
export class SupportFacade {
  private readonly repository = inject(PlatformSupportRepository);
  private readonly authRepository = inject(AuthRepository);
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly _search =
    signal<SupportState<SupportTenantSearchPage>>(state());
  private readonly _health = signal<SupportState<TenantHealth>>(state());
  private readonly _mutation = signal<SupportState<null>>(state());
  private readonly _query = signal<SupportTenantSearchQuery>({
    page: 1,
    pageSize: 20,
  });

  readonly search = this._search.asReadonly();
  readonly health = this._health.asReadonly();
  readonly mutation = this._mutation.asReadonly();
  readonly query = this._query.asReadonly();
  readonly items = computed(() => this._search().data?.items ?? []);
  readonly emptySearch = computed(
    () =>
      !this._search().loading &&
      !this._search().error &&
      this.items().length === 0,
  );
  readonly impersonationContext = computed(() =>
    mapImpersonationContext(this.authService.user()?.impersonationContext),
  );

  async searchTenants(query: SupportTenantSearchQuery = {}): Promise<void> {
    this._query.update((current) => ({ ...current, ...query }));
    this._search.update((current) => ({
      ...current,
      loading: true,
      error: null,
    }));
    try {
      this._search.set({
        data: await firstValueFrom(
          this.repository.searchTenants(this._query()),
        ),
        loading: false,
        error: null,
      });
    } catch (error) {
      this._search.set({
        ...state<SupportTenantSearchPage>(),
        error: safeError(error),
      });
    }
  }

  async loadHealth(tenantId: string): Promise<void> {
    this._health.update((current) => ({
      ...current,
      loading: true,
      error: null,
    }));
    try {
      this._health.set({
        data: await firstValueFrom(this.repository.tenantHealth(tenantId)),
        loading: false,
        error: null,
      });
    } catch (error) {
      this._health.set({ ...state<TenantHealth>(), error: safeError(error) });
    }
  }

  async startImpersonation(tenantId: string, reason: string): Promise<void> {
    if (!reason.trim()) {
      this._mutation.set({ ...state<null>(), error: 'سبب الانتحال مطلوب.' });
      return;
    }

    this._mutation.set({
      data: null,
      loading: true,
      error: null,
      success: null,
    });
    try {
      const result = await firstValueFrom(
        this.repository.startImpersonation(tenantId, reason.trim()),
      );
      if (result.accessToken)
        this.tokenStorage.setAccessToken(result.accessToken);
      if (result.refreshToken)
        this.tokenStorage.setRefreshToken(result.refreshToken);
      await this.refreshSession(result.impersonationContext);
      this._mutation.set({
        data: null,
        loading: false,
        error: null,
        success: START_SUCCESS,
      });
    } catch (error) {
      this._mutation.set({ ...state<null>(), error: safeError(error) });
    }
  }

  async endImpersonation(): Promise<void> {
    if (!this.impersonationContext()) return;
    this._mutation.set({
      data: null,
      loading: true,
      error: null,
      success: null,
    });
    try {
      await firstValueFrom(this.repository.endImpersonation());
      await this.refreshSession(null);
      this._mutation.set({
        data: null,
        loading: false,
        error: null,
        success: END_SUCCESS,
      });
    } catch (error) {
      await this.recoverExpiredImpersonation(error);
    }
  }

  async refreshSession(
    fallbackContext?: ImpersonationContextView | null,
  ): Promise<void> {
    try {
      await firstValueFrom(this.authRepository.me());
    } catch {
      const current = this.authService.user();
      if (current && fallbackContext !== undefined) {
        this.authService.setUser({
          ...current,
          impersonationContext: fallbackContext
            ? { ...fallbackContext }
            : undefined,
        });
      }
    }
  }

  private async recoverExpiredImpersonation(error: unknown): Promise<void> {
    if (
      error instanceof ApiClientError &&
      [401, 403, 404, 409].includes(error.status)
    ) {
      await this.refreshSession(null);
      this._mutation.set({
        data: null,
        loading: false,
        error: null,
        success: END_SUCCESS,
      });
      return;
    }
    this._mutation.set({ ...state<null>(), error: safeError(error) });
  }
}

const state = <T>(): SupportState<T> => ({
  data: null,
  loading: false,
  error: null,
  success: null,
});

const safeError = (error: unknown): string => {
  if (error instanceof ApiClientError) {
    if (error.status === 400) return VALIDATION_ERROR;
    if (error.status === 401 || error.status === 403) return FORBIDDEN_ERROR;
  }
  return LOAD_ERROR;
};
