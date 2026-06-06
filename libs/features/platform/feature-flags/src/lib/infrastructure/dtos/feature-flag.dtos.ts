export interface GlobalFeatureFlagDto {
  key?: string;
  name?: string;
  label?: string;
  description?: string;
  enabled?: boolean;
  value?: boolean;
  isEnabled?: boolean;
}

export interface TenantFeatureFlagDto extends GlobalFeatureFlagDto {
  globalValue?: boolean;
  global_value?: boolean;
  globalEnabled?: boolean;
  planValue?: boolean | null;
  plan_value?: boolean | null;
  planEnabled?: boolean | null;
  overrideValue?: boolean | null;
  override_value?: boolean | null;
  tenantOverride?: boolean | null;
  effectiveValue?: boolean;
  effective_value?: boolean;
  effectiveEnabled?: boolean;
}

export interface FeatureFlagsResponseDto<T> {
  items?: T[];
  data?: T[];
  flags?: T[];
}

export interface GlobalFeatureFlagPatchDto {
  enabled: boolean;
  reason: string;
}

export interface TenantFeatureFlagPatchDto {
  override: boolean | null;
  reason: string;
}
