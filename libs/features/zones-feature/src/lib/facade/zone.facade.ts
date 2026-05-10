import { Injectable, signal, computed } from '@angular/core';
import { Zone } from '@trackora/shared/domain';
import { ZoneRepository, ZoneQueryDto, UpdateZoneDto } from '@trackora/shared/data-access';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ZoneFacade {
  private readonly _zones = signal<Zone[]>([]);
  private readonly _loading = signal(false);
  private readonly _selectedZone = signal<Zone | null>(null);
  private readonly _error = signal<string | null>(null);

  readonly zones = this._zones.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly selectedZone = this._selectedZone.asReadonly();
  readonly error = this._error.asReadonly();

  readonly activeZones = computed(() =>
    this._zones().filter((z) => z.isActive),
  );

  readonly zonesByLevel = computed(() => {
    const map = new Map<string, Zone[]>();
    for (const zone of this._zones()) {
      const list = map.get(zone.level) || [];
      list.push(zone);
      map.set(zone.level, list);
    }
    return map;
  });

  constructor(private readonly repo: ZoneRepository) {}

  async loadZones(query?: ZoneQueryDto): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const result = await firstValueFrom(this.repo.findAll(query));
      this._zones.set(result.data);
    } catch (err: any) {
      this._error.set(err?.message || 'Failed to load zones');
    } finally {
      this._loading.set(false);
    }
  }

  async loadZoneDetail(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const zone = await firstValueFrom(this.repo.findById(id));
      this._selectedZone.set(zone);
    } catch (err: any) {
      this._error.set(err?.message || 'Failed to load zone');
    } finally {
      this._loading.set(false);
    }
  }

  async createZone(dto: { level: string; nameAr: string; nameEn?: string; code: string; parentId?: string }): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await firstValueFrom(this.repo.create(dto as any));
      await this.loadZones();
    } catch (err: any) {
      this._error.set(err?.message || 'Failed to create zone');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async updateZone(id: string, dto: UpdateZoneDto): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await firstValueFrom(this.repo.update(id, dto));
      await this.loadZones();
    } catch (err: any) {
      this._error.set(err?.message || 'Failed to update zone');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async deleteZone(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await firstValueFrom(this.repo.delete(id));
      this._zones.update((list) => list.filter((z) => z.id !== id));
    } catch (err: any) {
      this._error.set(err?.message || 'Failed to delete zone');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  setSelectedZone(zone: Zone | null): void {
    this._selectedZone.set(zone);
  }

  clearError(): void {
    this._error.set(null);
  }
}
