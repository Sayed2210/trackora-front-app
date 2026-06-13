export interface PlatformPlanDto {
  id?: unknown;
  _id?: unknown;
  name?: unknown;
  code?: unknown;
  slug?: unknown;
  description?: unknown;
  price?: unknown;
  monthlyPrice?: unknown;
  amount?: unknown;
  yearlyPrice?: unknown;
  currency?: unknown;
  billingCycle?: unknown;
  billing_cycle?: unknown;
  limits?: unknown;
  monthlyShipments?: unknown;
  monthly_shipments?: unknown;
  monthlyShipmentLimit?: unknown;
  monthly_shipment_limit?: unknown;
  monthlyShipmentsLimit?: unknown;
  monthly_shipments_limit?: unknown;
  adminUserLimit?: unknown;
  admin_user_limit?: unknown;
  maxAdmins?: unknown;
  max_admins?: unknown;
  merchantLimit?: unknown;
  merchant_limit?: unknown;
  maxMerchants?: unknown;
  max_merchants?: unknown;
  courierLimit?: unknown;
  courier_limit?: unknown;
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

export interface PlatformPlansMetaDto {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
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
  meta?: PlatformPlansMetaDto;
}

export interface PlanFeatureFlagDto {
  key: string;
  enabled: boolean;
}

export interface CreatePlanPayloadDto {
  name: string;
  slug: string;
  description?: string;
  monthlyPrice: string;
  currency?: string;
  yearlyPrice?: string | null;
  monthlyShipmentLimit?: number | null;
  adminUserLimit?: number | null;
  merchantLimit?: number | null;
  courierLimit?: number | null;
  isPublic?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  featureEntitlements?: PlanFeatureFlagDto[];
}

export interface UpdatePlanPayloadDto {
  name?: string;
  slug?: string;
  description?: string;
  monthlyPrice?: string;
  currency?: string;
  yearlyPrice?: string | null;
  monthlyShipmentLimit?: number | null;
  adminUserLimit?: number | null;
  merchantLimit?: number | null;
  courierLimit?: number | null;
  isPublic?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  featureEntitlements?: PlanFeatureFlagDto[];
}
