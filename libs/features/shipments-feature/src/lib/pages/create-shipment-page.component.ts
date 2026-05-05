import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ShipmentRepository } from '@trackora/shared/data-access';
import { ShipmentType } from '@trackora/shared/domain';
import { isValidEgyptianPhone } from '@trackora/shared/utils';

@Component({
  selector: 'app-create-shipment-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="create-shipment">
      <h1>{{ 'shipments.createTitle' | translate }}</h1>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
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
        <button type="submit" class="p-button p-button-primary" [disabled]="form.invalid">{{ 'common.save' | translate }}</button>
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
export class CreateShipmentPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly repo = inject(ShipmentRepository);
  private readonly router = inject(Router);
  readonly types = Object.values(ShipmentType);

  form = this.fb.group({
    customerName: ['', Validators.required],
    customerPhone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
    type: [ShipmentType.COD, Validators.required],
    codAmount: [0],
    governorate: ['', Validators.required],
    city: ['', Validators.required],
    street: ['', Validators.required],
    building: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    this.repo.create({
      customerName: val.customerName!,
      customerPhone: val.customerPhone!,
      type: val.type as ShipmentType,
      codAmount: val.codAmount || undefined,
      deliveryFee: 0,
      address: {
        governorate: val.governorate!,
        city: val.city!,
        street: val.street!,
        building: val.building!,
      },
    }).subscribe({
      next: () => this.router.navigate(['/shipments']),
    });
  }
}
