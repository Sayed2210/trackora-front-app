export interface Zone {
  id: string;
  parentId?: string | null;
  level: ZoneLevel;
  nameAr: string;
  nameEn?: string | null;
  code: string;
  polygon?: Record<string, unknown> | null;
  centerLat?: number | null;
  centerLng?: number | null;
  isActive: boolean;
  createdAt: string;
}

export type ZoneLevel = 'COUNTRY' | 'GOVERNORATE' | 'CITY' | 'DISTRICT';

export const ZoneLevelLabels: Record<ZoneLevel, string> = {
  COUNTRY: 'Country',
  GOVERNORATE: 'Governorate',
  CITY: 'City',
  DISTRICT: 'District',
};
