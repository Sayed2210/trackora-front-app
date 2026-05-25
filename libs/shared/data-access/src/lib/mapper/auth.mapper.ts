import { User } from '@trackora/shared/domain';
import { AuthUserDto } from '../dto/auth.dto';

export class AuthMapper {
  static mapUser(dto: AuthUserDto): User {
    // Normalize backend's singular `role` into plural `roles` array
    const rawRoles =
      dto.roles ?? (dto.role ? [dto.role] : []);

    return {
      id: dto.id,
      email: dto.email,
      name: dto.name,
      phone: dto.phone,
      role: dto.role as User['role'],
      roles: rawRoles as User['roles'],
      permissions: dto.permissions ?? [],
      tenantId: dto.tenantId,
      merchantId: dto.merchantId,
      courierId: dto.courierId,
      avatarUrl: dto.avatarUrl,
      isPlatformUser: dto.isPlatformUser,
      platformContext: dto.platformContext,
      impersonationContext: dto.impersonationContext,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }
}
