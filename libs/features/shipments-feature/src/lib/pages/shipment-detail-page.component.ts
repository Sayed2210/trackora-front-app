import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ShipmentFacade } from '../facade/shipment.facade';
import { LoadingSpinnerComponent, EgpCurrencyPipe, LocalDatePipe } from '@trackora/shared/ui';

@Component({
  selector: 'app-shipment-detail-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, LoadingSpinnerComponent, EgpCurrencyPipe, LocalDatePipe],
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
