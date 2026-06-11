import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ShipmentRepository, ZoneRepository } from '@trackora/shared/data-access';
import { ShipmentType, Zone } from '@trackora/shared/domain';
import { isValidEgyptianPhone } from '@trackora/shared/utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-shipment-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="create-shipment">
      <h1>{{ 'shipments.createTitle' | translate }}</h1>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" data-testid="shipment-create-form">
        <div class="field">
          <label>{{ 'shipments.customerName' | translate }}</label>
          <input formControlName="customerName" />
        </div>
        <div class="field">
          <label>{{ 'shipments.customerPhone' | translate }}</label>
          <input formControlName="customerPhone" />
          <small *ngIf="form.get('customerPhone')?.invalid && form.get('customerPhone')?.touched">Invalid phone</small>
        </div>
        <div class="field">
          <label>Secondary Phone</label>
          <input formControlName="customerPhone2" />
        </div>
        <div class="field">
          <label>Type</label>
          <select formControlName="type">
            <option *ngFor="let t of types" [value]="t">{{ t }}</option>
          </select>
        </div>
        <div class="field">
          <label>COD Amount</label>
          <input type="number" formControlName="codAmount" />
        </div>
        <div class="field">
          <label>Governorate</label>
          <input formControlName="governorate" />
        </div>
        <div class="field">
          <label>City</label>
          <input formControlName="city" />
        </div>
        <div class="field">
          <label>Street</label>
          <input formControlName="street" />
        </div>
        <div class="field">
          <label>Building</label>
          <input formControlName="building" />
        </div>
        <div class="field">
          <label>Address Text</label>
          <input formControlName="addressText" placeholder="Full address description with landmarks" />
        </div>
        <div class="field">
          <label>Zone</label>
          <select formControlName="zoneId">
            <option value="">-- Select Zone --</option>
            <option *ngFor="let zone of zones()" [value]="zone.id">{{ zone.nameAr }} ({{ zone.code }})</option>
          </select>
          <small *ngIf="zonesLoading()">Loading zones...</small>
        </div>
        <div class="field">
          <label>Product Description</label>
          <input formControlName="productDescription" />
        </div>
        <div class="field">
          <label>Product Value</label>
          <input type="number" formControlName="productValue" />
        </div>
        <div class="field">
          <label>Weight (kg)</label>
          <input type="number" formControlName="weight" />
        </div>
        <div class="field">
          <label>Pieces</label>
          <input type="number" formControlName="pieces" />
        </div>
        <div class="field">
          <label>Notes</label>
          <input formControlName="notes" />
        </div>
        <div class="field">
          <label>Preferred Delivery Date</label>
          <input type="date" formControlName="preferredDeliveryDate" />
        </div>
        <button type="submit" class="p-button p-button-primary" [disabled]="form.invalid || submitting()" data-testid="shipment-create-submit">
          {{ submitting() ? 'Saving...' : ('common.save' | translate) }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .create-shipment { padding: 1rem; max-width: 600px; }
    .field { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.25rem; font-weight: 600; }
    input, select { width: 100%; padding: 0.5rem; border: 1px solid var(--trackora-border); border-radius: 4px; }
    button { padding: 0.75rem 1.5rem; background: var(--trackora-primary); color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { opacity: 0.5; }
    small { color: var(--trackora-danger); }
  `],
})
export class CreateShipmentPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly repo = inject(ShipmentRepository);
  private readonly zoneRepo = inject(ZoneRepository);
  private readonly router = inject(Router);
  readonly types = Object.values(ShipmentType);
  readonly zones = signal<Zone[]>([]);
  readonly zonesLoading = signal(false);
  readonly submitting = signal(false);

  form = this.fb.group({
    customerName: ['', Validators.required],
    customerPhone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
    customerPhone2: [''],
    type: [ShipmentType.COD, Validators.required],
    codAmount: [0],
    governorate: ['', Validators.required],
    city: ['', Validators.required],
    street: ['', Validators.required],
    building: ['', Validators.required],
    addressText: ['', Validators.required],
    zoneId: [''],
    productDescription: ['', Validators.required],
    productValue: [0],
    weight: [1],
    pieces: [1],
    notes: [''],
    preferredDeliveryDate: [''],
  });

  async ngOnInit(): Promise<void> {
    this.zonesLoading.set(true);
    try {
      const zonesResult = await firstValueFrom(this.zoneRepo.findAll({ isActive: true }));
      this.zones.set(zonesResult.data);
    } finally {
      this.zonesLoading.set(false);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const val = this.form.value;
    this.repo.create({
      customerName: val.customerName!,
      customerPhone: val.customerPhone!,
      customerPhone2: val.customerPhone2 || undefined,
      type: val.type as ShipmentType,
      codAmount: val.codAmount || undefined,
      address: {
        governorate: val.governorate!,
        city: val.city!,
        street: val.street!,
        building: val.building!,
      },
      addressText: val.addressText!,
      zoneId: val.zoneId || undefined,
      productDescription: val.productDescription!,
      productValue: val.productValue || undefined,
      weight: val.weight || undefined,
      pieces: val.pieces || undefined,
      notes: val.notes || undefined,
      preferredDeliveryDate: val.preferredDeliveryDate || undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/shipments']);
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }
}
