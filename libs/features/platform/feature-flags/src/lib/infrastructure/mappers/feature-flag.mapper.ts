import { GlobalFeatureFlag, TenantFeatureFlag } from '../../domain/models/feature-flag.models';
import { FeatureFlagsResponseDto, GlobalFeatureFlagDto, TenantFeatureFlagDto } from '../dtos/feature-flag.dtos';

export const mapGlobalFeatureFlags = (
  dto: FeatureFlagsResponseDto<GlobalFeatureFlagDto> | GlobalFeatureFlagDto[],
): GlobalFeatureFlag[] => extractItems(dto).map(mapGlobalFeatureFlag);

export const mapTenantFeatureFlags = (
  dto: FeatureFlagsResponseDto<TenantFeatureFlagDto> | TenantFeatureFlagDto[],
): TenantFeatureFlag[] => extractItems(dto).map(mapTenantFeatureFlag);

export const mapGlobalFeatureFlag = (dto: GlobalFeatureFlagDto): GlobalFeatureFlag => {
  const key = dto.key ?? dto.name ?? '';
  return {
    key,
    name: dto.label ?? humanizeFlag(key),
    description: dto.description ?? '',
    enabled: bool(dto.enabled ?? dto.value ?? dto.isEnabled),
  };
};

export const mapTenantFeatureFlag = (dto: TenantFeatureFlagDto): TenantFeatureFlag => {
  const key = dto.key ?? dto.name ?? '';
  const globalValue = bool(dto.globalValue ?? dto.global_value ?? dto.globalEnabled ?? dto.enabled ?? dto.value);
  const planValue = nullableBool(dto.planValue ?? dto.plan_value ?? dto.planEnabled);
  const overrideValue = nullableBool(dto.overrideValue ?? dto.override_value ?? dto.tenantOverride);
  const effectiveValue = bool(
    dto.effectiveValue ?? dto.effective_value ?? dto.effectiveEnabled ?? overrideValue ?? planValue ?? globalValue,
  );

  return {
    key,
    name: dto.label ?? humanizeFlag(key),
    description: dto.description ?? '',
    globalValue,
    planValue,
    overrideValue,
    effectiveValue,
  };
};

const extractItems = <T>(dto: FeatureFlagsResponseDto<T> | T[]): T[] =>
  Array.isArray(dto) ? dto : dto.items ?? dto.data ?? dto.flags ?? [];

const bool = (value: unknown): boolean => value === true;

const nullableBool = (value: unknown): boolean | null =>
  value === true ? true : value === false ? false : null;

const humanizeFlag = (key: string): string =>
  key
    .replace(/_/g, ' ')
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
