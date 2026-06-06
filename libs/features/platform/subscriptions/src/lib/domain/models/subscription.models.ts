export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED' | 'PAUSED' | 'EXPIRED' | string;
export type SubscriptionPaymentStatus = 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'FAILED' | 'PAST_DUE' | string;

export interface SubscriptionTenantSummary {
  id: string;
  name: string;
  slug: string;
}

export interface SubscriptionPlanSummary {
  id: string;
  name: string;
  code: string;
  billingCycle: string;
  price: number | null;
  currency: string;
}

export interface SubscriptionUsageLimit {
  key: string;
  label: string;
  used: number | null;
  limit: number | null;
}

export interface PlatformSubscription {
  id: string;
  tenant: SubscriptionTenantSummary;
  plan: SubscriptionPlanSummary;
  status: SubscriptionStatus;
  paymentStatus: SubscriptionPaymentStatus;
  billingCycle: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  renewalDate: string | null;
  usage: SubscriptionUsageLimit[];
  notes: string;
  metadata: Record<string, unknown>;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SubscriptionsQuery {
  search?: string;
  status?: string;
  paymentStatus?: string;
  tenantId?: string;
  planId?: string;
  periodFrom?: string;
  periodTo?: string;
  sort?: 'createdAt' | 'updatedAt' | 'tenantName' | 'status' | 'paymentStatus' | 'renewalDate';
  page?: number;
  pageSize?: number;
}

export interface SubscriptionsPage {
  items: PlatformSubscription[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SubscriptionUpdatePayload {
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

export interface ChangePlanPayload {
  planId: string;
  reason: string;
}

export interface CancelSubscriptionPayload {
  reason: string;
}

export interface RenewSubscriptionPayload {
  reason: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  renewalDate?: string | null;
}

export interface SubscriptionsState<T> {
  data: T | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
}
