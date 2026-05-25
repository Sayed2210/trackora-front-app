import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiClientError } from '@trackora/core/api';
import { firstValueFrom } from 'rxjs';
import {
  AuditLog,
  AuditLogsPage,
  AuditLogsQuery,
  AuditLogsState,
} from '../domain/models/audit-log.models';
import { PlatformAuditLogsRepository } from '../infrastructure/platform-audit-logs.repository';

const LOAD_ERROR = 'تعذر تحميل سجلات التدقيق. حاول مرة أخرى.';
const FORBIDDEN_ERROR = 'لا تملك صلاحية عرض سجلات التدقيق.';
const VALIDATION_ERROR =
  'رفض الخادم فلاتر سجلات التدقيق الحالية. راجع القيم ثم حاول مرة أخرى.';

@Injectable()
export class AuditLogsFacade {
  private readonly repository = inject(PlatformAuditLogsRepository);
  private readonly _logs = signal<AuditLogsState<AuditLogsPage>>(state());
  private readonly _query = signal<AuditLogsQuery>({
    page: 1,
    pageSize: 20,
    sortBy: 'timestamp',
    sortDirection: 'desc',
  });
  private readonly _selected = signal<AuditLog | null>(null);

  readonly logs = this._logs.asReadonly();
  readonly query = this._query.asReadonly();
  readonly selected = this._selected.asReadonly();
  readonly items = computed(() => this._logs().data?.items ?? []);
  readonly empty = computed(
    () =>
      !this._logs().loading && !this._logs().error && this.items().length === 0,
  );

  async load(query: AuditLogsQuery = {}): Promise<void> {
    this._query.update((current) => ({ ...current, ...query }));
    this._logs.update((current) => ({
      ...current,
      loading: true,
      error: null,
    }));
    try {
      this._logs.set({
        data: await firstValueFrom(this.repository.list(this._query())),
        loading: false,
        error: null,
      });
    } catch (error) {
      this._logs.set({ ...state<AuditLogsPage>(), error: safeError(error) });
    }
  }

  select(log: AuditLog): void {
    this._selected.set(log);
  }

  closeDetails(): void {
    this._selected.set(null);
  }
}

const state = <T>(): AuditLogsState<T> => ({
  data: null,
  loading: false,
  error: null,
});

const safeError = (error: unknown): string => {
  if (error instanceof ApiClientError) {
    if (error.status === 400) return VALIDATION_ERROR;
    if (error.status === 403) return FORBIDDEN_ERROR;
  }
  return LOAD_ERROR;
};
