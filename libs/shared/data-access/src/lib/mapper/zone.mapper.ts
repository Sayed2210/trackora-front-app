import { Zone } from '@trackora/shared/domain';
import { ZoneResponseDto } from '../dto/zone.dto';

export class ZoneMapper {
  static toDomain(dto: ZoneResponseDto): Zone {
    return {
      id: dto.id,
      parentId: dto.parentId,
      level: dto.level,
      nameAr: dto.nameAr,
      nameEn: dto.nameEn,
      code: dto.code,
      polygon: dto.polygon ?? undefined,
      centerLat: dto.centerLat ?? undefined,
      centerLng: dto.centerLng ?? undefined,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
    };
  }
}
