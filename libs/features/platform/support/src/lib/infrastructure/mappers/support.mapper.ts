import {
  ImpersonationContextView,
  StartImpersonationResult,
  SupportAlert,
  SupportHealthMetric,
  SupportTenantSearchPage,
  SupportTenantStatus,
  SupportTenantSummary,
  TenantHealth,
} from '../../domain/models/support.models';
import {
  ImpersonationResponseDto,
  SupportTenantDto,
  SupportTenantSearchDto,
  TenantHealthDto,
} from '../dtos/support.dtos';

export const mapTenantSearchPage = (
  dto: SupportTenantSearchDto<SupportTenantDto> | SupportTenantDto[],
): SupportTenantSearchPage => {
  const list = Array.isArray(dto)
    ? dto
    : (dto.items ?? dto.data ?? dto.results ?? dto.tenants);
  const items = Array.isArray(list)
    ? list.map((item) => mapTenantSummary(readObject(item) as SupportTenantDto))
    : [];
  const meta = Array.isArray(dto) ? {} : readObject(dto.meta);

  return {
    items,
    total: Array.isArray(dto)
      ? items.length
      : readNumber(meta['total'] ?? dto.total ?? dto.count, items.length),
    page: Array.isArray(dto) ? 1 : readNumber(meta['page'] ?? dto.page, 1),
    pageSize: Array.isArray(dto)
      ? items.length
      : readNumber(
          meta['limit'] ??
            meta['pageSize'] ??
            dto.limit ??
            dto.pageSize ??
            dto.page_size,
          items.length || 20,
        ),
  };
};

export const mapTenantHealth = (dto: TenantHealthDto): TenantHealth => {
  const tenantDto = readObject(dto.tenant ?? dto.summary) as SupportTenantDto;
  const subscription = readObject(dto.subscription);
  const billing = readObject(dto.billing);

  return {
    tenant: mapTenantSummary({
      ...tenantDto,
      status: tenantDto.status ?? dto.status,
    }),
    subscriptionStatus: readString(
      dto.subscriptionStatus ??
        dto.subscription_status ??
        subscription['status'],
      'Not returned',
    ),
    paymentStatus: readString(
      dto.paymentStatus ??
        dto.payment_status ??
        billing['paymentStatus'] ??
        billing['payment_status'],
      'Not returned',
    ),
    usageWarnings: mapMetrics(
      dto.usageWarnings ?? dto.usage_warnings ?? dto.warnings,
    ),
    featureFlags: mapMetrics(
      dto.featureFlags ?? dto.feature_flags ?? dto.flags,
    ),
    recentAlerts: mapAlerts(
      dto.alerts ?? dto.recentErrors ?? dto.recent_errors,
    ),
    metadata: mapMetrics(
      dto.supportMetadata ?? dto.support_metadata ?? dto.metadata,
    ),
  };
};

export const mapImpersonationContext = (
  value: unknown,
): ImpersonationContextView | null => {
  const context = readObject(value);
  if (Object.keys(context).length === 0) return null;
  const tenant = readObject(context['tenant']);
  const user = readObject(context['user'] ?? context['impersonatedUser']);
  const tenantId = readString(
    context['tenantId'] ??
      context['tenant_id'] ??
      tenant['id'] ??
      tenant['_id'],
  );

  return {
    active: readBoolean(context['active'], true),
    tenantId,
    tenantName: readString(
      context['tenantName'] ?? context['tenant_name'] ?? tenant['name'],
    ),
    userId: readString(
      context['userId'] ?? context['user_id'] ?? user['id'] ?? user['_id'],
    ),
    userName: readString(
      context['userName'] ?? context['user_name'] ?? user['name'],
    ),
    userEmail: readString(
      context['userEmail'] ?? context['user_email'] ?? user['email'],
    ),
    role: readString(context['role'] ?? user['role'], 'Tenant admin'),
    startedAt: readNullableString(
      context['startedAt'] ??
        context['started_at'] ??
        context['createdAt'] ??
        context['created_at'],
    ),
  };
};

export const mapStartImpersonationResult = (
  dto: ImpersonationResponseDto,
): StartImpersonationResult => ({
  accessToken: readOptionalString(dto.accessToken ?? dto.access_token),
  refreshToken: readOptionalString(dto.refreshToken ?? dto.refresh_token),
  impersonationContext: mapImpersonationContext(
    dto.impersonationContext ?? dto.impersonation_context ?? dto.context,
  ),
});

const mapTenantSummary = (dto: SupportTenantDto): SupportTenantSummary => {
  const plan = readObject(dto.plan);
  const subscription = readObject(dto.subscription);
  const billing = readObject(dto.billing);

  return {
    id: readString(dto.id ?? dto._id),
    name: readString(dto.name, 'Unknown tenant'),
    slug: readString(dto.slug),
    email: readString(dto.email),
    phone: readString(dto.phone),
    status: readTenantStatus(dto.status),
    planName: readString(dto.planName ?? dto.plan_name ?? plan['name']),
    subscriptionStatus: readString(
      dto.subscriptionStatus ??
        dto.subscription_status ??
        subscription['status'],
    ),
    paymentStatus: readString(
      dto.paymentStatus ??
        dto.payment_status ??
        billing['paymentStatus'] ??
        billing['payment_status'],
    ),
    createdAt: readNullableString(dto.createdAt ?? dto.created_at),
    updatedAt: readNullableString(dto.updatedAt ?? dto.updated_at),
  };
};

const mapMetrics = (value: unknown): SupportHealthMetric[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const metric = readObject(item);
    return {
      label: readString(
        metric['label'] ?? metric['name'] ?? metric['key'],
        `Item ${index + 1}`,
      ),
      value: readString(
        metric['value'] ?? metric['message'] ?? metric['status'],
        'Available',
      ),
      status: readString(
        metric['status'] ?? metric['severity'] ?? metric['state'],
        'info',
      ),
    };
  });
};

const mapAlerts = (value: unknown): SupportAlert[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const alert = readObject(item);
    return {
      id: readString(alert['id'] ?? alert['_id'], `alert-${index}`),
      message: readString(
        alert['message'] ?? alert['title'] ?? alert['description'],
        'Alert returned by backend',
      ),
      severity: readSeverity(
        alert['severity'] ?? alert['level'] ?? alert['status'],
      ),
      createdAt: readNullableString(
        alert['createdAt'] ?? alert['created_at'] ?? alert['timestamp'],
      ),
    };
  });
};

const readObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const readString = (value: unknown, fallback = ''): string =>
  typeof value === 'string'
    ? value
    : value === null || value === undefined
      ? fallback
      : String(value);

const readOptionalString = (value: unknown): string | undefined => {
  const text = readString(value).trim();
  return text || undefined;
};

const readNullableString = (value: unknown): string | null => {
  const text = readString(value).trim();
  return text || null;
};

const readNumber = (value: unknown, fallback = 0): number => {
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const readBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const readTenantStatus = (value: unknown): SupportTenantStatus => {
  const status = readString(value).toUpperCase();
  return ['ACTIVE', 'TRIAL', 'PAST_DUE', 'SUSPENDED', 'CANCELLED'].includes(
    status,
  )
    ? (status as SupportTenantStatus)
    : 'UNKNOWN';
};

const readSeverity = (value: unknown): SupportAlert['severity'] => {
  const severity = readString(value).toLowerCase();
  if (['danger', 'error', 'failed', 'failure'].includes(severity))
    return 'danger';
  if (['warning', 'warn'].includes(severity)) return 'warning';
  if (['success', 'ok'].includes(severity)) return 'success';
  if (['info', 'notice'].includes(severity)) return 'info';
  return 'neutral';
};
