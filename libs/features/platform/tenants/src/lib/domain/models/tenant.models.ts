export type TenantStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'PAST_DUE';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  status: TenantStatus;
  planName?: string;
  subscriptionStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  plan?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'name' | 'slug' | 'email' | 'status' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

export interface TenantListResult {
  items: Tenant[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TenantMutationInput {
  name: string;
  slug: string;
  email: string;
  planId?: string;
}

export interface TenantUsage {
  users: number;
  merchants: number;
  couriers: number;
  shipments: number;
  currentMonthShipments?: number;
}

export interface TenantUserSummary {
  id: string;
  name: string;
  email?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

export interface TenantBillingSummary {
  planName?: string;
  subscriptionStatus?: string;
  billingEmail?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  amountDue?: number;
  currency?: string;
}

export interface TenantFeatureFlagSummary {
  key: string;
  name: string;
  enabled: boolean;
  source?: string;
}

export interface TenantState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
