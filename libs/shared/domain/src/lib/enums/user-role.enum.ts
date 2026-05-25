/**
 * User role enum
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  MERCHANT = 'MERCHANT',
  COURIER = 'COURIER',
  PLATFORM_OWNER = 'PLATFORM_OWNER',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  PLATFORM_SUPPORT = 'PLATFORM_SUPPORT',
  PLATFORM_FINANCE = 'PLATFORM_FINANCE',
}

export const PLATFORM_ROLES = [
  UserRole.PLATFORM_OWNER,
  UserRole.PLATFORM_ADMIN,
  UserRole.PLATFORM_SUPPORT,
  UserRole.PLATFORM_FINANCE,
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

/**
 * Permission enum for fine-grained RBAC
 */
export enum Permission {
  SHIPMENTS_CREATE = 'shipments:create',
  SHIPMENTS_READ_ALL = 'shipments:read:all',
  SHIPMENTS_READ_OWN = 'shipments:read:own',
  SHIPMENTS_UPDATE_STATUS = 'shipments:update:status',
  SHIPMENTS_UPDATE_STATUS_OVERRIDE = 'shipments:update:status:override',
  COURIERS_READ = 'couriers:read',
  COURIERS_CREATE = 'couriers:create',
  MERCHANTS_READ = 'merchants:read',
  MERCHANTS_APPROVE = 'merchants:approve',
  WALLETS_READ_ALL = 'wallets:read:all',
  WALLETS_READ_OWN = 'wallets:read:own',
  PAYOUTS_REQUEST = 'payouts:request',
  PAYOUTS_APPROVE = 'payouts:approve',
  MANAGE_TENANTS = 'manage_tenants',
  MANAGE_PLANS = 'manage_plans',
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  VIEW_PLATFORM_ANALYTICS = 'view_platform_analytics',
  MANAGE_FEATURE_FLAGS = 'manage_feature_flags',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  IMPERSONATE_TENANT_ADMIN = 'impersonate_tenant_admin',
  VIEW_BILLING = 'view_billing',
  SUSPEND_TENANTS = 'suspend_tenants',
}

export const PLATFORM_PERMISSIONS = [
  Permission.MANAGE_TENANTS,
  Permission.MANAGE_PLANS,
  Permission.MANAGE_SUBSCRIPTIONS,
  Permission.VIEW_PLATFORM_ANALYTICS,
  Permission.MANAGE_FEATURE_FLAGS,
  Permission.VIEW_AUDIT_LOGS,
  Permission.IMPERSONATE_TENANT_ADMIN,
  Permission.VIEW_BILLING,
  Permission.SUSPEND_TENANTS,
] as const;

export type PlatformPermission = (typeof PLATFORM_PERMISSIONS)[number];
