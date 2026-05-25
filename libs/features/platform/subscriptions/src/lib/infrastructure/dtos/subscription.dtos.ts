export interface SubscriptionTenantDto {
  id?: unknown;
  _id?: unknown;
  name?: unknown;
  slug?: unknown;
}

export interface SubscriptionPlanDto {
  id?: unknown;
  _id?: unknown;
  name?: unknown;
  code?: unknown;
  slug?: unknown;
  billingCycle?: unknown;
  billing_cycle?: unknown;
  price?: unknown;
  amount?: unknown;
  currency?: unknown;
}

export interface PlatformSubscriptionDto {
  id?: unknown;
  _id?: unknown;
  tenant?: unknown;
  tenantId?: unknown;
  tenant_id?: unknown;
  tenantName?: unknown;
  tenant_name?: unknown;
  tenantSlug?: unknown;
  tenant_slug?: unknown;
  plan?: unknown;
  planId?: unknown;
  plan_id?: unknown;
  planName?: unknown;
  plan_name?: unknown;
  planCode?: unknown;
  plan_code?: unknown;
  status?: unknown;
  paymentStatus?: unknown;
  payment_status?: unknown;
  billingCycle?: unknown;
  billing_cycle?: unknown;
  trialStartedAt?: unknown;
  trial_started_at?: unknown;
  trialEndsAt?: unknown;
  trial_ends_at?: unknown;
  currentPeriodStart?: unknown;
  current_period_start?: unknown;
  currentPeriodEnd?: unknown;
  current_period_end?: unknown;
  renewalDate?: unknown;
  renewal_date?: unknown;
  usage?: unknown;
  limitsUsage?: unknown;
  limits_usage?: unknown;
  notes?: unknown;
  metadata?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
}

export interface PlatformSubscriptionsListDto {
  items?: unknown;
  data?: unknown;
  subscriptions?: unknown;
  total?: unknown;
  count?: unknown;
  page?: unknown;
  pageSize?: unknown;
  page_size?: unknown;
  limit?: unknown;
}

export interface SubscriptionUpdatePayloadDto {
  status?: string;
  paymentStatus?: string;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  renewalDate?: string | null;
  notes?: string;
  metadata?: Record<string, unknown>;
  reason?: string;
}

export interface ChangePlanPayloadDto {
  planId: string;
  reason: string;
}

export interface CancelSubscriptionPayloadDto {
  reason: string;
}

export interface RenewSubscriptionPayloadDto {
  reason: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  renewalDate?: string | null;
}
