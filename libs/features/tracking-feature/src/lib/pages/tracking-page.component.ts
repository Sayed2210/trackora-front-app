import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { Shipment, TimelineEvent, ShipmentStatus } from '@trackora/shared/domain';
import { ShipmentRepository } from '@trackora/shared/data-access';
import { LocalDatePipe } from '@trackora/shared/ui';

@Component({
  selector: 'app-tracking-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, LocalDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tracking-page">
      <div class="tracking-header">
        <h1>Track Your Shipment</h1>
        <p>Enter your tracking number to get real-time updates</p>
      </div>

      <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
        <input
          formControlName="trackingNumber"
          placeholder="Enter tracking number (e.g., TRK-123456)"
          class="tracking-input"
          data-testid="track-input"
        />
        <button type="submit" class="p-button p-button-primary" [disabled]="searchForm.invalid || loading()" data-testid="track-submit">
          Track
        </button>
      </form>

      <div class="loading" *ngIf="loading()" data-testid="loading-state">
        <div class="spinner"></div>
        <p>Searching for your shipment...</p>
      </div>

      <div class="error" *ngIf="error()" data-testid="tracking-error">
        <p>{{ error() }}</p>
      </div>

      <div class="shipment-result" *ngIf="shipment() && !loading()" data-testid="tracking-status">
        <div class="shipment-card">
          <div class="shipment-overview">
            <div class="tracking-num">{{ shipment()?.trackingNumber }}</div>
            <div class="status-badge" [class]="shipment()?.status">{{ shipment()?.status }}</div>
          </div>
          <div class="shipment-details">
            <div class="detail-row">
              <span class="label">Customer</span>
              <span class="value">{{ shipment()?.customerName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone</span>
              <span class="value">{{ shipment()?.customerPhone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Address</span>
              <span class="value">{{ shipment()?.address?.street }}, {{ shipment()?.address?.city }}</span>
            </div>
            <div class="detail-row" *ngIf="shipment()?.codAmount">
              <span class="label">COD Amount</span>
              <span class="value">{{ shipment()?.codAmount | currency:'EGP':'symbol':'1.2-2' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Estimated Delivery</span>
              <span class="value">{{ shipment()?.estimatedDelivery | localDate }}</span>
            </div>
          </div>
        </div>

        <div class="timeline" *ngIf="timeline().length" data-testid="tracking-timeline">
          <h3>Shipment Timeline</h3>
          <div class="timeline-list">
            <div class="timeline-item" *ngFor="let event of timeline(); trackBy: trackByEventId; let last = last" [class.last]="last">
              <div class="timeline-marker" [class]="event.status"></div>
              <div class="timeline-content">
                <div class="timeline-status">{{ event.status }}</div>
                <div class="timeline-time">{{ event.timestamp | localDate }}</div>
                <div class="timeline-actor" *ngIf="event.actorName">by {{ event.actorName }}</div>
                <div class="timeline-notes" *ngIf="event.notes">{{ event.notes }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-page { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
    .tracking-header { text-align: center; margin-bottom: 2rem; }
    .tracking-header h1 { color: var(--trackora-primary); margin-bottom: 0.5rem; }
    .tracking-header p { color: var(--trackora-text-secondary); }
    .search-form { display: flex; gap: 0.75rem; margin-bottom: 2rem; }
    .tracking-input { flex: 1; padding: 0.875rem 1rem; border: 2px solid var(--trackora-border); border-radius: 8px; font-size: 1rem; }
    .tracking-input:focus { outline: none; border-color: var(--trackora-primary); }
    .p-button-primary { padding: 0.875rem 2rem; background: var(--trackora-primary); color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600; }
    .p-button-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .loading { text-align: center; padding: 2rem; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--trackora-border); border-top-color: var(--trackora-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error { background: #FEE2E2; color: #991B1B; padding: 1rem; border-radius: 8px; text-align: center; }
    .shipment-card { background: white; border: 1px solid var(--trackora-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .shipment-overview { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--trackora-border); }
    .tracking-num { font-size: 1.25rem; font-weight: 700; color: var(--trackora-primary); }
    .status-badge { padding: 0.375rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .PENDING { background: #FEF3C7; color: #92400E; }
    .CONFIRMED { background: #DBEAFE; color: #1E40AF; }
    .OUT_FOR_DELIVERY { background: #E0E7FF; color: #3730A3; }
    .DELIVERED { background: #D1FAE5; color: #065F46; }
    .FAILED { background: #FEE2E2; color: #991B1B; }
    .RETURNED { background: #F3F4F6; color: #4B5563; }
    .detail-row { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--trackora-border); }
    .detail-row:last-child { border-bottom: none; }
    .label { color: var(--trackora-text-secondary); font-size: 0.875rem; }
    .value { font-weight: 600; }
    .timeline h3 { margin-bottom: 1rem; }
    .timeline-list { position: relative; }
    .timeline-item { display: flex; gap: 1rem; padding-bottom: 1.5rem; position: relative; }
    .timeline-item:not(.last)::before {
      content: '';
      position: absolute;
      left: 11px;
      top: 24px;
      bottom: 0;
      width: 2px;
      background: var(--trackora-border);
    }
    .timeline-marker { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
    .timeline-marker.PENDING { background: #FEF3C7; border: 2px solid #92400E; }
    .timeline-marker.CONFIRMED { background: #DBEAFE; border: 2px solid #1E40AF; }
    .timeline-marker.OUT_FOR_DELIVERY { background: #E0E7FF; border: 2px solid #3730A3; }
    .timeline-marker.DELIVERED { background: #D1FAE5; border: 2px solid #065F46; }
    .timeline-marker.FAILED { background: #FEE2E2; border: 2px solid #991B1B; }
    .timeline-marker.RETURNED { background: #F3F4F6; border: 2px solid #4B5563; }
    .timeline-content { flex: 1; }
    .timeline-status { font-weight: 600; margin-bottom: 0.25rem; }
    .timeline-time { font-size: 0.875rem; color: var(--trackora-text-secondary); }
    .timeline-actor { font-size: 0.875rem; color: var(--trackora-text-secondary); }
    .timeline-notes { font-size: 0.875rem; color: var(--trackora-text-secondary); margin-top: 0.25rem; font-style: italic; }
  `],
})
export class TrackingPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly repo = inject(ShipmentRepository);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly shipment = signal<Shipment | null>(null);
  readonly timeline = signal<TimelineEvent[]>([]);

  searchForm = this.fb.group({
    trackingNumber: ['', Validators.required],
  });

  ngOnInit(): void {
    const trackingNumber = this.route.snapshot.paramMap.get('trackingNumber');
    if (trackingNumber) {
      this.searchForm.patchValue({ trackingNumber });
      this.loadTracking(trackingNumber);
    }
  }

  onSearch(): void {
    if (this.searchForm.invalid) return;
    const trackingNumber = this.searchForm.value.trackingNumber!;
    this.loadTracking(trackingNumber);
  }

  private async loadTracking(trackingNumber: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.shipment.set(null);
    this.timeline.set([]);

    try {
      const shipment = await firstValueFrom(this.repo.findByTrackingNumber(trackingNumber));
      this.shipment.set(shipment);
      const timeline = await firstValueFrom(this.repo.getTimeline(shipment.id));
      this.timeline.set(timeline);
    } catch (err: any) {
      this.error.set(err.message ?? 'Shipment not found. Please check your tracking number and try again.');
    } finally {
      this.loading.set(false);
    }
  }

  trackByEventId(_index: number, event: TimelineEvent): string {
    return event.id;
  }
}
