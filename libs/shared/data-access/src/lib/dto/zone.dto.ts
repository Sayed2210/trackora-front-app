import { Zone, ZoneLevel } from '@trackora/shared/domain';

export interface ZoneResponseDto {
  id: string;
  parentId: string | null;
  level: ZoneLevel;
  nameAr: string;
  nameEn: string | null;
  code: string;
  polygon: Record<string, unknown> | null;
  centerLat: number | null;
  centerLng: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateZoneDto {
  parentId?: string;
  level: ZoneLevel;
  nameAr: string;
  nameEn?: string;
  code: string;
  polygon?: Record<string, unknown>;
  centerLat?: number;
  centerLng?: number;
  isActive?: boolean;
}

export interface UpdateZoneDto {
  parentId?: string;
  level?: ZoneLevel;
  nameAr?: string;
  nameEn?: string;
  code?: string;
  polygon?: Record<string, unknown>;
  centerLat?: number;
  centerLng?: number;
  isActive?: boolean;
}

export interface ZoneQueryDto {
  level?: ZoneLevel;
  parentId?: string;
  isActive?: boolean;
  search?: string;
}
