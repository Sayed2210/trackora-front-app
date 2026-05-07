import { UserRole, Permission } from '../enums/user-role.enum';

export interface User {
  id: string;
  email?: string;
  name: string;
  phone: string;
  roles: UserRole[];
  permissions: Permission[];
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
