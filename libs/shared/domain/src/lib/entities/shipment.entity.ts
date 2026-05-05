import { ShipmentStatus, ShipmentType, ReturnReason } from '../enums/shipment-status.enum';

export interface Address {
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
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  merchantId: string;
  merchantName?: string;
  customerName: string;
  customerPhone: string;
  customerPhoneMasked?: string;
  address: Address;
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

export interface TimelineEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  timestamp: string;
  actorId: string;
  actorName?: string;
  actorRole?: string;
  notes?: string;
  location?: { lat: number; lng: number };
}
