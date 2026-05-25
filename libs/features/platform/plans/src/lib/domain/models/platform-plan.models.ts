export const PLAN_FEATURE_ENTITLEMENTS = [
  'smart_dispatch',
  'fraud_detection',
  'cod_wallet',
  'bulk_upload',
  'whatsapp_notifications',
  'api_access',
  'public_tracking',
  'advanced_reports',
] as const;

export type PlanFeatureEntitlement = (typeof PLAN_FEATURE_ENTITLEMENTS)[number];

export type PlanBillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'custom';

export interface PlanLimits {
  monthlyShipments: number | null;
  maxAdmins: number | null;
  maxMerchants: number | null;
  maxCouriers: number | null;
}

export interface PlatformPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: PlanBillingCycle | string;
  limits: PlanLimits;
  entitlements: PlanFeatureEntitlement[];
  active: boolean;
  archived: boolean;
  subscriptionCount: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PlansQuery {
  search?: string;
  status?: 'all' | 'active' | 'archived';
  billingCycle?: 'all' | PlanBillingCycle | string;
  sort?: 'name' | 'code' | 'price' | 'billingCycle' | 'createdAt';
  page?: number;
  pageSize?: number;
}

export interface PlansPage {
  items: PlatformPlan[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PlanPayload {
  name: string;
  code?: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle?: PlanBillingCycle | string;
  limits: PlanLimits;
  entitlements: PlanFeatureEntitlement[];
  active?: boolean;
}

export interface PlansState<T> {
  data: T | null;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  success: string | null;
}
