import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PLAN_FEATURE_ENTITLEMENTS, PlanFeatureEntitlement, PlanPayload, PlatformPlan } from '../../domain/models/platform-plan.models';
import {
  ENTITLEMENTS,
  optionalPositiveDecimalValidator,
  payloadFromRaw,
  positiveDecimalValidator,
  positiveLimitValidator,
  zeroOrPositiveIntegerValidator,
} from './plan-ui.helpers';

type PlanForm = FormGroup<{
  name: FormControl<string>;
  code: FormControl<string>;
  description: FormControl<string>;
  price: FormControl<number>;
  yearlyPrice: FormControl<number | null>;
  currency: FormControl<string>;
  billingCycle: FormControl<string>;
  monthlyShipments: FormControl<number | null>;
  maxAdmins: FormControl<number | null>;
  maxMerchants: FormControl<number | null>;
  maxCouriers: FormControl<number | null>;
  active: FormControl<boolean>;
  isPublic: FormControl<boolean>;
  isPopular: FormControl<boolean>;
  sortOrder: FormControl<number>;
}>;

@Component({
  selector: 'app-plan-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form class="plan-form" [formGroup]="form" (ngSubmit)="submit()">
      <div class="plan-form__grid">
        <label>
          <span>Name *</span>
          <input formControlName="name" autocomplete="off" />
          @if (submitted && form.controls.name.invalid) { <small>Name is required.</small> }
        </label>
        <label>
          <span>Code / slug</span>
          <input formControlName="code" autocomplete="off" />
        </label>
        <label>
          <span>Price *</span>
          <input formControlName="price" type="number" min="0" step="0.01" />
          @if (submitted && form.controls.price.invalid) { <small>Price must be zero or a positive decimal.</small> }
        </label>
        <label>
          <span>Yearly price</span>
          <input formControlName="yearlyPrice" type="number" min="0" step="0.01" />
          @if (submitted && form.controls.yearlyPrice.invalid) { <small>Yearly price must be blank, zero, or a positive decimal.</small> }
        </label>
        <label>
          <span>Currency</span>
          <input formControlName="currency" maxlength="3" />
        </label>
        <label>
          <span>Billing cycle</span>
          <select formControlName="billingCycle">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="quarterly">Quarterly</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label class="plan-form__toggle">
          <input formControlName="active" type="checkbox" />
          <span>Active plan</span>
        </label>
      </div>

      <fieldset>
        <legend>Website pricing</legend>
        <p>Controls how this source-of-truth plan appears on the public pricing website.</p>
        <div class="plan-form__grid">
          <label class="plan-form__toggle">
            <input formControlName="isPublic" type="checkbox" />
            <span>Public on website</span>
          </label>
          <label class="plan-form__toggle">
            <input formControlName="isPopular" type="checkbox" />
            <span>Popular badge</span>
          </label>
          <label>
            <span>Sort order</span>
            <input formControlName="sortOrder" type="number" min="0" step="1" />
            @if (submitted && form.controls.sortOrder.invalid) { <small>Sort order must be zero or a positive whole number.</small> }
          </label>
        </div>
        @if (popularPrivateWarning()) { <small class="plan-form__warning">Popular badge is enabled, but this plan is not public on the website.</small> }
      </fieldset>

      <label>
        <span>Description</span>
        <textarea formControlName="description" rows="3"></textarea>
      </label>

      <fieldset>
        <legend>Limits</legend>
        <p>Leave a limit blank for unlimited.</p>
        <div class="plan-form__grid">
          <label>
            <span>Monthly shipments</span>
            <input formControlName="monthlyShipments" type="number" min="1" step="1" />
          </label>
          <label>
            <span>Max admins</span>
            <input formControlName="maxAdmins" type="number" min="1" step="1" />
          </label>
          <label>
            <span>Max merchants</span>
            <input formControlName="maxMerchants" type="number" min="1" step="1" />
          </label>
          <label>
            <span>Max couriers</span>
            <input formControlName="maxCouriers" type="number" min="1" step="1" />
          </label>
        </div>
        @if (submitted && limitsInvalid()) { <small>Limits must be positive whole numbers or blank for unlimited.</small> }
      </fieldset>

      <fieldset>
        <legend>Feature entitlements</legend>
        <div class="plan-form__entitlements">
          @for (feature of entitlements; track feature.key) {
            <label class="plan-form__check">
              <input type="checkbox" [checked]="selectedEntitlements.includes(feature.key)" (change)="toggleEntitlement(feature.key)" />
              <span>{{ feature.label }}</span>
            </label>
          }
        </div>
      </fieldset>

      <div class="plan-form__actions">
        <button type="submit" [disabled]="saving">{{ saving ? 'Saving...' : submitLabel }}</button>
      </div>
    </form>
  `,
  styles: [
    `
      .plan-form { display: grid; gap: 1rem; }
      .plan-form__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.9rem; }
      label, fieldset { display: grid; gap: 0.45rem; }
      fieldset { padding: 1rem; border: 1px solid var(--trackora-border); border-radius: 1rem; }
      legend, label span { color: var(--trackora-primary); font-weight: 900; }
      fieldset p { margin: 0; color: var(--trackora-text-secondary); }
      input, select, textarea { inline-size: 100%; box-sizing: border-box; padding: 0.75rem; color: var(--trackora-text); background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.8rem; }
      textarea { resize: vertical; }
      small { color: var(--trackora-danger); }
      .plan-form__warning { color: var(--trackora-warning); }
      .plan-form__toggle, .plan-form__check { display: flex; align-items: center; gap: 0.55rem; }
      .plan-form__toggle input, .plan-form__check input { inline-size: auto; }
      .plan-form__entitlements { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
      .plan-form__actions { display: flex; justify-content: flex-end; }
      button { padding-block: 0.75rem; padding-inline: 1.1rem; color: var(--trackora-primary-contrast); background: var(--trackora-primary); border: 1px solid var(--trackora-primary); border-radius: 0.8rem; cursor: pointer; font-weight: 900; }
      button:disabled { cursor: not-allowed; opacity: 0.6; }
      @media (max-width: 760px) { .plan-form__grid, .plan-form__entitlements { grid-template-columns: 1fr; } }
    `,
  ],
})
export class PlanFormComponent implements OnChanges {
  @Input() plan: PlatformPlan | null = null;
  @Input() saving = false;
  @Input() submitLabel = 'Save plan';
  @Output() formSubmit = new EventEmitter<PlanPayload>();

  readonly entitlements = ENTITLEMENTS;
  selectedEntitlements: PlanFeatureEntitlement[] = [];
  submitted = false;

  readonly form: PlanForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    code: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    price: new FormControl(0, { nonNullable: true, validators: [Validators.required, positiveDecimalValidator] }),
    yearlyPrice: new FormControl<number | null>(null, { validators: [optionalPositiveDecimalValidator] }),
    currency: new FormControl('EGP', { nonNullable: true, validators: [Validators.required] }),
    billingCycle: new FormControl('monthly', { nonNullable: true }),
    monthlyShipments: new FormControl<number | null>(null, { validators: [positiveLimitValidator] }),
    maxAdmins: new FormControl<number | null>(null, { validators: [positiveLimitValidator] }),
    maxMerchants: new FormControl<number | null>(null, { validators: [positiveLimitValidator] }),
    maxCouriers: new FormControl<number | null>(null, { validators: [positiveLimitValidator] }),
    active: new FormControl(true, { nonNullable: true }),
    isPublic: new FormControl(false, { nonNullable: true }),
    isPopular: new FormControl(false, { nonNullable: true }),
    sortOrder: new FormControl(0, { nonNullable: true, validators: [zeroOrPositiveIntegerValidator] }),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['plan'] && this.plan) {
      this.form.patchValue({
        name: this.plan.name,
        code: this.plan.code,
        description: this.plan.description,
        price: this.plan.price,
        yearlyPrice: this.plan.yearlyPrice,
        currency: this.plan.currency,
        billingCycle: this.plan.billingCycle,
        monthlyShipments: this.plan.limits.monthlyShipments,
        maxAdmins: this.plan.limits.maxAdmins,
        maxMerchants: this.plan.limits.maxMerchants,
        maxCouriers: this.plan.limits.maxCouriers,
        active: this.plan.active,
        isPublic: this.plan.isPublic,
        isPopular: this.plan.isPopular,
        sortOrder: this.plan.sortOrder,
      });
      this.selectedEntitlements = this.plan.entitlements.filter((key) => PLAN_FEATURE_ENTITLEMENTS.includes(key));
    }
  }

  toggleEntitlement(key: PlanFeatureEntitlement): void {
    this.selectedEntitlements = this.selectedEntitlements.includes(key)
      ? this.selectedEntitlements.filter((item) => item !== key)
      : [...this.selectedEntitlements, key];
  }

  limitsInvalid(): boolean {
    return ['monthlyShipments', 'maxAdmins', 'maxMerchants', 'maxCouriers'].some((key) => this.form.get(key)?.invalid);
  }

  popularPrivateWarning(): boolean {
    return this.form.controls.isPopular.value && !this.form.controls.isPublic.value;
  }

  submit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.formSubmit.emit(payloadFromRaw(this.form.getRawValue(), this.selectedEntitlements));
  }
}
