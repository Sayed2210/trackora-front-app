export interface TenantDto {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  email?: string;
  ownerEmail?: string;
  status?: string;
  planName?: string;
  plan?: { id?: string; name?: string } | string;
  subscriptionStatus?: string;
  subscription?: { status?: string; planName?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantListResponseDto {
  items?: TenantDto[];
  data?: TenantDto[];
  tenants?: TenantDto[];
  total?: number;
  page?: number;
  pageSize?: number;
  limit?: number;
}

export interface TenantMutationDto {
  name: string;
  slug: string;
  email: string;
  planId?: string;
}

export interface TenantStatusDto {
  status: string;
  reason: string;
}

export interface TenantUsageDto {
  users?: number;
  userCount?: number;
  merchants?: number;
  merchantCount?: number;
  couriers?: number;
  courierCount?: number;
  shipments?: number;
  shipmentCount?: number;
  currentMonthShipments?: number;
}

export interface TenantUserDto {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  roles?: string[];
  status?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface TenantBillingDto {
  planName?: string;
  subscriptionStatus?: string;
  billingEmail?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  amountDue?: number;
  currency?: string;
}

export interface TenantFeatureFlagDto {
  key?: string;
  name?: string;
  enabled?: boolean;
  source?: string;
}
