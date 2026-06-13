import {
  Tenant,
  TenantBillingSummary,
  TenantFeatureFlagSummary,
  TenantListResult,
  TenantStatus,
  TenantUsage,
  TenantUserSummary,
} from '../../domain/models/tenant.models';
import {
  TenantBillingDto,
  TenantDto,
  TenantFeatureFlagDto,
  TenantListResponseDto,
  TenantUsageDto,
  TenantUserDto,
} from '../dtos/tenant.dtos';

const STATUSES: TenantStatus[] = ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED', 'PAST_DUE'];

export const mapTenant = (dto: TenantDto): Tenant => {
  const plan = typeof dto.plan === 'string' ? dto.plan : dto.plan?.name;

  return {
    id: dto.id ?? dto._id ?? '',
    name: dto.name ?? 'Unnamed tenant',
    slug: dto.slug ?? '',
    email: dto.email ?? dto.ownerEmail ?? '',
    status: toTenantStatus(dto.status),
    planName: dto.planName ?? plan ?? dto.subscription?.planName,
    subscriptionStatus: dto.subscriptionStatus ?? dto.subscription?.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
};

export const mapTenantList = (dto: TenantListResponseDto | TenantDto[]): TenantListResult => {
  const isArray = Array.isArray(dto);
  const rawItems = isArray ? dto : dto.items ?? dto.data ?? dto.tenants ?? [];
  const resp = isArray ? undefined : dto as TenantListResponseDto;
  const meta = resp?.meta;

  const total = meta?.total ?? resp?.total ?? rawItems.length;
  const itemsPerPage = meta?.limit ?? resp?.pageSize ?? resp?.limit ?? rawItems.length;

  return {
    items: rawItems.map(mapTenant),
    total,
    page: meta?.page ?? resp?.page ?? 1,
    limit: itemsPerPage,
    totalPages: meta?.totalPages ?? Math.max(1, Math.ceil(total / itemsPerPage)),
  };
};

export const mapTenantUsage = (dto: TenantUsageDto): TenantUsage => ({
  users: dto.users ?? dto.userCount ?? 0,
  merchants: dto.merchants ?? dto.merchantCount ?? 0,
  couriers: dto.couriers ?? dto.courierCount ?? 0,
  shipments: dto.shipments ?? dto.shipmentCount ?? 0,
  currentMonthShipments: dto.currentMonthShipments,
});

export const mapTenantUsers = (dto: TenantUserDto[] | { items?: TenantUserDto[]; data?: TenantUserDto[] }): TenantUserSummary[] => {
  const items = Array.isArray(dto) ? dto : dto.items ?? dto.data ?? [];
  return items.map((user) => ({
    id: user.id ?? user._id ?? '',
    name: user.name ?? 'Unnamed user',
    email: user.email,
    role: user.role ?? user.roles?.join(', '),
    status: user.status ?? (user.isActive === false ? 'INACTIVE' : 'ACTIVE'),
    createdAt: user.createdAt,
  }));
};

export const mapTenantBilling = (dto: TenantBillingDto): TenantBillingSummary => ({ ...dto });

export const mapTenantFeatureFlags = (
  dto: TenantFeatureFlagDto[] | { items?: TenantFeatureFlagDto[]; data?: TenantFeatureFlagDto[] },
): TenantFeatureFlagSummary[] => {
  const items = Array.isArray(dto) ? dto : dto.items ?? dto.data ?? [];
  return items.map((flag) => ({
    key: flag.key ?? flag.name ?? '',
    name: flag.name ?? flag.key ?? 'Unnamed flag',
    enabled: flag.enabled === true,
    source: flag.source,
  }));
};

const toTenantStatus = (status: string | undefined): TenantStatus => {
  const normalized = (status ?? 'TRIAL').toUpperCase() as TenantStatus;
  return STATUSES.includes(normalized) ? normalized : 'TRIAL';
};
