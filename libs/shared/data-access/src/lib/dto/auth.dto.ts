import { UserRole, Permission } from '@trackora/shared/domain';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    roles: UserRole[];
    permissions: Permission[];
    avatarUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
