export interface SupportTenantSearchDto<T> {
  data?: unknown;
  items?: unknown;
  results?: unknown;
  tenants?: unknown;
  meta?: {
    page?: unknown;
    limit?: unknown;
    pageSize?: unknown;
    total?: unknown;
  };
  total?: unknown;
  count?: unknown;
  page?: unknown;
  limit?: unknown;
  pageSize?: unknown;
  page_size?: unknown;
  _item?: T;
}

export interface SupportTenantDto {
  id?: unknown;
  _id?: unknown;
  name?: unknown;
  slug?: unknown;
  email?: unknown;
  phone?: unknown;
  status?: unknown;
  planName?: unknown;
  plan_name?: unknown;
  plan?: unknown;
  subscriptionStatus?: unknown;
  subscription_status?: unknown;
  subscription?: unknown;
  paymentStatus?: unknown;
  payment_status?: unknown;
  billing?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
}

export interface TenantHealthDto {
  tenant?: unknown;
  summary?: unknown;
  status?: unknown;
  subscriptionStatus?: unknown;
  subscription_status?: unknown;
  subscription?: unknown;
  paymentStatus?: unknown;
  payment_status?: unknown;
  billing?: unknown;
  usageWarnings?: unknown;
  usage_warnings?: unknown;
  warnings?: unknown;
  featureFlags?: unknown;
  feature_flags?: unknown;
  flags?: unknown;
  recentErrors?: unknown;
  recent_errors?: unknown;
  alerts?: unknown;
  metadata?: unknown;
  supportMetadata?: unknown;
  support_metadata?: unknown;
}

export interface ImpersonationResponseDto {
  accessToken?: unknown;
  access_token?: unknown;
  refreshToken?: unknown;
  refresh_token?: unknown;
  impersonationContext?: unknown;
  impersonation_context?: unknown;
  context?: unknown;
  user?: unknown;
}
