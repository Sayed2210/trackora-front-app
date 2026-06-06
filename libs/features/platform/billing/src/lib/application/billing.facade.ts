import {
  computed,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { ApiClientError } from '@trackora/core/api';
import { firstValueFrom, Observable } from 'rxjs';
import {
  BillingOverview,
  BillingState,
  InvoicesPage,
  InvoicesQuery,
} from '../domain/models/billing.models';
import { PlatformBillingRepository } from '../infrastructure/platform-billing.repository';

const LOAD_OVERVIEW_ERROR = 'تعذر تحميل ملخص الفوترة. حاول مرة أخرى.';
const LOAD_INVOICES_ERROR = 'تعذر تحميل الفواتير. حاول مرة أخرى.';
const FORBIDDEN_ERROR = 'لا تملك صلاحية عرض بيانات الفوترة.';
const NOT_FOUND_ERROR = 'بيانات الفوترة المطلوبة غير متاحة.';
const VALIDATION_ERROR =
  'رفض الخادم الفلاتر الحالية. راجع القيم ثم حاول مرة أخرى.';

@Injectable()
export class BillingFacade {
  private readonly repository = inject(PlatformBillingRepository);
  private readonly _overview = signal<BillingState<BillingOverview>>(state());
  private readonly _invoices = signal<BillingState<InvoicesPage>>(state());
  private readonly _invoiceQuery = signal<InvoicesQuery>({
    page: 1,
    pageSize: 20,
    status: 'all',
    paymentStatus: 'all',
  });

  readonly overview = this._overview.asReadonly();
  readonly invoices = this._invoices.asReadonly();
  readonly invoiceQuery = this._invoiceQuery.asReadonly();
  readonly invoiceItems = computed(() => this._invoices().data?.items ?? []);
  readonly invoicesEmpty = computed(
    () =>
      !this._invoices().loading &&
      !this._invoices().error &&
      this.invoiceItems().length === 0,
  );

  async loadOverview(): Promise<void> {
    await this.load(
      this._overview,
      () => this.repository.overview(),
      LOAD_OVERVIEW_ERROR,
    );
  }

  async loadInvoices(query: InvoicesQuery = {}): Promise<void> {
    this._invoiceQuery.update((current) => ({ ...current, ...query }));
    await this.load(
      this._invoices,
      () => this.repository.invoices(this._invoiceQuery()),
      LOAD_INVOICES_ERROR,
    );
  }

  private async load<T>(
    target: WritableSignal<BillingState<T>>,
    request: () => Observable<T>,
    fallback: string,
  ): Promise<void> {
    target.update((current) => ({ ...current, loading: true, error: null }));
    try {
      target.set({
        data: await firstValueFrom(request()),
        loading: false,
        error: null,
      });
    } catch (error) {
      target.set({ ...state<T>(), error: safeError(error, fallback) });
    }
  }
}

const state = <T>(): BillingState<T> => ({
  data: null,
  loading: false,
  error: null,
});

const safeError = (error: unknown, fallback: string): string => {
  if (error instanceof ApiClientError) {
    if (error.status === 400) return VALIDATION_ERROR;
    if (error.status === 403) return FORBIDDEN_ERROR;
    if (error.status === 404) return NOT_FOUND_ERROR;
  }
  return fallback;
};
