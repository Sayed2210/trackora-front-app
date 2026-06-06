import {
  CancelSubscriptionPayload,
  ChangePlanPayload,
  PlatformSubscription,
  RenewSubscriptionPayload,
  SubscriptionUpdatePayload,
  SubscriptionsPage,
} from '../../domain/models/subscription.models';
import {
  CancelSubscriptionPayloadDto,
  ChangePlanPayloadDto,
  PlatformSubscriptionDto,
  PlatformSubscriptionsListDto,
  RenewSubscriptionPayloadDto,
  SubscriptionUpdatePayloadDto,
} from '../dtos/subscription.dtos';

export const mapPlatformSubscription = (dto: PlatformSubscriptionDto): PlatformSubscription => {
  const tenant = readObject(dto.tenant);
  const plan = readObject(dto.plan);

  return {
    id: readString(dto.id ?? dto._id),
    tenant: {
      id: readString(tenant['id'] ?? tenant['_id'] ?? dto.tenantId ?? dto.tenant_id),
      name: readString(tenant['name'] ?? dto.tenantName ?? dto.tenant_name, 'Unknown tenant'),
      slug: readString(tenant['slug'] ?? dto.tenantSlug ?? dto.tenant_slug),
    },
    plan: {
      id: readString(plan['id'] ?? plan['_id'] ?? dto.planId ?? dto.plan_id),
      name: readString(plan['name'] ?? dto.planName ?? dto.plan_name, 'Unknown plan'),
      code: readString(plan['code'] ?? plan['slug'] ?? dto.planCode ?? dto.plan_code),
      billingCycle: readString(plan['billingCycle'] ?? plan['billing_cycle'] ?? dto.billingCycle ?? dto.billing_cycle),
      price: readNullableNumber(plan['price'] ?? plan['amount']),
      currency: readString(plan['currency'], 'EGP').toUpperCase(),
    },
    status: readString(dto.status, 'ACTIVE'),
    paymentStatus: readString(dto.paymentStatus ?? dto.payment_status, 'NOT_REQUIRED'),
    billingCycle: readNullableString(dto.billingCycle ?? dto.billing_cycle),
    trialStartedAt: readNullableString(dto.trialStartedAt ?? dto.trial_started_at),
    trialEndsAt: readNullableString(dto.trialEndsAt ?? dto.trial_ends_at),
    currentPeriodStart: readNullableString(dto.currentPeriodStart ?? dto.current_period_start),
    currentPeriodEnd: readNullableString(dto.currentPeriodEnd ?? dto.current_period_end),
    renewalDate: readNullableString(dto.renewalDate ?? dto.renewal_date),
    usage: mapUsage(dto.usage ?? dto.limitsUsage ?? dto.limits_usage),
    notes: readString(dto.notes),
    metadata: readObject(dto.metadata),
    createdAt: readNullableString(dto.createdAt ?? dto.created_at),
    updatedAt: readNullableString(dto.updatedAt ?? dto.updated_at),
  };
};

export const mapPlatformSubscriptionsPage = (dto: PlatformSubscriptionsListDto | PlatformSubscriptionDto[]): SubscriptionsPage => {
  const source = Array.isArray(dto) ? dto : dto.items ?? dto.data ?? dto.subscriptions;
  const items = Array.isArray(source)
    ? source.map((item) => mapPlatformSubscription(readObject(item) as PlatformSubscriptionDto))
    : [];

  return {
    items,
    total: Array.isArray(dto) ? items.length : readNumber(dto.total ?? dto.count, items.length),
    page: Array.isArray(dto) ? 1 : readNumber(dto.page, 1),
    pageSize: Array.isArray(dto) ? items.length : readNumber(dto.pageSize ?? dto.page_size ?? dto.limit, items.length || 20),
  };
};

export const mapSubscriptionUpdatePayload = (payload: SubscriptionUpdatePayload): SubscriptionUpdatePayloadDto => cleanPayload({
  status: cleanString(payload.status),
  paymentStatus: cleanString(payload.paymentStatus),
  trialStartedAt: payload.trialStartedAt ?? undefined,
  trialEndsAt: payload.trialEndsAt ?? undefined,
  currentPeriodStart: payload.currentPeriodStart ?? undefined,
  currentPeriodEnd: payload.currentPeriodEnd ?? undefined,
  renewalDate: payload.renewalDate ?? undefined,
  notes: cleanString(payload.notes),
  metadata: payload.metadata,
  reason: cleanString(payload.reason),
});

export const mapChangePlanPayload = (payload: ChangePlanPayload): ChangePlanPayloadDto => ({
  planId: payload.planId.trim(),
  reason: payload.reason.trim(),
});

export const mapCancelPayload = (payload: CancelSubscriptionPayload): CancelSubscriptionPayloadDto => ({ reason: payload.reason.trim() });

export const mapRenewPayload = (payload: RenewSubscriptionPayload): RenewSubscriptionPayloadDto => cleanPayload({
  reason: payload.reason.trim(),
  currentPeriodStart: payload.currentPeriodStart ?? undefined,
  currentPeriodEnd: payload.currentPeriodEnd ?? undefined,
  renewalDate: payload.renewalDate ?? undefined,
});

const mapUsage = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((entry) => {
      const item = readObject(entry);
      const key = readString(item['key'] ?? item['name'] ?? item['metric']);
      return {
        key,
        label: readString(item['label'], humanize(key)),
        used: readNullableNumber(item['used'] ?? item['value'] ?? item['current']),
        limit: readNullableNumber(item['limit'] ?? item['max']),
      };
    });
  }

  const object = readObject(value);
  return Object.entries(object).map(([key, raw]) => {
    const item = readObject(raw);
    return {
      key,
      label: humanize(key),
      used: readNullableNumber(item['used'] ?? item['value'] ?? raw),
      limit: readNullableNumber(item['limit'] ?? item['max']),
    };
  });
};

const cleanPayload = <T extends Record<string, unknown>>(payload: T): T =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')) as T;

const cleanString = (value: unknown): string | undefined => {
  const text = readString(value).trim();
  return text || undefined;
};

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

const humanize = (value: string): string =>
  value.replace(/[_-]/g, ' ').replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
