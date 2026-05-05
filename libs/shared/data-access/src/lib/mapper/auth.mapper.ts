import { User } from '@trackora/shared/domain';
import { LoginResponseDto } from '../dto/auth.dto';

export class AuthMapper {
  static mapUser(dto: LoginResponseDto['user']): User {
    return {
      id: dto.id,
      email: dto.email,
      name: dto.name,
      phone: dto.phone,
      roles: dto.roles,
      permissions: dto.permissions,
      avatarUrl: dto.avatarUrl,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }
}
