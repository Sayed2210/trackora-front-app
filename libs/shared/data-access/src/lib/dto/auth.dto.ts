import { Permission, UserRole } from '@trackora/shared/domain';

export interface LoginRequestDto {
  phone: string;
  password: string;
}

export interface RegisterRequestDto {
  phone: string;
  password: string;
  name: string;
  role: string;
}

export interface AuthUserDto {
  id: string;
  email?: string;
  name: string;
  phone?: string;
  /** Backend sends singular `role` (legacy) */
  role?: string;
  /** Preferred plural array */
  roles?: UserRole[];
  permissions?: Permission[];
  tenantId?: string;
  merchantId?: string;
  courierId?: string;
  avatarUrl?: string;
  isPlatformUser?: boolean;
  platformContext?: Record<string, unknown>;
  impersonationContext?: Record<string, unknown>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
}
