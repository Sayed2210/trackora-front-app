import { User } from '@trackora/shared/domain';
import { LoginResponseDto } from '../dto/auth.dto';

export class AuthMapper {
  static mapUser(dto: LoginResponseDto['user']): User {
    // Normalize backend's singular `role` into plural `roles` array
    const rawRoles =
      dto.roles ?? (dto.role ? [dto.role] : []);

    return {
      id: dto.id,
      email: dto.email,
      name: dto.name,
      phone: dto.phone,
      roles: rawRoles as User['roles'],
      permissions: dto.permissions,
      merchantId: dto.merchantId,
      courierId: dto.courierId,
      avatarUrl: dto.avatarUrl,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }
}
