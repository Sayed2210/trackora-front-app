export type SupportTenantStatus =
  | 'ACTIVE'
  | 'TRIAL'
  | 'PAST_DUE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'UNKNOWN';

export interface SupportTenantSummary {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  status: SupportTenantStatus;
  planName: string;
  subscriptionStatus: string;
  paymentStatus: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SupportTenantSearchQuery {
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface SupportTenantSearchPage {
  items: SupportTenantSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SupportHealthMetric {
  label: string;
  value: string;
  status: string;
}

export interface SupportAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'danger' | 'success' | 'neutral';
  createdAt: string | null;
}

export interface TenantHealth {
  tenant: SupportTenantSummary;
  subscriptionStatus: string;
  paymentStatus: string;
  usageWarnings: SupportHealthMetric[];
  featureFlags: SupportHealthMetric[];
  recentAlerts: SupportAlert[];
  metadata: SupportHealthMetric[];
}

export interface ImpersonationContextView {
  active: boolean;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  startedAt: string | null;
}

export interface StartImpersonationResult {
  accessToken?: string;
  refreshToken?: string;
  impersonationContext: ImpersonationContextView | null;
}

export interface SupportState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success?: string | null;
}
