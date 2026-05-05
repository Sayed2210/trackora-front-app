import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ShipmentFacade } from '../facade/shipment.facade';
import { LoadingSpinnerComponent, EgpCurrencyPipe, LocalDatePipe, MapComponent } from '@trackora/shared/ui';

@Component({
  selector: 'app-shipment-detail-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, LoadingSpinnerComponent, EgpCurrencyPipe, LocalDatePipe, MapComponent],
  providers: [ShipmentFacade],
  template: `
    <div class="shipment-detail" *ngIf="!facade.loading() && facade.selectedShipment() as s">
      <h1>Shipment {{ s.trackingNumber }}</h1>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="label">Customer</span>
          <span class="value">{{ s.customerName }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Phone</span>
          <span class="value">{{ s.customerPhone }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Status</span>
          <span class="value status" [class]="s.status">{{ s.status }}</span>
        </div>
        <div class="detail-item">
          <span class="label">COD</span>
          <span class="value">{{ s.codAmount | egpCurrency }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Address</span>
          <span class="value">{{ s.address.street }}, {{ s.address.building }}, {{ s.address.city }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Created</span>
          <span class="value">{{ s.createdAt | localDate }}</span>
        </div>
      </div>

      <div class="map-section" *ngIf="s.address.lat && s.address.lng">
        <h3>Delivery Location</h3>
        <app-map
          [lat]="s.address.lat"
          [lng]="s.address.lng"
          [zoom]="15"
          [markers]="[{ lat: s.address.lat, lng: s.address.lng, title: s.customerName }]"
        />
      </div>

      <div class="map-section" *ngIf="!s.address.lat || !s.address.lng">
        <h3>Delivery Location</h3>
        <div class="no-location">
          <p>No geolocation data available for this address.</p>
          <p class="address-preview">{{ s.address.street }}, {{ s.address.building }}, {{ s.address.city }}, {{ s.address.governorate }}</p>
        </div>
      </div>
    </div>
    <app-loading-spinner *ngIf="facade.loading()" />
  `,
  styles: [`
    .shipment-detail { padding: 1rem; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .detail-item { background: white; padding: 1rem; border-radius: 8px; border: 1px solid var(--trackora-border); }
    .label { display: block; font-size: 0.75rem; color: var(--trackora-text-secondary); margin-bottom: 0.25rem; }
    .value { font-weight: 600; }
    .status { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; }
    .PENDING { background: #FEF3C7; color: #92400E; }
    .DELIVERED { background: #D1FAE5; color: #065F46; }
    .FAILED { background: #FEE2E2; color: #991B1B; }
    .map-section { margin-top: 1.5rem; background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1rem; }
    .map-section h3 { margin: 0 0 0.75rem; font-size: 1rem; }
    .map-section app-map { height: 300px; }
    .no-location { padding: 2rem; text-align: center; color: var(--trackora-text-secondary); }
    .address-preview { font-weight: 600; color: var(--trackora-text); margin-top: 0.5rem; }
  `],
})
export class ShipmentDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly facade = inject(ShipmentFacade);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.facade.loadShipmentDetail(id);
  }
}
