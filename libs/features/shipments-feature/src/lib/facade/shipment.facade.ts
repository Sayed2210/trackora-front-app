import { Injectable, signal, computed } from '@angular/core';
import { Shipment, ShipmentFilters, PaginationMeta, ShipmentStatus } from '@trackora/shared/domain';
import { ShipmentRepository } from '@trackora/shared/data-access';
import { AuthService } from '@trackora/core/auth';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ShipmentFacade {
  private readonly _shipments = signal<Shipment[]>([]);
  private readonly _loading = signal(false);
  private readonly _filters = signal<Partial<ShipmentFilters>>({});
  private readonly _meta = signal<PaginationMeta | null>(null);
  private readonly _selectedShipment = signal<Shipment | null>(null);

  readonly shipments = this._shipments.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly meta = this._meta.asReadonly();
  readonly selectedShipment = this._selectedShipment.asReadonly();

  readonly hasMorePages = computed(() => {
    const m = this._meta();
    return m ? m.page < m.totalPages : false;
  });

  constructor(
    private readonly repo: ShipmentRepository,
    private readonly authService: AuthService,
  ) {}

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  async loadShipments(filters?: Partial<ShipmentFilters>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    const merchantId = this.authService.user()?.merchantId;
    if (!merchantId) {
      this._error.set('Merchant account is missing from your profile');
      this._shipments.set([]);
      this._meta.set(null);
      this._loading.set(false);
      return;
    }

    const merged = { ...this._filters(), ...filters, merchantId };
    this._filters.set(merged);

    try {
      const result = await firstValueFrom(this.repo.findAll(merged));
      this._shipments.set(result.data);
      this._meta.set(result.meta ?? null);
    } catch (err: any) {
      this._error.set(err.message ?? 'Failed to load shipments');
      this._shipments.set([]);
      this._meta.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  async loadShipmentDetail(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const shipment = await firstValueFrom(this.repo.findById(id));
      this._selectedShipment.set(shipment);
    } catch (err: any) {
      this._error.set(err.message ?? 'Failed to load shipment details');
      this._selectedShipment.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  optimisticUpdateStatus(id: string, newStatus: ShipmentStatus): void {
    this._shipments.update((list) =>
      list.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  }

  rollbackStatus(id: string, previousStatus: ShipmentStatus): void {
    this._shipments.update((list) =>
      list.map((s) => (s.id === id ? { ...s, status: previousStatus } : s))
    );
  }

  setSelectedShipment(shipment: Shipment | null): void {
    this._selectedShipment.set(shipment);
  }
}
