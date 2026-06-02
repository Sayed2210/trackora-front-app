import { AbstractControl, ValidationErrors } from '@angular/forms';
import { PLAN_FEATURE_ENTITLEMENTS, PlanFeatureEntitlement, PlanPayload, PlatformPlan } from '../../domain/models/platform-plan.models';

export const ENTITLEMENT_LABELS: Record<PlanFeatureEntitlement, string> = {
  smart_dispatch: 'Smart dispatch',
  fraud_detection: 'Fraud detection',
  cod_wallet: 'COD wallet',
  bulk_upload: 'Bulk upload',
  whatsapp_notifications: 'WhatsApp notifications',
  api_access: 'API access',
  public_tracking: 'Public tracking',
  advanced_reports: 'Advanced reports',
};

export const ENTITLEMENTS = PLAN_FEATURE_ENTITLEMENTS.map((key) => ({ key, label: ENTITLEMENT_LABELS[key] }));

export const positiveDecimalValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = Number(control.value);
  return Number.isFinite(value) && value >= 0 ? null : { positiveDecimal: true };
};

export const optionalPositiveDecimalValidator = (control: AbstractControl): ValidationErrors | null => {
  if (control.value === null || control.value === undefined || control.value === '') {
    return null;
  }
  const value = Number(control.value);
  return Number.isFinite(value) && value >= 0 ? null : { positiveDecimal: true };
};

export const zeroOrPositiveIntegerValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = Number(control.value);
  return Number.isInteger(value) && value >= 0 ? null : { zeroOrPositiveInteger: true };
};

export const positiveLimitValidator = (control: AbstractControl): ValidationErrors | null => {
  if (control.value === null || control.value === undefined || control.value === '') {
    return null;
  }
  const value = Number(control.value);
  return Number.isInteger(value) && value > 0 ? null : { positiveLimit: true };
};

export const payloadFromRaw = (raw: Record<string, unknown>, entitlements: PlanFeatureEntitlement[]): PlanPayload => ({
  name: String(raw['name'] ?? '').trim(),
  code: String(raw['code'] ?? '').trim() || undefined,
  description: String(raw['description'] ?? '').trim() || undefined,
  price: Number(raw['price'] ?? 0),
  yearlyPrice: normalizeNullableNumber(raw['yearlyPrice']),
  currency: String(raw['currency'] ?? 'EGP').trim().toUpperCase(),
  billingCycle: String(raw['billingCycle'] ?? 'monthly'),
  limits: {
    monthlyShipments: normalizeLimit(raw['monthlyShipments']),
    maxAdmins: normalizeLimit(raw['maxAdmins']),
    maxMerchants: normalizeLimit(raw['maxMerchants']),
    maxCouriers: normalizeLimit(raw['maxCouriers']),
  },
  entitlements,
  active: Boolean(raw['active']),
  isPublic: Boolean(raw['isPublic']),
  isPopular: Boolean(raw['isPopular']),
  sortOrder: Number(raw['sortOrder'] ?? 0),
});

export const formatLimit = (value: number | null): string => (value === null ? 'Unlimited' : new Intl.NumberFormat('en').format(value));

export const formatMoney = (plan: PlatformPlan): string =>
  formatAmount(plan.price, plan.currency);

export const formatYearlyMoney = (plan: PlatformPlan): string =>
  plan.yearlyPrice === null ? 'Not set' : formatAmount(plan.yearlyPrice, plan.currency);

const formatAmount = (amount: number, currency: string): string =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: currency || 'EGP',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);

export const normalizeLimit = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

export const normalizeNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};
