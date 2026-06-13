import {
  PLAN_FEATURE_ENTITLEMENTS,
  PlanFeatureEntitlement,
  PlanPayload,
  PlansPage,
  PlatformPlan,
} from '../../domain/models/platform-plan.models';
import {
  CreatePlanPayloadDto,
  PlanFeatureFlagDto,
  PlatformPlanDto,
  PlatformPlansListDto,
  UpdatePlanPayloadDto,
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
    price: readNumber(dto.price ?? dto.monthlyPrice ?? dto.amount),
    yearlyPrice: readNullableNumber(dto.yearlyPrice),
    currency: readString(dto.currency, 'EGP').toUpperCase(),
    billingCycle: readString(dto.billingCycle ?? dto.billing_cycle, 'monthly'),
    limits: {
      monthlyShipments: readNullableNumber(
        limits['monthlyShipments'] ??
          limits['monthly_shipments'] ??
          limits['monthlyShipmentLimit'] ??
          limits['monthly_shipment_limit'] ??
          limits['monthlyShipmentsLimit'] ??
          limits['monthly_shipments_limit'] ??
          dto.monthlyShipments ??
          dto.monthly_shipments ??
          dto.monthlyShipmentLimit ??
          dto.monthly_shipment_limit ??
          dto.monthlyShipmentsLimit ??
          dto.monthly_shipments_limit,
      ),
      maxAdmins: readNullableNumber(
        limits['maxAdmins'] ??
          limits['max_admins'] ??
          limits['adminUserLimit'] ??
          limits['admin_user_limit'] ??
          dto.adminUserLimit ??
          dto.admin_user_limit ??
          dto.maxAdmins ??
          dto.max_admins,
      ),
      maxMerchants: readNullableNumber(
        limits['maxMerchants'] ??
          limits['max_merchants'] ??
          limits['merchantLimit'] ??
          limits['merchant_limit'] ??
          dto.merchantLimit ??
          dto.merchant_limit ??
          dto.maxMerchants ??
          dto.max_merchants,
      ),
      maxCouriers: readNullableNumber(
        limits['maxCouriers'] ??
          limits['max_couriers'] ??
          limits['courierLimit'] ??
          limits['courier_limit'] ??
          dto.courierLimit ??
          dto.courier_limit ??
          dto.maxCouriers ??
          dto.max_couriers,
      ),
    },
    entitlements: readEntitlements(
      dto.featureEntitlements ?? dto.feature_entitlements ?? dto.entitlements ?? dto.features,
    ),
    active,
    isPublic: readBoolean(dto.isPublic, false),
    isPopular: readBoolean(dto.isPopular, false),
    sortOrder: readNumber(dto.sortOrder, 0),
    archived,
    subscriptionCount: readNullableNumber(dto.subscriptionCount ?? dto.subscription_count),
    createdAt: readNullableString(dto.createdAt ?? dto.created_at),
    updatedAt: readNullableString(dto.updatedAt ?? dto.updated_at),
  };
};

export const mapPlatformPlansPage = (dto: PlatformPlansListDto | PlatformPlanDto[]): PlansPage => {
  const isArray = Array.isArray(dto);
  const source = isArray ? dto : (dto as PlatformPlansListDto).items ?? (dto as PlatformPlansListDto).data ?? (dto as PlatformPlansListDto).plans;
  const items = Array.isArray(source)
    ? source.map((item) => mapPlatformPlan(readObject(item) as PlatformPlanDto))
    : [];

  const resp = isArray ? undefined : dto as PlatformPlansListDto;
  const meta = resp?.meta;

  const total = meta?.total ?? readNumber(resp?.total ?? resp?.count, items.length);
  const itemsPerPage = meta?.limit ?? readNumber(resp?.pageSize ?? resp?.page_size ?? resp?.limit, items.length);

  return {
    items,
    total,
    page: meta?.page ?? readNumber(resp?.page, 1),
    limit: itemsPerPage,
    totalPages: meta?.totalPages ?? Math.max(1, Math.ceil(total / itemsPerPage)),
  };
};

export const mapCreatePlanPayload = (payload: PlanPayload): CreatePlanPayloadDto => ({
  name: payload.name.trim(),
  slug: payload.code?.trim() || payload.name.trim().toLowerCase().replace(/\s+/g, '-'),
  description: payload.description?.trim() || undefined,
  monthlyPrice: String(payload.price),
  currency: payload.currency.trim().toUpperCase() || 'EGP',
  yearlyPrice: payload.yearlyPrice != null ? String(payload.yearlyPrice) : null,
  monthlyShipmentLimit: payload.limits.monthlyShipments,
  adminUserLimit: payload.limits.maxAdmins,
  merchantLimit: payload.limits.maxMerchants,
  courierLimit: payload.limits.maxCouriers,
  isPublic: payload.isPublic,
  isPopular: payload.isPopular,
  sortOrder: payload.sortOrder,
  featureEntitlements: toFeatureFlags(payload.entitlements),
});

export const mapUpdatePlanPayload = (payload: PlanPayload): UpdatePlanPayloadDto => ({
  name: payload.name.trim(),
  slug: payload.code?.trim() || undefined,
  description: payload.description?.trim() || undefined,
  monthlyPrice: String(payload.price),
  currency: payload.currency.trim().toUpperCase() || undefined,
  yearlyPrice: payload.yearlyPrice != null ? String(payload.yearlyPrice) : null,
  monthlyShipmentLimit: payload.limits.monthlyShipments,
  adminUserLimit: payload.limits.maxAdmins,
  merchantLimit: payload.limits.maxMerchants,
  courierLimit: payload.limits.maxCouriers,
  isPublic: payload.isPublic,
  isPopular: payload.isPopular,
  sortOrder: payload.sortOrder,
  isActive: payload.active,
  featureEntitlements: toFeatureFlags(payload.entitlements),
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
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object') {
          const obj = entry as Record<string, unknown>;
          if (typeof obj['key'] === 'string' && obj['enabled'] === true) return obj['key'];
          if (typeof obj['key'] === 'string' && obj['enabled'] === undefined) return obj['key'];
        }
        return null;
      })
      .filter((entry): entry is string => entry !== null)
      .filter((entry): entry is PlanFeatureEntitlement =>
        PLAN_FEATURE_ENTITLEMENTS.includes(entry as PlanFeatureEntitlement),
      );
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key)
      .filter((entry): entry is PlanFeatureEntitlement =>
        PLAN_FEATURE_ENTITLEMENTS.includes(entry as PlanFeatureEntitlement),
      );
  }

  return [];
};

const toFeatureFlags = (entitlements: PlanFeatureEntitlement[]): PlanFeatureFlagDto[] =>
  PLAN_FEATURE_ENTITLEMENTS.map((key) => ({
    key,
    enabled: entitlements.includes(key),
  }));
