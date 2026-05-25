import { Permission, UserRole } from '../enums/user-role.enum';

export interface PlatformContext {
  [key: string]: unknown;
}

export interface ImpersonationContext {
  [key: string]: unknown;
}

export interface User {
  id: string;
  email?: string;
  name: string;
  phone?: string;
  roles: UserRole[];
  permissions: Permission[];
  role?: UserRole;
  tenantId?: string;
  merchantId?: string;
  courierId?: string;
  avatarUrl?: string;
  isPlatformUser?: boolean;
  platformContext?: PlatformContext;
  impersonationContext?: ImpersonationContext;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
