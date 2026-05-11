import { UserRole, Permission } from '@trackora/shared/domain';

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

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email?: string;
    name: string;
    phone: string;
    /** Backend sends singular `role` (legacy) */
    role?: string;
    /** Preferred plural array */
    roles?: UserRole[];
    permissions: Permission[];
    merchantId?: string;
    courierId?: string;
    avatarUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
