import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ShipmentFacade } from '../facade/shipment.facade';
import { ZoneRepository } from '@trackora/shared/data-access';
import { Zone, ShipmentStatus } from '@trackora/shared/domain';
import { LoadingSpinnerComponent, EgpCurrencyPipe } from '@trackora/shared/ui';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-shipment-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, LoadingSpinnerComponent, EgpCurrencyPipe],
  providers: [ShipmentFacade],
  template: `
    <div class="shipment-list">
      <div class="header">
        <h1>{{ 'shipments.listTitle' | translate }}</h1>
        <div class="actions">
          <a routerLink="bulk-upload" class="p-button p-button-secondary">{{ 'shipments.bulkUpload' | translate }}</a>
          <a routerLink="create" class="p-button p-button-primary">{{ 'shipments.createTitle' | translate }}</a>
        </div>
      </div>
      <app-loading-spinner *ngIf="facade.loading()" />
      <div class="error" *ngIf="facade.error()">
        {{ facade.error() }}
        <button (click)="facade.loadShipments({ page: 1, limit: 10 })">Retry</button>
      </div>
      <div class="filters">
        <select (change)="onStatusChange($event)">
          <option value="">{{ 'common.filter' | translate }} Status</option>
          <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
        </select>
        <select (change)="onZoneChange($event)">
          <option value="">All Zones</option>
          <option *ngFor="let zone of zones()" [value]="zone.id">{{ zone.nameAr }} ({{ zone.code }})</option>
        </select>
      </div>
      <table class="shipment-table" *ngIf="!facade.loading()">
        <thead>
          <tr>
            <th>{{ 'shipments.trackingNumber' | translate }}</th>
            <th>{{ 'shipments.customerName' | translate }}</th>
            <th>{{ 'shipments.customerPhone' | translate }}</th>
            <th>Zone</th>
            <th>{{ 'shipments.status' | translate }}</th>
            <th>{{ 'shipments.codAmount' | translate }}</th>
            <th>{{ 'shipments.address' | translate }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let s of facade.shipments()" [routerLink]="[s.id]">
            <td>{{ s.trackingNumber }}</td>
            <td>{{ s.customerName }}</td>
            <td>{{ s.customerPhoneMasked || s.customerPhone }}</td>
            <td>{{ s.address.zone || '-' }}</td>
            <td><span class="status-badge" [class]="s.status">{{ s.status }}</span></td>
            <td>{{ s.codAmount | egpCurrency }}</td>
            <td>{{ s.address.governorate }}, {{ s.address.city }}</td>
          </tr>
        </tbody>
      </table>
      <div class="pagination" *ngIf="facade.meta()">
        <button (click)="prevPage()" [disabled]="facade.meta()?.page === 1">Prev</button>
        <span>Page {{ facade.meta()?.page }} of {{ facade.meta()?.totalPages }}</span>
        <button (click)="nextPage()" [disabled]="!facade.hasMorePages()">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .shipment-list { padding: 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .actions { display: flex; gap: 0.5rem; }
    .filters { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
    .filters select { padding: 0.5rem; border: 1px solid var(--trackora-border); border-radius: 4px; min-width: 160px; }
    .error { background: #FEE2E2; color: #991B1B; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .shipment-table { width: 100%; border-collapse: collapse; background: white; }
    .shipment-table th, .shipment-table td { padding: 0.75rem; border-bottom: 1px solid var(--trackora-border); text-align: start; }
    .shipment-table tr { cursor: pointer; }
    .shipment-table tr:hover { background: var(--trackora-surface); }
    .status-badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .PENDING { background: #FEF3C7; color: #92400E; }
    .CONFIRMED { background: #DBEAFE; color: #1E40AF; }
    .OUT_FOR_DELIVERY { background: #E0E7FF; color: #3730A3; }
    .DELIVERED { background: #D1FAE5; color: #065F46; }
    .FAILED { background: #FEE2E2; color: #991B1B; }
    .RETURNED { background: #F3F4F6; color: #4B5563; }
    .pagination { display: flex; gap: 1rem; align-items: center; margin-top: 1rem; }
  `],
})
export class ShipmentListPageComponent implements OnInit {
  readonly facade = inject(ShipmentFacade);
  readonly zoneRepo = inject(ZoneRepository);
  readonly statuses = Object.values(ShipmentStatus);
  readonly zones = signal<Zone[]>([]);
  private currentStatus?: string;
  private currentZoneId?: string;

  async ngOnInit(): Promise<void> {
    this.facade.loadShipments({ page: 1, limit: 10 });
    const zonesResult = await firstValueFrom(this.zoneRepo.findAll({ isActive: true }));
    this.zones.set(zonesResult.data);
  }

  onStatusChange(event: Event): void {
    this.currentStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onZoneChange(event: Event): void {
    this.currentZoneId = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.facade.loadShipments({
      page: 1,
      limit: 10,
      status: this.currentStatus as ShipmentStatus || undefined,
      zoneId: this.currentZoneId || undefined,
    });
  }

  nextPage(): void {
    const meta = this.facade.meta();
    if (meta) this.facade.loadShipments({ page: meta.page + 1 });
  }

  prevPage(): void {
    const meta = this.facade.meta();
    if (meta && meta.page > 1) this.facade.loadShipments({ page: meta.page - 1 });
  }
}
