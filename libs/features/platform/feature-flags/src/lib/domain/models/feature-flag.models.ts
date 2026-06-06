export const FEATURE_FLAG_KEYS = [
  'smart_dispatch',
  'fraud_detection',
  'cod_wallet',
  'bulk_upload',
  'whatsapp_notifications',
  'api_access',
  'public_tracking',
  'advanced_reports',
] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number] | string;
export type TenantFeatureFlagOverride = boolean | null;

export interface GlobalFeatureFlag {
  key: FeatureFlagKey;
  name: string;
  description: string;
  enabled: boolean;
}

export interface TenantFeatureFlag {
  key: FeatureFlagKey;
  name: string;
  description: string;
  globalValue: boolean;
  planValue: boolean | null;
  overrideValue: TenantFeatureFlagOverride;
  effectiveValue: boolean;
}

export interface FeatureFlagsState<T> {
  data: T | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
}
