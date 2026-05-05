import { ShipmentStatus, ShipmentType, ReturnReason } from '@trackora/shared/domain';

export interface ShipmentResponseDto {
  id: string;
  trackingNumber: string;
  merchantId: string;
  merchantName?: string;
  customerName: string;
  customerPhone: string;
  address: {
    id: string;
    street: string;
    building: string;
    floor?: string;
    apartment?: string;
    landmark?: string;
    governorate: string;
    city: string;
    zone?: string;
    lat?: number;
    lng?: number;
    geocodingConfidence?: number;
  };
  status: ShipmentStatus;
  type: ShipmentType;
  codAmount?: number;
  deliveryFee: number;
  weight?: number;
  notes?: string;
  returnReason?: ReturnReason;
  assignedCourierId?: string;
  assignedCourierName?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

export interface CreateShipmentDto {
  customerName: string;
  customerPhone: string;
  address: {
    street: string;
    building: string;
    floor?: string;
    apartment?: string;
    landmark?: string;
    governorate: string;
    city: string;
    zone?: string;
  };
  type: ShipmentType;
  codAmount?: number;
  deliveryFee: number;
  weight?: number;
  notes?: string;
}

export interface UpdateShipmentStatusDto {
  status: ShipmentStatus;
  notes?: string;
}

export interface ShipmentQueryDto {
  page?: number;
  limit?: number;
  status?: ShipmentStatus;
  type?: ShipmentType;
  search?: string;
  fromDate?: string;
  toDate?: string;
}
