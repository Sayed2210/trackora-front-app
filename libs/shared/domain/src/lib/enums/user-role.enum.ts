/**
 * User role enum
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MERCHANT = 'MERCHANT',
  COURIER = 'COURIER',
  FINANCE = 'FINANCE',
}

/**
 * Permission enum for fine-grained RBAC
 */
export enum Permission {
  SHIPMENTS_CREATE = 'shipments:create',
  SHIPMENTS_READ = 'shipments:read',
  SHIPMENTS_UPDATE = 'shipments:update',
  SHIPMENTS_DELETE = 'shipments:delete',
  SHIPMENTS_BULK_UPLOAD = 'shipments:bulk_upload',
  ASSIGNMENTS_CREATE = 'assignments:create',
  ASSIGNMENTS_READ = 'assignments:read',
  ASSIGNMENTS_UPDATE = 'assignments:update',
  COURIER_TASKS_READ = 'courier_tasks:read',
  COURIER_TASKS_UPDATE = 'courier_tasks:update',
  WALLET_READ = 'wallet:read',
  PAYOUTS_CREATE = 'payouts:create',
  PAYOUTS_READ = 'payouts:read',
  PAYOUTS_APPROVE = 'payouts:approve',
  ANALYTICS_READ = 'analytics:read',
  USERS_MANAGE = 'users:manage',
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
}
