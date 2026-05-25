import {
  PLAN_FEATURE_ENTITLEMENTS,
  PlanFeatureEntitlement,
  PlanPayload,
  PlansPage,
  PlatformPlan,
} from '../../domain/models/platform-plan.models';
import {
  PlatformPlanDto,
  PlatformPlanPayloadDto,
  PlatformPlansListDto,
} from '../dtos/platform-plans.dtos';

export const mapPlatformPlan = (dto: PlatformPlanDto): PlatformPlan => {
  const limits = readObject(dto.limits);
  const archived = readBoolean(dto.archived ?? dto.isArchived ?? dto.is_archived, false);
  const active = readBoolean(dto.active ?? dto.isActive ?? dto.is_active, !archived);

  return {
    id: readString(dto.id ?? dto._id),
    name: readString(dto.name, 'Untitled plan'),
    code: readString(dto.code ?? dto.slug),
    description: readString(dto.description),
    price: readNumber(dto.price ?? dto.amount),
    currency: readString(dto.currency, 'EGP').toUpperCase(),
    billingCycle: readString(dto.billingCycle ?? dto.billing_cycle, 'monthly'),
    limits: {
      monthlyShipments: readNullableNumber(
        limits['monthlyShipments'] ??
          limits['monthly_shipments'] ??
          limits['monthlyShipmentsLimit'] ??
          limits['monthly_shipments_limit'] ??
          dto.monthlyShipmentsLimit ??
          dto.monthly_shipments_limit,
      ),
      maxAdmins: readNullableNumber(limits['maxAdmins'] ?? limits['max_admins'] ?? dto.maxAdmins ?? dto.max_admins),
      maxMerchants: readNullableNumber(
        limits['maxMerchants'] ?? limits['max_merchants'] ?? dto.maxMerchants ?? dto.max_merchants,
      ),
      maxCouriers: readNullableNumber(limits['maxCouriers'] ?? limits['max_couriers'] ?? dto.maxCouriers ?? dto.max_couriers),
    },
    entitlements: readEntitlements(
      dto.featureEntitlements ?? dto.feature_entitlements ?? dto.entitlements ?? dto.features,
    ),
    active,
    archived,
    subscriptionCount: readNullableNumber(dto.subscriptionCount ?? dto.subscription_count),
    createdAt: readNullableString(dto.createdAt ?? dto.created_at),
    updatedAt: readNullableString(dto.updatedAt ?? dto.updated_at),
  };
};

export const mapPlatformPlansPage = (dto: PlatformPlansListDto | PlatformPlanDto[]): PlansPage => {
  const source = Array.isArray(dto) ? dto : dto.items ?? dto.data ?? dto.plans;
  const items = Array.isArray(source)
    ? source.map((item) => mapPlatformPlan(readObject(item) as PlatformPlanDto))
    : [];

  return {
    items,
    total: Array.isArray(dto) ? items.length : readNumber(dto.total ?? dto.count, items.length),
    page: Array.isArray(dto) ? 1 : readNumber(dto.page, 1),
    pageSize: Array.isArray(dto) ? items.length : readNumber(dto.pageSize ?? dto.page_size ?? dto.limit, items.length),
  };
};

export const mapPlanPayload = (payload: PlanPayload): PlatformPlanPayloadDto => ({
  name: payload.name.trim(),
  code: payload.code?.trim() || undefined,
  description: payload.description?.trim() || undefined,
  price: payload.price,
  currency: payload.currency.trim().toUpperCase() || 'EGP',
  billingCycle: payload.billingCycle || undefined,
  monthlyShipmentsLimit: payload.limits.monthlyShipments,
  maxAdmins: payload.limits.maxAdmins,
  maxMerchants: payload.limits.maxMerchants,
  maxCouriers: payload.limits.maxCouriers,
  featureEntitlements: payload.entitlements,
  active: payload.active,
});

const readObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const readString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : value === null || value === undefined ? fallback : String(value);

const readNullableString = (value: unknown): string | null => {
  const text = readString(value).trim();
  return text ? text : null;
};

const readNumber = (value: unknown, fallback = 0): number => {
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const readNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '' || value === 'unlimited') {
    return null;
  }

  const numberValue = readNumber(value, Number.NaN);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const readBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'active'].includes(value.toLowerCase());
  }
  return fallback;
};

const readEntitlements = (value: unknown): PlanFeatureEntitlement[] => {
  const entries = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? Object.entries(value)
          .filter(([, enabled]) => Boolean(enabled))
          .map(([key]) => key)
      : [];

  return entries.filter((entry): entry is PlanFeatureEntitlement =>
    PLAN_FEATURE_ENTITLEMENTS.includes(entry as PlanFeatureEntitlement),
  );
};
