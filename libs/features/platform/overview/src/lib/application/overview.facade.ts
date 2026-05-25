import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import {
  OverviewSectionKey,
  OverviewSectionState,
  PlatformOverviewSummary,
  PlatformRevenueSummary,
  PlatformShipmentsSummary,
  PlatformUsageSummary,
} from '../domain/models/platform-overview.models';
import { PlatformAnalyticsRepository } from '../infrastructure/platform-analytics.repository';

const USER_SAFE_ERROR = 'تعذر تحميل هذا الجزء من لوحة المؤشرات. حاول مرة أخرى.';

@Injectable()
export class OverviewFacade {
  private readonly repository = inject(PlatformAnalyticsRepository);

  private readonly _overview = signal<OverviewSectionState<PlatformOverviewSummary>>(
    createSectionState(),
  );
  private readonly _usage = signal<OverviewSectionState<PlatformUsageSummary>>(
    createSectionState(),
  );
  private readonly _revenue = signal<OverviewSectionState<PlatformRevenueSummary>>(
    createSectionState(),
  );
  private readonly _shipments = signal<OverviewSectionState<PlatformShipmentsSummary>>(
    createSectionState(),
  );

  readonly overview = this._overview.asReadonly();
  readonly usage = this._usage.asReadonly();
  readonly revenue = this._revenue.asReadonly();
  readonly shipments = this._shipments.asReadonly();

  readonly loading = computed(
    () =>
      this._overview().loading ||
      this._usage().loading ||
      this._revenue().loading ||
      this._shipments().loading,
  );

  readonly hasAnyData = computed(
    () =>
      !!this._overview().data ||
      !!this._usage().data ||
      !!this._revenue().data ||
      !!this._shipments().data,
  );

  readonly allFailed = computed(
    () =>
      !this.loading() &&
      !this.hasAnyData() &&
      !!this._overview().error &&
      !!this._usage().error &&
      !!this._revenue().error &&
      !!this._shipments().error,
  );

  load(): void {
    void Promise.all([
      this.loadOverview(),
      this.loadUsage(),
      this.loadRevenue(),
      this.loadShipments(),
    ]);
  }

  retry(section?: OverviewSectionKey): void {
    if (!section) {
      this.load();
      return;
    }

    const loaders: Record<OverviewSectionKey, () => Promise<void>> = {
      overview: () => this.loadOverview(),
      usage: () => this.loadUsage(),
      revenue: () => this.loadRevenue(),
      shipments: () => this.loadShipments(),
    };

    void loaders[section]();
  }

  async loadOverview(): Promise<void> {
    await this.loadSection(this._overview, () => this.repository.getOverview());
  }

  async loadUsage(): Promise<void> {
    await this.loadSection(this._usage, () => this.repository.getUsage());
  }

  async loadRevenue(): Promise<void> {
    await this.loadSection(this._revenue, () => this.repository.getRevenue());
  }

  async loadShipments(): Promise<void> {
    await this.loadSection(this._shipments, () => this.repository.getShipments());
  }

  private async loadSection<T>(
    section: WritableSignal<OverviewSectionState<T>>,
    request: () => Observable<T>,
  ): Promise<void> {
    section.update((state) => ({ ...state, loading: true, error: null }));

    try {
      const data = await firstValueFrom(request());
      section.set({ data, loading: false, error: null });
    } catch {
      section.set({ data: null, loading: false, error: USER_SAFE_ERROR });
    }
  }
}

const createSectionState = <T>(): OverviewSectionState<T> => ({
  data: null,
  loading: false,
  error: null,
});
