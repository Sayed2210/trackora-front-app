export interface PlatformPlanDto {
  id?: unknown;
  _id?: unknown;
  name?: unknown;
  code?: unknown;
  slug?: unknown;
  description?: unknown;
  price?: unknown;
  yearlyPrice?: unknown;
  amount?: unknown;
  currency?: unknown;
  billingCycle?: unknown;
  billing_cycle?: unknown;
  limits?: unknown;
  monthlyShipmentsLimit?: unknown;
  monthly_shipments_limit?: unknown;
  maxAdmins?: unknown;
  max_admins?: unknown;
  maxMerchants?: unknown;
  max_merchants?: unknown;
  maxCouriers?: unknown;
  max_couriers?: unknown;
  entitlements?: unknown;
  featureEntitlements?: unknown;
  feature_entitlements?: unknown;
  features?: unknown;
  active?: unknown;
  isActive?: unknown;
  is_active?: unknown;
  isPublic?: unknown;
  isPopular?: unknown;
  sortOrder?: unknown;
  archived?: unknown;
  isArchived?: unknown;
  is_archived?: unknown;
  subscriptionCount?: unknown;
  subscription_count?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
}

export interface PlatformPlansListDto {
  items?: unknown;
  data?: unknown;
  plans?: unknown;
  total?: unknown;
  count?: unknown;
  page?: unknown;
  pageSize?: unknown;
  page_size?: unknown;
  limit?: unknown;
}

export interface PlatformPlanPayloadDto {
  name: string;
  code?: string;
  description?: string;
  price: number;
  yearlyPrice?: number | null;
  currency: string;
  billingCycle?: string;
  monthlyShipmentsLimit: number | null;
  maxAdmins: number | null;
  maxMerchants: number | null;
  maxCouriers: number | null;
  featureEntitlements: string[];
  active?: boolean;
  isPublic?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
}
